const fs = require("fs");
const path = require("path");

const getTaskEmailHtml = (firstName, date, tasks) => {
  let html = fs.readFileSync(path.join(__dirname, "dailyTasks.html"), "utf8");

  const tasksHtml = tasks
    .map(
      ({ isCompleted, name, description, priority }) => `
    <li style="background-color: ${isCompleted ? "#d4edda" : "#f8d7da"}">
      <strong>${name}</strong>: ${description} - (Priority: ${
        priority === 1
          ? "Urgent 🚀"
          : priority === 0
          ? "Important 🔥"
          : "Deferred 🍀"
      })
    </li>
  `
    )
    .join("");

  html = html.replace(/{{firstName}}/g, firstName);
  html = html.replace(/{{date}}/g, date);
  html = html.replace(/{{tasks}}/g, tasksHtml);

  return html;
};

module.exports = {
  getTaskEmailHtml,
};
