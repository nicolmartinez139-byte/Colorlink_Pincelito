import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Leer variables de entorno si existen y son válidas
const envUrl = (
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) ||
  (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_URL) ||
  ''
) as string;

const envKey = (
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) ||
  (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_ANON_KEY) ||
  ''
) as string;

const isValidSupabaseUrl = (url: string): boolean => {
  if (!url || typeof url !== 'string') return false;
  if (url.includes('placeholder') || url.includes('xyzcompany') || url.includes('vhydyisbrimyrtwdisoa')) {
    // vhydyisbrimyrtwdisoa ya no está activo en Supabase
    return false;
  }
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
};

export const isConfigured = Boolean(isValidSupabaseUrl(envUrl) && envKey && envKey.length > 10);
export const supabaseUrl = isConfigured ? envUrl : 'https://colorlink-offline.supabase.co';
export const supabaseAnonKey = isConfigured ? envKey : 'colorlink-offline-key';

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

