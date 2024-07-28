"use strict";

const { mongoose } = require("../configs/dbConnection");

const TaskSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    cardColor: { type: String, default: "#ADF7B6", trim: true },
    repeat: { type: String, default: "daily", trim: true },
    priority: {
      type: Number,
      default: 0,
      enum: [-1, 0, 1],
    },
    dueDates: [{ type: Date, required: true }],
    tagId: { type: mongoose.Schema.Types.ObjectId, ref: "Tag" },
    isCompleted: { type: Boolean, default: false },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { collection: "tasks", timestamps: true }
);

TaskSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
  },
});

// In order to spread the old task data during the update process, this data needs to be removed.
TaskSchema.set("toObject", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
    delete ret.createdAt;
    delete ret.updatedAt;
    delete ret.__v;
  },
});

const Task = mongoose.model("Task", TaskSchema);

module.exports = Task;
