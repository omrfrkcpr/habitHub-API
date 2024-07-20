"use strict";

const Task = require("../models/taskModel");
const { parseISO, startOfDay, endOfDay, isValid } = require("date-fns");
const { CustomError } = require("../errors/customError");

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
    const { name, description, cardColor, repeat, priority, dueDates, tagId } =
      req.body;

    const newTask = new Task({
      name,
      description,
      cardColor,
      repeat,
      priority,
      dueDates,
      tagId,
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
      - Extracts the fields to update for the task from the request body.
      - Updates the task in the database with the provided fields.
      - Sends a response indicating the success of the update operation along with the updated task data.
    */

    const updatedTask = await Task.updateOne({ _id: req.params.id }, req.body, {
      runValidators: true,
      new: true,
    });

    res.status(updatedTask.modifiedCount ? 202 : 404).send({
      error: !updatedTask.modifiedCount,
      message: updatedTask.modifiedCount
        ? "Task successfully updated"
        : "Task not found",
      new: updatedTask,
    });
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
};
