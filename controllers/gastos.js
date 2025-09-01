import supabase from '../db.js';

export const getGastos = async (req, res) => {
  const { data, error } = await supabase.from('gastos').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};

export const createGasto = async (req, res) => {
  const { concepto, monto, fecha, servicio_id } = req.body;
  const { data, error } = await supabase.from('gastos').insert([{
    concepto,
    monto,
    fecha,
    servicio_id
  }]);
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};
