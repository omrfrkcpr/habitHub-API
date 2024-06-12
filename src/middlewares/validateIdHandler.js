const Todo = require("../models/todoModel");

module.exports = async (req, res, next) => {
  const todo = await Todo.findByPk(req.params.id);
  if (todo) {
    next();
  } else {
    res.errorStatusCode = 404;
    throw new Error("Todo info not found", {
      cause: `Sent todo id info: ${req.params.id}`,
    });
  }
};
