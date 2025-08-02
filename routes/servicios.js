import express from 'express';
import { Servicio } from '../models/index.js';

const router = express.Router();

// GET - Listar todos los servicios
router.get('/', async (req, res) => {
  try {
    const servicios = await Servicio.findAll({
      attributes: ['id', 'nombre'],
      order: [['nombre', 'ASC']]
    });
    res.json(servicios);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al obtener servicios');
  }
});

// GET - Obtener un servicio por id
router.get('/:id', async (req, res) => {
  try {
    const servicio = await Servicio.findByPk(req.params.id);
    if (!servicio) return res.status(404).send('Servicio no encontrado');
    res.json(servicio);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al obtener servicio');
  }
});

// POST - Crear un nuevo servicio
router.post('/', async (req, res) => {
  try {
    const { nombre } = req.body;
    if (!nombre) return res.status(400).send('Falta nombre del servicio');
    const nuevoServicio = await Servicio.create({ nombre });
    res.status(201).json(nuevoServicio);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al crear servicio');
  }
});

// PUT - Actualizar un servicio por id
router.put('/:id', async (req, res) => {
  try {
    const servicio = await Servicio.findByPk(req.params.id);
    if (!servicio) return res.status(404).send('Servicio no encontrado');
    await servicio.update(req.body);
    res.json(servicio);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al actualizar servicio');
  }
});

// DELETE - Eliminar un servicio por id
router.delete('/:id', async (req, res) => {
  try {
    const servicio = await Servicio.findByPk(req.params.id);
    if (!servicio) return res.status(404).send('Servicio no encontrado');
    await servicio.destroy();
    res.json({ mensaje: 'Servicio eliminado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al eliminar servicio');
  }
});

export default router;
