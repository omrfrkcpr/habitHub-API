"use strict";

const Tag = require("../models/tagModel");
const Todo = require("../models/todoModel");

module.exports = {
  listTags: async (req, res) => {
    try {
      const tags = await Tag.find({ userId: req.user._id });
      res.status(200).json(tags);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },
  createTag: async (req, res) => {
    try {
      const { name } = req.body;
      const tag = new Tag({ name, userId: req.user._id });
      await tag.save();
      res.status(201).json(tag);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },
  readTag: async (req, res) => {
    try {
      const tag = await Tag.findById(req.params.id);
      if (!tag || tag.userId.toString() !== req.user._id.toString()) {
        return res.status(404).json({ message: "Tag not found" });
      }
      res.status(200).json(tag);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },
  updateTag: async (req, res) => {
    try {
      const tag = await Tag.findById(req.params.id);
      if (!tag || tag.userId.toString() !== req.user._id.toString()) {
        return res.status(404).json({ message: "Tag not found" });
      }

      tag.name = req.body.name || tag.name;
      await tag.save();
      res.status(200).json(tag);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },
  destroyTag: async (req, res) => {
    try {
      const tag = await Tag.findById(req.params.id);
      if (!tag || tag.userId.toString() !== req.user._id.toString()) {
        return res.status(404).json({ message: "Tag not found" });
      }

      await Todo.deleteMany({ tagId: tag._id });
      await tag.remove();
      res
        .status(200)
        .json({ message: "Tag and related todos deleted successfully" });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },
};
