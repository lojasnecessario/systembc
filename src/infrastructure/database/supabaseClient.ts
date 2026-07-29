import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (supabaseInstance) return supabaseInstance;

  // Usa apenas process.env pois este arquivo é usado apenas no backend (Node.js/Vercel)
  const getEnv = (key: string) => {
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return process.env[key];
    }
    return undefined;
  };

  const url = getEnv('VITE_SUPABASE_URL') || getEnv('NEXT_PUBLIC_SUPABASE_URL') || getEnv('SUPABASE_URL');
  // Usa a Service Role Key para bypass de RLS no backend, senão cai na Anon Key (que sofre bloqueio do RLS)
  const key = getEnv('SUPABASE_SERVICE_ROLE_KEY') || getEnv('VITE_SUPABASE_ANON_KEY') || getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY') || getEnv('SUPABASE_ANON_KEY');

  if (!url || !key) {
    throw new Error('Supabase environment variables are missing');
  }

  supabaseInstance = createClient(url, key);
  return supabaseInstance;
}
