import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import serviciosRouter from './routes/servicios.js';
import gastosRouter from './routes/gastos.js';
import totalesRouter from './routes/totales.js'; // <— importar el router

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/servicios', serviciosRouter);
app.use('/gastos', gastosRouter);
app.use('/totales', totalesRouter);            // <— usarlo con el prefijo /totales

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
