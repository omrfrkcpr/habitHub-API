"use strict";

//* express to DB connection
const { Sequelize, DataTypes } = require("sequelize");

const postgre_username = process.env.POSTGRE_USERNAME;
const postgre_password = process.env.POSTGRE_PASSWORD;
const postgre_port = process.env.POSTGRE_PORT;
const postgre_database_name = process.env.POSTGRE_DATABASE_NAME;

// sequelize = new Sequelize("postgres://USERNAME:PASSWORD@HOST:PORT/todo");
const sequelize = new Sequelize(
  `postgres://${postgre_username}:${postgre_password}@${process.env.HOST}:${postgre_port}/${postgre_database_name}`
);

(async () => {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
})(); // IIFE



module.exports = { sequelize, DataTypes };
