"use strict";

const router = require("express").Router();

router.use("/auth", require("./authRouter"));
router.use("/todos", require("./todoRouter"));
router.use("/tags", require("./tagRouter"));
router.use("/users", require("./userRouter"));
router.use("/tokens", require("./tokenRouter"));

module.exports = router;
