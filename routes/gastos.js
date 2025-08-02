import express from 'express';
import { Gasto, Servicio } from '../models/index.js';
import sequelize from '../db.js';
import { gastoSchema } from '../validators/gastoValidator.js';

const router = express.Router();

// Middleware validación id gasto
async function validarGastoExistente(req, res, next) {
  const gasto = await Gasto.findByPk(req.params.id);
  if (!gasto) return res.status(404).json({ error: 'Gasto no encontrado' });
  req.gasto = gasto;
  next();
}

// GET /gastos?completo=true&año=2025&mes=4&servicio=agua
router.get('/', async (req, res) => {
  const { completo, año, mes, servicio } = req.query;
  const where = {};
  if (año) where.año = parseInt(año);
  if (mes) where.mes = parseInt(mes);

  try {
    if (completo === 'true') {
      const gastos = await Gasto.findAll({
        include: { model: Servicio, as: 'Servicio', attributes: ['nombre'] },
        order: [['año', 'ASC'], ['mes', 'ASC']]
      });
      const respuesta = gastos.map(g => ({
        id: g.id,
        servicio: g.Servicio.nombre,
        año: g.año,
        mes: g.mes,
        importe: g.importe
      }));
      return res.json(respuesta);
    }

    let include = { model: Servicio, as: 'Servicio', attributes: ['nombre'] };
    if (servicio) {
      include = {
        model: Servicio,
        as: 'Servicio',
        where: sequelize.where(
          sequelize.fn('LOWER', sequelize.col('Servicio.nombre')),
          servicio.toLowerCase()
        ),
        attributes: ['nombre']
      };
    }

    const gastos = await Gasto.findAll({
      where,
      include,
      order: [['año', 'ASC'], ['mes', 'ASC']]
    });

    const respuesta = gastos.map(g => ({
      id: g.id,
      servicio: g.Servicio.nombre,
      año: g.año,
      mes: g.mes,
      importe: g.importe
    }));

    res.json(respuesta);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al obtener gastos');
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

// POST /gastos - Crear gasto
router.post('/', async (req, res) => {
  const { error } = gastoSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  try {
    const nuevoGasto = await Gasto.create(req.body);
    res.status(201).json(nuevoGasto);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al crear gasto');
  }
});

// PUT /gastos/:id - Actualizar gasto completo
router.put('/:id', validarGastoExistente, async (req, res) => {
  try {
    await req.gasto.update(req.body);
    res.json(req.gasto);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al actualizar gasto');
  }
});

// PATCH /gastos/:id - Actualizar parcialmente
router.patch('/:id', validarGastoExistente, async (req, res) => {
  try {
    await req.gasto.update(req.body);
    res.json(req.gasto);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al actualizar parcialmente gasto');
  }
});

// DELETE /gastos/:id - Eliminar gasto
router.delete('/:id', validarGastoExistente, async (req, res) => {
  try {
    await req.gasto.destroy();
    res.json({ mensaje: 'Gasto eliminado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al eliminar gasto');
  }
});

export default router;
