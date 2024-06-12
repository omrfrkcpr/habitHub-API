"use strict";

const moment = require("moment");
const Todo = require("../models/todoModel");

//* CRUD OPERATIONS
module.exports = {
  list: async (req, res) => {
    const todos = await Todo.findAndCountAll();
    // const todos = await Todo.findAll();
    if (todos) {
      res.status(200).send({
        error: false,
        status: true,
        data: todos,
      });
    } else {
      res.errorStatusCode = 404;
      throw new Error("No Tasks found", {
        cause: `Please create a task first`,
      });
    }
  },
  create: async (req, res) => {
    const {
      title,
      description,
      date,
      isDone,
      cardColor,
      tagName,
      repeatType,
      priority,
    } = req.body;

    const parsedDate = moment(date, "DD/MM/YYYY", true);
    if (!parsedDate.isValid()) {
      return res.status(400).json({ error: "Invalid date format" });
    }
    const formattedDate = parsedDate.toISOString();

    const newTodo = await Todo.create({
      title,
      description,
      date: formattedDate,
      isDone,
      cardColor,
      tagName,
      repeatType,
      priority,
    });
    res.status(201).send({
      error: false,
      status: true,
      data: newTodo,
    });
  },
  read: async (req, res) => {
    // const todo = await Todo.findOne({where: {id: req.params.id}});
    const todo = await Todo.findByPk(req.params.id);
    res.send({
      error: false,
      status: true,
      data: todo,
    });
  },
  update: async (req, res) => {
    const { id } = req.params;
    const todo = await Todo.findByPk(id);
    const updatedTodo = await todo.update(req.body);
    res.send({
      error: false,
      status: true,
      message: `Your task is successfully updated`,
      updatedTodo,
    });
  },
  destroy: async (req, res) => {
    const { id } = req.params;
    const todo = await Todo.findByPk(id);

    await todo.destroy();
    res.send({
      error: false,
      status: true,
      message: `Your Task with id number ${id} is successfully deleted`,
    });
  },

  // TASKS
  //* getUnclosedTasks
};
