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
// GET /totales/anuales
// -----------------------------
router.get('/anuales', async (req, res) => {
  try {
    const { data: servicios, error: errorServicios } = await supabase
      .from('servicios')
      .select('id, nombre');
    if (errorServicios) throw errorServicios;

    const { data: gastos, error: errorGastos } = await supabase
      .from('gastos')
      .select('año, importe, servicio_id');
    if (errorGastos) throw errorGastos;

    const resultado = {};
    gastos.forEach((g) => {
      const año = g.año;
      if (!resultado[año]) {
        resultado[año] = {};
        servicios.forEach((s) => (resultado[año][s.nombre] = 0));
      }
      const servicio = servicios.find((s) => s.id === g.servicio_id)?.nombre;
      if (servicio) resultado[año][servicio] += toNumber(g.importe);
    });

    Object.keys(resultado).forEach((año) => {
      servicios.forEach((s) => {
        if (!(s.nombre in resultado[año])) resultado[año][s.nombre] = 0;
        resultado[año][s.nombre] = round2(resultado[año][s.nombre]);
      });
    });

    res.json(resultado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener totales por año y servicio', detalle: error.message });
  }
});

// -----------------------------
// GET /totales/globales-anuales
// -----------------------------
router.get('/globales-anuales', async (req, res) => {
  try {
    const { data: gastos, error } = await supabase
      .from('gastos')
      .select('año, importe');
    if (error) throw error;

    const resultado = {};
    gastos.forEach((g) => {
      const año = g.año;
      if (!resultado[año]) resultado[año] = 0;
      resultado[año] += toNumber(g.importe);
    });

    const lista = Object.keys(resultado)
      .map((año) => ({ año: parseInt(año), total: round2(resultado[año]) }))
      .sort((a, b) => a.año - b.año);

    res.json(lista);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener totales globales anuales', detalle: error.message });
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
// Totales mensuales de todos los años (2015-2026)
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

    const resultado = {};

    // Inicializar todos los años y meses
    for (let año = 2015; año <= 2026; año++) {
      resultado[año] = {};
      for (let m = 1; m <= 12; m++) {
        resultado[año][m] = {};
        servicios.forEach((s) => (resultado[año][m][s.nombre] = 0));
      }
    }

    // Sumar gastos existentes
    gastos.forEach((g) => {
      const año = g.año;
      const mes = g.mes;
      const servicio = servicios.find((s) => s.id === g.servicio_id)?.nombre;
      if (servicio) {
        resultado[año][mes][servicio] += toNumber(g.importe);
      }
    });

    // Construir lista final
    const lista = Object.keys(resultado)
      .sort((a, b) => a - b)
      .map((año) => {
        const meses = Object.keys(resultado[año])
          .sort((a, b) => a - b)
          .map((mes) => {
            const totalPorServicio = {};
            let totalMensual = 0;
            Object.keys(resultado[año][mes]).forEach((s) => {
              totalPorServicio[s] = round2(resultado[año][mes][s]);
              totalMensual += resultado[año][mes][s];
            });
            return { mes: parseInt(mes), totalPorServicio, totalMensual: round2(totalMensual) };
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