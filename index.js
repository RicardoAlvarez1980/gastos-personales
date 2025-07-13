const express = require('express');
const sequelize = require('./db');
require('dotenv').config();
const cors = require('cors');

const app = express();

// Esto permite CORS para *todos* los orígenes, ideal para desarrollo:
app.use(cors());

// Configuración del puerto
// Puedes cambiarlo en el archivo .env si lo deseas
const PORT = process.env.PORT || 3000;

const gastosRouter = require('./routes/gastos');
const totalesRouter = require('./routes/totales');

app.use(express.json());

app.get('/', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.send('API Gastos backend funcionando');
  } catch (error) {
    console.error(error);
    res.status(500).send('No se pudo conectar a la base de datos');
  }
});

// Rutas
app.use('/gastos', gastosRouter);
app.use('/totales', totalesRouter);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
