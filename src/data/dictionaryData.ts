import { FormFieldSpec, RedundantFieldEliminated } from '../types/form';

export const FORM_SPECIFICATION: FormFieldSpec[] = [
  // 1. IDENTIFICACIÓN
  {
    id: 'id-1',
    module: 'Identificación',
    name: 'Cliente / Razón Social',
    technicalKey: 'cliente_nombre',
    dataType: 'Texto (String)',
    sqlType: 'VARCHAR(150)',
    required: true,
    validation: 'Longitud min 3, max 150 caracteres. Sin caracteres de inyección SQL ni HTML.',
    businessRule: 'Permite buscar coincidencias en CRM/ERP para no duplicar cuentas de cliente.',
    automationRole: 'Clave de búsqueda para asociar historial crediticio, lista de precios y condiciones comerciales.',
    placeholder: 'Ej. Constructora Horizonte S.A.S.',
    exampleValue: 'Constructora Horizonte S.A.S.'
  },
  {
    id: 'id-2',
    module: 'Identificación',
    name: 'NIT / Documento Identidad',
    technicalKey: 'nit_documento',
    dataType: 'Alfanumérico (String)',
    sqlType: 'VARCHAR(25)',
    required: true,
    validation: 'Formato numérico con dígito de verificación opcional (ej: ^[0-9]{8,11}(-[0-9kK])?$). Longitud 8-15 caracteres.',
    businessRule: 'Identificador único fiscal en la base de datos relacional (Foreign Key con tabla Cliente).',
    automationRole: 'Consulta automática en ERP/DIAN para validar estado tributario y facturación electrónica.',
    placeholder: 'Ej. 901234567-8',
    exampleValue: '901234567-8'
  },
  {
    id: 'id-3',
    module: 'Identificación',
    name: 'Responsable de Contacto',
    technicalKey: 'responsable_nombre',
    dataType: 'Texto (String)',
    sqlType: 'VARCHAR(120)',
    required: true,
    validation: 'Mínimo nombre y apellido (2 palabras, solo letras y espacios, 5 a 120 caracteres).',
    businessRule: 'Persona directa autorizada para aprobar cotizaciones técnicas y recibir muestras.',
    automationRole: 'Personalización de correos transaccionales y asignación de gestor de cuenta.',
    placeholder: 'Ej. Ing. Carlos Mario Restrepo',
    exampleValue: 'Ing. Carlos Mario Restrepo'
  },
  {
    id: 'id-4',
    module: 'Identificación',
    name: 'Teléfono de Contacto',
    technicalKey: 'telefono_contacto',
    dataType: 'Texto / Teléfono (String)',
    sqlType: 'VARCHAR(25)',
    required: true,
    validation: 'Formato numérico internacional E.164 o nacional (ej: +57 300 123 4567, 10 a 15 dígitos).',
    businessRule: 'Canal prioritario para confirmación de entrega en obra y coordinación telefónica.',
    automationRole: 'Enrutamiento de alertas y llamadas de confirmación logística.',
    placeholder: 'Ej. +57 312 456 7890',
    exampleValue: '+57 312 456 7890'
  },

  // 2. PROYECTO
  {
    id: 'pr-1',
    module: 'Proyecto',
    name: 'Ciudad / Municipio',
    technicalKey: 'ciudad',
    dataType: 'Selector / Texto normalizado',
    sqlType: 'VARCHAR(80)',
    required: true,
    validation: 'Selección de catálogo DANE de ciudades/municipios o texto no vacío (3 a 80 caracteres).',
    businessRule: 'Determina el centro de distribución (CEDI) o bodega de despacho más cercana y los costos de flete.',
    automationRole: 'Verificación automática de stock en el inventario regional y asignación de ruta logística.',
    options: ['Medellín', 'Bogotá D.C.', 'Cali', 'Barranquilla', 'Bucaramanga', 'Cartagena', 'Pereira', 'Manizales', 'Otras'],
    exampleValue: 'Medellín'
  },
  {
    id: 'pr-2',
    module: 'Proyecto',
    name: 'Tipo de Obra',
    technicalKey: 'tipo_obra',
    dataType: 'Selector (Enum)',
    sqlType: 'VARCHAR(50)',
    required: true,
    validation: 'Restringido a categorías estándar del catálogo de ingeniería civil y recubrimientos.',
    businessRule: 'Filtra las familias de productos técnicamente compatibles (e.g. acrílicos, epóxicos, poliuretanos).',
    automationRole: 'Dispara la matriz de especificación técnica y pre-selecciona el portafolio aplicable.',
    options: ['Fachada Edificio', 'Muros Interiores', 'Pisos Industriales', 'Estructura Metálica', 'Cielorrasos', 'Institucional / Hospitalario'],
    exampleValue: 'Fachada Edificio'
  },
  {
    id: 'pr-3',
    module: 'Proyecto',
    name: 'Área Total a Intervenir (m²)',
    technicalKey: 'area_m2',
    dataType: 'Numérico Decimal (Float)',
    sqlType: 'DECIMAL(10,2)',
    required: true,
    validation: 'Número positivo mayor que 0 (rango: 1.00 a 500,000.00 m²). Máximo 2 decimales.',
    businessRule: 'Variable cuantitativa clave para calcular galonaje, cuñetes, tiempo de obra y rango de descuento por volumen.',
    automationRole: 'Fórmula de cálculo determinista: `galones = (Área * Manos) / Rendimiento_Teórico * (1 + Desperdicio)`.',
    placeholder: 'Ej. 85.00',
    exampleValue: 85.0
  },
  {
    id: 'pr-4',
    module: 'Proyecto',
    name: 'Fecha Requerida de Inicio / Entrega',
    technicalKey: 'fecha_requerida',
    dataType: 'Fecha (Date ISO-8601)',
    sqlType: 'DATE',
    required: true,
    validation: 'Fecha válida posterior o igual a la fecha actual (mínimo HOY + 1 día hábil).',
    businessRule: 'Permite priorizar órdenes de producción y verificar disponibilidad en el calendario operativo.',
    automationRole: 'Cálculo de semáforo de urgencia (Lead Time vs Fecha Deseada) y alertas de reprogramación.',
    placeholder: 'YYYY-MM-DD',
    exampleValue: '2026-09-15'
  },

  // 3. TÉCNICO
  {
    id: 'tc-1',
    module: 'Técnico',
    name: 'Superficie / Sustrato',
    technicalKey: 'superficie',
    dataType: 'Selector (Enum)',
    sqlType: 'VARCHAR(60)',
    required: true,
    validation: 'Valor seleccionado de lista estandarizada de sustratos constructivos.',
    businessRule: 'Determina la química de adherencia y necesidad de imprimantes o promotores de anclaje.',
    automationRole: 'Regla de negocio: si superficie = "Metal Ferroso", agregar anticorrosivo; si "Concreto", validar alcalinidad.',
    options: ['Concreto / Revoque', 'Drywall / Yeso', 'Metal Ferroso', 'Metal Galvanizado / Aluminio', 'Madera', 'Pintura Existente'],
    exampleValue: 'Concreto / Revoque'
  },
  {
    id: 'tc-2',
    module: 'Técnico',
    name: 'Ambiente / Nivel de Exposición',
    technicalKey: 'ambiente',
    dataType: 'Selector (Enum)',
    sqlType: 'VARCHAR(60)',
    required: true,
    validation: 'Valor seleccionado de lista controlada de ambientes climáticos/físicos.',
    businessRule: 'Define resistencia a rayos UV, humedad relativa, salinidad o agentes químicos agresivos.',
    automationRole: 'Cruza con ficha técnica del producto para garantizar durabilidad de 3, 5 o 10 años.',
    options: ['Exterior Intemperie', 'Interior Seco', 'Interior Húmedo (Baños/Cocinas)', 'Industrial Severo / Químico', 'Tráfico Peatonal / Vehicular'],
    exampleValue: 'Exterior Intemperie'
  },
  {
    id: 'tc-3',
    module: 'Técnico',
    name: 'Condición del Sustrato',
    technicalKey: 'condicion',
    dataType: 'Selector (Enum)',
    sqlType: 'VARCHAR(60)',
    required: true,
    validation: 'Valor seleccionado de lista de diagnósticos de estado.',
    businessRule: 'Identifica necesidad de preparación previa (lavado, masillado elastomérico, sellador antialcalino).',
    automationRole: 'Si condición = "Fisuras leves y humedad" o "Descascaramiento severo", activa alerta para revisión técnica (Human-in-the-loop).',
    options: ['Nueva sin pintar', 'Pintada en buen estado', 'Fisuras leves y humedad', 'Descascaramiento severo', 'Oxidación superficial', 'Contaminación / Grasa'],
    exampleValue: 'Fisuras leves y humedad'
  },
  {
    id: 'tc-4',
    module: 'Técnico',
    name: 'Color / Acabado Requerido',
    technicalKey: 'color_acabado',
    dataType: 'Paleta Visual / Tintometría + Acabado',
    sqlType: 'VARCHAR(80)',
    required: true,
    validation: 'Selección de paleta estándar (Gris, Blanco, Arena, Grafito, Terracota, etc.) o código tintométrico RAL/Pantone con acabado (Mate, Satinado, Semibrillante, Brillante).',
    businessRule: 'Identifica si es producto estándar en inventario CEDI o si requiere formulación y dosificación en máquina tintométrica (Base Pastel/Deep/Accent).',
    automationRole: 'Verifica stock de base tintométrica en CEDI local o enruta orden a máquina de tintometría automática con Lead Time adicional.',
    options: ['Gris (Caso de Clase)', 'Blanco Puro', 'Marfil / Arena', 'Gris Grafito', 'Terracota / Teja', 'Ocre Colonial', 'Verde Oliva', 'Azul Fachada', 'Personalizado / Tintometría'],
    placeholder: 'Ej. Gris (Mate) / Blanco Puro (Satinado)',
    exampleValue: 'Gris (Mate)'
  },

  // 4. EVIDENCIA
  {
    id: 'ev-1',
    module: 'Evidencia',
    name: 'Descripción Libre del Requerimiento',
    technicalKey: 'descripcion_libre',
    dataType: 'Texto Largo (Text)',
    sqlType: 'TEXT',
    required: true,
    validation: 'Texto explicativo con mínimo 15 caracteres y máximo 1000 caracteres.',
    businessRule: 'Permite al cliente expresar particularidades del contexto (alturas, horarios de trabajo, expectativas).',
    automationRole: 'Alimentación para IA generativa (Gemini API) para enriquecer el resumen ejecutivo y extraer tags.',
    placeholder: 'Describa el alcance: ubicación específica del edificio, síntomas visibles, accesibilidad...',
    exampleValue: 'Fachada frontal de edificio residencial de 5 pisos, presenta fisuras superficiales y manchas por humedad de lluvia lateral.'
  },
  {
    id: 'ev-2',
    module: 'Evidencia',
    name: 'Fotografías / Evidencias Visuales',
    technicalKey: 'fotos_urls',
    dataType: 'Array de Archivos / URLs',
    sqlType: 'JSONB / VARCHAR[]',
    required: true,
    validation: 'Mínimo 1 archivo y máximo 5 fotos. Formatos permitidos: JPG, PNG, WEBP. Máximo 10MB por archivo.',
    businessRule: 'Evidencia visual indispensable para validar estado del sustrato y evitar visitas técnicas innecesarias.',
    automationRole: 'Análisis multimodal con Gemini Vision para clasificación de severidad de fisuras y verificación de sustrato.',
    placeholder: 'Suba fotos del área general y detalles en primer plano',
    exampleValue: '["https://storage.cloud.google.com/colorlink/evidencia_fachada_01.jpg"]'
  },
  {
    id: 'ev-3',
    module: 'Evidencia',
    name: 'Observaciones / Restricciones Operativas',
    technicalKey: 'observaciones',
    dataType: 'Texto Largo (Text)',
    sqlType: 'TEXT',
    required: false,
    validation: 'Opcional. Máximo 500 caracteres.',
    businessRule: 'Restricciones de acceso (andamios certificados, trabajo nocturno, permisos de copropiedad).',
    automationRole: 'Incorporación automática en la sección de "Condiciones del Servicio" de la propuesta comercial.',
    placeholder: 'Ej. Trabajo en alturas con líneas de vida certificadas. Horario de 8:00am a 5:00pm.',
    exampleValue: 'Se requiere trabajo con andamios colgantes certificados.'
  },
  {
    id: 'ev-4',
    module: 'Evidencia',
    name: 'Consentimiento y Tratamiento de Datos',
    technicalKey: 'consentimiento_habeas_data',
    dataType: 'Booleano (Boolean)',
    sqlType: 'BOOLEAN',
    required: true,
    validation: 'Debe ser estrictamente TRUE (Checkbox marcado obligatoriamente).',
    businessRule: 'Cumplimiento legal de protección de datos personales (Habeas Data / Ley 1581).',
    automationRole: 'Bloqueo legal: si es FALSE, el sistema rechaza la ingesta y no almacena en base de datos.',
    placeholder: 'Acepto términos y política de privacidad',
    exampleValue: true
  }
];

