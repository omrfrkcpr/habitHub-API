"use strict";

const router = require("express").Router();
const {
  register,
  login,
  refresh,
  reset,
  forgot,
  verifyEmail,
  logout,
} = require("../controllers/authController");

// BASE_URL: /auth

router.post("/register", register);
router.get("/verify-email/:token", verifyEmail);
router.post("/login", login);
router.get("/logout", logout);

router.post("/refresh", refresh);
router.post("/forgot", forgot);
router.post("/reset/:token", reset);

module.exports = router;
