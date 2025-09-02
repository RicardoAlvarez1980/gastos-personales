import express from 'express';
import { supabase } from '../db.js';
import { gastoSchema } from '../validators/gastoValidator.js';

const router = express.Router();

// GET /gastos - filtrar por año, mes y/o servicio, opcionalmente completo
// GET /gastos - con paginación y filtros
router.get('/', async (req, res) => {
  const { completo, año, mes, servicio, pagina = 1, limite = 100 } = req.query;

  try {
    const desde = (parseInt(pagina) - 1) * parseInt(limite);
    const hasta = desde + parseInt(limite) - 1;

    let query = supabase
      .from('gastos')
      .select(`
        id,
        año,
        mes,
        importe,
        servicio_id,
        servicios (nombre)
      `, { count: 'exact' }) // cuenta total de filas
      .order('año', { ascending: true })
      .order('mes', { ascending: true })
      .range(desde, hasta);

    if (año) query = query.eq('año', parseInt(año));
    if (mes) query = query.eq('mes', parseInt(mes));
    if (servicio) query = query.eq('servicios.nombre', servicio);

    const { data: gastos, error, count } = await query;
    if (error) throw error;

    // Si pide "completo" devolvemos el nombre del servicio
    const datos = (completo === 'true')
      ? gastos.map(g => ({
          id: g.id,
          servicio: g.servicios.nombre,
          año: g.año,
          mes: g.mes,
          importe: g.importe
        }))
      : gastos.map(g => ({
          id: g.id,
          servicio_id: g.servicio_id,
          año: g.año,
          mes: g.mes,
          importe: g.importe
        }));

    res.json({
      total: count,          // total de registros en la tabla
      pagina: parseInt(pagina),
      limite: parseInt(limite),
      gastos: datos
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener gastos', detalle: error.message });
  }
});


// POST /gastos - Crear gasto
router.post('/', async (req, res) => {
  const { error } = gastoSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  try {
    const { data: nuevoGasto, error } = await supabase
      .from('gastos')
      .insert([req.body])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(nuevoGasto);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear gasto', detalle: err.message });
  }
});

// PUT /gastos/:id - Actualizar gasto
router.put('/:id', async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    const { data: gasto, error } = await supabase
      .from('gastos')
      .update(req.body)
      .eq('id', id)
      .select()
      .single();

    if (error || !gasto) return res.status(404).json({ error: 'Gasto no encontrado' });
    res.json(gasto);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar gasto', detalle: err.message });
  }
});

// DELETE /gastos/:id - Eliminar gasto
router.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    const { data: gasto, error } = await supabase
      .from('gastos')
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error || !gasto) return res.status(404).json({ error: 'Gasto no encontrado' });
    res.json({ mensaje: 'Gasto eliminado correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar gasto', detalle: err.message });
  }
});

export default router;
