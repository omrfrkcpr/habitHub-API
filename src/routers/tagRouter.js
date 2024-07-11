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
const { isLogin, isTagOwnerOrAdmin } = require("../middlewares/permissions");
const { idValidation } = require("../middlewares/idValidation");

// BASE_URL = /tags

router.route("/").all(isLogin).get(listTags).get(listTagTodos).post(createTag);
router
  .route("/:id")
  .all(idValidation("Tag"), isTagOwnerOrAdmin)
  .get(readTag)
  .put(updateTag)
  .patch(updateTag)
  .delete(destroyTag);

module.exports = router;
