"use strict";

const PORT = process.env?.PORT || 8000;
const HOST = process.env?.HOST || "127.0.0.1";

const express = require("express");
require("express-async-error");
const app = express();
app.use(express.json());
require("dotenv").config();

// Middlewares
app.use(require("./src/routers/todoRouter"));
app.use(require("./src/middlewares/errorHandler"));

app.listen(PORT, () => console.log(`server runned on http://${HOST}:${PORT}`));
