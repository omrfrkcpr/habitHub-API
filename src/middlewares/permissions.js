"use strict";

//? Middleware Permissions
/* -------------------------------------------------------------------------- */

const { CustomError } = require("../errors/customError");

module.exports = {
  isLogin: (req, res, next) => {
    // if (process.env.NODE_ENV == "dev") return next();

    if (req.user && req.user.isActive) {
      next();
    } else {
      res.statusCode = 403;
      throw new Error("No Permission: You must login to perform this action!");
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
};
