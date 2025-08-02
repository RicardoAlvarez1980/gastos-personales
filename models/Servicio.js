// models/Servicio.js
import sequelize from '../db.js';
import { DataTypes } from 'sequelize';

const Servicio = sequelize.define('Servicio', {
  id: {
    type: DataTypes.INTEGER,      // Cambié a INTEGER para ids chicos
    primaryKey: true,
    allowNull: false,
    autoIncrement: false,         // Importante para que no auto-genere ids gigantes
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
  },
}, {
  tableName: 'servicios',
  timestamps: false,
});

export default Servicio;
