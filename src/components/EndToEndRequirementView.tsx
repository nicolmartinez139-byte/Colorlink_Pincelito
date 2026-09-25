import React, { useState, useEffect } from 'react';
import {
  Building2,
  Camera,
  ClipboardCheck,
  Sparkles,
  Database,
  Calculator,
  Package,
  Scale,
  FileText,
  UserCheck,
  Truck,
  Headphones,
  MessageSquare,
  PaintRoller,
  ShieldCheck,
  BarChart3,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  ChevronRight,
  Clock,
  ArrowRight,
  Download,
  Printer,
  Share2,
  Check,
  FileCheck
} from 'lucide-react';
import { ColorlinkConfettiDots } from './ColorlinkDots';
import { formatCOP } from '../utils/calculator';
import { generateColorlinkPDF, printColorlinkPDF } from '../utils/generateColorlinkPDF';
import { CASE_STUDY_PRESET } from '../data/dictionaryData';
import { ProjectFormData } from '../types/form';

interface EndToEndRequirementViewProps {
  onOpenClientForm?: () => void;
}

export function EndToEndRequirementView({ onOpenClientForm }: EndToEndRequirementViewProps) {
  // Current active step being inspected (1 to 15)
  const [activeStep, setActiveStep] = useState<number>(1);
  // Automation execution state: 'idle' | 'running' | 'completed'
  const [automationState, setAutomationState] = useState<'idle' | 'running' | 'completed'>('idle');
  const [completedSteps, setCompletedSteps] = useState<number[]>([1, 2, 3, 4, 5, 6, 7, 8]);
  const [copiedNotification, setCopiedNotification] = useState<boolean>(false);
  const [showFullPayload, setShowFullPayload] = useState<boolean>(false);

  // 15 steps exactly as in the user's requirement image
  const stepsList = [
    {
      id: 1,
      name: 'Captura',
      summary: 'recibe datos, fotos y características.',
      icon: Camera,
      badge: 'Entrada',
      category: 'Entrada y Validación',
      responsible: 'Formulario Web / WhatsApp',
      execTime: '0.4s',
      detailData: {
        cliente: 'Constructora Horizonte S.A.S.',
        nit: '900.854.219-3',
        proyecto: 'Fachada edificio residencial',
        area: '85.00 m²',
        superficie: 'Concreto / Revoque',
        condicion: 'Humedad + fisuras',
        ambiente: 'Exterior intemperie',
        color: 'Gris Cemento Mate (Ref. 02)',
        fechaRequerida: '20 días (24-Sep-2026)',
        fotos: ['fachada_norte_general.jpg (2.4MB)', 'detalle_fisura_humedad.jpg (1.8MB)'],
        observaciones: 'Acceso por andamios colgantes certificados en 5 pisos.'
      }
    },
    {
      id: 2,
      name: 'Validación',
      summary: 'detecta faltantes, errores o duplicados.',
      icon: ClipboardCheck,
      badge: 'Reglas',
      category: 'Entrada y Validación',
      responsible: 'Motor de Validación Pydantic',
      execTime: '0.2s',
      detailData: {
        nitValidacion: 'VÁLIDO en base DIAN (Dígito de verificación 3 verificado)',
        duplicados: '0 duplicados detectados. Cliente existente en CRM con calificación A.',
        consistenciaArea: 'Área 85.00 m² coherente con tipología de fachada de 5 niveles.',
        completitud: '100% de campos obligatorios diligenciados (10/10 parámetros válidos).'
      }
    },
    {
      id: 3,
      name: 'IA — Gemini',
      summary: 'clasifica la necesidad desde texto e imágenes.',
      icon: Sparkles,
      badge: 'IA Multimodal',
      category: 'Diagnóstico Inteligente',
      responsible: 'Gemini 2.5 Flash Multimodal',
      execTime: '1.1s',
      detailData: {
        diagnosticoPatologia: 'Fisuración superficial capilar (ancho 0.2 - 0.4 mm) sin compromiso estructural.',
        humedadDetectada: 'Humedad por condensación exterior y absorción capilar moderada (Nivel 2/4).',
        recomendacionIA: 'Requiere imprimante hidrófugo antialcalino de penetración profunda + recubrimiento elastomérico puenteador de microfisuras.',
        confianzaModelo: '98.4% de certeza en clasificación de sustrato de concreto curado.'
      }
    },
    {
      id: 4,
      name: 'Motor técnico',
      summary: 'cruza superficie, ambiente, condición y catálogo.',
      icon: Database,
      badge: 'Determinista',
      category: 'Ingeniería Química',
      responsible: 'Matriz Determinista Colorlink',
      execTime: '0.1s',
      detailData: {
        superficieCrucero: 'Concreto / Revoque + Exterior Intemperie',
        condicionCrucero: 'Humedad + Fisuras Leves',
        imprimanteSeleccionado: 'Colorlink Sellamur Acrílico Sellador Hidrófugo (1 mano base)',
        acabadoSeleccionado: 'Colorlink Koraza Pro Fachadas 100% Acrílica Elastomérica (2 manos)',
        resistenciaUV: 'Grado 1 Superior (Dióxido de titanio rutilo + biocidas anti-hongos)'
      }
    },
    {
      id: 5,
      name: 'Cantidades',
      summary: 'calcula área, manos, rendimiento, desperdicio y cantidad.',
      icon: Calculator,
      badge: 'Fórmula',
      category: 'Ingeniería Química',
      responsible: 'Algoritmo de Recubrimientos',
      execTime: '0.05s',
      detailData: {
        area: '85.00 m²',
        manosAcabado: '2 manos de pintura exterior',
        rendimientoTeorico: '25 m² por galón a dos manos',
        factorDesperdicio: '10% técnico por aplicación con rodillo en altura',
        galonesTeoricos: '6.80 galones',
        galonesConDesperdicio: '7.48 galones netos requeridos',
        presentacionOptima: '1 Cuñete (5 Galones) + 3 Galones sueltos (Total: 8 Galones)',
        imprimanteBase: '1 Cuñete (5 Galones) Sellamur Sellador'
      }
    },
    {
      id: 6,
      name: 'Disponibilidad',
      summary: 'consulta inventario, presentación, ubicación y lote.',
      icon: Package,
      badge: 'ERP / WMS',
      category: 'Operaciones y Stock',
      responsible: 'Conector ERP / CEDI Medellín',
      execTime: '0.3s',
      detailData: {
        cediAsignado: 'CEDI Central Medellín (Bodega Guayabal - Cra 52)',
        stockFisico: '28 cuñetes Koraza Base disponibles en bodega local',
        loteVigente: 'Lote CLK-MED-2026-08 (Fabricación fresca: 15-Ago-2026)',
        ubicacionBodega: 'Pasillo B, Estantería 04, Nivel 2',
        estadoStock: 'DISPONIBILIDAD INMEDIATA (Reserva automática activada)'
      }
    },
    {
      id: 7,
      name: 'Decisión',
      summary: 'define inventario o producción/tintometría.',
      icon: Scale,
      badge: 'Decisión',
      category: 'Operaciones y Stock',
      responsible: 'Motor de Decisión Operativa',
      execTime: '0.15s',
      detailData: {
        colorSolicitado: 'Gris Cemento Mate (Código Colorlink GR-402)',
        tipoPreparacion: 'TINTOMETRÍA AUTOMATIZADA REQUERIDA (Dispensador Hero Euro-Tint)',
        formulaColor: 'Base Pastel + 14ml Negro Lámpara + 6ml Ocre Óxido + 2ml Azul Ftalocianina',
        tiempoPreparacion: '45 minutos en laboratorio de tintometría CEDI Medellín',
        decisionFinal: 'Despachar base desde stock + preparación en máquina tintométrica hoy mismo'
      }
    },
    {
      id: 8,
      name: 'Solicitud',
      summary: 'genera presupuesto preliminar.',
      icon: FileText,
      badge: 'Financiero',
      category: 'Operaciones y Stock',
      responsible: 'Motor de Tarifas y PDF Colorlink',
      execTime: '0.4s',
      detailData: {
        numeroCotizacion: 'COT-2026-CLK-9082',
        subtotalPintura: '$890.000 COP (Cuñetes Koraza + Galones + Imprimante)',
        descuentoConstructora: '-$94.000 COP (Tarifa Corporativa Horizonte 10%)',
        fleteLocalMedellin: '$45.000 COP (Transporte directo a obra Guayabal)',
        iva19: '$159.790 COP',
        totalLiquidado: '$1.000.790 COP',
        validezOferta: '30 días calendario con garantía de precio'
      }
    },
    {
      id: 9,
      name: 'Human-in-the-loop',
      summary: 'casos complejos pasan a especialista.',
      icon: UserCheck,
      badge: 'Especialista',
      category: 'Aseguramiento Técnico',
      responsible: 'Ingeniería Técnica Colorlink',
      execTime: 'Manual / Supervisado',
      detailData: {
        alertaDisparada: 'Condición con presencia simultánea de humedad y fisuras en altura.',
        especialistaAsignado: 'Ing. Carlos Mario Restrepo (Especialista en Fachadas e Impermeabilización)',
        dictamenTecnico: 'APROBADO CON NOTA: Resanar fisuras > 0.5mm con Masilla Acrílica Elastomerica Colorlink previo a la aplicación del sellador.',
        tiempoAprobacion: '3 minutos en panel técnico supervisado'
      }
    },
    {
      id: 10,
      name: 'Logística',
      summary: 'reserva inventario y solicita despacho.',
      icon: Truck,
      badge: 'Despacho',
      category: 'Aseguramiento Técnico',
      responsible: 'WMS & Red Logística Colorlink',
      execTime: '0.5s',
      detailData: {
        ordenDespacho: 'ORD-DESP-2026-MED-4412',
        bloqueoLote: 'Lote CLK-MED-2026-08 apartado en ERP para Constructora Horizonte',
        ventanaEntrega: 'Compromiso dentro de los 20 días solicitados (Programada para entrega Día 3)',
        transportadora: 'Flota Propia Colorlink Medellín (Vehículo Camión Furgón Hino N° 04)',
        destinoExacto: 'Medellín, Antioquia - Obra Edificio Residencial'
      }
    },
    {
      id: 11,
      name: 'Servicio',
      summary: 'agenda acompañamiento técnico si aplica.',
      icon: Headphones,
      badge: 'Postventa',
      category: 'Servicio & Campo',
      responsible: 'Agenda CRM / Soporte Técnico',
      execTime: '0.2s',
      detailData: {
        aplicaAcompaniamiento: 'SÍ (Proyectos mayores a 80m² con condición de fisuras)',
        visitaAgendada: 'Martes 15-Sep-2026 (Día de aplicación de la primera mano)',
        asesorCampo: 'Tecnólogo Jaime Osorio - Asesor Técnico Regional Antioquia',
        objetivoVisita: 'Medición de humedad residual en sustrato (< 12%) y prueba de adherencia de película seca.'
      }
    },
    {
      id: 12,
      name: 'Comunicación',
      summary: 'informa cambios de estado al cliente.',
      icon: MessageSquare,
      badge: 'Mensajería',
      category: 'Servicio & Campo',
      responsible: 'Bot Transaccional WhatsApp & Email',
      execTime: '0.6s',
      detailData: {
        mensajeWhatsApp: 'Enviado al +57 312 845 6721: "Hola Valentina, tu cotización #COT-2026-CLK está lista con precio oficial de $1.000.790 COP."',
        correoTransaccional: 'Enviado a vgomez@constructorahorizonte.com.co con PDF adjunto y ficha técnica.',
        linkTracking: 'https://colorlink.com.co/seguimiento/COT-2026-CLK-9082',
        estadoNotificacion: 'ENTREGADO Y LEÍDO (Check azul confirmado)'
      }
    },
    {
      id: 13,
      name: 'Aplicación',
      summary: 'registra evidencias, consumos y novedades.',
      icon: PaintRoller,
      badge: 'Obra',
      category: 'Servicio & Campo',
      responsible: 'App Móvil de Contratista Colorlink',
      execTime: 'En obra',
      detailData: {
        bitacoraObra: 'Inicio de aplicación registrado a las 08:30 AM con 2 operarios certificados.',
        evidenciaPrimeraMano: 'Foto de anclaje de Sellamur y primera mano de Koraza subida a la nube.',
        consumoRealRegistrado: '7.6 galones reales consumidos (98.4% de precisión con el cálculo teórico).',
        novedades: 'Sin incidentes de adherencia. Clima favorable sin lluvia durante el secado.'
      }
    },
    {
      id: 14,
      name: 'Calidad',
      summary: 'relaciona incidencias con producto, lote y proyecto.',
      icon: ShieldCheck,
      badge: 'Garantía',
      category: 'Gobernanza & Métricas',
      responsible: 'Sistema de Trazabilidad y QA Colorlink',
      execTime: '0.3s',
      detailData: {
        certificadoCalidad: 'Certificado de Conformidad Lote CLK-MED-2026-08 emitido bajo Norma NTC 5828.',
        garantiaAsignada: 'PÓLIZA DE GARANTÍA DIRECTA DE 5 AÑOS Colorlink vinculada a la obra.',
        trazabilidadCompleta: 'ID Proyecto -> Lote Pintura -> Técnico Supervisor -> Certificado DIAN',
        incidenciasReportadas: '0 reclamaciones. Registro de calidad 100% conforme.'
      }
    },
    {
      id: 15,
      name: 'Analítica',
      summary: 'actualiza indicadores en dashboard.',
      icon: BarChart3,
      badge: 'KPIs',
      category: 'Gobernanza & Métricas',
      responsible: 'Dashboard Ejecutivo BI',
      execTime: 'Tiempo real',
      detailData: {
        tiempoCicloTotal: '3.8 minutos (de 48 horas en el proceso manual tradicional)',
        ahorroTiempo: '92% de reducción en tiempo de respuesta comercial',
        tasaAutomatizacion: '93.3% del flujo ejecutado de forma autónoma sin fricción',
        conversionEstimada: '+35% incremento en tasa de cierre con cotización inmediata'
      }
    }
  ];

  // Run the animated full end-to-end automation
  const handleRunFullAutomation = () => {
    setAutomationState('running');
    setCompletedSteps([]);
    setActiveStep(1);

    let current = 1;
    const interval = setInterval(() => {
      setCompletedSteps((prev) => [...prev, current]);
      setActiveStep(current);
      current++;

      if (current > 15) {
        clearInterval(interval);
        setAutomationState('completed');
        setActiveStep(15);
      }
    }, 450);
  };

  const handleResetAutomation = () => {
    setAutomationState('idle');
    setCompletedSteps([1, 2, 3, 4, 5, 6, 7, 8]);
    setActiveStep(1);
  };

  const handleCopySummary = () => {
    const text = `*COLORLINK® - AUTOMATIZACIÓN MVP EXTREMO A EXTREMO*
---------------------------------------------
📋 *CASO PRINCIPAL EJECUTADO:*
• Cliente: Constructora Horizonte S.A.S. (NIT 900.854.219-3)
• Ciudad: Medellín
• Proyecto: Fachada edificio residencial (85.00 m²)
• Superficie: Concreto / Revoque (Exterior intemperie)
• Condición: Humedad + fisuras
• Color: Gris Cemento Mate (Tintometría GR-402)
• Plazo Requerido: 20 días

⚙️ *RESULTADOS DEL PIPELINE (15 PASOS):*
1. Captura: Datos normalizados y 2 fotos adjuntas.
2. Validación: NIT DIAN aprobado sin duplicados.
3. IA Gemini: Fisuración capilar 0.2-0.4mm diagnosticada.
4. Motor Técnico: Sellamur Imprimante + Koraza Pro Fachadas 100% Acrílica.
5. Cantidades: 1 Cuñete (5G) + 3 Galones sueltos (7.48 gal netos).
6. Disponibilidad: CEDI Medellín con stock Lote CLK-MED-2026-08.
7. Decisión: Aprobada tintometría con base pastel.
8. Solicitud: Cotización #COT-2026-CLK por $1.000.790 COP liquidada.
9. Human-in-the-Loop: Aprobado por Ing. Carlos Restrepo.
10. Logística: Despacho programado con flota propia Medellín.
11. Servicio: Visita de asesor técnico agendada en obra.
12. Comunicación: Notificación enviada a WhatsApp y Email.
13. Aplicación: Bitácora de aplicación y consumo real registrado.
14. Calidad: Garantía de fábrica Colorlink 5 Años emitida.
15. Analítica: Tiempo de ciclo reducido a 3.8 minutos.`;

    navigator.clipboard.writeText(text);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 3000);
  };

  const currentStepData = stepsList.find((s) => s.id === activeStep) || stepsList[0];

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* HEADER PRINCIPAL IDÉNTICO AL REQUERIMIENTO */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm relative overflow-hidden">
        {/* Puntitos de colores característicos */}
        <ColorlinkConfettiDots className="absolute inset-0 z-0" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 bg-blue-50 text-blue-800 text-xs font-bold rounded-full border border-blue-200 flex items-center gap-1.5 backdrop-blur-xs">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Especificación Oficial del Proyecto
              </span>
              <span className="text-xs text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full font-bold border border-emerald-200 backdrop-blur-xs flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Pipeline Automatizado Operativo
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#002D62] tracking-tight">
              QUÉ SE DEBERÁ CONSTRUIR Y ENTREGAR
            </h1>
            <p className="text-slate-600 text-base sm:text-lg font-medium">
              El MVP deberá funcionar de extremo a extremo
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleRunFullAutomation}
              disabled={automationState === 'running'}
              className="px-5 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 active:scale-95 cursor-pointer disabled:opacity-75"
            >
              <Play className={`w-4 h-4 text-amber-300 ${automationState === 'running' ? 'animate-spin' : 'fill-amber-300'}`} />
              {automationState === 'running' ? 'Ejecutando Flujo (1 al 15)...' : 'Ejecutar Automatización (15 Pasos)'}
            </button>

            <button
              type="button"
              onClick={handleResetAutomation}
              className="p-3 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-2xl transition-all cursor-pointer border border-slate-200/80"
              title="Reiniciar flujo"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {onOpenClientForm && (
              <button
                type="button"
                onClick={onOpenClientForm}
                className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-bold rounded-2xl transition-all border border-slate-200 flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <FileCheck className="w-4 h-4 text-blue-600" />
                Ir a Formulario de Cotización
              </button>
            )}
          </div>
        </div>

        {/* Barra de progreso de ejecución */}
        {automationState === 'running' && (
          <div className="mt-6 pt-4 border-t border-slate-100 relative z-10">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                Procesando Paso {activeStep} de 15: {currentStepData.name}
              </span>
              <span className="font-mono text-blue-600">{Math.round((completedSteps.length / 15) * 100)}% Completado</span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div
                className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 transition-all duration-300 rounded-full"
                style={{ width: `${(completedSteps.length / 15) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* CONTENEDOR PRINCIPAL DE 2 COLUMNAS (EXACTO A LA IMAGEN) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* COLUMNA IZQUIERDA: CASO PRINCIPAL */}
        <div className="lg:col-span-4 bg-[#F6FBFA] rounded-3xl p-6 sm:p-7 border border-[#BCE4DE] shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="space-y-5">
            {/* Header del Caso */}
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-[#00897B] text-white flex items-center justify-center shadow-xs">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-[#00695C] tracking-tight">
                  Caso principal
                </h2>
                <div className="h-1 w-16 bg-[#00897B] rounded-full mt-0.5" />
              </div>
            </div>

            {/* Lista de 10 parámetros exactamente como la imagen */}
            <div className="bg-white/85 backdrop-blur-xs rounded-2xl p-4 sm:p-5 border border-[#D1EDE8] space-y-2.5 text-sm text-slate-800">
              <div className="flex items-start gap-2">
                <span className="text-[#00897B] font-bold">•</span>
                <span className="font-bold text-slate-900 w-28 shrink-0">Cliente:</span>
                <span className="font-semibold text-slate-800">Constructora Horizonte</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-[#00897B] font-bold">•</span>
                <span className="font-bold text-slate-900 w-28 shrink-0">Ciudad:</span>
                <span className="font-semibold text-slate-800">Medellín</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-[#00897B] font-bold">•</span>
                <span className="font-bold text-slate-900 w-28 shrink-0">Proyecto:</span>
                <span className="font-semibold text-slate-800">Fachada edificio residencial</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-[#00897B] font-bold">•</span>
                <span className="font-bold text-slate-900 w-28 shrink-0">Área:</span>
                <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">85.00 m²</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-[#00897B] font-bold">•</span>
                <span className="font-bold text-slate-900 w-28 shrink-0">Superficie:</span>
                <span className="font-semibold text-slate-800">concreto</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-[#00897B] font-bold">•</span>
                <span className="font-bold text-slate-900 w-28 shrink-0">Condición:</span>
                <span className="font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 text-xs">humedad + fisuras</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-[#00897B] font-bold">•</span>
                <span className="font-bold text-slate-900 w-28 shrink-0">Ambiente:</span>
                <span className="font-semibold text-slate-800">exterior</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-[#00897B] font-bold">•</span>
                <span className="font-bold text-slate-900 w-28 shrink-0">Color:</span>
                <span className="inline-flex items-center gap-1.5 font-semibold text-slate-800">
                  <span className="w-3.5 h-3.5 rounded-full bg-[#8A959E] border border-slate-300" />
                  gris
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-[#00897B] font-bold">•</span>
                <span className="font-bold text-slate-900 w-28 shrink-0">Fecha requerida:</span>
                <span className="font-bold text-slate-800">20 días</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-[#00897B] font-bold">•</span>
                <span className="font-bold text-slate-900 w-28 shrink-0">Fotografías:</span>
                <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 text-xs">adjuntas (2 fotos)</span>
              </div>
            </div>

            {/* Previsualización de Fotos del Caso */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-600 block">Fotografías cargadas en el caso:</span>
              <div className="grid grid-cols-2 gap-2">
                <div className="relative rounded-xl overflow-hidden border border-[#BCE4DE] bg-white p-2">
                  <div className="h-16 bg-slate-200 rounded-lg flex items-center justify-center text-slate-500 text-xs font-medium relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-tr from-slate-400 to-slate-200 flex items-center justify-center text-slate-700 font-bold text-[11px]">
                      Fachada 5 Pisos
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 block truncate mt-1">fachada_norte.jpg</span>
                </div>
                <div className="relative rounded-xl overflow-hidden border border-[#BCE4DE] bg-white p-2">
                  <div className="h-16 bg-slate-200 rounded-lg flex items-center justify-center text-slate-500 text-xs font-medium relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-tr from-amber-200 to-slate-300 flex items-center justify-center text-amber-900 font-bold text-[11px]">
                      Fisuras + Humedad
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 block truncate mt-1">detalle_humedad.jpg</span>
                </div>
              </div>
            </div>
          </div>

          {/* Frase inferior exacta de la imagen */}
          <div className="mt-6 pt-4 border-t border-[#BCE4DE] space-y-3">
            <p className="text-xs sm:text-sm font-bold text-[#00695C] italic">
              A partir de aquí comienza la automatización.
            </p>
            <button
              type="button"
              onClick={handleRunFullAutomation}
              className="w-full py-2.5 px-4 bg-[#00897B] hover:bg-[#00796B] text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              Disparar Pipeline con este Caso
            </button>
          </div>
        </div>

        {/* COLUMNA DERECHA: FLUJO AUTOMATIZADO (15 PASOS EN 3 COLUMNAS) */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm space-y-6">
          {/* Header de Flujo Automatizado */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                <Database className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-[#002D62] tracking-tight">
                  Flujo automatizado
                </h2>
                <div className="h-1 w-16 bg-blue-600 rounded-full mt-0.5" />
              </div>
            </div>

            <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-full border border-slate-200">
              15 Pasos de Extremo a Extremo
            </span>
          </div>

          {/* GRID DE LOS 15 PASOS EN 3 COLUMNAS (EXACTO A LA IMAGEN) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {stepsList.map((step) => {
              const isSelected = activeStep === step.id;
              const isCompleted = completedSteps.includes(step.id);
              const StepIcon = step.icon;

              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => setActiveStep(step.id)}
                  className={`text-left p-3.5 rounded-2xl border transition-all flex items-start gap-3 relative cursor-pointer ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/70 shadow-sm ring-2 ring-blue-500/20'
                      : isCompleted
                      ? 'border-slate-200 bg-slate-50/60 hover:bg-slate-100/70'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  {/* Número en círculo negro/azul */}
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                      isSelected
                        ? 'bg-blue-600 text-white'
                        : isCompleted
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {step.id}
                  </div>

                  {/* Icono del paso en caja sutil */}
                  <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-2xs text-slate-700">
                    <StepIcon className="w-4 h-4 text-blue-700" />
                  </div>

                  {/* Texto: Nombre — descripción corta */}
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-extrabold text-slate-900 block leading-tight">
                      {step.name}
                    </span>
                    <span className="text-[11px] text-slate-500 block leading-snug mt-0.5 line-clamp-2">
                      — {step.summary}
                    </span>
                  </div>

                  {isCompleted && (
                    <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-500" />
                  )}
                </button>
              );
            })}
          </div>

          {/* DETALLE INTERACTIVO DEL PASO SELECCIONADO */}
          <div className="bg-slate-50 rounded-2xl p-5 sm:p-6 border border-slate-200/90 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-blue-600 text-white font-bold text-sm flex items-center justify-center shadow-xs">
                  {currentStepData.id}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-base text-slate-900">
                      Paso {currentStepData.id}: {currentStepData.name}
                    </h3>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                      {currentStepData.badge}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Responsable técnico: <strong className="text-slate-800">{currentStepData.responsible}</strong> • Tiempo de ejecución: <strong className="text-emerald-700 font-mono">{currentStepData.execTime}</strong>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveStep((prev) => (prev > 1 ? prev - 1 : 15))}
                  className="px-2.5 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 cursor-pointer"
                >
                  ← Anterior
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStep((prev) => (prev < 15 ? prev + 1 : 1))}
                  className="px-2.5 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 cursor-pointer"
                >
                  Siguiente →
                </button>
              </div>
            </div>

            {/* Contenido de datos del paso seleccionado */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {Object.entries(currentStepData.detailData).map(([key, val]) => (
                <div key={key} className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                    {key.replace(/([A-Z])/g, ' $1')}
                  </span>
                  {Array.isArray(val) ? (
                    <ul className="space-y-0.5 text-slate-800 font-medium">
                      {val.map((item, i) => (
                        <li key={i} className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="font-semibold text-slate-800 leading-relaxed block">
                      {val}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Acciones Rápidas del Paso */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200 text-xs">
              <span className="text-slate-500 italic">
                {currentStepData.summary}
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopySummary}
                  className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 font-bold rounded-lg border border-slate-200 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  {copiedNotification ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 text-blue-600" />}
                  <span>{copiedNotification ? '¡Resumen Copiado!' : 'Copiar Resumen'}</span>
                </button>

                {currentStepData.id === 8 && onOpenClientForm && (
                  <button
                    type="button"
                    onClick={onOpenClientForm}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Ver Cotización Oficial
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
