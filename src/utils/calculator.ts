import { ProjectFormData, TechnicalCalculationResult, BudgetBreakdown, BudgetItem, PaintTypeProfile, PaintTypeCategory } from '../types/form';

export interface PaintBrand {
  id: string;
  name: string;
  tagline: string;
  origin: string;
  badgeColor: string;
  accentBorder: string;
  description: string;
  popularProduct: string;
  factorPrecio: number; // Multiplicador comercial respecto a la base estándar
  etiquetaPrecio: string; // Ej: "Precio Base Oficial", "-15% Fábrica Directa", "+15% Importada", etc.
  ahorroPorcentaje: number; // Ej: 0, -15, -8, -4, -20, +15
  precioRefCuneteT1: number; // Precio de referencia Cuñete Exterior Tipo 1
  precioRefGalonT1: number; // Precio de referencia Galón Exterior Tipo 1
}

export const AVAILABLE_PAINT_BRANDS: PaintBrand[] = [
  {
    id: 'pintuco',
    name: 'Pintuco®',
    tagline: 'Líder en pinturas y recubrimientos en Colombia',
    origin: 'Colombia',
    badgeColor: 'bg-red-600 text-white',
    accentBorder: 'hover:border-red-500',
    popularProduct: 'Koraza Pro & Viniltex',
    description: 'Máxima durabilidad certificada NTC con tecnología antihumedad y alta solidez de color a la intemperie.',
    factorPrecio: 1.0,
    etiquetaPrecio: 'Oficial Estándar (100%)',
    ahorroPorcentaje: 0,
    precioRefCuneteT1: 398000,
    precioRefGalonT1: 89500
  },
  {
    id: 'colorlink_pro',
    name: 'Colorlink® Pro',
    tagline: 'Fábrica directa & tintometría computarizada',
    origin: 'Fábrica Colorlink',
    badgeColor: 'bg-purple-600 text-white',
    accentBorder: 'hover:border-purple-500',
    popularProduct: 'Fórmula Industrial Especializada',
    description: 'Tintometría computarizada de alta precisión y resina 100% acrílica con pigmentación alemana premium.',
    factorPrecio: 0.85,
    etiquetaPrecio: '⚡ Directo Fábrica (-15%)',
    ahorroPorcentaje: -15,
    precioRefCuneteT1: 338000,
    precioRefGalonT1: 76000
  },
  {
    id: 'tito_pabon',
    name: 'Tito Pabón®',
    tagline: 'Pintura ecológica y arquitectónica de alto desempeño',
    origin: 'Colombia',
    badgeColor: 'bg-emerald-600 text-white',
    accentBorder: 'hover:border-emerald-500',
    popularProduct: 'Acriltech Fachadas & Vinilo Tipo 1',
    description: 'Formulaciones ecológicas con bajo VOC, excelente nivelación y gran poder de cubrimiento en obra.',
    factorPrecio: 0.92,
    etiquetaPrecio: '🌱 Ecológica (-8%)',
    ahorroPorcentaje: -8,
    precioRefCuneteT1: 366000,
    precioRefGalonT1: 82500
  },
  {
    id: 'corona',
    name: 'Corona® Pinturas',
    tagline: 'Protección y tecnología para tus espacios',
    origin: 'Colombia',
    badgeColor: 'bg-blue-600 text-white',
    accentBorder: 'hover:border-blue-500',
    popularProduct: 'CoronaPro Fachadas & Lavable',
    description: 'Pinturas superlavables con tecnología microbicida que previene hongos y manchas difíciles.',
    factorPrecio: 0.96,
    etiquetaPrecio: '🛡️ Antihongos (-4%)',
    ahorroPorcentaje: -4,
    precioRefCuneteT1: 382000,
    precioRefGalonT1: 86000
  },
  {
    id: 'sapolin',
    name: 'Sapolín® (Invesa)',
    tagline: 'Poder cubriente superior para contratistas',
    origin: 'Colombia',
    badgeColor: 'bg-amber-600 text-white',
    accentBorder: 'hover:border-amber-500',
    popularProduct: 'Vinilo Acrílico & Esmaltes',
    description: 'Excelente rendimiento por m², secado rápido y precio competitivo para grandes áreas residenciales y comerciales.',
    factorPrecio: 0.80,
    etiquetaPrecio: '📉 Contratista (-20%)',
    ahorroPorcentaje: -20,
    precioRefCuneteT1: 318000,
    precioRefGalonT1: 71500
  },
  {
    id: 'sherwin_williams',
    name: 'Sherwin-Williams®',
    tagline: 'Tecnología global de recubrimientos',
    origin: 'Internacional',
    badgeColor: 'bg-sky-600 text-white',
    accentBorder: 'hover:border-sky-500',
    popularProduct: 'Loxon Fachadas & SuperPaint',
    description: 'Resistencia arquitectónica probada en climas extremos con elasticidad superior para evitar microfisuras.',
    factorPrecio: 1.15,
    etiquetaPrecio: '⭐ Importada (+15%)',
    ahorroPorcentaje: 15,
    precioRefCuneteT1: 458000,
    precioRefGalonT1: 103000
  }
];

export function getPaintTypePrice(tipo: PaintTypeCategory, brandName?: string): { precioGalon: number; precioCunete: number } {
  const baseProfile = PAINT_TYPE_PROFILES[tipo] || PAINT_TYPE_PROFILES['Exterior Tipo 1'];
  const brand = AVAILABLE_PAINT_BRANDS.find((b) => b.name === brandName) || AVAILABLE_PAINT_BRANDS[0];
  const factor = brand?.factorPrecio ?? 1.0;

  return {
    precioGalon: Math.round((baseProfile.precioGalon * factor) / 500) * 500,
    precioCunete: Math.round((baseProfile.precioCunete * factor) / 1000) * 1000
  };
}

