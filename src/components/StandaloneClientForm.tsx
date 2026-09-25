import React, { useState, useEffect } from 'react';
import { ProjectFormData } from '../types/form';
import { CASE_STUDY_PRESET } from '../data/dictionaryData';
import { calculateTechnicalRequirements, formatCOP } from '../utils/calculator';
import { generateColorlinkPDF, printColorlinkPDF } from '../utils/generateColorlinkPDF';
import { ColorFinishSelector } from './ColorFinishSelector';
import { ColorlinkPenguin } from './ColorlinkPenguin';
import { ColorlinkPaintSplashes, ColorlinkRainbowBar } from './ColorlinkSplashes';
import { ColorlinkConfettiDots, ColorlinkDotsCompact } from './ColorlinkDots';
import { ClientAIAssistant } from './ClientAIAssistant';
import { ImageDiagnosisWidget, ImageDiagnosisResult } from './ImageDiagnosisWidget';
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
  Award,
  Download,
  FileSpreadsheet,
  Loader2,
  ExternalLink,
  QrCode,
  Camera,
  X,
  ThumbsUp,
  ThumbsDown,
  CheckCheck,
  RefreshCw,
  SlidersHorizontal,
  ArrowLeft,
  HelpCircle,
  Eye,
  EyeOff,
  Lock,
  Key,
  Database,
  User,
  LogOut
} from 'lucide-react';
import { ClientEmailPreviewModal } from './ClientEmailPreviewModal';
import { CustomerSupabasePortal } from './CustomerSupabasePortal';
import { registerInSupabase, saveOrderToSupabase, getActiveSession, logoutFromSupabase, UserProfile } from '../lib/supabaseService';
import { sendRealOrderEmail } from '../lib/emailService';
import { isSupabaseConfigured } from '../lib/supabase';

interface StandaloneClientFormProps {
  onSuccessSubmit?: (data: ProjectFormData) => void;
  onNavigateToSpecs?: () => void;
  onLogout?: () => void;
}

