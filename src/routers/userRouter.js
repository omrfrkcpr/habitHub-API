"use strict";

const router = require("express").Router();
const {
  listUsers,
  readUser,
  updateUser,
  createUser,
  destroyUser,
} = require("../controllers/userController");
const { isAdmin, isAdminOrOwn } = require("../middlewares/permissions");
const idValidation = require("../middlewares/idValidation");
const upload = require("../middlewares/upload");

// BASE_URL: /users

router
  .route("/")
  .get(isAdmin, listUsers)
  .post(upload.single("avatar"), createUser);
router
  .route("/:id")
  .all(idValidation("User"), isAdminOrOwn)
  .get(readUser)
  .put(upload.single("avatar"), updateUser)
  .patch(upload.single("avatar"), updateUser)
  .delete(destroyUser);

module.exports = router;
