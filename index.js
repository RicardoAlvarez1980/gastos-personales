import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sequelize from './db.js';
import gastosRouter from './routes/gastos.js';
import totalesRouter from './routes/totales.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get('/', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.send('API Gastos backend funcionando');
  } catch (error) {
    console.error(error);
    res.status(500).send('No se pudo conectar a la base de datos');
  }
});

app.use('/gastos', gastosRouter);
app.use('/totales', totalesRouter);

// endpoint de setup: crea la base y sincroniza tablas
app.get('/setup', async (req, res) => {
  try {
    // 1. Parsear la DATABASE_URL actual
    let dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) return res.status(500).json({ error: 'DATABASE_URL no definida' });

    // Extraer la parte del path (la base) y reemplazarla por defaultdb para poder conectarnos
    const urlObj = new URL(dbUrl);
    const originalDatabase = urlObj.pathname.slice(1); // sin la barra inicial
    urlObj.pathname = '/defaultdb'; // base existente por defecto en Cockroach Cloud

    // 2. Conectarse temporalmente a defaultdb para crear la base real
    const { Sequelize } = await import('sequelize');
    const tempSequelize = new Sequelize(urlObj.toString(), {
      dialect: 'postgres',
      logging: false,
    });

    await tempSequelize.authenticate();
    // Crear la base destino (con comillas porque tiene guión)
    await tempSequelize.query(`CREATE DATABASE IF NOT EXISTS "${originalDatabase}";`);
    await tempSequelize.close();

    // 3. Ahora que la base existe, sincronizar tus modelos en la base real
    // (esto asume que tu sequelize ya está apuntando a la base correcta desde .env)
    await sequelize.sync({ alter: true }); // ojo: solo en dev, en prod controlá migraciones
    res.json({ mensaje: 'Setup completado: base creada (si no existía) y tablas sincronizadas' });
  } catch (err) {
    console.error('Error en /setup:', err);
    res.status(500).json({ error: err.message || 'Fallo en setup' });
  }
});


app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
