const express = require('express');
const router = express.Router();
const { fn, col } = require('sequelize');
const Gasto = require('../models/Gasto');
const Servicio = require('../models/Servicio');
const validarAñoParam = require('./../middlewares/validarAñoParam');

router.get('/anuales', async (req, res) => {
  try {
    const resultados = await Gasto.findAll({
      attributes: [
        'año',
        'servicio_id',
        [fn('SUM', col('importe')), 'total']
      ],
      include: {
        model: Servicio,
        attributes: ['id', 'nombre']
      },
      group: ['Gasto.año', 'Gasto.servicio_id', 'Servicio.id', 'Servicio.nombre'],
      order: [['año', 'ASC'], ['servicio_id', 'ASC']]
    });

    const respuesta = resultados.map(r => ({
      servicio: r.Servicio.nombre,
      año: r.año,
      total: parseFloat(r.dataValues.total)
    }));

    res.json(respuesta);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al calcular totales anuales');
  }
});

router.get('/por-servicio/:año', async (req, res) => {
  const año = parseInt(req.params.año);
  try {
    const resultados = await Gasto.findAll({
      where: { año },
      attributes: [
        'servicio_id',
        [fn('SUM', col('importe')), 'total']
      ],
      include: {
        model: Servicio,
        attributes: ['nombre']
      },
      group: ['servicio_id', 'Servicio.id', 'Servicio.nombre'],
      order: [[col('total'), 'DESC']]
    });

    const respuesta = resultados.map(r => ({
      servicio: r.Servicio.nombre,
      total: parseFloat(r.dataValues.total)
    }));

    res.json({ año, totalesPorServicio: respuesta });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al calcular totales anuales por servicio');
  }
});

router.get('/globales-anuales', async (req, res) => {

  try {
    const resultados = await Gasto.findAll({
      attributes: [
        'año',
        [fn('SUM', col('importe')), 'total_gastos']
      ],
      group: ['año'],
      order: [['año', 'ASC']]
    });

    const respuesta = resultados.map(r => ({
      año: r.año,
      total_gastos: parseFloat(r.get('total_gastos'))
    }));

    res.json(respuesta);
  } catch (error) {
    console.error('Error al obtener totales anuales globales:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.get('/mensuales/:año', validarAñoParam, async (req, res) => {
  const año = req.año; // ya validado y parseado

  try {
    const resultados = await Gasto.findAll({
      where: { año },
      attributes: [
        'mes',
        [fn('SUM', col('importe')), 'total']
      ],
      group: ['mes'],
      order: [['mes', 'ASC']]
    });

    const respuesta = resultados.map(r => ({
      mes: r.mes,
      total: parseFloat(r.get('total'))
    }));

    res.json({ año, totalesMensuales: respuesta });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al calcular totales mensuales');
  }
});

module.exports = router;