// models/Servicio.js
import sequelize from '../db.js';
import { DataTypes } from 'sequelize';

const Servicio = sequelize.define('Servicio', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true, // Que la DB genere el ID automáticamente
    allowNull: false,
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