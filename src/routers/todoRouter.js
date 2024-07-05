"use strict";

const router = require("express").Router();

const {
  listTodos,
  createTodo,
  updateTodo,
  destroyTodo,
} = require("../controllers/todoController");
const { isLogin } = require("../middlewares/permissions");

// BASE_URL = /todos

router.use(isLogin);
router.route("/").get(listTodos).post(createTodo);
router.route("/:id").put(updateTodo).delete(destroyTodo);

module.exports = router;
