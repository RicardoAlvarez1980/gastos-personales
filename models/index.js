const sequelize = require('../db');
const Gasto = require('./Gasto');
const Servicio = require('./Servicio');

// 🔄 Relaciones
Servicio.hasMany(Gasto, { foreignKey: 'servicio_id' });
Gasto.belongsTo(Servicio, { foreignKey: 'servicio_id' });

module.exports = { sequelize, Gasto, Servicio };    