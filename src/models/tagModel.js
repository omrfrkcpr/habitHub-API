"use strict";

const { mongoose } = require("../configs/dbConnection");

const TagSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { collection: "tags", timestamps: true }
);

TagSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
  },
});

const Tag = mongoose.model("Tag", TagSchema);

module.exports = Tag;
