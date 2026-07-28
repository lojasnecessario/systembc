import { createClient } from '@supabase/supabase-js';

// Vercel / Node.js
const getEnv = () => {
  if (typeof process !== 'undefined' && process.env) {
    return {
      url: process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
      key: process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
    };
  }
  return { url: undefined, key: undefined };
};

let { url: supabaseUrl, key: supabaseAnonKey } = getEnv();

// Se não encontrou no process.env (ex: rodando no Vite no frontend)
if (!supabaseUrl) {
  // @ts-ignore
  supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  // @ts-ignore
  supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
}

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase variables are missing from .env');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');