// Clasificación Oficial según Norma Técnica Colombiana (NTC 1335 / NTC 5828) para Pinturas Arquitectónicas, Esmaltes e Industriales
export const PAINT_TYPE_PROFILES: Record<PaintTypeCategory, PaintTypeProfile> = {
  // --- 🌤️ LÍNEA EXTERIOR & FACHADAS ---
  'Exterior Tipo 1': {
    tipo: 'Exterior Tipo 1',
    linea: 'Exterior',
    nivel: 'Tipo 1',
    nombreComercial: 'Colorlink Koraza Pro Fachadas 100% Acrílica (Exterior Tipo 1)',
    normaNTC: 'NTC 1335 / NTC 5828 (Lavabilidad Superior >1.200 ciclos / Filtro UV)',
    resistenciaLavabilidad: 'Máxima resistencia a intemperie severa, rayos UV, sol directo y lluvia torrencial',
    durabilidadAnos: '5 a 7 Años Certificados',
    usoRecomendado: 'Fachadas exteriores de edificios, casas y muros perimetrales expuestos',
    precioGalon: 89500,
    precioCunete: 398000,
    icono: '🌤️'
  },
  'Exterior Tipo 2': {
    tipo: 'Exterior Tipo 2',
    linea: 'Exterior',
    nivel: 'Tipo 2',
    nombreComercial: 'Colorlink Fachada Estándar Vinil-Acrílica (Exterior Tipo 2)',
    normaNTC: 'NTC 1335 Tipo 2 Exterior (Lavabilidad Media >600 ciclos / Antihongos)',
    resistenciaLavabilidad: 'Resistencia a intemperie moderada, muros semicubiertos y aleros',
    durabilidadAnos: '3 a 4 Años',
    usoRecomendado: 'Muros exteriores protegidos, aleros, terrazas techadas y cerramientos',
    precioGalon: 74000,
    precioCunete: 315000,
    icono: '⛅'
  },
  'Exterior Elastomérica': {
    tipo: 'Exterior Elastomérica',
    linea: 'Exterior',
    nivel: 'Alta Elasticidad',
    nombreComercial: 'Colorlink Membrana Elastomérica Impermeabilizante Fachadas',
    normaNTC: 'NTC 5828 (Elongación >300% / Puenteo de microfisuras hasta 1.2mm)',
    resistenciaLavabilidad: 'Impermeabilización total impermeable al agua de lluvia y vapor transpirable',
    durabilidadAnos: '7 a 10 Años',
    usoRecomendado: 'Fachadas con fisuras térmicas, culatas expuestas y muros con filtración',
    precioGalon: 98000,
    precioCunete: 445000,
    icono: '🛡️'
  },
  'Exterior Tipo 3': {
    tipo: 'Exterior Tipo 3',
    linea: 'Exterior',
    nivel: 'Tipo 3',
    nombreComercial: 'Colorlink Base Imprimante & Fondeo Fachada (Exterior Tipo 3)',
    normaNTC: 'NTC 1335 Tipo 3 Exterior (Fondeo y regularización de absorción)',
    resistenciaLavabilidad: 'Capa base de impregnación para regularizar sustratos o cerramientos provisionales',
    durabilidadAnos: '1 Año acabado / Fondeo permanente',
    usoRecomendado: 'Primera mano en revoque exterior nuevo o cerramientos de obra',
    precioGalon: 52000,
    precioCunete: 215000,
    icono: '🧱'
  },

  // --- 🏠 LÍNEA INTERIOR & CIELORRASOS ---
  'Interior Tipo 1': {
    tipo: 'Interior Tipo 1',
    linea: 'Interior',
    nivel: 'Tipo 1',
    nombreComercial: 'Colorlink Vinilo Pro Interior Superlavable (Interior Tipo 1)',
    normaNTC: 'NTC 1335 Tipo 1 Interior (Alta Lavabilidad >800 ciclos de lavado)',
    resistenciaLavabilidad: 'Superlavable con agua y jabón, resistente a grasa, manchas y alto tráfico',
    durabilidadAnos: '4 a 5 Años',
    usoRecomendado: 'Muros interiores de alto tráfico: salas, comedores, pasillos, cocinas, consultorios',
    precioGalon: 78000,
    precioCunete: 320000,
    icono: '🏠'
  },
  'Interior Tipo 2': {
    tipo: 'Interior Tipo 2',
    linea: 'Interior',
    nivel: 'Tipo 2',
    nombreComercial: 'Colorlink Vinilo Estándar Interior Lavable (Interior Tipo 2)',
    normaNTC: 'NTC 1335 Tipo 2 Interior (Lavabilidad Media >400 ciclos)',
    resistenciaLavabilidad: 'Lavable moderado, remoción de polvo y manchas leves con esponja húmeda',
    durabilidadAnos: '3 a 4 Años',
    usoRecomendado: 'Muros interiores de tráfico medio/bajo: habitaciones, alcobas, estudios',
    precioGalon: 62000,
    precioCunete: 260000,
    icono: '🛏️'
  },
  'Interior Tipo 3': {
    tipo: 'Interior Tipo 3',
    linea: 'Interior',
    nivel: 'Tipo 3',
    nombreComercial: 'Colorlink Económica Cielorrasos & Fondeo (Interior Tipo 3)',
    normaNTC: 'NTC 1335 Tipo 3 Interior (Bajo frote / Cero abrasión >100 ciclos)',
    resistenciaLavabilidad: 'Acabado mate de alto poder de relleno no lavable al frote húmedo continuo',
    durabilidadAnos: '1 a 2 Años',
    usoRecomendado: 'Cielorrasos, techos, placas de yeso/drywall o primera mano económica',
    precioGalon: 45000,
    precioCunete: 185000,
    icono: '🪧'
  },
  'Interior Baños y Cocinas': {
    tipo: 'Interior Baños y Cocinas',
    linea: 'Interior',
    nivel: 'Antihongos & Humedad',
    nombreComercial: 'Colorlink Baños y Cocinas Antihongos con Microbicida Activo',
    normaNTC: 'NTC 1335 / ASTM D3273 (Cero desarrollo fúngico en vapores continuos)',
    resistenciaLavabilidad: 'Película impermeable resistente a vapor caliente, condensación y grasas',
    durabilidadAnos: '4 a 6 Años',
    usoRecomendado: 'Baños, cocinas, zonas de ropas, lavanderías y saunas residenciales',
    precioGalon: 86000,
    precioCunete: 360000,
    icono: '🚿'
  },

  // --- 🔩 LÍNEA ESMALTES & METALES ---
  'Esmalte Sintético Brillante': {
    tipo: 'Esmalte Sintético Brillante',
    linea: 'Esmaltes & Metales',
    nivel: 'Alquídico Premium',
    nombreComercial: 'Colorlink Esmalte Sintético Brillante Pintulux Ultra',
    normaNTC: 'NTC 1283 (Esmaltes Alquídicos de Secado Rápido)',
    resistenciaLavabilidad: 'Brillo espejo, alta dureza y máxima resistencia al frote y rayado',
    durabilidadAnos: '5 a 7 Años',
    usoRecomendado: 'Puertas metálicas, portones, rejas, pasamanos, tuberías y carpintería metálica',
    precioGalon: 94000,
    precioCunete: 410000,
    icono: '✨'
  },
  'Esmalte Satinado / Mate': {
    tipo: 'Esmalte Satinado / Mate',
    linea: 'Esmaltes & Metales',
    nivel: 'Alquídico Satinado',
    nombreComercial: 'Colorlink Esmalte Satinado Decorativo Maderas y Metales',
    normaNTC: 'NTC 1283 (Acabado Satinado Terso de Alta Nivelación)',
    resistenciaLavabilidad: 'Tersura sedosa, lavable, sin reflejos molestos en interiores y carpintería',
    durabilidadAnos: '4 a 5 Años',
    usoRecomendado: 'Muebles de madera, marcos de puertas, rodapiés y perfiles decorativos',
    precioGalon: 92000,
    precioCunete: 395000,
    icono: '🎨'
  },
  'Anticorrosivo Alquídico': {
    tipo: 'Anticorrosivo Alquídico',
    linea: 'Esmaltes & Metales',
    nivel: 'Fosfato de Zinc',
    nombreComercial: 'Colorlink Anticorrosivo Estructural de Alto Desempeño',
    normaNTC: 'NTC 1651 (Primer Anticorrosivo Inhibidor de Óxido)',
    resistenciaLavabilidad: 'Inhibición galvánica contra oxidación y adherencia superior sobre acero',
    durabilidadAnos: '5 a 8 Años en sistema',
    usoRecomendado: 'Estructuras metálicas, vigas, perfiles de hierro y carrocerías',
    precioGalon: 78000,
    precioCunete: 345000,
    icono: '🛡️'
  },

  // --- 🏭 LÍNEA INDUSTRIAL & PISOS ---
  'Epóxica Altos Sólidos Pisos': {
    tipo: 'Epóxica Altos Sólidos Pisos',
    linea: 'Industrial & Pisos',
    nivel: 'Bicomponente 100% Sólidos',
    nombreComercial: 'Colorlink Pintucoat Epóxico Pisos & Grado Clínico Aséptico',
    normaNTC: 'NTC 4060 (Recubrimientos Epóxicos para Concreto y Pisos Industriales)',
    resistenciaLavabilidad: 'Inmune a tráfico pesado de montacargas, derrames químicos y desinfectantes',
    durabilidadAnos: '8 a 10 Años',
    usoRecomendado: 'Bodegas, quirófanos, plantas de alimentos, parqueaderos y talleres mecánicos',
    precioGalon: 198000,
    precioCunete: 890000,
    icono: '🏭'
  },
  'Poliuretano Alifático': {
    tipo: 'Poliuretano Alifático',
    linea: 'Industrial & Pisos',
    nivel: 'Poliuretano 2K UV',
    nombreComercial: 'Colorlink Poliuretano Alifático Alta Resistencia UV & Química',
    normaNTC: 'ASTM D4541 / NTC 4060 (Retención de brillo y resistencia a la intemperie)',
    resistenciaLavabilidad: 'Máxima resistencia química, no amarillea con el sol y resiste solventes',
    durabilidadAnos: '7 a 10 Años',
    usoRecomendado: 'Pisos expuestos al sol, tanques exteriores, helipuertos y canchas techadas',
    precioGalon: 235000,
    precioCunete: 980000,
    icono: '☀️'
  },
  'Tráfico y Canchas': {
    tipo: 'Tráfico y Canchas',
    linea: 'Industrial & Pisos',
    nivel: 'Acrílica Tráfico',
    nombreComercial: 'Colorlink Pintura Tráfico Pesado & Canchas Deportivas',
    normaNTC: 'NTC 1360 (Pinturas de Demarcación y Tráfico Vial)',
    resistenciaLavabilidad: 'Secado en 15 minutos, alta fricción antideslizante y resistencia a llantas',
    durabilidadAnos: '2 a 3 Años en tráfico continuo',
    usoRecomendado: 'Parqueaderos, pasos peatonales, canchas de microfútbol, tenis y ciclorrutas',
    precioGalon: 88000,
    precioCunete: 385000,
    icono: '🏀'
  },

  // --- 🪵 LÍNEA MADERAS & ESPECIALES ---
  'Barniz y Laca Maderas': {
    tipo: 'Barniz y Laca Maderas',
    linea: 'Maderas & Especiales',
    nivel: 'Poliuretano Filtro UV',
    nombreComercial: 'Colorlink Barniz Marino y Poliuretano Maderas Finas',
    normaNTC: 'NTC 1148 (Barnices Transparentes con Filtro Solar para Maderas)',
    resistenciaLavabilidad: 'Resina flexible hidrófuga que protege contra humedad, hongos y decoloración solar',
    durabilidadAnos: '3 a 5 Años',
    usoRecomendado: 'Decks exteriores, pérgolas, puertas de madera maciza, balcones y ventanas',
    precioGalon: 96000,
    precioCunete: 420000,
    icono: '🪵'
  },

  // --- MAPEOS DE COMPATIBILIDAD ---
  'Tipo 1': {
    tipo: 'Tipo 1',
    linea: 'Exterior',
    nivel: 'Tipo 1',
    nombreComercial: 'Colorlink Koraza Pro Fachadas 100% Acrílica (Tipo 1)',
    normaNTC: 'NTC 1335 Tipo 1 (Lavabilidad Superior >80% / >800 ciclos de frote)',
    resistenciaLavabilidad: 'Máxima resistencia a intemperie, rayos UV, lluvia torrencial y lavado severo',
    durabilidadAnos: '5 a 7 Años Certificados',
    usoRecomendado: 'Fachadas exteriores, muros exteriores, patios, zonas húmedas o alto tráfico',
    precioGalon: 89500,
    precioCunete: 398000,
    icono: '🌤️'
  },
  'Tipo 2': {
    tipo: 'Tipo 2',
    linea: 'Interior',
    nivel: 'Tipo 2',
    nombreComercial: 'Colorlink Viniltex Muros Interiores Lavable (Tipo 2)',
    normaNTC: 'NTC 1335 Tipo 2 (Lavabilidad Intermedia >400 ciclos de lavado)',
    resistenciaLavabilidad: 'Resistente a limpieza con esponja, desmanchado doméstico y tráfico medio',
    durabilidadAnos: '3 a 4 Años',
    usoRecomendado: 'Muros interiores residenciales, oficinas, pasillos secos, alcobas',
    precioGalon: 62000,
    precioCunete: 260000,
    icono: '🏠'
  },
  'Tipo 3': {
    tipo: 'Tipo 3',
    linea: 'Interior',
    nivel: 'Tipo 3',
    nombreComercial: 'Colorlink Económica Cielorrasos & Fondeo (Tipo 3)',
    normaNTC: 'NTC 1335 Tipo 3 (Bajo frote / Cero abrasión >100 ciclos)',
    resistenciaLavabilidad: 'Acabado mate básico no lavable al frote húmedo continuo',
    durabilidadAnos: '1 a 2 Años',
    usoRecomendado: 'Cielorrasos, sótanos secos, primera mano de fondeo o bodegas provisionales',
    precioGalon: 45000,
    precioCunete: 185000,
    icono: '🪧'
  }
};

