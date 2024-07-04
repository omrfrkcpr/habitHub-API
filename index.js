"use strict";

const PORT = process.env?.PORT || 8000;
const HOST = process.env?.HOST || "127.0.0.1";

require("express-async-error");
const express = require("express");
require("dotenv").config();

const app = express();
app.use(express.json());

const cors = require("cors");

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST", "PUT", "PATCH", "HEAD", "DELETE"],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);

app.all("/", (req, res) => {
  res.send("Welcome to HabitHub API");
});

// Routers
app.use(require("./src/routers/todoRouter"));

// Middlewares
app.use(require("./src/middlewares/errorHandler"));

app.listen(PORT, () => console.log(`server runned on http://${HOST}:${PORT}`));
