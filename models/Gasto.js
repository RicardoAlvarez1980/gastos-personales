// models/Gasto.js
import sequelize from '../db.js';
import { DataTypes } from 'sequelize';
import Servicio from './Servicio.js';

const Gasto = sequelize.define('Gasto', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    defaultValue: sequelize.literal('unique_rowid()'),
    allowNull: false,
  },
  servicio_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  año: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  mes: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 12,
    },
  },
  importe: {
    type: DataTypes.DECIMAL(10,2),
    allowNull: false,
  },
}, {
  tableName: 'gastos',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['servicio_id', 'año', 'mes'],
    },
  ],
});

export default Gasto;
