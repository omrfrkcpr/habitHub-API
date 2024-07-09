"use strict";

const PORT = process.env?.PORT || 8000;
const HOST = process.env?.HOST || "127.0.0.1";
const { connectDB } = require("./src/configs/dbConnection");

require("express-async-error");
const express = require("express");
require("dotenv").config();

const app = express();

// Connect to MongoDB
connectDB();

const cors = require("cors");

app.use(
  cors({
    origin: [process.env.CLIENT_URL, "http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "PATCH", "HEAD", "DELETE"],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);

// Accept JSON:
app.use(express.json());

// Logger:
// app.use(require("./src/middlewares/logger"));

// Auhentication:
app.use(require("./src/middlewares/authentication"));

// findSearchSortPage / res.getModelList:
app.use(require("./src/middlewares/queryHandler"));

app.all("/", (req, res) => {
  res.send({
    error: false,
    message: "Welcome to HabitHub API",
    docs: {
      swagger: "/documents/swagger",
      redoc: "/documents/redoc",
      json: "/documents/json",
    },
    user: req.user,
  });
});

// Routers
app.use(require("./src/routers"));
app.use("/", require("./src/routes/"));

app.use((req, res, next) => {
  res.status(404).send({
    error: true,
    message: "Route not found!",
  });
});

// errorHandler
app.use(require("./src/middlewares/errorHandler"));

app.listen(PORT, () => console.log(`server runned on http://${HOST}:${PORT}`));
