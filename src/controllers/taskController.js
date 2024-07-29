"use strict";

const { parseISO, startOfDay, endOfDay, isValid } = require("date-fns");
const { CustomError } = require("../errors/customError");
const User = require("../models/userModel");
const Task = require("../models/taskModel");
const Tag = require("../models/tagModel");
const { sendEmail } = require("../configs/email/emailService");
const { getTaskEmailHtml } = require("../configs/email/dailyTasks/dailyTasks");

// Helper function to check if only date and priority are present in req.body
const isPriorityAndDateOnly = (body) =>
  Object.keys(body).length === 2 && body.date && body.priority !== undefined;

// Helper function to check if only date and isCompleted are present in req.body
const isDateAndIsCompletedOnly = (body) =>
  Object.keys(body).length === 2 && body.date && body.isCompleted !== undefined;

// Helper function to create a new task with given properties
const createNewTask = async (taskData) => {
  const newTask = new Task(taskData);
  await newTask.save();
  return newTask;
};

module.exports = {
  // GET
  listTasks: async (req, res) => {
    /*
      - Extracts the selected date from the query parameters.
      - Initializes a filter to match tasks with due dates that include the selected date.
      - If the requesting user is not an admin, adds a userId filter to restrict results to the user's own tasks.
      - Uses `res.getModelList` to retrieve tasks matching the filter and populates the `tagId` field.
      - Sends the retrieved tasks along with additional details using `res.getModelListDetails`.
    */
    const selectedDate = req.query.date;

    // Check if selectedDate is provided
    if (!selectedDate) {
      throw new CustomError(
        "Please provide a specific date time in date query",
        400
      );
    }

    const parsedDate = parseISO(selectedDate);

    if (!isValid(parsedDate)) {
      throw new CustomError("Invalid date format", 400);
    }

    const start = startOfDay(parsedDate);
    const end = endOfDay(parsedDate);

    const listFilter = {
      dueDates: {
        $elemMatch: {
          $gte: start,
          $lte: end,
        },
      },
    };

    if (!req.user.isAdmin) {
      listFilter.userId = req.user?._id || req.user?.id;
    }

    const tasks = await res.getModelList(Task, listFilter, [
      {
        path: "userId",
        select: "-__v",
      },
      {
        path: "tagId",
        select: "name",
      },
    ]);
    res.send({
      error: false,
      details: await res.getModelListDetails(Task, listFilter),
      data: tasks,
    });
  },
  // POST
  createTask: async (req, res) => {
    /*
      - Extracts the necessary fields for a new task from the request body.
      - Creates a new Task object using the extracted fields and sets the userId to the ID of the requesting user.
      - Saves the new task to the database.
      - Sends a response indicating the success of the creation operation along with the created task data.
    */
    const {
      name,
      description,
      cardColor,
      repeat,
      priority,
      dueDates,
      tagName,
    } = req.body;

    // Check if the tagId in req.body exists in the Tag model
    let tag = await Tag.findOne({
      name: tagName,
    });

    if (!tag) {
      // If tag does not exist, create a new Tag
      tag = new Tag({
        name: tagName,
        userId: req.user.id || req.user._id,
      });
      await tag.save();
    }

    const newTask = new Task({
      name,
      description,
      cardColor,
      repeat,
      priority,
      dueDates,
      tagId: tag._id || tag.id,
      userId: req.user.isAdmin
        ? req.body.userId // userId must be provided in the request body by an admin
        : req.user?.id || req.user?._id,
    });

    const task = await newTask.save();
    res.send({
      error: false,
      message: "New Task successfully created",
      data: task,
    });
  },
  // GET /:id
  readTask: async (req, res) => {
    /*
      - Finds the task by ID from the database.
      - If the user is not an admin, ensures the task belongs to the requesting user by adding userId to the query filter.
      - Populates the `userId` and `tagId` fields of the retrieved task for detailed information.
        - `userId`: Populates with user details excluding the `__v` field.
        - `tagId`: Populates with tag details including only the `name` field.
      - Sends a response indicating the success of the retrieval operation along with the retrieved task data.
        - `error`: false, indicating the operation was successful.
        - `data`: the retrieved task object, populated with user and tag details.
    */

    const task = await Task.findOne({ _id: req.params.id }).populate([
      {
        path: "userId",
        select: "-__v",
      },
      {
        path: "tagId",
        select: "name",
      },
    ]);

    res.send({
      error: false,
      data: task,
    });
  },
  // /:id => PUT / PATCH
  updateTask: async (req, res) => {
    /*
      - The task matching the id is now assigned as the currentTask.
      - If there is any data that matches the date in the req.body from the dueDates in the currentTask, only extract it.
        - The place we pay attention to is that there may not be any data in dueDates that directly matches the date. However, we will extract the structure that matches the day.
      - If the tagId in the body does not match any data in our Tag model, create a new Tag. The name of the newly created Tag will be req.body.tagId and its userId will be req.user.id || req.user._id.
      - Create a new task according to the date that came in req.body. Give the date as the only element of the dueDates array of the newly created task.
      - We get the other data of the new task I will create in req.body. We will get the data that does not come in req.body from currentTask.
      - Update database according to currentTask and newly created Task
      - Sends a response indicating the success of the update operation along with the updated task data.
    */

    const currentTask = await Task.findById(req.params.id);

    const reqDate = new Date(req.body.date);
    const reqDay = reqDate.getDate();
    const reqMonth = reqDate.getMonth();
    const reqYear = reqDate.getFullYear();

    // Find index of matching due date if any
    const matchingDueDateIndex = currentTask.dueDates.findIndex((dueDate) => {
      const dueDateObj = new Date(dueDate);
      return (
        dueDateObj.getDate() === reqDay &&
        dueDateObj.getMonth() === reqMonth &&
        dueDateObj.getFullYear() === reqYear
      );
    });

    const { date, tagName, ...restOfBody } = req.body;

    // Handle special cases
    if (isPriorityAndDateOnly(req.body)) {
      const updatedDueDates = [
        ...currentTask.dueDates.slice(0, matchingDueDateIndex),
        ...currentTask.dueDates.slice(matchingDueDateIndex + 1),
      ];

      await Task.findByIdAndUpdate(
        req.params.id,
        { ...currentTask.toObject(), dueDates: updatedDueDates },
        { runValidators: true, new: true }
      );

      const newTaskData = {
        ...currentTask.toObject(),
        dueDates: [date],
        priority: req.body.priority,
      };
      const newTask = await createNewTask(newTaskData);

      return res.status(202).send({
        error: false,
        message: "Task successfully updated",
        updatedTask: newTask,
      });
    }

    if (isDateAndIsCompletedOnly(req.body)) {
      const updatedDueDates = [
        ...currentTask.dueDates.slice(0, matchingDueDateIndex),
        ...currentTask.dueDates.slice(matchingDueDateIndex + 1),
      ];

      await Task.findByIdAndUpdate(
        req.params.id,
        { ...currentTask.toObject(), dueDates: updatedDueDates },
        { runValidators: true, new: true }
      );

      const newTaskData = {
        ...currentTask.toObject(),
        dueDates: [date],
        isCompleted: req.body.isCompleted,
      };
      const newTask = await createNewTask(newTaskData);

      return res.status(202).send({
        error: false,
        message: "Task successfully updated",
        updatedTask: newTask,
      });
    }

    // Check if the tagId in req.body exists in the Tag model
    let tag = await Tag.findOne({
      name: tagName,
    });

    if (!tag) {
      // If tag does not exist, create a new Tag
      tag = new Tag({
        name: tagName,
        userId: req.user.id || req.user._id,
      });
      await tag.save();
    }

    if (currentTask.dueDates.length === 1) {
      // Only one dueDate, directly update the current task
      const updatedCurrentTask = await Task.findByIdAndUpdate(
        req.params.id,
        { ...restOfBody, tagId: tag._id || tag.id },
        { runValidators: true, new: true }
      );

      return res.status(202).send({
        error: false,
        message: "Task successfully updated",
        updatedTask: updatedCurrentTask,
      });
    } else {
      // More than one due date, update the current task with the new due date
      const updatedDueDates = [
        ...currentTask.dueDates.slice(0, matchingDueDateIndex),
        ...currentTask.dueDates.slice(matchingDueDateIndex + 1),
      ];

      await Task.findByIdAndUpdate(
        req.params.id,
        { ...currentTask.toObject(), dueDates: updatedDueDates },
        { runValidators: true, new: true }
      );

      // Create a new task with the new date
      const newTaskData = {
        ...restOfBody,
        dueDates: [date],
        tagId: tag._id || tag.id,
      };
      const newTask = await createNewTask(newTaskData);

      return res.status(202).send({
        error: false,
        message: "Task successfully updated",
        updatedTask: newTask,
      });
    }
  },
  // /:id => DELETE
  destroyTask: async (req, res) => {
    /*
      - Finds the task by ID from the database.
      - If the task is not found, sets a 404 error status and throws an error.
      - If the requesting user is not the owner of the task, sets a 401 error status and throws an error.
      - Deletes the task from the database.
      - Sends a response indicating the success of the deletion operation.
    */

    const task = await Task.deleteOne({ _id: req.params.id });

    res.status(task.deletedCount ? 204 : 404).send({
      error: !task.deletedCount,
      message: task.deletedCount
        ? "Task successfully deleted"
        : "Task not found",
    });
  },
  // /email => POST
  sendTasks: async (req, res) => {
    const { userId, date } = req.body;

    if (!userId || !date) {
      throw new CustomError("Bad request. Please try again!", 400);
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new CustomError("User not found", 404);
    }

    const parsedDate = parseISO(date);

    if (!isValid(parsedDate)) {
      throw new CustomError("Invalid date format", 400);
    }

    const start = startOfDay(parsedDate);
    const end = endOfDay(parsedDate);

    const tasks = await Task.find({
      userId,
      dueDates: {
        $elemMatch: {
          $gte: start,
          $lte: end,
        },
      },
    }).sort({ priority: -1 });

    if (!tasks.length) {
      throw new CustomError("No tasks found for this date", 404);
    }

    const formattedDate = new Date(date).toLocaleDateString("en-GB");

    const emailHtml = getTaskEmailHtml(
      user?.username || user?.firstName,
      formattedDate,
      tasks
    );

    const emailSubject = `Your tasks for ${formattedDate}`;

    await sendEmail(user.email, emailSubject, emailHtml);

    res.status(200).send({ message: "Email sent successfully" });
  },
};
