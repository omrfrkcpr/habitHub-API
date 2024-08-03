"use strict";

const { mongoose } = require("../configs/dbConnection");
const { CustomError } = require("../errors/customError");

module.exports = () => {
  return (req, res, next) => {
    const idIsValid = mongoose.Types.ObjectId.isValid(req.params.id); //* built-in method
    if (!idIsValid) {
      throw new CustomError(`Invalid Id`, 400);
    }
    next();
  };
};
