"use strict";

const Todo = require("../models/todoModel");
const { parseISO, startOfDay, endOfDay, isValid } = require("date-fns");

module.exports = {
  listTodos: async (req, res) => {
    /*
      - Extracts the selected date from the query parameters.
      - Initializes a filter to match todos with due dates that include the selected date.
      - If the requesting user is not an admin, adds a userId filter to restrict results to the user's own todos.
      - Uses `res.getModelList` to retrieve todos matching the filter and populates the `tagId` field.
      - Sends the retrieved todos along with additional details using `res.getModelListDetails`.
    */
    const selectedDate = req.query.date;

    // Check if selectedDate is provided
    if (!selectedDate) {
      return res.status(400).send({
        error: true,
        message: "Please provide a specific date time in date query",
      });
    }

    const parsedDate = parseISO(selectedDate);

    if (!isValid(parsedDate)) {
      return res
        .status(400)
        .send({ error: true, message: "Invalid date format" });
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

    const todos = await res.getModelList(Todo, listFilter, "tagId");
    res.send({
      error: false,
      details: await res.getModelListDetails(Todo, listFilter),
      data: todos,
    });
  },
  createTodo: async (req, res) => {
    /*
      - Extracts the necessary fields for a new todo from the request body.
      - Creates a new Todo object using the extracted fields and sets the userId to the ID of the requesting user.
      - Saves the new todo to the database.
      - Sends a response indicating the success of the creation operation along with the created todo data.
    */
    const { name, description, cardColor, repeat, priority, dueDates, tagId } =
      req.body;

    const newTodo = new Todo({
      name,
      description,
      cardColor,
      repeat,
      priority,
      dueDates,
      tagId,
      userId: req.user?.id,
    });

    const todo = await newTodo.save();
    res.send({
      error: false,
      message: "New Todo successfully created",
      data: todo,
    });
  },
  updateTodo: async (req, res) => {
    /*
      - Extracts the fields to update for the todo from the request body.
      - Finds the todo by ID from the database.
      - If the todo is not found, sets a 404 error status and throws an error.
      - If the requesting user is not the owner of the todo, sets a 401 error status and throws an error.
      - Updates the todo in the database with the provided fields.
      - Sends a response indicating the success of the update operation along with the updated todo data.
    */

    const {
      name,
      description,
      cardColor,
      repeat,
      priority,
      dueDates,
      tagId,
      isCompleted,
    } = req.body;

    let todo = await Todo.findById(req.params.id);

    if (!todo) {
      res.errorStatusCode = 404;
      throw new Error("Todo not found");
    }

    if (todo.userId.toString() !== (req.user?._id || req.user?.id)) {
      res.errorStatusCode = 401;
      throw new Error("Not authorized");
    }

    todo = await Todo.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          name,
          description,
          cardColor,
          repeat,
          priority,
          dueDates,
          tagId,
          isCompleted,
        },
      },
      { new: true }
    );

    res.send({
      error: false,
      message: "Todo successfully updated",
      data: todo,
    });
  },
  destroyTodo: async (req, res) => {
    /*
      - Finds the todo by ID from the database.
      - If the todo is not found, sets a 404 error status and throws an error.
      - If the requesting user is not the owner of the todo, sets a 401 error status and throws an error.
      - Deletes the todo from the database.
      - Sends a response indicating the success of the deletion operation.
    */

    let todo = await Todo.findOne({ _id: req.params.id });

    if (!todo) {
      res.errorStatusCode = 404;
      throw new Error("Todo not found");
    }

    if (todo.userId.toString() !== (req.user?._id || req.user?.id)) {
      res.errorStatusCode = 401;
      throw new Error("Not authorized");
    }

    await Todo.deleteOne({ _id: req.params.id });

    res.send({ error: false, message: "Todo successfully deleted" });
  },
};
