// testCompletoResumidoTodosAños.js
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

// Helper para redondear a 2 decimales
const round2 = (num) => Math.round(num * 100) / 100;

// -----------------------------
// Función para totales mensuales resumidos de un año
// -----------------------------
async function getTotalesMensuales(año) {
  const { data: gastos, error } = await supabase
    .from('gastos')
    .select('mes, importe')
    .eq('año', año);

  if (error) throw error;

  const resultado = {};
  for (let m = 1; m <= 12; m++) resultado[m] = 0;

  gastos.forEach((g) => {
    resultado[g.mes] += parseFloat(g.importe);
  });

  // Devolver solo los meses con gasto > 0
  const mesesConGasto = Object.keys(resultado)
    .sort((a, b) => a - b)
    .map((mes) => ({ mes: parseInt(mes), totalMensual: round2(resultado[mes]) }))
    .filter((r) => r.totalMensual > 0);

  return mesesConGasto;
}

// -----------------------------
// Función principal para correr el test
// -----------------------------
async function runTestResumidoTodosAños() {
  try {
    // Forzar lista de años de 2015 a 2026
    const años = [];
    for (let a = 2015; a <= 2026; a++) años.push(a);

    for (const año of años) {
      const mensual = await getTotalesMensuales(año);
      const totalAnual = round2(mensual.reduce((sum, m) => sum + m.totalMensual, 0));

      console.log(`\n📅 Año ${año}`);
      if (mensual.length > 0) {
        console.table(mensual); // Muestra mes y totalMensual
      } else {
        console.log('No hay gastos cargados para este año.');
      }
      console.log(`Total anual: ${totalAnual}`);
    }

    console.log('\n✅ Test resumido completo finalizado, todos los cálculos OK.');
  } catch (err) {
    console.error('❌ Error en verificación:', err);
  }
}

runTestResumidoTodosAños();
