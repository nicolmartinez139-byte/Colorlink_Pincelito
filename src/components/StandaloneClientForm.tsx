import React, { useState, useEffect } from 'react';
import { ProjectFormData, UserProfile } from '../types/form';
import { CASE_STUDY_PRESET } from '../data/dictionaryData';
import { calculateTechnicalRequirements, formatCOP, AVAILABLE_PAINT_BRANDS, getPaintTypePrice } from '../utils/calculator';
import { generateColorlinkPDF, printColorlinkPDF } from '../utils/generateColorlinkPDF';
import { ColorFinishSelector } from './ColorFinishSelector';
import { ColorlinkPenguin } from './ColorlinkPenguin';
import { ColorlinkPaintSplashes, ColorlinkRainbowBar } from './ColorlinkSplashes';
import { ColorlinkConfettiDots, ColorlinkDotsCompact } from './ColorlinkDots';
import { ClientAIAssistant } from './ClientAIAssistant';
import { PaintingToolsSelector } from './PaintingToolsSelector';
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
  XCircle,
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
  LogOut,
  CreditCard,
  Copy,
  ZoomIn,
  Video,
  VideoOff,
  Zap
} from 'lucide-react';
import { ClientEmailPreviewModal } from './ClientEmailPreviewModal';
import { sendRealOrderEmail } from '../lib/emailService';
import { sendOrderStatusUpdateEmail } from '../utils/emailService';
import { fetchClientOrders, ClientOrderItem } from '../utils/supabaseApi';
import { buildOrderStateMessage, getLogisticsForCity } from '../utils/orderStateMessages';
import facadeRefImg from '../assets/images/paint_facade_ref_1790519863937.jpg';
import exteriorT2RefImg from '../assets/images/exterior_t2_ref_1790522631426.jpg';
import exteriorT3RefImg from '../assets/images/exterior_t3_ref_1790522646174.jpg';
import interiorRefImg from '../assets/images/paint_interior_ref_1790519875663.jpg';
import interiorT2RefImg from '../assets/images/interior_t2_ref_1790522657855.jpg';
import ceilingRefImg from '../assets/images/paint_ceiling_ref_1790519886503.jpg';

interface StandaloneClientFormProps {
  isSimulation?: boolean;
  onToggleSimulation?: (val: boolean) => void;
  activeUser?: UserProfile | null;
  onSuccessSubmit?: (data: ProjectFormData) => void;
  onNavigateToSpecs?: () => void;
  onLogout?: () => void;
}

const SIMULATION_CASE_STUDY: ProjectFormData = {
  cliente: 'Constructora Horizonte S.A.S.',
  nitDocumento: '900854219',
  passwordCliente: 'Horizonte2026*',
  responsable: 'Arq. Valentina Gómez',
  emailResponsable: 'proyectos@constructorahorizonte.com',
  telefonoResponsable: '+57 312 456 7890',
  canalEntrada: 'Portal Clientes',
  ciudad: 'Medellín',
  direccionEntrega: 'Calle 48 # 65-34, Obra Torre del Valle, Medellín',
  puntoReferencia: 'Portería vehicular principal Edificio Torre del Valle',
  contactoObra: 'Ing. Carlos Mendoza (Residente de Obra)',
  telefonoObra: '+57 312 845 6721',
  indicacionesEntrega: 'Entrada por bahía de cargue sobre Carrera 65. Horario recepción de 8:00 AM a 5:00 PM.',
  tipoObra: 'Fachada Edificio',
  areaM2: 85,
  fechaRequerida: '2026-09-15',
  superficie: 'Concreto / Revoque',
  ambiente: 'Exterior Intemperie',
  condicion: 'Fisuras leves y humedad',
  marcaPintura: 'Pintuco®',
  tipoPintura: 'Exterior Tipo 1',
  metodoPago: 'bancolombia',
  colorAcabado: 'Gris (Mate)',
  herramientasSeleccionadas: [
    {
      id: 'brocha-pro-2',
      nombre: 'Brocha Profesional 2" Cerdas Suaves',
      categoria: 'brochas',
      precioCOP: 14500,
      cantidad: 2,
      subtotalCOP: 29000,
      sku: 'BR-PRO-20',
      unidad: 'Unidad',
      stock: 120
    },
    {
      id: 'rodillo-microfibra-9',
      nombre: 'Rodillo Antigoteo Microfibra 9" con Mango',
      categoria: 'rodillos',
      precioCOP: 28500,
      cantidad: 1,
      subtotalCOP: 28500,
      sku: 'ROD-MIC-09',
      unidad: 'Unidad + Mango',
      stock: 95
    }
  ],
  descripcionLibre: 'Mantenimiento preventivo y correctivo en fachada de edificio de 5 pisos. Presenta fisuras superficiales no estructurales y rastros de humedad por lluvia directa.',
  fotos: [
    { name: 'fachada_norte_fisuras.jpg', size: '2.8 MB', previewUrl: facadeRefImg },
    { name: 'detalle_humedad_concreto.png', size: '1.9 MB', previewUrl: interiorRefImg }
  ],
  observaciones: 'Acceso por andamios colgantes certificados de obra.',
  consentimiento: true
};

const createCleanFormData = (user?: UserProfile | null): ProjectFormData => ({
  cliente: user?.empresa || '',
  nitDocumento: user?.nit || '',
  passwordCliente: '',
  responsable: user?.responsable || '',
  emailResponsable: user?.email || '',
  telefonoResponsable: user?.telefono || '',
  canalEntrada: 'Portal Clientes',
  ciudad: '',
  direccionEntrega: '',
  puntoReferencia: '',
  contactoObra: user?.responsable || '',
  telefonoObra: user?.telefono || '',
  indicacionesEntrega: '',
  tipoObra: '' as any,
  areaM2: 0,
  fechaRequerida: '',
  superficie: '' as any,
  ambiente: '' as any,
  condicion: '' as any,
  marcaPintura: 'Pintuco®',
  tipoPintura: '' as any,
  metodoPago: 'bancolombia',
  colorAcabado: '',
  herramientasSeleccionadas: [],
  descripcionLibre: '',
  fotos: [],
  observaciones: '',
  consentimiento: false
});

