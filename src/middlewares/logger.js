"use strict";

/* -------------------------------------------------------------------------- */
// $ npm i morgan
/* -------------------------------------------------------------------------- */

const morgan = require("morgan");
const fs = require("node:fs");

// app.use(logger):

const now = new Date();
const today = now.toISOString().split("T")[0];

module.exports = morgan("combined", {
  stream: fs.createWriteStream(`./logs/${today}.log`, { flags: "a+" }),
});
