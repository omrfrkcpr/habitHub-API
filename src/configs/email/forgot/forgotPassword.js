const fs = require("fs");
const path = require("path");

const getForgotPasswordEmailText = (firstName, token) => {
  let text = fs.readFileSync(
    path.join(__dirname, "forgotPassword.txt"),
    "utf8"
  );
  text = text.replace(/{{firstName}}/g, firstName); // Replace all firstName placeholders
  text = text.replace(/{{token}}/g, token); // Replace all token placeholders
  return text;
};

const getForgotPasswordEmailHtml = (firstName, token) => {
  let html = fs.readFileSync(
    path.join(__dirname, "forgotPassword.html"),
    "utf8"
  );
  html = html.replace(/{{firstName}}/g, firstName);
  html = html.replace(/{{token}}/g, token);
  return html;
};

module.exports = {
  getForgotPasswordEmailText,
  getForgotPasswordEmailHtml,
};