export const REDUNDANT_FIELDS_ELIMINATED: RedundantFieldEliminated[] = [
  {
    field: 'Marca o Referencia exacta de pintura que desea el cliente',
    reason: 'Genera sesgo y errores técnicos. El cliente muchas veces desconoce la compatibilidad química con el sustrato.',
    alternative: 'Se captura [Superficie + Ambiente + Condición] y el motor técnico calcula automáticamente el producto óptimo.'
  },
  {
    field: 'Dirección completa, Barrio y Código Postal detallado',
    reason: 'Innecesario en la etapa de cotización y filtro inicial; genera fricción de llenado y abandono del formulario.',
    alternative: 'Se captura únicamente [Ciudad / Municipio] para ruteo logístico y stock CEDI. La dirección exacta se solicita solo tras aprobar la cotización.'
  },
  {
    field: 'Cantidad de Galones / Cuñetes deseados por el cliente',
    reason: 'Provoca cotizaciones erróneas. El cliente no calcula desperdicio ni rendimiento por capa ni manos requeridas.',
    alternative: 'Se captura solo [Área m²] y el algoritmo calcula la cantidad exacta con fórmula de ingeniería de recubrimientos.'
  },
  {
    field: 'Presupuesto estimado en dinero del cliente',
    reason: 'Dato impreciso que desvía la propuesta técnica y crea expectativas irreales antes de diagnosticar patologías.',
    alternative: 'El sistema calcula el costo estándar paramétrico con base en m² y lista de precios oficial.'
  },
  {
    field: 'Teléfono secundario / Fax / Múltiples contactos',
    reason: 'Campos obsoletos y redundantes que aumentan el tiempo de captura sin aportar valor al flujo automatizado.',
    alternative: 'Un solo campo unificado [Responsable] con email y teléfono vinculado.'
  }
];

