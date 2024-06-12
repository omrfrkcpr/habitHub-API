"use strict";

const { sequelize, DataTypes } = require("../configs/db");

const Todo = sequelize.define("todos", {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  isDone: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  cardColor: {
    type: DataTypes.STRING,
  },
  tagName: {
    type: DataTypes.STRING,
  },
  repeatType: {
    type: DataTypes.STRING,
    defaultValue: "None",
  },
  priority: {
    type: DataTypes.BIGINT, // 0: normal, 1: important, 2: very important
    defaultValue: 0,
  },
});

// SYNC SEQUELIZE
// sequelize.sync(); // run once
// sequelize.sync({ force: true });
// sequelize.sync({ alter: true });

module.exports = Todo;
