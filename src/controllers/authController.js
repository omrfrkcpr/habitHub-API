"use strict";

const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/userModel");
const Token = require("../models/tokenModel");
const passwordEncryption = require("../helpers/passwordEncryption");
const { CustomError } = require("../errors/customError");

module.exports = {
  register: async (req, res) => {
    /*
      - Retrieves firstName, lastName, email, and password from the incoming request.body.
      - Checks if the user with the given email already exists in the database.
      - If the user exists, returns a 400 error with a message indicating that the email already exists.
      - If the user does not exist, creates a new user with the provided details.
        - Password is hashed using bcrypt before saving.
      - Saves the new user to the database.
      - Returns a success message with the newly created user data.
      - In case of an error, returns a 500 error with the error message.
    */

    const { firstName, lastName, email, password } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      throw new CustomError("Email already exists!", 400);
    }

    // Create new user
    user = new User({
      firstName,
      lastName,
      email,
      password: bcrypt.hashSync(password, 10),
    });

    // Save new user to the database
    const newUser = await user.save();

    // Create new token for new user
    //^ Simple Token
    const tokenData = await Token.create({
      userId: newUser._id || newUser.id,
      token: passwordEncryption((newUser._id || newUser.id) + Date.now()),
    });

    //^ JWT
    // accessToken
    const accessInfo = {
      key: process.env.ACCESS_KEY,
      time: process.env.ACCESS_EXP || "30m",
      data: {
        id: newUser._id || newUser.id,
        email: newUser.email,
        password: newUser.password,
        isActive: newUser.isActive,
        isAdmin: newUser.isAdmin,
      },
    };

    //refreshToken
    const refreshInfo = {
      key: process.env.REFRESH_KEY,
      time: process.env.REFRESH_EXP || "3d",
      data: {
        id: newUser._id || newUser.id,
        password: newUser.password,
      },
    };

    // jwt.sign(data, secret_key, options)
    const accessToken = jwt.sign(accessInfo.data, accessInfo.key, {
      expiresIn: accessInfo.time,
    });
    const refreshToken = jwt.sign(refreshInfo.data, refreshInfo.key, {
      expiresIn: refreshInfo.time,
    });

    // Return success message with new user data
    res.status(201).send({
      error: false,
      message: "New Account successfully created",
      bearer: {
        access: accessToken,
        refresh: refreshToken,
      },
      token: tokenData.token,
      user: newUser,
    });
  },
  //! POST
  login: async (req, res) => {
    /*
      - Retrieves the email and password from the incoming request.body.
      - Finds the user by email in the database.
      - If the user is not found, a 401 error is returned.
      - If the user is found, the password is validated.
      - If the password is valid and the user is active, it generates tokens:
          - Checks if a token exists for the user in the Token collection.
          - If a token does not exist, it creates a new token.
          - Generates a JWT access token and a refresh token.
      - Returns the tokens and user information in the response.
      - If the user is inactive or the password is invalid, a 401 error is returned.
      - If any error occurs, a 401 error is returned.
    */

    const { email, password } = req.body;
    // console.log("Login attempt:", email, password);

    if (email && password) {
      const user = await User.findOne({ email });
      // console.log("User found:", user);

      const isPasswordValid = bcrypt.compareSync(password, user.password);
      // console.log("Password validation result:", isPasswordValid);
      if (user && isPasswordValid) {
        if (user.isActive) {
          //^ SIMPLE TOKEN
          let tokenData = await Token.findOne({
            userId: user.id || user._id,
          });
          // console.log("Token data found:", tokenData);

          if (!tokenData) {
            const tokenKey = passwordEncryption(
              (user.id || user._id) + Date.now()
            );
            // console.log("Generated token key:", tokenKey);

            tokenData = await Token.create({
              userId: user.id || user._id,
              token: tokenKey,
            });
          }
          //^ JWT
          // accessToken
          const accessInfo = {
            key: process.env.ACCESS_KEY,
            time: process.env.ACCESS_EXP || "30m",
            data: {
              id: user.id || user._id,
              email: user.email,
              password: user.password,
              isActive: user.isActive,
              isAdmin: user.isAdmin,
            },
          };
          //refreshToken
          const refreshInfo = {
            key: process.env.REFRESH_KEY,
            time: process.env.REFRESH_EXP || "3d",
            data: {
              id: user.id || user._id,
              password: user.password,
            },
          };

          // jwt.sign(data, secret_key, options)
          const accessToken = jwt.sign(accessInfo.data, accessInfo.key, {
            expiresIn: accessInfo.time,
          });
          const refreshToken = jwt.sign(refreshInfo.data, refreshInfo.key, {
            expiresIn: refreshInfo.time,
          });

          //! Response for TOKEN and JWT
          res.status(200).send({
            error: false,
            message: "You are successfully logged in!",
            bearer: {
              access: accessToken,
              refresh: refreshToken,
            },
            token: tokenData.token,
            user,
          });
        } else {
          throw new CustomError("This Account is inactive!", 401);
        }
      } else {
        throw new CustomError(
          "Wrong email or password. Please try again!",
          401
        );
      }
    } else {
      throw new CustomError("Please provide a valid email and password", 401);
    }
  },
  reset: async (req, res) => {
    /*
      - Retrieves the e-mail and password in the incoming request.body.
      - Finds the user by email in the database.
      - If the user is not found, a 401 error is returned.
      - If the user is found, it creates tokens.
      - Validates the token and retrieves the user's identity.
      - It updates the password according to the user's identity and returns a successful message.
      - In case of error, a 500 error and an error message is returned.
    */

    try {
      const { email, password } = req.body;
      // console.log(email, password, "resetPassword");

      // Email ile kullanıcıyı bul
      const user = await User.findOne({ email });
      // console.log(user, "userFound");

      if (!user) {
        return res.status(401).send({
          message: "No such user found, please try again",
        });
      }

      // Create Token
      const token = await jwt.sign(
        { id: user?._id || user?.id },
        process.env.REFRESH_KEY,
        {
          expiresIn: "1h",
        }
      );
      // console.log(token, "tokenGenerated");

      // Verify token
      const decoded = await jwt.verify(token, process.env.REFRESH_KEY);
      // console.log(decoded, "tokenVerified");

      const userId = decoded.id;
      const userToUpdate = await User.findById(userId);

      if (userToUpdate) {
        // Verify user and reset pass
        userToUpdate.password = password;
        await userToUpdate.save();
        // console.log(userToUpdate, "passwordUpdated");

        res
          .status(200)
          .json({ message: "Password has been successfully reset!" });
      } else {
        res.status(404).send({
          message: "User not found!",
        });
      }
    } catch (error) {
      console.error(error);
      res.status(500).send({
        message: "Something went wrong. Please try again!",
      });
    }
  },
  //! POST
  refresh: async (req, res) => {
    /*
      - Retrieves the refresh token from the incoming request.body.
      - Verifies the refresh token using the JWT verification method.
      - If the refresh token is valid, retrieves the user id and password from the token data.
      - Checks if the user id and password exist in the token data.
      - Finds the user by id in the database.
      - If the user is found and the password matches, checks if the user is active.
      - If the user is active, generates a new JWT access token with a 9-minute expiration.
      - Returns the new access token in the response.
      - If the user is not active, returns a 401 error indicating the user is inactive.
      - If the user is not found or the password does not match, returns a 401 error.
      - If there is no id or password in the refresh token, returns a 401 error.
      - If the refresh token is expired or invalid, returns a 401 error.
      - If no refresh token is provided, returns a 401 error.
    */

    const refreshToken = req.body?.bearer?.refresh;

    if (refreshToken) {
      // Verify the refresh token
      const refreshData = await jwt.verify(
        refreshToken,
        process.env.REFRESH_KEY
      );

      if (refreshData) {
        const { id, password } = refreshData;

        // Check if id and password exist in token data
        if (id && password) {
          // Find the user by id in the database
          const user = await User.findOne({ _id: id });

          if (user && user.password === password) {
            // Check if the user is active
            if (user.isActive) {
              // Generate a new JWT access token
              const accessToken = jwt.sign(
                user.toJSON(),
                process.env.ACCESS_KEY,
                {
                  expiresIn: process.env.ACCESS_EXP || "30m",
                }
              );

              // Return the new access token
              res.status(200).send({
                error: false,
                bearer: {
                  access: accessToken,
                },
              });
            } else {
              throw new CustomError("This account is inactive!", 401);
            }
          } else {
            throw new CustomError("Wrong user data!", 401);
          }
        } else {
          throw new CustomError("No data found in refresh token!", 401);
        }
      } else {
        throw new CustomError(
          "JWT refresh token has expired or is invalid!",
          401
        );
      }
    } else {
      throw new CustomError("No refresh token provided!", 401);
    }
  },
  //! GET
  logout: async (req, res) => {
    /*
      - Retrieves the authorization header from the incoming request.headers.
      - Splits the authorization header to extract the token.
      - Deletes the token from the Token collection in the database.
      - Returns a success message with the result of the token deletion.
    */

    const auth = req.headers?.authorization;
    const tokenKey = auth ? auth.split(" ") : null;
    let deleted = null;

    if (tokenKey && tokenKey[0] == "Token") {
      // Simple Token Logout
      deleted = await Token.deleteOne({ token: tokenKey[1] });
    } else if (tokenKey && tokenKey[0] == "Bearer") {
      // JWT Token Logout
      const token = tokenKey[1];
      const decoded = jwt.verify(token, process.env.ACCESS_KEY);
      if (decoded) {
        // Add jwt token to the blacklist
        const blacklisted = new TokenBlacklist({ token: token });
        await blacklisted.save();
        deleted = true; // Assuming this is successful due to Blacklisting
      }
    }

    res.status(deleted !== null ? 200 : 400).send({
      error: !deleted !== null,
      message:
        deleted !== null
          ? "You are successfully logged out!"
          : "Logout failed. Please try again!",
    });
  },
};
