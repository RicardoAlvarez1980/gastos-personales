// validators/gastoValidator.js
import Joi from 'joi';

const currentYear = new Date().getFullYear();

export const gastoSchema = Joi.object({
  servicio_id: Joi.number().integer().required(),
  año: Joi.number()
    .integer()
    .min(2015)
    .max(currentYear + 10) // 👈 Permitimos hasta 10 años en el futuro
    .required(),
  mes: Joi.number().integer().min(1).max(12).required(),
  importe: Joi.number().precision(2).required()
});
