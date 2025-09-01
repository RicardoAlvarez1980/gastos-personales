import express from 'express';
import { supabase } from '../db.js';

const router = express.Router();

// GET - Listar todos los servicios
router.get('/', async (req, res) => {
  try {
    const { data: servicios, error } = await supabase
      .from('servicios')
      .select('id, nombre')
      .order('nombre', { ascending: true });

    if (error) throw error;
    res.json(servicios);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al obtener servicios');
  }
});

// GET - Obtener un servicio por id
router.get('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const { data: servicio, error } = await supabase
      .from('servicios')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !servicio) return res.status(404).send('Servicio no encontrado');
    res.json(servicio);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al obtener servicio');
  }
});

// POST - Crear un nuevo servicio
router.post('/', async (req, res) => {
  const { nombre } = req.body;
  if (!nombre) return res.status(400).send('Falta nombre del servicio');

  try {
    const { data: nuevoServicio, error } = await supabase
      .from('servicios')
      .insert([{ nombre }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(nuevoServicio);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al crear servicio');
  }
});

// PUT - Actualizar un servicio por id
router.put('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const { nombre } = req.body;
  if (!nombre) return res.status(400).send('Falta nombre del servicio');

  try {
    const { data: servicio, error } = await supabase
      .from('servicios')
      .update({ nombre })
      .eq('id', id)
      .select()
      .single();

    if (error || !servicio) return res.status(404).send('Servicio no encontrado');
    res.json(servicio);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al actualizar servicio');
  }
});

// DELETE - Eliminar un servicio por id (primero elimina gastos relacionados)
router.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    // Borrar los gastos relacionados
    const { error: errorGastos } = await supabase
      .from('gastos')
      .delete()
      .eq('servicio_id', id);

    if (errorGastos) throw errorGastos;

    // Borrar el servicio
    const { data: servicio, error } = await supabase
      .from('servicios')
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error || !servicio) return res.status(404).send('Servicio no encontrado');
    res.json({ mensaje: 'Servicio y gastos relacionados eliminados correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al eliminar servicio');
  }
});

export default router;
