export interface PaintingTool {
  id: string;
  nombre: string;
  categoria: 'brochas' | 'rodillos' | 'preparacion' | 'proteccion';
  categoriaLabel: string;
  descripcion: string;
  precioCOP: number;
  stock: number;
  stockMinimo: number;
  unidad: string;
  sku: string;
  badge: string;
  recomendadoPara: string;
  icono: string;
}

export const OFFICIAL_TOOLS_INVENTORY: PaintingTool[] = [
  // --- BROCHAS ---
  {
    id: 'brocha-pro-2',
    nombre: 'Brocha Profesional 2" Cerdas Suaves',
    categoria: 'brochas',
    categoriaLabel: 'Brochas y Recortes',
    descripcion: 'Cerdas sintéticas tratadas de alta densidad para cortes limpios, esquinas y molduras sin dejar rayas ni marcas.',
    precioCOP: 14500,
    stock: 120,
    stockMinimo: 20,
    unidad: 'Unidad',
    sku: 'BR-PRO-20',
    badge: 'Popular en Obra',
    recomendadoPara: 'Esquinas, marcos de puertas y retoques',
    icono: '🖌️'
  },
  {
    id: 'brocha-pro-3',
    nombre: 'Brocha Profesional 3" Master Obra',
    categoria: 'brochas',
    categoriaLabel: 'Brochas y Recortes',
    descripcion: 'Brocha de alto rendimiento con virola en acero inoxidable para pintura vinílica, acrílica y esmaltes.',
    precioCOP: 19800,
    stock: 85,
    stockMinimo: 15,
    unidad: 'Unidad',
    sku: 'BR-MST-30',
    badge: 'Alto Rendimiento',
    recomendadoPara: 'Zócalos, remates de techos y muros pequeños',
    icono: '🖌️'
  },
  {
    id: 'brocha-angular-25',
    nombre: 'Brocha Angular 2.5" Recortes Precisos',
    categoria: 'brochas',
    categoriaLabel: 'Brochas y Recortes',
    descripcion: 'Corte diagonal ergonómico diseñado para pintar filos de muros y uniones con cielorraso con máxima precisión.',
    precioCOP: 22000,
    stock: 60,
    stockMinimo: 10,
    unidad: 'Unidad',
    sku: 'BR-ANG-25',
    badge: 'Precisión Pro',
    recomendadoPara: 'Bordes perfectos sin cinta',
    icono: '📐'
  },

  // --- RODILLOS ---
  {
    id: 'rodillo-microfibra-9',
    nombre: 'Rodillo Antigoteo Microfibra 9" con Mango',
    categoria: 'rodillos',
    categoriaLabel: 'Rodillos y Mangos',
    descripcion: 'Felpa de microfibra de 3/8" (10mm) con mango ergonómico. Cero salpicaduras y acabado liso uniforme.',
    precioCOP: 28500,
    stock: 95,
    stockMinimo: 25,
    unidad: 'Unidad + Mango',
    sku: 'ROD-MIC-09',
    badge: 'Más Vendido ⭐',
    recomendadoPara: 'Muros interiores y exteriores lisos',
    icono: '🪣'
  },
  {
    id: 'rodillo-epoxico-9',
    nombre: 'Rodillo Epóxico / Industrial 9" Texturado',
    categoria: 'rodillos',
    categoriaLabel: 'Rodillos y Mangos',
    descripcion: 'Resistente a solventes fuertes, poliuretanos y pinturas epóxicas de alto espesor.',
    precioCOP: 36000,
    stock: 40,
    stockMinimo: 10,
    unidad: 'Unidad',
    sku: 'ROD-EPX-09',
    badge: 'Industrial',
    recomendadoPara: 'Pisos industriales y estructuras metálicas',
    icono: '🏭'
  },
  {
    id: 'repuesto-felpa-9',
    nombre: 'Repuesto Felpa Microfibra 9"',
    categoria: 'rodillos',
    categoriaLabel: 'Rodillos y Mangos',
    descripcion: 'Tubo y felpa de repuesto de microfibra lavable de larga vida útil para rodillos estándar de 9".',
    precioCOP: 12900,
    stock: 150,
    stockMinimo: 30,
    unidad: 'Repuesto',
    sku: 'FEL-MIC-09',
    badge: 'Económico',
    recomendadoPara: 'Recambio rápido durante la jornada',
    icono: '🔄'
  },
  {
    id: 'mini-rodillo-4',
    nombre: 'Mini Rodillo 4" con Mango para Rincones',
    categoria: 'rodillos',
    categoriaLabel: 'Rodillos y Mangos',
    descripcion: 'Diseño compacto para pintar detrás de inodoros, tuberías, marcos de ventana y espacios estrechos.',
    precioCOP: 15500,
    stock: 75,
    stockMinimo: 15,
    unidad: 'Kit con mango',
    sku: 'MINI-ROD-04',
    badge: 'Espacios Difíciles',
    recomendadoPara: 'Baños, cocinas y rincones estrechos',
    icono: '🎯'
  },

  // --- PREPARACIÓN DE SUPERFICIES ---
  {
    id: 'espatula-inox-4',
    nombre: 'Espátula Flexible Inoxidable 4"',
    categoria: 'preparacion',
    categoriaLabel: 'Preparación de Superficie',
    descripcion: 'Hoja de acero inoxidable flexible y mango de goma antideslizante para resanar huecos, estucar y raspar pintura suelta.',
    precioCOP: 16500,
    stock: 80,
    stockMinimo: 20,
    unidad: 'Unidad',
    sku: 'ESP-INX-04',
    badge: 'Acero Inox',
    recomendadoPara: 'Resanes, estuco y eliminación de descascaramientos',
    icono: '🛠️'
  },
  {
    id: 'cinta-azul-50m',
    nombre: 'Cinta de Enmascarar Azul Pro 1" x 50m',
    categoria: 'preparacion',
    categoriaLabel: 'Preparación de Superficie',
    descripcion: 'Cinta especial de protección contra rayos UV, adhesivo que no arranca la pintura ni deja residuos al retirarse hasta 14 días.',
    precioCOP: 9800,
    stock: 200,
    stockMinimo: 40,
    unidad: 'Rollo 50m',
    sku: 'CIN-AZU-50',
    badge: 'Protección Limpia',
    recomendadoPara: 'Enmascarado de marcos, pisos y tomas eléctricas',
    icono: '📏'
  },
  {
    id: 'bandeja-pintor-9',
    nombre: 'Bandeja Plástica Reforzada 9"',
    categoria: 'preparacion',
    categoriaLabel: 'Preparación de Superficie',
    descripcion: 'Polipropileno de alta resistencia con textura estriada para escurrir el rodillo y dosificar la pintura eficientemente.',
    precioCOP: 11000,
    stock: 110,
    stockMinimo: 20,
    unidad: 'Unidad',
    sku: 'BAN-PLAS-09',
    badge: 'Lavable',
    recomendadoPara: 'Carga uniforme de rodillo sin derrames',
    icono: '🥣'
  },
  {
    id: 'lija-agua-pack',
    nombre: 'Lija de Agua Grano 150/220 (Pack 3 Pliegos)',
    categoria: 'preparacion',
    categoriaLabel: 'Preparación de Superficie',
    descripcion: 'Carburo de silicio de grano fino para asentar estucos, lijar muros y suavizar entre mano y mano.',
    precioCOP: 7500,
    stock: 140,
    stockMinimo: 30,
    unidad: 'Pack x 3',
    sku: 'LIJ-AGU-P3',
    badge: 'Acabado Suave',
    recomendadoPara: 'Lijado de muros y preparación de pintura',
    icono: '📄'
  },

  // --- PROTECCIÓN Y LOGÍSTICA ---
  {
    id: 'plastico-protector-20m',
    nombre: 'Plástico Protector de Pisos (Rollo 2m x 20m)',
    categoria: 'proteccion',
    categoriaLabel: 'Protección y Equipamiento',
    descripcion: 'Película de polietileno calibre 2 impermeable para cubrir pisos, muebles, puertas y ventanas durante el trabajo.',
    precioCOP: 24000,
    stock: 65,
    stockMinimo: 15,
    unidad: 'Rollo (40 m²)',
    sku: 'PLA-PRO-20',
    badge: 'Cobertura 40 m²',
    recomendadoPara: 'Protección total de pisos de porcelanato y madera',
    icono: '🛡️'
  },
  {
    id: 'extension-telescopica-4m',
    nombre: 'Extensión Telescópica Aluminio 2m a 4m',
    categoria: 'proteccion',
    categoriaLabel: 'Protección y Equipamiento',
    descripcion: 'Vara de aluminio reforzado con punta roscada universal para pintar techos altos y fachadas sin necesidad de andamio.',
    precioCOP: 58000,
    stock: 30,
    stockMinimo: 8,
    unidad: 'Unidad',
    sku: 'EXT-TEL-4M',
    badge: 'Largo Alcance',
    recomendadoPara: 'Cielorrasos altos, fachadas y segundas plantas',
    icono: '🦯'
  }
];
