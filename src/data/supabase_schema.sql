-- ====================================================================
-- ESQUEMA DE BASE DE DATOS SUPABASE PARA COLORLINK PINTURAS
-- Ejecuta este script en el SQL Editor de tu proyecto en Supabase
-- (https://supabase.com/dashboard/project/_/sql)
-- ====================================================================

-- 1. EXTENSIÓN PARA UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLA DE PERFILES DE CLIENTE / USUARIOS
CREATE TABLE IF NOT EXISTS public.perfiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  empresa TEXT NOT NULL,
  nit TEXT NOT NULL,
  responsable TEXT NOT NULL,
  telefono TEXT NOT NULL,
  ciudad TEXT NOT NULL DEFAULT 'Medellín',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. TABLA DE PEDIDOS Y COTIZACIONES
CREATE TABLE IF NOT EXISTS public.pedidos (
  id TEXT PRIMARY KEY, -- Ej: 'PED-2026-081'
  user_id UUID REFERENCES public.perfiles(id) ON DELETE SET NULL,
  cliente_email TEXT NOT NULL,
  cliente_nombre TEXT NOT NULL,
  cliente_empresa TEXT NOT NULL,
  nit TEXT NOT NULL,
  telefono TEXT NOT NULL,
  ciudad TEXT NOT NULL,
  area_m2 NUMERIC NOT NULL,
  tipo_pintura TEXT NOT NULL,
  color TEXT NOT NULL,
  subtotal_cop NUMERIC NOT NULL,
  flete_cop NUMERIC NOT NULL DEFAULT 0,
  total_cop NUMERIC NOT NULL,
  estado TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aprobado', 'en_preparacion', 'en_ruta', 'entregado')),
  vehiculo_asignado TEXT,
  placa TEXT,
  conductor TEXT,
  detalles_json JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. ÍNDICES DE BÚSQUEDA RÁPIDA
CREATE INDEX IF NOT EXISTS idx_pedidos_cliente_email ON public.pedidos(cliente_email);
CREATE INDEX IF NOT EXISTS idx_pedidos_estado ON public.pedidos(estado);
CREATE INDEX IF NOT EXISTS idx_perfiles_email ON public.perfiles(email);

-- 5. HABILITAR ROW LEVEL SECURITY (RLS)
ALTER TABLE public.perfiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;

-- 6. POLÍTICAS DE ACCESO (Permitir lectura y creación pública / autenticada)
CREATE POLICY "Permitir lectura a usuarios" 
  ON public.pedidos FOR SELECT 
  USING (true);

CREATE POLICY "Permitir insercion de pedidos" 
  ON public.pedidos FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Permitir actualizacion de pedidos a administradores" 
  ON public.pedidos FOR UPDATE 
  USING (true);

CREATE POLICY "Permitir lectura de perfiles" 
  ON public.perfiles FOR SELECT 
  USING (true);

CREATE POLICY "Permitir registro de perfiles" 
  ON public.perfiles FOR INSERT 
  WITH CHECK (true);

-- 7. DATOS DE PRUEBA INICIALES (Caso Constructora Horizonte)
INSERT INTO public.pedidos (
  id, cliente_email, cliente_nombre, cliente_empresa, nit, telefono, ciudad,
  area_m2, tipo_pintura, color, subtotal_cop, flete_cop, total_cop, estado,
  vehiculo_asignado, placa, conductor, created_at
) VALUES 
(
  'PED-2026-081',
  'vgomez@constructorahorizonte.com.co',
  'Arq. Valentina Gómez',
  'Constructora Horizonte S.A.S.',
  '900854219',
  '+57 312 845 6721',
  'Medellín',
  85,
  'Pintura Tipo 1 Exterior de Alta Resistencia',
  'Gris Cemento (Mate)',
  1540000,
  0,
  1742000,
  'en_preparacion',
  'Furgón Colorlink #08',
  'WLL-482',
  'Carlos Restrepo',
  NOW() - INTERVAL '4 hours'
),
(
  'PED-2026-072',
  'vgomez@constructorahorizonte.com.co',
  'Arq. Valentina Gómez',
  'Constructora Horizonte S.A.S.',
  '900854219',
  '+57 312 845 6721',
  'Medellín',
  40,
  'Sellamur Acrílico Hidrófugo',
  'Transparente Mate',
  450000,
  0,
  450000,
  'entregado',
  'Furgón Colorlink #08',
  'WLL-482',
  'Carlos Restrepo',
  NOW() - INTERVAL '5 days'
)
ON CONFLICT (id) DO NOTHING;
