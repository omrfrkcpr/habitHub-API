"use strict";

const router = require("express").Router();
const {
  create,
  list,
  read,
  update,
  destroy,
} = require("../controllers/tagController");
const { isLogin } = require("../middlewares/permissions");

// BASE_URL = /tags

router.use(isLogin);
router.route("/").get(list).post(create);
router.route("/:id").get(read).put(update).delete(destroy);

module.exports = router;
