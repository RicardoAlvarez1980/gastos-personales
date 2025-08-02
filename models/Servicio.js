const Servicio = sequelize.define('Servicio', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true, // Le decimos a Sequelize que la DB genera el ID
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
