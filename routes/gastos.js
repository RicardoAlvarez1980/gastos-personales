const express = require('express');
const router = express.Router();
const { Gasto, Servicio } = require('../models');
const { gastoSchema } = require('../validators/gastoValidator');


// ==============================
// 📥 GET - Obtener datos
// ==============================

// Obtener todos los gastos completos con nombre de servicio, ordenados por año y mes
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

// Obtener gastos por año
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

// Obtener gastos por año y mes
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


// ==============================
// ➕ POST - Crear nuevo gasto
// ==============================

router.post('/', async (req, res) => {
  const { error } = gastoSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  try {
    const nuevoGasto = await Gasto.create(req.body);
    res.status(201).json(nuevoGasto);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al guardar el gasto');
  }
});


// ==============================
// ✏️ NUEVO: PUT - Actualizar gasto
// ==============================

/**
 * Actualiza un gasto por su ID
 * (¡Este método es nuevo! Aún no implementado)
 */
router.put('/:id', async (req, res) => {
  // Aquí podrías validar con gastoSchema si querés
  try {
    const id = parseInt(req.params.id);
    const [actualizados] = await Gasto.update(req.body, {
      where: { id }
    });

    if (actualizados === 0) {
      return res.status(404).send('Gasto no encontrado');
    }

    res.send('Gasto actualizado correctamente');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al actualizar el gasto');
  }
});


// ==============================
// ❌ NUEVO: DELETE - Eliminar gasto
// ==============================

/**
 * Elimina un gasto por su ID
 * (¡Este método es nuevo! Aún no implementado)
 */
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const eliminados = await Gasto.destroy({ where: { id } });

    if (eliminados === 0) {
      return res.status(404).send('Gasto no encontrado');
    }

    res.send('Gasto eliminado correctamente');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al eliminar el gasto');
  }
});

module.exports = router;