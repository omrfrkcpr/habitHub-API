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
  // socialLogin,
  authSuccess,
} = require("../controllers/authController");
const passport = require("passport");

// BASE_URL: /auth

const client_url = process.env.CLIENT_URL;

router.post("/register", register);
router.post("/verify-email/:token", verifyEmail);
router.post("/login", login);
router.get("/logout", logout);

router.post("/refresh", refresh);
router.post("/forgot", forgot);
router.post("/reset/:token", reset);

// Twitter authentication routes
router.get("/twitter", passport.authenticate("twitter"));
router.get(
  "/twitter/callback",
  passport.authenticate("twitter", {
    session: true,
    // successRedirect: `${client_url}/auth/success?provider=twitter`,
    failureRedirect: `${client_url}/auth/failure`,
  }),
  authSuccess
);

// Google authentication routes
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: true,
    // successRedirect: `${client_url}/auth/success?provider=google`,
    failureRedirect: `${client_url}/auth/failure`,
  }),
  authSuccess
);

// GitHub authentication routes
router.get("/github", passport.authenticate("github"));
router.get(
  "/github/callback",
  passport.authenticate("github", {
    session: true,
    // successRedirect: `${client_url}/auth/success?provider=github`,
    failureRedirect: `${client_url}/auth/failure`,
  }),
  authSuccess
);

// router.get("/login/success", socialLogin);

module.exports = router;
