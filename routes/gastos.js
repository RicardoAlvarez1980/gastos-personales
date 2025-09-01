import express from 'express';
import { supabase } from '../db.js';
import { gastoSchema } from '../validators/gastoValidator.js';

const router = express.Router();

// GET /gastos - filtrar por año, mes y/o servicio, opcionalmente completo
router.get('/', async (req, res) => {
  const { completo, año, mes, servicio } = req.query;

  try {
    // Preparamos el query básico
    let query = supabase.from('gastos').select(`
      id,
      año,
      mes,
      importe,
      servicio_id,
      servicios (nombre)
    `);

    if (año) query = query.eq('año', parseInt(año));
    if (mes) query = query.eq('mes', parseInt(mes));
    if (servicio) query = query.eq('servicios.nombre', servicio);

    const { data: gastos, error } = await query.order('año', { ascending: true }).order('mes', { ascending: true });
    if (error) throw error;

    // Si se solicita "completo", retornamos nombre del servicio
    if (completo === 'true') {
      return res.json(
        gastos.map(g => ({
          id: g.id,
          servicio: g.servicios.nombre,
          año: g.año,
          mes: g.mes,
          importe: g.importe
        }))
      );
    }

    // Respuesta normal (solo id y servicio_id)
    res.json(
      gastos.map(g => ({
        id: g.id,
        servicio_id: g.servicio_id,
        año: g.año,
        mes: g.mes,
        importe: g.importe
      }))
    );
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al obtener gastos');
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
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al crear gasto');
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

    if (error || !gasto) return res.status(404).send('Gasto no encontrado');
    res.json(gasto);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al actualizar gasto');
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

    if (error || !gasto) return res.status(404).send('Gasto no encontrado');
    res.json({ mensaje: 'Gasto eliminado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al eliminar gasto');
  }
});

export default router;