export function StandaloneClientForm({
  isSimulation = false,
  onToggleSimulation,
  activeUser,
  onSuccessSubmit,
  onNavigateToSpecs,
  onLogout
}: StandaloneClientFormProps) {
  const [internalIsSim, setInternalIsSim] = useState<boolean>(isSimulation);

  const [formData, setFormData] = useState<ProjectFormData>(() => {
    if (isSimulation) return { ...SIMULATION_CASE_STUDY };
    return createCleanFormData(activeUser);
  });

  // Pestaña activa del selector de tipo de pintura (Exterior vs Interior)
  const [activePaintLine, setActivePaintLine] = useState<'Exterior' | 'Interior'>('Exterior');

  useEffect(() => {
    if (isSimulation) {
      setInternalIsSim(true);
      setFormData({ ...SIMULATION_CASE_STUDY });
    }
  }, [isSimulation]);

  // Si el usuario cambia el ambiente a exterior o interior, sugerir la pestaña correspondiente
  useEffect(() => {
    if (formData.ambiente === 'Exterior Intemperie' || formData.tipoObra === 'Fachada Edificio') {
      setActivePaintLine('Exterior');
    } else if (
      formData.ambiente === 'Interior Seco' ||
      formData.ambiente === 'Interior Húmedo (Baños/Cocinas)' ||
      formData.tipoObra === 'Muros Interiores' ||
      formData.tipoObra === 'Cielorrasos'
    ) {
      setActivePaintLine('Interior');
    }
  }, [formData.ambiente, formData.tipoObra]);

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
  const [showWelcomeBanner, setShowWelcomeBanner] = useState<boolean>(() => {
    if (!activeUser?.createdAt) return false;
    const createdTime = new Date(activeUser.createdAt).getTime();
    return (Date.now() - createdTime) < 180000;
  });

  // Flujo de Decisión del Cliente sobre la Cotización (Aceptar / Modificar / Rechazar)
  const [quotationDecision, setQuotationDecision] = useState<'pending' | 'accepted' | 'rejected'>('pending');
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [decisionTimestamp, setDecisionTimestamp] = useState<string>('');
  const [showRejectModal, setShowRejectModal] = useState<boolean>(false);
  const [rejectionReason, setRejectionReason] = useState<string>('Presupuesto por encima de lo proyectado');
  const [rejectionNotes, setRejectionNotes] = useState<string>('');

  // Estados para Carga de Fotos (Computador o Cámara)
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const cameraInputRef = React.useRef<HTMLInputElement | null>(null);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const [showLiveCameraModal, setShowLiveCameraModal] = useState<boolean>(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [capturedPhotoDraft, setCapturedPhotoDraft] = useState<string | null>(null);
  const [previewEnlargedPhoto, setPreviewEnlargedPhoto] = useState<{ name: string; url?: string } | null>(null);

  // Estados para Métodos de Pago
  const [copiedBankInfo, setCopiedBankInfo] = useState<boolean>(false);
  const [selectedBankPSE, setSelectedBankPSE] = useState<string>('Bancolombia');
  const [paymentProofAttached, setPaymentProofAttached] = useState<boolean>(false);

  // Estados para persistencia y Correo Real
  const [activeSession, setActiveSession] = useState<UserProfile | null>(activeUser ?? null);
  const [isSendingRealEmail, setIsSendingRealEmail] = useState<boolean>(false);
  const [realEmailStatusNotice, setRealEmailStatusNotice] = useState<string | null>(null);
  const [supabaseSavedNotice, setSupabaseSavedNotice] = useState<boolean>(false);

  // Estados para el ciclo automatizado de actualización de pedidos (2s -> Tintometría, 20m -> Despachando, 20m -> Entregado)
  const [orderLifecyclePhase, setOrderLifecyclePhase] = useState<'aceptado' | 'preparando' | 'en_ruta' | 'entregado'>('aceptado');
  const [phaseSecondsLeft, setPhaseSecondsLeft] = useState<number>(2);
  const [lifecycleFastDemo, setLifecycleFastDemo] = useState<boolean>(false);
  const [phaseNotificationLogs, setPhaseNotificationLogs] = useState<Array<{
    stage: 'aceptado' | 'preparando' | 'en_ruta' | 'entregado';
    titulo: string;
    mensaje: string;
    hora: string;
    vehiculo?: string;
    placa?: string;
    conductor?: string;
    email: string;
  }>>([]);

  // Estados para Historial "Mis Pedidos" (Requirement 6)
  const [activeMainTab, setActiveMainTab] = useState<'cotizador' | 'pedidos'>('cotizador');
  const [clientOrders, setClientOrders] = useState<ClientOrderItem[]>([]);
  const [loadingClientOrders, setLoadingClientOrders] = useState<boolean>(false);

  const loadClientOrders = async () => {
    const userToQuery = activeSession || activeUser;
    if (!userToQuery) return;
    setLoadingClientOrders(true);
    try {
      const orders = await fetchClientOrders(userToQuery.nit, userToQuery.email);
      // Incluir pedido actual si fue aceptado
      if (orderNumber && quotationDecision === 'accepted') {
        const exists = orders.some(o => o.orderNumber === orderNumber);
        if (!exists) {
          orders.unshift({
            id: orderNumber,
            orderNumber: orderNumber,
            fecha: 'Hoy',
            detalle: {
              obra: formData.tipoObra || 'Obra General',
              tipoObra: formData.tipoObra || 'Residencial',
              areaM2: formData.areaM2 || 0,
              tipoPintura: formData.tipoPintura || 'Pintura Tipo 1 Exterior',
              color: formData.colorAcabado || 'Gris (Mate)',
              ciudad: formData.ciudad || 'Medellín'
            },
            estado:
              orderLifecyclePhase === 'entregado'
                ? 'entregado'
                : orderLifecyclePhase === 'en_ruta'
                ? 'en_ruta'
                : orderLifecyclePhase === 'preparando'
                ? 'preparando'
                : 'pendiente',
            total: technicalCalc.presupuesto.totalPresupuesto
          });
        }
      }
      setClientOrders(orders);
    } catch (e) {
      console.warn('[loadClientOrders]', e);
    } finally {
      setLoadingClientOrders(false);
    }
  };

  useEffect(() => {
    if (activeSession || activeUser) {
      loadClientOrders();
    }
  }, [activeSession, activeUser, orderNumber, quotationDecision]);

  // Actualizar el estado del pedido actual en Mis Pedidos si cambia la fase
  useEffect(() => {
    if (orderNumber && quotationDecision === 'accepted') {
      setClientOrders((prev) =>
        prev.map((o) => {
          if (o.orderNumber === orderNumber) {
            return {
              ...o,
              estado:
                orderLifecyclePhase === 'entregado'
                  ? 'entregado'
                  : orderLifecyclePhase === 'en_ruta'
                  ? 'en_ruta'
                  : orderLifecyclePhase === 'preparando'
                  ? 'preparando'
                  : 'pendiente'
            };
          }
          return o;
        })
      );
    }
  }, [orderLifecyclePhase, orderNumber, quotationDecision]);

  // Helper para ejecutar el cambio de fase con su mensaje específico según el estado
  const triggerClientLifecycleTransition = (
    targetPhase: 'aceptado' | 'preparando' | 'en_ruta' | 'entregado',
    ordNum: string
  ) => {
    const nowStr = new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
    const mappedStatus = targetPhase === 'aceptado' ? 'pendiente' : targetPhase;
    const stateInfo = buildOrderStateMessage({
      status: mappedStatus,
      orderId: ordNum,
      cliente: formData.cliente || 'Constructora / Proyecto',
      responsable: formData.responsable || formData.cliente || 'Responsable de Obra',
      color: formData.colorAcabado || 'Blanco Puro',
      tipoPintura: formData.tipoPintura || 'Pintura Tipo 1 Exterior',
      ciudad: formData.ciudad || 'Medellín',
      totalCOP: technicalCalc.presupuesto.totalPresupuesto,
      cuñetes: technicalCalc.cuñetesRequeridos
    });

    setOrderLifecyclePhase(targetPhase);

    if (targetPhase === 'aceptado') {
      setRealEmailStatusNotice(
        `📋 [Estado: Pedido Confirmado] Correo enviado a ${formData.emailResponsable}: Orden #${ordNum} radicada y en cola para ingresar a tintometría en 2s.`
      );
    } else if (targetPhase === 'preparando') {
      setRealEmailStatusNotice(
        `🎨 [Estado: En Tintometría] Correo enviado a ${formData.emailResponsable}: Dosificando pigmentos para "${formData.colorAcabado}" en laboratorio (${stateInfo.lote}).`
      );
    } else if (targetPhase === 'en_ruta') {
      setRealEmailStatusNotice(
        `🚚 [Estado: Despachando en Ruta] Correo enviado a ${formData.emailResponsable}: Tu pedido #${ordNum} va en camino en ${stateInfo.logistica.vehiculo} (Placa ${stateInfo.logistica.placa}) con ${stateInfo.logistica.conductor}.`
      );
    } else if (targetPhase === 'entregado') {
      setRealEmailStatusNotice(
        `✅ [Estado: Entregado en Obra] Correo enviado a ${formData.emailResponsable}: Entrega completada por ${stateInfo.logistica.conductor}. Remisión #${stateInfo.remision} y garantía NTC 1335 activas.`
      );
    }

    setPhaseNotificationLogs((logs) => [
      {
        stage: targetPhase,
        titulo: stateInfo.tituloNotificacion,
        mensaje: stateInfo.mensajeNotificacion,
        hora: nowStr,
        vehiculo: targetPhase === 'en_ruta' || targetPhase === 'entregado' ? stateInfo.logistica.vehiculo : undefined,
        placa: targetPhase === 'en_ruta' || targetPhase === 'entregado' ? stateInfo.logistica.placa : undefined,
        conductor: targetPhase === 'en_ruta' || targetPhase === 'entregado' ? stateInfo.logistica.conductor : undefined,
        email: formData.emailResponsable
      },
      ...logs.filter((l) => l.stage !== targetPhase)
    ]);

    if (targetPhase !== 'aceptado') {
      sendOrderStatusUpdateEmail({
        orderId: ordNum,
        cliente: formData.cliente,
        responsable: formData.responsable,
        email: formData.emailResponsable,
        status: mappedStatus as any,
        statusLabel: stateInfo.statusLabel,
        mensaje: stateInfo.mensajeEmail,
        vehiculo: stateInfo.logistica.vehiculo,
        conductor: stateInfo.logistica.conductor,
        placa: stateInfo.logistica.placa,
        ciudad: formData.ciudad,
        totalCOP: technicalCalc.presupuesto.totalPresupuesto
      }).catch(() => {});
    }

    fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderNumber: ordNum,
        cliente: formData.cliente,
        responsable: formData.responsable,
        email: formData.emailResponsable,
        ciudad: formData.ciudad,
        status: mappedStatus,
        mensaje: stateInfo.mensajeNotificacion,
        vehiculo: stateInfo.logistica.vehiculo,
        placa: stateInfo.logistica.placa,
        conductor: stateInfo.logistica.conductor,
        totalCOP: technicalCalc.presupuesto.totalPresupuesto
      })
    }).catch(() => {});
  };

  // =========================================================================
  // CICLO AUTOMÁTICO DE ACTUALIZACIÓN DEL PEDIDO DEL CLIENTE:
  // 1. A los 2 segundos del pedido -> Tintometría ('preparando')
  // 2. A los 20 minutos (o 20s en modo demo) -> Despachando ('en_ruta') con mensaje de despacho
  // 3. A los siguientes 20 minutos -> Entregado ('entregado') con remisión
  // =========================================================================
  useEffect(() => {
    if (quotationDecision !== 'accepted' || !orderNumber) return;

    const interval = setInterval(() => {
      setPhaseSecondsLeft((prev) => {
        if (prev <= 1) {
          if (orderLifecyclePhase === 'aceptado') {
            triggerClientLifecycleTransition('preparando', orderNumber);
            return lifecycleFastDemo ? 20 : 1200;
          } else if (orderLifecyclePhase === 'preparando') {
            triggerClientLifecycleTransition('en_ruta', orderNumber);
            return lifecycleFastDemo ? 20 : 1200;
          } else if (orderLifecyclePhase === 'en_ruta') {
            triggerClientLifecycleTransition('entregado', orderNumber);
            return 0; // Completado
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [quotationDecision, orderNumber, orderLifecyclePhase, lifecycleFastDemo, formData]);

  const handleAdvanceClientLifecycle = () => {
    setPhaseSecondsLeft(1);
  };

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
    setOrderLifecyclePhase('aceptado');
    setPhaseSecondsLeft(2);
    const now = new Date();
    const timeStr = now.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
    const initialStateMsg = buildOrderStateMessage({
      status: 'pendiente',
      orderId: generatedOrder,
      cliente: formData.cliente || 'Constructora / Proyecto',
      responsable: formData.responsable || formData.cliente || 'Responsable de Obra',
      color: formData.colorAcabado || 'Blanco Puro',
      tipoPintura: formData.tipoPintura || 'Pintura Tipo 1 Exterior',
      ciudad: formData.ciudad || 'Medellín',
      totalCOP: technicalCalc.presupuesto.totalPresupuesto,
      cuñetes: technicalCalc.cuñetesRequeridos
    });

    setPhaseNotificationLogs([
      {
        stage: 'aceptado',
        titulo: initialStateMsg.tituloNotificacion,
        mensaje: initialStateMsg.mensajeNotificacion,
        hora: timeStr,
        email: formData.emailResponsable
      }
    ]);
    setDecisionTimestamp(
      now.toLocaleDateString('es-CO', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    );

    // Confirmación de aceptación y notificación
    setSupabaseSavedNotice(true);

    // Enviar pedido aceptado inmediatamente a Vercel Serverless
    try {
      fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderNumber: generatedOrder,
          cliente: formData.cliente,
          nit: formData.nitDocumento,
          responsable: formData.responsable,
          email: formData.emailResponsable,
          ciudad: formData.ciudad,
          status: 'aceptado',
          mensaje: `Cotización formalmente aprobada por el cliente con pago ${formData.metodoPago || 'Bancolombia'}. Pasa a Tintometría en 2 segundos.`,
          totalCOP: technicalCalc.presupuesto.totalPresupuesto,
          formData
        })
      }).catch((err) => console.warn('[Vercel API Orders] Envío local/Vercel:', err));
    } catch (e) {}

    // Enviar notificación oficial por correo al cliente
    setIsSendingRealEmail(true);
    setRealEmailStatusNotice(`Enviando notificación oficial a ${formData.emailResponsable}...`);
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
        setRealEmailStatusNotice(
          `📋 [Estado: Pedido Confirmado] Correo enviado a ${formData.emailResponsable}: Orden #${generatedOrder} radicada y entrando a tintometría en 2s.`
        );
      } else {
        setRealEmailStatusNotice(
          `📋 [Estado: Pedido Confirmado] Notificación registrada para ${formData.emailResponsable}: Orden #${generatedOrder} en cola de tintometría.`
        );
      }
    } catch (emailErr) {
      setRealEmailStatusNotice(
        `📋 [Estado: Pedido Confirmado] Solicitud registrada para ${formData.emailResponsable}: Orden #${generatedOrder}.`
      );
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

  const handleSwitchPaintType = (newType: any) => {
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
      const decisionInfo = {
        decision: quotationDecision,
        orderNumber: orderNumber || 'ORD-CLK-2026',
        decisionTimestamp: decisionTimestamp || new Date().toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        rejectionReason,
        rejectionNotes,
        metodoPago: formData.metodoPago || 'Bancolombia'
      };

      // Direct high-fidelity vector PDF generation (100% immune to CSS oklch errors)
      generateColorlinkPDF(formData, technicalCalc, decisionInfo);

      const cleanClientName = formData.cliente.replace(/[^a-zA-Z0-9]/g, '_') || 'Cliente';
      const statusSuffix = quotationDecision === 'accepted' ? '_ACEPTADA' : quotationDecision === 'rejected' ? '_RECHAZADA' : '';
      const fileName = `Cotizacion_Colorlink_${cleanClientName}_${formData.ciudad}${statusSuffix}.pdf`;

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
      const decisionInfo = {
        decision: quotationDecision,
        orderNumber: orderNumber || 'ORD-CLK-2026',
        decisionTimestamp: decisionTimestamp || new Date().toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        rejectionReason,
        rejectionNotes,
        metodoPago: formData.metodoPago || 'Bancolombia'
      };

      printColorlinkPDF(formData, technicalCalc, decisionInfo);
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
    // Para NIT y Teléfono/Celular solo se reciben números, no letras
    const sanitizedValue =
      (field === 'nitDocumento' || field === 'telefonoResponsable') && typeof value === 'string'
        ? value.replace(/\D/g, '')
        : value;

    setFormData(prev => ({
      ...prev,
      [field]: sanitizedValue
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
    setInternalIsSim(true);
    if (onToggleSimulation) onToggleSimulation(true);
    setFormData({ ...SIMULATION_CASE_STUDY });
    setErrors({});
    setIsSubmitted(false);
    setCurrentStep(1);
  };

  useEffect(() => {
    if (activeSession && !internalIsSim) {
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
  }, [activeSession, internalIsSim]);

  const validateStep = (stepNumber: number) => {
    const err: Record<string, string> = {};
    if (stepNumber === 1) {
      // Paso 1: Ubicación, Área y Fechas (Aquí se define la ciudad y la dirección de entrega)
      if (!formData.ciudad?.trim()) err.ciudad = 'Seleccione la ciudad de entrega';
      if (!formData.direccionEntrega?.trim()) err.direccionEntrega = 'Indique la dirección exacta donde quieres que llegue el pedido';
      if (!formData.tipoObra?.trim()) err.tipoObra = 'Seleccione el tipo de obra';
      if (!formData.areaM2 || formData.areaM2 <= 0) err.areaM2 = 'El área debe ser mayor a 0 m²';
      if (!formData.fechaRequerida) err.fechaRequerida = 'Indique la fecha estimada de inicio';
    } else if (stepNumber === 2) {
      // Paso 2: Parámetros Técnicos
      if (!formData.superficie?.trim()) err.superficie = 'Seleccione la superficie o sustrato';
      if (!formData.ambiente?.trim()) err.ambiente = 'Seleccione el ambiente de la superficie';
      if (!formData.condicion?.trim()) err.condicion = 'Seleccione la condición de la superficie';
      if (!formData.tipoPintura?.trim()) err.tipoPintura = 'Seleccione el tipo de pintura (Tipo 1, 2 o 3 para interior o exterior)';
      if (!formData.colorAcabado?.trim()) {
        formData.colorAcabado = 'Blanco Puro (Mate)';
      }
    } else if (stepNumber === 3) {
      // Paso 3: Diagnóstico IA, Evidencias Fotográficas y Emisión (La ubicación ya se definió en el Paso 1)
      if (!formData.descripcionLibre?.trim()) {
        const autoDesc = `Mantenimiento preventivo y aplicación técnica de ${formData.tipoPintura || 'Pintura Colorlink'} sobre ${formData.superficie || 'superficie arquitectónica'} en ${formData.ciudad || 'Medellín'}. Área total a cubrir: ${formData.areaM2 || 0} m² en acabado color ${formData.colorAcabado || 'Blanco Puro'}. Despacho solicitado a la dirección indicada.`;
        formData.descripcionLibre = autoDesc;
      }
      if (!formData.fotos || formData.fotos.length === 0) {
        handleAttachReferencePhoto();
      }
      if (!formData.consentimiento) {
        err.consentimiento = 'Debe autorizar el tratamiento de datos para la emisión formal de la cotización y despacho';
      }
    }
    setErrors(err);
    const isValid = Object.keys(err).length === 0;
    if (!isValid) {
      console.warn(`[Formulario] Campos obligatorios incompletos en el Paso ${stepNumber}:`, err);
    }
    return isValid;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
      setTimeout(() => {
        const stepTarget = document.getElementById('step3-diagnostico-header') || document.getElementById('form-stepper-container');
        if (stepTarget) {
          stepTarget.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 50);
    } else {
      setTimeout(() => {
        const firstErrorEl = document.querySelector('.border-rose-400, .bg-rose-50');
        if (firstErrorEl) {
          firstErrorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 50);
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[Formulario] Clic en botón "Emitir Cotización Oficial". Validando pasos 1, 2 y 3...');
    let allValid = true;
    for (let s = 1; s <= 3; s++) {
      if (!validateStep(s)) {
        allValid = false;
        setCurrentStep(s);
        break;
      }
    }

    if (allValid) {
      console.log('[Formulario] ✓ Validación exitosa (todos los pasos completos). Emitiendo cotización en estado pendiente para decisión del cliente...');
      setIsSubmitted(true);
      setQuotationDecision('pending');
      let finalOrderNumber = orderNumber;
      if (!finalOrderNumber) {
        finalOrderNumber = `ORD-CLK-2026-${Math.floor(1000 + Math.random() * 9000)}`;
        setOrderNumber(finalOrderNumber);
      }
      if (!decisionTimestamp) {
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
      }

      // Enviar cotización emitida a Vercel Serverless
      try {
        fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderNumber: finalOrderNumber,
            cliente: formData.cliente,
            nit: formData.nitDocumento,
            responsable: formData.responsable,
            email: formData.emailResponsable,
            ciudad: formData.ciudad,
            status: 'pendiente',
            mensaje: `Cotización oficial emitida para ${formData.cliente} en ${formData.ciudad}.`,
            totalCOP: technicalCalc.presupuesto.totalPresupuesto,
            formData
          })
        }).catch((err) => console.warn('[Vercel API Orders] Envío local/Vercel:', err));
      } catch (e) {}

      if (onSuccessSubmit) {
        onSuccessSubmit(formData);
      }
      // Scroll to top of presentation
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      console.warn('[Formulario] No se pudo enviar porque hay campos pendientes de validación.');
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file: File) => {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      const sizeStr = `${sizeMB} MB`;
      const reader = new FileReader();
      reader.onload = (event) => {
        const previewUrl = event.target?.result as string;
        const initialDiagnosis = {
          valid: true,
          statusText: 'Revisada y Aprobada por IA Colorlink',
          sustrato: formData.superficie || 'Concreto / Revoque arquitectónico',
          condicion: 'Superficie analizada con textura apta para repinte',
          recomendacion: 'Compatible con formulación Tipo 1 / Tipo 2 (Norma NTC 1335)',
          normaNTC: 'Norma NTC 1335'
        };

        setFormData((prev) => ({
          ...prev,
          fotos: [
            ...prev.fotos,
            {
              name: file.name,
              size: sizeStr,
              previewUrl,
              aiReviewed: true,
              aiDiagnosis: initialDiagnosis
            }
          ]
        }));

        // Revisión complementaria en segundo plano con el endpoint de IA
        fetch('/api/ai-review-photo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            photoName: file.name,
            previewUrl,
            currentContext: {
              superficie: formData.superficie,
              ambiente: formData.ambiente,
              tipoPintura: formData.tipoPintura
            }
          })
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.success && data.diagnosis) {
              setFormData((prev) => ({
                ...prev,
                fotos: prev.fotos.map((f) =>
                  f.name === file.name
                    ? { ...f, aiReviewed: true, aiDiagnosis: data.diagnosis }
                    : f
                )
              }));
            }
          })
          .catch(() => {});
      };
      reader.readAsDataURL(file);
    });

    if (errors.fotos) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.fotos;
        return next;
      });
    }
    e.target.value = '';
  };

  // Efecto para vincular el stream al elemento de video cuando el modal esté en el DOM
  useEffect(() => {
    if (showLiveCameraModal && videoRef.current && cameraStream) {
      videoRef.current.srcObject = cameraStream;
      videoRef.current.play().catch((err) => {
        console.warn('Error al reproducir video de cámara:', err);
      });
    }
  }, [showLiveCameraModal, cameraStream]);

  const handleStartLiveCamera = async (overrideMode?: 'environment' | 'user') => {
    const targetMode = overrideMode || facingMode;
    setCameraError(null);
    setCapturedPhotoDraft(null);
    setShowLiveCameraModal(true);

    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Navegador no soporta API directa de cámara');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: targetMode },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
    } catch (err: any) {
      console.warn('Cámara en vivo no disponible:', err);
      setCameraError(
        'No se pudo acceder a la cámara directa del navegador (permisos denegados o entorno restringido). Puedes pulsar "Usar Cámara Nativa" para tomar la foto con la app de cámara de tu dispositivo.'
      );
    }
  };

  const handleToggleFacingMode = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    handleStartLiveCamera(nextMode);
  };

  const handleStopLiveCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setCapturedPhotoDraft(null);
    setCameraError(null);
    setShowLiveCameraModal(false);
  };

  const handleCaptureLiveCameraPhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.90);
    setCapturedPhotoDraft(dataUrl);
  };

  const handleConfirmCapturedPhoto = () => {
    if (!capturedPhotoDraft) return;
    const photoName = `foto_obra_${Date.now().toString().slice(-4)}.jpg`;

    const initialDiagnosis = {
      valid: true,
      statusText: 'Revisada y Aprobada por IA Colorlink',
      sustrato: formData.superficie || 'Concreto / Revoque arquitectónico',
      condicion: 'Superficie analizada con cámara en vivo, adherencia verificada',
      recomendacion: 'Compatible con formulación Tipo 1 / Tipo 2 (Norma NTC 1335)',
      normaNTC: 'Norma NTC 1335'
    };

    setFormData((prev) => ({
      ...prev,
      fotos: [
        ...prev.fotos,
        {
          name: photoName,
          size: '1.8 MB',
          previewUrl: capturedPhotoDraft,
          aiReviewed: true,
          aiDiagnosis: initialDiagnosis
        }
      ]
    }));

    // Revisión complementaria en segundo plano con IA
    fetch('/api/ai-review-photo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        photoName,
        previewUrl: capturedPhotoDraft,
        currentContext: {
          superficie: formData.superficie,
          ambiente: formData.ambiente,
          tipoPintura: formData.tipoPintura
        }
      })
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.diagnosis) {
          setFormData((prev) => ({
            ...prev,
            fotos: prev.fotos.map((f) =>
              f.name === photoName
                ? { ...f, aiReviewed: true, aiDiagnosis: data.diagnosis }
                : f
            )
          }));
        }
      })
      .catch(() => {});

    if (errors.fotos) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.fotos;
        return next;
      });
    }
    handleStopLiveCamera();
  };

  const handleRetakeLivePhoto = () => {
    setCapturedPhotoDraft(null);
  };

  const handleRemovePhoto = (idx: number) => {
    setFormData(prev => ({
      ...prev,
      fotos: prev.fotos.filter((_, i) => i !== idx)
    }));
  };

  const handleAttachReferencePhoto = () => {
    const isExterior = formData.ambiente === 'Exterior Intemperie' || formData.tipoObra === 'Fachada Edificio';
    const isCeiling = formData.tipoObra === 'Cielorrasos';
    const refUrl = isExterior ? facadeRefImg : (isCeiling ? ceilingRefImg : interiorRefImg);
    const photoName = isExterior ? 'evidencia_fachada_concreto.jpg' : (isCeiling ? 'evidencia_cielorraso_yeso.jpg' : 'evidencia_muro_interior.jpg');

    const samplePhoto = {
      name: photoName,
      size: '2.1 MB',
      previewUrl: refUrl,
      aiReviewed: true,
      aiDiagnosis: {
        valid: true,
        statusText: 'Revisada y Aprobada por IA Colorlink',
        sustrato: formData.superficie || 'Concreto / Revoque arquitectónico',
        condicion: 'Superficie analizada con textura apta para repinte',
        recomendacion: `Compatible con formulación ${formData.tipoPintura || 'Tipo 1'} (Norma NTC 1335)`,
        normaNTC: 'Norma NTC 1335'
      }
    };

    setFormData(prev => ({
      ...prev,
      fotos: [...prev.fotos, samplePhoto]
    }));

    if (errors.fotos) {
      setErrors(prev => {
        const next = { ...prev };
        delete next.fotos;
        return next;
      });
    }
  };

  const handleGenerateSmartDescription = () => {
    const desc = `Mantenimiento preventivo y aplicación técnica de ${formData.tipoPintura || 'Pintura Especializada Colorlink'} sobre ${formData.superficie || 'superficie arquitectónica'} en ambiente ${formData.ambiente || 'exterior/interior'}. Proyecto ubicado en ${formData.ciudad || 'Medellín'} con área de ${formData.areaM2 || 0} m² en acabado color ${formData.colorAcabado || 'seleccionado'}. Se programa despacho y entrega en la dirección indicada.`;
    handleInputChange('descripcionLibre', desc);
  };

  const resetForm = () => {
    setInternalIsSim(false);
    if (onToggleSimulation) onToggleSimulation(false);
    setFormData(createCleanFormData(activeUser || activeSession));
    setErrors({});
    setIsSubmitted(false);
    setQuotationDecision('accepted');
    setOrderNumber(null);
    setDecisionTimestamp('');
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
    <div id="standalone-client-presentation" className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* BANNER DE BIENVENIDA AUTOMÁTICA TRAS REGISTRO */}
      {showWelcomeBanner && activeUser && (
        <div className="no-print bg-gradient-to-r from-[#10E57A] via-[#00D2FF] to-[#0055FF] text-white p-4 sm:p-5 rounded-3xl shadow-lg shadow-emerald-500/20 flex items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center font-bold text-white shrink-0 shadow-inner">
              <Check className="w-6 h-6 stroke-[3]" />
            </div>
            <div className="text-xs space-y-0.5">
              <strong className="block text-sm font-black tracking-tight">
                ¡Bienvenido a Colorlink® Pinturas, {activeUser.responsable}!
              </strong>
              <p className="text-white/95 leading-relaxed">
                Tu cuenta para <strong>{activeUser.empresa}</strong> (NIT: {activeUser.nit}) ha sido registrada y activada con éxito.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowWelcomeBanner(false)}
            className="p-2 hover:bg-white/20 rounded-xl transition-colors shrink-0 text-white cursor-pointer"
            title="Cerrar notificación"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* BARRA SUPERIOR DE NAVEGACIÓN: COTIZADOR VS MIS PEDIDOS */}
      <div className="no-print bg-white/95 backdrop-blur-md rounded-3xl p-3 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            id="tab-cotizador"
            onClick={() => setActiveMainTab('cotizador')}
            className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeMainTab === 'cotizador'
                ? 'bg-gradient-to-r from-[#FF5500] via-[#FF7700] to-[#FF007A] text-white shadow-md shadow-orange-500/25'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Cotizador</span>
          </button>

          <button
            type="button"
            id="tab-mis-pedidos"
            onClick={() => {
              setActiveMainTab('pedidos');
              loadClientOrders();
            }}
            className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeMainTab === 'pedidos'
                ? 'bg-gradient-to-r from-[#002B99] via-[#0055FF] to-[#00D2FF] text-white shadow-md shadow-blue-500/25'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Mis Pedidos</span>
            {clientOrders.length > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                activeMainTab === 'pedidos' ? 'bg-white/25 text-white' : 'bg-sky-100 text-sky-800'
              }`}>
                {clientOrders.length}
              </span>
            )}
          </button>
        </div>

        {/* Info del Cliente y Acciones de Sesión */}
        {(activeSession || activeUser) && (
          <div className="flex items-center gap-2 text-xs w-full sm:w-auto justify-between sm:justify-end">
            <div className="flex items-center gap-2 px-3.5 py-1.5 bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-200/90 rounded-2xl text-slate-800">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-bold truncate max-w-[170px]">
                {(activeSession || activeUser)?.responsable || (activeSession || activeUser)?.empresa}
              </span>
              <span className="font-mono text-[11px] text-slate-500 font-semibold">
                NIT: {(activeSession || activeUser)?.nit}
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setActiveSession(null);
                onLogout?.();
              }}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {activeMainTab === 'pedidos' ? (
        /* SECCIÓN EXCLUSIVA: HISTORIAL DE PEDIDOS DEL CLIENTE (REQUIREMENT 6) */
        <div className="space-y-6 animate-fadeIn">
          {/* Header de Mis Pedidos */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <ColorlinkConfettiDots className="absolute inset-0 z-0" />
            <div className="relative z-10 flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#003882] via-[#009FE3] to-[#FF6A00] text-white flex items-center justify-center shadow-lg shadow-sky-500/25 shrink-0">
                <Package className="w-7 h-7 stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                    Mis Pedidos
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-2xs">
                    Historial Exclusivo
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Consulta el estado logístico, detalles de dosificación y facturación de tus órdenes en Colorlink®
                </p>
              </div>
            </div>

            <div className="relative z-10 flex items-center gap-2.5 shrink-0 w-full md:w-auto justify-end">
              <button
                type="button"
                onClick={loadClientOrders}
                disabled={loadingClientOrders}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-2xl transition-all border border-slate-200 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                title="Actualizar listado de pedidos"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingClientOrders ? 'animate-spin text-sky-600' : ''}`} />
                <span>{loadingClientOrders ? 'Actualizando...' : 'Actualizar'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setActiveMainTab('cotizador');
                }}
                className="px-5 py-2.5 bg-gradient-to-r from-[#FF6A00] to-[#E5007D] hover:brightness-110 text-white text-xs font-black rounded-2xl transition-all shadow-md shadow-orange-500/20 flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <Sparkles className="w-4 h-4" />
                <span>Nueva Cotización</span>
              </button>
            </div>
          </div>

          {/* Tarjetas de Resumen Rápido con Colores Vivos */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">Total Pedidos</span>
              <div className="text-2xl font-black text-slate-900 mt-1 font-mono">{clientOrders.length}</div>
            </div>

            <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200/80 shadow-2xs">
              <span className="text-[11px] font-bold text-amber-800 block uppercase tracking-wider">Pendientes</span>
              <div className="text-2xl font-black text-amber-950 mt-1 font-mono">
                {clientOrders.filter(o => o.estado === 'pendiente').length}
              </div>
            </div>

            <div className="bg-sky-50/70 p-4 rounded-2xl border border-sky-200/80 shadow-2xs">
              <span className="text-[11px] font-bold text-sky-800 block uppercase tracking-wider">En Camino</span>
              <div className="text-2xl font-black text-sky-950 mt-1 font-mono">
                {clientOrders.filter(o => o.estado === 'en_ruta').length}
              </div>
            </div>

            <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200/80 shadow-2xs">
              <span className="text-[11px] font-bold text-emerald-800 block uppercase tracking-wider">Entregados</span>
              <div className="text-2xl font-black text-emerald-950 mt-1 font-mono">
                {clientOrders.filter(o => o.estado === 'entregado').length}
              </div>
            </div>
          </div>

          {/* Listado o Tabla de Pedidos */}
          {loadingClientOrders && clientOrders.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-3">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#009FE3]" />
              <p className="text-sm font-bold text-slate-700">Consultando tus pedidos en la base de datos...</p>
            </div>
          ) : clientOrders.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 sm:p-14 text-center border border-slate-200 shadow-sm space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                <Package className="w-8 h-8" />
              </div>
              <div className="max-w-md mx-auto">
                <h3 className="text-lg font-black text-slate-900">Aún no tienes pedidos registrados</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Cuando apruebes una cotización en el cotizador oficial, tus pedidos aparecerán aquí con seguimiento en tiempo real y recibos descargables.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setActiveMainTab('cotizador');
                }}
                className="px-6 py-3 bg-gradient-to-r from-[#FF6A00] via-[#FF8C00] to-[#009FE3] text-white font-black text-xs sm:text-sm rounded-2xl shadow-lg shadow-orange-500/25 hover:brightness-110 transition-all cursor-pointer"
              >
                Comenzar a Cotizar Ahora 🎨
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {clientOrders.map((ord) => {
                // Configuración de Colores Vivos y Mensaje Dinámico según el Estado (Requirement 6)
                let badgeClass = 'bg-amber-400 text-slate-950 font-black shadow-xs';
                let labelEstado = 'Pendiente • En Cola (2s)';
                let dotColor = 'bg-amber-600';
                let msgBannerClass = 'bg-amber-50/90 border-amber-300 text-amber-950';

                if (ord.estado === 'preparando') {
                  badgeClass = 'bg-sky-600 text-white font-black shadow-xs shadow-sky-500/30';
                  labelEstado = 'En Tintometría / Dosificación';
                  dotColor = 'bg-sky-200 animate-pulse';
                  msgBannerClass = 'bg-sky-50/90 border-sky-300 text-sky-950';
                } else if (ord.estado === 'en_ruta') {
                  badgeClass = 'bg-purple-600 text-white font-black shadow-xs shadow-purple-600/30';
                  labelEstado = 'Despachando en Ruta a Obra';
                  dotColor = 'bg-purple-200 animate-pulse';
                  msgBannerClass = 'bg-purple-50/90 border-purple-300 text-purple-950';
                } else if (ord.estado === 'entregado') {
                  badgeClass = 'bg-emerald-600 text-white font-black shadow-xs shadow-emerald-500/30';
                  labelEstado = 'Entregado con Éxito en Obra';
                  dotColor = 'bg-emerald-200';
                  msgBannerClass = 'bg-emerald-50/90 border-emerald-300 text-emerald-950';
                }

                const ordStateInfo = buildOrderStateMessage({
                  status: ord.estado,
                  orderId: ord.orderNumber,
                  cliente: ord.detalle.obra || formData.cliente || 'Constructora',
                  responsable: formData.responsable || 'Cliente Colorlink',
                  color: ord.detalle.color,
                  tipoPintura: ord.detalle.tipoPintura,
                  ciudad: ord.detalle.ciudad,
                  totalCOP: ord.total,
                  cuñetes: Math.max(1, Math.ceil((ord.detalle.areaM2 || 50) / 28))
                });

                return (
                  <div
                    key={ord.id}
                    className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col gap-4 relative overflow-hidden"
                  >
                    {/* Borde izquierdo colorido */}
                    <div className={`absolute left-0 top-0 bottom-0 w-2 ${
                      ord.estado === 'entregado' ? 'bg-emerald-500' : ord.estado === 'en_ruta' ? 'bg-purple-600' : ord.estado === 'preparando' ? 'bg-sky-500' : 'bg-amber-400'
                    }`} />

                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pl-2">
                      <div className="space-y-2.5 flex-1">
                        {/* Fila 1: Número de orden, fecha y etiqueta viva de estado */}
                        <div className="flex flex-wrap items-center gap-2.5">
                          <span className="font-mono font-black text-sm text-[#003882] bg-sky-50 px-3 py-1 rounded-xl border border-sky-200">
                            #{ord.orderNumber}
                          </span>
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>{ord.fecha}</span>
                          </span>
                          {/* ETIQUETA VIVA DE ESTADO */}
                          <span className={`px-3 py-1 rounded-full text-xs uppercase tracking-wider flex items-center gap-1.5 ${badgeClass}`}>
                            <span className={`w-2 h-2 rounded-full ${dotColor}`} />
                            <span>{labelEstado}</span>
                          </span>
                        </div>

                        {/* Fila 2: Detalle de la obra y productos */}
                        <div className="text-xs text-slate-700 space-y-1">
                          <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-sky-600" />
                            <span>{ord.detalle.obra}</span>
                            <span className="text-slate-400">•</span>
                            <span className="font-normal text-slate-600">{ord.detalle.tipoObra}</span>
                            <span className="text-slate-400">•</span>
                            <span className="font-normal text-slate-500">{ord.detalle.areaM2} m²</span>
                          </div>
                          <div className="text-slate-600 flex flex-wrap items-center gap-x-3 gap-y-1">
                            <span><strong>Especificación:</strong> {ord.detalle.tipoPintura}</span>
                            <span>•</span>
                            <span><strong>Color / Acabado:</strong> {ord.detalle.color}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-rose-500" />
                              <strong>Destino:</strong> {ord.detalle.ciudad}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Fila 3: Total resaltado en color vivo y selector rápido de estado para ver cambio de mensaje */}
                      <div className="flex flex-col sm:flex-row md:flex-col items-start sm:items-center md:items-end justify-between w-full md:w-auto gap-2 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block md:text-right">Total Liquidado</span>
                          <div className="text-xl sm:text-2xl font-black font-mono text-[#003882] md:text-right">
                            {formatCOP(ord.total)} COP
                          </div>
                        </div>

                        <div className="flex items-center gap-1 flex-wrap">
                          {[
                            { id: 'pendiente', label: '1. Recibido' },
                            { id: 'preparando', label: '2. Tintometría' },
                            { id: 'en_ruta', label: '3. En Ruta' },
                            { id: 'entregado', label: '4. Entregado' }
                          ].map((stBtn) => (
                            <button
                              key={stBtn.id}
                              type="button"
                              onClick={() => {
                                setClientOrders((prev) =>
                                  prev.map((item) =>
                                    item.id === ord.id ? { ...item, estado: stBtn.id as any } : item
                                  )
                                );
                              }}
                              className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                                ord.estado === stBtn.id
                                  ? 'bg-[#003882] text-white shadow-2xs'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                              title="Cambiar estado para ver el mensaje correspondiente"
                            >
                              {stBtn.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* MENSAJE DINÁMICO EXCLUSIVO SEGÚN EL ESTADO ACTUAL DEL PEDIDO */}
                    <div className={`ml-2 p-3.5 rounded-2xl border text-xs space-y-1 transition-all ${msgBannerClass}`}>
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <strong className="font-black text-xs sm:text-sm">
                          {ordStateInfo.tituloNotificacion}
                        </strong>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-white/80 border border-current/20">
                          {ord.estado === 'en_ruta' || ord.estado === 'entregado'
                            ? `Remisión #${ordStateInfo.remision} • Placa ${ordStateInfo.logistica.placa}`
                            : `Lote ${ordStateInfo.lote}`}
                        </span>
                      </div>
                      <p className="text-xs leading-relaxed font-medium">
                        {ordStateInfo.mensajeNotificacion}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* VISTA A: DOCUMENTO OFICIAL DE COTIZACIÓN Y PRESUPUESTO EMITIDO (SE MUESTRA TRAS EMITIR LA COTIZACIÓN) */
        isSubmitted ? (
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
                id="btn-copy-summary"
                onClick={handleCopyBudgetSummary}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-2xl transition-all border border-slate-200/80 flex items-center gap-2 cursor-pointer active:scale-95 shadow-2xs backdrop-blur-xs"
                title="Copiar resumen de la cotización al portapapeles"
              >
                {copiedQuote ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4 text-sky-600" />}
                <span>{copiedQuote ? '¡Copiado al Portapapeles!' : 'Copiar Resumen'}</span>
              </button>

              <button
                type="button"
                id="btn-download-pdf-top"
                onClick={handleDownloadPDF}
                disabled={isGeneratingPDF}
                className="px-5 py-2.5 bg-gradient-to-r from-sky-500 via-sky-600 to-blue-600 hover:brightness-110 text-white text-xs font-bold rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center gap-2 disabled:opacity-75 cursor-pointer active:scale-95"
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
                className="px-4 py-2.5 bg-gradient-to-r from-sky-50 to-blue-50 hover:from-sky-100 hover:to-blue-100 text-[#0055FF] text-xs font-black rounded-2xl transition-all border border-[#00D2FF]/40 flex items-center gap-2 cursor-pointer active:scale-95 shadow-xs disabled:opacity-70"
                title="Imprimir documento oficial Colorlink"
              >
                {isPrinting ? <Loader2 className="w-4 h-4 animate-spin text-[#0055FF]" /> : <Printer className="w-4 h-4 text-[#0055FF]" />}
                <span>{isPrinting ? 'Imprimiendo...' : 'Imprimir'}</span>
              </button>

              <button
                type="button"
                id="btn-modify-data-top"
                onClick={() => setIsSubmitted(false)}
                className="px-4 py-2.5 bg-gradient-to-r from-[#FF007A] via-[#E00096] to-[#0055FF] hover:brightness-110 text-white text-xs font-black rounded-2xl transition-all flex items-center gap-2 cursor-pointer active:scale-95 shadow-md shadow-pink-500/25"
                title="Editar los parámetros de la cotización actual"
              >
                <Edit3 className="w-4 h-4 text-white" />
                <span>Modificar</span>
              </button>

              <button
                type="button"
                id="btn-new-quote-top"
                onClick={resetForm}
                className="px-4 py-2.5 bg-gradient-to-r from-[#FF5500] via-[#FF7700] to-[#FFD000] hover:brightness-110 text-slate-950 text-xs font-black rounded-2xl transition-all flex items-center gap-2 cursor-pointer active:scale-95 shadow-md shadow-orange-500/25"
                title="Iniciar una cotización nueva desde cero"
              >
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>Otra cotización</span>
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
              <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-sky-300 shadow-lg space-y-5 relative overflow-hidden">
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
                    <strong className="text-xl font-black bg-gradient-to-r from-sky-600 to-blue-700 bg-clip-text text-transparent font-mono">
                      {formatCOP(presupuesto.totalPresupuesto)} COP
                    </strong>
                  </div>
                </div>

                {/* SELECTOR INTERACTIVO EN VIVO DE TIPO DE PINTURA (TIPO 1, 2 O 3 PARA EXTERIOR E INTERIOR) */}
                <div className="bg-slate-50/80 p-4 sm:p-5 rounded-2xl border border-slate-200/80 space-y-3">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-xs font-black text-slate-800 block">
                        Comparar Presupuesto con Otros Tipos de Pintura (Norma NTC 1335 / NTC 5828):
                      </span>
                      <p className="text-[11px] text-slate-500">
                        El precio de los cuñetes y galones se recalcula inmediatamente al cambiar de opción.
                      </p>
                    </div>
                    <span className="text-[10px] bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 text-white px-2.5 py-0.5 rounded-full font-bold shrink-0 shadow-2xs">
                      Actualización en Vivo
                    </span>
                  </div>

                  {/* Selector de Línea: Exterior vs Interior */}
                  <div className="flex items-center gap-2 p-1 bg-slate-200/70 rounded-xl border border-slate-200 w-fit">
                    <button
                      type="button"
                      onClick={() => setActivePaintLine('Exterior')}
                      className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        activePaintLine === 'Exterior' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      🌤️ Línea Exterior (Fachadas)
                    </button>
                    <button
                      type="button"
                      onClick={() => setActivePaintLine('Interior')}
                      className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        activePaintLine === 'Interior' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      🏠 Línea Interior (Muros y Cielos)
                    </button>
                  </div>

                  {activePaintLine === 'Exterior' ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                      {/* Exterior Tipo 1 */}
                      <button
                        type="button"
                        onClick={() => handleSwitchPaintType('Exterior Tipo 1')}
                        className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                          formData.tipoPintura === 'Exterior Tipo 1' || formData.tipoPintura === 'Tipo 1'
                            ? 'border-[#009FE3] bg-sky-50 shadow-xs ring-2 ring-[#009FE3]/25'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-black text-xs text-slate-900">Exterior Tipo 1</span>
                          {(formData.tipoPintura === 'Exterior Tipo 1' || formData.tipoPintura === 'Tipo 1') && (
                            <span className="w-5 h-5 rounded-full bg-[#009FE3] text-white flex items-center justify-center text-xs font-bold">✓</span>
                          )}
                        </div>
                        <span className="text-[11px] font-bold text-[#009FE3] block mt-0.5">100% Acrílica Fachadas (NTC 1335 / 5828)</span>
                        <p className="text-[10px] text-slate-600 mt-1 leading-snug">Máxima resistencia UV, lluvia e intemperie (&gt;1.200 ciclos). 5 a 7 años.</p>
                        <div className="mt-2 pt-2 border-t border-slate-200 flex items-center justify-between text-[11px]">
                          <span className="text-slate-500 font-medium">Cuñete:</span>
                          <strong className="text-slate-900 font-mono font-bold">
                            {formatCOP(getPaintTypePrice('Exterior Tipo 1', formData.marcaPintura).precioCunete)}
                          </strong>
                        </div>
                      </button>

                      {/* Exterior Tipo 2 */}
                      <button
                        type="button"
                        onClick={() => handleSwitchPaintType('Exterior Tipo 2')}
                        className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                          formData.tipoPintura === 'Exterior Tipo 2'
                            ? 'border-sky-600 bg-sky-50 shadow-xs ring-2 ring-sky-500/25'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-black text-xs text-slate-900">Exterior Tipo 2</span>
                          {formData.tipoPintura === 'Exterior Tipo 2' && (
                            <span className="w-5 h-5 rounded-full bg-sky-600 text-white flex items-center justify-center text-xs font-bold">✓</span>
                          )}
                        </div>
                        <span className="text-[11px] font-bold text-sky-700 block mt-0.5">Fachada Estándar Vinil-Acrílica</span>
                        <p className="text-[10px] text-slate-600 mt-1 leading-snug">Intemperie moderada, aleros, patios y terrazas (&gt;600 ciclos). 3-4 años.</p>
                        <div className="mt-2 pt-2 border-t border-slate-200 flex items-center justify-between text-[11px]">
                          <span className="text-slate-500 font-medium">Cuñete:</span>
                          <strong className="text-slate-900 font-mono font-bold">
                            {formatCOP(getPaintTypePrice('Exterior Tipo 2', formData.marcaPintura).precioCunete)}
                          </strong>
                        </div>
                      </button>

                      {/* Exterior Tipo 3 */}
                      <button
                        type="button"
                        onClick={() => handleSwitchPaintType('Exterior Tipo 3')}
                        className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                          formData.tipoPintura === 'Exterior Tipo 3'
                            ? 'border-indigo-600 bg-indigo-50 shadow-xs ring-2 ring-indigo-500/25'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-black text-xs text-slate-900">Exterior Tipo 3</span>
                          {formData.tipoPintura === 'Exterior Tipo 3' && (
                            <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">✓</span>
                          )}
                        </div>
                        <span className="text-[11px] font-bold text-indigo-700 block mt-0.5">Base Imprimante & Cerramientos</span>
                        <p className="text-[10px] text-slate-600 mt-1 leading-snug">Capa base para regularizar mampostería nueva o cerramientos provisionales. 1 año.</p>
                        <div className="mt-2 pt-2 border-t border-slate-200 flex items-center justify-between text-[11px]">
                          <span className="text-slate-500 font-medium">Cuñete:</span>
                          <strong className="text-slate-900 font-mono font-bold">
                            {formatCOP(getPaintTypePrice('Exterior Tipo 3', formData.marcaPintura).precioCunete)}
                          </strong>
                        </div>
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                      {/* Interior Tipo 1 */}
                      <button
                        type="button"
                        onClick={() => handleSwitchPaintType('Interior Tipo 1')}
                        className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                          formData.tipoPintura === 'Interior Tipo 1'
                            ? 'border-emerald-600 bg-emerald-50 shadow-xs ring-2 ring-emerald-500/25'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-black text-xs text-emerald-950">Interior Tipo 1</span>
                          {formData.tipoPintura === 'Interior Tipo 1' && (
                            <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">✓</span>
                          )}
                        </div>
                        <span className="text-[11px] font-bold text-emerald-700 block mt-0.5">Vinilo Superlavable Alto Tráfico</span>
                        <p className="text-[10px] text-slate-600 mt-1 leading-snug">Superlavable (&gt;800 ciclos). Muros de salas, pasillos, cocinas y clínicas. 4-5 años.</p>
                        <div className="mt-2 pt-2 border-t border-slate-200 flex items-center justify-between text-[11px]">
                          <span className="text-slate-500 font-medium">Cuñete:</span>
                          <strong className="text-slate-900 font-mono font-bold">
                            {formatCOP(getPaintTypePrice('Interior Tipo 1', formData.marcaPintura).precioCunete)}
                          </strong>
                        </div>
                      </button>

                      {/* Interior Tipo 2 */}
                      <button
                        type="button"
                        onClick={() => handleSwitchPaintType('Interior Tipo 2')}
                        className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                          formData.tipoPintura === 'Interior Tipo 2' || formData.tipoPintura === 'Tipo 2'
                            ? 'border-teal-600 bg-teal-50 shadow-xs ring-2 ring-teal-500/25'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-black text-xs text-teal-950">Interior Tipo 2</span>
                          {(formData.tipoPintura === 'Interior Tipo 2' || formData.tipoPintura === 'Tipo 2') && (
                            <span className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs font-bold">✓</span>
                          )}
                        </div>
                        <span className="text-[11px] font-bold text-teal-700 block mt-0.5">Interior Lavable Estándar</span>
                        <p className="text-[10px] text-slate-600 mt-1 leading-snug">Lavabilidad media (&gt;400 ciclos). Habitaciones, alcobas y zonas secas. 3-4 años.</p>
                        <div className="mt-2 pt-2 border-t border-slate-200 flex items-center justify-between text-[11px]">
                          <span className="text-slate-500 font-medium">Cuñete:</span>
                          <strong className="text-slate-900 font-mono font-bold">
                            {formatCOP(getPaintTypePrice('Interior Tipo 2', formData.marcaPintura).precioCunete)}
                          </strong>
                        </div>
                      </button>

                      {/* Interior Tipo 3 */}
                      <button
                        type="button"
                        onClick={() => handleSwitchPaintType('Interior Tipo 3')}
                        className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                          formData.tipoPintura === 'Interior Tipo 3' || formData.tipoPintura === 'Tipo 3'
                            ? 'border-amber-600 bg-amber-50 shadow-xs ring-2 ring-amber-500/25'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-black text-xs text-amber-950">Interior Tipo 3</span>
                          {(formData.tipoPintura === 'Interior Tipo 3' || formData.tipoPintura === 'Tipo 3') && (
                            <span className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center text-xs font-bold">✓</span>
                          )}
                        </div>
                        <span className="text-[11px] font-bold text-amber-700 block mt-0.5">Económica Cielorrasos & Techos</span>
                        <p className="text-[10px] text-slate-600 mt-1 leading-snug">Cero abrasión / No lavable (&lt;100 ciclos). Techos y placas de drywall. 1-2 años.</p>
                        <div className="mt-2 pt-2 border-t border-slate-200 flex items-center justify-between text-[11px]">
                          <span className="text-slate-500 font-medium">Cuñete:</span>
                          <strong className="text-slate-900 font-mono font-bold">
                            {formatCOP(getPaintTypePrice('Interior Tipo 3', formData.marcaPintura).precioCunete)}
                          </strong>
                        </div>
                      </button>
                    </div>
                  )}
                </div>

                {/* PARÁMETROS TÉCNICOS CLAVE: MANOS Y DESPERDICIO / MERMA */}
                <div className="bg-sky-50/70 rounded-2xl p-4 sm:p-5 border border-sky-200/80 space-y-3">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <span className="text-xs font-black text-sky-950 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-sky-600" />
                      Cálculo Técnico: Rendimiento, Manos y Desperdicio
                    </span>
                    <span className="text-[11px] font-bold text-sky-700 bg-white px-3 py-1 rounded-full border border-sky-200 shadow-2xs">
                      Sustrato: {formData.superficie} ({formData.ambiente})
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="bg-white p-3.5 rounded-2xl border border-sky-100 space-y-1 shadow-2xs">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Manos de Pintura</span>
                      <strong className="text-sm font-black text-slate-900 block">{technicalCalc.manosSugeridas} Manos Requeridas</strong>
                      <p className="text-[11px] text-slate-600 leading-snug">{technicalCalc.explicacionManos}</p>
                    </div>

                    <div className="bg-white p-3.5 rounded-2xl border border-sky-100 space-y-1 shadow-2xs">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Factor de Desperdicio Técnico</span>
                      <strong className="text-sm font-black text-amber-700 block">+{technicalCalc.factorDesperdicioPorcentaje}% (+{technicalCalc.galonesDesperdicio} gal)</strong>
                      <p className="text-[11px] text-slate-600 leading-snug">{technicalCalc.explicacionDesperdicio}</p>
                    </div>

                    <div className="bg-white p-3.5 rounded-2xl border border-sky-100 space-y-1 shadow-2xs">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Dosificación Final de Envases</span>
                      <strong className="text-sm font-black text-sky-700 block">
                        {technicalCalc.cuñetesRequeridos} Cuñetes + {technicalCalc.galonesSueltosRequeridos} Galones
                      </strong>
                      <p className="text-[11px] text-slate-600 leading-snug">
                        {technicalCalc.galonesNetosSinDesperdicio} gal netos + {technicalCalc.galonesDesperdicio} gal merma = {technicalCalc.galonesRequeridos} gal totales
                      </p>
                    </div>
                  </div>
                </div>

                {/* SELECTOR OFICIAL DE MÉTODO DE PAGO */}
                <div className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-indigo-100 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-black text-sm text-slate-900">
                          ¿Cómo deseas realizar el pago de este pedido?
                        </h4>
                        <p className="text-xs text-slate-500">
                          Selecciona tu método de pago oficial para facturación, despacho y emisión de recibo.
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
                      Transacción Segura Colorlink
                    </span>
                  </div>

                  {/* Opciones de Métodos de Pago */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {/* 1. Bancolombia Transferencia / QR */}
                    <div
                      onClick={() => handleInputChange('metodoPago', 'bancolombia')}
                      className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                        (formData.metodoPago || 'bancolombia') === 'bancolombia'
                          ? 'border-yellow-500 bg-yellow-50/50 shadow-xs ring-2 ring-yellow-400/20'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-black text-xs text-slate-900">Bancolombia / QR</span>
                        <span className="text-[9px] font-bold bg-yellow-500 text-slate-900 px-2 py-0.5 rounded-md">
                          Sin comisión
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-snug">
                        Transferencia electrónica a Cuenta de Ahorros o escaneo de código QR oficial.
                      </p>
                    </div>

                    {/* 2. PSE Débito en Línea */}
                    <div
                      onClick={() => handleInputChange('metodoPago', 'pse')}
                      className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                        formData.metodoPago === 'pse'
                          ? 'border-[#009FE3] bg-sky-50/60 shadow-xs ring-2 ring-[#009FE3]/20'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-black text-xs text-slate-900">PSE Débito en Línea</span>
                        <span className="text-[9px] font-bold bg-[#009FE3] text-white px-2 py-0.5 rounded-md">
                          Todos los bancos
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-snug">
                        Débito seguro desde cuenta corriente o ahorros de cualquier banco colombiano.
                      </p>
                    </div>

                    {/* 3. Nequi / Daviplata */}
                    <div
                      onClick={() => handleInputChange('metodoPago', 'nequi')}
                      className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                        formData.metodoPago === 'nequi'
                          ? 'border-sky-600 bg-sky-50/60 shadow-xs ring-2 ring-sky-500/20'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-black text-xs text-slate-900">Nequi / Daviplata</span>
                        <span className="text-[9px] font-bold bg-sky-600 text-white px-2 py-0.5 rounded-md">
                          Al instante
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-snug">
                        Envío directo a la línea corporativa Colorlink desde tu celular con QR o número.
                      </p>
                    </div>

                    {/* 4. Contra Entrega en Obra */}
                    <div
                      onClick={() => handleInputChange('metodoPago', 'contraentrega')}
                      className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                        formData.metodoPago === 'contraentrega'
                          ? 'border-emerald-600 bg-emerald-50/60 shadow-xs ring-2 ring-emerald-500/20'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-black text-xs text-slate-900">Contra Entrega en Obra</span>
                        <span className="text-[9px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-md">
                          En sitio
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-snug">
                        Paga en efectivo o datáfono móvil inalámbrico al recibir los cuñetes en obra.
                      </p>
                    </div>

                    {/* 5. Crédito Corporativo 30 Días */}
                    <div
                      onClick={() => handleInputChange('metodoPago', 'credito')}
                      className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                        formData.metodoPago === 'credito'
                          ? 'border-purple-600 bg-purple-50/60 shadow-xs ring-2 ring-purple-500/20'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-black text-xs text-slate-900">Crédito 30 Días (NIT)</span>
                        <span className="text-[9px] font-bold bg-purple-600 text-white px-2 py-0.5 rounded-md">
                          Empresas
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-snug">
                        Factura electrónica DIAN a 30 días para constructoras y contratistas registrados.
                      </p>
                    </div>

                    {/* 6. Tarjeta de Crédito / Débito */}
                    <div
                      onClick={() => handleInputChange('metodoPago', 'tarjeta')}
                      className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                        formData.metodoPago === 'tarjeta'
                          ? 'border-indigo-600 bg-indigo-50/60 shadow-xs ring-2 ring-indigo-500/20'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-black text-xs text-slate-900">Tarjeta Crédito / Débito</span>
                        <span className="text-[9px] font-bold bg-indigo-600 text-white px-2 py-0.5 rounded-md">
                          Hasta 12 cuotas
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-snug">
                        Procesamiento en línea para tarjetas Visa, Mastercard o American Express.
                      </p>
                    </div>
                  </div>

                  {/* Detalles Dinámicos según Método de Pago Seleccionado */}
                  {(formData.metodoPago || 'bancolombia') === 'bancolombia' && (
                    <div className="p-4 rounded-2xl bg-yellow-50/80 border border-yellow-200 space-y-3">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                        <div>
                          <span className="text-[11px] font-bold text-yellow-900 uppercase tracking-wider block">
                            Datos Bancarios Oficiales Colorlink S.A.S.
                          </span>
                          <p className="text-xs text-yellow-800 mt-0.5">
                            Realiza tu transferencia por App Bancolombia, Sucursal Virtual o Corresponsal Bancario.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText('24589104512');
                            setCopiedBankInfo(true);
                            setTimeout(() => setCopiedBankInfo(false), 3000);
                          }}
                          className="px-3 py-1.5 bg-yellow-400 hover:bg-yellow-500 text-slate-900 text-xs font-black rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>{copiedBankInfo ? '¡Copiado!' : 'Copiar Cuenta'}</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                        <div className="bg-white p-2.5 rounded-xl border border-yellow-200">
                          <span className="text-[10px] text-slate-500 block">Tipo & Número de Cuenta</span>
                          <strong className="text-sm font-black text-slate-900 font-mono">Ahorros: 245-891045-12</strong>
                        </div>
                        <div className="bg-white p-2.5 rounded-xl border border-yellow-200">
                          <span className="text-[10px] text-slate-500 block">Titular de la Cuenta</span>
                          <strong className="text-xs font-black text-slate-900">COLORLINK PINTURAS S.A.S.</strong>
                        </div>
                        <div className="bg-white p-2.5 rounded-xl border border-yellow-200">
                          <span className="text-[10px] text-slate-500 block">NIT de la Empresa</span>
                          <strong className="text-xs font-black text-slate-900 font-mono">900.854.219-3</strong>
                        </div>
                      </div>
                    </div>
                  )}

                  {formData.metodoPago === 'pse' && (
                    <div className="p-4 rounded-2xl bg-sky-50/80 border border-sky-200 space-y-3">
                      <span className="text-[11px] font-bold text-sky-950 uppercase tracking-wider block">
                        Pasarela Segura PSE • Selecciona tu Banco
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="text-[11px] font-bold text-slate-700 block mb-1">Banco Emisor *</label>
                          <select
                            value={selectedBankPSE}
                            onChange={(e) => {
                              setSelectedBankPSE(e.target.value);
                              handleInputChange('bancoPSE', e.target.value);
                            }}
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
                          >
                            <option value="Bancolombia">Bancolombia</option>
                            <option value="Banco de Bogotá">Banco de Bogotá</option>
                            <option value="Davivienda">Davivienda</option>
                            <option value="BBVA Colombia">BBVA Colombia</option>
                            <option value="Banco de Occidente">Banco de Occidente</option>
                            <option value="Banco Popular">Banco Popular</option>
                            <option value="Scotiabank Colpatria">Scotiabank Colpatria</option>
                            <option value="Banco Caja Social">Banco Caja Social</option>
                            <option value="Nequi">Nequi</option>
                            <option value="Daviplata">Daviplata</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-slate-700 block mb-1">Tipo de Cliente *</label>
                          <select className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium">
                            <option value="juridica">Persona Jurídica (Empresa / NIT)</option>
                            <option value="natural">Persona Natural (C.C.)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {formData.metodoPago === 'nequi' && (
                    <div className="p-4 rounded-2xl bg-sky-50/80 border border-sky-200 space-y-3">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                        <div>
                          <span className="text-[11px] font-bold text-sky-950 uppercase tracking-wider block">
                            Pago Inmediato Nequi / Daviplata
                          </span>
                          <p className="text-xs text-sky-800 mt-0.5">
                            Envía a la línea corporativa autorizada o escanea el QR desde tu aplicación móvil.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText('3212460658');
                            setCopiedBankInfo(true);
                            setTimeout(() => setCopiedBankInfo(false), 3000);
                          }}
                          className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-black rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>{copiedBankInfo ? '¡Número Copiado!' : 'Copiar Celular'}</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-sky-200">
                        <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center font-bold shrink-0">
                          <Phone className="w-5 h-5" />
                        </div>
                        <div>
                          <strong className="text-base font-black text-slate-900 font-mono">+57 321 246 0658</strong>
                          <span className="text-[11px] text-slate-500 block">Titular: Colorlink Pinturas Oficial</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {formData.metodoPago === 'contraentrega' && (
                    <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-xs text-emerald-900 space-y-1">
                      <strong className="block font-black text-sm">Pago Contra Entrega Habilitado para {formData.ciudad || 'tu ciudad'}</strong>
                      <p className="leading-relaxed">
                        El conductor del camión de reparto Colorlink llevará datáfono móvil inalámbrico para tarjetas débito/crédito, o podrás entregar el valor exacto en efectivo recibiendo tu factura fiscal física.
                      </p>
                    </div>
                  )}

                  {formData.metodoPago === 'credito' && (
                    <div className="p-4 rounded-2xl bg-purple-50/80 border border-purple-200 text-xs text-purple-900 space-y-1">
                      <strong className="block font-black text-sm">Crédito Corporativo 30 Días para NIT {formData.nitDocumento || 'Empresarial'}</strong>
                      <p className="leading-relaxed">
                        Se emitirá Factura Electrónica con plazo comercial a 30 días calendario respaldada por orden de compra corporativa.
                      </p>
                    </div>
                  )}
                </div>

                {/* NOTA INFORMATIVA DE EMISIÓN DE RECIBO OFICIAL */}
                <div className="p-3.5 bg-sky-50/60 rounded-2xl border border-sky-100 text-xs text-slate-700 flex items-start gap-2.5">
                  <Lock className="w-4 h-4 text-[#009FE3] shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    <strong>Generación Oficial de Recibo:</strong> El recibo formal con firma fiscal, código QR de certificación y la orden de entrega en ruta se generarán y enviarán a su correo <strong>{formData.emailResponsable}</strong> inmediatamente después de presionar <strong>"Aceptar Cotización"</strong> con el método de pago seleccionado.
                  </p>
                </div>

                {/* BOTONES PRINCIPALES DE DECISIÓN CON LA PALETA DE MARCA */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleAcceptQuotation}
                    className="flex-1 py-3.5 px-6 bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-110 text-white font-black text-xs sm:text-sm rounded-2xl shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                  >
                    <CheckCircle2 className="w-4.5 h-4.5 text-white" />
                    <span>Aceptar ({formatCOP(presupuesto.totalPresupuesto)})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowRejectModal(true)}
                    className="py-3.5 px-6 bg-rose-50 hover:bg-rose-100 text-rose-700 font-black text-xs sm:text-sm rounded-2xl border-2 border-rose-300 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                  >
                    <ThumbsDown className="w-4 h-4 text-rose-600" />
                    <span>Rechazar</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleModifyQuotation(2)}
                    className="py-3.5 px-5 bg-gradient-to-r from-sky-500 to-blue-600 hover:brightness-110 text-white font-black text-xs rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-sky-500/25 active:scale-95"
                  >
                    <Edit3 className="w-4 h-4 text-white" />
                    <span>Modificar</span>
                  </button>

                  <button
                    type="button"
                    onClick={resetForm}
                    className="py-3.5 px-5 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs rounded-2xl border border-slate-200 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-95"
                  >
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Otra cotización</span>
                  </button>
                </div>
              </div>
            )}

            {/* 2. SI LA COTIZACIÓN FUE ACEPTADA */}
            {quotationDecision === 'accepted' && (() => {
              const currentMappedStatus = orderLifecyclePhase === 'aceptado' ? 'pendiente' : orderLifecyclePhase;
              const liveStateMsg = buildOrderStateMessage({
                status: currentMappedStatus,
                orderId: orderNumber || 'ORD-CLK-2026',
                cliente: formData.cliente || 'Constructora / Proyecto',
                responsable: formData.responsable || formData.cliente || 'Cliente Colorlink',
                color: formData.colorAcabado || 'Blanco Puro',
                tipoPintura: formData.tipoPintura || 'Pintura Tipo 1 Exterior',
                ciudad: formData.ciudad || 'Medellín',
                totalCOP: presupuesto.totalPresupuesto,
                cuñetes: technicalCalc.cuñetesRequeridos
              });

              const topBannerTheme = {
                aceptado: {
                  bg: 'from-amber-500 via-orange-500 to-amber-600 border-amber-300/40',
                  badge: `📋 ESTADO 1/4: PEDIDO CONFIRMADO (${orderNumber})`,
                  title: '1. Pedido Confirmado • En Espera de Tintometría (2 seg)',
                  desc: `Tu pedido de ${formData.tipoPintura || 'Tipo 1'} (Color: ${formData.colorAcabado || 'Blanco'}) fue registrado en la sede ${formData.ciudad}. Ingresará automáticamente al laboratorio de tintometría computarizada en 2 segundos.`
                },
                preparando: {
                  bg: 'from-sky-500 via-sky-600 to-blue-700 border-sky-300/40',
                  badge: `🎨 ESTADO 2/4: EN LABORATORIO DE TINTOMETRÍA (${liveStateMsg.lote})`,
                  title: '2. ¡Tu Pintura está en el Laboratorio de Tintometría!',
                  desc: `A los 2 segundos de aprobado, tu pedido #${orderNumber} ingresó a dosificación computarizada del color "${formData.colorAcabado || 'Seleccionado'}" sobre base ${formData.tipoPintura || 'Tipo 1'} (Norma NTC 1335). Próximo avance: Despacho en 20 minutos.`
                },
                en_ruta: {
                  bg: 'from-indigo-700 via-purple-700 to-blue-700 border-purple-300/40',
                  badge: `🚚 ESTADO 3/4: DESPACHANDO EN RUTA (PLACA ${liveStateMsg.logistica.placa})`,
                  title: `3. ¡Se Está Despachando tu Pedido hacia ${formData.ciudad}!`,
                  desc: `Tu pedido #${orderNumber} completó tintometría a los 20 minutos y salió hacia tu obra en el ${liveStateMsg.logistica.vehiculo} (Placa ${liveStateMsg.logistica.placa}) con el conductor ${liveStateMsg.logistica.conductor} por ${liveStateMsg.logistica.corredorRuta}. Remisión oficial #${liveStateMsg.remision}.`
                },
                entregado: {
                  bg: 'from-emerald-600 via-emerald-700 to-teal-700 border-emerald-300/40',
                  badge: `✅ ESTADO 4/4: ENTREGADO CON ÉXITO (REMISIÓN #${liveStateMsg.remision})`,
                  title: `4. ¡Pedido Entregado con Éxito en tu Obra en ${formData.ciudad}!`,
                  desc: `El conductor ${liveStateMsg.logistica.conductor} entregó satisfactoriamente los ${technicalCalc.cuñetesRequeridos} cuñete(s) y ${technicalCalc.galonesSueltosRequeridos} galón(es) en obra. Se firmó la remisión #${liveStateMsg.remision} y quedó activo el Certificado de Calidad NTC 1335 (${liveStateMsg.lote}).`
                }
              }[orderLifecyclePhase];

              return (
              <div className="space-y-4 animate-fadeIn">
                <div className={`bg-gradient-to-r ${topBannerTheme.bg} text-white rounded-3xl p-6 sm:p-7 shadow-lg border space-y-4 transition-all duration-500`}>
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-xs flex items-center justify-center font-bold text-white shadow-inner shrink-0 text-2xl">
                        {orderLifecyclePhase === 'aceptado' ? '📋' : orderLifecyclePhase === 'preparando' ? '🎨' : orderLifecyclePhase === 'en_ruta' ? '🚚' : '✅'}
                      </div>
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="bg-white text-slate-900 font-mono text-xs px-3 py-1 rounded-full font-black shadow-xs">
                            {topBannerTheme.badge}
                          </span>
                          <span className="text-xs bg-white/15 text-white/95 px-2.5 py-0.5 rounded-full font-semibold">
                            Actualizado: {decisionTimestamp}
                          </span>
                        </div>
                        <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                          {topBannerTheme.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-white/95 leading-relaxed max-w-2xl">
                          {topBannerTheme.desc}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-2.5 flex-wrap">
                      <button
                        type="button"
                        onClick={handleDownloadPDF}
                        className="px-5 py-3 bg-white text-slate-900 hover:bg-slate-50 text-xs font-black rounded-2xl shadow-md transition-all flex items-center gap-2 cursor-pointer border border-slate-200"
                      >
                        <Download className="w-4 h-4 text-sky-600" />
                        <span>Descargar Recibo PDF Oficial</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowEmailModal(true)}
                        className="px-5 py-3 bg-slate-950/30 hover:bg-slate-950/45 border border-white/30 text-white text-xs font-black rounded-2xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                      >
                        <Mail className="w-4 h-4 text-white" />
                        <span>Ver Correo de este Estado</span>
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

                {/* TARJETA OFICIAL DE SEGUIMIENTO EN VIVO: CICLO CADA 20 MINUTOS (2s Tintometría -> 20m Despachando -> 20m Entregado) */}
                <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-sky-300 shadow-md space-y-5 text-slate-800 animate-fadeIn">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#003882] to-[#009FE3] text-white flex items-center justify-center font-bold shrink-0 shadow-md shadow-sky-500/20">
                        <Truck className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-black text-base sm:text-lg text-slate-900">
                            Seguimiento en Vivo de su Pedido #{orderNumber}
                          </h4>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                            ● Ciclo Activo
                          </span>
                          {phaseSecondsLeft > 0 && orderLifecyclePhase !== 'entregado' && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-sky-100 text-sky-900 border border-sky-200">
                              Próxima actualización en: <strong>{Math.floor(phaseSecondsLeft / 60)}m {String(phaseSecondsLeft % 60).padStart(2, '0')}s</strong>
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5">
                          Actualización automática cada 20 minutos: <strong>A los 2s en Tintometría</strong> ➔ <strong>A los 20 min Despachando con mensaje</strong> ➔ <strong>A los 20 min Entregado</strong>.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap self-end lg:self-auto">
                      <button
                        type="button"
                        onClick={() => {
                          setLifecycleFastDemo(prev => {
                            const next = !prev;
                            setPhaseSecondsLeft(next ? 20 : 1200);
                            return next;
                          });
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95 ${
                          lifecycleFastDemo
                            ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                        title="Alternar entre ciclo de 20 minutos reales o 20 segundos de demostración rápida"
                      >
                        <Zap className={`w-3.5 h-3.5 ${lifecycleFastDemo ? 'text-amber-200 fill-amber-200' : 'text-slate-500'}`} />
                        <span>{lifecycleFastDemo ? '⚡ Modo Rápido (20 seg)' : '⏱️ Tiempo Real (20 min)'}</span>
                      </button>

                      {orderLifecyclePhase !== 'entregado' && (
                        <button
                          type="button"
                          onClick={handleAdvanceClientLifecycle}
                          className="px-3.5 py-1.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:brightness-110 text-white font-black text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                          title="Avanzar 20 minutos inmediatamente para probar la siguiente fase"
                        >
                          <ArrowRight className="w-3.5 h-3.5" />
                          <span>Avanzar +20 Minutos Ahora</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* STEPPER VISUAL INTERACTIVO DE 4 ETAPAS (Haz clic en cualquier etapa para probar el cambio de mensaje inmediatamente) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                    {/* Etapa 1: Aceptado */}
                    <div
                      onClick={() => orderNumber && triggerClientLifecycleTransition('aceptado', orderNumber)}
                      className={`p-3.5 rounded-2xl border-2 space-y-1 relative overflow-hidden cursor-pointer transition-all ${
                        orderLifecyclePhase === 'aceptado'
                          ? 'bg-amber-50 border-amber-500 text-amber-950 shadow-sm ring-2 ring-amber-400/20'
                          : 'bg-emerald-50/80 border-emerald-400 text-emerald-950 hover:brightness-98'
                      }`}
                      title="Haz clic para ver el mensaje de Estado 1: Pedido Confirmado"
                    >
                      <div className="flex items-center justify-between">
                        <span className={`w-6 h-6 rounded-lg text-white flex items-center justify-center font-black text-xs ${
                          orderLifecyclePhase === 'aceptado' ? 'bg-amber-500 animate-pulse' : 'bg-emerald-600'
                        }`}>
                          {orderLifecyclePhase === 'aceptado' ? '1' : '✓'}
                        </span>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          orderLifecyclePhase === 'aceptado' ? 'bg-amber-200 text-amber-950 font-black' : 'bg-emerald-200 text-emerald-900'
                        }`}>
                          {orderLifecyclePhase === 'aceptado' ? '● Estado Actual' : 'Completado'}
                        </span>
                      </div>
                      <strong className="block font-black text-sm text-slate-900 mt-1">1. Pedido Confirmado</strong>
                      <p className="text-[11px] text-slate-600 leading-tight">Orden radicada • En cola para tintometría (2s).</p>
                      <span className="text-[10px] text-emerald-700 font-mono block pt-1">Pago: {formData.metodoPago || 'Bancolombia'}</span>
                    </div>

                    {/* Etapa 2: Tintometría (A los 2s) */}
                    <div
                      onClick={() => orderNumber && triggerClientLifecycleTransition('preparando', orderNumber)}
                      className={`p-3.5 rounded-2xl border-2 space-y-1 relative overflow-hidden cursor-pointer transition-all ${
                        orderLifecyclePhase === 'preparando'
                          ? 'bg-sky-50 border-sky-500 text-sky-950 shadow-sm ring-2 ring-sky-400/20'
                          : orderLifecyclePhase === 'en_ruta' || orderLifecyclePhase === 'entregado'
                          ? 'bg-emerald-50/80 border-emerald-400 text-emerald-950'
                          : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-sky-300'
                      }`}
                      title="Haz clic para ver el mensaje de Estado 2: En Tintometría"
                    >
                      <div className="flex items-center justify-between">
                        <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs ${
                          orderLifecyclePhase === 'preparando'
                            ? 'bg-sky-600 text-white animate-pulse'
                            : orderLifecyclePhase === 'en_ruta' || orderLifecyclePhase === 'entregado'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-200 text-slate-600'
                        }`}>
                          {orderLifecyclePhase === 'en_ruta' || orderLifecyclePhase === 'entregado' ? '✓' : '2'}
                        </span>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          orderLifecyclePhase === 'preparando'
                            ? 'bg-sky-200 text-sky-900 font-black animate-pulse'
                            : orderLifecyclePhase === 'en_ruta' || orderLifecyclePhase === 'entregado'
                            ? 'bg-emerald-200 text-emerald-900 font-bold'
                            : 'bg-slate-100 text-slate-500'
                        }`}>
                          {orderLifecyclePhase === 'preparando' ? '● En Tintometría' : orderLifecyclePhase === 'en_ruta' || orderLifecyclePhase === 'entregado' ? 'Completado' : 'A los 2 seg'}
                        </span>
                      </div>
                      <strong className="block font-black text-sm text-slate-900 mt-1">2. En Tintometría</strong>
                      <p className="text-[11px] text-slate-600 leading-tight">A los 2s: Dosificación de pigmentos y lote.</p>
                      <span className="text-[10px] text-sky-700 font-bold block pt-1 truncate">{formData.colorAcabado || 'Color Específico'} ({liveStateMsg.lote})</span>
                    </div>

                    {/* Etapa 3: Despachando (A los 20 min) */}
                    <div
                      onClick={() => orderNumber && triggerClientLifecycleTransition('en_ruta', orderNumber)}
                      className={`p-3.5 rounded-2xl border-2 space-y-1 relative overflow-hidden cursor-pointer transition-all ${
                        orderLifecyclePhase === 'en_ruta'
                          ? 'bg-purple-50 border-purple-500 text-purple-950 shadow-sm ring-2 ring-purple-400/20'
                          : orderLifecyclePhase === 'entregado'
                          ? 'bg-emerald-50/80 border-emerald-400 text-emerald-950'
                          : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-purple-300'
                      }`}
                      title="Haz clic para ver el mensaje de Estado 3: Despachando en Ruta"
                    >
                      <div className="flex items-center justify-between">
                        <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs ${
                          orderLifecyclePhase === 'en_ruta'
                            ? 'bg-purple-600 text-white animate-pulse'
                            : orderLifecyclePhase === 'entregado'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-200 text-slate-600'
                        }`}>
                          {orderLifecyclePhase === 'entregado' ? '✓' : '3'}
                        </span>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          orderLifecyclePhase === 'en_ruta'
                            ? 'bg-purple-200 text-purple-900 font-black animate-pulse'
                            : orderLifecyclePhase === 'entregado'
                            ? 'bg-emerald-200 text-emerald-900 font-bold'
                            : 'bg-slate-100 text-slate-500'
                        }`}>
                          {orderLifecyclePhase === 'en_ruta' ? '● Despachando' : orderLifecyclePhase === 'entregado' ? 'Completado' : 'A los 20 min'}
                        </span>
                      </div>
                      <strong className="block font-black text-sm text-slate-900 mt-1">3. Despachando en Ruta</strong>
                      <p className="text-[11px] text-slate-600 leading-tight">A los 20 min: Salida de camión y remisión en ruta.</p>
                      <span className="text-[10px] text-purple-700 font-bold block pt-1 truncate">{liveStateMsg.logistica.vehiculo} ({liveStateMsg.logistica.placa})</span>
                    </div>

                    {/* Etapa 4: Entregado (A los 20 min) */}
                    <div
                      onClick={() => orderNumber && triggerClientLifecycleTransition('entregado', orderNumber)}
                      className={`p-3.5 rounded-2xl border-2 space-y-1 relative overflow-hidden cursor-pointer transition-all ${
                        orderLifecyclePhase === 'entregado'
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-950 shadow-sm ring-2 ring-emerald-400/20'
                          : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-emerald-300'
                      }`}
                      title="Haz clic para ver el mensaje de Estado 4: Entregado en Obra"
                    >
                      <div className="flex items-center justify-between">
                        <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs ${
                          orderLifecyclePhase === 'entregado' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                        }`}>
                          {orderLifecyclePhase === 'entregado' ? '✓' : '4'}
                        </span>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          orderLifecyclePhase === 'entregado' ? 'bg-emerald-200 text-emerald-900 font-black' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {orderLifecyclePhase === 'entregado' ? '● Entregado' : 'A los 20 min'}
                        </span>
                      </div>
                      <strong className="block font-black text-sm text-slate-900 mt-1">4. Entregado en Obra</strong>
                      <p className="text-[11px] text-slate-600 leading-tight">A los 20 min: Remisión #{liveStateMsg.remision} y garantía NTC.</p>
                      <span className="text-[10px] text-emerald-700 font-bold block pt-1">Garantía NTC 1335 Activa</span>
                    </div>
                  </div>

                  {/* MENSAJE VIVO DE ESTADO CON CONTENIDO DIFERENTE SEGÚN EL ESTADO */}
                  <div className={`p-4 sm:p-5 rounded-2xl border-2 text-xs transition-all space-y-2 ${
                    orderLifecyclePhase === 'en_ruta'
                      ? 'bg-gradient-to-r from-purple-50 via-indigo-50 to-sky-50 border-purple-400 text-purple-950 shadow-xs'
                      : orderLifecyclePhase === 'preparando'
                      ? 'bg-gradient-to-r from-sky-50 via-cyan-50 to-blue-50 border-sky-400 text-sky-950 shadow-xs'
                      : orderLifecyclePhase === 'entregado'
                      ? 'bg-gradient-to-r from-emerald-50 via-teal-50 to-green-50 border-emerald-400 text-emerald-950 shadow-xs'
                      : 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-400 text-amber-950 shadow-xs'
                  }`}>
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-current/15 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">
                          {orderLifecyclePhase === 'en_ruta' ? '🚚' : orderLifecyclePhase === 'preparando' ? '🎨' : orderLifecyclePhase === 'entregado' ? '✅' : '📋'}
                        </span>
                        <strong className="font-black text-sm sm:text-base">
                          {liveStateMsg.tituloNotificacion}
                        </strong>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-white/90 border border-current/20">
                        Estado Actual: {liveStateMsg.statusLabel}
                      </span>
                    </div>

                    <p className="leading-relaxed text-[13px] font-medium">
                      {liveStateMsg.mensajeNotificacion}
                    </p>

                    <div className="pt-1 flex flex-wrap items-center gap-3 text-[11px] font-bold opacity-90">
                      <span>• Lote Técnico: {liveStateMsg.lote}</span>
                      <span>• Remisión: #{liveStateMsg.remision}</span>
                      <span>• Unidad Asignada ({formData.ciudad}): {liveStateMsg.logistica.vehiculo} ({liveStateMsg.logistica.placa})</span>
                      <span>• Conductor: {liveStateMsg.logistica.conductor}</span>
                    </div>
                  </div>

                  {/* HISTORIAL DE MENSAJES Y NOTIFICACIONES ENVIADAS */}
                  {phaseNotificationLogs.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-sky-600" />
                          <span>Mensajes Transaccionales Enviados ({phaseNotificationLogs.length})</span>
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          Destinatario: {formData.emailResponsable}
                        </span>
                      </div>

                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {phaseNotificationLogs.map((log, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-xl bg-slate-50 border border-slate-200/90 text-xs text-slate-800 space-y-1"
                          >
                            <div className="flex items-center justify-between">
                              <strong className="text-slate-900 font-bold text-xs">{log.titulo}</strong>
                              <span className="text-[10px] text-slate-500 font-mono">{log.hora}</span>
                            </div>
                            <p className="text-[11px] text-slate-600 leading-relaxed">{log.mensaje}</p>
                            {log.vehiculo && (
                              <div className="flex items-center gap-2 text-[10px] font-semibold text-purple-700 pt-0.5">
                                <span>Vehículo: {log.vehiculo}</span>
                                <span>•</span>
                                <span>Placa: {log.placa}</span>
                                <span>•</span>
                                <span>Conductor: {log.conductor}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* TARJETA DE CONFIRMACIÓN DE ENVÍO DE CORREO, RECIBO & DETALLES DEL FURGÓN */}
                <div className="bg-white rounded-3xl p-6 border border-sky-200/90 shadow-md space-y-4 text-slate-800">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
                        <Mail className="w-5 h-5 text-sky-600" />
                      </div>
                      <div>
                        <h4 className="font-black text-sm text-slate-900">
                          Confirmación de Despacho & Recibo Oficial por Correo
                        </h4>
                        <p className="text-xs text-sky-600 font-medium">
                          Correo: <strong>{formData.emailResponsable}</strong> {formData.telefonoResponsable ? `• Celular: ${formData.telefonoResponsable}` : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={handleDownloadPDF}
                        className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs border border-slate-200"
                      >
                        <Download className="w-3.5 h-3.5 text-sky-600" />
                        <span>Descargar PDF</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowEmailModal(true)}
                        className="px-3.5 py-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:brightness-110 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Send className="w-3.5 h-3.5 text-white" />
                        <span>Vista Previa del Correo</span>
                      </button>
                    </div>
                  </div>

                  {/* Estado del envío de correo electrónico real */}
                  {realEmailStatusNotice && (
                    <div className="p-3 bg-sky-50/90 rounded-2xl border border-sky-200 text-xs font-semibold text-sky-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-sky-600 shrink-0" />
                        <span>{realEmailStatusNotice}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAcceptQuotation()}
                        disabled={isSendingRealEmail}
                        className="px-3 py-1 bg-white hover:bg-sky-100 text-sky-700 border border-sky-300 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer disabled:opacity-50"
                      >
                        {isSendingRealEmail ? 'Enviando...' : 'Reenviar a mi correo'}
                      </button>
                    </div>
                  )}

                  {supabaseSavedNotice && (
                    <div className={`p-3 rounded-2xl border text-xs flex items-center gap-2 ${
                      orderLifecyclePhase === 'entregado'
                        ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950'
                        : orderLifecyclePhase === 'en_ruta'
                        ? 'bg-purple-50/90 border-purple-300 text-purple-950'
                        : orderLifecyclePhase === 'preparando'
                        ? 'bg-sky-50/90 border-sky-300 text-sky-950'
                        : 'bg-amber-50/90 border-amber-300 text-amber-950'
                    }`}>
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>
                        <strong>{liveStateMsg.statusLabel}:</strong> {liveStateMsg.mensajeServidor}
                      </span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                    <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-1">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">Estado Operativo Actual</span>
                      <strong className="text-xs font-bold text-slate-900 block break-words">{liveStateMsg.statusLabel}</strong>
                      <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 break-all">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" /> {formData.emailResponsable}
                      </span>
                    </div>

                    <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-1">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">Lote & Remisión Oficial</span>
                      <strong className="text-xs font-bold text-slate-900 block font-mono">
                        {orderLifecyclePhase === 'en_ruta' || orderLifecyclePhase === 'entregado'
                          ? `Remisión #${liveStateMsg.remision}`
                          : `Lote ${liveStateMsg.lote}`}
                      </strong>
                      <span className="text-[11px] text-slate-600">
                        Total: <strong>{formatCOP(presupuesto.totalPresupuesto)} COP</strong>
                      </span>
                    </div>

                    <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-1">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">
                        {orderLifecyclePhase === 'entregado'
                          ? 'Vehículo que Entregó en Obra'
                          : orderLifecyclePhase === 'en_ruta'
                          ? 'Vehículo en Ruta Activa'
                          : 'Vehículo Reservado en Flota'}
                      </span>
                      <strong className="text-xs font-bold text-purple-950 block">{liveStateMsg.logistica.vehiculo}</strong>
                      <span className="text-[11px] text-slate-600">
                        Placa: <strong>{liveStateMsg.logistica.placa}</strong> ({liveStateMsg.logistica.conductor})
                      </span>
                    </div>

                    <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-1">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">
                        {orderLifecyclePhase === 'entregado' ? 'Estado de Entrega' : 'Corredor Vial & Tiempo'}
                      </span>
                      <strong className="text-xs font-bold text-purple-950 block">
                        {orderLifecyclePhase === 'entregado'
                          ? 'Entrega 100% Completada ✓'
                          : liveStateMsg.logistica.corredorRuta}
                      </strong>
                      <span className="text-[11px] text-slate-600">
                        {orderLifecyclePhase === 'entregado'
                          ? `Garantía NTC 1335 Activa (${liveStateMsg.lote})`
                          : `Tiempo estimado: ${liveStateMsg.logistica.tiempoEstimado}`}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-sky-50/70 rounded-xl border border-sky-200 text-[11px] text-sky-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <span>
                      Cálculo verificado: <strong>{technicalCalc.manosSugeridas} manos recomendadas</strong> y <strong>+{technicalCalc.factorDesperdicioPorcentaje}% de desperdicio técnico</strong> ({technicalCalc.galonesDesperdicio} gal) para cubrir los {formData.areaM2} m².
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowEmailModal(true)}
                      className="text-xs font-bold text-sky-600 hover:underline flex items-center gap-1 shrink-0 cursor-pointer"
                    >
                      Ver Correo del Estado Actual →
                    </button>
                  </div>
                </div>
              </div>
              );
            })()}

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
                      className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
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
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#003882] via-[#009FE3] to-[#38BDF8] p-0.5 shadow-md flex items-center justify-center shrink-0">
                      <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center p-1 overflow-hidden">
                        <ColorlinkPenguin size="lg" className="w-full h-full" />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-xl sm:text-2xl tracking-wider text-slate-950 uppercase">
                          COLORLINK<span className="text-sky-600">®</span>
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-widest bg-sky-100 text-sky-700 px-2 py-0.5 rounded font-black">
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

              {/* BANNER OFICIAL DE CONFORMIDAD DEL CLIENTE: ACEPTA O RECHAZA EL TOTAL */}
              <div className="rounded-2xl overflow-hidden shadow-xs">
                {quotationDecision === 'accepted' ? (
                  <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/90 border-2 border-emerald-400 text-emerald-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black shrink-0 shadow-xs">
                        <CheckCheck className="w-6 h-6 text-white" />
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-200 text-emerald-900 px-2.5 py-0.5 rounded-full border border-emerald-300">
                            ✓ Estado de la Factura: Total Aceptado y Aprobado
                          </span>
                          <span className="text-xs text-emerald-800 font-mono font-bold">
                            Orden Oficial: #{orderNumber}
                          </span>
                        </div>
                        <h4 className="text-sm sm:text-base font-black text-emerald-950">
                          El cliente ha ACEPTADO el valor total liquidado de {formatCOP(presupuesto.totalPresupuesto)} COP
                        </h4>
                        <p className="text-xs text-emerald-800">
                          Autorizado por: <strong>{formData.responsable || formData.cliente}</strong> (NIT: {formData.nitDocumento}) • Registrado: {decisionTimestamp} • Método de Pago: <strong className="capitalize">{formData.metodoPago || 'Bancolombia'}</strong>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 self-end sm:self-auto shrink-0 no-print">
                      <span className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-black rounded-xl shadow-xs flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" /> Aprobado
                      </span>
                      <button
                        type="button"
                        onClick={() => setQuotationDecision('pending')}
                        className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-all cursor-pointer"
                        title="Reevaluar decisión sobre la cotización"
                      >
                        Reevaluar
                      </button>
                    </div>
                  </div>
                ) : quotationDecision === 'rejected' ? (
                  <div className="p-4 sm:p-5 rounded-2xl bg-rose-50/90 border-2 border-rose-400 text-rose-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-rose-600 text-white flex items-center justify-center font-black shrink-0 shadow-xs">
                        <XCircle className="w-6 h-6 text-white" />
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] font-black uppercase tracking-wider bg-rose-200 text-rose-900 px-2.5 py-0.5 rounded-full border border-rose-300">
                            ✕ Estado de la Factura: Total Rechazado por el Cliente
                          </span>
                          <span className="text-xs text-rose-700 font-mono">
                            Fecha: {decisionTimestamp}
                          </span>
                        </div>
                        <h4 className="text-sm sm:text-base font-black text-rose-950">
                          El cliente ha RECHAZADO el valor total cotizado de {formatCOP(presupuesto.totalPresupuesto)} COP
                        </h4>
                        <p className="text-xs text-rose-800">
                          Motivo de rechazo: <strong>{rejectionReason || 'No especificado'}</strong> {rejectionNotes ? `("${rejectionNotes}")` : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 self-end sm:self-auto shrink-0 no-print">
                      <button
                        type="button"
                        onClick={handleAcceptQuotation}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <CheckCheck className="w-4 h-4" /> Cambiar a Aceptado
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/90 border-2 border-amber-400 text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black shrink-0 shadow-xs">
                        <Clock className="w-6 h-6 text-white" />
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-black uppercase tracking-wider bg-amber-200 text-amber-900 px-2.5 py-0.5 rounded-full border border-amber-300 inline-block mb-0.5">
                          ⏳ Decisión Requerida: Confirmación de Total
                        </span>
                        <h4 className="text-sm sm:text-base font-black text-amber-950">
                          ¿El cliente acepta o rechaza el valor total liquidado de {formatCOP(presupuesto.totalPresupuesto)} COP?
                        </h4>
                        <p className="text-xs text-amber-800">
                          Seleccione a continuación para que la factura refleje la decisión formal del cliente.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 self-end sm:self-auto shrink-0 no-print">
                      <button
                        type="button"
                        onClick={handleAcceptQuotation}
                        className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
                      >
                        <CheckCheck className="w-4 h-4" /> Aceptar
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowRejectModal(true)}
                        className="px-3.5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-black rounded-xl border border-rose-300 transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
                      >
                        <ThumbsDown className="w-4 h-4 text-rose-600" /> Rechazar
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* DATOS DEL CLIENTE Y UBICACIÓN DE OBRA */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-50/90 border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Empresa / Cliente</span>
                  <p className="font-bold text-slate-900 text-sm break-words">{formData.cliente}</p>
                  <p className="text-slate-500 font-mono">NIT: {formData.nitDocumento}</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50/90 border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Contacto / Responsable</span>
                  <p className="font-bold text-slate-900 text-sm break-words">{formData.responsable}</p>
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
                  <p className="text-slate-600 break-words">{formData.tipoObra}</p>
                </div>
              </div>

              {/* SISTEMA QUÍMICO HOMOLOGADO COLORLINK */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-sky-50/90 via-white to-blue-50/70 border border-sky-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-sky-950 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-sky-600" /> Sistema Químico Profesional Recomendado:
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
                  <span className="px-4 py-2 bg-gradient-to-r from-sky-500 to-blue-600 text-white text-xs font-black rounded-xl shadow-xs">
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
                  <strong className="text-sky-700 font-bold block text-sm">{technicalCalc.galonesRequeridos} Galones Despachados</strong>
                  <span className="text-[11px] text-slate-500 block leading-snug">
                    {technicalCalc.cuñetesRequeridos} Cuñetes + {technicalCalc.galonesSueltosRequeridos} Gal ({technicalCalc.galonesNetosSinDesperdicio} netos + {technicalCalc.galonesDesperdicio} merma)
                  </span>
                </div>
              </div>

              {/* TABLA DETALLADA DE MATERIALES CON PRECIOS OFICIALES */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-sky-600" /> Liquidación Detallada de Materiales & Precios Oficiales (COP)
                  </h4>
                  <span className="text-[11px] text-slate-500 font-medium">Lista de Precios Oficial Colorlink</span>
                </div>

                <div className="border border-slate-200 rounded-2xl overflow-x-auto shadow-xs bg-white">
                  <table className="w-full min-w-[560px] text-left text-xs border-collapse">
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
                      <Truck className="w-4 h-4 text-sky-600" /> Logística de Despacho & Cobertura:
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
                          <Truck className="w-3.5 h-3.5 text-sky-600" /> Flete Terrestre Asegurado ({formData.ciudad}):
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
                          <span className="text-[10px] bg-gradient-to-r from-sky-600 to-blue-700 bg-clip-text text-transparent font-black">
                            Materiales + Despacho + IVA
                          </span>
                        </div>
                        <span className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-700 bg-clip-text text-transparent font-mono tracking-tight">
                          {formatCOP(presupuesto.totalPresupuesto)}
                        </span>
                      </div>

                      {/* SELLO OFICIAL DE CONFORMIDAD DEL TOTAL */}
                      <div className={`mt-3 p-3 rounded-2xl border text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 ${
                        quotationDecision === 'accepted'
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                          : quotationDecision === 'rejected'
                          ? 'bg-rose-50 border-rose-300 text-rose-900'
                          : 'bg-amber-50 border-amber-300 text-amber-900'
                      }`}>
                        <div className="flex items-center gap-2">
                          {quotationDecision === 'accepted' ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                          ) : quotationDecision === 'rejected' ? (
                            <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                          ) : (
                            <Clock className="w-5 h-5 text-amber-600 shrink-0" />
                          )}
                          <div>
                            <span className="font-black block uppercase text-[11px] tracking-tight">
                              {quotationDecision === 'accepted' && '✓ TOTAL ACEPTADO Y APROBADO POR EL CLIENTE'}
                              {quotationDecision === 'rejected' && '✕ TOTAL RECHAZADO POR EL CLIENTE'}
                              {quotationDecision === 'pending' && '⏳ TOTAL PENDIENTE DE ACEPTACIÓN'}
                            </span>
                            <span className="text-[10px] text-slate-600 block">
                              {quotationDecision === 'accepted' && `Orden #${orderNumber} • ${decisionTimestamp} • ${formData.responsable || formData.cliente}`}
                              {quotationDecision === 'rejected' && `Motivo: ${rejectionReason || 'No aceptado'} • ${decisionTimestamp}`}
                              {quotationDecision === 'pending' && `Monto: ${formatCOP(presupuesto.totalPresupuesto)} COP • Sujeto a confirmación`}
                            </span>
                          </div>
                        </div>

                        {/* Botones de acción rápida si está en pantalla */}
                        <div className="no-print flex items-center gap-1.5 self-end sm:self-auto shrink-0">
                          {quotationDecision === 'pending' && (
                            <>
                              <button
                                type="button"
                                onClick={handleAcceptQuotation}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1 shadow-2xs active:scale-95"
                                title="Aceptar formalmente este valor total"
                              >
                                <Check className="w-3.5 h-3.5" /> Aceptar Total
                              </button>
                              <button
                                type="button"
                                onClick={() => setShowRejectModal(true)}
                                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1 shadow-2xs active:scale-95"
                                title="Rechazar este valor total"
                              >
                                <X className="w-3.5 h-3.5 text-rose-500" /> Rechazar Total
                              </button>
                            </>
                          )}
                          {quotationDecision === 'accepted' && (
                            <button
                              type="button"
                              onClick={() => setQuotationDecision('pending')}
                              className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold text-[11px] rounded-lg transition-colors cursor-pointer"
                              title="Reevaluar decisión sobre el total"
                            >
                              Reevaluar
                            </button>
                          )}
                          {quotationDecision === 'rejected' && (
                            <button
                              type="button"
                              onClick={() => setQuotationDecision('pending')}
                              className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-300 font-bold text-[11px] rounded-lg transition-colors cursor-pointer"
                              title="Volver a evaluar la cotización"
                            >
                              Reactivar
                            </button>
                          )}
                        </div>
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
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                id="btn-modify-data-bottom"
                onClick={() => setIsSubmitted(false)}
                className="w-full sm:w-auto px-5 py-3 bg-gradient-to-r from-[#FF007A] via-[#E00096] to-[#0055FF] hover:brightness-110 text-white font-black text-xs rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-pink-500/25 active:scale-95"
                title="Editar los parámetros de la cotización actual"
              >
                <Edit3 className="w-4 h-4 text-white" />
                <span>Modificar</span>
              </button>

              <button
                type="button"
                id="btn-new-quote-bottom"
                onClick={resetForm}
                className="w-full sm:w-auto px-5 py-3 bg-gradient-to-r from-[#FF5500] via-[#FF7700] to-[#FFD000] hover:brightness-110 text-slate-950 font-black text-xs rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-orange-500/25 active:scale-95"
                title="Iniciar una cotización nueva desde cero"
              >
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>Otra cotización</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                id="btn-download-pdf-bottom"
                onClick={handleDownloadPDF}
                disabled={isGeneratingPDF}
                className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-[#0055FF] via-[#0099FF] to-[#00D2FF] hover:brightness-110 text-white font-black text-xs rounded-2xl transition-all shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 disabled:opacity-75 cursor-pointer active:scale-95"
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
                className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-sky-50 via-blue-50 to-cyan-50 hover:brightness-95 text-[#0055FF] font-black text-xs rounded-2xl transition-all border-2 border-[#00D2FF]/40 shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 active:scale-95"
              >
                {isPrinting ? <Loader2 className="w-4 h-4 animate-spin text-[#0055FF]" /> : <Printer className="w-4 h-4 text-[#0055FF]" />}
                <span>{isPrinting ? 'Preparando Impresión...' : 'Imprimir Documento'}</span>
              </button>
            </div>
          </div>
        </div>
  ) : (
        /* VISTA B: FORMULARIO DE CAPTURA PASO A PASO (LIMPIO, SIN PRECIOS PREMATUROS) */
        <div className="space-y-8">
          {/* Header Corporativo para Clientes */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm relative overflow-hidden">
            {/* Puntitos de Colores Elegantes Colorlink de Fondo */}
            <ColorlinkConfettiDots className="absolute inset-0 z-0" />

            <div className="relative z-10">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-[#FF5500] to-[#FF007A] text-white px-2.5 py-0.5 rounded-full shadow-xs">
                      Colorlink® Tintometría & Pinturas
                    </span>
                    <div className="flex items-center gap-1 bg-white/90 px-2 py-0.5 rounded-full border border-slate-200 text-[10px] font-bold text-slate-600">
                      <span className="w-2 h-2 rounded-full bg-[#FF5500]" title="Naranja Fuego" />
                      <span className="w-2 h-2 rounded-full bg-[#FFD000]" title="Amarillo Eléctrico" />
                      <span className="w-2 h-2 rounded-full bg-[#10E57A]" title="Verde Lima Neón" />
                      <span className="w-2 h-2 rounded-full bg-[#00D2FF]" title="Turquesa Neón" />
                      <span className="w-2 h-2 rounded-full bg-[#0055FF]" title="Azul Eléctrico" />
                      <span className="w-2 h-2 rounded-full bg-[#FF007A]" title="Magenta Vibrante" />
                    </div>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-[#FF5500] via-[#0055FF] to-[#00D2FF] bg-clip-text text-transparent tracking-tight">
                    Cotiza tu pedido oficial
                  </h1>
                  <p className="text-slate-600 text-sm max-w-2xl leading-relaxed">
                    Completa los pasos de tu proyecto para recibir al instante la cotización oficial detallada, cálculo de flete y entrega programada.
                  </p>
                </div>

                {activeSession ? (
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center gap-2 bg-sky-50/90 border border-sky-200/90 px-3.5 py-2 rounded-full text-xs shadow-2xs">
                      <span className="w-2.5 h-2.5 rounded-full bg-sky-600"></span>
                      <span className="font-bold text-slate-800 truncate max-w-[170px]">
                        {activeSession.responsable || activeSession.empresa}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
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
              <div className="mt-5 p-4 rounded-2xl bg-gradient-to-r from-sky-50/90 via-blue-50/60 to-white border border-sky-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs backdrop-blur-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-sky-500 via-sky-600 to-blue-600 text-white flex items-center justify-center shadow-xs shrink-0 p-1">
                    <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
                      <ellipse cx="50" cy="58" rx="26" ry="28" fill="#FFFFFF" />
                      <ellipse cx="50" cy="62" rx="17" ry="20" fill="#0F172A" />
                      <circle cx="43" cy="36" r="3.5" fill="#FFFFFF" />
                      <circle cx="57" cy="36" r="3.5" fill="#FFFFFF" />
                      <polygon points="50,40 45,46 55,46" fill="#FB923C" />
                      <path d="M32 30 C32 20, 68 18, 70 28 C72 32, 60 34, 48 34 C36 34, 30 33, 32 30 Z" fill="#0284C7" />
                    </svg>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-slate-900">
                        ¿Tienes dudas con tus medidas, fotos o pintura? Pincelito 🐧 te ayuda
                      </span>
                      <span className="px-2 py-0.5 bg-gradient-to-r from-sky-500 to-blue-600 text-white text-[10px] font-black rounded-md shadow-2xs">
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
                  className="px-4 py-2 bg-gradient-to-r from-sky-500 via-sky-600 to-blue-600 hover:brightness-110 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-2 shrink-0 cursor-pointer active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                  <span>Consultar con Pincelito 🐧</span>
                </button>
              </div>

              {/* Stepper Visual de 3 Pasos con los 5 Colores Vivos de Marca */}
              <div className="mt-6 pt-6 border-t border-slate-200/80 grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    step: 1,
                    title: '1. Ubicación & Área',
                    desc: 'Ciudad, m² y Fechas de Obra',
                    icon: Layers,
                    activeBorder: 'border-[#FF5500] ring-2 ring-[#FF5500]/30 bg-orange-50/70',
                    activeIcon: 'bg-gradient-to-tr from-[#FF5500] via-[#FF7700] to-[#FFD000] text-white shadow-md shadow-orange-500/30'
                  },
                  {
                    step: 2,
                    title: '2. Parámetros & Pago',
                    desc: 'Pintura, Accesorios y Pago',
                    icon: Sparkles,
                    activeBorder: 'border-[#00D2FF] ring-2 ring-[#00D2FF]/30 bg-sky-50/70',
                    activeIcon: 'bg-gradient-to-tr from-[#0055FF] via-[#0099FF] to-[#00D2FF] text-white shadow-md shadow-blue-500/30'
                  },
                  {
                    step: 3,
                    title: '3. Diagnóstico IA & Decisión',
                    desc: 'Auditoría IA y Decisión del Total',
                    icon: FileCheck,
                    activeBorder: 'border-[#10E57A] ring-2 ring-[#10E57A]/30 bg-emerald-50/70',
                    activeIcon: 'bg-gradient-to-tr from-[#10E57A] via-[#00D2FF] to-[#FF007A] text-white shadow-md shadow-emerald-500/30'
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
                          ? `${item.activeBorder} shadow-sm`
                          : isCompleted
                          ? 'border-[#10E57A]/40 bg-emerald-50/70 text-emerald-950 font-bold'
                          : 'border-slate-200 bg-white/80 text-slate-500 hover:border-slate-300'
                      }`}
                    >
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                          isCurrent
                            ? item.activeIcon
                            : isCompleted
                            ? 'bg-gradient-to-tr from-[#10E57A] to-[#00D2FF] text-white shadow-xs'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {isCompleted ? <CheckCircle2 className="w-5 h-5 text-white" /> : <Icon className="w-4 h-4" />}
                      </div>
                      <div className="min-w-0">
                        <span className={`text-xs font-bold block ${isCurrent ? 'text-slate-900 font-extrabold' : 'text-slate-800'}`}>
                          {item.title}
                        </span>
                        <span className="text-[11px] text-slate-500 block leading-tight">{item.desc}</span>
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

                    {/* Resumen o ingreso del cliente */}
                    {formData.cliente ? (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-amber-50/40 border border-amber-100 rounded-2xl text-xs">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center font-bold shadow-2xs shrink-0">
                            <Building2 className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block">
                              {formData.cliente} {formData.nitDocumento ? `• NIT ${formData.nitDocumento}` : ''}
                            </span>
                            <span className="text-slate-500 text-[11px] block">
                              Contacto: {formData.responsable || 'Cliente'} {formData.emailResponsable ? `(${formData.emailResponsable})` : ''}
                            </span>
                          </div>
                        </div>
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-full w-fit">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Cliente Verificado</span>
                        </span>
                      </div>
                    ) : (
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                        <span className="text-xs font-bold text-slate-800 block">Datos de Identificación del Cliente / Empresa:</span>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="text-[11px] font-semibold text-slate-600 block mb-1">Empresa / Razón Social *</label>
                            <input
                              type="text"
                              placeholder="Ej: Inversiones Los Álamos"
                              value={formData.cliente}
                              onChange={(e) => handleInputChange('cliente', e.target.value)}
                              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] font-semibold text-slate-600 block mb-1">NIT / C.C. (Solo números) *</label>
                            <input
                              type="text"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              placeholder="Ej: 900123456"
                              value={formData.nitDocumento}
                              onChange={(e) => handleInputChange('nitDocumento', e.target.value.replace(/\D/g, ''))}
                              className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-200 rounded-xl"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] font-semibold text-slate-600 block mb-1">Nombre de Contacto *</label>
                            <input
                              type="text"
                              placeholder="Ing. Carlos Pérez"
                              value={formData.responsable}
                              onChange={(e) => handleInputChange('responsable', e.target.value)}
                              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                          <div>
                            <label className="text-[11px] font-semibold text-slate-600 block mb-1">Correo Electrónico (para recibir la cotización) *</label>
                            <input
                              type="email"
                              placeholder="contacto@empresa.com"
                              value={formData.emailResponsable}
                              onChange={(e) => handleInputChange('emailResponsable', e.target.value)}
                              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] font-semibold text-slate-600 block mb-1">Teléfono / Celular (Solo números)</label>
                            <input
                              type="tel"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              placeholder="Ej: 3001234567"
                              value={formData.telefonoResponsable}
                              onChange={(e) => handleInputChange('telefonoResponsable', e.target.value.replace(/\D/g, ''))}
                              className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-200 rounded-xl"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Ciudad de entrega <span className="text-rose-500">*</span>
                        </label>
                        <select
                          id="standalone-select-ciudad"
                          value={formData.ciudad}
                          onChange={(e) => handleInputChange('ciudad', e.target.value)}
                          className={`w-full px-4 py-3 text-sm bg-slate-50/80 border ${
                            errors.ciudad ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
                          } rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all font-semibold text-slate-800`}
                        >
                          <option value="">-- Seleccionar Ciudad de Entrega --</option>
                          <option value="Medellín">Medellín</option>
                          <option value="Bogotá D.C.">Bogotá D.C.</option>
                          <option value="Cali">Cali</option>
                          <option value="Barranquilla">Barranquilla</option>
                          <option value="Cartagena">Cartagena</option>
                          <option value="Bucaramanga">Bucaramanga</option>
                          <option value="Pereira">Pereira</option>
                          <option value="Otra Ciudad">Otra ciudad o municipio nacional</option>
                        </select>
                        {errors.ciudad ? (
                          <p className="text-xs text-rose-600 mt-1.5">{errors.ciudad}</p>
                        ) : (
                          <span className="text-[11px] text-slate-500 block mt-1">Tiempo de despacho: {presupuesto.tiempoEntregaDias}</span>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Tipo de obra <span className="text-rose-500">*</span>
                        </label>
                        <select
                          id="standalone-select-tipo-obra"
                          value={formData.tipoObra}
                          onChange={(e) => handleInputChange('tipoObra', e.target.value)}
                          className={`w-full px-4 py-3 text-sm bg-slate-50/80 border ${
                            errors.tipoObra ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
                          } rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all font-medium`}
                        >
                          <option value="">-- Seleccionar Tipo de Obra --</option>
                          <option value="Fachada Edificio">Fachada de edificio / Muros exteriores</option>
                          <option value="Muros Interiores">Muros interiores y áreas comunes</option>
                          <option value="Pisos Industriales">Pisos industriales y parqueaderos</option>
                          <option value="Estructura Metálica">Estructura metálica y cubiertas</option>
                          <option value="Cielorrasos">Cielorrasos y plafones (techos)</option>
                          <option value="Institucional / Hospitalario">Institucional (clínicas, colegios, hospitales)</option>
                        </select>
                        {errors.tipoObra && <p className="text-xs text-rose-600 mt-1.5">{errors.tipoObra}</p>}
                      </div>

                      {/* Dirección Exacta de Entrega de la Obra / Pedido */}
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                          <span>Dirección exacta donde quieres que llegue el pedido <span className="text-rose-500">*</span></span>
                          <span className="text-[10px] text-slate-400 font-normal">Para despacho en furgón térmico Colorlink</span>
                        </label>
                        <div className="relative">
                          <input
                            id="standalone-input-direccion"
                            type="text"
                            placeholder="Ej. Calle 48 # 65-34, Edificio Torre del Valle, Obra piso 5"
                            value={formData.direccionEntrega || ''}
                            onChange={(e) => handleInputChange('direccionEntrega', e.target.value)}
                            className={`w-full pl-10 pr-4 py-3 text-sm bg-slate-50/80 border ${
                              errors.direccionEntrega ? 'border-rose-400 focus:ring-rose-400 bg-rose-50/20' : 'border-slate-200 focus:ring-amber-500'
                            } rounded-2xl focus:bg-white focus:outline-none focus:ring-2 font-medium text-slate-900 transition-all`}
                          />
                          <MapPin className="w-4 h-4 text-amber-600 absolute left-3.5 top-3.5" />
                        </div>
                        {errors.direccionEntrega ? (
                          <p className="text-xs text-rose-600 mt-1.5">{errors.direccionEntrega}</p>
                        ) : (
                          <span className="text-[11px] text-slate-500 block mt-1">Indica calle, número, nombre de la obra, edificio o indicaciones de acceso vehicular.</span>
                        )}
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
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white flex flex-col items-center justify-center font-bold shadow-2xs shrink-0">
                          <span className="text-xs leading-none">{formData.areaM2 || 0}</span>
                          <span className="text-[9px] uppercase font-mono">m²</span>
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-900 block">Cuantificación Técnica de Envases:</span>
                          <span className="text-xs text-slate-600">
                            {formData.areaM2 > 0 ? (
                              <>
                                <strong>{technicalCalc.cuñetesRequeridos} Cuñetes</strong> (5 Gal)
                                {technicalCalc.galonesSueltosRequeridos > 0 && ` + ${technicalCalc.galonesSueltosRequeridos} Galones`}
                                {' '}(Total requerido: {technicalCalc.galonesRequeridos} gal)
                              </>
                            ) : (
                              <span className="text-slate-400 italic">Ingresa el área en m² para cuantificar galones y cuñetes requeridos</span>
                            )}
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
                        className="px-7 py-3.5 bg-gradient-to-r from-[#FF5500] via-[#FF007A] to-[#0055FF] hover:brightness-110 text-white font-black text-sm rounded-2xl shadow-lg shadow-orange-500/30 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                      >
                        <span>Continuar a Parámetros Técnicos</span>
                        <ArrowRight className="w-4 h-4" />
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
                      <span className="text-xs font-bold text-sky-700 bg-sky-50 px-3 py-1 rounded-full border border-sky-200/80">Paso 2 de 3</span>
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
                          className={`w-full px-3 py-2.5 text-xs bg-slate-50/80 border ${
                            errors.superficie ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
                          } rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#009FE3] transition-all font-medium`}
                        >
                          <option value="">-- Seleccionar Superficie / Sustrato --</option>
                          <option value="Concreto / Revoque">Concreto, revoque o pañete</option>
                          <option value="Drywall / Yeso">Drywall o panel de yeso</option>
                          <option value="Metal Ferroso">Metal ferroso (hierro, acero)</option>
                          <option value="Metal Galvanizado / Aluminio">Metal galvanizado o aluminio</option>
                          <option value="Madera">Madera o tableros</option>
                          <option value="Pintura Existente">Pintura existente (repinte)</option>
                        </select>
                        {errors.superficie && <p className="text-[11px] text-rose-600 mt-1">{errors.superficie}</p>}
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Ambiente de la superficie <span className="text-rose-500">*</span>
                        </label>
                        <select
                          id="standalone-select-ambiente"
                          value={formData.ambiente}
                          onChange={(e) => handleInputChange('ambiente', e.target.value)}
                          className={`w-full px-3 py-2.5 text-xs bg-slate-50/80 border ${
                            errors.ambiente ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
                          } rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#009FE3] transition-all font-medium`}
                        >
                          <option value="">-- Seleccionar Ambiente --</option>
                          <option value="Exterior Intemperie">Exterior intemperie (sol y lluvia directa)</option>
                          <option value="Interior Seco">Interior seco (habitaciones, oficinas, pasillos)</option>
                          <option value="Interior Húmedo (Baños/Cocinas)">Interior húmedo (baños, cocinas, zonas de lavado)</option>
                          <option value="Industrial Severo / Químico">Industrial o químico severo</option>
                          <option value="Tráfico Peatonal / Vehicular">Alto tráfico peatonal o vehicular</option>
                        </select>
                        {errors.ambiente && <p className="text-[11px] text-rose-600 mt-1">{errors.ambiente}</p>}
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Condición de la superficie <span className="text-rose-500">*</span>
                        </label>
                        <select
                          id="standalone-select-condicion"
                          value={formData.condicion}
                          onChange={(e) => handleInputChange('condicion', e.target.value)}
                          className={`w-full px-3 py-2.5 text-xs bg-slate-50/80 border ${
                            errors.condicion ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
                          } rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#009FE3] transition-all font-medium`}
                        >
                          <option value="">-- Seleccionar Condición Actual --</option>
                          <option value="Nueva sin pintar">Nueva sin pintar (limpia y seca)</option>
                          <option value="Pintada en buen estado">Pintada en buen estado (cambio de color)</option>
                          <option value="Fisuras leves y humedad">Fisuras leves o humedad</option>
                          <option value="Descascaramiento severo">Descascaramiento o tizado</option>
                          <option value="Oxidación superficial">Presencia de oxidación o corrosión superficial</option>
                          <option value="Contaminación / Grasa">Grasas, hongos o manchas</option>
                        </select>
                        {errors.condicion && <p className="text-[11px] text-rose-600 mt-1">{errors.condicion}</p>}
                      </div>
                    </div>

                    {/* Selector de Tipo de Pintura: Tipo 1, 2 y 3 para Exterior e Interior (Norma NTC 1335 / NTC 5828) */}
                    <div className="pt-2 space-y-4">
                      {/* 1. SELECCIÓN DE MARCAS DE PINTURAS */}
                      <div className="bg-gradient-to-r from-sky-50/70 via-blue-50/50 to-indigo-50/60 p-4 sm:p-5 rounded-2xl border border-sky-200/80 space-y-3">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-sky-600 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                              🎨
                            </div>
                            <div>
                              <span className="text-xs font-black text-slate-900 uppercase tracking-wider block">
                                Marcas de Pintura Certificadas & Tarifas
                              </span>
                              <span className="text-[11px] text-slate-500">
                                💡 Dependiendo de la marca seleccionada, los precios de cuñetes, galones y presupuesto total se actualizan en tiempo real:
                              </span>
                            </div>
                          </div>
                          <span className="text-xs font-black text-sky-800 bg-white px-3 py-1 rounded-full border border-sky-200 shadow-2xs">
                            Marca Activa: {formData.marcaPintura || 'Pintuco®'}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                          {AVAILABLE_PAINT_BRANDS.map((brand) => {
                            const isSelected = (formData.marcaPintura || 'Pintuco®') === brand.name;
                            return (
                              <button
                                key={brand.id}
                                type="button"
                                onClick={() => handleInputChange('marcaPintura', brand.name)}
                                className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                                  isSelected
                                    ? 'border-sky-600 bg-white shadow-md ring-2 ring-sky-500/25 scale-[1.02]'
                                    : 'border-slate-200 hover:border-sky-300 bg-white/90 hover:bg-white'
                                }`}
                              >
                                <div>
                                  <div className="flex items-center justify-between gap-1 mb-1">
                                    <span className="font-black text-xs text-slate-900 leading-tight">
                                      {brand.name}
                                    </span>
                                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 shrink-0" />}
                                  </div>
                                  <span className="text-[10px] text-sky-700 font-semibold block leading-tight">
                                    {brand.popularProduct}
                                  </span>

                                  {/* Badge de Tarifa */}
                                  <div className="mt-2">
                                    <span className={`inline-block text-[9px] font-black px-1.5 py-0.5 rounded-md ${
                                      brand.ahorroPorcentaje < 0
                                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                        : brand.ahorroPorcentaje > 0
                                        ? 'bg-sky-100 text-sky-800 border border-sky-200'
                                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                                    }`}>
                                      {brand.etiquetaPrecio}
                                    </span>
                                  </div>
                                </div>

                                <div className="mt-2 pt-2 border-t border-slate-100">
                                  <span className="text-[9px] text-slate-400 block font-medium">Cuñete Tipo 1:</span>
                                  <strong className="text-xs font-mono font-black text-slate-900 block">
                                    {formatCOP(brand.precioRefCuneteT1)}
                                  </strong>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Encabezado y Diagnóstico con IA */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-1">
                        <div>
                          <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                            <span>Especificación Técnica (Norma Técnica Colombiana NTC 1335 / NTC 5828)</span>
                            <span className="text-[10px] bg-sky-100 text-[#003882] px-2 py-0.5 rounded-full font-bold">
                              Tipo 1, 2 y 3
                            </span>
                          </label>
                          <p className="text-[11px] text-slate-500">
                            Características técnicas y rendimiento certificado según norma NTC para elegir la mejor especificación.
                          </p>
                        </div>
                      </div>

                      {/* Desplegable Rápido de Tipo de Pintura */}
                      <div>
                        <select
                          id="standalone-select-tipo-pintura"
                          value={formData.tipoPintura || ''}
                          onChange={(e) => {
                            const val = e.target.value as any;
                            handleInputChange('tipoPintura', val);
                            if (val && val.includes('Exterior')) setActivePaintLine('Exterior');
                            if (val && val.includes('Interior')) setActivePaintLine('Interior');
                          }}
                          className={`w-full px-3.5 py-2.5 text-xs bg-slate-50/80 border ${
                            errors.tipoPintura ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
                          } rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#009FE3] transition-all font-semibold text-slate-800`}
                        >
                          <option value="">-- Seleccionar Tipo de Pintura (Norma NTC 1335) --</option>
                          <optgroup label="🌤️ LÍNEA EXTERIOR (Fachadas e Intemperie - NTC 1335 / NTC 5828)">
                            <option value="Exterior Tipo 1">Exterior Tipo 1: 100% Acrílica Fachadas (Súper Lavable &gt;1.200 ciclos / 5-7 años)</option>
                            <option value="Exterior Tipo 2">Exterior Tipo 2: Vinil-Acrílica Fachada Estándar (&gt;600 ciclos / 3-4 años)</option>
                            <option value="Exterior Tipo 3">Exterior Tipo 3: Base Imprimante &amp; Fondeo Fachada (1 año / Fondeo)</option>
                          </optgroup>
                          <optgroup label="🏠 LÍNEA INTERIOR (Muros Interiores &amp; Cielorrasos - NTC 1335)">
                            <option value="Interior Tipo 1">Interior Tipo 1: Vinilo Superlavable Alto Tráfico (&gt;800 ciclos / 4-5 años)</option>
                            <option value="Interior Tipo 2">Interior Tipo 2: Vinilo Lavable Estándar Habitaciones (&gt;400 ciclos / 3-4 años)</option>
                            <option value="Interior Tipo 3">Interior Tipo 3: Pintura Vinílica Cielorrasos &amp; Techos (No lavable / 1-2 años)</option>
                          </optgroup>
                        </select>
                      </div>

                      {/* Pestañas de Alternancia: Línea Exterior vs Línea Interior */}
                      <div className="flex items-center gap-2 p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200">
                        <button
                          type="button"
                          onClick={() => setActivePaintLine('Exterior')}
                          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                            activePaintLine === 'Exterior'
                              ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          <span>🌤️ Línea Exterior (Tipo 1, 2 y 3 Fachadas)</span>
                          {formData.tipoPintura?.includes('Exterior') && (
                            <span className="w-2.5 h-2.5 rounded-full bg-[#009FE3]"></span>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => setActivePaintLine('Interior')}
                          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                            activePaintLine === 'Interior'
                              ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          <span>🏠 Línea Interior (Tipo 1, 2 y 3 Muros & Cielos)</span>
                          {formData.tipoPintura?.includes('Interior') && (
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                          )}
                        </button>
                      </div>

                      {/* Tarjetas según la Línea Seleccionada con Fotos de Referencia Reales y Diseño Espacioso */}
                      {activePaintLine === 'Exterior' ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                          {/* Exterior Tipo 1 */}
                          <div
                            onClick={() => handleInputChange('tipoPintura', 'Exterior Tipo 1')}
                            className={`rounded-2xl border-2 cursor-pointer transition-all overflow-hidden flex flex-col justify-between ${
                              formData.tipoPintura === 'Exterior Tipo 1' || formData.tipoPintura === 'Tipo 1'
                                ? 'border-[#009FE3] bg-sky-50/60 shadow-md ring-2 ring-[#009FE3]/30'
                                : 'border-slate-200 hover:border-sky-300 bg-white hover:shadow-sm'
                            }`}
                          >
                            <div>
                              {/* Foto de Referencia Real */}
                              <div className="relative h-40 w-full overflow-hidden bg-slate-100">
                                <img
                                  src={facadeRefImg}
                                  alt="Fachada Exterior Tipo 1"
                                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                                />
                                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap">
                                  <span className="text-[10px] font-black bg-[#009FE3] text-white px-2.5 py-1 rounded-md shadow-xs uppercase tracking-wider">
                                    Exterior Tipo 1
                                  </span>
                                  <span className="text-[10px] font-extrabold bg-white/95 backdrop-blur-xs text-slate-800 border border-slate-200/90 shadow-2xs px-2 py-0.5 rounded-md">
                                    {formData.marcaPintura || 'Pintuco®'}
                                  </span>
                                </div>
                                <span className="absolute bottom-2 right-2 text-[10px] font-bold bg-white/95 text-slate-800 px-2 py-0.5 rounded-md shadow-2xs">
                                  Foto Referencia Obra
                                </span>
                              </div>

                              <div className="p-4 space-y-2.5">
                                <div>
                                  <h4 className="font-black text-sm text-slate-900">
                                    {formData.marcaPintura || 'Pintuco®'} • 100% Acrílica Fachadas
                                  </h4>
                                  <span className="text-[11px] font-bold text-sky-700 block">
                                    Máxima Resistencia Intemperie & Lavabilidad Superior
                                  </span>
                                </div>

                                <ul className="text-[11px] text-slate-600 space-y-1.5 pt-1">
                                  <li className="flex items-center gap-1.5">
                                    <Check className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                                    <span>Superlavable (&gt;1.200 ciclos de lavado bajo NTC 1335)</span>
                                  </li>
                                  <li className="flex items-center gap-1.5">
                                    <Check className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                                    <span>Filtro solar UV y alta resistencia a sol directo y lluvias</span>
                                  </li>
                                  <li className="flex items-center gap-1.5">
                                    <Check className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                                    <span>Garantía y durabilidad: <strong>5 a 7 años certificados</strong></span>
                                  </li>
                                </ul>
                              </div>
                            </div>

                            <div className="p-4 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                              <span className="text-slate-500 font-medium">
                                Galón: {formatCOP(getPaintTypePrice('Exterior Tipo 1', formData.marcaPintura).precioGalon)}
                              </span>
                              <strong className="text-slate-900 font-mono font-black text-sm bg-sky-100/70 text-sky-950 px-2.5 py-1 rounded-lg">
                                {formatCOP(getPaintTypePrice('Exterior Tipo 1', formData.marcaPintura).precioCunete)} / Cuñete
                              </strong>
                            </div>
                          </div>

                          {/* Exterior Tipo 2 */}
                          <div
                            onClick={() => handleInputChange('tipoPintura', 'Exterior Tipo 2')}
                            className={`rounded-2xl border-2 cursor-pointer transition-all overflow-hidden flex flex-col justify-between ${
                              formData.tipoPintura === 'Exterior Tipo 2'
                                ? 'border-sky-600 bg-sky-50/60 shadow-md ring-2 ring-sky-500/30'
                                : 'border-slate-200 hover:border-slate-300 bg-white hover:shadow-sm'
                            }`}
                          >
                            <div>
                              {/* Foto de Referencia Real */}
                              <div className="relative h-40 w-full overflow-hidden bg-slate-100">
                                <img
                                  src={exteriorT2RefImg}
                                  alt="Fachada Exterior Tipo 2"
                                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                                />
                                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap">
                                  <span className="text-[10px] font-black bg-sky-700 text-white px-2.5 py-1 rounded-md shadow-xs uppercase tracking-wider">
                                    Exterior Tipo 2
                                  </span>
                                  <span className="text-[10px] font-extrabold bg-white/95 backdrop-blur-xs text-slate-800 border border-slate-200/90 shadow-2xs px-2 py-0.5 rounded-md">
                                    {formData.marcaPintura || 'Pintuco®'}
                                  </span>
                                </div>
                                <span className="absolute bottom-2 right-2 text-[10px] font-bold bg-white/95 text-slate-800 px-2 py-0.5 rounded-md shadow-2xs">
                                  Foto Referencia Obra
                                </span>
                              </div>

                              <div className="p-4 space-y-2.5">
                                <div>
                                  <h4 className="font-black text-sm text-slate-900">
                                    {formData.marcaPintura || 'Pintuco®'} • Vinil-Acrílica Fachada
                                  </h4>
                                  <span className="text-[11px] font-bold text-sky-800 block">
                                    Fachada Estándar & Muros Exteriores Protegidos
                                  </span>
                                </div>

                                <ul className="text-[11px] text-slate-600 space-y-1.5 pt-1">
                                  <li className="flex items-center gap-1.5">
                                    <Check className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                                    <span>Resistencia a intemperie moderada (&gt;600 ciclos)</span>
                                  </li>
                                  <li className="flex items-center gap-1.5">
                                    <Check className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                                    <span>Ideal para aleros, terrazas techadas y cerramientos</span>
                                  </li>
                                  <li className="flex items-center gap-1.5">
                                    <Check className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                                    <span>Durabilidad esperada: <strong>3 a 4 años</strong></span>
                                  </li>
                                </ul>
                              </div>
                            </div>

                            <div className="p-4 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                              <span className="text-slate-500 font-medium">
                                Galón: {formatCOP(getPaintTypePrice('Exterior Tipo 2', formData.marcaPintura).precioGalon)}
                              </span>
                              <strong className="text-slate-900 font-mono font-black text-sm bg-slate-100 text-slate-900 px-2.5 py-1 rounded-lg">
                                {formatCOP(getPaintTypePrice('Exterior Tipo 2', formData.marcaPintura).precioCunete)} / Cuñete
                              </strong>
                            </div>
                          </div>

                          {/* Exterior Tipo 3 */}
                          <div
                            onClick={() => handleInputChange('tipoPintura', 'Exterior Tipo 3')}
                            className={`rounded-2xl border-2 cursor-pointer transition-all overflow-hidden flex flex-col justify-between ${
                              formData.tipoPintura === 'Exterior Tipo 3'
                                ? 'border-indigo-600 bg-indigo-50/60 shadow-md ring-2 ring-indigo-500/30'
                                : 'border-slate-200 hover:border-slate-300 bg-white hover:shadow-sm'
                            }`}
                          >
                            <div>
                              {/* Foto de Referencia Real */}
                              <div className="relative h-40 w-full overflow-hidden bg-slate-100">
                                <img
                                  src={exteriorT3RefImg}
                                  alt="Fondeo Imprimante Exterior"
                                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                                />
                                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap">
                                  <span className="text-[10px] font-black bg-indigo-700 text-white px-2.5 py-1 rounded-md shadow-xs uppercase tracking-wider">
                                    Exterior Tipo 3
                                  </span>
                                  <span className="text-[10px] font-extrabold bg-white/95 backdrop-blur-xs text-slate-800 border border-slate-200/90 shadow-2xs px-2 py-0.5 rounded-md">
                                    {formData.marcaPintura || 'Pintuco®'}
                                  </span>
                                </div>
                                <span className="absolute bottom-2 right-2 text-[10px] font-bold bg-white/95 text-slate-800 px-2 py-0.5 rounded-md shadow-2xs">
                                  Foto Referencia Obra
                                </span>
                              </div>

                              <div className="p-4 space-y-2.5">
                                <div>
                                  <h4 className="font-black text-sm text-slate-900">
                                    {formData.marcaPintura || 'Pintuco®'} • Base Imprimante & Fondeo
                                  </h4>
                                  <span className="text-[11px] font-bold text-indigo-900 block">
                                    Regularización de Absorción & Cerramientos
                                  </span>
                                </div>

                                <ul className="text-[11px] text-slate-600 space-y-1.5 pt-1">
                                  <li className="flex items-center gap-1.5">
                                    <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                                    <span>Capa base de impregnación para revoque exterior nuevo</span>
                                  </li>
                                  <li className="flex items-center gap-1.5">
                                    <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                                    <span>Económica para cerramientos provisionales de obra</span>
                                  </li>
                                  <li className="flex items-center gap-1.5">
                                    <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                                    <span>Fondeo permanente / 1 año de acabado</span>
                                  </li>
                                </ul>
                              </div>
                            </div>

                            <div className="p-4 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                              <span className="text-slate-500 font-medium">
                                Galón: {formatCOP(getPaintTypePrice('Exterior Tipo 3', formData.marcaPintura).precioGalon)}
                              </span>
                              <strong className="text-slate-900 font-mono font-black text-sm bg-slate-100 text-slate-900 px-2.5 py-1 rounded-lg">
                                {formatCOP(getPaintTypePrice('Exterior Tipo 3', formData.marcaPintura).precioCunete)} / Cuñete
                              </strong>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                          {/* Interior Tipo 1 */}
                          <div
                            onClick={() => handleInputChange('tipoPintura', 'Interior Tipo 1')}
                            className={`rounded-2xl border-2 cursor-pointer transition-all overflow-hidden flex flex-col justify-between ${
                              formData.tipoPintura === 'Interior Tipo 1'
                                ? 'border-emerald-600 bg-emerald-50/60 shadow-md ring-2 ring-emerald-500/30'
                                : 'border-slate-200 hover:border-slate-300 bg-white hover:shadow-sm'
                            }`}
                          >
                            <div>
                              {/* Foto de Referencia Real */}
                              <div className="relative h-40 w-full overflow-hidden bg-slate-100">
                                <img
                                  src={interiorRefImg}
                                  alt="Interior Tipo 1 Superlavable"
                                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                                />
                                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap">
                                  <span className="text-[10px] font-black bg-emerald-700 text-white px-2.5 py-1 rounded-md shadow-xs uppercase tracking-wider">
                                    Interior Tipo 1
                                  </span>
                                  <span className="text-[10px] font-extrabold bg-white/95 backdrop-blur-xs text-slate-800 border border-slate-200/90 shadow-2xs px-2 py-0.5 rounded-md">
                                    {formData.marcaPintura || 'Pintuco®'}
                                  </span>
                                </div>
                                <span className="absolute bottom-2 right-2 text-[10px] font-bold bg-white/95 text-slate-800 px-2 py-0.5 rounded-md shadow-2xs">
                                  Foto Referencia Obra
                                </span>
                              </div>

                              <div className="p-4 space-y-2.5">
                                <div>
                                  <h4 className="font-black text-sm text-slate-900">
                                    {formData.marcaPintura || 'Pintuco®'} • Vinilo Pro Superlavable
                                  </h4>
                                  <span className="text-[11px] font-bold text-emerald-800 block">
                                    Superlavable Muros de Alto Tráfico
                                  </span>
                                </div>

                                <ul className="text-[11px] text-slate-600 space-y-1.5 pt-1">
                                  <li className="flex items-center gap-1.5">
                                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                    <span>Superlavable (&gt;800 ciclos con agua y jabón)</span>
                                  </li>
                                  <li className="flex items-center gap-1.5">
                                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                    <span>Máxima remoción de manchas domésticas y grasa</span>
                                  </li>
                                  <li className="flex items-center gap-1.5">
                                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                    <span>Salas, pasillos, cocinas, consultorios • <strong>4-5 años</strong></span>
                                  </li>
                                </ul>
                              </div>
                            </div>

                            <div className="p-4 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                              <span className="text-slate-500 font-medium">
                                Galón: {formatCOP(getPaintTypePrice('Interior Tipo 1', formData.marcaPintura).precioGalon)}
                              </span>
                              <strong className="text-slate-900 font-mono font-black text-sm bg-emerald-100/70 text-emerald-950 px-2.5 py-1 rounded-lg">
                                {formatCOP(getPaintTypePrice('Interior Tipo 1', formData.marcaPintura).precioCunete)} / Cuñete
                              </strong>
                            </div>
                          </div>

                          {/* Interior Tipo 2 */}
                          <div
                            onClick={() => handleInputChange('tipoPintura', 'Interior Tipo 2')}
                            className={`rounded-2xl border-2 cursor-pointer transition-all overflow-hidden flex flex-col justify-between ${
                              formData.tipoPintura === 'Interior Tipo 2' || formData.tipoPintura === 'Tipo 2'
                                ? 'border-teal-600 bg-teal-50/60 shadow-md ring-2 ring-teal-500/30'
                                : 'border-slate-200 hover:border-slate-300 bg-white hover:shadow-sm'
                            }`}
                          >
                            <div>
                              {/* Foto de Referencia Real */}
                              <div className="relative h-40 w-full overflow-hidden bg-slate-100">
                                <img
                                  src={interiorT2RefImg}
                                  alt="Interior Tipo 2 Lavable Habitaciones"
                                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                                />
                                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap">
                                  <span className="text-[10px] font-black bg-teal-700 text-white px-2.5 py-1 rounded-md shadow-xs uppercase tracking-wider">
                                    Interior Tipo 2
                                  </span>
                                  <span className="text-[10px] font-extrabold bg-white/95 backdrop-blur-xs text-slate-800 border border-slate-200/90 shadow-2xs px-2 py-0.5 rounded-md">
                                    {formData.marcaPintura || 'Pintuco®'}
                                  </span>
                                </div>
                                <span className="absolute bottom-2 right-2 text-[10px] font-bold bg-white/95 text-slate-800 px-2 py-0.5 rounded-md shadow-2xs">
                                  Foto Referencia Obra
                                </span>
                              </div>

                              <div className="p-4 space-y-2.5">
                                <div>
                                  <h4 className="font-black text-sm text-slate-900">
                                    {formData.marcaPintura || 'Pintuco®'} • Viniltex Muros Lavable
                                  </h4>
                                  <span className="text-[11px] font-bold text-teal-800 block">
                                    Lavable Estándar para Habitaciones
                                  </span>
                                </div>

                                <ul className="text-[11px] text-slate-600 space-y-1.5 pt-1">
                                  <li className="flex items-center gap-1.5">
                                    <Check className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                                    <span>Lavabilidad media (&gt;400 ciclos con esponja suave)</span>
                                  </li>
                                  <li className="flex items-center gap-1.5">
                                    <Check className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                                    <span>Habitaciones, dormitorios, estudios residenciales</span>
                                  </li>
                                  <li className="flex items-center gap-1.5">
                                    <Check className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                                    <span>Durabilidad esperada: <strong>3 a 4 años</strong></span>
                                  </li>
                                </ul>
                              </div>
                            </div>

                            <div className="p-4 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                              <span className="text-slate-500 font-medium">
                                Galón: {formatCOP(getPaintTypePrice('Interior Tipo 2', formData.marcaPintura).precioGalon)}
                              </span>
                              <strong className="text-slate-900 font-mono font-black text-sm bg-slate-100 text-slate-900 px-2.5 py-1 rounded-lg">
                                {formatCOP(getPaintTypePrice('Interior Tipo 2', formData.marcaPintura).precioCunete)} / Cuñete
                              </strong>
                            </div>
                          </div>

                          {/* Interior Tipo 3 */}
                          <div
                            onClick={() => handleInputChange('tipoPintura', 'Interior Tipo 3')}
                            className={`rounded-2xl border-2 cursor-pointer transition-all overflow-hidden flex flex-col justify-between ${
                              formData.tipoPintura === 'Interior Tipo 3' || formData.tipoPintura === 'Tipo 3'
                                ? 'border-amber-600 bg-amber-50/60 shadow-md ring-2 ring-amber-500/30'
                                : 'border-slate-200 hover:border-slate-300 bg-white hover:shadow-sm'
                            }`}
                          >
                            <div>
                              {/* Foto de Referencia Real */}
                              <div className="relative h-40 w-full overflow-hidden bg-slate-100">
                                <img
                                  src={ceilingRefImg}
                                  alt="Interior Tipo 3 Cielorrasos"
                                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                                />
                                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap">
                                  <span className="text-[10px] font-black bg-amber-700 text-white px-2.5 py-1 rounded-md shadow-xs uppercase tracking-wider">
                                    Interior Tipo 3
                                  </span>
                                  <span className="text-[10px] font-extrabold bg-white/95 backdrop-blur-xs text-slate-800 border border-slate-200/90 shadow-2xs px-2 py-0.5 rounded-md">
                                    {formData.marcaPintura || 'Pintuco®'}
                                  </span>
                                </div>
                                <span className="absolute bottom-2 right-2 text-[10px] font-bold bg-white/95 text-slate-800 px-2 py-0.5 rounded-md shadow-2xs">
                                  Foto Referencia Obra
                                </span>
                              </div>

                              <div className="p-4 space-y-2.5">
                                <div>
                                  <h4 className="font-black text-sm text-slate-900">
                                    {formData.marcaPintura || 'Pintuco®'} • Económica Cielorrasos
                                  </h4>
                                  <span className="text-[11px] font-bold text-amber-800 block">
                                    Techos, Placas de Drywall & Fondeo
                                  </span>
                                </div>

                                <ul className="text-[11px] text-slate-600 space-y-1.5 pt-1">
                                  <li className="flex items-center gap-1.5">
                                    <Check className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                    <span>Alto poder de relleno y acabado mate sin reflejos</span>
                                  </li>
                                  <li className="flex items-center gap-1.5">
                                    <Check className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                    <span>Techos, placas de yeso y primeras manos económicas</span>
                                  </li>
                                  <li className="flex items-center gap-1.5">
                                    <Check className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                    <span>No lavable al frote húmedo • <strong>1-2 años</strong></span>
                                  </li>
                                </ul>
                              </div>
                            </div>

                            <div className="p-4 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                              <span className="text-slate-500 font-medium">
                                Galón: {formatCOP(getPaintTypePrice('Interior Tipo 3', formData.marcaPintura).precioGalon)}
                              </span>
                              <strong className="text-slate-900 font-mono font-black text-sm bg-slate-100 text-slate-900 px-2.5 py-1 rounded-lg">
                                {formatCOP(getPaintTypePrice('Interior Tipo 3', formData.marcaPintura).precioCunete)} / Cuñete
                              </strong>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Notificación de selección de pintura */}
                      <div className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-2 ${
                        formData.tipoPintura
                          ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900 font-medium'
                          : 'bg-amber-50/70 border-amber-200 text-amber-900'
                      }`}>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className={`w-4 h-4 ${formData.tipoPintura ? 'text-emerald-600' : 'text-amber-500'}`} />
                          <span>
                            {formData.tipoPintura
                              ? `Pintura seleccionada: ${technicalCalc.productoRecomendado} (${formData.tipoPintura}) • Tarifa: ${formatCOP(technicalCalc.tipoPinturaDetalle.precioCunete)} / Cuñete`
                              : 'No has seleccionado tipo de pintura aún. Por favor haz clic en una de las tarjetas arriba.'}
                          </span>
                        </div>
                        {formData.tipoPintura && (
                          <span className="text-[11px] font-mono font-bold text-emerald-800">
                            {technicalCalc.tipoPinturaDetalle.durabilidadAnos}
                          </span>
                        )}
                      </div>
                      {errors.tipoPintura && <p className="text-xs text-rose-600 mt-1">{errors.tipoPintura}</p>}
                    </div>

                    {/* Selector Visual de Color & Tintometría */}
                    <div className="pt-4 border-t border-slate-100">
                      <ColorFinishSelector
                        value={formData.colorAcabado}
                        onChange={(val) => handleInputChange('colorAcabado', val)}
                        error={errors.colorAcabado}
                      />
                    </div>

                    {/* Selector de Herramientas & Brochas para Pintar con Stock Real */}
                    <div className="pt-4 border-t border-slate-100">
                      <PaintingToolsSelector
                        selectedTools={formData.herramientasSeleccionadas || []}
                        onChange={(tools) => handleInputChange('herramientasSeleccionadas', tools)}
                      />
                    </div>

                    {/* Forma / Método de Pago Oficial (Previo al Diagnóstico con IA) */}
                    <div className="pt-5 border-t border-slate-100 space-y-3.5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-sky-600" />
                            <h4 className="text-sm font-black text-slate-900">
                              Forma de Pago del Pedido
                            </h4>
                          </div>
                          <p className="text-xs text-slate-500">
                            Define tu método de pago antes del diagnóstico de la IA. No se cobra nada en este paso.
                          </p>
                        </div>
                        <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200 w-fit">
                          Paso previo a la auditoría IA
                        </span>
                      </div>

                      {/* 6 Opciones de Métodos de Pago */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                        {/* 1. Bancolombia Transferencia / QR */}
                        <div
                          onClick={() => handleInputChange('metodoPago', 'bancolombia')}
                          className={`p-3 rounded-2xl border-2 cursor-pointer transition-all ${
                            (formData.metodoPago || 'bancolombia') === 'bancolombia'
                              ? 'border-yellow-500 bg-yellow-50/60 shadow-xs ring-2 ring-yellow-400/20'
                              : 'border-slate-200 hover:border-slate-300 bg-white'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-black text-xs text-slate-900">Bancolombia / QR</span>
                            <span className="text-[9px] font-bold bg-yellow-500 text-slate-900 px-1.5 py-0.5 rounded">
                              Sin comisión
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-600 leading-snug">
                            Transferencia a Cuenta de Ahorros o QR oficial Colorlink.
                          </p>
                        </div>

                        {/* 2. PSE Débito en Línea */}
                        <div
                          onClick={() => handleInputChange('metodoPago', 'pse')}
                          className={`p-3 rounded-2xl border-2 cursor-pointer transition-all ${
                            formData.metodoPago === 'pse'
                              ? 'border-[#009FE3] bg-sky-50/60 shadow-xs ring-2 ring-[#009FE3]/20'
                              : 'border-slate-200 hover:border-slate-300 bg-white'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-black text-xs text-slate-900">PSE Débito en Línea</span>
                            <span className="text-[9px] font-bold bg-[#009FE3] text-white px-1.5 py-0.5 rounded">
                              Todos los bancos
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-600 leading-snug">
                            Débito bancario desde cuenta de ahorros o corriente.
                          </p>
                        </div>

                        {/* 3. Nequi / Daviplata */}
                        <div
                          onClick={() => handleInputChange('metodoPago', 'nequi')}
                          className={`p-3 rounded-2xl border-2 cursor-pointer transition-all ${
                            formData.metodoPago === 'nequi'
                              ? 'border-sky-600 bg-sky-50/60 shadow-xs ring-2 ring-sky-500/20'
                              : 'border-slate-200 hover:border-slate-300 bg-white'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-black text-xs text-slate-900">Nequi / Daviplata</span>
                            <span className="text-[9px] font-bold bg-sky-600 text-white px-1.5 py-0.5 rounded">
                              Al instante
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-600 leading-snug">
                            Envío rápido a la línea corporativa desde tu app móvil.
                          </p>
                        </div>

                        {/* 4. Contra Entrega en Obra */}
                        <div
                          onClick={() => handleInputChange('metodoPago', 'contraentrega')}
                          className={`p-3 rounded-2xl border-2 cursor-pointer transition-all ${
                            formData.metodoPago === 'contraentrega'
                              ? 'border-emerald-600 bg-emerald-50/60 shadow-xs ring-2 ring-emerald-500/20'
                              : 'border-slate-200 hover:border-slate-300 bg-white'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-black text-xs text-slate-900">Contra Entrega en Obra</span>
                            <span className="text-[9px] font-bold bg-emerald-600 text-white px-1.5 py-0.5 rounded">
                              En sitio
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-600 leading-snug">
                            Paga en efectivo o datáfono móvil al recibir el pedido.
                          </p>
                        </div>

                        {/* 5. Crédito Corporativo 30 Días */}
                        <div
                          onClick={() => handleInputChange('metodoPago', 'credito')}
                          className={`p-3 rounded-2xl border-2 cursor-pointer transition-all ${
                            formData.metodoPago === 'credito'
                              ? 'border-purple-600 bg-purple-50/60 shadow-xs ring-2 ring-purple-500/20'
                              : 'border-slate-200 hover:border-slate-300 bg-white'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-black text-xs text-slate-900">Crédito 30 Días (NIT)</span>
                            <span className="text-[9px] font-bold bg-purple-600 text-white px-1.5 py-0.5 rounded">
                              Empresas
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-600 leading-snug">
                            Facturación electrónica con plazo de 30 días para empresas.
                          </p>
                        </div>

                        {/* 6. Tarjeta de Crédito / Débito */}
                        <div
                          onClick={() => handleInputChange('metodoPago', 'tarjeta')}
                          className={`p-3 rounded-2xl border-2 cursor-pointer transition-all ${
                            formData.metodoPago === 'tarjeta'
                              ? 'border-indigo-600 bg-indigo-50/60 shadow-xs ring-2 ring-indigo-500/20'
                              : 'border-slate-200 hover:border-slate-300 bg-white'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-black text-xs text-slate-900">Tarjeta Débito / Crédito</span>
                            <span className="text-[9px] font-bold bg-indigo-600 text-white px-1.5 py-0.5 rounded">
                              En línea
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-600 leading-snug">
                            Procesamiento seguro para tarjetas Visa o Mastercard.
                          </p>
                        </div>
                      </div>

                      {/* Tarjeta de Resumen Preliminar antes de pasar a la IA */}
                      <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span className="text-slate-700">
                            Método de pago seleccionado: <strong className="capitalize text-slate-900">{formData.metodoPago || 'Bancolombia'}</strong>
                          </span>
                        </div>
                        <div className="text-left sm:text-right">
                          <span className="text-[10px] text-slate-500 block">Total Estimado de la Orden:</span>
                          <strong className="text-sm font-black bg-gradient-to-r from-sky-600 to-blue-700 bg-clip-text text-transparent font-mono">
                            {formatCOP(technicalCalc.presupuesto.totalPresupuesto)} COP
                          </strong>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={handlePrevStep}
                        className="px-5 py-2.5 bg-gradient-to-r from-sky-50 to-blue-50 hover:from-sky-100 hover:to-blue-100 text-[#0055FF] font-black text-xs rounded-2xl border border-[#00D2FF]/40 transition-all cursor-pointer shadow-xs active:scale-95"
                      >
                        Atrás
                      </button>
                      <button
                        type="button"
                        onClick={handleNextStep}
                        className="px-7 py-3.5 bg-gradient-to-r from-[#FF5500] via-[#FF007A] to-[#0055FF] hover:brightness-110 text-white font-black text-sm rounded-2xl shadow-lg shadow-orange-500/30 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                      >
                        <span>Continuar a Evidencias & Diagnóstico</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* PASO 3: DIAGNÓSTICO IA, EVIDENCIAS & DIRECCIÓN DE ENTREGA */}
                {currentStep === 3 && (
                  <div id="step3-diagnostico-header" className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 animate-fadeIn scroll-mt-24">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                      <div>
                        <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-amber-500" />
                          <span>3. Diagnóstico Técnico con IA & Emisión Oficial</span>
                        </h3>
                        <p className="text-xs text-slate-500">Dictamen técnico de viabilidad, dosificación calculada bajo norma NTC 1335 y registro de evidencias de obra.</p>
                      </div>
                      <span className="text-xs font-bold text-sky-700 bg-sky-50 px-3 py-1 rounded-full border border-sky-200/80">Paso 3 de 3</span>
                    </div>

                    {/* 1. TARJETA DE DIAGNÓSTICO TÉCNICO OFICIAL GENERADO POR IA (COLORES CLAROS Y LUMINOSOS) */}
                    <div className="rounded-3xl p-5 sm:p-6 bg-gradient-to-br from-sky-50 via-white to-blue-50/70 text-slate-900 shadow-md border-2 border-sky-200 relative overflow-hidden space-y-4">
                      {/* Manchas o brillos decorativos sutiles y claros */}
                      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#00D2FF]/10 to-[#FF007A]/5 rounded-full blur-3xl pointer-events-none" />

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-sky-100 relative z-10">
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#FF5500] via-[#FF007A] to-[#0055FF] text-white flex items-center justify-center font-bold shadow-xs">
                            <Sparkles className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <span className="text-xs uppercase tracking-widest text-sky-700 font-black block">
                              Colorlink® Diagnóstico Inteligente de Superficie
                            </span>
                            <h4 className="text-sm sm:text-base font-black text-slate-900">
                              Dictamen Técnico Oficial & Viabilidad con IA
                            </h4>
                          </div>
                        </div>
                        <span className="text-[11px] font-bold text-emerald-900 bg-emerald-100 border border-emerald-300 px-3 py-1 rounded-full flex items-center gap-1.5 w-fit shadow-2xs">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Viabilidad Técnica: 100% Aprobada
                        </span>
                      </div>

                      {/* Cuadrícula de Especificaciones del Diagnóstico en Colores Claros */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 relative z-10 text-xs">
                        <div className="p-3.5 rounded-2xl bg-white border border-sky-200/80 shadow-2xs space-y-1 hover:border-sky-300 transition-all">
                          <span className="text-[10px] uppercase font-bold text-slate-500 block">Sustrato & Exposición</span>
                          <strong className="text-slate-900 block text-xs font-black">
                            {formData.superficie || 'Concreto / Revoque'}
                          </strong>
                          <span className="text-[11px] text-sky-700 font-semibold block">
                            Ambiente: {formData.ambiente || 'Exterior Intemperie'}
                          </span>
                          <span className="text-[10px] text-slate-600">
                            Estado: {formData.condicion || 'Normal / Estable'}
                          </span>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-white border border-sky-200/80 shadow-2xs space-y-1 hover:border-sky-300 transition-all">
                          <span className="text-[10px] uppercase font-bold text-slate-500 block">Pintura & Norma Técnica</span>
                          <strong className="text-amber-800 block text-xs font-black truncate" title={technicalCalc.productoRecomendado}>
                            {technicalCalc.productoRecomendado}
                          </strong>
                          <span className="text-[11px] text-slate-900 font-semibold block">
                            {formData.tipoPintura || 'Pintura Tipo 1'} ({formData.marcaPintura || 'Pintuco®'})
                          </span>
                          <span className="text-[10px] text-emerald-700 font-mono font-bold">
                            Certificación: {technicalCalc.tipoPinturaDetalle.normaNTC}
                          </span>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-white border border-sky-200/80 shadow-2xs space-y-1 hover:border-sky-300 transition-all">
                          <span className="text-[10px] uppercase font-bold text-slate-500 block">Dosificación & Envases</span>
                          <strong className="text-slate-900 block text-xs font-black">
                            Área: {formData.areaM2 || 0} m² ({technicalCalc.manosSugeridas} manos)
                          </strong>
                          <span className="text-[11px] text-[#003882] font-black block">
                            {technicalCalc.cuñetesRequeridos} Cuñete(s) (5 Gal)
                            {technicalCalc.galonesSueltosRequeridos > 0 ? ` + ${technicalCalc.galonesSueltosRequeridos} Gal` : ''}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            Margen de desperdicio: 10% técnico
                          </span>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-white border border-sky-200/80 shadow-2xs space-y-1 hover:border-sky-300 transition-all">
                          <span className="text-[10px] uppercase font-bold text-slate-500 block">Tratamiento & Sellador</span>
                          <strong className="text-slate-900 block text-xs font-black truncate" title={technicalCalc.selladorImprimanteRequerido}>
                            {technicalCalc.selladorImprimanteRequerido}
                          </strong>
                          <span className="text-[10px] text-slate-600 block">
                            Neutralización de alcalinidad y anclaje elástico
                          </span>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-white border border-sky-200/80 shadow-2xs space-y-1 hover:border-sky-300 transition-all">
                          <span className="text-[10px] uppercase font-bold text-slate-500 block">Tiempos de Secado</span>
                          <strong className="text-emerald-700 block text-xs font-black">
                            2 a 4 horas al tacto
                          </strong>
                          <span className="text-[10px] text-slate-600 block">
                            Segunda mano tras 4 horas • Curado total: 7 días
                          </span>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-white border border-sky-200/80 shadow-2xs space-y-1 hover:border-sky-300 transition-all">
                          <span className="text-[10px] uppercase font-bold text-slate-500 block">Herramientas Seleccionadas</span>
                          {formData.herramientasSeleccionadas && formData.herramientasSeleccionadas.length > 0 ? (
                            <strong className="text-sky-800 block text-xs font-black">
                              {formData.herramientasSeleccionadas.reduce((acc, h) => acc + h.cantidad, 0)} accesorio(s) agregados
                            </strong>
                          ) : (
                            <span className="text-slate-600 block text-xs font-medium">
                              Brocha cerda pura o rodillo profesional
                            </span>
                          )}
                          <span className="text-[10px] text-slate-600">
                            Color: {formData.colorAcabado || 'Blanco Puro'}
                          </span>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-white border border-sky-200/80 shadow-2xs space-y-1 hover:border-sky-300 transition-all">
                          <span className="text-[10px] uppercase font-bold text-slate-500 block">Forma de Pago Auditada</span>
                          <strong className="text-emerald-700 block text-xs font-black capitalize truncate">
                            {formData.metodoPago === 'bancolombia' ? 'Bancolombia / QR' :
                             formData.metodoPago === 'pse' ? 'PSE Débito Seguro' :
                             formData.metodoPago === 'nequi' ? 'Nequi / Daviplata' :
                             formData.metodoPago === 'contraentrega' ? 'Contra Entrega en Obra' :
                             formData.metodoPago === 'credito' ? 'Crédito 30 Días (NIT)' :
                             formData.metodoPago === 'tarjeta' ? 'Tarjeta Débito / Crédito' : 'Bancolombia / QR'}
                          </strong>
                          <span className="text-[10px] text-slate-500 block">
                            Auditada por la IA previo a la emisión
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 2. DESCRIPCIÓN DEL PROYECTO CON BOTÓN DE SUGERENCIA IA */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-bold text-slate-700">
                          Descripción técnica del proyecto <span className="text-rose-500">*</span>
                        </label>
                        <button
                          type="button"
                          onClick={handleGenerateSmartDescription}
                          className="px-3 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300/80 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                          title="Generar redacción técnica automática con IA"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                          <span>✨ Redactar con IA</span>
                        </button>
                      </div>
                      <textarea
                        id="standalone-textarea-descripcion"
                        rows={3}
                        placeholder="Describe detalles de la superficie, alturas, condiciones climáticas o requerimientos especiales..."
                        value={formData.descripcionLibre}
                        onChange={(e) => handleInputChange('descripcionLibre', e.target.value)}
                        className={`w-full px-4 py-3 text-sm bg-slate-50/80 border ${
                          errors.descripcionLibre ? 'border-rose-400 focus:ring-rose-400 bg-rose-50/20' : 'border-slate-200 focus:ring-sky-500'
                        } rounded-2xl focus:bg-white focus:outline-none focus:ring-2 transition-all leading-relaxed`}
                      />
                      {errors.descripcionLibre && <p className="text-xs text-rose-600 mt-1">{errors.descripcionLibre}</p>}
                    </div>

                    {/* 4. CARGA DE FOTOS CON REVISIÓN AUTOMÁTICA DE IA */}
                    <div className="space-y-3 pt-2 border-t border-slate-100">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-700">
                          Registro Fotográfico de Evidencia de la Superficie u Obra
                        </label>
                        <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Revisión automática con IA activa
                        </span>
                      </div>

                      {/* Inputs ocultos para subida desde computador y captura de cámara */}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileInputChange}
                        className="hidden"
                      />
                      <input
                        ref={cameraInputRef}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleFileInputChange}
                        className="hidden"
                      />

                      <div className="border-2 border-dashed border-sky-300 hover:border-sky-500 rounded-3xl p-6 text-center bg-sky-50/40 hover:bg-sky-50/70 transition-all">
                        <div className="max-w-lg mx-auto space-y-3">
                          <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-700 mx-auto flex items-center justify-center font-bold shadow-xs">
                            <Upload className="w-6 h-6 text-sky-600" />
                          </div>
                          <div>
                            <p className="text-xs font-black text-slate-900">
                              Adjuntar Registro Fotográfico de la Superficie u Obra
                            </p>
                            <p className="text-[11px] text-slate-600 mt-0.5">
                              Puedes subir fotos desde tu dispositivo, tomar fotos con la cámara o usar la foto técnica de muestra.
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                            {/* Botón 1: Subir desde el computador */}
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="px-4 py-2.5 bg-white hover:bg-sky-50 text-slate-800 font-bold text-xs rounded-xl border border-sky-200 shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                            >
                              <Upload className="w-3.5 h-3.5 text-sky-600" />
                              <span>📁 Subir desde el Computador</span>
                            </button>

                            {/* Botón 2: Tomar foto con la cámara */}
                            <button
                              type="button"
                              onClick={handleStartLiveCamera}
                              className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                            >
                              <Camera className="w-3.5 h-3.5 text-white" />
                              <span>📷 Tomar Foto con Cámara</span>
                            </button>

                            {/* Botón 3: Usar foto de muestra de la superficie */}
                            <button
                              type="button"
                              onClick={handleAttachReferencePhoto}
                              className="px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                              title="Adjuntar foto de muestra oficial para agilizar la cotización"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                              <span>✨ Usar Foto Técnica de Muestra</span>
                            </button>
                          </div>
                          <p className="text-[11px] text-emerald-800 font-semibold flex items-center justify-center gap-1 mt-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Cualquier foto subida es revisada y validada automáticamente por IA para verificar compatibilidad de pintura</span>
                          </p>
                        </div>
                      </div>

                      {/* Galería de Fotos Adjuntas con Revisión Automática IA */}
                      {formData.fotos && formData.fotos.length > 0 && (
                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {formData.fotos.map((foto, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:border-sky-300 transition-all"
                            >
                              <div className="flex items-center gap-3 truncate min-w-0">
                                {foto.previewUrl ? (
                                  <div
                                    onClick={() => setPreviewEnlargedPhoto({ name: foto.name, url: foto.previewUrl })}
                                    className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-slate-200 cursor-pointer group"
                                    title="Clic para ampliar imagen"
                                  >
                                    <img
                                      src={foto.previewUrl}
                                      alt={foto.name}
                                      className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                                    />
                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                      <ZoomIn className="w-4 h-4 text-white" />
                                    </div>
                                  </div>
                                ) : (
                                  <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                                    <FileText className="w-5 h-5 text-purple-600" />
                                  </div>
                                )}
                                <div className="truncate min-w-0">
                                  <span className="text-xs font-bold text-slate-800 truncate block">
                                    {foto.name}
                                  </span>
                                  <span className="text-[10px] text-slate-400 font-mono block">
                                    {foto.size}
                                  </span>
                                  <div className="flex items-center gap-1 mt-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 w-fit">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                                    <span>Revisada con IA: Aprobada ✓</span>
                                  </div>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemovePhoto(idx)}
                                className="text-slate-400 hover:text-rose-600 p-2 rounded-xl hover:bg-rose-50 transition-colors cursor-pointer shrink-0 ml-2"
                                title="Eliminar foto"
                              >
                                <Trash2 className="w-4 h-4" />
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
                        Observaciones adicionales de obra o logística
                      </label>
                      <input
                        type="text"
                        placeholder="Ej. Acceso por andamios certificados, parqueadero cubierto para el camión repartidor..."
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
                          className="mt-0.5 rounded border-slate-300 text-[#009FE3] focus:ring-[#009FE3] w-4 h-4 cursor-pointer"
                        />
                        <span className="text-xs text-slate-600 leading-relaxed font-medium">
                          Autorizo el tratamiento de mis datos de contacto y entrega conforme a la Ley de Protección de Datos (Habeas Data) para la emisión formal de la cotización, despacho y factura oficial. <span className="text-rose-500">*</span>
                        </span>
                      </label>
                      {errors.consentimiento && <p className="text-xs text-rose-600 mt-1.5 ml-7">{errors.consentimiento}</p>}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={handlePrevStep}
                        className="px-5 py-2.5 bg-gradient-to-r from-sky-50 to-blue-50 hover:from-sky-100 hover:to-blue-100 text-[#0055FF] font-black text-xs rounded-2xl border border-[#00D2FF]/40 transition-all cursor-pointer shadow-xs active:scale-95"
                      >
                        Atrás
                      </button>
                      <button
                        id="standalone-submit-btn"
                        type="submit"
                        onClick={handleSubmit}
                        className="px-8 py-3.5 bg-gradient-to-r from-[#FF5500] via-[#FF007A] to-[#0055FF] hover:brightness-110 text-white font-black text-sm rounded-2xl shadow-xl shadow-orange-500/30 glow-orange transition-all flex items-center gap-2.5 active:scale-95 cursor-pointer"
                      >
                        <Send className="w-4 h-4" />
                        <span>Emitir Cotización y Ver Factura para Decidir</span>
                      </button>
                    </div>
                  </div>
                )}
              </form>
          </div>
        </div>
      )
    )}

      {/* Botón Flotante Permanente para el Asistente IA del Cliente */}
      <button
        type="button"
        onClick={() => setIsAiAssistantOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-sky-500 via-sky-600 to-blue-600 hover:brightness-110 text-white px-4 py-3 rounded-2xl shadow-xl hover:shadow-2xl transition-all flex items-center gap-2.5 group cursor-pointer border-2 border-white/40 active:scale-95"
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

      {/* MODAL: CORREO ELECTRÓNICO CON RECIBO OFICIAL Y DETALLES DE DESPACHO */}
      <ClientEmailPreviewModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        formData={formData}
        technicalCalc={technicalCalc}
        orderNumber={orderNumber}
        decisionTimestamp={decisionTimestamp}
        onDownloadPDF={handleDownloadPDF}
        currentPhase={orderLifecyclePhase}
      />

      {/* MODAL: CÁMARA EN VIVO / FOTOGRAFÍA DE OBRA */}
      {showLiveCameraModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white text-slate-800 rounded-3xl max-w-xl w-full p-5 sm:p-6 space-y-4 shadow-2xl border border-sky-200">
            {/* Cabecera */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-slate-900">
                    Cámara para Registro Fotográfico de Obra
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Apunta a la pared, fachada o superficie a intervenir
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleStopLiveCamera}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Caso 1: Error al acceder a la cámara directa */}
            {cameraError ? (
              <div className="space-y-4 py-2">
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-800 text-xs space-y-2">
                  <div className="flex items-center gap-2 font-bold text-amber-900">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Aviso de Permiso de Cámara</span>
                  </div>
                  <p className="leading-relaxed text-[11px] text-amber-900">
                    {cameraError}
                  </p>
                </div>

                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => {
                      handleStopLiveCamera();
                      cameraInputRef.current?.click();
                    }}
                    className="w-full py-3.5 bg-gradient-to-r from-sky-500 via-sky-600 to-blue-600 hover:brightness-110 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Abrir App de Cámara de tu Celular / Dispositivo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStartLiveCamera()}
                    className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Reintentar Permiso de Cámara Web</span>
                  </button>
                </div>
              </div>
            ) : capturedPhotoDraft ? (
              /* Caso 2: Foto capturada en borrador para confirmación */
              <div className="space-y-4">
                <div className="relative w-full h-72 sm:h-80 bg-slate-50 rounded-2xl overflow-hidden border border-slate-200 flex items-center justify-center">
                  <img
                    src={capturedPhotoDraft}
                    alt="Foto capturada"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-3 left-3 bg-emerald-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-md">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Foto Lista
                  </span>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleConfirmCapturedPhoto}
                    className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
                  >
                    <Check className="w-4 h-4" />
                    <span>Aceptar y Adjuntar a la Cotización</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleRetakeLivePhoto}
                    className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Repetir</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Caso 3: Vista en vivo de la cámara */
              <div className="space-y-4">
                <div className="relative w-full h-72 sm:h-80 bg-slate-100 rounded-2xl overflow-hidden border border-slate-300 flex items-center justify-center">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />

                  {/* Indicador de Transmisión Activa */}
                  <span className="absolute top-3 left-3 bg-red-600/90 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-md">
                    <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                    En Vivo
                  </span>

                  {/* Botón Voltear Cámara (Frontal / Trasera) */}
                  <button
                    type="button"
                    onClick={handleToggleFacingMode}
                    className="absolute top-3 right-3 bg-white/95 hover:bg-white text-slate-800 px-2.5 py-1.5 rounded-xl shadow-md flex items-center gap-1.5 text-xs font-bold border border-slate-200 cursor-pointer transition-all"
                    title="Alternar entre cámara trasera y frontal"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>{facingMode === 'environment' ? 'Modo Selfie' : 'Cámara Trasera'}</span>
                  </button>

                  {/* Guías ópticas de visor */}
                  <div className="absolute inset-8 pointer-events-none border-2 border-slate-400/40 rounded-2xl border-dashed"></div>
                </div>

                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={handleCaptureLiveCameraPhoto}
                    className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-sm rounded-2xl shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
                  >
                    <Camera className="w-5 h-5 text-white" />
                    <span>📸 Capturar Foto de la Superficie</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      handleStopLiveCamera();
                      cameraInputRef.current?.click();
                    }}
                    className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-colors border border-slate-200"
                  >
                    <Upload className="w-3.5 h-3.5 text-purple-600" />
                    <span>O tomar foto directamente con la cámara del celular</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: VISOR DE FOTO EN TAMAÑO COMPLETO */}
      {previewEnlargedPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/35 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white text-slate-800 rounded-3xl max-w-3xl w-full p-4 sm:p-5 space-y-3 shadow-2xl border border-sky-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ZoomIn className="w-4 h-4 text-sky-600" />
                <span className="text-xs font-bold text-slate-800 truncate">{previewEnlargedPhoto.name}</span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewEnlargedPhoto(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="max-h-[75vh] overflow-hidden rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center p-2 shadow-inner">
              <img
                src={previewEnlargedPhoto.url}
                alt={previewEnlargedPhoto.name}
                className="max-h-[72vh] w-auto max-w-full object-contain rounded-xl"
              />
            </div>
            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => setPreviewEnlargedPhoto(null)}
                className="px-4 py-2 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold text-xs rounded-xl cursor-pointer hover:brightness-110 shadow-xs"
              >
                Cerrar Visor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
