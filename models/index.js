import Gasto from './Gasto.js';
import Servicio from './Servicio.js';

// Relaciones
Gasto.belongsTo(Servicio, { as: 'Servicio', foreignKey: 'servicio_id' });
Servicio.hasMany(Gasto, { as: 'Gastos', foreignKey: 'servicio_id' });

export { Gasto, Servicio };
