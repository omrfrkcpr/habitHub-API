"use strict";

module.exports = async function () {
  return null;

  const Tag = require("../models/tagModel");
  const Task = require("../models/taskModel");
  const fs = require("fs");

  const cardColors = [
    "#ADF7B6",
    "#A817C0",
    "#FFC09F",
    "#B0FFFA",
    "#FCFF52",
    "#4EFF31",
    "#5BFFD8",
    "#0038FF",
    "#622BFF",
    "#D21DFF",
    "#B92350",
    "#FF0000",
    "#E9E3E8",
    "#554E55",
  ];

  // Helper function to get a random element from an array - for cardColors
  const getRandomElement = (array) => {
    return array[Math.floor(Math.random() * array.length)];
  };

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
    // Clear the Tag and Task collection of admin user
    await Tag.deleteMany({ userId: admin_userId });
    await Task.deleteMany({ userId: admin_userId });

    // Create the new tags
    const dailyRoutineTag = new Tag({
      name: "Daily Routine",
      userId: admin_userId,
    });
    const workRoutineTag = new Tag({
      name: "Work Routine",
      userId: admin_userId,
    });

    const savedDailyRoutineTag = await dailyRoutineTag.save();
    const savedWorkRoutineTag = await workRoutineTag.save();

    // Verify tags are saved
    const tags = await Tag.find(); // Fetch all tags to ensure they are saved
    console.log("Tags in database:", tags);

    if (tags.length === 0) {
      throw new Error(
        "No tags found in the database. Tasks cannot be created."
      );
    }

    for (let i = 0; i < 10; i++) {
      // Creating 10 random tasks
      const randomTask =
        tasksData[Math.floor(Math.random() * tasksData.length)];
      const randomTag = tags[Math.floor(Math.random() * tags.length)]; // Randomly select one of the created tags

      const task = new Task({
        name: randomTask.name,
        description: randomTask.description,
        cardColor: getRandomElement(cardColors), // Random color
        repeat: "daily",
        priority: Math.floor(Math.random() * 3) - 1, // Random priority between -1 and 1
        dueDates: getRandomDueDates(3), // Generate 3 random due dates
        tagId: randomTag._id, // Assign the random tag's _id
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
