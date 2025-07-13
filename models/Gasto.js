const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Gasto = sequelize.define('Gasto', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true, // 👈 Esto hace la magia
  },
  servicio_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  año: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  mes: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  importe: {
    type: DataTypes.FLOAT,
    allowNull: false
  }
}, {
  tableName: 'gastos',
  timestamps: false
});

module.exports = Gasto;