// Precios de mercado reales vigentes en Colombia (COP) para línea arquitectónica e industrial profesional Pintuco
export interface ProductPriceItem {
  cuñete5Gal: number;
  galon: number;
  nombreComercial: string;
}

export const PRODUCT_PRICES: Record<string, ProductPriceItem> = {
  'Koraza Doble Vida / Acrilpintuco Elastómerico': {
    cuñete5Gal: 398000,
    galon: 89500,
    nombreComercial: 'Colorlink Koraza Pro Fachadas 100% Acrílica (Tipo 1)'
  },
  'Koraza Pro Pintura Exterior Acrílica 100%': {
    cuñete5Gal: 398000,
    galon: 89500,
    nombreComercial: 'Colorlink Koraza Pro Fachadas 100% Acrílica (Tipo 1)'
  },
  'Viniltex Avanzado / Antibacterial': {
    cuñete5Gal: 285000,
    galon: 68000,
    nombreComercial: 'Colorlink Viniltex Muros Interiores Lavable (Tipo 2)'
  },
  'Pintura Economica Cielos Tipo 3': {
    cuñete5Gal: 185000,
    galon: 45000,
    nombreComercial: 'Colorlink Económica Cielorrasos & Fondeo (Tipo 3)'
  },
  'Pintucoat Epóxico Poliamida de Alto Sólidos': {
    cuñete5Gal: 840000,
    galon: 192000,
    nombreComercial: 'Pintucoat Epóxico Poliamida Alto Sólidos (Kit A+B)'
  },
  'Pisos Epóxicos Autonivelante Pintucoat': {
    cuñete5Gal: 920000,
    galon: 215000,
    nombreComercial: 'Pisos Epóxicos Autonivelante Pintucoat Industrial'
  },
  'Esmalte Sintético Pintucoat + Anticorrosivo Wash Primer': {
    cuñete5Gal: 410000,
    galon: 94000,
    nombreComercial: 'Esmalte Sintético Pintulux Ultra + Anticorrosivo Wash Primer'
  }
};

