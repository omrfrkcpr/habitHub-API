"use strict";

const { mongoose } = require("../configs/dbConnection");

const tokenVerificationSchema = new mongoose.Schema(
  {
    token: { type: String, required: true, unique: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    createdAt: { type: Date, default: Date.now, expires: "7d" }, // will be auitomatically deleted after 7 day, if user doesnt verify
  },
  { collection: "tokenVerifications" }
);

const TokenVerification = mongoose.model(
  "TokenVerification",
  tokenVerificationSchema
);

module.exports = TokenVerification;
