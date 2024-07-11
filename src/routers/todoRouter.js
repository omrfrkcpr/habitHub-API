"use strict";

const router = require("express").Router();

const {
  listTodos,
  createTodo,
  updateTodo,
  destroyTodo,
} = require("../controllers/todoController");
const { isLogin, isAdminOrOwn } = require("../middlewares/permissions");
const { idValidation } = require("../middlewares/idValidation");

// BASE_URL = /todos

router.route("/").get(isLogin, listTodos).post(isLogin, createTodo);
router
  .route("/:id")
  .all(idValidation, isAdminOrOwn)
  .put(updateTodo)
  .patch(updateTodo)
  .delete(destroyTodo);

module.exports = router;
