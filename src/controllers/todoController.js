"use strict";

const Todo = require("../models/todoModel");

module.exports = {
  list: async (req, res) => {
    try {
      const todos = await Todo.find({ userId: req.user.id });
      res.json(todos);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  },
  create: async (req, res) => {
    const { name, description, cardColor, repeat, priority, dueDates, tagId } =
      req.body;

    try {
      const newTodo = new Todo({
        name,
        description,
        cardColor,
        repeat,
        priority,
        dueDates,
        tagId,
        userId: req.user.id,
      });

      const todo = await newTodo.save();
      res.json(todo);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  },
  update: async (req, res) => {
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

    try {
      let todo = await Todo.findById(req.params.id);

      if (!todo) {
        return res.status(404).json({ message: "Todo not found" });
      }

      if (todo.userId.toString() !== req.user.id) {
        return res.status(401).json({ message: "Not authorized" });
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

      res.json(todo);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  },
  destroy: async (req, res) => {
    try {
      let todo = await Todo.findById(req.params.id);

      if (!todo) {
        return res.status(404).json({ message: "Todo not found" });
      }

      if (todo.userId.toString() !== req.user.id) {
        return res.status(401).json({ message: "Not authorized" });
      }

      await Todo.findByIdAndRemove(req.params.id);

      res.json({ message: "Todo removed" });
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  },
};
