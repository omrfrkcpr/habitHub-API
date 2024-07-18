"use strict";

const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const Token = require("../models/tokenModel");
const Tag = require("../models/tagModel");
const Todo = require("../models/todoModel");
const passwordEncryption = require("../helpers/passwordEncryption");
const fs = require("node:fs");

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

    if (req.file) {
      req.body.avatar = "/uploads/" + req.file.filename;
    }

    // Create new user in database
    const data = await User.create({
      ...req.body,
      passpord: bcrypt.hashSync(req.body.password, 10),
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

    const customFilter = req.user?.isAdmin
      ? { _id: req.params.id }
      : { _id: req.user?._id || req.user?.id };

    if (!req.user.isAdmin) {
      delete req.body.isActive;
      delete req.body.isAdmin;
    }

    // Fetch current user from database
    const user = await User.findOne(customFilter);

    // Compare new password with current hashed password
    const isSamePassword = bcrypt.compareSync(req.body.password, user.password);

    // Check if password is being updated
    if (req.body.password) {
      // If new password is different, hash the new password
      if (!isSamePassword) {
        req.body.password = bcrypt.hashSync(req.body.password, 10);
      }
    }

    if (req.file) {
      req.body.avatar = "/uploads/" + req.file.filename;
    }

    const data = await User.findOneAndUpdate(customFilter, req.body, {
      runValidators: true,
    }); // returns data

    // delete old uploaded image
    if (req.file && data.avatar) {
      fs.unlinkSync(`.${data.avatar}`, (err) => console.log(err));
    }

    res.status(202).send({
      error: false,
      message: "Your changes have been saved successfully.",
      new: await User.findOne(customFilter),
      data,
    });
  },
  // /:id => DELETE
  destroyUser: async (req, res) => {
    /*
      - Determines the filter based on whether the requesting user (req.user) is an admin.
      - Deletes todos and tags associated with the user using Todo.deleteMany() and Tag.deleteMany().
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

    // Delete all todos and tags related to
    await Todo.deleteMany(userIdFilter);
    await Tag.deleteMany(userIdFilter);

    // Delete user
    const result = await User.findOneAndDelete(idFilter); // returns data

    // delete old uploaded image
    if (result.avatar) {
      fs.unlinkSync(`.${result.avatar}`, (err) => console.log(err));
    }

    res.status(204).send({
      error: false,
      message: "Account successfully deleted!",
    });
  },
};
