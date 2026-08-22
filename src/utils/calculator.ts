import { ProjectFormData, TechnicalCalculationResult, BudgetBreakdown, BudgetItem } from '../types/form';

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
    nombreComercial: 'Koraza Doble Vida Protección Fachadas 100% Acrílica'
  },
  'Koraza Pro Pintura Exterior Acrílica 100%': {
    cuñete5Gal: 365000,
    galon: 82000,
    nombreComercial: 'Koraza Pro Exterior Fachadas'
  },
  'Viniltex Avanzado / Antibacterial': {
    cuñete5Gal: 318000,
    galon: 74500,
    nombreComercial: 'Viniltex Avanzado Máxima Lavabilidad Antibacterial Tipo 1'
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

export function formatCOP(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  }).format(amount);
}

export function calculateTechnicalRequirements(formData: Partial<ProjectFormData>): TechnicalCalculationResult {
  const area = formData.areaM2 || 0;
  const superficie = formData.superficie || 'Concreto / Revoque';
  const ambiente = formData.ambiente || 'Exterior Intemperie';
  const condicion = formData.condicion || 'Nueva sin pintar';
  const ciudad = formData.ciudad || 'Medellín';
  const clienteNombre = formData.cliente || '';

  let productoRecomendado = 'Koraza Pro Pintura Exterior Acrílica 100%';
  let tipoSolucion = 'Sistema Impermeable y Elastomérico para Fachadas';
  let selladorImprimanteRequerido = 'Sellador Antialcalino Base Solvente / Acrílico';
  let manosSugeridas = 2;
  let rendimientoTeoricoM2Galon = 25; // m² por galón a 2 manos
  let requiereVisitaEspecialista = false;
  let alertaPatologia: string | null = null;

  // Lógica de sustrato y ambiente
  if (ambiente === 'Exterior Intemperie') {
    if (superficie === 'Concreto / Revoque') {
      productoRecomendado = 'Koraza Doble Vida / Acrilpintuco Elastómerico';
      rendimientoTeoricoM2Galon = 22;
      selladorImprimanteRequerido = 'Imprimante Sellomax Antialcalino + Masilla Elastomérica';
    } else if (superficie.includes('Metal')) {
      productoRecomendado = 'Esmalte Sintético Pintucoat + Anticorrosivo Wash Primer';
      rendimientoTeoricoM2Galon = 28;
      selladorImprimanteRequerido = 'Pintulux Anticorrosivo Epóxico';
    }
  } else if (ambiente === 'Industrial Severo / Químico') {
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
  } else {
    // Interior
    productoRecomendado = 'Viniltex Avanzado / Antibacterial';
    tipoSolucion = 'Recubrimiento Vinil Acrílico Lavable Interior';
    rendimientoTeoricoM2Galon = 30;
    selladorImprimanteRequerido = 'Sellador Acrílico de Fijación';
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
  const factorDesperdicio = 1.10;
  
  // Rendimiento
  const rendimientoUnaMano = rendimientoTeoricoM2Galon * 2;
  const galonesNetos = (area * manosSugeridas) / rendimientoUnaMano;
  const galonesConDesperdicio = Math.max(1, Math.ceil(galonesNetos * factorDesperdicio * 10) / 10);
  
  // Envases óptimos: Cuñetes (5 gal) + Galones sueltos
  const totalGalonesEnteros = Math.ceil(galonesConDesperdicio);
  const cuñetesRequeridos = Math.floor(totalGalonesEnteros / 5);
  const galonesSueltosRequeridos = totalGalonesEnteros % 5;

  // --- CÁLCULO DE PRESUPUESTO COMERCIAL EN COP ---
  const productPriceConfig = PRODUCT_PRICES[productoRecomendado] || PRODUCT_PRICES['Koraza Pro Pintura Exterior Acrílica 100%'];
  
  const items: BudgetItem[] = [];

  // 1. Producto Principal: Cuñetes
  if (cuñetesRequeridos > 0) {
    items.push({
      id: 'prod-cunetes',
      name: productPriceConfig.nombreComercial,
      presentation: 'Cuñete (5 Galones)',
      quantity: cuñetesRequeridos,
      unitPrice: productPriceConfig.cuñete5Gal,
      totalPrice: cuñetesRequeridos * productPriceConfig.cuñete5Gal,
      description: `Acabado ${formData.colorAcabado || 'Gris'} para ${area} m² a ${manosSugeridas} manos.`
    });
  }

  // 2. Producto Principal: Galones Sueltos
  if (galonesSueltosRequeridos > 0) {
    items.push({
      id: 'prod-galones',
      name: productPriceConfig.nombreComercial,
      presentation: 'Galón (3.785 L)',
      quantity: galonesSueltosRequeridos,
      unitPrice: productPriceConfig.galon,
      totalPrice: galonesSueltosRequeridos * productPriceConfig.galon,
      description: `Fracción de pintura de acabado para ajuste exacto (${galonesSueltosRequeridos} gal).`
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

  // Subtotal de materiales
  const subtotalMateriales = items.reduce((acc, it) => acc + it.totalPrice, 0);

  // Descuento comercial institucional (8% si es constructora o volumen > 1.000.000 COP)
  const esConstructora = clienteNombre.toLowerCase().includes('constructora') || clienteNombre.toLowerCase().includes('s.a.s') || clienteNombre.toLowerCase().includes('s.a.') || subtotalMateriales >= 1000000;
  const descuentoPorcentaje = esConstructora ? 8 : 0;
  const descuentoValor = Math.round(subtotalMateriales * (descuentoPorcentaje / 100));
  const subtotalConDescuento = subtotalMateriales - descuentoValor;

  // Flete de envío según ciudad
  const fleteInfo = REAL_PRICES_COP.fletesPorCiudad[ciudad as keyof typeof REAL_PRICES_COP.fletesPorCiudad] || REAL_PRICES_COP.fletesPorCiudad['Medellín'];
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
    selladorImprimanteRequerido,
    manosSugeridas,
    rendimientoTeoricoM2Galon,
    galonesRequeridos: totalGalonesEnteros,
    cuñetesRequeridos,
    galonesSueltosRequeridos,
    tiempoEstimadoSecado: '2 a 4 horas entre manos (Secado total: 24 horas)',
    requiereVisitaEspecialista,
    alertaPatologia,
    presupuesto
  };
}

