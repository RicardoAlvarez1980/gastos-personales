// db.js
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config(); // carga variables de .env

export const supabase = createClient(
  process.env.SUPABASE_URL,        // URL de tu proyecto Supabase
  process.env.SUPABASE_SERVICE_KEY // Service Role Key
);
