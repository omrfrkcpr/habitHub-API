"use strict";

// app.use(authentication);

/* -------------------------------------------------------------------------- */

const Token = require("../models/tokenModel");
const jwt = require("jsonwebtoken");

/* -------------------------------------------------------------------------- */
module.exports = async (req, res, next) => {
  // Authorization: Token ...
  // Authorization: ApiKey ...
  // Authorization: X-API-KEY ...
  // Authorization: x-auth-token ...
  // Authorization: Bearer ...

  const auth = req.headers?.authorization || null;
  const tokenKey = auth ? auth.split(" ") : null;

  if (tokenKey) {
    if (tokenKey[0] == "Token") {
      // SimpleToken:
      const tokenData = await Token.findOne({ token: tokenKey[1] }).populate(
        "userId"
      );
      req.user = tokenData ? tokenData.userId : undefined;
    } else if (tokenKey[0] == "Bearer") {
      // JWT:
      jwt.verify(tokenKey[1], process.env.ACCESS_KEY, (error, accessData) => {
        if (accessData) {
          console.log("JWT verified");
          req.user = accessData;
        } else {
          console.log("JWT failed to verify:", error);
          req.user = false;
        }
      });
    }
  }

  next();
};
