// db.jsconconst sequelize = require('../db');st sequelize = require('../db');
const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  protocol: 'postgres',
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false, // importante para no fallar en SSL auto-firmados
    },
  },
});

module.exports = sequelize;
