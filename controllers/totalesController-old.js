const totalesService = require('../services/totalesService');

async function totalesAnualesGlobales(req, res) {
  try {
    const totales = await totalesService.obtenerTotalesAnualesGlobales();
    res.json(totales);
  } catch (error) {
    console.error('Error al obtener totales anuales globales:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

async function totalesAnualesPorServicio(req, res) {
  try {
    const totales = await totalesService.obtenerTotalesAnualesPorServicio();
    res.json(totales);
  } catch (error) {
    console.error('Error al obtener totales anuales por servicio:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

async function totalesPorServicioEnAño(req, res) {
  const año = parseInt(req.params.año);
  if (isNaN(año)) return res.status(400).json({ error: 'Parámetro año inválido' });

  try {
    const totales = await totalesService.obtenerTotalesPorServicioEnAño(año);
    res.json({ año, totalesPorServicio: totales });
  } catch (error) {
    console.error('Error al obtener totales por servicio en año:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

async function totalesMensualesPorAño(req, res) {
  const año = parseInt(req.params.año);
  if (isNaN(año)) return res.status(400).json({ error: 'Parámetro año inválido' });

  try {
    const totales = await totalesService.obtenerTotalesMensualesPorAño(año);
    res.json({ año, totalesMensuales: totales });
  } catch (error) {
    console.error('Error al obtener totales mensuales por año:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

module.exports = {
  totalesAnualesGlobales,
  totalesAnualesPorServicio,
  totalesPorServicioEnAño,
  totalesMensualesPorAño,
};
