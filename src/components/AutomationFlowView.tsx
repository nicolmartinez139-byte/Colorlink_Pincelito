import { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  Workflow,
  Cpu,
  Boxes,
  Truck,
  Send,
  MessageSquare,
  ShieldCheck,
  BarChart3,
  Bot,
  UserCog,
  Check
} from 'lucide-react';

export function AutomationFlowView() {
  const [selectedStep, setSelectedStep] = useState<number>(1);

  const steps = [
    {
      num: 1,
      title: 'Captura',
      summary: 'Recibe datos, fotos y características estructuradas',
      module: 'Identificación, Proyecto, Técnico, Evidencia',
      tech: 'Google AI Studio / Formulario React',
      detail: 'Se ingieren los 4 bloques normalizados con validaciones en cliente para evitar datos nulos o corruptos.'
    },
    {
      num: 2,
      title: 'Validación',
      summary: 'Detecta faltantes, errores o duplicados',
      module: 'Validación NIT & Reglas de Formato',
      tech: 'FastAPI / Pydantic',
      detail: 'Verifica la integridad de datos, busca si el NIT ya existe en Supabase y rechaza inputs inválidos antes de procesar.'
    },
    {
      num: 3,
      title: 'IA Gemini',
      summary: 'Clasifica la necesidad desde texto no estructurado e imágenes',
      module: 'Descripción Libre + Fotos',
      tech: 'Gemini 2.5 Flash Multimodal',
      detail: 'La IA analiza fotos del sustrato y la descripción para diagnosticar severidad de fisuras y etiquetar patologías (SIN inventar fórmulas de rendimiento).'
    },
    {
      num: 4,
      title: 'Motor Técnico',
      summary: 'Cruza superficie, ambiente, condición y catálogo',
      module: 'Técnico (Superficie + Ambiente + Condición)',
      tech: 'Matriz Determinista en Python / JS',
      detail: 'Aplica reglas de negocio de pinturas: selecciona la familia de producto (acrílico, epóxico, poliuretano) e imprimante requerido.'
    },
    {
      num: 5,
      title: 'Cantidades',
      summary: 'Calcula área, manos, rendimiento, desperdicio y cantidad',
      module: 'Proyecto (Área m²)',
      tech: 'Fórmulas Matemáticas de Ingeniería',
      detail: 'Calcula: Galones = (Área * Manos / Rendimiento) * 1.10. Determina cuñetes y galones sueltos de manera 100% matemática.'
    },
    {
      num: 6,
      title: 'Disponibilidad',
      summary: 'Consulta inventario, presentación, ubicación y lote',
      module: 'Proyecto (Ciudad / CEDI)',
      tech: 'ERP API / Supabase Inventory',
      detail: 'Revisa stock en la bodega de la ciudad solicitada (e.g. CEDI Medellín) para el producto y base de colorante seleccionados.'
    },
    {
      num: 7,
      title: 'Decisión',
      summary: 'Define inventario o producción / tintometría',
      module: 'Técnico (Color / Acabado)',
      tech: 'Motor de Decisión Operativa',
      detail: 'Si es color de línea blanco -> Despacho inmediato de stock. Si es color especial -> Genera orden de tintometría.'
    },
    {
      num: 8,
      title: 'Solicitud',
      summary: 'Genera presupuesto preliminar estructurado',
      module: 'Consolidación de Solicitud',
      tech: 'Activepieces / n8n PDF Generator',
      detail: 'Crea la proforma o cotización oficial en PDF con desglose de producto principal, imprimante y tiempo estimado.'
    },
    {
      num: 9,
      title: 'Human-in-the-loop',
      summary: 'Casos complejos pasan a especialista técnico',
      module: 'Alerta de Complejidad',
      tech: 'Cola de Tareas en Dashboard',
      detail: 'Si el sustrato presenta descascaramiento severo o ambiente químico extremo, se escala a un ingeniero técnico de campo.'
    },
    {
      num: 10,
      title: 'Logística',
      summary: 'Reserva inventario y solicita despacho',
      module: 'Proyecto (Fecha Requerida)',
      tech: 'WMS / Integración de Envíos',
      detail: 'Bloquea el lote en bodega y agenda la ventana de entrega según la fecha requerida por la constructora.'
    },
    {
      num: 11,
      title: 'Servicio',
      summary: 'Agenda acompañamiento técnico si aplica',
      module: 'Evidencia (Observaciones)',
      tech: 'Google Calendar / CRM API',
      detail: 'Si la obra requiere supervisión de anclajes o aplicación, agenda automáticamente la visita de un asesor técnico.'
    },
    {
      num: 12,
      title: 'Comunicación',
      summary: 'Informa cambios de estado al cliente',
      module: 'Identificación (Responsable / Canal)',
      tech: 'Email Service API Oficial / Notificación Transaccional',
      detail: 'Envía notificaciones automáticas: "Su cotización fue generada", "Su pedido está en tintometría", "En camino a obra".'
    },
    {
      num: 13,
      title: 'Aplicación',
      summary: 'Registra evidencias, consumos y novedades',
      module: 'Evidencia de Cierre',
      tech: 'App Móvil de Campo',
      detail: 'Durante la aplicación, los operarios suben fotos de la primera mano y registran galones reales consumidos.'
    },
    {
      num: 14,
      title: 'Calidad',
      summary: 'Relaciona incidencias con producto, lote y proyecto',
      module: 'Trazabilidad por Lote',
      tech: 'Módulo QA / Supabase',
      detail: 'En caso de queja o reclamo, se correlaciona con la foto inicial de la captura y el lote despachado.'
    },
    {
      num: 15,
      title: 'Analítica',
      summary: 'Actualiza indicadores en dashboard ejecutivo',
      module: 'BI & KPIs',
      tech: 'Metabase / Looker Studio',
      detail: 'Mide tiempos de ciclo (lead time), % de solicitudes atendidas sin intervención manual y productos más demandados.'
    }
  ];

  return (
    <div id="automation-flow-view" className="space-y-8">
      {/* Header */}
      <div className="bg-white text-slate-800 p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold uppercase mb-2">
              <Workflow className="w-3.5 h-3.5" />
              Flujo Automatizado de Extremo a Extremo
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">El Viaje de los Datos: De la Captura al Valor</h2>
            <p className="text-slate-600 text-sm mt-1 max-w-3xl">
              Cómo los 4 bloques del Formulario Mínimo Viable disparan la automatización completa sin recaptura manual.
            </p>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-xl text-emerald-800 text-xs font-mono font-bold">
            15 Pasos del Pipeline MVP
          </div>
        </div>
      </div>

      {/* Grid de Pasos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {steps.map((step) => {
          const isSelected = selectedStep === step.num;
          return (
            <button
              key={step.num}
              onClick={() => setSelectedStep(step.num)}
              className={`text-left p-3.5 rounded-xl border transition-all flex flex-col justify-between h-36 ${
                isSelected
                  ? 'bg-blue-600 text-white border-blue-500 shadow-md ring-2 ring-blue-400/40'
                  : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    isSelected ? 'bg-white text-blue-700' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {step.num}
                </span>
                <span
                  className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded ${
                    isSelected ? 'bg-blue-700/60 text-blue-100' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {step.num <= 5 ? 'Core MVP' : 'Extensión'}
                </span>
              </div>
              <div>
                <h4 className="font-bold text-xs mt-2">{step.title}</h4>
                <p
                  className={`text-[11px] line-clamp-2 mt-0.5 ${
                    isSelected ? 'text-blue-100' : 'text-slate-500'
                  }`}
                >
                  {step.summary}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Detalle del Paso Seleccionado */}
      {selectedStep && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          {(() => {
            const current = steps.find((s) => s.num === selectedStep)!;
            return (
              <div className="flex flex-col md:flex-row items-start justify-between gap-6">
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm">
                      #{current.num}
                    </span>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{current.title}</h3>
                      <p className="text-xs text-slate-500">{current.summary}</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                    {current.detail}
                  </p>
                </div>

                <div className="w-full md:w-80 bg-slate-50 text-slate-800 p-5 rounded-2xl border border-slate-200 space-y-3 text-xs shrink-0">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Mapeo de Datos & Tecnología
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px] font-medium">Módulo de Entrada Formulario:</span>
                    <span className="font-semibold text-blue-700 block mt-0.5">{current.module}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px] font-medium">Herramienta / Stack:</span>
                    <code className="text-emerald-700 font-mono text-xs block mt-0.5 font-bold">{current.tech}</code>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
