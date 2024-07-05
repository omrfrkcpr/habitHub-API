"use strict";

const User = require("../models/userModel");
const Token = require("../models/tokenModel");
const Tag = require("../models/tagModel");
const Todo = require("../models/todoModel");
const passwordEncryption = require("../helpers/passwordEncryption");

module.exports = {
  //& GET
  listUsers: async (req, res) => {
    /*
      - Filters users based on whether the requesting user (req.user) is an admin or not. If the user is an admin, all users are fetched; otherwise, only the requesting user's data is retrieved.
      - Uses the getModelList function to filter and retrieve users.
      - Returns the data along with details about the model list.
  */

    const filters = req.user?.isAdmin ? {} : { _id: req.user._id };
    const data = await res.getModelList(User, filters);
    res.status(200).send({
      error: false,
      details: await res.getModelListDetails(User, filters),
      data,
    });
  },
  //& /:id => GET
  readUser: async (req, res) => {
    /*
      - Filters users based on whether the requesting user (req.user) is an admin or not. If the user is an admin, retrieves the requested user's details; otherwise, retrieves the details of the requesting user.
      - Uses User.findOne() to find the user based on the specified filters.
      - Returns the user data if found.
    */

    const filters = req.user?.isAdmin
      ? { _id: req.params.id }
      : { _id: req.user._id || req.user.id };
    const data = await User.findOne(filters);
    res.status(200).send({
      error: false,
      data,
    });
  },
  //& POST
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

      // Create new user in database
      const data = await User.create(req.body);

      // Create new token for new user
      const tokenData = await Token.create({
        userId: data._id,
        token: passwordEncryption((data._id || data.id) + Date.now()),
      });

      res.status(201).send({
        error: false,
        message: "New Account successfully created",
        token: tokenData.token,
        data,
      });
    } else {
      // if isAdmin==false, then create directly a user
      const data = await User.create(req.body);
      const tokenData = await Token.create({
        userId: data._id,
        token: passwordEncryption((data._id || data.id) + Date.now()),
      });

      res.status(201).send({
        error: false,
        message: "New Account successfully created",
        token: tokenData.token,
        data,
      });
    }
  },
  //& PUT / PATCH
  updateUser: async (req, res) => {
    /*
      - Sets isAdmin based on whether the requesting user (req.user) is an admin.
      - Updates the user's information in the database using User.updateOne().
      - Uses runValidators: true to ensure validation rules are applied during update.
      - Returns a success message along with the updated user data.
    */

    const filters = req.user?.isAdmin
      ? { _id: req.params.id }
      : { _id: req.user._id || req.user.id };
    req.body.isAdmin = req.user?.isAdmin || false;
    const data = await User.updateOne(filters, req.body, {
      runValidators: true,
    });
    res.status(202).send({
      error: false,
      message: "Account successfully updated",
      new: await User.find(filters),
      data,
    });
  },
  //& /:id => DELETE
  destroyUser: async (req, res) => {
    /*
      - Determines the filter based on whether the requesting user (req.user) is an admin.
      - Deletes todos and tags associated with the user using Todo.deleteMany() and Tag.deleteMany().
      - Deletes the user from the database using User.deleteOne().
      - Returns a response indicating success or failure of the deletion operation along with relevant messages.
    */

    const filters = req.user?.isAdmin
      ? { _id: req.params.id }
      : { _id: req.user._id || req.user.id };
    //console.log(filters, "filters");

    await Todo.deleteMany({ userId: filters });
    await Tag.deleteMany({ userId: filters });
    const data = await User.deleteOne(filters);

    res.status(data.deletedCount ? 204 : 404).send({
      error: !data.deletedCount,
      message:
        "This user has been successfully deleted along with all Todos and Tags associated with this user.",
      data,
    });
  },
};
