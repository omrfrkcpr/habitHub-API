"use strict";

const router = require("express").Router();

const {
  create,
  list,
  update,
  destroy,
} = require("../controllers/todoController");
const { isLogin } = require("../middlewares/permissions");

// BASE_URL = /todos

router.use(isLogin);
router.route("/").get(list).post(create);
router.route("/:id").put(update).delete(destroy);

module.exports = router;
