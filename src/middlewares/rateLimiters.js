"use strict";

const rateLimit = require("express-rate-limit");
const { CustomError } = require("../errors/customError");

module.exports = {
  generalRateLimiter: rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000, // 1 hour
    message: "Too many requests from this IP, please try again later!",
  }),
  emailLimiter: rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 24h
    max: 3, // max 3 Email from same IP in 24h
    handler: (req, res, next) => {
      next(
        new CustomError(
          "You have reached the email sending limit. Please try again later.",
          429
        )
      );
    },
  }),
};
