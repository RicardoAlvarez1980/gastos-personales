const { Gasto, Servicio } = require('../models');
const { fn, col } = require('sequelize');

const listarGastosCompletos = async () => {
  const gastos = await Gasto.findAll({
    include: { model: Servicio, attributes: ['nombre'] },
    order: [['año', 'ASC'], ['mes', 'ASC']]
  });

  return gastos.map(g => ({
    servicio: g.Servicio.nombre,
    año: g.año,
    mes: g.mes,
    importe: g.importe
  }));
};

const listarGastosPorAño = async (año) => {
  const gastos = await Gasto.findAll({
    where: { año },
    include: { model: Servicio, attributes: ['nombre'] },
    order: [['mes', 'ASC']]
  });

  return gastos.map(g => ({
    servicio: g.Servicio.nombre,
    mes: g.mes,
    importe: g.importe
  }));
};

const listarGastosPorAñoMes = async (año, mes) => {
  const gastos = await Gasto.findAll({
    where: { año, mes },
    include: { model: Servicio, attributes: ['nombre'] },
    order: [['servicio_id', 'ASC']]
  });

  return gastos.map(g => ({
    servicio: g.Servicio.nombre,
    importe: g.importe
  }));
};

const crearGasto = async (datosGasto) => {
  return await Gasto.create(datosGasto);
};

module.exports = {
  listarGastosCompletos,
  listarGastosPorAño,
  listarGastosPorAñoMes,
  crearGasto
};
