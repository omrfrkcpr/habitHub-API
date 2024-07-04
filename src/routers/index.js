"use strict";

const router = require("express").Router();

router.use("/auth", require("./authRouter"));

module.exports = router;
