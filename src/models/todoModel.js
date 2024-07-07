"use strict";

const { mongoose } = require("../configs/dbConnection");

const TodoSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    cardColor: { type: String, default: "#ADF7B6" },
    repeat: { type: String, default: "daily" },
    priority: {
      type: Number,
      default: 0,
      enum: [-1, 0, 1],
    },
    dueDates: [{ type: Date }],
    tagId: { type: mongoose.Schema.Types.ObjectId, ref: "Tag" },
    isCompleted: { type: Boolean, default: false },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { collection: "todos", timestamps: true }
);

TodoSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
  },
});

const Todo = mongoose.model("Todo", TodoSchema);

module.exports = Todo;
