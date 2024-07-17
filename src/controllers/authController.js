"use strict";

const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/userModel");
const Token = require("../models/tokenModel");
const TokenVerification = require("../models/tokenVerificationModel");
const TokenBlacklist = require("../models/tokenBlacklistModel");
const passwordEncryption = require("../helpers/passwordEncryption");
const { CustomError } = require("../errors/customError");
const { sendEmail } = require("../configs/email/emailService");
const {
  getWelcomeEmailHtml,
} = require("../configs/email/welcome/welcomeEmail");
const {
  getForgotPasswordEmailHtml,
} = require("../configs/email/forgot/forgotPassword");
const {
  getResetPasswordEmailHtml,
} = require("../configs/email/reset/resetPassword");
const validator = require("validator");
const {
  generateAccessToken,
  generateRefreshToken,
  generateAllTokens,
} = require("../helpers/tokenGenerator");

module.exports = {
  register: async (req, res) => {
    /*
        #swagger.tags = ["Authentication"]
        #swagger.summary = "Register"
        #swagger.description = 'Register with valid firstName, lastName, email and password'
        // _swagger.deprecated = true
        // _swagger.ignore = true
        #swagger.parameters["body"] = {
            in: "body",
            required: true,
             schema: {
              "firstName": "test",
              "lastName": "test",
              "email": "testUser@gmail.com",
              "password": "Test@1234",
             }
      }
    */
    /*
      - Retrieves firstName, lastName, email, and password from the incoming request.body.
      - Checks if the user with the given email already exists in the database.
      - If the user exists, returns a 400 error with a message indicating that the email already exists.
      - If the user does not exist, creates a new user with the provided details.
        - Password is hashed using bcrypt before saving.
      - Saves the new user to the database.
      - Generates a verification token and saves it to TokenVerificationModel.
      - Sends a welcome email to the user.
      - Returns a success message with the newly created user data.
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
      isActive: false, // user will active his account via verification email
      isAdmin: false,
    });

    // Save new user to the database
    const newUser = await user.save();

    // Get tokens for new user
    const { tokenData, accessToken, refreshToken } = await generateAllTokens(
      newUser
    );

    // Create new Token in TokenVerificationModel
    const verificationTokenData = await TokenVerification.create({
      userId: newUser._id || newUser.id,
      token: passwordEncryption((newUser._id || newUser.id) + Date.now()),
    });

    // Send email to user
    const emailSubject = "Welcome to HabitHub!";
    const emailHtml = getWelcomeEmailHtml(
      firstName,
      verificationTokenData.token
    );

    await sendEmail(email, emailSubject, emailHtml);

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
  socialLogin: async (req, res) => {
    // console.log(
    //   JSON.parse(Object.values(req?.sessionStore?.sessions)[0])?.passport?.user
    // );
    const sessionData = JSON.parse(Object.values(req.sessionStore.sessions)[0])
      .passport.user;

    const { accessToken, user, tokenData, refreshToken } = sessionData;

    console.log(accessToken);
    console.log(user);

    if (accessToken && user && refreshToken && tokenData) {
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
      throw new CustomError("Authentication failed!", 401);
    }
  },
  // GET
  verifyEmail: async (req, res) => {
    /*
      #swagger.tags = ['Authentication']
      #swagger.summary = 'Verification'
      #swagger.description = 'Verify user email with a verification token'
      #swagger.parameters['token'] = {
        in: 'path',
        description: 'Verification token received via email',
        required: true,
        type: 'string'
      }
  */
    /*
      - Retrieves the token from url.
      - Checks if a token exists in TokenVerificationModel.
      - Finds the user associated with the token in UserModel.
      - Activates the user's account by setting isActive to true.
      - Deletes the verification token from TokenVerificationModel.
      - Redirects the user to the contract page upon successful verification.
     */

    const token = req.params.token;

    try {
      // Check existance of provided token in tokenVerifications collection
      const tokenData = await TokenVerification.findOne({ token });

      if (!tokenData) {
        throw new CustomError(
          "Verification failed. Please try to login or register again!",
          400
        );
      }

      // Find user
      const user = await User.findById(tokenData.userId);

      if (!user) {
        throw new CustomError("Account not found. Please try again!", 404);
      }

      // Activate user status
      user.isActive = true;
      await user.save();

      // Delete VerficiationToken
      await Token.findByIdAndDelete(tokenData._id || tokenData.id);

      // Success response
      res
        .status(200)
        .send({ error: false, message: "Account successfully verified!" });
    } catch (error) {
      console.error(error);
      res.status(500).send("Server error");
    }
  },
  // POST
  login: async (req, res) => {
    /*
      #swagger.tags = ["Authentication"]
      #swagger.summary = "Login"
      #swagger.description = 'Login with email and password for get simpleToken and JWT'
      _swagger.deprecated = true
      _swagger.ignore = true
      #swagger.parameters["body"] = {
          in: "body",
          required: true,
          schema: {
              "email": "testUser@gmail.com",
              "password": "Test@1234",
          }
      }
    */
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
    */

    const { email, password } = req.body;
    // console.log("Login attempt:", email, password);

    if (email && password) {
      const user = await User.findOne({ email });
      // console.log("User found:", user);

      if (!user) {
        throw new CustomError(
          "Wrong email or password. Please try to register or login again!",
          401
        );
      }

      const isPasswordValid = bcrypt.compareSync(password, user.password);
      // console.log("Password validation result:", isPasswordValid);
      if (isPasswordValid) {
        if (user.isActive) {
          //^ SIMPLE TOKEN
          let tokenData = await Token.findOne({
            userId: user.id || user._id,
          });
          // console.log("Token data found:", tokenData);

          let accessToken = "";
          let refreshToken = "";

          if (!tokenData) {
            const tokens = generateAllTokens(user);
            accessToken = tokens.accessToken;
            refreshToken = tokens.refreshToken;
            tokenData = tokens.tokenData;
          } else {
            accessToken = generateAccessToken(user);
            refreshToken = generateRefreshToken(user);
          }

          console.log("Login response data:", {
            accessToken,
            refreshToken,
            tokenData,
          }); // Debugging

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
          throw new CustomError(
            "Unverified Account. Please verify your email address!",
            401
          );
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
  // POST
  forgot: async (req, res) => {
    /*
      #swagger.tags = ['Authentication']
      #swagger.summary = 'Forgot'
      #swagger.description = 'Request a url with email to reset password'
      #swagger.parameters['body'] = {
          in: 'body',
          required: true,
          schema: {
              "email":"testUser@gmail.com"
          }
      }
    */
    /*
      - Retrieves email from the incoming request.body.
      - Finds the user by email in UserModel.
      - Generates a password reset token using JWT and sends it to the user's email.
      - Returns a success message upon sending the reset email.
      - In case of an error (no account with provided email), returns a 401 error with an appropriate message.
    */

    const { email } = req.body;
    const user = await User.findOne({ email });
    //console.log(user, "forgot");
    if (!user) {
      throw new CustomError("Wrong email address!", 401);
    }

    const forgotToken = await jwt.sign(
      { id: user?._id || user?.id },
      process.env.REFRESH_KEY,
      {
        expiresIn: "1d",
      }
    );
    // console.log(token, "tokenGenerated");

    if (forgotToken) {
      // Send forgot request email to user
      const forgotEmailSubject = "Password Reset Request!";
      const forgotEmailHtml = getForgotPasswordEmailHtml(
        user.firstName,
        forgotToken
      );

      await sendEmail(email, forgotEmailSubject, forgotEmailHtml);

      res.status(200).send({
        error: false,
        message:
          "Password reset link has been sent to your e-mail. Please check your mailbox.",
      });
    }
  },
  // POST
  reset: async (req, res) => {
    /*
      #swagger.tags = ['Authentication']
      #swagger.summary = 'JWT: Reset'
      #swagger.description = 'Reset password with email, new password, and refresh token.'
      #swagger.parameters['body'] = {
          in: 'body',
          required: true,
          schema: {
            email: 'testUser@gmail.com',
            newPassword: 'newPassword@123',
          }
      }
      #swagger.parameters['token'] = {
        in: 'path',
        required: true,
        type: 'string',
        description: 'Refresh token received via email',
      }
    */
    /*
      - Retrieves email and newPassword from the incoming request.body.
      - Finds the user by email in UserModel.
      - Verifies the provided reset token using JWT.
      - Validate new password before resetting
      - Updates the user's password with the new hashed and validated password using bcrypt.
      - Returns a success message and sending a confirmation email upon resetting the password.
    */

    const { email, newPassword } = req.body;
    const { token } = req.params;

    const refreshToken = token;

    console.log("Email:", email); // Debugging
    console.log("New Password:", newPassword); // Debugging
    console.log("Refresh Token:", refreshToken); // Debugging

    if (email && newPassword && refreshToken) {
      // Validate the new password
      const isStrong = validator.isStrongPassword(newPassword, [
        { minLength: 6, symbols: "@!#$%" },
      ]);

      if (!isStrong) {
        throw new CustomError(
          "Invalid Password. Please provide a valid password",
          400
        );
      }

      // Search for this user with email
      const user = await User.findOne({ email });
      console.log(user, "userFound");

      if (!user) {
        throw new CustomError("No such user found, please try again!", 404);
      }

      // Verify token
      const decoded = await jwt.verify(refreshToken, process.env.REFRESH_KEY);
      console.log(decoded, "tokenVerified");

      if (!decoded) {
        throw new CustomError("Invalid or expired token", 400);
      }

      const userId = decoded.id;
      const userToUpdate = await User.findById(userId);

      if (userToUpdate) {
        // Hash the new password
        const hashedNewPassword = bcrypt.hashSync(newPassword, 10);

        // Reset validated and hashed password
        userToUpdate.password = hashedNewPassword;
        await userToUpdate.save();
        console.log(userToUpdate, "passwordUpdated");

        // Send reset email to user
        const resetEmailSubject = "Password Reset Confirmation!";
        const resetEmailHtml = getResetPasswordEmailHtml(
          userToUpdate.firstName
        );

        await sendEmail(email, resetEmailSubject, resetEmailHtml);

        res.status(200).send({
          message: "Your Password has been successfully reset!",
          error: false,
        });
      } else {
        throw new CustomError("User not found!", 404);
      }
    } else {
      throw new CustomError("Missing required fields!", 400);
    }
  },
  // POST
  refresh: async (req, res) => {
    /*
      #swagger.tags = ['Authentication']
      #swagger.summary = 'JWT: Refresh'
      #swagger.description = 'Refresh accessToken with refreshToken'
      #swagger.parameters['body'] = {
        in: 'body',
        required: true,
        schema: {
            bearer: {
                refresh: '...refreshToken...'
            }
        }
      }
    */
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
        const { id } = refreshData;

        // Check if id exist in token data
        if (id) {
          // Find the user by id in the database
          const user = await User.findOne({ _id: id });

          if (user) {
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
              throw new CustomError(
                "Unverified Account. Please verify your email address!",
                401
              );
            }
          } else {
            throw new CustomError("Wrong user data!", 401);
          }
        } else {
          throw new CustomError("No data found in refresh token!", 404);
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
  // GET
  logout: async (req, res) => {
    /*
      #swagger.tags = ["Authentication"]
      #swagger.summary = "SimpleToken: Logout"
      #swagger.description = 'Delete simple token key and put JWT to the Blacklist.'
    */
    /*
      - Retrieves the authorization header from the incoming request.headers.
      - Splits the authorization header to extract the token.
      - Deletes the token from the Token collection in the database (for both simple token and JWT).
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
