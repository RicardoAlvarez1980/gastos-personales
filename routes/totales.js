const express = require('express');
const router = express.Router();
const { fn, col } = require('sequelize');
const Gasto = require('../models/Gasto');
const Servicio = require('../models/Servicio');

router.get('/anuales', async (req, res) => {
  try {
    const resultados = await Gasto.findAll({
      attributes: [
        'año',
        [fn('SUM', col('importe')), 'total']
      ],
      include: {
        model: Servicio,
        attributes: ['nombre']
      },
      group: ['año', 'servicio_id'],
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

router.get('/:año', async (req, res) => {
  const año = parseInt(req.params.año);
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
      total: parseFloat(r.dataValues.total)
    }));
    res.json({ año, totalesMensuales: respuesta });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al calcular totales mensuales');
  }
});

module.exports = router;
