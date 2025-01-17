"use strict";

const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB Connected...");
  } catch (err) {
    console.error("MongoDB Not Connected!: ", err.message);
    process.exit(1);
  }
};

module.exports = { mongoose, connectDB };
