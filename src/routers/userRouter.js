"use strict";

const router = require("express").Router();
const {
  listUsers,
  readUser,
  updateUser,
  createUser,
  agreeContract,
  destroyUser,
  // socialLogin,
  handleFeedback,
} = require("../controllers/userController");
const { isAdmin, isUserOwnerOrAdmin } = require("../middlewares/permissions");
const idValidation = require("../middlewares/idValidation");
// const upload = require("../middlewares/localUpload");
const { upload, uploadToS3 } = require("../middlewares/awsS3Upload");
const { emailLimiter } = require("../middlewares/rateLimiters");

// BASE_URL: /users

router
  .route("/")
  .get(isAdmin, listUsers)
  .post(upload.single("avatar"), uploadToS3, createUser);

router.put("/agree-contract/:userId", agreeContract);
router.post("/feedback", emailLimiter, handleFeedback);

router
  .route("/:id")
  .all(idValidation, isUserOwnerOrAdmin)
  .get(readUser)
  .put(upload.single("avatar"), uploadToS3, updateUser)
  .patch(upload.single("avatar"), uploadToS3, updateUser)
  .delete(destroyUser);

module.exports = router;
