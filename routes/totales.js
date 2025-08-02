import express from 'express';
import { fn, col, where, literal } from 'sequelize';
import { Gasto, Servicio } from '../models/index.js';
import validarAñoParam from '../middlewares/validarAñoParam.js';
import sequelize from '../db.js';

const router = express.Router();

// ==============================
// MÉTODOS GET (LECTURA DE DATOS)
// ==============================

// Obtener totales anuales por servicio
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

// Obtener totales por servicio en un año específico
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

// Obtener totales anuales globales (sin importar servicio)
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

// Obtener totales mensuales de un año específico (TOTAL DEL MES EN UN AÑO EN PARTICULAR)
// EJEMPLO http://localhost:3000/totales/mensuales/2025 AÑO 2025
/* 
{
"año": 2025,
"totalesMensuales": [
{
"mes": 1,
"total": 94821.96
},
{
"mes": 2,
"total": 117312.46
},
{
"mes": 3,
"total": 133361.62
},
{
"mes": 4,
"total": 189178.55
},
{
"mes": 5,
"total": 131476.27
},
{
"mes": 6,
"total": 185147.68
},
{
"mes": 7,
"total": 150046.15
},
{
"mes": 8,
"total": 71661.64
},
{
"mes": 9,
"total": 19079.57
},
{
"mes": 10,
"total": 19079.57
},
{
"mes": 11,
"total": 19079.57
},
{
"mes": 12,
"total": 19079.57
}
]
}
*/

// Obtener totales mensuales de un año específico
router.get('/mensuales/:año', validarAñoParam, async (req, res) => {
  const año = req.año;

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

// ==============================
// POST / PUT / DELETE
// ==============================

// Crear un nuevo gasto
router.post('/gastos', async (req, res) => {
  const { año, mes, importe, servicio_id } = req.body;

  if (!año || !mes || !importe || !servicio_id) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }

  try {
    const nuevoGasto = await Gasto.create({ año, mes, importe, servicio_id });
    res.status(201).json(nuevoGasto);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear el gasto' });
  }
});

// Actualizar un gasto completo por ID
router.put('/gastos/:id', async (req, res) => {
  const { id } = req.params;
  const { año, mes, importe, servicio_id } = req.body;

  try {
    const gasto = await Gasto.findByPk(id);
    if (!gasto) {
      return res.status(404).json({ error: 'Gasto no encontrado' });
    }

    await gasto.update({ año, mes, importe, servicio_id });
    res.json(gasto);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar el gasto' });
  }
});

// Eliminar un gasto por ID
router.delete('/gastos/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const gasto = await Gasto.findByPk(id);
    if (!gasto) {
      return res.status(404).json({ error: 'Gasto no encontrado' });
    }

    await gasto.destroy();
    res.json({ mensaje: 'Gasto eliminado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar el gasto' });
  }
});

// Actualizar parcialmente un gasto
router.patch('/gastos/:id', async (req, res) => {
  const { id } = req.params;
  const camposActualizables = req.body;

  try {
    const gasto = await Gasto.findByPk(id);
    if (!gasto) {
      return res.status(404).json({ error: 'Gasto no encontrado' });
    }

    await gasto.update(camposActualizables);
    res.json(gasto);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar parcialmente el gasto' });
  }
});

export default router;
