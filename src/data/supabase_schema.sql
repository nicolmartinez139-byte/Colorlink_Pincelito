-- ====================================================================
-- COLORLINK® PINTURAS - ESQUEMA SUPABASE POSTGRESQL (DESDE CERO)
-- Copia y pega todo este script en el SQL Editor de tu proyecto Supabase
-- y haz clic en "Run" (Ejecutar).
-- ====================================================================

-- 1. LIMPIEZA INICIAL TOTAL (Reinicia desde cero sin conflictos)
DROP TABLE IF EXISTS public.cotizacion_items CASCADE;
DROP TABLE IF EXISTS public.cotizaciones CASCADE;
DROP TABLE IF EXISTS public.evidencia_fotos CASCADE;
DROP TABLE IF EXISTS public.evidencias CASCADE;
DROP TABLE IF EXISTS public.especificaciones_tecnicas CASCADE;
DROP TABLE IF EXISTS public.proyectos CASCADE;
DROP TABLE IF EXISTS public.clientes CASCADE;
DROP TABLE IF EXISTS public.admin_usuarios CASCADE;

-- 2. EXTENSIÓN PARA GENERAR UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 3. TABLA: CLIENTES
CREATE TABLE public.clientes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_user_id UUID NULL,
  nombre_razon_social TEXT NOT NULL,
  nit_documento TEXT NOT NULL,
  responsable TEXT NOT NULL,
  email_responsable TEXT NOT NULL,
  telefono_responsable TEXT,
  canal_entrada TEXT DEFAULT 'Portal Clientes',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX idx_clientes_nit ON public.clientes(nit_documento);

-- 4. TABLA: PROYECTOS
CREATE TABLE public.proyectos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cliente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  order_number TEXT UNIQUE NOT NULL,
  ciudad TEXT NOT NULL,
  tipo_obra TEXT NOT NULL,
  area_m2 NUMERIC NOT NULL,
  fecha_requerida DATE,
  estado TEXT DEFAULT 'validado' CHECK (estado IN ('validado', 'pendiente', 'rechazado')),
  pipeline_step INTEGER DEFAULT 8,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX idx_proyectos_cliente ON public.proyectos(cliente_id);
CREATE INDEX idx_proyectos_order ON public.proyectos(order_number);

-- 5. TABLA: ESPECIFICACIONES TÉCNICAS
CREATE TABLE public.especificaciones_tecnicas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  proyecto_id UUID NOT NULL REFERENCES public.proyectos(id) ON DELETE CASCADE,
  superficie TEXT NOT NULL,
  ambiente TEXT NOT NULL,
  condicion TEXT NOT NULL,
  color_acabado TEXT,
  tipo_pintura TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX idx_especificaciones_proyecto ON public.especificaciones_tecnicas(proyecto_id);

-- 6. TABLA: EVIDENCIAS
CREATE TABLE public.evidencias (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  proyecto_id UUID NOT NULL REFERENCES public.proyectos(id) ON DELETE CASCADE,
  descripcion_libre TEXT,
  observaciones TEXT,
  consentimiento BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX idx_evidencias_proyecto ON public.evidencias(proyecto_id);

-- 7. TABLA: FOTOS DE EVIDENCIA
CREATE TABLE public.evidencia_fotos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  evidencia_id UUID NOT NULL REFERENCES public.evidencias(id) ON DELETE CASCADE,
  nombre_archivo TEXT NOT NULL,
  tamano TEXT,
  url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX idx_fotos_evidencia ON public.evidencia_fotos(evidencia_id);

-- 8. TABLA: COTIZACIONES
CREATE TABLE public.cotizaciones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  proyecto_id UUID NOT NULL REFERENCES public.proyectos(id) ON DELETE CASCADE,
  producto_recomendado TEXT,
  tipo_solucion TEXT,
  tipo_pintura TEXT,
  sellador_imprimante_requerido TEXT,
  manos_sugeridas INTEGER,
  explicacion_manos TEXT,
  factor_desperdicio_porcentaje NUMERIC,
  galones_netos_sin_desperdicio NUMERIC,
  galones_desperdicio NUMERIC,
  rendimiento_teorico_m2_galon NUMERIC,
  galones_requeridos NUMERIC,
  cunetes_requeridos NUMERIC,
  galones_sueltos_requeridos NUMERIC,
  tiempo_estimado_secado TEXT,
  requiere_visita_especialista BOOLEAN DEFAULT false,
  alerta_patologia TEXT,
  subtotal_materiales NUMERIC,
  descuento_porcentaje NUMERIC DEFAULT 0,
  descuento_valor NUMERIC DEFAULT 0,
  subtotal_con_descuento NUMERIC,
  flete_envio NUMERIC DEFAULT 0,
  iva_porcentaje NUMERIC DEFAULT 19,
  iva_valor NUMERIC DEFAULT 0,
  total_presupuesto NUMERIC,
  ciudad_destino TEXT,
  tiempo_entrega_dias TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX idx_cotizaciones_proyecto ON public.cotizaciones(proyecto_id);

-- 9. TABLA: ITEMS DE COTIZACIÓN
CREATE TABLE public.cotizacion_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cotizacion_id UUID NOT NULL REFERENCES public.cotizaciones(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  presentacion TEXT,
  cantidad NUMERIC NOT NULL,
  precio_unitario NUMERIC NOT NULL,
  precio_total NUMERIC NOT NULL,
  descripcion TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX idx_items_cotizacion ON public.cotizacion_items(cotizacion_id);

-- 10. TABLA: USUARIOS ADMINISTRADORES
CREATE TABLE public.admin_usuarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_user_id UUID,
  email TEXT UNIQUE NOT NULL,
  nombre TEXT,
  rol TEXT DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ====================================================================
-- PERMISOS DE ESQUEMA POSTGRESQL (Para roles anon, authenticated)
-- ====================================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

-- ====================================================================
-- POLÍTICAS RLS (Row Level Security) PERMISIVAS
-- Esto resuelve de raíz el error 42501 (row-level security policy violation)
-- ====================================================================
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proyectos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.especificaciones_tecnicas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evidencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evidencia_fotos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cotizaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cotizacion_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_usuarios ENABLE ROW LEVEL SECURITY;

-- Políticas para CLIENTES
CREATE POLICY "clientes_permitir_todo" ON public.clientes
  FOR ALL TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Políticas para PROYECTOS
CREATE POLICY "proyectos_permitir_todo" ON public.proyectos
  FOR ALL TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Políticas para ESPECIFICACIONES TÉCNICAS
CREATE POLICY "especificaciones_permitir_todo" ON public.especificaciones_tecnicas
  FOR ALL TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Políticas para EVIDENCIAS
CREATE POLICY "evidencias_permitir_todo" ON public.evidencias
  FOR ALL TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Políticas para EVIDENCIA FOTOS
CREATE POLICY "fotos_permitir_todo" ON public.evidencia_fotos
  FOR ALL TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Políticas para COTIZACIONES
CREATE POLICY "cotizaciones_permitir_todo" ON public.cotizaciones
  FOR ALL TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Políticas para ITEMS DE COTIZACIÓN
CREATE POLICY "items_permitir_todo" ON public.cotizacion_items
  FOR ALL TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Políticas para ADMIN USUARIOS
CREATE POLICY "admin_permitir_todo" ON public.admin_usuarios
  FOR ALL TO anon, authenticated
  USING (true)
  WITH CHECK (true);
