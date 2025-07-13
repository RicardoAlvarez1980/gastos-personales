const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Gasto = sequelize.define('Gasto', {
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
