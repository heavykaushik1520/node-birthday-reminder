const { Sequelize } = require('sequelize');
require('dotenv').config(); // Ensure dotenv is loaded here as well if this file is imported first

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql', // Confirmed MySQL
    logging: false, // Set to true for debugging SQL queries
  }
);

module.exports = sequelize;