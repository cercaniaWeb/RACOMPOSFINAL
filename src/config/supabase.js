import { createClient } from '@supabase/supabase-js';

// For browser environment (frontend), use VITE_* prefixed variables which are made available by Vite
// For Node.js environment (backend), access via process.env
const supabaseUrl = typeof window !== 'undefined' 
  ? import.meta.env.VITE_SUPABASE_URL 
  : (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL);

const supabaseAnonKey = typeof window !== 'undefined' 
  ? import.meta.env.VITE_SUPABASE_ANON_KEY 
  : (process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY);

if (!supabaseUrl || !supabaseAnonKey) {
  const envType = typeof window !== 'undefined' ? 'frontend (VITE_' : 'backend (';
  const suffix = typeof window !== 'undefined' ? ')' : ' or VITE_)';
  console.error(`Faltan credenciales de Supabase. Por favor, define SUPABASE_URL y SUPABASE_ANON_KEY en tu archivo .env (${envType}PREFIXED${suffix})`);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export { supabase };