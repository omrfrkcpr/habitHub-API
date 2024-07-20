"use strict";

const router = require("express").Router();
const {
  listTags,
  listTagTasks,
  createTag,
  readTag,
  updateTag,
  destroyTag,
} = require("../controllers/tagController");
const { isLogin, isTagOwnerOrAdmin } = require("../middlewares/permissions");
const idValidation = require("../middlewares/idValidation");

// BASE_URL = /tags

router.route("/").all(isLogin).get(listTags).post(createTag);
router
  .route("/:id")
  .all(idValidation("Tag"), isTagOwnerOrAdmin)
  .get(readTag)
  .put(updateTag)
  .patch(updateTag)
  .delete(destroyTag);

router.get("/:id/tasks", listTagTasks);

module.exports = router;
