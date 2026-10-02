export interface FormFieldSpec {
  id: string;
  module: 'Identificación' | 'Proyecto' | 'Técnico' | 'Evidencia';
  name: string;
  technicalKey: string;
  dataType: string;
  sqlType: string;
  required: boolean;
  validation: string;
  businessRule: string;
  automationRole: string;
  options?: string[];
  placeholder?: string;
  exampleValue: string | number | boolean;
}

export interface RedundantFieldEliminated {
  field: string;
  reason: string;
  alternative: string;
}

export interface ToolItemSelection {
  id: string;
  nombre: string;
  categoria: 'brochas' | 'rodillos' | 'preparacion' | 'proteccion';
  precioCOP: number;
  cantidad: number;
  subtotalCOP: number;
  sku: string;
  unidad: string;
  stock: number;
  icono?: string;
  descripcion?: string;
}

export interface ProjectFormData {
  // Identificación y Registro Fácil
  cliente: string;
  nitDocumento: string; // Documento o NIT limpio sin guiones ni puntos
  passwordCliente?: string; // Contraseña creada por el cliente al registrarse
  responsable: string;
  emailResponsable: string;
  telefonoResponsable: string;
  canalEntrada: 'App Web' | 'Llamada / PBX' | 'Fuerza Comercial' | 'Punto de Venta' | 'Portal Clientes';

  // Proyecto & Despacho
  ciudad: string;
  direccionEntrega?: string; // Dirección exacta de donde se quiere que llegue el pedido
  puntoReferencia?: string; // Nombre del edificio, obra, conjunto o punto de referencia
  contactoObra?: string; // Nombre de la persona que recibe en la dirección de entrega
  telefonoObra?: string; // Teléfono de contacto en la dirección de entrega
  indicacionesEntrega?: string; // Indicaciones para el furgón repartidor (portería, horario, etc.)
  tipoObra: 'Fachada Edificio' | 'Muros Interiores' | 'Pisos Industriales' | 'Estructura Metálica' | 'Cielorrasos' | 'Institucional / Hospitalario';
  areaM2: number;
  fechaRequerida: string;

  // Técnico
  superficie: 'Concreto / Revoque' | 'Drywall / Yeso' | 'Metal Ferroso' | 'Metal Galvanizado / Aluminio' | 'Madera' | 'Pintura Existente';
  ambiente: 'Exterior Intemperie' | 'Interior Seco' | 'Interior Húmedo (Baños/Cocinas)' | 'Industrial Severo / Químico' | 'Tráfico Peatonal / Vehicular';
  condicion: 'Nueva sin pintar' | 'Pintada en buen estado' | 'Fisuras leves y humedad' | 'Descascaramiento severo' | 'Oxidación superficial' | 'Contaminación / Grasa';
  colorAcabado: string;
  marcaPintura?: string;
  tipoPintura?: PaintTypeCategory;
  metodoPago?: 'bancolombia' | 'pse' | 'nequi' | 'contraentrega' | 'credito' | 'tarjeta';
  comprobantePagoUrl?: string;
  bancoPSE?: string;

  // Herramientas y Accesorios de Pintor seleccionados (Brochas, Rodillos, etc.)
  herramientasSeleccionadas?: ToolItemSelection[];

  // Evidencia
  descripcionLibre: string;
  fotos: Array<{
    name: string;
    size: string;
    previewUrl?: string;
    aiReviewed?: boolean;
    aiDiagnosis?: {
      valid: boolean;
      statusText: string;
      sustrato: string;
      condicion: string;
      recomendacion: string;
      normaNTC?: string;
    };
  }>;
  observaciones: string;
  consentimiento: boolean;
}

export interface BudgetItem {
  id: string;
  name: string;
  presentation: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  description: string;
}

export interface BudgetBreakdown {
  items: BudgetItem[];
  subtotalMateriales: number;
  descuentoPorcentaje: number;
  descuentoValor: number;
  subtotalConDescuento: number;
  fleteEnvio: number;
  ivaPorcentaje: number;
  ivaValor: number;
  totalPresupuesto: number;
  ciudadDestino: string;
  tiempoEntregaDias: string;
}

export type PaintTypeCategory =
  | 'Exterior Tipo 1'
  | 'Exterior Tipo 2'
  | 'Exterior Tipo 3'
  | 'Interior Tipo 1'
  | 'Interior Tipo 2'
  | 'Interior Tipo 3'
  | 'Tipo 1'
  | 'Tipo 2'
  | 'Tipo 3';

export interface PaintTypeProfile {
  tipo: PaintTypeCategory;
  linea: 'Exterior' | 'Interior';
  nivel: 'Tipo 1' | 'Tipo 2' | 'Tipo 3';
  nombreComercial: string;
  normaNTC: string;
  resistenciaLavabilidad: string;
  durabilidadAnos: string;
  usoRecomendado: string;
  precioGalon: number;
  precioCunete: number;
}

export interface TechnicalCalculationResult {
  productoRecomendado: string;
  tipoSolucion: string;
  tipoPintura: PaintTypeCategory;
  tipoPinturaDetalle: PaintTypeProfile;
  selladorImprimanteRequerido: string;
  manosSugeridas: number;
  explicacionManos: string;
  factorDesperdicioPorcentaje: number;
  galonesNetosSinDesperdicio: number;
  galonesDesperdicio: number;
  explicacionDesperdicio: string;
  rendimientoTeoricoM2Galon: number;
  galonesRequeridos: number;
  cuñetesRequeridos: number;
  galonesSueltosRequeridos: number;
  tiempoEstimadoSecado: string;
  requiereVisitaEspecialista: boolean;
  alertaPatologia: string | null;
  presupuesto: BudgetBreakdown;
}

export interface UserProfile {
  id: string;
  empresa: string;
  nit: string;
  responsable: string;
  email: string;
  telefono: string;
  ciudad: string;
  createdAt: string;
}
