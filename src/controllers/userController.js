"use strict";

const User = require("../models/userModel");
const Token = require("../models/tokenModel");
const Tag = require("../models/tagModel");
const Todo = require("../models/todoModel");
const passwordEncryption = require("../helpers/passwordEncryption");

module.exports = {
  // GET
  listUsers: async (req, res) => {
    const filters = req.user?.isAdmin ? {} : { _id: req.user._id };
    const data = await res.getModelList(User, filters);
    res.status(200).send({
      error: false,
      details: await res.getModelListDetails(User, filters),
      data,
    });
  },
  // /:id => GET
  readUser: async (req, res) => {
    const filters = req.user?.isAdmin
      ? { _id: req.params.id }
      : { _id: req.user._id || req.user.id };
    const data = await User.findOne(filters);
    res.status(200).send({
      error: false,
      data,
    });
  },
  // POST
  createUser: async (req, res) => {
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
  },
  // PUT / PATCH
  updateUser: async (req, res) => {
    const filters = req.user?.isAdmin
      ? { _id: req.params.id }
      : { _id: req.user._id || req.user.id };
    req.body.isAdmin = req.user?.isAdmin ? req.body.isAdmin : false;
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
  // /:id => DELETE
  destroyUser: async (req, res) => {
    const filters = req.user?.isAdmin
      ? { _id: req.params.id }
      : { _id: req.user._id || req.user.id };
    //console.log(filters, "filters");

    await Todo.deleteOne({ userId: filters });
    await Tag.deleteOne({ userId: filters });
    const data = await User.deleteOne(filters);

    res.status(data.deletedCount ? 204 : 404).send({
      error: !data.deletedCount,
      message:
        "This user has been successfully deleted along with all Todos and Tags associated with this user.",
      data,
    });
  },
};
