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

-- 11. TABLA: INVENTARIO DE HERRAMIENTAS Y ACCESORIOS DE PINTURA (Brochas, Rodillos, Lijas, etc.)
CREATE TABLE public.inventario_herramientas (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  categoria TEXT NOT NULL,
  categoria_label TEXT,
  descripcion TEXT,
  precio_cop NUMERIC NOT NULL,
  stock INTEGER NOT NULL DEFAULT 50,
  stock_minimo INTEGER DEFAULT 10,
  unidad TEXT DEFAULT 'Unidad',
  sku TEXT UNIQUE NOT NULL,
  badge TEXT,
  recomendado_para TEXT,
  icono TEXT DEFAULT '🖌️',
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX idx_herramientas_categoria ON public.inventario_herramientas(categoria);

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
ALTER TABLE public.inventario_herramientas ENABLE ROW LEVEL SECURITY;

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

-- Políticas para INVENTARIO HERRAMIENTAS
CREATE POLICY "herramientas_permitir_todo" ON public.inventario_herramientas
  FOR ALL TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- ====================================================================
-- SEED DE INVENTARIO INICIAL DE BROCHAS Y HERRAMIENTAS EN SUPABASE
-- ====================================================================
INSERT INTO public.inventario_herramientas (id, nombre, categoria, categoria_label, descripcion, precio_cop, stock, stock_minimo, unidad, sku, badge, recomendado_para, icono)
VALUES
  ('brocha-pro-2', 'Brocha Profesional 2" Cerdas Suaves', 'brochas', 'Brochas y Recortes', 'Cerdas sintéticas tratadas de alta densidad para cortes limpios, esquinas y molduras sin dejar rayas ni marcas.', 14500, 120, 20, 'Unidad', 'BR-PRO-20', 'Popular en Obra', 'Esquinas, marcos de puertas y retoques', '🖌️'),
  ('brocha-pro-3', 'Brocha Profesional 3" Master Obra', 'brochas', 'Brochas y Recortes', 'Brocha de alto rendimiento con virola en acero inoxidable para pintura vinílica, acrílica y esmaltes.', 19800, 85, 15, 'Unidad', 'BR-MST-30', 'Alto Rendimiento', 'Zócalos, remates de techos y muros pequeños', '🖌️'),
  ('brocha-angular-25', 'Brocha Angular 2.5" Recortes Precisos', 'brochas', 'Brochas y Recortes', 'Corte diagonal ergonómico diseñado para pintar filos de muros y uniones con cielorraso con máxima precisión.', 22000, 60, 10, 'Unidad', 'BR-ANG-25', 'Precisión Pro', 'Bordes perfectos sin cinta', '📐'),
  ('rodillo-microfibra-9', 'Rodillo Antigoteo Microfibra 9" con Mango', 'rodillos', 'Rodillos y Mangos', 'Felpa de microfibra de 3/8" (10mm) con mango ergonómico. Cero salpicaduras y acabado liso uniforme.', 28500, 95, 25, 'Unidad + Mango', 'ROD-MIC-09', 'Más Vendido ⭐', 'Muros interiores y exteriores lisos', '🪣'),
  ('rodillo-epoxico-9', 'Rodillo Epóxico / Industrial 9" Texturado', 'rodillos', 'Rodillos y Mangos', 'Resistente a solventes fuertes, poliuretanos y pinturas epóxicas de alto espesor.', 36000, 40, 10, 'Unidad', 'ROD-EPX-09', 'Industrial', 'Pisos industriales y estructuras metálicas', '🏭'),
  ('repuesto-felpa-9', 'Repuesto Felpa Microfibra 9"', 'rodillos', 'Rodillos y Mangos', 'Tubo y felpa de repuesto de microfibra lavable de larga vida útil para rodillos estándar de 9".', 12900, 150, 30, 'Repuesto', 'FEL-MIC-09', 'Económico', 'Recambio rápido durante la jornada', '🔄'),
  ('mini-rodillo-4', 'Mini Rodillo 4" con Mango para Rincones', 'rodillos', 'Rodillos y Mangos', 'Diseño compacto para pintar detrás de inodoros, tuberías, marcos de ventana y espacios estrechos.', 15500, 75, 15, 'Kit con mango', 'MINI-ROD-04', 'Espacios Difíciles', 'Baños, cocinas y rincones estrechos', '🎯'),
  ('espatula-inox-4', 'Espátula Flexible Inoxidable 4"', 'preparacion', 'Preparación de Superficie', 'Hoja de acero inoxidable flexible y mango de goma antideslizante para resanar huecos, estucar y raspar pintura suelta.', 16500, 80, 20, 'Unidad', 'ESP-INX-04', 'Acero Inox', 'Resanes, estuco y eliminación de descascaramientos', '🛠️'),
  ('cinta-azul-50m', 'Cinta de Enmascarar Azul Pro 1" x 50m', 'preparacion', 'Preparación de Superficie', 'Cinta especial de protección contra rayos UV, adhesivo que no arranca la pintura ni deja residuos al retirarse hasta 14 días.', 9800, 200, 40, 'Rollo 50m', 'CIN-AZU-50', 'Protección Limpia', 'Enmascarado de marcos, pisos y tomas eléctricas', '📏'),
  ('bandeja-pintor-9', 'Bandeja Plástica de Pintor Reforzada 9"', 'preparacion', 'Preparación de Superficie', 'Polipropileno de alta resistencia con textura estriada para escurrir el rodillo y dosificar la pintura eficientemente.', 11000, 110, 20, 'Unidad', 'BAN-PLAS-09', 'Lavable', 'Carga uniforme de rodillo sin derrames', '🥣'),
  ('lija-agua-pack', 'Lija de Agua Grano 150/220 (Pack 3 Pliegos)', 'preparacion', 'Preparación de Superficie', 'Carburo de silicio de grano fino para asentar estucos, lijar muros y suavizar entre mano y mano.', 7500, 140, 30, 'Pack x 3', 'LIJ-AGU-P3', 'Acabado Suave', 'Lijado de muros y preparación de pintura', '📄'),
  ('plastico-protector-20m', 'Plástico Protector de Pisos (Rollo 2m x 20m)', 'proteccion', 'Protección y Equipamiento', 'Película de polietileno calibre 2 impermeable para cubrir pisos, muebles, puertas y ventanas durante el trabajo.', 24000, 65, 15, 'Rollo (40 m²)', 'PLA-PRO-20', 'Cobertura 40 m²', 'Protección total de pisos de porcelanato y madera', '🛡️'),
  ('extension-telescopica-4m', 'Extensión Telescópica Aluminio 2m a 4m', 'proteccion', 'Protección y Equipamiento', 'Vara de aluminio reforzado con punta roscada universal para pintar techos altos y fachadas sin necesidad de andamio.', 58000, 30, 8, 'Unidad', 'EXT-TEL-4M', 'Largo Alcance', 'Cielorrasos altos, fachadas y segundas plantas', '🦯')
ON CONFLICT (id) DO UPDATE SET
  stock = EXCLUDED.stock,
  precio_cop = EXCLUDED.precio_cop,
  descripcion = EXCLUDED.descripcion,
  updated_at = timezone('utc'::text, now());
