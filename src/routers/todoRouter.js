"use strict";

const router = require("express").Router();

const {
  list,
  create,
  read,
  update,
  destroy,
} = require("../controllers/todoController");
const validateIdHandler = require("../middlewares/validateIdHandler");

router.route("/todos").get(list).post(create);

router
  .route("/todos/:id")
  .all(validateIdHandler)
  .get(read)
  .put(update)
  .patch()
  .delete(destroy);

module.exports = router;
