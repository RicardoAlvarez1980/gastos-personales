// testModificarConMensuales.js
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000/gastos';
const TOT_URL = 'http://localhost:3000/totales/mensuales-todos';

// Helper para esperar un tiempo
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

// -----------------------------
// Obtener totales mensuales de todos los años
// -----------------------------
async function getTotalesMensualesTodos() {
  const res = await fetch(TOT_URL);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return data; // JSON: [{ año, meses: [{mes, totalPorServicio, totalMensual}] }]
}

// -----------------------------
// Test crear gasto
// -----------------------------
async function testAgregar() {
  const body = { año: 2026, mes: 1, importe: 12345.67, servicio_id: 1 };
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(data));
  console.log('✅ Gasto creado:', data);
  return data.id;
}

// -----------------------------
// Test modificar gasto
// -----------------------------
async function testModificar(id) {
  const body = { importe: 54321.99 };
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(data));
  console.log('✅ Gasto modificado:', data);
}

// -----------------------------
// Test eliminar gasto
// -----------------------------
async function testEliminar(id) {
  const res = await fetch(`${BASE_URL}/${id}`, { method: 'DELETE' });
  const data = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(data));
  console.log('✅ Gasto eliminado:', data);
}

// -----------------------------
// Función auxiliar para mostrar totales resumidos de un año
// -----------------------------
function mostrarTotalesAnio(anioObj) {
  console.log(`\n📅 Año ${anioObj.año}`);
  if (anioObj.meses.length > 0) {
    anioObj.meses.forEach((m) => {
      console.log(`  Mes ${m.mes} - Total: ${m.totalMensual}`);
    });
  } else {
    console.log('  No hay gastos cargados para este año.');
  }
}

// -----------------------------
// Ejecutar tests
// -----------------------------
async function runTests() {
  console.log('--- TEST HTTP: Crear, Modificar y Eliminar gasto con totales mensuales ---');

  try {
    // Totales antes de crear
    let totales = await getTotalesMensualesTodos();
    console.log('📊 Totales antes de crear gasto:');
    totales.forEach(mostrarTotalesAnio);

    // Crear
    const id = await testAgregar();
    await delay(300);

    // Totales después de crear
    totales = await getTotalesMensualesTodos();
    console.log('📊 Totales después de crear gasto:');
    totales.forEach(mostrarTotalesAnio);

    // Modificar
    await testModificar(id);
    await delay(300);

    // Totales después de modificar
    totales = await getTotalesMensualesTodos();
    console.log('📊 Totales después de modificar gasto:');
    totales.forEach(mostrarTotalesAnio);

    // Eliminar
    await testEliminar(id);
    await delay(300);

    // Totales después de eliminar
    totales = await getTotalesMensualesTodos();
    console.log('📊 Totales después de eliminar gasto:');
    totales.forEach(mostrarTotalesAnio);

    console.log('✅ Test completo con totales mensuales finalizado.');
  } catch (err) {
    console.error('❌ Error en test:', err.message);
  }
}

runTests();
