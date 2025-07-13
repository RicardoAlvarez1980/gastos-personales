const { Gasto, Sequelize } = require('../models');
const { fn, col } = require('sequelize');

async function obtenerTotalesAnualesGlobales() {
  const resultados = await Gasto.findAll({
    attributes: [
      'año',
      [fn('SUM', col('importe')), 'total_gastos']
    ],
    group: ['año'],
    order: [['año', 'ASC']]
  });

  return resultados.map(r => ({
    año: r.año,
    total_gastos: parseFloat(r.get('total_gastos'))
  }));
}

async function obtenerTotalesAnualesPorServicio() {
  const resultados = await Gasto.findAll({
    attributes: [
      'año',
      'servicio_id',
      [fn('SUM', col('importe')), 'total']
    ],
    include: {
      model: require('../models/Servicio'),
      attributes: ['id', 'nombre']
    },
    group: ['Gasto.año', 'Gasto.servicio_id', 'Servicio.id', 'Servicio.nombre'],
    order: [['año', 'ASC'], ['servicio_id', 'ASC']]
  });

  return resultados.map(r => ({
    servicio: r.Servicio.nombre,
    año: r.año,
    total: parseFloat(r.dataValues.total)
  }));
}

async function obtenerTotalesPorServicioEnAño(año) {
  const resultados = await Gasto.findAll({
    where: { año },
    attributes: [
      'servicio_id',
      [fn('SUM', col('importe')), 'total']
    ],
    include: {
      model: require('../models/Servicio'),
      attributes: ['nombre']
    },
    group: ['servicio_id', 'Servicio.id', 'Servicio.nombre'],
    order: [[fn('SUM', col('importe')), 'DESC']]
  });

  return resultados.map(r => ({
    servicio: r.Servicio.nombre,
    total: parseFloat(r.dataValues.total)
  }));
}

async function obtenerTotalesMensualesPorAño(año) {
  const resultados = await Gasto.findAll({
    where: { año },
    attributes: [
      'mes',
      [fn('SUM', col('importe')), 'total']
    ],
    group: ['mes'],
    order: [['mes', 'ASC']]
  });

  return resultados.map(r => ({
    mes: r.mes,
    total: parseFloat(r.get('total'))
  }));
}

module.exports = {
  obtenerTotalesAnualesGlobales,
  obtenerTotalesAnualesPorServicio,
  obtenerTotalesPorServicioEnAño,
  obtenerTotalesMensualesPorAño,
};
