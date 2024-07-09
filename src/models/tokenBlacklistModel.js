"use strict";

const { mongoose } = require("../configs/dbConnection");

const TokenBlacklistSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now, expires: "1d" }, // will be auitomatically deleted after 1 day
});

const TokenBlacklist = mongoose.model("TokenBlacklist", TokenBlacklistSchema);

module.exports = TokenBlacklist;
