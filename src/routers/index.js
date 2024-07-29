"use strict";

const router = require("express").Router();

router.use("/auth", require("./authRouter"));
router.use("/tasks", require("./taskRouter"));
router.use("/tags", require("./tagRouter"));
router.use("/users", require("./userRouter"));
router.use("/documents", require("./documentRouter"));
router.use("/tokens", require("./tokenRouter"));

module.exports = router;
