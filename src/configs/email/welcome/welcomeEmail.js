const fs = require("fs");
const path = require("path");

const getWelcomeEmailHtml = (firstName, token) => {
  let html = fs.readFileSync(path.join(__dirname, "welcomeEmail.html"), "utf8");
  html = html.replace("{{firstName}}", firstName);
  html = html.replace(/{{token}}/g, token);
  html = html.replace(/{{clientUrl}}/g, process.env.CLIENT_URL);
  return html;
};

module.exports = { getWelcomeEmailHtml };
