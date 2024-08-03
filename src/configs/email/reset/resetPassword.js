const fs = require("fs");
const path = require("path");

const getResetPasswordEmailHtml = (firstName) => {
  let html = fs.readFileSync(
    path.join(__dirname, "resetPassword.html"),
    "utf8"
  );
  html = html.replace(/{{firstName}}/g, firstName);
  html = html.replace(/{{clientUrl}}/g, process.env.CLIENT_URL);
  return html;
};

module.exports = {
  getResetPasswordEmailHtml,
};
