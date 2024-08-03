"use strict";

require("express-async-errors");
const express = require("express");
const app = express();
require("dotenv").config();
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const hpp = require("hpp");
const rateLimit = require("express-rate-limit");
const passport = require("passport");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const MongoStore = require("connect-mongo");

const PORT = process.env?.PORT || 8000;
const HOST = process.env?.HOST || "127.0.0.1";

// Connect to MongoDB
const { connectDB } = require("./src/configs/dbConnection");
connectDB();

// CORS Configs
const cors = require("cors");

const corsOptions = {
  origin: [
    process.env.CLIENT_URL,
    "http://localhost:3000",
    "http://127.0.0.1:3000",
  ],
  methods: ["GET", "POST", "PUT", "PATCH", "HEAD", "DELETE"],
  optionsSuccessStatus: 200,
  credentials: true,
};
app.use(cors(corsOptions));

// Set security HTTP headers
app.use(helmet()); // prevent local uploads?

// Limit requests from same IP
// const limiter = rateLimit({
//   max: 100,
//   windowMs: 60 * 60 * 1000,
//   message: "Too many request from this IP, please try again later!",
// });
// app.use("/", limiter);

// Authentication Config

require("./src/configs/auth/passportConfig");
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      collectionName: "sessions",
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 day
      httpOnly: true,
      secure: false, // Set secure to true if using HTTPS / after deployment
    },
  })
);

// setup passport
app.use(passport.initialize()); // integration between passportjs and express app
app.use(passport.session()); // session data controller

// Accept JSON: (Body parser) => reading data from body into req.body
app.use(express.json({ limit: "10kb" }));

// Accept FormData
app.use(express.urlencoded({ extended: false }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      "duration",
      "$ratingsQuantity",
      "ratingsAverage",
      "maxGroupSize",
      "difficulty",
      "price",
    ],
  })
);

// Logger:
app.use(require("./src/middlewares/logger"));

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

//Test middlewares
app.use((req, res, next) => {
  //res.setHeader('Access-Control-Allow-Origin', '*');
  //res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  //res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader("Cross-Origin-Resource-Policy", "same-site");
  next();
});

// Routers
app.use(require("./src/routers"));
// app.use("/", require("./src/routers/"));

// static files serve
// app.use("/uploads", express.static("./uploads"));

app.use((req, res, next) => {
  res.status(404).send({
    error: true,
    message: "Route not found!",
  });
});

// errorHandler
app.use(require("./src/middlewares/errorHandler"));

app.listen(PORT, () => console.log(`server runned on http://${HOST}:${PORT}`));

// random task creater = comment return in sync.js before run that
// require("./src/helpers/sync")(); //! be carefull!