export const REAL_PRICES_COP = {
  productos: PRODUCT_PRICES,
  // Imprimantes y Selladores
  imprimantes: {
    sellomaxCuñete: 215000,
    sellomaxGalon: 52000,
    epoxicoPrimerGalon: 165000,
    viniltexSelladorGalon: 42000
  },

  // Tratamiento de patologías
  patologias: {
    masillaElastomericaGrietasGalon: 68000,
    aquastopBarreraHumedadGalon: 79000,
    transformadorOxidoGalon: 58000
  },

  // Tarifas de transporte / fletes nacionales por ciudad (Despacho asegurado desde CEDI a Obra)
  fletesPorCiudad: {
    'Medellín': { costo: 45000, tiempo: '24 a 48 horas', cedi: 'CEDI Principal Guarne / Medellín' },
    'Bogotá D.C.': { costo: 75000, tiempo: '24 a 48 horas', cedi: 'CEDI Sabana Mosquera' },
    'Cali': { costo: 80000, tiempo: '48 horas', cedi: 'CEDI Valle Yumbo' },
    'Barranquilla': { costo: 110000, tiempo: '48 a 72 horas', cedi: 'CEDI Costa Malambo' },
    'Cartagena': { costo: 115000, tiempo: '48 a 72 horas', cedi: 'CEDI Bolívar Mamonal' },
    'Bucaramanga': { costo: 90000, tiempo: '48 horas', cedi: 'CEDI Santanderes Girón' },
    'Pereira': { costo: 70000, tiempo: '24 a 48 horas', cedi: 'CEDI Eje Cafetero Dosquebradas' },
    'Otra Ciudad': { costo: 135000, tiempo: '3 a 5 días hábiles', cedi: 'Red Logística Nacional' }
  }
};

export function formatCOP(amount?: number | null): string {
  const num = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  }).format(num);
}

export function getRealisticCoatsRecommendation(
  tipoPintura: string = '',
  superficie: string = '',
  condicion: string = '',
  tipoObra: string = '',
  marcaPintura: string = '',
  colorAcabado: string = '',
  colorSecundario: string = '',
  dosColoresHabilitado: boolean = false
): { manos: number; motivo: string; norma: string } {
  const tp = (tipoPintura || '').toLowerCase();
  const cond = (condicion || '').toLowerCase();
  const sup = (superficie || '').toLowerCase();
  const obra = (tipoObra || '').toLowerCase();
  const brand = marcaPintura ? String(marcaPintura).replace(/®/g, '').trim() : 'Pintuco';
  const color1 = colorAcabado ? String(colorAcabado).toLowerCase() : '';
  const color2 = colorSecundario ? String(colorSecundario).toLowerCase() : '';

  // Detección de tonos oscuros o pigmentos de saturación profunda
  const tonosIntensos = ['negro', 'grafito', 'gris oscuro', 'rojo', 'vinotinto', 'azul oscuro', 'azul rey', 'terracota', 'mostaza', 'verde militar', 'verde esmeralda', 'café', 'chocolate'];
  const esColorIntenso = tonosIntensos.some(t => color1.includes(t) || (dosColoresHabilitado && color2.includes(t)));

  // 1. Barniz y Laca Maderas
  if (tp.includes('barniz') || tp.includes('madera') || sup.includes('madera')) {
    return {
      manos: 3,
      motivo: `3 manos requeridas para carpintería de madera (${brand}): 1ª mano diluida para impregnación profunda en veta, 2ª mano de cuerpo con lijado suave intermedio (grano 320), y 3ª mano de sellado hidrorrepelente con filtro solar UV.`,
      norma: 'Norma NTC 1148'
    };
  }

  // 2. Exterior Elastomérica Impermeabilizante
  if (tp.includes('elastomérica') || tp.includes('elastomerica')) {
    const manos = (cond.includes('fisuras') || cond.includes('descascaramiento') || cond.includes('nueva')) ? 3 : 2;
    return {
      manos,
      motivo: `${manos} manos requeridas para membrana elastomérica ${brand}: Necesarias para lograr un espesor de película seca mínimo (DFT >150-200 micras) que garantice elongación elástica del 300% para puentear microfisuras y crear barrera 100% impermeable en fachadas.`,
      norma: 'NTC 1335 / ASTM D6904'
    };
  }

  // 3. Tráfico y Canchas Deportivas
  if (tp.includes('tráfico') || tp.includes('trafico') || tp.includes('canchas')) {
    const esRepinte = cond.includes('buen estado') || cond.includes('existente');
    return {
      manos: esRepinte ? 1 : 2,
      motivo: esRepinte
        ? `1 mano de alto espesor (repinte vial ${brand}): Rinde la reflectividad y contraste óptimos sin saturar la capa asfáltica previa.`
        : `2 manos cruzadas (${brand}): 1ª mano de anclaje y penetración en el poro del pavimento y 2ª mano de rodamiento de alta fricción con microesferas antideslizantes.`,
      norma: 'NTC 1360 / ASTM D711'
    };
  }

  // 4. Interior Tipo 3 (Cielorrasos, Techos, Placas de Drywall, Fondeo)
  if (tp.includes('tipo 3') || obra.includes('cielorraso') || sup.includes('drywall')) {
    const esMantenimiento = cond.includes('buen estado') || cond.includes('pintada');
    return {
      manos: esMantenimiento ? 1 : 2,
      motivo: esMantenimiento
        ? `1 mano recomendada: En techos y cielorrasos con pintura existente en buen estado en tono blanco/neutro, 1 sola mano con rodillo antigoteo refresca y cubre perfectamente sin sobrecargar de peso la estructura de yeso.`
        : `2 manos requeridas: En drywall nuevo o fondeo con ${brand} Tipo 3, la 1ª mano satura el yeso y la 2ª mano unifica la textura mate antireflejo.`,
      norma: 'NTC 1335'
    };
  }

  // 5. Esmaltes & Anticorrosivos sobre Metales
  if (tp.includes('esmalte') || tp.includes('anticorrosivo') || sup.includes('metal')) {
    const esMantenimiento = cond.includes('buen estado');
    return {
      manos: esMantenimiento ? 1 : 2,
      motivo: `2 manos de acabado esmalte ${brand} sobre 1 mano de base anticorrosiva: Generan una película lisa y nivelada con brillo duradero que aísla el metal del oxígeno y la humedad ambiental.`,
      norma: 'NTC 1651 / NTC 1283'
    };
  }

  // 6. Epóxica Altos Sólidos Pisos & Poliuretano
  if (tp.includes('epóxica') || tp.includes('epoxica') || tp.includes('poliuretano') || tp.includes('pisos')) {
    const esSevero = cond.includes('grasa') || cond.includes('descascaramiento');
    return {
      manos: esSevero ? 3 : 2,
      motivo: esSevero
        ? `3 capas bicomponente A+B ${brand}: Imprimación profunda + 2 capas de acabado de alto espesor para sellar poros contaminados y resistir tráfico de montacargas pesados.`
        : `2 capas cruzadas bicomponente A+B sobre imprimante: Proporcionan una película vitrificada de 8 a 12 mils resistente a abrasión, llantas calientes y derrames químicos según NTC 4060.`,
      norma: 'NTC 4060 / ASTM D4060'
    };
  }

  // 7. Interior Baños y Cocinas (Antihongos)
  if (tp.includes('baños') || tp.includes('cocinas')) {
    return {
      manos: 2,
      motivo: `2 manos densas requeridas (${brand}): Indispensables para formar una película continua con microbicida activo que repela la condensación de vapor de agua y evite la proliferación de moho.`,
      norma: 'NTC 1335 / ASTM D3273'
    };
  }

  // 8. Esquema Bi-Color o Tonos Saturados Intensos
  if (dosColoresHabilitado && esColorIntenso) {
    return {
      manos: 3,
      motivo: `3 manos técnicas requeridas por esquema de doble color y saturación (${colorAcabado || 'Base'} + ${colorSecundario || 'Acento'} con ${brand}): El tono de contraste profundo requiere una 1ª mano de fondeo y 2 manos completas de acabado para eliminar traslapes y lograr un corte perimetral de alta nitidez sin sombras.`,
      norma: 'NTC 1335'
    };
  }

  // 9. Superficies con patologías o cambio drástico de color
  if (cond.includes('fisuras') || cond.includes('descascaramiento') || cond.includes('nueva')) {
    return {
      manos: 3,
      motivo: `3 manos técnicas requeridas por condición de la superficie (${condicion}) con ${brand}: 1ª mano de imprimación/sellado para regularizar la absorción desigual en ${superficie}, 2ª mano de cubrimiento estructural y 3ª mano de acabado final superlavable.`,
      norma: 'NTC 1335'
    };
  }

  return {
    manos: 2,
    motivo: `2 manos recomendadas (${brand} - Norma NTC 1335 para color ${colorAcabado || 'seleccionado'}): 1ª mano de anclaje y nivelación cromática sobre ${superficie}, y 2ª mano de poder cubriente (>96%), textura uniforme y máxima lavabilidad.`,
    norma: 'NTC 1335'
  };
}

