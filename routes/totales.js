import express from 'express';
import { Gasto, Servicio } from '../models/index.js';
import { fn, col } from 'sequelize';

const router = express.Router();

// GET /totales/anuales - totales por año y servicio
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
        as: 'Servicio', // <--- tiene que coincidir con el alias de la asociación
        attributes: ['id', 'nombre']
      },
      group: [
        col('Gasto.año'),
        col('Gasto.servicio_id'),
        col('Servicio.id'),
        col('Servicio.nombre')
      ],
      order: [
        ['año', 'ASC'],
        ['servicio_id', 'ASC']
      ]
    });

    const respuesta = resultados.map(r => ({
      servicio: r.Servicio?.nombre || null,
      año: r.año,
      total: parseFloat(r.dataValues.total)
    }));

    res.json(respuesta);
  } catch (error) {
    console.error('Error en /totales/anuales:', error);
    res.status(500).send('Error al obtener totales anuales');
  }
});

// GET /totales/globales-anuales - totales globales por año (no necesita include con alias)
router.get('/globales-anuales', async (req, res) => {
  try {
    const resultados = await Gasto.findAll({
      attributes: ['año', [fn('SUM', col('importe')), 'total_gastos']],
      group: ['año'],
      order: [['año', 'ASC']]
    });
    const respuesta = resultados.map(r => ({
      año: r.año,
      total_gastos: parseFloat(r.get('total_gastos'))
    }));
    res.json(respuesta);
  } catch (error) {
    console.error('Error en /totales/globales-anuales:', error);
    res.status(500).send('Error al obtener totales globales anuales');
  }
});

// Obtener gastos por año Para cada año me da el total de gastos 
router.get('/:año', async (req, res) => {
  const año = parseInt(req.params.año);
  try {
    const gastos = await Gasto.findAll({
      where: { año },
      include: { model: Servicio, as: 'Servicio', attributes: ['nombre'] },
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

// GET /totales/mensuales/:año - totales mensuales para año dado
router.get('/mensuales/:año', async (req, res) => {
  const año = parseInt(req.params.año);
  if (isNaN(año)) {
    return res.status(400).json({ error: 'Año inválido' });
  }

  try {
    const resultados = await Gasto.findAll({
      where: { año },
      attributes: ['mes', [fn('SUM', col('importe')), 'total']],
      group: ['mes'],
      order: [['mes', 'ASC']]
    });

    const respuesta = resultados.map(r => ({
      mes: r.mes,
      total: parseFloat(r.get('total'))
    }));

    res.json({ año, totalesMensuales: respuesta });
  } catch (error) {
    console.error('Error en /totales/mensuales/:año:', error);
    res.status(500).send('Error al obtener totales mensuales');
  }
});

export default router;
