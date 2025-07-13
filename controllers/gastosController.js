const path = require('path');
const gastosService = require(path.resolve(__dirname, '../services/gastosService'));

const { gastoSchema } = require('../validators/gastoValidator');

const getGastosCompletos = async (req, res) => {
  try {
    const gastos = await gastosService.listarGastosCompletos();
    res.json(gastos);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al obtener gastos completos');
  }
};

const getGastosPorAño = async (req, res) => {
  const año = parseInt(req.params.año);
  try {
    const gastos = await gastosService.listarGastosPorAño(año);
    res.json({ año, gastos });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al obtener gastos por año');
  }
};

const getGastosPorAñoMes = async (req, res) => {
  const año = parseInt(req.params.año);
  const mes = parseInt(req.params.mes);
  try {
    const gastos = await gastosService.listarGastosPorAñoMes(año, mes);
    res.json({ año, mes, gastos });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al obtener gastos por mes');
  }
};

const crearGasto = async (req, res) => {
  const { error } = gastoSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  try {
    const nuevoGasto = await gastosService.crearGasto(req.body);
    res.status(201).json(nuevoGasto);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al guardar el gasto');
  }
};

module.exports = {
  getGastosCompletos,
  getGastosPorAño,
  getGastosPorAñoMes,
  crearGasto
};
