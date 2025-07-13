const express = require('express');
const router = express.Router();
const { Gasto, Servicio } = require('../models'); // 👈 cambio acá

router.get('/completos', async (req, res) => {
  try {
    const gastos = await Gasto.findAll({
      include: { model: Servicio, attributes: ['nombre'] },
      order: [['año', 'ASC'], ['mes', 'ASC']]
    });
    const respuesta = gastos.map(g => ({
      servicio: g.Servicio.nombre,
      año: g.año,
      mes: g.mes,
      importe: g.importe
    }));
    res.json(respuesta);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al obtener gastos completos');
  }
});

router.get('/:año', async (req, res) => {
  const año = parseInt(req.params.año);
  try {
    const gastos = await Gasto.findAll({
      where: { año },
      include: { model: Servicio, attributes: ['nombre'] },
      order: [['mes', 'ASC']]
    });
    const respuesta = gastos.map(g => ({
      servicio: g.Servicio.nombre,
      mes: g.mes,
      importe: g.importe
    }));
    res.json({ año, gastos: respuesta });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al obtener gastos por año');
  }
});

router.get('/:año/:mes', async (req, res) => {
  const año = parseInt(req.params.año);
  const mes = parseInt(req.params.mes);
  try {
    const gastos = await Gasto.findAll({
      where: { año, mes },
      include: { model: Servicio, attributes: ['nombre'] },
      order: [['servicio_id', 'ASC']]
    });
    const respuesta = gastos.map(g => ({
      servicio: g.Servicio.nombre,
      importe: g.importe
    }));
    res.json({ año, mes, gastos: respuesta });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al obtener gastos por mes');
  }
});

module.exports = router;
