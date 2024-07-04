"use strict";

const router = require("express").Router();

const {
  create,
  list,
  update,
  destroy,
} = require("../controllers/todoController");
const authMiddleware = require("../middlewares/authMiddleware");

router.route("/").all(authMiddleware).get(list).post(create);
router.route("/:id").all(authMiddleware).put(update).delete(destroy);

module.exports = router;
