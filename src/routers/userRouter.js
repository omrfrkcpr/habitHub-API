"use strict";

const router = require("express").Router();
const {
  list,
  read,
  update,
  destroy,
} = require("../controllers/userController");
const { isAdmin, isLogin } = require("../middlewares/permissions");

// BASE_URL: /users

router.route("/").get(isAdmin, list).post(create);
router.route("/:id").all(isLogin).get(read).put(update).delete(destroy);

module.exports = router;
