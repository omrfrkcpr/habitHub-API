"use strict";

const router = require("express").Router();

const {
  listTasks,
  createTask,
  readTask,
  updateTask,
  destroyTask,
  sendTasks,
} = require("../controllers/taskController");
const { isLogin, isTaskOwnerOrAdmin } = require("../middlewares/permissions");
const idValidation = require("../middlewares/idValidation");

// BASE_URL = /tasks

router.route("/").get(isLogin, listTasks).post(isLogin, createTask);
router.route("/email").post(isLogin, sendTasks);

router
  .route("/:id")
  .all(idValidation("Task"), isTaskOwnerOrAdmin)
  .get(readTask)
  .put(updateTask)
  .patch(updateTask)
  .delete(destroyTask);

module.exports = router;
