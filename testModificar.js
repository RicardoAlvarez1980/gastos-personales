// testHTTP.js
import 'dotenv/config';
import fetch from 'node-fetch';

const BASE_URL = `http://localhost:${process.env.PORT || 3000}/totales`;

// Datos de prueba para 2026
const nuevoGasto = {
  año: 2026,
  mes: 1,
  servicio_id: 1,
  importe: 12345.67
};

const modificarGasto = {
  año: 2026,
  mes: 1,
  servicio_id: 1,
  importe: 20000
};

async function testAgregar() {
  console.log('--- TEST HTTP: Agregar gasto ---');
  try {
    const resp = await fetch(`${BASE_URL}/mensuales-todos`, {
      method: 'POST', // suponiendo que tengas un POST para agregar gastos
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nuevoGasto)
    });
    const data = await resp.json();
    console.log('✅ Agregado:', data);
  } catch (err) {
    console.error('❌ Error al agregar:', err);
  }
}

async function testModificar() {
  console.log('--- TEST HTTP: Modificar gasto ---');
  try {
    const resp = await fetch(`${BASE_URL}/mensuales-todos`, {
      method: 'PUT', // suponiendo que tengas un PUT para modificar gastos
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(modificarGasto)
    });
    const data = await resp.json();
    console.log('✅ Modificado:', data);
  } catch (err) {
    console.error('❌ Error al modificar:', err);
  }
}

async function testEliminar() {
  console.log('--- TEST HTTP: Eliminar gasto ---');
  try {
    const resp = await fetch(`${BASE_URL}/mensuales-todos`, {
      method: 'DELETE', // suponiendo que tengas DELETE
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ año: 2026, mes: 1, servicio_id: 1 })
    });
    const data = await resp.json();
    console.log('✅ Eliminado:', data);
  } catch (err) {
    console.error('❌ Error al eliminar:', err);
  }
}

async function runTestsHTTP() {
  await testAgregar();
  await testModificar();
  await testEliminar();
  console.log('\n🎯 Tests HTTP completados.');
}

runTestsHTTP();
