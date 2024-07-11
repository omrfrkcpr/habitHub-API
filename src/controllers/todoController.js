"use strict";

const Todo = require("../models/todoModel");
const { parseISO, startOfDay, endOfDay, isValid } = require("date-fns");
const { CustomError } = require("../errors/customError");

module.exports = {
  // GET
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

    const todos = await res.getModelList(Todo, listFilter, [
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
      details: await res.getModelListDetails(Todo, listFilter),
      data: todos,
    });
  },
  // POST
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
      userId: req.user.isAdmin
        ? req.body.userId // userId must be provided in the request body by an admin
        : req.user?.id || req.user?._id,
    });

    const todo = await newTodo.save();
    res.send({
      error: false,
      message: "New Todo successfully created",
      data: todo,
    });
  },
  // GET /:id
  readTodo: async (req, res) => {
    /*
      - Finds the todo by ID from the database.
      - If the user is not an admin, ensures the todo belongs to the requesting user by adding userId to the query filter.
      - Populates the `userId` and `tagId` fields of the retrieved todo for detailed information.
        - `userId`: Populates with user details excluding the `__v` field.
        - `tagId`: Populates with tag details including only the `name` field.
      - Sends a response indicating the success of the retrieval operation along with the retrieved todo data.
        - `error`: false, indicating the operation was successful.
        - `data`: the retrieved todo object, populated with user and tag details.
    */

    const todo = await Todo.findOne({ _id: req.params.id }).populate([
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
      data: todo,
    });
  },
  // /:id => PUT / PATCH
  updateTodo: async (req, res) => {
    /*
      - Extracts the fields to update for the todo from the request body.
      - Updates the todo in the database with the provided fields.
      - Sends a response indicating the success of the update operation along with the updated todo data.
    */

    const updatedTodo = await Todo.updateOne({ _id: req.params.id }, req.body, {
      runValidators: true,
      new: true,
    });

    res.status(updatedTodo.modifiedCount ? 202 : 404).send({
      error: !updatedTodo.modifiedCount,
      message: updatedTodo.modifiedCount
        ? "Todo successfully updated"
        : "Todo not found",
      new: updatedTodo,
    });
  },
  // /:id => DELETE
  destroyTodo: async (req, res) => {
    /*
      - Finds the todo by ID from the database.
      - If the todo is not found, sets a 404 error status and throws an error.
      - If the requesting user is not the owner of the todo, sets a 401 error status and throws an error.
      - Deletes the todo from the database.
      - Sends a response indicating the success of the deletion operation.
    */

    const todo = await Todo.deleteOne({ _id: req.params.id });

    res.status(todo.deletedCount ? 204 : 404).send({
      error: !todo.deletedCount,
      message: todo.deletedCount
        ? "Todo successfully deleted"
        : "Todo not found",
    });
  },
};
