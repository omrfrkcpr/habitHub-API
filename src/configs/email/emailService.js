"use strict";

// $ npm i nodemailer
const nodemailer = require("nodemailer");
const { CustomError } = require("../../errors/customError");

/* -------------------------------------------------------------------------- */

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.NODEMAILER_EMAIL,
    pass: process.env.NODEMAILER_PASSWORD,
  },
});
// console.log(transporter);

const sendEmail = async (to, subject, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"HabitHub" <${process.env.NODEMAILER_EMAIL}>`,
      to,
      subject,
      html,
    });
    console.log("Email successfully sent: %s", info.messageId);
  } catch (error) {
    console.error("Email sending error: ", error);
    throw new CustomError("Request failed. Please contact support!");
  }
};

module.exports = { sendEmail };
