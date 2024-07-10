const fs = require("fs");
const path = require("path");

const getResetPasswordEmailText = (firstName) => {
  let text = fs.readFileSync(path.join(__dirname, "resetPassword.txt"), "utf8");
  text = text.replace(/{{firstName}}/g, firstName); // Replace all firstName placeholders
  return text;
};

const getResetPasswordEmailHtml = (firstName) => {
  let html = fs.readFileSync(
    path.join(__dirname, "resetPassword.html"),
    "utf8"
  );
  html = html.replace(/{{firstName}}/g, firstName);
  return html;
};

module.exports = {
  getResetPasswordEmailText,
  getResetPasswordEmailHtml,
};
