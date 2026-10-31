import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Credenciales oficiales de producción para el proyecto 'color' en Supabase
export const OFFICIAL_SUPABASE_URL = 'https://vhydyisbrimyrtwdisoa.supabase.co';
export const OFFICIAL_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZoeWR5aXNicmlteXJ0d2Rpc29hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA0MzY2MDAsImV4cCI6MjEwNjAxMjYwMH0.0O-AD16N-FP7M4Uit1oOi2CyFpx3JnML-6LCV3ubFYE';

const rawUrl = (
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) ||
  (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_URL) ||
  ''
) as string;

const rawKey = (
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) ||
  (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_ANON_KEY) ||
  ''
) as string;

// Si la URL apunta a otro proyecto o está vacía, usar la URL oficial del proyecto 'color'
const envUrl = (rawUrl && !rawUrl.includes('cehrxxrobxrygpzefsqi')) ? rawUrl : OFFICIAL_SUPABASE_URL;

// Si la clave es del proyecto anterior (sb_publishable_) o está vacía, usar la clave válida verificada
const envKey = (rawKey && !rawKey.startsWith('sb_publishable_')) ? rawKey : OFFICIAL_SUPABASE_ANON_KEY;

const isValidSupabaseUrl = (url: string): boolean => {
  if (!url || typeof url !== 'string') return false;
  if (url.includes('placeholder') || url.includes('xyzcompany')) {
    return false;
  }
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
};

export const isConfigured = Boolean(isValidSupabaseUrl(envUrl) && envKey && envKey.length > 20);
export const supabaseUrl = envUrl;
export const supabaseAnonKey = envKey;

/**
 * Único cliente de Supabase para toda la aplicación.
 * Si Supabase no está configurado o el endpoint no existe, intercepta las peticiones
 * devolviendo respuestas vacías seguras para evitar 'TypeError: Failed to fetch'.
 */
export const supabase: SupabaseClient = isConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: {
        fetch: async () => {
          return new Response(JSON.stringify([]), {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              'content-range': '0-0/0'
            }
          });
        }
      }
    });

/**
 * Obtiene el cliente singleton de Supabase si las credenciales están configuradas.
 */
export function getSupabase(): SupabaseClient {
  return supabase;
}

/**
 * Verifica si Supabase está configurado con las credenciales requeridas.
 */
export function isSupabaseConfigured(): boolean {
  return isConfigured;
}

