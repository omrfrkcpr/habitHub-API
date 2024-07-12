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

// BASE_URL: /users

router.route("/").get(isAdmin, listUsers).post(createUser);
router
  .route("/:id")
  .all(idValidation("User"), isAdminOrOwn)
  .get(readUser)
  .put(updateUser)
  .patch(updateUser)
  .delete(destroyUser);

module.exports = router;
