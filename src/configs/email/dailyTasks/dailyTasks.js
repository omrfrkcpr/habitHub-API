const fs = require("fs");
const path = require("path");

const getTaskEmailHtml = (firstName, date, tasks) => {
  let html = fs.readFileSync(path.join(__dirname, "dailyTasks.html"), "utf8");

  const tasksHtml = tasks
    .map(
      (task) => `
    <li style="background-color: ${task.isCompleted ? "#d4edda" : "#f8d7da"}">
      <strong>${task.name}</strong>: ${task.description} - (Priority: ${
        task.priority === 1
          ? "Urgent 🚀"
          : task.priority === 0
          ? "Important 🌟"
          : "Do Later 🔥"
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
