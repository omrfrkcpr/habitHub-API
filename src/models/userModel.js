"use strict";

const { mongoose } = require("../configs/dbConnection");
const { encryptPassword } = require("../helpers/passwordEncryption");

const UserSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      minlength: [3, "Firstname must be at least 3 characters"],
      maxlength: [20, "Firstname should not contain more than 20 characters"],
    },
    lastName: {
      type: String,
      required: true,
      minlength: [3, "Lastname must be at least 3 characters"],
      maxlength: [20, "Lastname should not contain more than 20 characters"],
    },
    email: {
      type: String,
      required: true,
      unique: true,
      validate: [
        (email) => email.includes("@") && email.split("@")[1].includes("."),
        "Email is invalid. Please provide a valid email address",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      validate: [
        {
          validator: function (v) {
            return /[A-Z]/.test(v);
          },
          message: (props) =>
            "Password must contain at least one uppercase letter",
        },
        {
          validator: function (v) {
            return /[a-z]/.test(v);
          },
          message: (props) =>
            "Password must contain at least one lowercase letter",
        },
        {
          validator: function (v) {
            return /\d/.test(v);
          },
          message: (props) => "Password must contain at least one number",
        },
        {
          validator: function (v) {
            return /[!@#$%]/.test(v);
          },
          message: (props) =>
            "Password must contain at least one special character (@,!,#,$,%)",
        },
      ],
    },
  },
  { collection: "user", timestamps: true }
);

UserSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
  },
});

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = await encryptPassword(this.password);
  next();
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
