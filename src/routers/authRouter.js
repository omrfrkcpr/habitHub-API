"use strict";

const router = require("express").Router();
const {
  register,
  login,
  refresh,
  reset,
  logout,
} = require("../controllers/authController");

// BASE_URL: /auth

router.post("/register", register);
router.post("/login", login);
router.get("/logout", logout);

router.post("/refresh", refresh);
router.post("/reset", reset);

module.exports = router;
