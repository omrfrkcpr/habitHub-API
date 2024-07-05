"use strict";

const router = require("express").Router();
const {
  listTags,
  createTag,
  readTag,
  updateTag,
  destroyTag,
} = require("../controllers/tagController");
const { isLogin } = require("../middlewares/permissions");

// BASE_URL = /tags

router.use(isLogin);
router.route("/").get(listTags).post(createTag);
router.route("/:id").get(readTag).put(updateTag).delete(destroyTag);

module.exports = router;
