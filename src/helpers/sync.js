"use strict";
const Tag = require("../models/tagModel");
const Task = require("../models/taskModel");
const fs = require("fs");

module.exports = async function () {
  // Return null early to prevent the rest of the code from executing
  return null;

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

  const darkCardColors = [
    "#468E58", // #ADF7B6
    "#A817C0", // #A817C0
    "#996852", // #FFC09F
    "#569E9B", // #B0FFFA
    "#96992E", // #FCFF52
    "#268014", // #4EFF31
    "#2E8C78", // #5BFFD8
    "#0038FF", // #0038FF
    "#622BFF", // #622BFF
    "#D21DFF", // #D21DFF
    "#B92350", // #B92350
    "#FF0000", // #FF0000
    "#8B8490", // #E9E3E8
    "#554E55", // #554E55
  ];

  // Helper function to get a random element from an array - for cardColors
  const getRandomElement = (array) => {
    return array[Math.floor(Math.random() * array.length)];
  };

  // Load the JSON data
  const workTasksData = JSON.parse(
    fs.readFileSync("./src/helpers/workTasks.json", "utf-8")
  );
  const dailyTasksData = JSON.parse(
    fs.readFileSync("./src/helpers/dailyTasks.json", "utf-8")
  );

  const admin_userId = process.env.ADMIN_USERID;
  const user_userId = process.env.USER_USERID;

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
    await Tag.deleteMany({ userId: user_userId });
    await Task.deleteMany({ userId: user_userId });

    // Create the new tags
    const dailyRoutineTag = new Tag({
      name: "Daily Routine",
      userId: user_userId,
    });
    const workRoutineTag = new Tag({
      name: "Work Routine",
      userId: user_userId,
    });

    const savedDailyRoutineTag = await dailyRoutineTag.save();
    const savedWorkRoutineTag = await workRoutineTag.save();

    // Verify tags are saved
    const tags = await Tag.find({ userId: user_userId }); // Fetch all tags to ensure they are saved
    console.log("Tags in database:", tags);

    if (tags.length === 0) {
      throw new Error(
        "No tags found in the database. Tasks cannot be created."
      );
    }

    for (let i = 0; i < 20; i++) {
      // Randomly select one of the created tags
      const randomTag = tags[Math.floor(Math.random() * tags.length)];
      let randomTask;

      // Select a task based on the tag
      if (randomTag.name === "Work Routine") {
        randomTask =
          workTasksData[Math.floor(Math.random() * workTasksData.length)];
      } else if (randomTag.name === "Daily Routine") {
        randomTask =
          dailyTasksData[Math.floor(Math.random() * dailyTasksData.length)];
      }

      const task = new Task({
        name: randomTask.name,
        description: randomTask.description,
        cardColor: getRandomElement(darkCardColors), // Random color
        repeat: "daily",
        priority: Math.floor(Math.random() * 3) - 1, // Random priority between -1 and 1
        dueDates: getRandomDueDates(3), // Generate 3 random due dates
        tagId: randomTag._id, // Assign the random tag's _id
        isCompleted: Math.random() < 0.5, // Random boolean
        userId: user_userId,
      });

      await task.save();
    }

    console.log("Random Tasks created successfully!");
  } catch (error) {
    console.error("Error creating random Tasks:", error);
  }
};
