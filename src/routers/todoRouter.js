"use strict";

const router = require("express").Router();

const {
  listTodos,
  createTodo,
  readTodo,
  updateTodo,
  destroyTodo,
} = require("../controllers/todoController");
const { isLogin, isTodoOwnerOrAdmin } = require("../middlewares/permissions");
const idValidation = require("../middlewares/idValidation");

// BASE_URL = /todos

router.route("/").get(isLogin, listTodos).post(isLogin, createTodo);
router
  .route("/:id")
  .all(idValidation("Todo"), isTodoOwnerOrAdmin)
  .get(readTodo)
  .put(updateTodo)
  .patch(updateTodo)
  .delete(destroyTodo);

module.exports = router;
