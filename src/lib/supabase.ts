import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Credenciales oficiales del proyecto activo Colorlink® en Supabase (Project ID: vhydyisbrimyrtwdisoa)
const PROJECT_SUPABASE_URL = 'https://vhydyisbrimyrtwdisoa.supabase.co';
const PROJECT_SUPABASE_KEY = 'sb_publishable_4du-8mlfrq7AyNABhheJxA_t9ygCH5K';

// Leer variables de entorno si existen y no son obsoletas
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

// Validar que no pertenezcan al proyecto anterior desmantelado ('cehrxxrobxrygpzefsqi' o 'p19hoCYalNGniwo4hbVVrA')
const isCurrentUrl = envUrl && envUrl.includes('vhydyisbrimyrtwdisoa');
const isCurrentKey = envKey && envKey.includes('4du-8mlfrq7AyNABhheJxA');

export const supabaseUrl = isCurrentUrl ? envUrl : PROJECT_SUPABASE_URL;
export const supabaseAnonKey = isCurrentKey ? envKey : PROJECT_SUPABASE_KEY;

export const isConfigured = Boolean(supabaseUrl && supabaseAnonKey);

/**
 * Único cliente de Supabase para toda la aplicación.
 * Garantiza que no existan múltiples instancias de createClient().
 */
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

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
