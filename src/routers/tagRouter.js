"use strict";

const router = require("express").Router();
const {
  listTags,
  listTagTodos,
  createTag,
  readTag,
  updateTag,
  destroyTag,
} = require("../controllers/tagController");
const { isLogin, isAdminOrOwn } = require("../middlewares/permissions");

// BASE_URL = /tags

router.route("/").all(isLogin).get(listTags).get(listTagTodos).post(createTag);
router
  .route("/:id")
  .all(idValidation, isAdminOrOwn)
  .get(readTag)
  .put(updateTag)
  .delete(destroyTag);

module.exports = router;