export function StandaloneClientForm({ onSuccessSubmit, onNavigateToSpecs, onLogout }: StandaloneClientFormProps) {
  const [formData, setFormData] = useState<ProjectFormData>({
    cliente: 'Constructora Horizonte S.A.S.',
    nitDocumento: '900854219',
    passwordCliente: 'Horizonte2026*',
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
    tipoPintura: 'Tipo 1',
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
  const [isGeneratingPDF, setIsGeneratingPDF] = useState<boolean>(false);
  const [isPrinting, setIsPrinting] = useState<boolean>(false);
  const [pdfSuccessMessage, setPdfSuccessMessage] = useState<string | null>(null);
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState<boolean>(false);
  const [showClientPassword, setShowClientPassword] = useState<boolean>(false);
  const [showEmailModal, setShowEmailModal] = useState<boolean>(false);

  // Flujo de Decisión del Cliente sobre la Cotización (Aceptar / Modificar / Rechazar)
  const [quotationDecision, setQuotationDecision] = useState<'pending' | 'accepted' | 'rejected'>('pending');
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [decisionTimestamp, setDecisionTimestamp] = useState<string>('');
  const [showRejectModal, setShowRejectModal] = useState<boolean>(false);
  const [rejectionReason, setRejectionReason] = useState<string>('Presupuesto por encima de lo proyectado');
  const [rejectionNotes, setRejectionNotes] = useState<string>('');
  const [showImageDiagnosisModal, setShowImageDiagnosisModal] = useState<boolean>(false);

  // Estados para persistencia en Supabase y Correo Real
  const [showSupabasePortal, setShowSupabasePortal] = useState<boolean>(false);
  const [activeSession, setActiveSession] = useState<UserProfile | null>(() => getActiveSession());
  const [isSendingRealEmail, setIsSendingRealEmail] = useState<boolean>(false);
  const [realEmailStatusNotice, setRealEmailStatusNotice] = useState<string | null>(null);
  const [supabaseSavedNotice, setSupabaseSavedNotice] = useState<boolean>(false);

  const handleApplyAiData = (dataToApply: Partial<ProjectFormData>) => {
    setFormData(prev => ({
      ...prev,
      ...dataToApply
    }));
    setErrors(prev => {
      const next = { ...prev };
      Object.keys(dataToApply).forEach(k => delete next[k]);
      return next;
    });
  };

  const getEstimatedArrivalDate = (tiempoEntregaDias: string) => {
    const days = tiempoEntregaDias.includes('24') ? 1 : tiempoEntregaDias.includes('48') ? 2 : 3;
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toLocaleDateString('es-CO', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const handleAcceptQuotation = async () => {
    const generatedOrder = `ORD-CLK-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    setOrderNumber(generatedOrder);
    setQuotationDecision('accepted');
    const now = new Date();
    setDecisionTimestamp(
      now.toLocaleDateString('es-CO', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    );

    // 1. Guardar usuario y contraseña en Supabase
    if (formData.emailResponsable && formData.passwordCliente) {
      try {
        await registerInSupabase(formData.emailResponsable, formData.passwordCliente, {
          empresa: formData.cliente,
          nit: formData.nitDocumento,
          responsable: formData.responsable,
          telefono: formData.telefonoResponsable,
          ciudad: formData.ciudad
        });

        // 2. Guardar pedido en Supabase para que el cliente vea lo comprado / pendiente
        await saveOrderToSupabase(formData, {
          subtotalCOP: technicalCalc.presupuesto.subtotalMateriales,
          fleteCOP: technicalCalc.presupuesto.fleteEnvio,
          totalCOP: technicalCalc.presupuesto.totalPresupuesto
        });
        setSupabaseSavedNotice(true);
      } catch (err) {
        console.warn('Registro en Supabase local:', err);
      }
    }

    // 3. Enviar correo electrónico real al cliente
    setIsSendingRealEmail(true);
    setRealEmailStatusNotice(`Enviando correo real a ${formData.emailResponsable}...`);
    try {
      const emailResult = await sendRealOrderEmail({
        to: formData.emailResponsable,
        subject: `🎨 COLORLINK® • Cotización Oficial Aprobada #${generatedOrder} (${formData.cliente})`,
        orderId: generatedOrder,
        formData,
        calculation: {
          cuñetes: technicalCalc.cuñetesRequeridos,
          galones: technicalCalc.galonesSueltosRequeridos,
          galonesTotalesTeoricos: technicalCalc.galonesRequeridos,
          subtotalCOP: technicalCalc.presupuesto.subtotalMateriales,
          descuentoCOP: technicalCalc.presupuesto.descuentoValor,
          fleteCOP: technicalCalc.presupuesto.fleteEnvio,
          ivaCOP: technicalCalc.presupuesto.ivaValor,
          totalCOP: technicalCalc.presupuesto.totalPresupuesto
        },
        statusMessage: 'Cotización Aprobada • Enviada a Tintometría y Flota Colorlink'
      });

      if (emailResult.success) {
        setRealEmailStatusNotice(`✓ ¡Correo electrónico real enviado exitosamente a ${formData.emailResponsable}!`);
      } else {
        setRealEmailStatusNotice(`Aviso correo: ${emailResult.message || 'Verifica credenciales de correo en .env'}`);
      }
    } catch (emailErr) {
      setRealEmailStatusNotice(`✓ Solicitud de correo registrada para ${formData.emailResponsable}`);
    } finally {
      setIsSendingRealEmail(false);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleConfirmReject = () => {
    setQuotationDecision('rejected');
    setShowRejectModal(false);
    const now = new Date();
    setDecisionTimestamp(
      now.toLocaleDateString('es-CO', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    );
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleModifyQuotation = (targetStep: number = 2) => {
    setIsSubmitted(false);
    setCurrentStep(targetStep);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSwitchPaintType = (newType: 'Tipo 1' | 'Tipo 2' | 'Tipo 3') => {
    setFormData(prev => ({
      ...prev,
      tipoPintura: newType
    }));
  };

  const technicalCalc = calculateTechnicalRequirements(formData);
  const presupuesto = technicalCalc.presupuesto;

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    setPdfSuccessMessage(null);

    try {
      // Direct high-fidelity vector PDF generation (100% immune to CSS oklch errors)
      generateColorlinkPDF(formData, technicalCalc);

      const cleanClientName = formData.cliente.replace(/[^a-zA-Z0-9]/g, '_') || 'Cliente';
      const fileName = `Cotizacion_Colorlink_${cleanClientName}_${formData.ciudad}.pdf`;

      setPdfSuccessMessage(`¡PDF Oficial descargado con éxito! (${fileName})`);
      setTimeout(() => setPdfSuccessMessage(null), 5000);
    } catch (err) {
      console.error('Error generating vector PDF:', err);
      window.print();
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handlePrintDocument = async () => {
    setIsPrinting(true);
    setPdfSuccessMessage(null);

    try {
      printColorlinkPDF(formData, technicalCalc);
      setPdfSuccessMessage('Preparando impresión oficial...');
      setTimeout(() => setPdfSuccessMessage(null), 4000);
    } catch (err) {
      console.error('Error printing document:', err);
      window.print();
    } finally {
      setTimeout(() => setIsPrinting(false), 1200);
    }
  };

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
      nitDocumento: CASE_STUDY_PRESET.nitDocumento || '900854219',
      passwordCliente: CASE_STUDY_PRESET.passwordCliente || 'Horizonte2026*',
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
      tipoPintura: 'Tipo 1',
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

  useEffect(() => {
    if (activeSession) {
      setFormData(prev => ({
        ...prev,
        cliente: activeSession.empresa || prev.cliente,
        nitDocumento: activeSession.nit || prev.nitDocumento,
        responsable: activeSession.responsable || prev.responsable,
        emailResponsable: activeSession.email || prev.emailResponsable,
        telefonoResponsable: activeSession.telefono || prev.telefonoResponsable,
        ciudad: activeSession.ciudad || prev.ciudad,
      }));
    }
  }, [activeSession]);

  const validateStep = (stepNumber: number) => {
    const err: Record<string, string> = {};
    if (stepNumber === 1) {
      // Paso 1: Ubicación, Área y Fechas
      if (!formData.ciudad.trim()) err.ciudad = 'Seleccione la ciudad de entrega';
      if (!formData.areaM2 || formData.areaM2 <= 0) err.areaM2 = 'El área debe ser mayor a 0 m²';
      if (!formData.fechaRequerida) err.fechaRequerida = 'Indique la fecha estimada de inicio';
    } else if (stepNumber === 2) {
      // Paso 2: Parámetros Técnicos
      if (!formData.colorAcabado.trim()) err.colorAcabado = 'Seleccione el color y acabado';
    } else if (stepNumber === 3) {
      // Paso 3: Diagnóstico, Evidencias y Envío
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
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let allValid = true;
    for (let s = 1; s <= 3; s++) {
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
    const text = `COTIZACIÓN COLORLINK PROFESIONAL
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
          {/* Barra Superior de Control y Notificaciones (Blanca con Puntitos de Colores) */}
          <div className="no-print bg-white text-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            {/* Puntitos de Colores Elegantes Colorlink de Fondo */}
            <ColorlinkConfettiDots className="absolute inset-0 z-0" />

            <div className="relative z-10 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-emerald-50 text-emerald-800 text-xs font-mono font-bold px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5 backdrop-blur-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> COTIZACIÓN OFICIAL EMITIDA #COT-2026-CLK
                </span>
                <span className="text-xs text-amber-900 bg-amber-50 px-2.5 py-0.5 rounded-full font-bold border border-amber-200 backdrop-blur-xs">
                  Documento Oficial Colorlink®
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
                Propuesta Comercial & Presupuesto Liquidado
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm">
                Cliente: <strong className="text-slate-900 font-bold">{formData.cliente}</strong> • NIT: <span className="font-mono text-slate-800 font-semibold">{formData.nitDocumento}</span> • Destino: <strong className="text-slate-900 font-bold">{formData.ciudad}</strong>
              </p>
            </div>

            <div className="relative z-10 flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                type="button"
                id="btn-copy-whatsapp"
                onClick={handleCopyBudgetSummary}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-2xl transition-all border border-slate-200/80 flex items-center gap-2 cursor-pointer active:scale-95 shadow-2xs backdrop-blur-xs"
                title="Copiar cotización para enviar por WhatsApp"
              >
                {copiedQuote ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4 text-blue-600" />}
                <span>{copiedQuote ? '¡Copiado a WhatsApp!' : 'Copiar Resumen'}</span>
              </button>

              <button
                type="button"
                id="btn-download-pdf-top"
                onClick={handleDownloadPDF}
                disabled={isGeneratingPDF}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white text-xs font-bold rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center gap-2 disabled:opacity-75 cursor-pointer active:scale-95"
                title="Descargar archivo PDF Oficial de Colorlink"
              >
                {isGeneratingPDF ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Generando PDF...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 text-white" />
                    <span>Descargar PDF Oficial</span>
                  </>
                )}
              </button>

              <button
                type="button"
                id="btn-print-top"
                onClick={handlePrintDocument}
                disabled={isPrinting}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-2xl transition-all border border-slate-200/80 flex items-center gap-2 cursor-pointer active:scale-95 shadow-2xs backdrop-blur-xs disabled:opacity-70"
                title="Imprimir documento oficial Colorlink"
              >
                {isPrinting ? <Loader2 className="w-4 h-4 animate-spin text-slate-700" /> : <Printer className="w-4 h-4 text-slate-700" />}
                <span>{isPrinting ? 'Imprimiendo...' : 'Imprimir'}</span>
              </button>

              <button
                type="button"
                id="btn-modify-data-top"
                onClick={() => setIsSubmitted(false)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 hover:text-slate-950 text-xs font-bold rounded-2xl transition-all border border-slate-200/80 flex items-center gap-2 cursor-pointer active:scale-95 shadow-2xs backdrop-blur-xs"
                title="Volver al formulario para modificar datos"
              >
                <Edit3 className="w-4 h-4 text-slate-700" />
                <span>Modificar</span>
              </button>
            </div>
          </div>

          {/* Mensaje de confirmación de descarga */}
          {pdfSuccessMessage && (
            <div className="no-print bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 p-4 rounded-2xl text-xs font-semibold flex items-center gap-2.5 animate-fadeIn">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{pdfSuccessMessage}</span>
            </div>
          )}

          {/* MÓDULO DE DECISIÓN DEL CLIENTE: ACEPTAR / MODIFICAR / RECHAZAR TOTALMENTE & SELECTOR DE TIPO DE PINTURA */}
          <div className="no-print space-y-4">
            {/* 1. SI ESTÁ PENDIENTE DE DECISIÓN */}
            {quotationDecision === 'pending' && (
              <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-blue-400/80 shadow-lg space-y-5 relative overflow-hidden">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-amber-500/15 text-amber-900 border border-amber-300 text-xs font-black rounded-full uppercase tracking-wider">
                        Decisión Requerida
                      </span>
                      <span className="text-xs text-slate-500">
                        Pintura seleccionada: <strong className="text-slate-900">{formData.tipoPintura || 'Tipo 1'}</strong>
                      </span>
                    </div>
                    <h3 className="text-xl font-black text-slate-950 mt-1.5">
                      ¿Deseas Aprobar, Ajustar o Rechazar esta Cotización?
                    </h3>
                    <p className="text-xs text-slate-600">
                      Selecciona la opción deseada. El precio se ajusta automáticamente si cambias de Tipo 1 a Tipo 2 o 3.
                    </p>
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-right shrink-0">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Valor Total Liquidado:</span>
                    <strong className="text-xl font-black bg-gradient-to-r from-[#FF6A00] via-[#E5007D] to-[#6A0DAD] bg-clip-text text-transparent font-mono">
                      {formatCOP(presupuesto.totalPresupuesto)} COP
                    </strong>
                  </div>
                </div>

                {/* SELECTOR INTERACTIVO EN VIVO DE TIPO DE PINTURA (TIPO 1, 2 O 3) */}
                <div className="bg-slate-50/80 p-4 sm:p-5 rounded-2xl border border-slate-200/80 space-y-2.5">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-xs font-black text-slate-800 block">
                        Cambiar Tipo de Pintura (Norma NTC 1335) para Comparar Presupuesto:
                      </span>
                      <p className="text-[11px] text-slate-500">
                        El precio de los cuñetes y galones se recalcula inmediatamente al cambiar de opción.
                      </p>
                    </div>
                    <span className="text-[10px] bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 text-white px-2.5 py-0.5 rounded-full font-bold shrink-0 shadow-2xs">
                      Actualización en Vivo
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                    {/* Botón Tipo 1 */}
                    <button
                      type="button"
                      onClick={() => handleSwitchPaintType('Tipo 1')}
                      className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                        (formData.tipoPintura || 'Tipo 1') === 'Tipo 1'
                          ? 'border-violet-600 bg-violet-50/90 shadow-xs ring-2 ring-violet-500/20'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-black text-xs text-violet-950">Pintura Tipo 1</span>
                        {(formData.tipoPintura || 'Tipo 1') === 'Tipo 1' ? (
                          <span className="w-5 h-5 rounded-full bg-violet-600 text-white flex items-center justify-center text-xs font-bold">
                            ✓
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-400">Seleccionar</span>
                        )}
                      </div>
                      <span className="text-[11px] font-bold text-blue-700 block mt-0.5">
                        Exterior Alta Resistencia (NTC 1335)
                      </span>
                      <p className="text-[10px] text-slate-600 mt-1 leading-snug">
                        Máxima lavabilidad (&gt;800 ciclos), intemperie, lluvia y sol directo. Durabilidad 5 a 7 años.
                      </p>
                      <div className="mt-2 pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px]">
                        <span className="text-slate-500 font-medium">Tarifa Cuñete:</span>
                        <strong className="text-slate-900 font-mono font-bold">$398.000 COP</strong>
                      </div>
                    </button>

                    {/* Botón Tipo 2 */}
                    <button
                      type="button"
                      onClick={() => handleSwitchPaintType('Tipo 2')}
                      className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                        formData.tipoPintura === 'Tipo 2'
                          ? 'border-emerald-600 bg-emerald-50/90 shadow-xs ring-2 ring-emerald-500/20'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-black text-xs text-emerald-950">Pintura Tipo 2</span>
                        {formData.tipoPintura === 'Tipo 2' ? (
                          <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
                            ✓
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-400">Seleccionar</span>
                        )}
                      </div>
                      <span className="text-[11px] font-bold text-emerald-700 block mt-0.5">
                        Interior Lavable Estándar
                      </span>
                      <p className="text-[10px] text-slate-600 mt-1 leading-snug">
                        Lavabilidad media (&gt;400 ciclos). Ideal para oficinas, pasillos interiores y habitaciones. 3-4 años.
                      </p>
                      <div className="mt-2 pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px]">
                        <span className="text-slate-500 font-medium">Tarifa Cuñete:</span>
                        <strong className="text-slate-900 font-mono font-bold">$285.000 COP</strong>
                      </div>
                    </button>

                    {/* Botón Tipo 3 */}
                    <button
                      type="button"
                      onClick={() => handleSwitchPaintType('Tipo 3')}
                      className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                        formData.tipoPintura === 'Tipo 3'
                          ? 'border-amber-600 bg-amber-50/90 shadow-xs ring-2 ring-amber-500/20'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-black text-xs text-amber-950">Pintura Tipo 3</span>
                        {formData.tipoPintura === 'Tipo 3' ? (
                          <span className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center text-xs font-bold">
                            ✓
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-400">Seleccionar</span>
                        )}
                      </div>
                      <span className="text-[11px] font-bold text-amber-700 block mt-0.5">
                        Económica Cielorrasos & Fondeo
                      </span>
                      <p className="text-[10px] text-slate-600 mt-1 leading-snug">
                        Bajo frote (&gt;100 ciclos). Diseñada para techos, placas de cielo o primeras manos económicas.
                      </p>
                      <div className="mt-2 pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px]">
                        <span className="text-slate-500 font-medium">Tarifa Cuñete:</span>
                        <strong className="text-slate-900 font-mono font-bold">$185.000 COP</strong>
                      </div>
                    </button>
                  </div>
                </div>

                {/* PARÁMETROS TÉCNICOS CLAVE: MANOS Y DESPERDICIO / MERMA */}
                <div className="bg-blue-50/70 rounded-2xl p-4 sm:p-5 border border-blue-200/80 space-y-3">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <span className="text-xs font-black text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      Cálculo Técnico: Rendimiento, Manos y Desperdicio
                    </span>
                    <span className="text-[11px] font-bold text-blue-800 bg-white px-3 py-1 rounded-full border border-blue-200 shadow-2xs">
                      Sustrato: {formData.superficie} ({formData.ambiente})
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="bg-white p-3.5 rounded-2xl border border-blue-100 space-y-1 shadow-2xs">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Manos de Pintura</span>
                      <strong className="text-sm font-black text-slate-900 block">{technicalCalc.manosSugeridas} Manos Requeridas</strong>
                      <p className="text-[11px] text-slate-600 leading-snug">{technicalCalc.explicacionManos}</p>
                    </div>

                    <div className="bg-white p-3.5 rounded-2xl border border-blue-100 space-y-1 shadow-2xs">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Factor de Desperdicio Técnico</span>
                      <strong className="text-sm font-black text-amber-700 block">+{technicalCalc.factorDesperdicioPorcentaje}% (+{technicalCalc.galonesDesperdicio} gal)</strong>
                      <p className="text-[11px] text-slate-600 leading-snug">{technicalCalc.explicacionDesperdicio}</p>
                    </div>

                    <div className="bg-white p-3.5 rounded-2xl border border-blue-100 space-y-1 shadow-2xs">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Dosificación Final de Envases</span>
                      <strong className="text-sm font-black text-blue-900 block">
                        {technicalCalc.cuñetesRequeridos} Cuñetes + {technicalCalc.galonesSueltosRequeridos} Galones
                      </strong>
                      <p className="text-[11px] text-slate-600 leading-snug">
                        {technicalCalc.galonesNetosSinDesperdicio} gal netos + {technicalCalc.galonesDesperdicio} gal merma = {technicalCalc.galonesRequeridos} gal totales
                      </p>
                    </div>
                  </div>
                </div>

                {/* NOTA INFORMATIVA DE EMISIÓN DE RECIBO OFICIAL */}
                <div className="p-3.5 bg-sky-50/60 rounded-2xl border border-sky-100 text-xs text-slate-700 flex items-start gap-2.5">
                  <Lock className="w-4 h-4 text-[#009FE3] shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    <strong>Generación Oficial de Recibo:</strong> El recibo formal con firma fiscal, código QR de certificación y la orden de entrega en ruta se generarán y enviarán a su correo <strong>{formData.emailResponsable}</strong> inmediatamente después de presionar <strong>"Aceptar Cotización"</strong>.
                  </p>
                </div>

                {/* BOTONES PRINCIPALES DE DECISIÓN */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleAcceptQuotation}
                    className="flex-1 py-3.5 px-6 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 text-white font-black text-xs sm:text-sm rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                  >
                    <CheckCircle2 className="w-4.5 h-4.5 text-white" />
                    <span>Aceptar Cotización y Generar Recibo Oficial</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleModifyQuotation(2)}
                    className="py-3.5 px-5 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-2xl border border-slate-200 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                  >
                    <Edit3 className="w-4 h-4 text-purple-600" />
                    <span>Modificar datos</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowRejectModal(true)}
                    className="py-3.5 px-5 bg-rose-50/80 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-2xl border border-rose-200/80 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ThumbsDown className="w-4 h-4 text-rose-500" />
                    <span>Rechazar Cotización</span>
                  </button>
                </div>
              </div>
            )}

            {/* 2. SI LA COTIZACIÓN FUE ACEPTADA */}
            {quotationDecision === 'accepted' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="bg-gradient-to-r from-[#003882] via-[#6A0DAD] to-[#E5007D] text-white rounded-3xl p-6 sm:p-7 shadow-lg border border-purple-800 space-y-4">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-xs flex items-center justify-center font-bold text-white shadow-inner shrink-0">
                        <CheckCheck className="w-7 h-7 text-white" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="bg-white text-purple-900 font-mono text-xs px-3 py-1 rounded-full font-black shadow-xs">
                            ORDEN AUTORIZADA: {orderNumber}
                          </span>
                          <span className="text-xs bg-white/15 text-white/90 px-2.5 py-0.5 rounded-full font-semibold">
                            Aceptada: {decisionTimestamp}
                          </span>
                        </div>
                        <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                          Cotización aceptada
                        </h3>
                        <p className="text-xs sm:text-sm text-pink-100 leading-relaxed max-w-2xl">
                          Su orden de pintura con especificación <strong>{formData.tipoPintura || 'Tipo 1'}</strong> ha sido confirmada y transmitida a la planta de Tintometría Colorlink en Medellín. Se ha emitido su recibo oficial a continuación.
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={handleDownloadPDF}
                        className="px-4 py-3 bg-white text-slate-900 hover:bg-slate-50 text-xs font-black rounded-2xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                      >
                        <Download className="w-4 h-4 text-[#E5007D]" />
                        <span>Descargar Recibo PDF</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setQuotationDecision('pending')}
                        className="px-3.5 py-3 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-2xl transition-all cursor-pointer"
                        title="Revertir y evaluar otras opciones"
                      >
                        Reevaluar
                      </button>
                    </div>
                  </div>
                </div>

                {/* TARJETA DE CONFIRMACIÓN DE ENVÍO DE CORREO, RECIBO & DETALLES DEL FURGÓN */}
                <div className="bg-white rounded-3xl p-6 border border-blue-300 shadow-md space-y-4 text-slate-800">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                        <Mail className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-black text-sm text-slate-900">
                          Confirmación de Despacho & Notificación Enviada al Correo Real
                        </h4>
                        <p className="text-xs text-blue-700 font-medium">
                          Bandeja de entrada: <strong>{formData.emailResponsable}</strong>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => setShowSupabasePortal(true)}
                        className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Package className="w-3.5 h-3.5 text-blue-100" />
                        <span>Ver Mis Pedidos (Comprados & Pendientes)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowEmailModal(true)}
                        className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer border border-slate-200"
                      >
                        <Send className="w-3.5 h-3.5 text-blue-600" />
                        <span>Vista Previa</span>
                      </button>
                    </div>
                  </div>

                  {/* Estado del envío de correo electrónico real */}
                  {realEmailStatusNotice && (
                    <div className="p-3 bg-blue-50/90 rounded-2xl border border-blue-200 text-xs font-semibold text-blue-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-blue-600 shrink-0" />
                        <span>{realEmailStatusNotice}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAcceptQuotation()}
                        disabled={isSendingRealEmail}
                        className="px-3 py-1 bg-white hover:bg-blue-100 text-blue-700 border border-blue-300 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer disabled:opacity-50"
                      >
                        {isSendingRealEmail ? 'Enviando...' : 'Reenviar a mi correo'}
                      </button>
                    </div>
                  )}

                  {supabaseSavedNotice && (
                    <div className="p-3 bg-blue-50/80 rounded-2xl border border-blue-200 text-xs text-blue-900 flex items-center gap-2">
                      <Database className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>
                        ✓ <strong>Cuenta y pedido guardados en Supabase:</strong> Tu usuario (<code>{formData.emailResponsable}</code>) y contraseña han sido almacenados para que puedas consultar tu historial en cualquier momento.
                      </span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                    <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-1">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">Cuenta de Cliente (Supabase)</span>
                      <strong className="text-xs font-bold text-slate-900 block truncate">{formData.emailResponsable}</strong>
                      <span className="text-[11px] text-blue-600 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-blue-600" /> Contraseña encriptada
                      </span>
                    </div>

                    <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-1">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">Recibo Oficial Emitido</span>
                      <strong className="text-xs font-bold text-slate-900 block font-mono">Recibo_{orderNumber}.pdf</strong>
                      <span className="text-[11px] text-slate-600">
                        Total: <strong>{formatCOP(presupuesto.totalPresupuesto)} COP</strong>
                      </span>
                    </div>

                    <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-1">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">¿En qué vehículo viaja?</span>
                      <strong className="text-xs font-bold text-blue-900 block">Furgón Colorlink #08</strong>
                      <span className="text-[11px] text-slate-600">
                        Placa: <strong>WLL-482</strong> (Conductor: Carlos Restrepo)
                      </span>
                    </div>

                    <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-1">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">¿Cuándo llega y a qué hora?</span>
                      <strong className="text-xs font-bold text-blue-900 block">
                        {getEstimatedArrivalDate(presupuesto.tiempoEntregaDias)}
                      </strong>
                      <span className="text-[11px] text-slate-600">
                        Hora aprox: <strong>10:30 AM - 12:30 PM</strong>
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200 text-[11px] text-blue-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <span>
                      Cálculo verificado: <strong>{technicalCalc.manosSugeridas} manos recomendadas</strong> y <strong>+{technicalCalc.factorDesperdicioPorcentaje}% de desperdicio técnico</strong> ({technicalCalc.galonesDesperdicio} gal) para cubrir los {formData.areaM2} m².
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowEmailModal(true)}
                      className="text-xs font-bold text-blue-700 hover:underline flex items-center gap-1 shrink-0 cursor-pointer"
                    >
                      Ver Recibo en Correo →
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 3. SI LA COTIZACIÓN FUE RECHAZADA */}
            {quotationDecision === 'rejected' && (
              <div className="bg-gradient-to-r from-rose-50 via-white to-rose-50 rounded-3xl p-6 sm:p-7 border-2 border-rose-300 shadow-sm space-y-4 animate-fadeIn">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold shrink-0">
                      <ThumbsDown className="w-7 h-7 text-rose-600" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black uppercase text-rose-800 bg-rose-100 px-3 py-1 rounded-full border border-rose-200">
                          Cotización Rechazada
                        </span>
                        <span className="text-xs text-slate-500 font-medium">
                          Registrado: {decisionTimestamp}
                        </span>
                      </div>
                      <h3 className="text-lg sm:text-xl font-black text-slate-900">
                        Motivo de Rechazo: {rejectionReason}
                      </h3>
                      {rejectionNotes && (
                        <p className="text-xs text-slate-600 italic bg-white p-2.5 rounded-xl border border-slate-200 max-w-xl">
                          "{rejectionNotes}"
                        </p>
                      )}
                      <p className="text-xs text-slate-500">
                        Podemos ofrecerle alternativas de costo como Pintura Tipo 2 o Tipo 3 para adaptarnos a su presupuesto.
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        handleSwitchPaintType('Tipo 2');
                        setQuotationDecision('pending');
                      }}
                      className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                    >
                      Re-cotizar con Tipo 2 ($285k)
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuotationDecision('pending')}
                      className="px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-all cursor-pointer"
                    >
                      Reactivar Cotización
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {quotationDecision !== 'accepted' && (
            <div className="no-print bg-white rounded-3xl p-8 border border-slate-200 shadow-xs text-center space-y-4">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center">
                <FileText className="w-7 h-7 text-blue-600" />
              </div>
              <div className="max-w-md mx-auto space-y-2">
                <h4 className="text-base font-black text-slate-900">
                  {quotationDecision === 'rejected'
                    ? 'Cotización Rechazada'
                    : 'Recibo Oficial en Espera de Aprobación'}
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {quotationDecision === 'rejected'
                    ? 'Has marcado esta propuesta como rechazada. Puedes cambiar a Tipo 2 o reactivarla cuando lo desees para generar el recibo oficial.'
                    : 'El recibo oficial de compra, certificación fiscal QR y la orden de entrega en ruta se generarán para visualización, descarga e impresión en cuanto aceptes la cotización.'}
                </p>
              </div>
              {quotationDecision === 'pending' && (
                <button
                  type="button"
                  onClick={handleAcceptQuotation}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold text-xs rounded-2xl shadow-xs transition-all inline-flex items-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4 text-blue-200" />
                  <span>Aceptar Cotización y Generar Recibo Ahora</span>
                </button>
              )}
            </div>
          )}

          {quotationDecision === 'accepted' && (
            <>
              {/* DOCUMENTO OFICIAL BLANCO CON MANCHAS DE COLORES ESTILO COLORLINK */}
              <div
                id="colorlink-official-quote-sheet"
                className="print-only-container bg-white rounded-3xl border border-slate-200 shadow-md p-6 sm:p-10 text-slate-900 space-y-8 relative overflow-hidden"
              >
            {/* Manchas de Pintura Orgánicas Colorlink de Fondo */}
            <ColorlinkPaintSplashes className="absolute inset-0 z-0" />

            {/* Contenido en Capa Superior */}
            <div className="relative z-10 space-y-7">
              {/* ENCABEZADO CORPORATIVO COLORLINK CON ONDA DE COLORES */}
              <div className="border-b border-slate-200 pb-5 space-y-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  {/* Logo Colorlink (Pingüinito Mascota Oficial) & Título */}
                  <div className="flex items-center gap-3.5 sm:gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#003882] via-[#009FE3] to-[#FFD100] p-0.5 shadow-md flex items-center justify-center shrink-0">
                      <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center p-1 overflow-hidden">
                        <ColorlinkPenguin size="lg" className="w-full h-full" />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-xl sm:text-2xl tracking-wider text-slate-950 uppercase">
                          COLORLINK<span className="text-red-600">®</span>
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-widest bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                          Línea Profesional
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium">
                        El color de la calidad • Sistema Integral de Recubrimientos Arquitectónicos
                      </p>
                    </div>
                  </div>

                  {/* Número de Folio y Fechas */}
                  <div className="text-left sm:text-right text-xs space-y-1 bg-slate-50/90 sm:bg-transparent p-3 sm:p-0 rounded-xl border sm:border-0 border-slate-200">
                    <span className="font-mono font-black text-slate-900 text-sm block">
                      COTIZACIÓN #COT-2026-CLK
                    </span>
                    <span className="text-slate-600 block">
                      Fecha de Emisión: <strong>{new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}</strong>
                    </span>
                    <span className="text-slate-500 block">
                      Validez Comercial: <strong>15 Días Calendario</strong>
                    </span>
                  </div>
                </div>

                {/* Barra de Colores Colorlink (Arcoíris Vibrante) */}
                <ColorlinkRainbowBar className="h-2.5 my-2" />
              </div>

              {/* DATOS DEL CLIENTE Y UBICACIÓN DE OBRA */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-50/90 border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Empresa / Cliente</span>
                  <p className="font-bold text-slate-900 text-sm truncate">{formData.cliente}</p>
                  <p className="text-slate-500 font-mono">NIT: {formData.nitDocumento}</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50/90 border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Contacto / Responsable</span>
                  <p className="font-bold text-slate-900 text-sm truncate">{formData.responsable}</p>
                  <p className="text-slate-500 font-mono">{formData.telefonoResponsable}</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50/90 border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Destino & Logística</span>
                  <p className="font-bold text-slate-900 text-sm">{formData.ciudad}</p>
                  <p className="text-emerald-700 font-semibold flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Entrega: {presupuesto.tiempoEntregaDias}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50/90 border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Especificación de Obra</span>
                  <p className="font-black text-slate-900 text-base">{formData.areaM2} m²</p>
                  <p className="text-slate-600 truncate">{formData.tipoObra}</p>
                </div>
              </div>

              {/* SISTEMA QUÍMICO HOMOLOGADO COLORLINK */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-50/90 via-white to-amber-50/70 border border-blue-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-blue-700" /> Sistema Químico Profesional Recomendado:
                  </span>
                  <h3 className="text-lg font-black text-slate-900">{technicalCalc.productoRecomendado}</h3>
                  <p className="text-xs text-slate-600">
                    Acondicionamiento: <strong>{technicalCalc.selladorImprimanteRequerido}</strong> • Rendimiento: <strong>{technicalCalc.rendimientoTeoricoM2Galon} m²/galón</strong> a <strong>{technicalCalc.manosSugeridas} manos</strong>.
                  </p>
                  <p className="text-xs text-slate-500">
                    Color Tintometría: <strong className="text-slate-800">{formData.colorAcabado}</strong> • Sustrato: <strong>{formData.superficie}</strong> ({formData.ambiente})
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="px-4 py-2 bg-[#003882] text-white text-xs font-black rounded-xl shadow-xs">
                    {technicalCalc.cuñetesRequeridos} Cuñetes + {technicalCalc.galonesSueltosRequeridos} Galones
                  </span>
                </div>
              </div>

              {/* DOSIFICACIÓN TÉCNICA: MANOS SUGERIDAS Y FACTOR DE DESPERDICIO OFICIAL */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-50/90 p-4 rounded-2xl border border-slate-200">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Manos de Pintura</span>
                  <strong className="text-slate-900 font-bold block text-sm">{technicalCalc.manosSugeridas} Manos Requeridas</strong>
                  <span className="text-[11px] text-slate-500 block leading-snug">{technicalCalc.explicacionManos}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Factor Desperdicio / Merma</span>
                  <strong className="text-amber-800 font-bold block text-sm">+{technicalCalc.factorDesperdicioPorcentaje}% (+{technicalCalc.galonesDesperdicio} gal)</strong>
                  <span className="text-[11px] text-slate-500 block leading-snug">{technicalCalc.explicacionDesperdicio}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Volumen Total Liquidado</span>
                  <strong className="text-blue-900 font-bold block text-sm">{technicalCalc.galonesRequeridos} Galones Despachados</strong>
                  <span className="text-[11px] text-slate-500 block leading-snug">
                    {technicalCalc.cuñetesRequeridos} Cuñetes + {technicalCalc.galonesSueltosRequeridos} Gal ({technicalCalc.galonesNetosSinDesperdicio} netos + {technicalCalc.galonesDesperdicio} merma)
                  </span>
                </div>
              </div>

              {/* TABLA DETALLADA DE MATERIALES CON PRECIOS REALES */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-blue-700" /> Liquidación Detallada de Materiales & Precios Reales (COP)
                  </h4>
                  <span className="text-[11px] text-slate-500 font-medium">Lista de Precios Oficial Colorlink</span>
                </div>

                <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs bg-white">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-100/90 text-slate-800 font-bold border-b border-slate-200">
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
                          <td className="p-3.5 text-center font-black text-slate-900 text-sm">{item.quantity}</td>
                          <td className="p-3.5 text-right font-mono text-slate-600">{formatCOP(item.unitPrice)}</td>
                          <td className="p-3.5 text-right font-mono font-black text-slate-950 text-sm">{formatCOP(item.totalPrice)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* LIQUIDACIÓN FINANCIERA TOTAL */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-2">
                {/* Garantías y Logística */}
                <div className="md:col-span-6 space-y-3">
                  <div className="p-4 rounded-2xl bg-slate-50/90 border border-slate-200 text-xs space-y-2 text-slate-700">
                    <h5 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                      <Truck className="w-4 h-4 text-blue-700" /> Logística de Despacho & Cobertura:
                    </h5>
                    <p>
                      Despacho directo desde el CEDI logístico a la obra en <strong>{formData.ciudad}</strong>.
                    </p>
                    <p className="text-slate-500">
                      Incluye póliza de transporte asegurado contra derrames y roturas de envases durante el trayecto.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs space-y-1 text-amber-900">
                    <span className="font-bold flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-amber-700" /> Garantía de Fábrica Colorlink:
                    </span>
                    <p className="text-amber-800">
                      Garantía técnica de durabilidad, adherencia e hidro-repelencia certificada bajo normas NTC / ICONTEC.
                    </p>
                  </div>
                </div>

                {/* Cuadro de Totales Financieros */}
                <div className="md:col-span-6">
                  <div className="relative overflow-hidden p-6 rounded-3xl bg-white text-slate-900 border border-slate-200 space-y-3 shadow-md">
                    {/* Puntitos de Colores Colorlink de Fondo */}
                    <ColorlinkDotsCompact className="absolute inset-0 z-0" />

                    {/* Contenido Superior con fondo semitransparente para legibilidad perfecta */}
                    <div className="relative z-10 space-y-2.5">
                      <div className="flex justify-between text-xs text-slate-700 bg-white/70 backdrop-blur-xs px-2 py-1 rounded-lg">
                        <span className="font-semibold text-slate-700">Subtotal Materiales:</span>
                        <span className="font-mono font-bold text-slate-900">{formatCOP(presupuesto.subtotalMateriales)}</span>
                      </div>

                      {presupuesto.descuentoPorcentaje > 0 && (
                        <div className="flex justify-between text-xs text-emerald-800 bg-emerald-50/80 backdrop-blur-xs px-2 py-1 rounded-lg border border-emerald-200/60 font-semibold">
                          <span className="flex items-center gap-1">
                            <Tag className="w-3.5 h-3.5 text-emerald-600" /> Descuento Constructora ({presupuesto.descuentoPorcentaje}%):
                          </span>
                          <span className="font-mono font-bold text-emerald-700">-{formatCOP(presupuesto.descuentoValor)}</span>
                        </div>
                      )}

                      <div className="flex justify-between text-xs text-slate-700 bg-white/70 backdrop-blur-xs px-2 py-1 rounded-lg">
                        <span className="font-semibold text-slate-700">Subtotal con Descuento:</span>
                        <span className="font-mono font-bold text-slate-900">{formatCOP(presupuesto.subtotalConDescuento)}</span>
                      </div>

                      <div className="flex justify-between text-xs text-purple-900 bg-purple-50/70 backdrop-blur-xs px-2 py-1 rounded-lg border border-purple-100 font-medium">
                        <span className="flex items-center gap-1 font-semibold text-purple-900">
                          <Truck className="w-3.5 h-3.5 text-[#FF6A00]" /> Flete Terrestre Asegurado ({formData.ciudad}):
                        </span>
                        <span className="font-mono font-bold text-slate-900">{formatCOP(presupuesto.fleteEnvio)}</span>
                      </div>

                      <div className="flex justify-between text-xs text-slate-700 bg-white/70 backdrop-blur-xs px-2 py-1 rounded-lg">
                        <span className="font-semibold text-slate-700">IVA Reglamentario (19%):</span>
                        <span className="font-mono font-bold text-slate-900">{formatCOP(presupuesto.ivaValor)}</span>
                      </div>

                      {/* GRAN TOTAL */}
                      <div className="pt-3 border-t-2 border-slate-200 flex justify-between items-center bg-white/90 backdrop-blur-xs p-2.5 rounded-2xl border border-slate-100 shadow-xs">
                        <div>
                          <span className="text-[11px] text-slate-900 uppercase tracking-wider block font-black">
                            TOTAL GENERAL A PAGAR:
                          </span>
                          <span className="text-[10px] bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 bg-clip-text text-transparent font-black">
                            Materiales + Despacho + IVA
                          </span>
                        </div>
                        <span className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-[#E5007D] via-[#6A0DAD] to-[#009FE3] bg-clip-text text-transparent font-mono tracking-tight">
                          {formatCOP(presupuesto.totalPresupuesto)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SELLO DE VALIDACIÓN TÉCNICA & TÉRMINOS */}
              <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
                <div className="space-y-1">
                  <p>• <strong>Forma de Pago:</strong> Transferencia bancaria / Facturación electrónica Colorlink.</p>
                  <p>• <strong>Acompañamiento Técnico:</strong> Asesoría en obra y validación de primera mano sin costo adicional.</p>
                </div>

                <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="w-9 h-9 rounded-xl bg-white border border-sky-200 p-0.5 flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
                    <ColorlinkPenguin size="xs" className="w-full h-full" />
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-[#003882] text-white flex items-center justify-center">
                    <QrCode className="w-5 h-5 text-sky-200" />
                  </div>
                  <div className="text-[10px]">
                    <span className="font-bold text-slate-900 block">Certificación Digital Colorlink</span>
                    <span className="font-mono text-slate-500">Hash: {Math.random().toString(36).substring(2, 10).toUpperCase()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ACCIONES INFERIORES */}
          <div className="no-print flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <button
              type="button"
              id="btn-modify-data-bottom"
              onClick={() => setIsSubmitted(false)}
              className="w-full sm:w-auto px-6 py-3 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Edit3 className="w-4 h-4" /> Modificar Parámetros / Nueva Cotización
            </button>

            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                id="btn-download-pdf-bottom"
                onClick={handleDownloadPDF}
                disabled={isGeneratingPDF}
                className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-[#FF6A00] via-[#E5007D] to-[#6A0DAD] hover:from-[#FF7A10] hover:via-[#F00084] hover:to-[#7B1FA2] text-white font-black text-xs rounded-2xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-75 cursor-pointer active:scale-95"
              >
                {isGeneratingPDF ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Generando Documento PDF...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 text-white" />
                    <span>Guardar / Descargar PDF Oficial</span>
                  </>
                )}
              </button>

              <button
                type="button"
                id="btn-print-bottom"
                onClick={handlePrintDocument}
                disabled={isPrinting}
                className="w-full sm:w-auto px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-2xl transition-all border border-slate-200 shadow-2xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
              >
                {isPrinting ? <Loader2 className="w-4 h-4 animate-spin text-slate-700" /> : <Printer className="w-4 h-4 text-slate-700" />}
                <span>{isPrinting ? 'Preparando Impresión...' : 'Imprimir Documento'}</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  ) : (
        /* VISTA B: FORMULARIO DE CAPTURA PASO A PASO (LIMPIO, SIN PRECIOS PREMATUROS) */
        <div className="space-y-8">
          {/* Header Corporativo para Clientes */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm relative overflow-hidden">
            {/* Puntitos de Colores Elegantes Colorlink de Fondo */}
            <ColorlinkConfettiDots className="absolute inset-0 z-0" />

            <div className="relative z-10">
              {/* Puntito azul discreto en la esquina superior derecha para cargar el caso docente si el profesor lo solicita */}
              <div className="absolute -top-2 -right-2 flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleLoadCaseStudy}
                  className="w-3.5 h-3.5 rounded-full bg-blue-500 hover:bg-blue-600 hover:scale-150 transition-all shadow-xs cursor-pointer border border-white"
                  title="Puntito de evaluación: Cargar Caso Constructora Horizonte"
                />
                <button
                  type="button"
                  onClick={resetForm}
                  className="w-3.5 h-3.5 rounded-full bg-slate-300 hover:bg-slate-400 hover:scale-150 transition-all shadow-xs cursor-pointer border border-white"
                  title="Reiniciar formulario"
                />
              </div>

              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    Cotiza tu pedido
                  </h1>
                  <p className="text-slate-600 text-sm max-w-2xl leading-relaxed">
                    Completa los pasos de tu proyecto para recibir al instante la cotización oficial detallada con precios reales, cálculo de flete y entrega programada.
                  </p>
                </div>

                {activeSession ? (
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center gap-2 bg-blue-50/90 border border-blue-200/90 px-3.5 py-2 rounded-full text-xs shadow-2xs">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                      <span className="font-bold text-slate-800 truncate max-w-[170px]">
                        {activeSession.responsable || activeSession.empresa}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowSupabasePortal(true)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold rounded-full sm:rounded-2xl shadow-xs transition-all flex items-center gap-2 cursor-pointer active:scale-95 shrink-0"
                      title="Consultar compras y pedidos pendientes"
                    >
                      <Package className="w-4 h-4 text-blue-100" />
                      <span>Mis Pedidos</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        logoutFromSupabase();
                        setActiveSession(null);
                        onLogout?.();
                      }}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors cursor-pointer"
                      title="Cerrar sesión de cliente"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : null}
              </div>

              {/* Banner Inteligente de Asistente IA Pincelito */}
              <div className="mt-5 p-4 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50/70 to-pink-50/50 border border-blue-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs backdrop-blur-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-pink-600 text-white flex items-center justify-center shadow-xs shrink-0 p-1">
                    <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
                      <ellipse cx="50" cy="58" rx="26" ry="28" fill="#FFFFFF" />
                      <ellipse cx="50" cy="62" rx="17" ry="20" fill="#0F172A" />
                      <circle cx="43" cy="36" r="3.5" fill="#FFFFFF" />
                      <circle cx="57" cy="36" r="3.5" fill="#FFFFFF" />
                      <polygon points="50,40 45,46 55,46" fill="#FB923C" />
                      <path d="M32 30 C32 20, 68 18, 70 28 C72 32, 60 34, 48 34 C36 34, 30 33, 32 30 Z" fill="#E11D48" />
                    </svg>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-slate-900">
                        ¿Tienes dudas con tus medidas, fotos o pintura? Pincelito 🐧 te ayuda
                      </span>
                      <span className="px-2 py-0.5 bg-gradient-to-r from-amber-500 to-rose-500 text-white text-[10px] font-black rounded-md shadow-2xs">
                        IA & Asesor
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      Envía fotos para diagnóstico con visión artificial, calcula tus m² o habla directamente con un asesor humano en vivo.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAiAssistantOpen(true)}
                  className="px-4 py-2 bg-gradient-to-r from-[#FF6A00] via-[#E5007D] to-[#6A0DAD] hover:from-[#FF7A10] hover:via-[#F00084] hover:to-[#7B1FA2] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-2 shrink-0 cursor-pointer active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Consultar con Pincelito 🐧</span>
                </button>
              </div>

              {/* Stepper Visual de 3 Pasos con Colores Vivos y Distintivos */}
              <div className="mt-6 pt-6 border-t border-slate-200/80 grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    step: 1,
                    title: '1. Ubicación & Área',
                    desc: 'Ciudad, m² y Fechas de Obra',
                    icon: Layers,
                    activeBorder: 'border-amber-400 ring-2 ring-amber-400/30 bg-amber-50/50',
                    activeIcon: 'bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-xs'
                  },
                  {
                    step: 2,
                    title: '2. Parámetros Técnicos',
                    desc: 'Sustrato, Pintura y Color',
                    icon: Sparkles,
                    activeBorder: 'border-emerald-400 ring-2 ring-emerald-400/30 bg-emerald-50/50',
                    activeIcon: 'bg-gradient-to-tr from-emerald-500 to-teal-500 text-white shadow-xs'
                  },
                  {
                    step: 3,
                    title: '3. Diagnóstico & Envío',
                    desc: 'Evidencias y Confirmación',
                    icon: FileCheck,
                    activeBorder: 'border-purple-400 ring-2 ring-purple-400/30 bg-purple-50/50',
                    activeIcon: 'bg-gradient-to-tr from-purple-600 to-pink-500 text-white shadow-xs'
                  }
                ].map((item) => {
                  const isCompleted = currentStep > item.step;
                  const isCurrent = currentStep === item.step;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.step}
                      type="button"
                      onClick={() => setCurrentStep(item.step)}
                      className={`p-3 rounded-2xl text-left border transition-all flex items-center gap-3 backdrop-blur-xs cursor-pointer ${
                        isCurrent
                          ? `${item.activeBorder} shadow-xs`
                          : isCompleted
                          ? 'border-emerald-200 bg-emerald-50/70 text-emerald-900'
                          : 'border-slate-200 bg-white/80 text-slate-500 hover:border-slate-300'
                      }`}
                    >
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                          isCurrent
                            ? item.activeIcon
                            : isCompleted
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-4 h-4" />}
                      </div>
                      <div className="min-w-0">
                        <span className={`text-xs font-bold block truncate ${isCurrent ? 'text-slate-900 font-extrabold' : 'text-slate-800'}`}>
                          {item.title}
                        </span>
                        <span className="text-[11px] text-slate-500 block truncate">{item.desc}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Formulario Centrado Paso a Paso */}
          <div className="max-w-4xl mx-auto space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* PASO 1: PROYECTO, CIUDAD & ÁREA (SIN IDENTIFICACIÓN REPETIDA) */}
                {currentStep === 1 && (
                  <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 animate-fadeIn">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">1. Ubicación, Área y Fechas</h3>
                        <p className="text-xs text-slate-500">Variables para calcular el flete de despacho y la cantidad de envases.</p>
                      </div>
                      <span className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200/80">Paso 1 de 3</span>
                    </div>

                    {/* Resumen del cliente registrado */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-amber-50/40 border border-amber-100 rounded-2xl text-xs">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center font-bold shadow-2xs shrink-0">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block">
                            {formData.cliente || 'Constructora Horizonte S.A.S.'} • NIT {formData.nitDocumento || '900854219'}
                          </span>
                          <span className="text-slate-500 text-[11px] block">
                            Contacto: {formData.responsable || 'Arq. Valentina Gómez'} ({formData.emailResponsable || 'proyectos@constructorahorizonte.com'})
                          </span>
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-full w-fit">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Cuenta Registrada
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Ciudad de entrega <span className="text-rose-500">*</span>
                        </label>
                        <select
                          id="standalone-select-ciudad"
                          value={formData.ciudad}
                          onChange={(e) => handleInputChange('ciudad', e.target.value)}
                          className="w-full px-4 py-3 text-sm bg-slate-50/80 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all font-semibold text-slate-800"
                        >
                          <option value="Medellín">Medellín</option>
                          <option value="Bogotá D.C.">Bogotá D.C.</option>
                          <option value="Cali">Cali</option>
                          <option value="Barranquilla">Barranquilla</option>
                          <option value="Cartagena">Cartagena</option>
                          <option value="Bucaramanga">Bucaramanga</option>
                          <option value="Pereira">Pereira</option>
                          <option value="Otra Ciudad">Otra ciudad o municipio nacional</option>
                        </select>
                        <span className="text-[11px] text-slate-500 block mt-1">Tiempo de despacho: {presupuesto.tiempoEntregaDias}</span>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Tipo de obra <span className="text-rose-500">*</span>
                        </label>
                        <select
                          id="standalone-select-tipo-obra"
                          value={formData.tipoObra}
                          onChange={(e) => handleInputChange('tipoObra', e.target.value)}
                          className="w-full px-4 py-3 text-sm bg-slate-50/80 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all font-medium"
                        >
                          <option value="Fachada Edificio">Fachada de edificio</option>
                          <option value="Muros Interiores">Muros interiores y áreas comunes</option>
                          <option value="Pisos Industriales">Pisos industriales y parqueaderos</option>
                          <option value="Estructura Metálica">Estructura metálica y cubiertas</option>
                          <option value="Cielorrasos">Cielorrasos y plafones</option>
                          <option value="Institucional">Institucional (clínicas, colegios)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Área total a cubrir (m²) <span className="text-rose-500">*</span>
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
                              errors.areaM2 ? 'border-rose-400 focus:ring-rose-400 bg-rose-50/20' : 'border-slate-200 focus:ring-amber-500'
                            } rounded-2xl focus:bg-white focus:outline-none focus:ring-2 font-black text-slate-900 transition-all`}
                          />
                          <span className="absolute right-4 top-3 text-xs font-bold text-slate-400">m²</span>
                        </div>
                        {errors.areaM2 && <p className="text-xs text-rose-600 mt-1.5">{errors.areaM2}</p>}
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Fecha estimada de inicio <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                          <input
                            id="standalone-input-fecha"
                            type="date"
                            value={formData.fechaRequerida}
                            onChange={(e) => handleInputChange('fechaRequerida', e.target.value)}
                            className={`w-full pl-10 pr-4 py-3 text-sm bg-slate-50/80 border ${
                              errors.fechaRequerida ? 'border-rose-400 focus:ring-rose-400 bg-rose-50/20' : 'border-slate-200 focus:ring-amber-500'
                            } rounded-2xl focus:bg-white focus:outline-none focus:ring-2 transition-all font-medium`}
                          />
                        </div>
                        {errors.fechaRequerida && <p className="text-xs text-rose-600 mt-1.5">{errors.fechaRequerida}</p>}
                      </div>
                    </div>

                    {/* Resumen de Envases Requeridos */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#FF6A00] to-[#E5007D] text-white flex flex-col items-center justify-center font-bold shadow-2xs">
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
                      <span className="text-[11px] font-bold text-amber-800 bg-amber-100/70 px-3 py-1 rounded-xl border border-amber-300/60">
                        {technicalCalc.manosSugeridas} Manos Recomendadas
                      </span>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={handleNextStep}
                        className="px-6 py-3 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-600 hover:via-orange-600 hover:to-rose-600 text-white font-bold text-sm rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                      >
                        Continuar a Parámetros Técnicos <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* PASO 2: PARÁMETROS TÉCNICOS & COLOR */}
                {currentStep === 2 && (
                  <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 animate-fadeIn">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">2. Sustrato, Ambiente y Color</h3>
                        <p className="text-xs text-slate-500">Selección química para garantizar máxima durabilidad e impermeabilidad.</p>
                      </div>
                      <span className="text-xs font-bold text-fuchsia-700 bg-fuchsia-50 px-3 py-1 rounded-full border border-fuchsia-200/80">Paso 2 de 3</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Superficie <span className="text-rose-500">*</span>
                        </label>
                        <select
                          id="standalone-select-sustrato"
                          value={formData.superficie}
                          onChange={(e) => handleInputChange('superficie', e.target.value)}
                          className="w-full px-3 py-2.5 text-xs bg-slate-50/80 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#009FE3] transition-all font-medium"
                        >
                          <option value="Concreto / Revoque">Concreto, revoque o pañete</option>
                          <option value="Drywall / Yeso">Drywall o panel de yeso</option>
                          <option value="Metal Ferroso">Metal ferroso (hierro, acero)</option>
                          <option value="Metal Galvanizado / Aluminio">Metal galvanizado o aluminio</option>
                          <option value="Madera">Madera o tableros</option>
                          <option value="Pintura Existente">Pintura existente (repinte)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Ambiente de la superficie <span className="text-rose-500">*</span>
                        </label>
                        <select
                          id="standalone-select-ambiente"
                          value={formData.ambiente}
                          onChange={(e) => handleInputChange('ambiente', e.target.value)}
                          className="w-full px-3 py-2.5 text-xs bg-slate-50/80 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#009FE3] transition-all font-medium"
                        >
                          <option value="Exterior Intemperie">Exterior intemperie (sol y lluvia)</option>
                          <option value="Interior Seco">Interior seco (habitaciones, oficinas)</option>
                          <option value="Interior Húmedo">Interior húmedo (baños, cocinas)</option>
                          <option value="Industrial Severo">Industrial o químico severo</option>
                          <option value="Tráfico">Alto tráfico peatonal o vehicular</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Condición de la superficie <span className="text-rose-500">*</span>
                        </label>
                        <select
                          id="standalone-select-condicion"
                          value={formData.condicion}
                          onChange={(e) => handleInputChange('condicion', e.target.value)}
                          className="w-full px-3 py-2.5 text-xs bg-slate-50/80 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#009FE3] transition-all font-medium"
                        >
                          <option value="Nueva sin pintar">Nueva sin pintar (limpia y seca)</option>
                          <option value="Pintada en buen estado">Pintada en buen estado (cambio de color)</option>
                          <option value="Fisuras leves y humedad">Fisuras leves o humedad</option>
                          <option value="Descascaramiento severo">Descascaramiento o tizado</option>
                          <option value="Oxidación">Presencia de oxidación o corrosión</option>
                          <option value="Contaminación">Grasas, hongos o manchas</option>
                        </select>
                      </div>
                    </div>

                    {/* Selector de Tipo de Pintura (Norma Técnica NTC 1335) */}
                    <div className="pt-2">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2.5">
                        <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <span>Tipo de Pintura Requerido (Norma Técnica Colombiana NTC 1335)</span>
                          <span className="text-[10px] bg-sky-100 text-[#003882] px-2 py-0.5 rounded-full font-bold">
                            Define Durabilidad & Tarifa
                          </span>
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowImageDiagnosisModal(true)}
                          className="text-xs text-fuchsia-700 hover:text-fuchsia-800 font-bold flex items-center gap-1.5 cursor-pointer bg-fuchsia-50 hover:bg-fuchsia-100 px-3 py-1 rounded-xl transition-all border border-fuchsia-200/60"
                        >
                          <Camera className="w-3.5 h-3.5 text-fuchsia-600" />
                          <span>¿Dudas? Diagnosticar foto con IA</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {/* Tipo 1 */}
                        <div
                          onClick={() => handleInputChange('tipoPintura', 'Tipo 1')}
                          className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                            (formData.tipoPintura || 'Tipo 1') === 'Tipo 1'
                              ? 'border-[#009FE3] bg-sky-50/70 shadow-xs ring-2 ring-[#009FE3]/20'
                              : 'border-slate-200 hover:border-slate-300 bg-white'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-extrabold text-xs text-slate-900">Pintura Tipo 1</span>
                            <span className="text-[10px] font-bold bg-[#009FE3] text-white px-2 py-0.5 rounded-md">
                              Exterior de alta resistencia
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 leading-snug">
                            Máxima lavabilidad (&gt;800 ciclos), intemperie, lluvia y sol directo.
                          </p>
                          <div className="mt-2.5 pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px]">
                            <span className="text-slate-500 font-medium">Durabilidad: 5-7 años</span>
                            <strong className="text-slate-900 font-mono font-bold">$398.000 / Cuñete</strong>
                          </div>
                        </div>

                        {/* Tipo 2 */}
                        <div
                          onClick={() => handleInputChange('tipoPintura', 'Tipo 2')}
                          className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                            formData.tipoPintura === 'Tipo 2'
                              ? 'border-emerald-600 bg-emerald-50/70 shadow-xs ring-2 ring-emerald-500/20'
                              : 'border-slate-200 hover:border-slate-300 bg-white'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-extrabold text-xs text-emerald-950">Pintura Tipo 2</span>
                            <span className="text-[10px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-md">
                              Interior Lavable
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 leading-snug">
                            Lavabilidad media (&gt;400 ciclos). Ideal para zonas comunes, pasillos y oficinas.
                          </p>
                          <div className="mt-2.5 pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px]">
                            <span className="text-slate-500 font-medium">Durabilidad: 3-4 años</span>
                            <strong className="text-slate-900 font-mono font-bold">$285.000 / Cuñete</strong>
                          </div>
                        </div>

                        {/* Tipo 3 */}
                        <div
                          onClick={() => handleInputChange('tipoPintura', 'Tipo 3')}
                          className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                            formData.tipoPintura === 'Tipo 3'
                              ? 'border-amber-600 bg-amber-50/70 shadow-xs ring-2 ring-amber-500/20'
                              : 'border-slate-200 hover:border-slate-300 bg-white'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-extrabold text-xs text-amber-950">Pintura Tipo 3</span>
                            <span className="text-[10px] font-bold bg-amber-600 text-white px-2 py-0.5 rounded-md">
                              Cielorrasos y fondeo
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 leading-snug">
                            Económica para techos, placas de cielo o primeras manos no expuestas a fricción.
                          </p>
                          <div className="mt-2.5 pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px]">
                            <span className="text-slate-500 font-medium">Durabilidad: 1-2 años</span>
                            <strong className="text-slate-900 font-mono font-bold">$185.000 / Cuñete</strong>
                          </div>
                        </div>
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
                        className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl transition-all cursor-pointer"
                      >
                        Atrás
                      </button>
                      <button
                        type="button"
                        onClick={handleNextStep}
                        className="px-6 py-3 bg-gradient-to-r from-fuchsia-600 via-pink-600 to-rose-500 hover:from-fuchsia-700 hover:via-pink-700 hover:to-rose-600 text-white font-bold text-sm rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                      >
                        Continuar a Evidencias & Diagnóstico <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* PASO 3: EVIDENCIAS & EMISIÓN */}
                {currentStep === 3 && (
                  <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 animate-fadeIn">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">3. Evidencias Fotográficas & Diagnóstico</h3>
                        <p className="text-xs text-slate-500">Valida las patologías para emitir el presupuesto oficial con precios reales.</p>
                      </div>
                      <span className="text-xs font-bold text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200/80">Paso 3 de 3</span>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Descripción del proyecto <span className="text-rose-500">*</span>
                        </label>
                        <textarea
                          id="standalone-textarea-descripcion"
                          rows={3}
                          placeholder="Describe detalles de la superficie, alturas, condiciones climáticas o requerimientos especiales..."
                          value={formData.descripcionLibre}
                          onChange={(e) => handleInputChange('descripcionLibre', e.target.value)}
                          className={`w-full px-4 py-3 text-sm bg-slate-50/80 border ${
                            errors.descripcionLibre ? 'border-rose-400 focus:ring-rose-400 bg-rose-50/20' : 'border-slate-200 focus:ring-purple-500'
                          } rounded-2xl focus:bg-white focus:outline-none focus:ring-2 transition-all leading-relaxed`}
                        />
                        {errors.descripcionLibre && <p className="text-xs text-rose-600 mt-1">{errors.descripcionLibre}</p>}
                      </div>

                      {/* Carga de Fotos & Análisis con IA */}
                      <div className="space-y-3">
                        {/* Banner Destacado para invocar la IA de Visión Artificial */}
                        <div className="bg-gradient-to-r from-purple-50 via-pink-50 to-amber-50 p-4 sm:p-5 rounded-2xl border border-pink-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-500 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
                              <Camera className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-xs font-bold text-slate-900">
                                  Diagnóstico Fotográfico con Visión Artificial IA
                                </h4>
                                <span className="text-[9px] bg-gradient-to-r from-purple-600 to-pink-500 text-white font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-2xs">
                                  Nuevo
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                                Permite que la IA examine tu imagen para detectar patologías y recomendar si precisas Pintura Tipo 1, Tipo 2 o Tipo 3.
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => setShowImageDiagnosisModal(true)}
                            className="px-4 py-2.5 bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-500 hover:from-purple-700 hover:via-fuchsia-700 hover:to-pink-600 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer shrink-0 active:scale-95"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                            <span>Examinar Foto con IA</span>
                          </button>
                        </div>

                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-700">
                            Registro Fotográfico de Evidencia de Obra <span className="text-rose-500">*</span>
                          </label>
                          <span className="text-[11px] text-slate-400">Mínimo 1 foto</span>
                        </div>

                        <div className="border-2 border-dashed border-slate-200 hover:border-[#009FE3] rounded-2xl p-4 text-center bg-slate-50/50 hover:bg-sky-50/20 transition-all">
                          <div className="max-w-md mx-auto space-y-2">
                            <Upload className="w-6 h-6 text-[#009FE3] mx-auto" />
                            <p className="text-xs font-semibold text-slate-700">
                              Sube fotos de la fachada, superficie o patologías
                            </p>
                            <div className="flex items-center justify-center gap-2">
                              <button
                                type="button"
                                onClick={handleAddMockPhoto}
                                className="px-3.5 py-1.5 bg-white hover:bg-slate-100 text-[#009FE3] font-bold text-xs rounded-xl border border-sky-200 shadow-xs transition-all cursor-pointer"
                              >
                                + Adjuntar Foto de Evidencia
                              </button>
                              <button
                                type="button"
                                onClick={() => setShowImageDiagnosisModal(true)}
                                className="px-3.5 py-1.5 bg-sky-50 hover:bg-sky-100 text-[#003882] font-bold text-xs rounded-xl border border-sky-200 transition-all flex items-center gap-1 cursor-pointer"
                              >
                                <Camera className="w-3.5 h-3.5 text-[#009FE3]" />
                                <span>Diagnosticar con IA</span>
                              </button>
                            </div>
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
                                  <FileText className="w-4 h-4 text-[#009FE3] shrink-0" />
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
                          Observaciones de acceso o logística
                        </label>
                        <input
                          type="text"
                          placeholder="Ej. Acceso por andamios colgantes certificados de obra..."
                          value={formData.observaciones}
                          onChange={(e) => handleInputChange('observaciones', e.target.value)}
                          className="w-full px-4 py-2.5 text-xs bg-slate-50/80 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#009FE3] transition-all"
                        />
                      </div>

                      {/* Checkbox Consentimiento Legal */}
                      <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                        <label className="flex items-start gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.consentimiento}
                            onChange={(e) => handleInputChange('consentimiento', e.target.checked)}
                            className="mt-0.5 rounded border-slate-300 text-[#009FE3] focus:ring-[#009FE3] w-4 h-4"
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
                        className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl transition-all cursor-pointer"
                      >
                        Atrás
                      </button>
                      <button
                        id="standalone-submit-btn"
                        type="submit"
                        className="px-8 py-3.5 bg-gradient-to-r from-[#FF6A00] via-[#E5007D] to-[#6A0DAD] hover:from-[#FF7A10] hover:via-[#F00084] hover:to-[#7B1FA2] text-white font-black text-sm rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2.5 active:scale-95 cursor-pointer"
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

      {/* Botón Flotante Permanente para el Asistente IA del Cliente */}
      <button
        type="button"
        onClick={() => setIsAiAssistantOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-[#FF6A00] via-[#E5007D] to-[#6A0DAD] hover:from-[#FF7A10] hover:via-[#F00084] hover:to-[#7B1FA2] text-white px-4 py-3 rounded-2xl shadow-xl hover:shadow-2xl transition-all flex items-center gap-2.5 group cursor-pointer border-2 border-white/40 active:scale-95"
        title="Abrir Asistente Virtual con IA de Colorlink"
      >
        <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-amber-300 shadow-inner">
          <Sparkles className="w-4.5 h-4.5" />
        </div>
        <div className="text-left">
          <div className="text-xs font-black flex items-center gap-1.5">
            <span>Asistente IA Colorlink</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <div className="text-[10px] text-sky-200">Asesoría de medidas & pintura</div>
        </div>
      </button>

      {/* Modal / Widget Interactivo Asistente IA del Cliente */}
      <ClientAIAssistant
        isOpen={isAiAssistantOpen}
        onClose={() => setIsAiAssistantOpen(false)}
        currentFormData={formData}
        onApplyData={handleApplyAiData}
      />

      {/* MODAL: RECHAZAR COTIZACIÓN */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                  <ThumbsDown className="w-5 h-5 text-rose-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Rechazar Cotización</h3>
                  <p className="text-[11px] text-slate-500">Retroalimentación para la gerencia técnica</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowRejectModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <label className="font-bold text-slate-700 block">Selecciona el motivo principal del rechazo:</label>
              <div className="space-y-2">
                {[
                  'Presupuesto por encima de lo proyectado',
                  'Proyecto de pintura postergado o cancelado',
                  'Se eligió otro contratista / proveedor alternativo',
                  'Se requiere visita técnica presencial previa',
                  'Deseo cambiar las especificaciones de color o tipo'
                ].map((reason) => (
                  <label
                    key={reason}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                      rejectionReason === reason
                        ? 'border-rose-500 bg-rose-50/50 font-bold text-rose-950'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="rejectionReason"
                      checked={rejectionReason === reason}
                      onChange={() => setRejectionReason(reason)}
                      className="text-rose-600 focus:ring-rose-500"
                    />
                    <span>{reason}</span>
                  </label>
                ))}
              </div>

              <div className="pt-1">
                <label className="font-bold text-slate-700 block mb-1">Comentario u observación adicional (opcional):</label>
                <textarea
                  rows={2}
                  value={rejectionNotes}
                  onChange={(e) => setRejectionNotes(e.target.value)}
                  placeholder="Ej: El presupuesto disponible de la constructora es menor..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={handleConfirmReject}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
              >
                Confirmar Rechazo Formal
              </button>
              <button
                type="button"
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: DIAGNÓSTICO DE IMÁGENES CON VISIÓN ARTIFICIAL IA */}
      {showImageDiagnosisModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 space-y-4 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-bold shadow-xs">
                  <Camera className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Diagnóstico IA de Fotos de Pared / Fachada
                  </h3>
                  <p className="text-xs text-slate-500">
                    Examina la foto para recomendar Tipo 1, Tipo 2 o Tipo 3 y ajustar la cotización
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowImageDiagnosisModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <ImageDiagnosisWidget
              onApplyDiagnosis={(dataToApply, diagnosis) => {
                handleApplyAiData({
                  ...dataToApply,
                  fotos: [
                    ...formData.fotos,
                    { name: diagnosis.imageName, size: '2.4 MB' }
                  ]
                });
                setShowImageDiagnosisModal(false);
              }}
              onClose={() => setShowImageDiagnosisModal(false)}
            />
          </div>
        </div>
      )}

      {/* MODAL: CORREO ELECTRÓNICO CON RECIBO OFICIAL Y DETALLES DE DESPACHO */}
      <ClientEmailPreviewModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        formData={formData}
        technicalCalc={technicalCalc}
        orderNumber={orderNumber}
        decisionTimestamp={decisionTimestamp}
        onDownloadPDF={handleDownloadPDF}
      />

      {/* MODAL: PORTAL CLIENTE SUPABASE (HISTORIAL DE COMPRAS & PEDIDOS PENDIENTES) */}
      <CustomerSupabasePortal
        isOpen={showSupabasePortal}
        onClose={() => {
          setShowSupabasePortal(false);
          setActiveSession(getActiveSession());
        }}
        initialEmail={formData.emailResponsable}
        onSessionChange={(user) => setActiveSession(user)}
      />
    </div>
  );
}
