"use strict";

const router = require("express").Router();
const {
  list,
  read,
  create,
  destroy,
} = require("../controllers/tokenController");
const { isAdmin } = require("../middlewares/permissions");

// BASE_URL: /tokens

router.use(isAdmin);
router.route("/").get(list).post(create);
router.route("/:id").get(read).delete(destroy);

module.exports = router;