export const CASE_STUDY_PRESET: Partial<import('../types/form').ProjectFormData> = {
  cliente: 'Constructora Horizonte S.A.S.',
  nitDocumento: '900854219',
  passwordCliente: 'Horizonte2026*',
  responsable: 'Arq. Valentina Gómez Restrepo',
  emailResponsable: 'vgomez@constructorahorizonte.com.co',
  telefonoResponsable: '3128456721',
  canalEntrada: 'App Web',
  ciudad: 'Medellín',
  tipoObra: 'Fachada Edificio',
  areaM2: 85.00,
  fechaRequerida: '2026-09-10',
  superficie: 'Concreto / Revoque',
  ambiente: 'Exterior Intemperie',
  condicion: 'Fisuras leves y humedad',
  colorAcabado: 'Gris Cemento Mate (Ref. Fachada 02)',
  descripcionLibre: 'Mantenimiento preventivo y correctivo en fachada lateral de 5 pisos expuesta a lluvia y sol. Presenta fisuras no estructurales y humedad superficial.',
  observaciones: 'Se requiere trabajo seguro en alturas con líneas de anclaje. Acceso habilitado de 8am a 5pm.',
  consentimiento: true,
  fotos: [
    { name: 'evidencia_fachada_fisuras_1.jpg', size: '2.4 MB' },
    { name: 'detalle_humedad_concreto_2.jpg', size: '1.8 MB' }
  ]
};
