"use strict";

const { mongoose } = require("../configs/dbConnection");
const User = require("../models/userModel");

const tokenVerificationSchema = new mongoose.Schema(
  {
    token: { type: String, required: true, unique: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    createdAt: { type: Date, default: Date.now, expires: "1h" }, // will be auitomatically deleted after 1 hour, if user doesnt verify
  },
  { collection: "tokenVerifications" }
);

// `post` middleware to check user status and delete user if necessary
tokenVerificationSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    const user = await User.findById(doc.userId);
    if (user && !user.isActive) {
      // If user doesnt verify his account in 1 hour. Token and User informations will be deleted from database.
      await User.findByIdAndDelete(doc.userId);
    }
  }
});

const TokenVerification = mongoose.model(
  "TokenVerification",
  tokenVerificationSchema
);

module.exports = TokenVerification;
