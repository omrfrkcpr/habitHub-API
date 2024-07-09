"use strict";

// app.use(errorHandler)

module.exports = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).send({
    error: true,
    message: err.message,
    cause: err.cause,
    body: req.body,
  });
};
