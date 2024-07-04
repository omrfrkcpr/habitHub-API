"use strict";

const router = require("express").Router();
const {
  list,
  read,
  update,
  destroy,
} = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");

router.get("/", authMiddleware, list);
router.route("/:id").all(authMiddleware).get(read).put(update).delete(destroy);

module.exports = router;
