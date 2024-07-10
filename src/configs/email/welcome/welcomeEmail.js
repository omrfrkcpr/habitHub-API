const fs = require('fs');
const path = require('path');

const getWelcomeEmailText = (firstName, token) => {
  let text = fs.readFileSync(path.join(__dirname, 'welcomeEmail.txt'), 'utf8');
  text = text.replace('{{firstName}}', firstName); // Replace all firstName placeholders 
  text = text.replace(/{{token}}/g, token); // Replace all token placeholders 
  return text;
};

const getWelcomeEmailHtml = (firstName, token) => {
  let html = fs.readFileSync(path.join(__dirname, 'welcomeEmail.html'), 'utf8');
  html = html.replace('{{firstName}}', firstName);
  html = html.replace(/{{token}}/g, token); 
  return html;
};

module.exports = { getWelcomeEmailText, getWelcomeEmailHtml };