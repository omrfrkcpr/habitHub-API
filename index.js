"use strict";

require("express-async-errors");
const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");

require("dotenv").config();
const session = require("express-session");
const passport = require("passport");

const PORT = process.env?.PORT || 8000;
const HOST = process.env?.HOST || "127.0.0.1";

// Connect to MongoDB
const { connectDB } = require("./src/configs/dbConnection");
connectDB();

// CORS Configs
const cors = require("cors");
const corsOptions = {
  origin: [process.env.CLIENT_URL, "http://localhost:3000"],
  methods: ["GET", "POST", "PUT", "PATCH", "HEAD", "DELETE"],
  optionsSuccessStatus: 200,
  credentials: true,
};
app.use(cors(corsOptions));

// Authentication Config
require("./src/configs/auth/passport");
app.use(
  session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: true,
    // cookie: { secure: false }, // Set secure to true if using HTTPS
  })
);

// setup passport
app.use(passport.initialize());
app.use(passport.session());

// Accept JSON:
app.use(express.json());

// Use cookie-parser middleware
app.use(cookieParser());

app.use(express.urlencoded({ extended: false }));

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
// app.use("/", require("./src/routers/"));

app.use((req, res, next) => {
  res.status(404).send({
    error: true,
    message: "Route not found!",
  });
});

// errorHandler
app.use(require("./src/middlewares/errorHandler"));

app.listen(PORT, () => console.log(`server runned on http://${HOST}:${PORT}`));
