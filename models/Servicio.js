const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Servicio = sequelize.define('Servicio', {
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'servicios',
  timestamps: false
});

module.exports = Servicio;
