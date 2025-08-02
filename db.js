import 'dotenv/config'; // carga .env automáticamente
import { Sequelize } from 'sequelize';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('La variable de entorno DATABASE_URL no está definida');
}

const sequelize = new Sequelize(connectionString, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      rejectUnauthorized: true,
    },
    application_name: 'gastos-personales',
  },
  logging: false,
  pool: {
    max: 10,
    idle: 30000,
    acquire: 2000,
  },
});

export default sequelize;
export { Sequelize };
