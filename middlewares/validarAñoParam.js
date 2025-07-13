function validarAñoParam(req, res, next) {
  const año = parseInt(req.params.año);
  if (isNaN(año)) {
    return res.status(400).json({ error: 'Parámetro año inválido' });
  }
  req.año = año; // guardamos el año parseado para usar directo
  next();
}

module.exports = validarAñoParam;
