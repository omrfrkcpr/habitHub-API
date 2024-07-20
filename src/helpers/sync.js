"use strict";

module.exports = async function () {
  return null;

  const Tag = require("../models/tagModel");
  const Task = require("../models/taskModel");
  const fs = require("fs");

  // Load the JSON data
  const tasksData = JSON.parse(
    fs.readFileSync("./src/helpers/tasks.json", "utf-8")
  );

  const admin_userId = process.env.ADMIN_USERID;

  // Helper function to generate random dates within the next 7-10 days
  const getRandomDueDates = (numDates) => {
    const dates = [];
    const today = new Date();

    for (let i = 0; i < numDates; i++) {
      const daysToAdd = Math.floor(Math.random() * 4); // Random number between 7 and 10
      const date = new Date(today);
      date.setDate(today.getDate() + daysToAdd);
      dates.push(date);
    }

    return dates;
  };

  try {
    const tags = await Tag.find(); // Fetch all tags to randomly assign one

    for (let i = 0; i < 10; i++) {
      // Creating 10 random tasks
      const randomTask =
        tasksData[Math.floor(Math.random() * tasksData.length)];
      const task = new Task({
        name: randomTask.name,
        description: randomTask.description,
        cardColor: "#" + Math.floor(Math.random() * 16777215).toString(16), // Random color
        repeat: "daily",
        priority: Math.floor(Math.random() * 3) - 1, // Random priority between -1 and 1
        dueDates: getRandomDueDates(3), // Generate 3 random due dates
        // tagId: tags[Math.floor(Math.random() * tags.length)].id, // Random tag
        // tagId: "6693c8f288bbcd9097817496", // work routine
        isCompleted: Math.random() < 0.5, // Random boolean
        userId: admin_userId,
      });

      await task.save();
    }

    console.log("Random Tasks created successfully!");
  } catch (error) {
    console.error("Error creating random Tasks:", error);
  }
};
