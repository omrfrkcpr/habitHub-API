"use strict";

const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/userModel");
const Token = require("../models/tokenModel");
const passwordEncryption = require("../helpers/passwordEncryption");

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
      return res
        .status(400)
        .send({ error: true, message: "Email already exists" });
    }

    // Create new user
    user = new User({
      firstName,
      lastName,
      email,
      isActive: true,
      isAdmin: false,
      password: bcrypt.hashSync(password, 10),
    });

    // Save new user to the database
    const newUser = await user.save();

    // Create new token for new user
    const tokenData = await Token.create({
      userId: newUser._id || newUser.id,
      token: passwordEncryption((newUser._id || newUser.id) + Date.now()),
    });

    // Return success message with new user data
    res.status(201).send({
      error: false,
      message: "New Account successfully created",
      token: tokenData.token,
      data: newUser,
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
      try {
        const user = await User.findOne({ email });
        // console.log("User found:", user);

        if (user) {
          const isPasswordValid = bcrypt.compareSync(password, user.password);
          // console.log("Password validation result:", isPasswordValid);

          if (isPasswordValid && user.isActive) {
            //* TOKEN */
            let tokenData = await Token.findOne({ userId: user._id });
            // console.log("Token data found:", tokenData);

            if (!tokenData) {
              const tokenKey = passwordEncryption(user._id + Date.now());
              // console.log("Generated token key:", tokenKey);

              tokenData = await Token.create({
                userId: user._id,
                token: tokenKey,
              });
            }
            //* JWT */
            const accessData = user.toJSON();
            const accessTime = "10m";
            const accessToken = jwt.sign(accessData, process.env.ACCESS_KEY, {
              expiresIn: accessTime,
            });

            const refreshData = {
              id: user._id,
              password: user.password,
            };
            const refreshTime = "3d";
            const refreshToken = jwt.sign(
              refreshData,
              process.env.REFRESH_KEY,
              {
                expiresIn: refreshTime,
              }
            );

            //! Response for TOKEN and JWT
            res.status(200).send({
              error: false,
              token: tokenData.token,
              bearer: {
                access: accessToken,
                refresh: refreshToken,
              },
              user,
            });
          } else {
            res.status(401).send({
              error: true,
              message:
                "This account is no longer active or password is invalid.",
            });
          }
        } else {
          res.status(401).send({
            error: true,
            message:
              "There is no account with this email address. Please register!",
          });
        }
      } catch (error) {
        console.error("Error during login process:", error);
        res.status(500).send({
          error: true,
          message: "An error occurred during login. Please try again.",
        });
      }
    } else {
      res.status(401).send({
        error: true,
        message: "Please enter your email and password to log in!",
      });
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
      try {
        // Verify the refresh token
        const jwtData = await jwt.verify(refreshToken, process.env.REFRESH_KEY);

        if (jwtData) {
          const { id, password } = jwtData;

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
                  { expiresIn: "9m" } // 9 minutes
                );

                // Return the new access token
                res.status(200).send({
                  error: false,
                  bearer: {
                    access: accessToken,
                  },
                });
              } else {
                res.status(401).send({
                  error: true,
                  message: "This account is no longer active!",
                });
              }
            } else {
              res.status(401).send({
                error: true,
                message: "Wrong id or password.",
              });
            }
          } else {
            res.status(401).send({
              error: true,
              message: "There is no id and password in the refresh token.",
            });
          }
        } else {
          res.status(401).send({
            error: true,
            message: "JWT refresh token has expired or is invalid.",
          });
        }
      } catch (error) {
        res.status(401).send({
          error: true,
          message: "JWT refresh token has expired or is invalid.",
        });
      }
    } else {
      res.status(401).send({
        error: true,
        message: "Please provide a refresh token.",
      });
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

    const auth = req.headers?.authorization || null;
    const tokenKey = auth ? auth.split(" ") : null;

    if (tokenKey && tokenKey[1]) {
      try {
        const tokenData = await Token.deleteOne({ token: tokenKey[1] });

        res.send({
          error: false,
          message: "You are successfully logged out!",
          data: tokenData,
        });
      } catch (error) {
        res.status(500).send({
          error: true,
          message: "Logout failed. Please try again.",
        });
      }
    } else {
      res.status(400).send({
        error: true,
        message: "No authorization token provided.",
      });
    }
  },
};
