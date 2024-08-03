"use strict";

const { mongoose } = require("../configs/dbConnection");

// {
//   "userId": "65343222b67e9681f937f001",
//   "token": "...tokenKey..."
// }

const TokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    token: {
      type: String,
      trim: true,
      required: true,
      index: true,
    },
    expires: {
      type: Date,
      default: function () {
        // Set the expiration date to 1 day from creation
        return Date.now() + 24 * 60 * 60 * 1000;
      },
      index: { expires: "24h" }, // TTL index: document will be removed after 24 hours
    },
  },
  { collection: "tokens", timestamps: true }
);

TokenSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
  },
});

const Token = mongoose.model("Token", TokenSchema);

module.exports = Token;
