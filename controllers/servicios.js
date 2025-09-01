import supabase from '../db.js';

export const getServicios = async (req, res) => {
  const { data, error } = await supabase.from('servicios').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};

export const createServicio = async (req, res) => {
  const { nombre } = req.body;
  const { data, error } = await supabase.from('servicios').insert([{ nombre }]);
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};
