// routes/totales.js
import express from 'express';
import { supabase } from '../db.js';

const router = express.Router();

const toNumber = (val) => {
  const num = parseFloat(val);
  return isNaN(num) ? 0 : num;
};

const round2 = (num) => Math.round(num * 100) / 100;

// -----------------------------
// GET /totales/anuales (por servicio)
// -----------------------------
router.get('/anuales', async (req, res) => {
  try {
    const { data, error } = await supabase.rpc('totales_anuales_servicios');
    if (error) throw error;

    // Convertimos a objeto por año
    const resultado = {};
    data.forEach(row => {
      if (!resultado[row.año]) resultado[row.año] = {};
      resultado[row.año][row.servicio] = parseFloat(row.total);
    });

    res.json(resultado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener totales anuales por servicio', detalle: error.message });
  }
});


// -----------------------------
// GET /totales/globales-anuales
// Todos los años 2015-2026 aunque no tengan gastos
// -----------------------------
router.get('/globales-anuales', async (req, res) => {
  try {
    // Llamamos a la función SQL totales_globales()
    const { data, error } = await supabase.rpc('totales_globales');
    if (error) throw error;

    // Redondeamos totales
    const resultado = data.map((row) => ({
      año: row.año,
      total: round2(row.total)
    }));

    res.json(resultado);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'Error al obtener totales globales anuales',
      detalle: error.message
    });
  }
});

// -----------------------------
// GET /totales/mensuales/:año
// -----------------------------
router.get('/mensuales/:año', async (req, res) => {
  const año = parseInt(req.params.año);
  try {
    const { data: servicios, error: errorServicios } = await supabase
      .from('servicios')
      .select('id, nombre');
    if (errorServicios) throw errorServicios;

    const { data: gastos, error: errorGastos } = await supabase
      .from('gastos')
      .select('mes, servicio_id, importe')
      .eq('año', año);
    if (errorGastos) throw errorGastos;

    const resultado = {};
    for (let m = 1; m <= 12; m++) {
      resultado[m] = {};
      servicios.forEach((s) => (resultado[m][s.nombre] = 0));
    }

    gastos.forEach((g) => {
      const mes = g.mes;
      const servicio = servicios.find((s) => s.id === g.servicio_id)?.nombre;
      if (servicio) resultado[mes][servicio] += toNumber(g.importe);
    });

    const lista = Object.keys(resultado)
      .sort((a, b) => a - b)
      .map((mes) => {
        const totalPorServicio = {};
        let totalMensual = 0;
        Object.keys(resultado[mes]).forEach((s) => {
          totalPorServicio[s] = round2(resultado[mes][s]);
          totalMensual += resultado[mes][s];
        });
        return { mes: parseInt(mes), totalPorServicio, totalMensual: round2(totalMensual) };
      });

    res.json(lista);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: `Error al obtener totales mensuales para el año ${año}`, detalle: error.message });
  }
});

// -----------------------------
// GET /totales/mensuales-todos
// -----------------------------
router.get('/mensuales-todos', async (req, res) => {
  try {
    const { data: servicios, error: errorServicios } = await supabase
      .from('servicios')
      .select('id, nombre');
    if (errorServicios) throw errorServicios;

    const { data: gastos, error: errorGastos } = await supabase
      .from('gastos')
      .select('año, mes, servicio_id, importe');
    if (errorGastos) throw errorGastos;

    // Obtener años existentes
    const añosExistentes = [...new Set(gastos.map(g => g.año))];

    const resultado = {};

    // Inicializar años y meses solo de los años existentes
    añosExistentes.forEach(año => {
      resultado[año] = {};
      for (let m = 1; m <= 12; m++) {
        resultado[año][m] = {};
        servicios.forEach(s => (resultado[año][m][s.nombre] = 0));
      }
    });

    // Sumar gastos
    gastos.forEach(g => {
      const año = g.año;
      const mes = g.mes;
      const servicio = servicios.find(s => s.id === g.servicio_id)?.nombre;
      if (servicio && resultado[año]) {
        resultado[año][mes][servicio] += Number(g.importe);
      }
    });

    // Construir lista final
    const lista = Object.keys(resultado)
      .sort((a, b) => a - b)
      .map(año => {
        const meses = Object.keys(resultado[año])
          .sort((a, b) => a - b)
          .map(mes => {
            const totalPorServicio = {};
            let totalMensual = 0;
            Object.keys(resultado[año][mes]).forEach(s => {
              totalPorServicio[s] = parseFloat(resultado[año][mes][s].toFixed(2));
              totalMensual += resultado[año][mes][s];
            });
            return { mes: parseInt(mes), totalPorServicio, totalMensual: parseFloat(totalMensual.toFixed(2)) };
          });
        return { año: parseInt(año), meses };
      });

    res.json(lista);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'Error al obtener totales mensuales de todos los años',
      detalle: error.message,
    });
  }
});


export default router;
