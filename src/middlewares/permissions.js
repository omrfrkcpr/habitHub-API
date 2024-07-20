"use strict";

//? Middleware Permissions
/* -------------------------------------------------------------------------- */

const { CustomError } = require("../errors/customError");
const Task = require("../models/taskModel");
const Tag = require("../models/tagModel");

module.exports = {
  isLogin: (req, res, next) => {
    // if (process.env.NODE_ENV == "dev") return next();

    if (req.user && req.user.isActive) {
      next();
    } else {
      throw new CustomError(
        "No Permission: You must login to perform this action!",
        403
      );
    }
  },

  isAdmin: (req, res, next) => {
    // if (process.env.NODE_ENV == "dev") return next();

    if (req.user && req.user.isActive && req.user.isAdmin) {
      next();
    } else {
      throw new CustomError(
        "No Permission: You must login and be admin to perform this action!",
        403
      );
    }
  },

  isAdminOrOwn: (req, res, next) => {
    if (req.user && req.user.isActive) {
      if (req.user.isAdmin || req.params?.id == req.user._id) {
        next();
      } else {
        throw new CustomError(
          "No Permission: Only admin or owner can perform this action!",
          403
        );
      }
    } else {
      throw new CustomError("No Permission: Please log in!", 403);
    }
  },

  isTaskOwnerOrAdmin: async (req, res, next) => {
    if (req.user && req.user.isActive) {
      const task = await Task.findById(req.params.id);
      if (
        req.user.isAdmin ||
        String(task.userId) === String(req.user.id || req.user._id)
      ) {
        next();
      } else {
        throw new CustomError(
          "No Permission: Only admin or owner can perform this action!",
          403
        );
      }
    } else {
      throw new CustomError("No Permission: Please log in!", 403);
    }
  },
  isTagOwnerOrAdmin: async (req, res, next) => {
    if (req.user && req.user.isActive) {
      const tag = await Tag.findById(req.params.id);
      if (
        req.user.isAdmin ||
        String(tag.userId) === String(req.user.id || req.user._id)
      ) {
        next();
      } else {
        throw new CustomError(
          "No Permission: Only admin or owner can perform this action!",
          403
        );
      }
    } else {
      throw new CustomError("No Permission: Please log in!", 403);
    }
  },
};
