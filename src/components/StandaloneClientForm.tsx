import React, { useState } from 'react';
import { ProjectFormData } from '../types/form';
import { CASE_STUDY_PRESET } from '../data/dictionaryData';
import { calculateTechnicalRequirements, formatCOP } from '../utils/calculator';
import { ColorFinishSelector } from './ColorFinishSelector';
import {
  Building2,
  FileCheck,
  CheckCircle2,
  Send,
  RotateCcw,
  Sparkles,
  Layers,
  Upload,
  Trash2,
  CheckCircle,
  FileText,
  Printer,
  Share2,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Truck,
  DollarSign,
  Tag,
  Receipt,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Clock,
  Check,
  Edit3,
  Package,
  Award
} from 'lucide-react';

interface StandaloneClientFormProps {
  onSuccessSubmit?: (data: ProjectFormData) => void;
  onNavigateToSpecs?: () => void;
}

export function StandaloneClientForm({ onSuccessSubmit, onNavigateToSpecs }: StandaloneClientFormProps) {
  const [formData, setFormData] = useState<ProjectFormData>({
    cliente: 'Constructora Horizonte S.A.S.',
    nitDocumento: '900.854.219-3',
    responsable: 'Arq. Valentina Gómez',
    emailResponsable: 'proyectos@constructorahorizonte.com',
    telefonoResponsable: '+57 312 456 7890',
    canalEntrada: 'Portal Clientes',
    ciudad: 'Medellín',
    tipoObra: 'Fachada Edificio',
    areaM2: 85,
    fechaRequerida: '2026-09-15',
    superficie: 'Concreto / Revoque',
    ambiente: 'Exterior Intemperie',
    condicion: 'Fisuras leves y humedad',
    colorAcabado: 'Gris (Mate)',
    descripcionLibre: 'Mantenimiento preventivo y correctivo en fachada de edificio de 5 pisos. Presenta fisuras superficiales no estructurales y rastros de humedad por lluvia directa.',
    fotos: [
      { name: 'fachada_norte_fisuras.jpg', size: '2.8 MB' },
      { name: 'detalle_humedad_concreto.png', size: '1.9 MB' }
    ],
    observaciones: 'Acceso por andamios colgantes certificados de obra.',
    consentimiento: true
  });

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [copiedQuote, setCopiedQuote] = useState<boolean>(false);

  const technicalCalc = calculateTechnicalRequirements(formData);
  const presupuesto = technicalCalc.presupuesto;

  const handleInputChange = (field: keyof ProjectFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleLoadCaseStudy = () => {
    setFormData({
      cliente: CASE_STUDY_PRESET.cliente || '',
      nitDocumento: CASE_STUDY_PRESET.nitDocumento || '',
      responsable: CASE_STUDY_PRESET.responsable || '',
      emailResponsable: CASE_STUDY_PRESET.emailResponsable || '',
      telefonoResponsable: CASE_STUDY_PRESET.telefonoResponsable || '',
      canalEntrada: 'Portal Clientes',
      ciudad: CASE_STUDY_PRESET.ciudad || 'Medellín',
      tipoObra: (CASE_STUDY_PRESET.tipoObra as any) || 'Fachada Edificio',
      areaM2: CASE_STUDY_PRESET.areaM2 || 85,
      fechaRequerida: CASE_STUDY_PRESET.fechaRequerida || '2026-09-15',
      superficie: (CASE_STUDY_PRESET.superficie as any) || 'Concreto / Revoque',
      ambiente: (CASE_STUDY_PRESET.ambiente as any) || 'Exterior Intemperie',
      condicion: (CASE_STUDY_PRESET.condicion as any) || 'Fisuras leves y humedad',
      colorAcabado: 'Gris (Mate)',
      descripcionLibre: CASE_STUDY_PRESET.descripcionLibre || 'Mantenimiento en fachada de 5 pisos con fisuras superficiales y humedad.',
      fotos: CASE_STUDY_PRESET.fotos || [{ name: 'fachada_norte_fisuras.jpg', size: '2.4 MB' }],
      observaciones: CASE_STUDY_PRESET.observaciones || 'Acceso por andamios colgantes certificados de obra.',
      consentimiento: true
    });
    setErrors({});
    setIsSubmitted(false);
    setCurrentStep(1);
  };

  const validateStep = (stepNumber: number) => {
    const err: Record<string, string> = {};
    if (stepNumber === 1) {
      if (!formData.cliente.trim()) err.cliente = 'Indique la empresa o razón social';
      if (!formData.nitDocumento.trim()) err.nitDocumento = 'Indique el NIT o documento';
      if (!formData.responsable.trim()) err.responsable = 'Nombre de contacto requerido';
      if (!formData.telefonoResponsable.trim()) err.telefonoResponsable = 'Teléfono o WhatsApp requerido';
    } else if (stepNumber === 2) {
      if (!formData.ciudad.trim()) err.ciudad = 'Seleccione la ciudad de entrega';
      if (!formData.areaM2 || formData.areaM2 <= 0) err.areaM2 = 'El área debe ser mayor a 0 m²';
      if (!formData.fechaRequerida) err.fechaRequerida = 'Indique la fecha estimada de inicio';
    } else if (stepNumber === 3) {
      if (!formData.colorAcabado.trim()) err.colorAcabado = 'Seleccione el color y acabado';
    } else if (stepNumber === 4) {
      if (!formData.descripcionLibre.trim() || formData.descripcionLibre.length < 10) {
        err.descripcionLibre = 'Describa el proyecto con al menos 10 caracteres';
      }
      if (formData.fotos.length === 0) {
        err.fotos = 'Debe adjuntar al menos una foto de evidencia';
      }
      if (!formData.consentimiento) {
        err.consentimiento = 'Debe autorizar el tratamiento de datos para cotizar';
      }
    }
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let allValid = true;
    for (let s = 1; s <= 4; s++) {
      if (!validateStep(s)) {
        allValid = false;
        setCurrentStep(s);
        break;
      }
    }

    if (allValid) {
      setIsSubmitted(true);
      if (onSuccessSubmit) {
        onSuccessSubmit(formData);
      }
      // Scroll to top of presentation
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleAddMockPhoto = () => {
    const samples = [
      'fachada_lateral_angulo2.jpg',
      'patologia_concreto_zoom.jpg',
      'inspeccion_obra_general.png'
    ];
    const chosen = samples[Math.floor(Math.random() * samples.length)];
    setFormData(prev => ({
      ...prev,
      fotos: [...prev.fotos, { name: chosen, size: '2.5 MB' }]
    }));
    if (errors.fotos) {
      setErrors(prev => {
        const next = { ...prev };
        delete next.fotos;
        return next;
      });
    }
  };

  const handleRemovePhoto = (idx: number) => {
    setFormData(prev => ({
      ...prev,
      fotos: prev.fotos.filter((_, i) => i !== idx)
    }));
  };

  const resetForm = () => {
    setFormData({
      cliente: '',
      nitDocumento: '',
      responsable: '',
      emailResponsable: '',
      telefonoResponsable: '',
      canalEntrada: 'Portal Clientes',
      ciudad: 'Medellín',
      tipoObra: 'Fachada Edificio',
      areaM2: 50,
      fechaRequerida: '',
      superficie: 'Concreto / Revoque',
      ambiente: 'Exterior Intemperie',
      condicion: 'Nueva sin pintar',
      colorAcabado: 'Gris (Mate)',
      descripcionLibre: '',
      fotos: [],
      observaciones: '',
      consentimiento: false
    });
    setErrors({});
    setIsSubmitted(false);
    setCurrentStep(1);
  };

  const handleCopyBudgetSummary = () => {
    const text = `COTIZACIÓN PINTUCO PROFESIONAL
Cliente: ${formData.cliente}
NIT: ${formData.nitDocumento}
Ciudad de Despacho: ${formData.ciudad}
Área: ${formData.areaM2} m² (${formData.colorAcabado})

RESUMEN DE MATERIALES:
${presupuesto.items.map(it => `- ${it.quantity} x ${it.name} (${it.presentation}): ${formatCOP(it.totalPrice)}`).join('\n')}

Subtotal Materiales: ${formatCOP(presupuesto.subtotalMateriales)}
Descuento Constructora (-${presupuesto.descuentoPorcentaje}%): -${formatCOP(presupuesto.descuentoValor)}
Flete Terrestre Asegurado (${formData.ciudad}): ${formatCOP(presupuesto.fleteEnvio)}
IVA (19%): ${formatCOP(presupuesto.ivaValor)}
----------------------------------------
TOTAL GENERAL COTIZADO: ${formatCOP(presupuesto.totalPresupuesto)} COP
Tiempo estimado de entrega: ${presupuesto.tiempoEntregaDias}`;
    
    navigator.clipboard.writeText(text);
    setCopiedQuote(true);
    setTimeout(() => setCopiedQuote(false), 3000);
  };

  return (
    <div id="standalone-client-presentation" className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* VISTA A: DOCUMENTO OFICIAL DE COTIZACIÓN Y PRESUPUESTO EMITIDO (SE MUESTRA TRAS EMITIR LA COTIZACIÓN) */}
      {isSubmitted ? (
        <div className="space-y-6 animate-fadeIn">
          {/* Barra Superior de Estado y Acciones Rápidas */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-emerald-500/20 text-emerald-300 text-xs font-mono font-bold px-3 py-1 rounded-full border border-emerald-400/30 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> COTIZACIÓN OFICIAL EMITIDA #COT-2026-HORIZONTE
                </span>
                <span className="text-xs text-blue-300 bg-blue-500/20 px-2.5 py-0.5 rounded-full font-bold border border-blue-400/30">
                  Precios Reales COP Vigentes
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                Propuesta Comercial & Presupuesto Liquidado
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm">
                Cliente: <strong className="text-slate-100">{formData.cliente}</strong> • NIT: <span className="font-mono text-slate-200">{formData.nitDocumento}</span> • Destino: <strong className="text-slate-100">{formData.ciudad}</strong>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={handleCopyBudgetSummary}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-2xl transition-all border border-slate-700 flex items-center gap-2"
                title="Copiar cotización para enviar por WhatsApp"
              >
                {copiedQuote ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4 text-blue-400" />}
                <span>{copiedQuote ? '¡Copiado a WhatsApp!' : 'Copiar Resumen'}</span>
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-2xl transition-all border border-slate-700 flex items-center gap-2"
                title="Imprimir o guardar en PDF"
              >
                <Printer className="w-4 h-4 text-slate-300" />
                <span>Imprimir / PDF</span>
              </button>
              <button
                type="button"
                onClick={() => setIsSubmitted(false)}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-2xl shadow-sm hover:shadow transition-all flex items-center gap-2"
              >
                <Edit3 className="w-4 h-4" />
                <span>Modificar Datos</span>
              </button>
            </div>
          </div>

          {/* Gran Tarjeta Central del Documento */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-10 space-y-8">
            {/* Metadatos Principales del Proyecto */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider block">Área de Obra</span>
                <span className="text-2xl font-black text-slate-900 block mt-0.5">{formData.areaM2} m²</span>
                <span className="text-xs text-slate-500 block truncate">{formData.tipoObra}</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider block">Color & Acabado</span>
                <span className="text-base font-bold text-slate-900 block mt-1 truncate">
                  {formData.colorAcabado}
                </span>
                <span className="text-xs text-blue-700 font-semibold block">Tintometría Homologada</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider block">Ciudad de Despacho</span>
                <span className="text-base font-bold text-slate-900 block mt-1">{formData.ciudad}</span>
                <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {presupuesto.tiempoEntregaDias}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider block">Contacto Autorizado</span>
                <span className="text-xs font-bold text-slate-900 block mt-1 truncate">{formData.responsable}</span>
                <span className="text-xs text-slate-600 font-mono block truncate">{formData.telefonoResponsable}</span>
              </div>
            </div>

            {/* Especificación del Sistema Químico Asignado */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50/70 border border-blue-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-700" /> Sistema Químico Profesional Recomendado:
                </span>
                <h3 className="text-lg font-black text-slate-900">{technicalCalc.productoRecomendado}</h3>
                <p className="text-xs text-slate-600">
                  Base: <strong>{technicalCalc.selladorImprimanteRequerido}</strong> • Rendimiento: {technicalCalc.rendimientoTeoricoM2Galon} m²/galón a {technicalCalc.manosSugeridas} manos.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="px-3.5 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-xl shadow-xs">
                  {technicalCalc.cuñetesRequeridos} Cuñetes + {technicalCalc.galonesSueltosRequeridos} Gal.
                </span>
              </div>
            </div>

            {/* TABLA DE COTIZACIÓN COMERCIAL DETALLADA CON PRECIOS REALES */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-blue-600" /> Tabla Detallada de Materiales & Precios Reales (COP)
                </h4>
                <span className="text-xs text-slate-500 font-mono">Valores en Pesos Colombianos</span>
              </div>

              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3.5">Descripción del Material / Recubrimiento</th>
                      <th className="p-3.5">Presentación</th>
                      <th className="p-3.5 text-center">Cantidad</th>
                      <th className="p-3.5 text-right">Precio Unitario</th>
                      <th className="p-3.5 text-right">Total Parcial</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {presupuesto.items.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3.5">
                          <span className="font-bold text-slate-900 text-sm block">{item.name}</span>
                          <span className="text-xs text-slate-500 block mt-0.5">{item.description}</span>
                        </td>
                        <td className="p-3.5 text-slate-700 font-medium whitespace-nowrap">{item.presentation}</td>
                        <td className="p-3.5 text-center font-bold text-slate-900 text-sm">{item.quantity}</td>
                        <td className="p-3.5 text-right font-mono text-slate-600">{formatCOP(item.unitPrice)}</td>
                        <td className="p-3.5 text-right font-mono font-bold text-slate-900 text-sm">{formatCOP(item.totalPrice)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* LIQUIDACIÓN FINANCIERA: SUBTOTAL, DESCUENTO, FLETE, IVA Y TOTAL */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-2">
              <div className="md:col-span-6 space-y-3">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2 text-slate-600">
                  <h5 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-blue-600" /> Logística de Despacho & Cobertura:
                  </h5>
                  <p>
                    Despacho directo desde el centro de distribución logístico a la obra en <strong>{formData.ciudad}</strong>.
                  </p>
                  <p className="text-slate-500">
                    Incluye póliza de seguro de transporte contra derrames y roturas de envases durante el trayecto.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 text-xs space-y-1 text-amber-900">
                  <span className="font-bold flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-700" /> Garantía de Fábrica Pintuco:
                  </span>
                  <p className="text-amber-800">
                    Garantía técnica de durabilidad e hidro-repelencia certificada para el sistema especificado en fachada.
                  </p>
                </div>
              </div>

              {/* Panel de Totales Financieros */}
              <div className="md:col-span-6">
                <div className="p-6 rounded-3xl bg-slate-900 text-white border border-slate-800 space-y-3 shadow-lg">
                  <div className="flex justify-between text-xs text-slate-300">
                    <span>Subtotal Materiales:</span>
                    <span className="font-mono font-bold text-white">{formatCOP(presupuesto.subtotalMateriales)}</span>
                  </div>

                  {presupuesto.descuentoPorcentaje > 0 && (
                    <div className="flex justify-between text-xs text-emerald-400 font-semibold">
                      <span className="flex items-center gap-1">
                        <Tag className="w-3.5 h-3.5" /> Descuento Constructora ({presupuesto.descuentoPorcentaje}%):
                      </span>
                      <span className="font-mono font-bold">-{formatCOP(presupuesto.descuentoValor)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-xs text-slate-300">
                    <span>Subtotal con Descuento:</span>
                    <span className="font-mono font-bold text-white">{formatCOP(presupuesto.subtotalConDescuento)}</span>
                  </div>

                  <div className="flex justify-between text-xs text-blue-300 font-medium">
                    <span className="flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5 text-blue-400" /> Envío / Flete Terrestre ({formData.ciudad}):
                    </span>
                    <span className="font-mono font-bold text-white">{formatCOP(presupuesto.fleteEnvio)}</span>
                  </div>

                  <div className="flex justify-between text-xs text-slate-300">
                    <span>IVA Reglamentario (19%):</span>
                    <span className="font-mono font-bold text-white">{formatCOP(presupuesto.ivaValor)}</span>
                  </div>

                  {/* GRAN TOTAL */}
                  <div className="pt-4 border-t border-slate-700 flex justify-between items-center">
                    <div>
                      <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-bold">
                        TOTAL GENERAL A PAGAR:
                      </span>
                      <span className="text-[10px] text-emerald-400">Materiales + Despacho + IVA</span>
                    </div>
                    <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
                      {formatCOP(presupuesto.totalPresupuesto)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Términos Comerciales & Garantías */}
            <div className="text-xs text-slate-500 bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
              <p>• <strong>Validez de la oferta comercial:</strong> 15 días calendario a partir de su emisión.</p>
              <p>• <strong>Condiciones de entrega:</strong> Puesto en obra en {formData.ciudad} dentro de los plazos estipulados ({presupuesto.tiempoEntregaDias}).</p>
              <p>• <strong>Soporte Técnico:</strong> Acompañamiento en obra y validación de primera mano por asesor técnico homologado.</p>
            </div>

            {/* Acciones Finales del Documento */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsSubmitted(false)}
                className="w-full sm:w-auto px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl transition-all flex items-center justify-center gap-2"
              >
                <Edit3 className="w-4 h-4" /> Modificar Parámetros / Nueva Cotización
              </button>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="w-full sm:w-auto px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-2xl transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  <Printer className="w-4 h-4" /> Guardar / Imprimir PDF Oficial
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* VISTA B: FORMULARIO DE CAPTURA PASO A PASO (LIMPIO, SIN PRECIOS PREMATUROS) */
        <div className="space-y-8">
          {/* Header Corporativo para Clientes */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-50 via-indigo-50/40 to-transparent -z-10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-100 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600" /> Portal Oficial para Constructoras & Clientes
                  </span>
                  <span className="text-xs text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full font-bold border border-emerald-200 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-emerald-600" /> Cotización Automatizada
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Especificación Técnica & Solicitud de Cotización
                </h1>
                <p className="text-slate-600 text-sm max-w-2xl leading-relaxed">
                  Completa los 4 pasos de tu proyecto para recibir al instante la cotización oficial detallada con precios reales, cálculo de flete a tu ciudad y total liquidado.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={handleLoadCaseStudy}
                  className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-2xl shadow-sm hover:shadow transition-all flex items-center gap-2 active:scale-95"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  Cargar Caso: Constructora Horizonte
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="p-2.5 text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-2xl transition-all"
                  title="Reiniciar formulario"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Stepper Visual de 4 Pasos */}
            <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { step: 1, title: '1. Identificación', desc: 'Cliente, NIT y Contacto', icon: Building2 },
                { step: 2, title: '2. Ubicación & Área', desc: 'Ciudad, m² y Fechas', icon: Layers },
                { step: 3, title: '3. Parámetros Técnicos', desc: 'Sustrato y Color', icon: Sparkles },
                { step: 4, title: '4. Evidencias & Envío', desc: 'Fotografías y Confirmación', icon: FileCheck }
              ].map((item) => {
                const isCompleted = currentStep > item.step;
                const isCurrent = currentStep === item.step;
                const Icon = item.icon;
                return (
                  <button
                    key={item.step}
                    type="button"
                    onClick={() => setCurrentStep(item.step)}
                    className={`p-3 rounded-2xl text-left border transition-all flex items-center gap-3 ${
                      isCurrent
                        ? 'border-blue-600 bg-blue-50/80 shadow-xs ring-2 ring-blue-500/20'
                        : isCompleted
                        ? 'border-emerald-200 bg-emerald-50/40 text-emerald-900'
                        : 'border-slate-200 bg-white/60 text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                        isCurrent
                          ? 'bg-blue-600 text-white shadow-sm'
                          : isCompleted
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0">
                      <span className={`text-xs font-bold block truncate ${isCurrent ? 'text-blue-900' : 'text-slate-800'}`}>
                        {item.title}
                      </span>
                      <span className="text-[11px] text-slate-500 block truncate">{item.desc}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Formulario Centrado Paso a Paso */}
          <div className="max-w-4xl mx-auto space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* PASO 1: IDENTIFICACIÓN */}
                {currentStep === 1 && (
                  <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 animate-fadeIn">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">1. Identificación de la Empresa o Contacto</h3>
                        <p className="text-xs text-slate-500">Datos para la expedición de la cotización formal y facturación.</p>
                      </div>
                      <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">Paso 1 de 4</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Empresa / Razón Social / Cliente <span className="text-rose-500">*</span>
                        </label>
                        <input
                          id="standalone-input-cliente"
                          type="text"
                          placeholder="Ej. Constructora Horizonte S.A.S."
                          value={formData.cliente}
                          onChange={(e) => handleInputChange('cliente', e.target.value)}
                          className={`w-full px-4 py-3 text-sm bg-slate-50/80 border ${
                            errors.cliente ? 'border-rose-400 focus:ring-rose-400 bg-rose-50/20' : 'border-slate-200 focus:ring-blue-500'
                          } rounded-2xl focus:bg-white focus:outline-none focus:ring-2 transition-all`}
                        />
                        {errors.cliente && <p className="text-xs text-rose-600 mt-1.5">{errors.cliente}</p>}
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          NIT / Documento de Identidad <span className="text-rose-500">*</span>
                        </label>
                        <input
                          id="standalone-input-nit"
                          type="text"
                          placeholder="Ej. 900.854.219-3"
                          value={formData.nitDocumento}
                          onChange={(e) => handleInputChange('nitDocumento', e.target.value)}
                          className={`w-full px-4 py-3 text-sm bg-slate-50/80 border ${
                            errors.nitDocumento ? 'border-rose-400 focus:ring-rose-400 bg-rose-50/20' : 'border-slate-200 focus:ring-blue-500'
                          } rounded-2xl focus:bg-white focus:outline-none focus:ring-2 transition-all`}
                        />
                        {errors.nitDocumento && <p className="text-xs text-rose-600 mt-1.5">{errors.nitDocumento}</p>}
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Persona de Contacto / Cargo <span className="text-rose-500">*</span>
                        </label>
                        <input
                          id="standalone-input-responsable"
                          type="text"
                          placeholder="Ej. Arq. Valentina Gómez"
                          value={formData.responsable}
                          onChange={(e) => handleInputChange('responsable', e.target.value)}
                          className={`w-full px-4 py-3 text-sm bg-slate-50/80 border ${
                            errors.responsable ? 'border-rose-400 focus:ring-rose-400 bg-rose-50/20' : 'border-slate-200 focus:ring-blue-500'
                          } rounded-2xl focus:bg-white focus:outline-none focus:ring-2 transition-all`}
                        />
                        {errors.responsable && <p className="text-xs text-rose-600 mt-1.5">{errors.responsable}</p>}
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Teléfono / WhatsApp <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                          <input
                            id="standalone-input-tel"
                            type="tel"
                            placeholder="+57 312 456 7890"
                            value={formData.telefonoResponsable}
                            onChange={(e) => handleInputChange('telefonoResponsable', e.target.value)}
                            className={`w-full pl-10 pr-4 py-3 text-sm bg-slate-50/80 border ${
                              errors.telefonoResponsable ? 'border-rose-400 focus:ring-rose-400 bg-rose-50/20' : 'border-slate-200 focus:ring-blue-500'
                            } rounded-2xl focus:bg-white focus:outline-none focus:ring-2 transition-all`}
                          />
                        </div>
                        {errors.telefonoResponsable && <p className="text-xs text-rose-600 mt-1.5">{errors.telefonoResponsable}</p>}
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Correo Electrónico
                        </label>
                        <div className="relative">
                          <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                          <input
                            id="standalone-input-email"
                            type="email"
                            placeholder="proyectos@empresa.com"
                            value={formData.emailResponsable}
                            onChange={(e) => handleInputChange('emailResponsable', e.target.value)}
                            className="w-full pl-10 pr-4 py-3 text-sm bg-slate-50/80 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={handleNextStep}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-2xl shadow-sm hover:shadow transition-all flex items-center gap-2"
                      >
                        Continuar al Proyecto <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* PASO 2: PROYECTO, CIUDAD & ÁREA */}
                {currentStep === 2 && (
                  <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 animate-fadeIn">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">2. Ubicación, Área y Fechas</h3>
                        <p className="text-xs text-slate-500">Variables para calcular el flete de despacho y la cantidad de envases.</p>
                      </div>
                      <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">Paso 2 de 4</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Ciudad de Despacho / Entrega <span className="text-rose-500">*</span>
                        </label>
                        <select
                          id="standalone-select-ciudad"
                          value={formData.ciudad}
                          onChange={(e) => handleInputChange('ciudad', e.target.value)}
                          className="w-full px-4 py-3 text-sm bg-slate-50/80 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-semibold text-slate-800"
                        >
                          <option value="Medellín">Medellín</option>
                          <option value="Bogotá D.C.">Bogotá D.C.</option>
                          <option value="Cali">Cali</option>
                          <option value="Barranquilla">Barranquilla</option>
                          <option value="Cartagena">Cartagena</option>
                          <option value="Bucaramanga">Bucaramanga</option>
                          <option value="Pereira">Pereira</option>
                          <option value="Otra Ciudad">Otra Ciudad / Municipio Nacional</option>
                        </select>
                        <span className="text-[11px] text-slate-500 block mt-1">Tiempo de despacho: {presupuesto.tiempoEntregaDias}</span>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Tipo de Estructura / Obra <span className="text-rose-500">*</span>
                        </label>
                        <select
                          id="standalone-select-tipo-obra"
                          value={formData.tipoObra}
                          onChange={(e) => handleInputChange('tipoObra', e.target.value)}
                          className="w-full px-4 py-3 text-sm bg-slate-50/80 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                        >
                          <option value="Fachada Edificio">Fachada Edificio Residencial / Comercial</option>
                          <option value="Muros Interiores">Muros Interiores / Áreas Comunes</option>
                          <option value="Pisos Industriales">Pisos Industriales / Parqueaderos</option>
                          <option value="Estructura Metálica">Estructura Metálica / Cubiertas</option>
                          <option value="Cielorrasos">Cielorrasos y Plafones</option>
                          <option value="Institucional">Institucional / Clínicas / Colegios</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Área Total a Cubrir (m²) <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            id="standalone-input-area"
                            type="number"
                            min="1"
                            step="1"
                            placeholder="Ej. 85"
                            value={formData.areaM2 || ''}
                            onChange={(e) => handleInputChange('areaM2', parseFloat(e.target.value) || 0)}
                            className={`w-full pl-4 pr-12 py-3 text-sm bg-slate-50/80 border ${
                              errors.areaM2 ? 'border-rose-400 focus:ring-rose-400 bg-rose-50/20' : 'border-slate-200 focus:ring-blue-500'
                            } rounded-2xl focus:bg-white focus:outline-none focus:ring-2 font-black text-slate-900 transition-all`}
                          />
                          <span className="absolute right-4 top-3 text-xs font-bold text-slate-400">m²</span>
                        </div>
                        {errors.areaM2 && <p className="text-xs text-rose-600 mt-1.5">{errors.areaM2}</p>}
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Fecha Estimada de Inicio en Obra <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                          <input
                            id="standalone-input-fecha"
                            type="date"
                            value={formData.fechaRequerida}
                            onChange={(e) => handleInputChange('fechaRequerida', e.target.value)}
                            className={`w-full pl-10 pr-4 py-3 text-sm bg-slate-50/80 border ${
                              errors.fechaRequerida ? 'border-rose-400 focus:ring-rose-400 bg-rose-50/20' : 'border-slate-200 focus:ring-blue-500'
                            } rounded-2xl focus:bg-white focus:outline-none focus:ring-2 transition-all font-medium`}
                          />
                        </div>
                        {errors.fechaRequerida && <p className="text-xs text-rose-600 mt-1.5">{errors.fechaRequerida}</p>}
                      </div>
                    </div>

                    {/* Resumen de Envases Requeridos */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex flex-col items-center justify-center font-bold">
                          <span className="text-xs leading-none">{formData.areaM2}</span>
                          <span className="text-[9px] uppercase font-mono">m²</span>
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-900 block">Cuantificación Técnica de Envases:</span>
                          <span className="text-xs text-slate-600">
                            <strong>{technicalCalc.cuñetesRequeridos} Cuñetes</strong> (5 Gal)
                            {technicalCalc.galonesSueltosRequeridos > 0 && ` + ${technicalCalc.galonesSueltosRequeridos} Galones`}
                            {' '}(Total requerido: {technicalCalc.galonesRequeridos} gal)
                          </span>
                        </div>
                      </div>
                      <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-xl border border-blue-200">
                        {technicalCalc.manosSugeridas} Manos Recomendadas
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={handlePrevStep}
                        className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl transition-all"
                      >
                        Atrás
                      </button>
                      <button
                        type="button"
                        onClick={handleNextStep}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-2xl shadow-sm hover:shadow transition-all flex items-center gap-2"
                      >
                        Continuar a Parámetros Técnicos <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* PASO 3: PARÁMETROS TÉCNICOS & COLOR */}
                {currentStep === 3 && (
                  <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 animate-fadeIn">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">3. Sustrato, Ambiente y Color</h3>
                        <p className="text-xs text-slate-500">Selección química para garantizar máxima durabilidad e impermeabilidad.</p>
                      </div>
                      <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">Paso 3 de 4</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Superficie Base <span className="text-rose-500">*</span>
                        </label>
                        <select
                          id="standalone-select-sustrato"
                          value={formData.superficie}
                          onChange={(e) => handleInputChange('superficie', e.target.value)}
                          className="w-full px-3 py-2.5 text-xs bg-slate-50/80 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                        >
                          <option value="Concreto / Revoque">Concreto / Revoque / Pañete</option>
                          <option value="Drywall / Yeso">Drywall / Panel Yeso / Superboard</option>
                          <option value="Metal Ferroso">Metal Ferroso (Hierro / Acero)</option>
                          <option value="Metal Galvanizado / Aluminio">Metal Galvanizado / Aluminio</option>
                          <option value="Madera">Madera / Tableros</option>
                          <option value="Pintura Existente">Pintura Existente / Repinte</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Ambiente / Exposición <span className="text-rose-500">*</span>
                        </label>
                        <select
                          id="standalone-select-ambiente"
                          value={formData.ambiente}
                          onChange={(e) => handleInputChange('ambiente', e.target.value)}
                          className="w-full px-3 py-2.5 text-xs bg-slate-50/80 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                        >
                          <option value="Exterior Intemperie">Exterior Intemperie (Sol, Lluvia, Rayos UV)</option>
                          <option value="Interior Seco">Interior Seco (Habitaciones, Oficinas)</option>
                          <option value="Interior Húmedo">Interior Húmedo (Baños, Cocinas)</option>
                          <option value="Industrial Severo">Industrial / Químico Severo</option>
                          <option value="Tráfico">Alto Tráfico Peatonal / Vehicular</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Condición del Sustrato <span className="text-rose-500">*</span>
                        </label>
                        <select
                          id="standalone-select-condicion"
                          value={formData.condicion}
                          onChange={(e) => handleInputChange('condicion', e.target.value)}
                          className="w-full px-3 py-2.5 text-xs bg-slate-50/80 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                        >
                          <option value="Nueva sin pintar">Nueva sin pintar (Limpia y seca)</option>
                          <option value="Pintada en buen estado">Pintada en buen estado (Solo cambio color)</option>
                          <option value="Fisuras leves y humedad">Fisuras leves y humedad (Caso Constructora)</option>
                          <option value="Descascaramiento severo">Descascaramiento / Tizado severo</option>
                          <option value="Oxidación">Presencia de Oxidación / Corrosión</option>
                          <option value="Contaminación">Grasas / Hongos / Eflorescencias</option>
                        </select>
                      </div>
                    </div>

                    {/* Selector Visual de Color & Tintometría */}
                    <div className="pt-4 border-t border-slate-100">
                      <ColorFinishSelector
                        value={formData.colorAcabado}
                        onChange={(val) => handleInputChange('colorAcabado', val)}
                        error={errors.colorAcabado}
                      />
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={handlePrevStep}
                        className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl transition-all"
                      >
                        Atrás
                      </button>
                      <button
                        type="button"
                        onClick={handleNextStep}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-2xl shadow-sm hover:shadow transition-all flex items-center gap-2"
                      >
                        Continuar a Evidencias & Envío <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* PASO 4: EVIDENCIAS & EMISIÓN */}
                {currentStep === 4 && (
                  <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 animate-fadeIn">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">4. Evidencias Fotográficas & Envío</h3>
                        <p className="text-xs text-slate-500">Valida las patologías para emitir el presupuesto oficial con precios reales.</p>
                      </div>
                      <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">Paso 4 de 4</span>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Descripción Libre / Detalles de la Obra <span className="text-rose-500">*</span>
                        </label>
                        <textarea
                          id="standalone-textarea-descripcion"
                          rows={3}
                          placeholder="Describe detalles de la superficie, alturas, condiciones climáticas o requerimientos especiales..."
                          value={formData.descripcionLibre}
                          onChange={(e) => handleInputChange('descripcionLibre', e.target.value)}
                          className={`w-full px-4 py-3 text-sm bg-slate-50/80 border ${
                            errors.descripcionLibre ? 'border-rose-400 focus:ring-rose-400 bg-rose-50/20' : 'border-slate-200 focus:ring-blue-500'
                          } rounded-2xl focus:bg-white focus:outline-none focus:ring-2 transition-all leading-relaxed`}
                        />
                        {errors.descripcionLibre && <p className="text-xs text-rose-600 mt-1">{errors.descripcionLibre}</p>}
                      </div>

                      {/* Carga de Fotos */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-xs font-bold text-slate-700">
                            Registro Fotográfico de Evidencia <span className="text-rose-500">*</span>
                          </label>
                          <span className="text-[11px] text-slate-400">Mínimo 1 foto</span>
                        </div>

                        <div className="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-2xl p-4 text-center bg-slate-50/50 hover:bg-blue-50/20 transition-all">
                          <div className="max-w-md mx-auto space-y-2">
                            <Upload className="w-6 h-6 text-blue-600 mx-auto" />
                            <p className="text-xs font-semibold text-slate-700">
                              Sube fotos de la fachada o superficie
                            </p>
                            <button
                              type="button"
                              onClick={handleAddMockPhoto}
                              className="px-3.5 py-1.5 bg-white hover:bg-slate-100 text-blue-600 font-bold text-xs rounded-xl border border-blue-200 shadow-xs transition-all"
                            >
                              + Simular Adjuntar Fotografía
                            </button>
                          </div>
                        </div>

                        {/* Lista de Fotos */}
                        {formData.fotos.length > 0 && (
                          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {formData.fotos.map((foto, idx) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200"
                              >
                                <div className="flex items-center gap-2 truncate">
                                  <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                                  <span className="text-xs font-medium text-slate-800 truncate">{foto.name}</span>
                                  <span className="text-[10px] text-slate-400 font-mono">({foto.size})</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleRemovePhoto(idx)}
                                  className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                        {errors.fotos && <p className="text-xs text-rose-600 mt-1.5">{errors.fotos}</p>}
                      </div>

                      {/* Observaciones Opcionales */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Observaciones de Acceso / Logística
                        </label>
                        <input
                          type="text"
                          placeholder="Ej. Acceso por andamios colgantes certificados de obra..."
                          value={formData.observaciones}
                          onChange={(e) => handleInputChange('observaciones', e.target.value)}
                          className="w-full px-4 py-2.5 text-xs bg-slate-50/80 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        />
                      </div>

                      {/* Checkbox Consentimiento Legal */}
                      <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                        <label className="flex items-start gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.consentimiento}
                            onChange={(e) => handleInputChange('consentimiento', e.target.checked)}
                            className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                          />
                          <span className="text-xs text-slate-600 leading-relaxed font-medium">
                            Autorizo el tratamiento de mis datos de contacto conforme a la Ley de Protección de Datos (Habeas Data) para la emisión formal de la cotización y despacho. <span className="text-rose-500">*</span>
                          </span>
                        </label>
                        {errors.consentimiento && <p className="text-xs text-rose-600 mt-1.5 ml-7">{errors.consentimiento}</p>}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={handlePrevStep}
                        className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl transition-all"
                      >
                        Atrás
                      </button>
                      <button
                        id="standalone-submit-btn"
                        type="submit"
                        className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center gap-2.5 active:scale-95"
                      >
                        <Send className="w-4 h-4" />
                        Emitir Cotización Oficial con Precios Reales
                      </button>
                    </div>
                  </div>
                )}
              </form>
          </div>
        </div>
      )}
    </div>
  );
}