export function calculateTechnicalRequirements(formData: Partial<ProjectFormData>): TechnicalCalculationResult {
  const area = formData.areaM2 || 0;
  const superficie = formData.superficie || 'Concreto / Revoque';
  const ambiente = formData.ambiente || 'Exterior Intemperie';
  const condicion = formData.condicion || 'Nueva sin pintar';
  const ciudad = formData.ciudad || 'Medellín';
  const clienteNombre = formData.cliente || '';
  const tipoObra = formData.tipoObra || '';

  // Determinar Tipo de Pintura (Norma NTC 1335 / NTC 5828)
  let tipoPintura: PaintTypeCategory = formData.tipoPintura || 'Interior Tipo 1';
  if (!formData.tipoPintura) {
    if (formData.tipoObra === 'Pisos Industriales' || ambiente.includes('Pisos') || ambiente.includes('Tráfico')) {
      tipoPintura = 'Epóxica Altos Sólidos Pisos';
    } else if (formData.tipoObra === 'Estructura Metálica' || superficie.includes('Metal')) {
      tipoPintura = 'Esmalte Sintético Brillante';
    } else if (superficie.includes('Madera')) {
      tipoPintura = 'Barniz y Laca Maderas';
    } else if (formData.tipoObra === 'Cielorrasos') {
      tipoPintura = 'Interior Tipo 3';
    } else if (ambiente === 'Interior Húmedo (Baños/Cocinas)') {
      tipoPintura = 'Interior Baños y Cocinas';
    } else if (condicion === 'Fisuras leves y humedad' && (ambiente === 'Exterior Intemperie' || formData.tipoObra === 'Fachada Edificio')) {
      tipoPintura = 'Exterior Elastomérica';
    } else if (ambiente === 'Exterior Intemperie' || formData.tipoObra === 'Fachada Edificio') {
      tipoPintura = 'Exterior Tipo 1';
    } else {
      tipoPintura = 'Interior Tipo 1';
    }
  } else if (formData.tipoPintura === 'Tipo 1') {
    tipoPintura = (ambiente === 'Exterior Intemperie' || formData.tipoObra === 'Fachada Edificio') ? 'Exterior Tipo 1' : 'Interior Tipo 1';
  } else if (formData.tipoPintura === 'Tipo 2') {
    tipoPintura = (ambiente === 'Exterior Intemperie') ? 'Exterior Tipo 2' : 'Interior Tipo 2';
  } else if (formData.tipoPintura === 'Tipo 3') {
    tipoPintura = (ambiente === 'Exterior Intemperie') ? 'Exterior Tipo 3' : 'Interior Tipo 3';
  }

  const selectedBrand = formData.marcaPintura || 'Pintuco®';
  const brandObj = AVAILABLE_PAINT_BRANDS.find((b) => b.name === selectedBrand) || AVAILABLE_PAINT_BRANDS[0];
  const brandFactor = brandObj?.factorPrecio ?? 1.0;

  const baseTipoPinturaDetalle = PAINT_TYPE_PROFILES[tipoPintura] || PAINT_TYPE_PROFILES['Exterior Tipo 1'];
  const tipoPinturaDetalle: PaintTypeProfile = {
    ...baseTipoPinturaDetalle,
    precioGalon: Math.round((baseTipoPinturaDetalle.precioGalon * brandFactor) / 500) * 500,
    precioCunete: Math.round((baseTipoPinturaDetalle.precioCunete * brandFactor) / 1000) * 1000
  };

  let productoRecomendado = `${selectedBrand} • ${tipoPinturaDetalle.nombreComercial.replace(/^Colorlink\s+/, '')}`;
  let tipoSolucion = tipoPinturaDetalle.resistenciaLavabilidad;
  if (tipoPintura.includes('Epóxica')) {
    tipoSolucion = 'Sistema Epóxico Bicomponente de Altos Sólidos para Pisos & Grado Clínico';
  } else if (tipoPintura.includes('Poliuretano')) {
    tipoSolucion = 'Sistema Poliuretano Alifático 2K Máxima Resistencia UV & Química';
  } else if (tipoPintura.includes('Esmalte') || tipoPintura.includes('Anticorrosivo')) {
    tipoSolucion = 'Sistema Alquídico Anticorrosivo y Decorativo para Metales y Maderas';
  } else if (tipoPintura.includes('Tráfico')) {
    tipoSolucion = 'Pintura Acrílica de Alta Fricción para Demarcación Vial y Canchas Deportivas';
  } else if (tipoPintura.includes('Barniz')) {
    tipoSolucion = 'Barniz Poliuretano con Filtro Solar para Maderas Nobles';
  } else if (tipoPintura.includes('Baños')) {
    tipoSolucion = 'Pintura Especial Antihongos con Microbicida de Vapor';
  } else if (tipoPintura.includes('Elastomérica')) {
    tipoSolucion = 'Membrana Elastomérica Impermeabilizante Anti-filtraciones';
  } else if (tipoPintura.includes('Exterior')) {
    tipoSolucion = 'Sistema Impermeable y Acrílico para Fachadas & Exteriores';
  } else if (tipoPintura.includes('Tipo 3')) {
    tipoSolucion = 'Pintura Económica para Cielorrasos, Techos & Fondeo';
  } else {
    tipoSolucion = 'Recubrimiento Vinil Acrílico Lavable para Muros Interiores';
  }

  let selladorImprimanteRequerido = 'Sellador Antialcalino Base Solvente / Acrílico';
  const coatRec = getRealisticCoatsRecommendation(
    tipoPintura,
    superficie,
    condicion,
    tipoObra,
    selectedBrand,
    formData.colorAcabado,
    formData.colorSecundario,
    Boolean(formData.dosColoresHabilitado)
  );
  const manosRecomendadasPorNorma = coatRec.manos;
  const esManosPersonalizadas = Boolean(formData.manosPersonalizadas && formData.manosPersonalizadas >= 1 && formData.manosPersonalizadas <= 4 && formData.manosPersonalizadas !== manosRecomendadasPorNorma);
  let manosSugeridas = (formData.manosPersonalizadas && formData.manosPersonalizadas >= 1 && formData.manosPersonalizadas <= 4)
    ? formData.manosPersonalizadas
    : manosRecomendadasPorNorma;
  let rendimientoTeoricoM2Galon = 25;
  if (tipoPintura.includes('Epóxica')) {
    rendimientoTeoricoM2Galon = 16;
    selladorImprimanteRequerido = 'Primer Epóxico de Penetración';
  } else if (tipoPintura.includes('Poliuretano')) {
    rendimientoTeoricoM2Galon = 18;
    selladorImprimanteRequerido = 'Sellador Epóxico / Poliuretánico';
  } else if (tipoPintura.includes('Esmalte') || tipoPintura.includes('Anticorrosivo')) {
    rendimientoTeoricoM2Galon = 26;
    selladorImprimanteRequerido = 'Anticorrosivo Fosfato de Zinc / Wash Primer';
  } else if (tipoPintura.includes('Tráfico')) {
    rendimientoTeoricoM2Galon = 20;
    selladorImprimanteRequerido = 'Imprimante Asfáltico / Acrílico';
  } else if (tipoPintura.includes('Barniz')) {
    rendimientoTeoricoM2Galon = 28;
    selladorImprimanteRequerido = 'Sellador para Madera / Fondo Poliuretano';
  } else if (tipoPintura.includes('Elastomérica')) {
    rendimientoTeoricoM2Galon = 18;
    selladorImprimanteRequerido = 'Sellador Elastomérico de Adherencia';
  } else if (tipoPintura.includes('Tipo 1')) {
    rendimientoTeoricoM2Galon = 22;
  } else if (tipoPintura.includes('Tipo 2')) {
    rendimientoTeoricoM2Galon = 28;
  } else if (tipoPintura.includes('Tipo 3')) {
    rendimientoTeoricoM2Galon = 32;
  }

  // Guard para proyectos con área no especificada aún
  if (area <= 0) {
    const defaultFlete = { costo: 45000, tiempo: '24 a 48 horas', cedi: 'CEDI Principal Guarne / Medellín' };
    const fleteInfo = REAL_PRICES_COP.fletesPorCiudad[ciudad as keyof typeof REAL_PRICES_COP.fletesPorCiudad] || REAL_PRICES_COP.fletesPorCiudad['Medellín'] || defaultFlete;
    return {
      productoRecomendado,
      tipoSolucion,
      tipoPintura,
      tipoPinturaDetalle,
      selladorImprimanteRequerido,
      manosSugeridas,
      explicacionManos: esManosPersonalizadas
        ? `Ajuste manual del cliente: ${manosSugeridas} mano(s) seleccionada(s). (La norma técnica recomienda ${manosRecomendadasPorNorma} manos: ${coatRec.motivo})`
        : coatRec.motivo,
      manosRecomendadasPorNorma,
      esManosPersonalizadas,
      factorDesperdicioPorcentaje: 10,
      galonesNetosSinDesperdicio: 0,
      galonesDesperdicio: 0,
      explicacionDesperdicio: 'Ingrese los m² del proyecto para calcular el desperdicio exacto.',
      rendimientoTeoricoM2Galon,
      galonesRequeridos: 0,
      cuñetesRequeridos: 0,
      galonesSueltosRequeridos: 0,
      tiempoEstimadoSecado: '2 a 4 horas entre manos',
      requiereVisitaEspecialista: false,
      alertaPatologia: null,
      presupuesto: {
        items: [],
        subtotalMateriales: 0,
        descuentoPorcentaje: 0,
        descuentoValor: 0,
        subtotalConDescuento: 0,
        fleteEnvio: fleteInfo.costo,
        ivaPorcentaje: 19,
        ivaValor: 0,
        totalPresupuesto: fleteInfo.costo,
        ciudadDestino: ciudad,
        tiempoEntregaDias: fleteInfo.tiempo
      }
    };
  }
  let requiereVisitaEspecialista = false;
  let alertaPatologia: string | null = null;

  // Lógica de sustrato y ambiente especial
  if (ambiente === 'Industrial Severo / Químico') {
    productoRecomendado = 'Pintucoat Epóxico Poliamida de Alto Sólidos';
    tipoSolucion = 'Recubrimiento de Alto Desempeño Químico y Mecánico';
    selladorImprimanteRequerido = 'Primer Epóxico Rico en Zinc';
    rendimientoTeoricoM2Galon = 18;
    requiereVisitaEspecialista = true;
  } else if (ambiente.includes('Pisos') || ambiente.includes('Tráfico')) {
    productoRecomendado = 'Pisos Epóxicos Autonivelante Pintucoat';
    tipoSolucion = 'Sistema de Alta Resistencia a la Abrasión';
    rendimientoTeoricoM2Galon = 16;
    selladorImprimanteRequerido = 'Sello Epóxico de Penetración';
  } else if (superficie.includes('Metal')) {
    productoRecomendado = 'Esmalte Sintético Pintucoat + Anticorrosivo Wash Primer';
    rendimientoTeoricoM2Galon = 28;
    selladorImprimanteRequerido = 'Pintulux Anticorrosivo Epóxico';
  } else if (ambiente === 'Exterior Intemperie') {
    selladorImprimanteRequerido = 'Imprimante Sellomax Antialcalino + Masilla Elastomérica';
  } else {
    selladorImprimanteRequerido = 'Sellador Acrílico Viniltex de Fijación';
  }

  // Ajustes según condición
  let galonesMasilla = 0;
  let galonesSellador = 0;

  if (condicion === 'Fisuras leves y humedad') {
    manosSugeridas = 3; // Refuerzo de película
    selladorImprimanteRequerido = 'Masilla Elastomérica Grietas + Barrera Antihumedad Aquastop';
    alertaPatologia = 'Se detectaron fisuras y humedad. Requiere sellado elástico previo a la aplicación.';
    galonesMasilla = Math.max(1, Math.ceil(area / 60)); // 1 galón rinde ~60m de fisuras/sellado
    galonesSellador = Math.max(1, Math.ceil(area / 35));
  } else if (condicion === 'Descascaramiento severo') {
    manosSugeridas = 3;
    selladorImprimanteRequerido = 'Raspado mecánico total + Fijador de Sustrato Deteriorado';
    requiereVisitaEspecialista = true;
    alertaPatologia = 'Sustrato con descascaramiento avanzado. Se recomienda inspección previa de adherencia (cross-cut test).';
    galonesSellador = Math.max(1, Math.ceil(area / 30));
  } else if (condicion === 'Oxidación superficial') {
    selladorImprimanteRequerido = 'Limpieza con solvente + Transformador de Óxido + Imprimante Zinc';
    alertaPatologia = 'Presencia de corrosión. Requiere limpieza grado SSPC-SP2/SP3 antes de aplicar recubrimiento.';
    galonesSellador = Math.max(1, Math.ceil(area / 35));
  } else {
    // Nueva o buen estado
    galonesSellador = Math.max(1, Math.ceil(area / 40));
  }

  // Factor de desperdicio estándar en obra (10%)
  const factorDesperdicioPorcentaje = 10;
  const factorDesperdicio = 1 + (factorDesperdicioPorcentaje / 100);
  
  // Rendimiento por mano
  const rendimientoUnaMano = rendimientoTeoricoM2Galon * 2;
  const galonesNetos = (area * manosSugeridas) / rendimientoUnaMano;
  const galonesConDesperdicio = Math.max(1, Math.ceil(galonesNetos * factorDesperdicio * 10) / 10);
  const galonesNetosSinDesperdicio = Math.round(galonesNetos * 10) / 10;
  const galonesDesperdicio = Math.max(0.1, Math.round((galonesConDesperdicio - galonesNetosSinDesperdicio) * 10) / 10);

  const explicacionManos = esManosPersonalizadas
    ? `Ajuste manual del cliente: ${manosSugeridas} mano(s) seleccionada(s). (La norma técnica recomienda ${manosRecomendadasPorNorma} manos: ${coatRec.motivo})`
    : coatRec.motivo;

  const explicacionDesperdicio = `Margen técnico del 10% (+${galonesDesperdicio} galones): Absorbe rugosidad del sustrato (${superficie}), recortes de esquinas y mermas en rodillo/brocha para evitar faltantes en obra.`;
  
  // Envases óptimos: Cuñetes (5 gal) + Galones sueltos
  const totalGalonesEnteros = Math.ceil(galonesConDesperdicio);
  const cuñetesRequeridos = Math.floor(totalGalonesEnteros / 5);
  const galonesSueltosRequeridos = totalGalonesEnteros % 5;

  // Desglose volumétrico cuando se seleccionan 2 colores
  const ratioSecundario = (typeof formData.proporcionColorSecundario === 'number' && formData.proporcionColorSecundario > 0 && formData.proporcionColorSecundario < 100)
    ? formData.proporcionColorSecundario
    : 30;
  const ratioPrincipal = 100 - ratioSecundario;
  const areaPrincipal = Math.round((area * ratioPrincipal / 100) * 10) / 10;
  const areaSecundario = Math.round((area * ratioSecundario / 100) * 10) / 10;
  const galonesColor1 = Math.max(1, Math.round((galonesConDesperdicio * ratioPrincipal / 100) * 10) / 10);
  const galonesColor2 = Math.max(1, Math.round((galonesConDesperdicio * ratioSecundario / 100) * 10) / 10);
  const cunetesColor1 = Math.floor(Math.ceil(galonesColor1) / 5);
  const galonesSueltosColor1 = Math.ceil(galonesColor1) % 5;
  const cunetesColor2 = Math.floor(Math.ceil(galonesColor2) / 5);
  const galonesSueltosColor2 = Math.ceil(galonesColor2) % 5;

  const desgloseDosColores = formData.dosColoresHabilitado ? {
    habilitado: true,
    colorPrincipal: {
      nombre: formData.colorAcabado || 'Color Principal',
      porcentaje: ratioPrincipal,
      areaM2: areaPrincipal,
      galones: galonesColor1,
      cunetes: cunetesColor1,
      galonesSueltos: galonesSueltosColor1
    },
    colorSecundario: {
      nombre: formData.colorSecundario || 'Color Secundario / Acento',
      porcentaje: ratioSecundario,
      areaM2: areaSecundario,
      galones: galonesColor2,
      cunetes: cunetesColor2,
      galonesSueltos: galonesSueltosColor2
    }
  } : undefined;

  // --- CÁLCULO DE PRESUPUESTO COMERCIAL EN COP ---
  // Determinar precios unitarios de pintura principal
  const precioCuneteUnitario = ambiente === 'Industrial Severo / Químico'
    ? Math.round((PRODUCT_PRICES['Pintucoat Epóxico Poliamida de Alto Sólidos'].cuñete5Gal * brandFactor) / 1000) * 1000
    : (ambiente.includes('Pisos') || ambiente.includes('Tráfico'))
    ? Math.round((PRODUCT_PRICES['Pisos Epóxicos Autonivelante Pintucoat'].cuñete5Gal * brandFactor) / 1000) * 1000
    : superficie.includes('Metal')
    ? Math.round((PRODUCT_PRICES['Esmalte Sintético Pintucoat + Anticorrosivo Wash Primer'].cuñete5Gal * brandFactor) / 1000) * 1000
    : tipoPinturaDetalle.precioCunete;

  const precioGalonUnitario = ambiente === 'Industrial Severo / Químico'
    ? Math.round((PRODUCT_PRICES['Pintucoat Epóxico Poliamida de Alto Sólidos'].galon * brandFactor) / 500) * 500
    : (ambiente.includes('Pisos') || ambiente.includes('Tráfico'))
    ? Math.round((PRODUCT_PRICES['Pisos Epóxicos Autonivelante Pintucoat'].galon * brandFactor) / 500) * 500
    : superficie.includes('Metal')
    ? Math.round((PRODUCT_PRICES['Esmalte Sintético Pintucoat + Anticorrosivo Wash Primer'].galon * brandFactor) / 500) * 500
    : tipoPinturaDetalle.precioGalon;

  const items: BudgetItem[] = [];
  const descColor = formData.dosColoresHabilitado
    ? `Dúo Bicolor Arquitectónico: [Principal ${ratioPrincipal}%: ${formData.colorAcabado || 'Color 1'}] + [Acento ${ratioSecundario}%: ${formData.colorSecundario || 'Color 2'}]`
    : `Acabado ${formData.colorAcabado || 'Gris'}`;

  // 1. Producto Principal: Cuñetes
  if (cuñetesRequeridos > 0) {
    items.push({
      id: 'prod-cunetes',
      name: productoRecomendado,
      presentation: 'Cuñete (5 Galones)',
      quantity: cuñetesRequeridos,
      unitPrice: precioCuneteUnitario,
      totalPrice: cuñetesRequeridos * precioCuneteUnitario,
      description: `Pintura ${tipoPintura} marca ${selectedBrand} (${tipoPinturaDetalle.normaNTC}). ${descColor} para ${area} m² a ${manosSugeridas} manos.`
    });
  }

  // 2. Producto Principal: Galones Sueltos
  if (galonesSueltosRequeridos > 0) {
    items.push({
      id: 'prod-galones',
      name: productoRecomendado,
      presentation: 'Galón (3.785 L)',
      quantity: galonesSueltosRequeridos,
      unitPrice: precioGalonUnitario,
      totalPrice: galonesSueltosRequeridos * precioGalonUnitario,
      description: `Fracción pintura ${tipoPintura} marca ${selectedBrand} para ajuste volumétrico exacto (${galonesSueltosRequeridos} gal). ${descColor}.`
    });
  }

  // 3. Imprimante / Sellador de Base
  if (galonesSellador > 0) {
    const isExterior = ambiente === 'Exterior Intemperie';
    const precioImprimante = isExterior ? REAL_PRICES_COP.imprimantes.sellomaxGalon : REAL_PRICES_COP.imprimantes.viniltexSelladorGalon;
    const nombreImprimante = isExterior ? 'Imprimante Sellomax Antialcalino Base Solvente' : 'Sellador Acrílico Viniltex de Fijación';
    items.push({
      id: 'imprimante-base',
      name: nombreImprimante,
      presentation: 'Galón (3.785 L)',
      quantity: galonesSellador,
      unitPrice: precioImprimante,
      totalPrice: galonesSellador * precioImprimante,
      description: `Acondicionamiento y neutralización de alcalinidad en sustrato.`
    });
  }

  // 4. Masilla / Tratamiento de Fisuras (si aplica)
  if (galonesMasilla > 0) {
    items.push({
      id: 'masilla-fisuras',
      name: 'Masilla Elastomérica Grietas Pintuco',
      presentation: 'Galón (3.785 L)',
      quantity: galonesMasilla,
      unitPrice: REAL_PRICES_COP.patologias.masillaElastomericaGrietasGalon,
      totalPrice: galonesMasilla * REAL_PRICES_COP.patologias.masillaElastomericaGrietasGalon,
      description: `Tratamiento elástico puenteador de microfisuras superficiales antes de pintura.`
    });
  }

  // 5. Herramientas y Accesorios de Pintura (Brochas, Rodillos, Cinta, etc.)
  if (formData.herramientasSeleccionadas && formData.herramientasSeleccionadas.length > 0) {
    formData.herramientasSeleccionadas.forEach((herramienta) => {
      if (herramienta && herramienta.cantidad > 0) {
        const catName = (herramienta.categoria || 'Herramienta').toString().toUpperCase();
        items.push({
          id: `tool-${herramienta.id || Math.random().toString(36).substring(2, 7)}`,
          name: herramienta.nombre || 'Herramienta de Pintura',
          presentation: `${herramienta.cantidad} ${herramienta.unidad || 'Unidad(es)'}`,
          quantity: herramienta.cantidad,
          unitPrice: herramienta.precioCOP || 0,
          totalPrice: (herramienta.cantidad || 1) * (herramienta.precioCOP || 0),
          description: `Herramienta profesional de aplicación (${catName}) • SKU: ${herramienta.sku || 'HERR-CLK'}`
        });
      }
    });
  }

  // Subtotal de materiales
  const subtotalMateriales = items.reduce((acc, it) => acc + it.totalPrice, 0);

  // Descuento comercial institucional (8% si es constructora o volumen > 1.000.000 COP)
  const esConstructora = clienteNombre.toLowerCase().includes('constructora') || clienteNombre.toLowerCase().includes('s.a.s') || clienteNombre.toLowerCase().includes('s.a.') || subtotalMateriales >= 1000000;
  const descuentoPorcentaje = esConstructora ? 8 : 0;
  const descuentoValor = Math.round(subtotalMateriales * (descuentoPorcentaje / 100));
  const subtotalConDescuento = subtotalMateriales - descuentoValor;

  // Flete de envío según ciudad
  const defaultFlete = { costo: 45000, tiempo: '24 a 48 horas', cedi: 'CEDI Principal Guarne / Medellín' };
  const fleteInfo = REAL_PRICES_COP.fletesPorCiudad[ciudad as keyof typeof REAL_PRICES_COP.fletesPorCiudad] || REAL_PRICES_COP.fletesPorCiudad['Medellín'] || defaultFlete;
  const fleteEnvio = fleteInfo.costo;

  // IVA del 19%
  const ivaPorcentaje = 19;
  const ivaValor = Math.round(subtotalConDescuento * (ivaPorcentaje / 100));

  // TOTAL GENERAL PRESUPUESTADO
  const totalPresupuesto = subtotalConDescuento + ivaValor + fleteEnvio;

  const presupuesto: BudgetBreakdown = {
    items,
    subtotalMateriales,
    descuentoPorcentaje,
    descuentoValor,
    subtotalConDescuento,
    fleteEnvio,
    ivaPorcentaje,
    ivaValor,
    totalPresupuesto,
    ciudadDestino: ciudad,
    tiempoEntregaDias: fleteInfo.tiempo
  };

  return {
    productoRecomendado,
    tipoSolucion,
    tipoPintura,
    tipoPinturaDetalle,
    selladorImprimanteRequerido,
    manosSugeridas,
    explicacionManos,
    factorDesperdicioPorcentaje,
    galonesNetosSinDesperdicio,
    galonesDesperdicio,
    explicacionDesperdicio,
    rendimientoTeoricoM2Galon,
    galonesRequeridos: totalGalonesEnteros,
    cuñetesRequeridos,
    galonesSueltosRequeridos,
    tiempoEstimadoSecado: '2 a 4 horas entre manos (Secado total: 24 horas)',
    requiereVisitaEspecialista,
    alertaPatologia,
    presupuesto,
    manosRecomendadasPorNorma,
    esManosPersonalizadas,
    desgloseDosColores
  };
}



