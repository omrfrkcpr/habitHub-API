"use strict";

const Tag = require("../models/tagModel");
const Todo = require("../models/todoModel");

module.exports = {
  listTags: async (req, res) => {
    /*
      - Determines the filter based on whether the requesting user (req.user) is an admin.
      - If the user is not an admin, sets the filter to only include tags owned by the user.
      - Fetches the list of tags from the database using the filter.
      - Sends the fetched tags in the response with a 200 status code.
    */
    let listFilter = {};

    if (!req.user.isAdmin) {
      listFilter.userId = req.user._id || req.user.id;
    }

    const tags = await res.getModelList(Tag, listFilter);
    res.status(200).send({ error: false, data: tags });
  },
  listTagTodos: async (req, res) => {
    /*
      - Sets the filter to fetch todos associated with a specific tag ID.
      - If the user is not an admin, adds a condition to the filter to only include todos owned by the user.
      - Fetches the list of todos from the database using the filter.
      - Sends the fetched todos and additional details in the response.
    */
    const listFilter = {
      tagId: req.params.id,
    };

    if (!req.user.isAdmin) {
      listFilter.userId = req.user._id || req.user.id;
    }

    const todos = await res.getModelList(Todo, listFilter);
    // .sort({ priority: -1 }); // from high to low priority
    res.send({
      error: false,
      details: await res.getModelListDetails(Todo, listFilter),
      data: todos,
    });
  },
  createTag: async (req, res) => {
    /*
      - Extracts the tag name from the request body.
      - Creates a new tag with the extracted name and the user ID of the requesting user.
      - Saves the new tag to the database.
      - Sends a response indicating the success of the creation operation with a 201 status code.
    */
    const { name } = req.body;
    const tag = new Tag({ name, userId: req.user._id || req.user.id });
    await tag.save();
    res.status(201).send({
      error: false,
      message: "New Tag successfully created",
      data: tag,
    });
  },
  readTag: async (req, res) => {
    /*
      - Tries to find the tag by ID from the database.
      - Checks if the tag exists and if the requesting user is the owner of the tag or an admin.
      - Sends the tag data in the response with a 200 status code if the tag is found and the user is authorized.
      - If the tag is not found or the user is not authorized, sends a 404 status code with a "Tag not found" message.
    */
    const tag = await Tag.findOne({ _id: req.params.id });
    if (
      !tag ||
      (!req.user.isAdmin && tag.userId.toString() !== req.user._id.toString())
    ) {
      res.errorStatusCode = 404;
      throw new Error("Tag not found");
    }
    res.status(200).send({ error: false, data: tag });
  },
  updateTag: async (req, res) => {
    /*
      - Tries to find the tag by ID from the database.
      - Checks if the tag exists and if the requesting user is the owner of the tag or an admin.
      - Updates the tag name if provided in the request body.
      - Saves the updated tag to the database.
      - Sends a response indicating the success of the update operation with a 200 status code.
      - If the tag is not found or the user is not authorized, sends a 404 status code with a "Tag not found" message.
    */
    const tag = await Tag.findOne({ _id: req.params.id });
    if (
      !tag ||
      (!req.user.isAdmin && tag.userId.toString() !== req.user._id.toString())
    ) {
      res.errorStatusCode = 404;
      throw new Error("Tag not found");
    }

    tag.name = req.body.name || tag.name;
    await tag.save();
    res.status(200).send({
      error: false,
      message: "Tag successfully updated",
      data: tag,
    });
  },
  destroyTag: async (req, res) => {
    /*
      - Tries to find the tag by ID from the database.
      - Checks if the tag exists and if the requesting user is the owner of the tag or an admin.
      - Deletes the tag from the database.
      - Sends a response indicating the success of the deletion operation with a 200 status code.
      - If the tag is not found or the user is not authorized, sends a 404 status code with a "Tag not found" message.
    */
    const tag = await Tag.findOne({ _id: req.params.id });
    if (
      !tag ||
      (!req.user.isAdmin && tag.userId.toString() !== req.user._id.toString())
    ) {
      res.errorStatusCode = 404;
      throw new Error("Tag not found");
    }

    await tag.remove();
    res.status(200).send({ error: false, message: "Tag successfully deleted" });
  },
};
