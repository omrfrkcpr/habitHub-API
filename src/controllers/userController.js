"use strict";

const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const Token = require("../models/tokenModel");
const Tag = require("../models/tagModel");
const Task = require("../models/taskModel");
const passwordEncryption = require("../helpers/passwordEncryption");
const fs = require("node:fs");
const validator = require("validator");
const {
  deleteObjectByDateKeyNumber,
} = require("../helpers/deleteObjectByKeyNumberS3Bucket");
const { extractDateNumber } = require("../helpers/extractDateNumber");
const { CustomError } = require("../errors/customError");

module.exports = {
  // GET
  listUsers: async (req, res) => {
    /*
      - Uses the getModelList function to filter and retrieve users.
      - Returns the data along with details about the model list.
    */

    const data = await res.getModelList(User);
    res.status(200).send({
      error: false,
      details: await res.getModelListDetails(User),
      data,
    });
  },
  // /:id => GET
  readUser: async (req, res) => {
    /*
      - Filters users based on whether the requesting user (req.user) is an admin or not. If the user is an admin, retrieves the requested user's details; otherwise, retrieves the details of the requesting user.
      - Uses User.findOne() to find the user based on the specified filters.
      - Returns the user data if found.
    */

    const filters = req.user?.isAdmin
      ? { _id: req.params.id }
      : { _id: req.user?._id || req.user?.id };

    const data = await User.findOne(filters);
    res.status(200).send({
      error: false,
      data,
    });
  },
  // POST
  createUser: async (req, res) => {
    /*
      - Sets isAdmin to false by default if not provided in the request body.
      - Sets isActive to true by default.
      - If the new user is an admin (isAdmin is true):
        - Updates all existing admin users to isAdmin: false.
      - Creates a new user in the database using User.create().
      - Generates a new token for the user using Token.create().
      - Returns a success message along with the newly created user and token.
    */
    const isAdmin = req.body.isAdmin || false;
    req.body.isActive = req.body.isActive || true;
    req.body.isAdmin = isAdmin;

    // If new user is admin, then set the other user as isAdmin = false
    if (isAdmin) {
      // set all admin user's as isAdmin = false
      await User.updateMany({ isAdmin: true }, { isAdmin: false });
    }

    // // local upload
    // if (req.file) {
    //   req.body.avatar = "/uploads/" + req.file.filename;
    // }

    let imagePath = "";
    if (req.fileLocation) {
      imagePath = req.fileLocation;
    }

    // Create new user in database
    const data = await User.create({
      ...req.body,
      passpord: bcrypt.hashSync(req.body.password, 10),
      avatar: imagePath,
    });

    // Create new token for new user
    const tokenData = await Token.create({
      userId: data._id || data.id,
      token: passwordEncryption((data._id || data.id) + Date.now()),
    });

    res.status(201).send({
      error: false,
      message: "New Account successfully created",
      token: tokenData.token,
      data,
    });
  },
  // /:id => PUT / PATCH
  updateUser: async (req, res) => {
    /*
      - Sets isAdmin based on whether the requesting user (req.user) is an admin.
      - Updates the user's information in the database using User.updateOne().
      - If password is updated, bcrypt hashes the new password before updating.
      - Uses runValidators: true to ensure validation rules are applied during update.
      - Returns a success message along with the updated user data.
    */

    if (req.body.email) {
      const existingUser = await User.findOne({
        email: req.body.email,
      });
      if (existingUser && existingUser._id.toString() !== req.params.id) {
        throw new CustomError("Email already exists", 400);
      }
    } else if (req.body.username) {
      const existingUser = await User.findOne({
        username: req.body.username,
      });
      if (existingUser && existingUser._id.toString() !== req.params.id) {
        throw new CustomError("Username already exists", 400);
      }
    }

    const customFilter = req.user?.isAdmin
      ? { _id: req.params.id }
      : { _id: req.user?._id || req.user?.id };

    if (!req.user.isAdmin) {
      delete req.body.isActive;
      delete req.body.isAdmin;
    }

    // Fetch current user from database
    const user = await User.findOne(customFilter);

    // Check if password is being updated
    if (req.body.password) {
      const oldPassword = req.body.oldPassword;

      if (!oldPassword) {
        throw new CustomError(
          "Current Password is required to update password",
          400
        );
      } else {
        // Check if old password is correct
        const isCorrectPassword = bcrypt.compareSync(
          oldPassword,
          user.password
        );
        if (!isCorrectPassword) {
          throw new CustomError(
            "Please provide correct current password!",
            401
          );
        }
      }

      const isStrong = validator.isStrongPassword(req.body.password, {
        minLength: 6,
        minSymbols: 1,
      });

      if (!isStrong) {
        throw new CustomError(
          "Invalid Password. Please provide a valid password",
          400
        );
      }
      // Compare new password with current hashed password
      const isSamePassword = bcrypt.compareSync(
        req.body.password,
        user.password
      );
      // If new password is different, hash the new password
      if (!isSamePassword) {
        req.body.password = bcrypt.hashSync(req.body.password, 10);
      }
    }

    // // local upload
    // if (req.file) {
    //   // req.file.buffer // actual image data
    //   req.body.avatar = "/uploads/" + req.file.filename;
    // }

    // ====================USER-AVATAR===================== //

    const avatarIncludesS3 =
      user.avatar && user.avatar.includes(process.env.AWS_S3_BUCKET_REGION);

    if (req.fileLocation) {
      if (avatarIncludesS3) {
        const identifierForImage = extractDateNumber(user.avatar);
        await deleteObjectByDateKeyNumber(identifierForImage); // delete existing user avatar from S3 bucket
      }
      req.body.avatar = req.fileLocation;
    } else if (user.avatar && req.body.avatar === "") {
      if (avatarIncludesS3) {
        const identifierForImage = extractDateNumber(user.avatar);
        await deleteObjectByDateKeyNumber(identifierForImage); // just delete existing user avatar from S3 bucket
      }
    }

    // ====================USER-AVATAR===================== //

    if (req.body.oldPassword) {
      delete req.body.oldPassword; // requires just for security and user notifications
    }

    const data = await User.findOneAndUpdate(customFilter, req.body, {
      runValidators: true,
    }); // returns data

    // // delete old uploaded image
    // if (req.file && data.avatar) {
    //   fs.unlinkSync(`.${data.avatar}`, (err) => console.log(err));
    // }

    let message;

    if (req.body.password) {
      message = "Your password has been updated successfully.";
    } else if (
      req.body.username ||
      req.body.email ||
      req.body.avatar ||
      req.body.firstName ||
      req.body.lastName
    ) {
      message = "Your profile information has been updated successfully.";
    } else {
      message = "Your changes have been saved successfully.";
    }

    res.status(202).send({
      error: false,
      message,
      new: await User.findOne(customFilter),
      data,
    });
  },
  // agree-contract/:userId => PUT
  agreeContract: async (req, res) => {
    if (req.params.userId) {
      const user = await User.findOneAndUpdate(
        { _id: req.params.userId },
        { isAgreed: true },
        {
          new: true,
          runValidators: true,
        }
      );

      res.status(200).send({
        error: false,
        message: "User has agreed to the contract",
        new: user,
      });
    }
  },
  // /:id => DELETE
  destroyUser: async (req, res) => {
    /*
      - Determines the filter based on whether the requesting user (req.user) is an admin.
      - Deletes tasks and tags associated with the user using Task.deleteMany() and Tag.deleteMany().
      - Deletes the user from the database using User.deleteOne().
      - Returns a response indicating success or failure of the deletion operation along with relevant messages.
    */

    const idFilter = req.user?.isAdmin
      ? { _id: req.params.id }
      : { _id: req.user?._id || req.user?.id };
    //console.log("idFilter":, idFilter);

    const userIdFilter = req.user?.isAdmi
      ? { userId: req.params.id }
      : { userId: req.user?._id || req.user?.id };

    // Delete all tasks and tags related to
    await Task.deleteMany(userIdFilter);
    await Tag.deleteMany(userIdFilter);

    // Delete user
    const result = await User.findOneAndDelete(idFilter); // returns data

    // // delete old uploaded image
    // if (result.avatar) {
    //   fs.unlinkSync(`.${result.avatar}`, (err) => console.log(err));
    // }

    if (
      result.avatar &&
      result.avatar.includes(process.env.AWS_S3_BUCKET_REGION)
    ) {
      const identifierForImage = extractDateNumber(result.avatar);
      await deleteObjectByDateKeyNumber(identifierForImage); // delete existing user avatar from s3 bucket
    }

    res.status(204).send({
      error: false,
      message: "Account successfully deleted!",
    });
  },
};
