"use strict";

//? Middleware Permissions
/* -------------------------------------------------------------------------- */
module.exports = {
  isLogin: (req, res, next) => {
    // if (process.env.NODE_ENV == "dev") return next();

    if (req.user && req.user.isActive) {
      next();
    } else {
      res.errorStatusCode = 403;
      throw new Error("No Permission: You must login to perform this action!");
    }
  },

  isAdmin: (req, res, next) => {
    if (process.env.NODE_ENV == "dev") return next();

    if (req.user && req.user.isActive && req.user.isAdmin) {
      next();
    } else {
      res.errorStatusCode = 403;
      throw new Error(
        "No Permission: You must login and to be Admin to perform this action!"
      );
    }
  },
};
