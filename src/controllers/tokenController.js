"use strict";

const Token = require("../models/tokenModel");

module.exports = {
  // GET
  listTokens: async (req, res) => {
    // #swagger.ignore = true

    const data = await res.getModelList(Token);

    res.status(200).send({
      error: false,
      details: await res.getModelListDetails(Token),
      data,
    });
  },

  // POST
  createToken: async (req, res) => {
    // #swagger.ignore = true

    const data = await Token.create(req.body);

    res.status(201).send({
      error: false,
      data,
    });
  },

  // /:id -> GET
  readToken: async (req, res) => {
    // #swagger.ignore = true

    const data = await Token.findOne({ _id: req.params.id });

    res.status(200).send({
      error: false,
      data,
    });
  },

  // /:id -> DELETE
  destroyToken: async (req, res) => {
    // #swagger.ignore = true

    const data = await Token.deleteOne({ _id: req.params.id });

    res.status(data.deletedCount ? 204 : 404).send({
      error: !data.deletedCount,
      message: data.deletedCount
        ? "Token successfully deleted"
        : "Token not found",
      data,
    });
  },
};
