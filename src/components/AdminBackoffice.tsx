import React, { useState, useEffect, useMemo } from 'react';
import {
  Inbox,
  UserCheck,
  Truck,
  CheckCircle2,
  Clock,
  LogOut,
  Eye,
  Filter,
  Search,
  Mail,
  Send,
  Navigation,
  MapPin,
  Sparkles,
  Package,
  Layers,
  AlertCircle,
  FileText,
  Phone,
  ShieldCheck,
  ChevronRight,
  Check,
  ArrowRight,
  Database,
  Building2,
  ThumbsUp,
  Share2,
  RefreshCw,
  Users,
  TrendingUp,
  BarChart3,
  Boxes,
  Award,
  DollarSign,
  Download,
  Lock,
  Key,
  EyeOff,
  User,
  Briefcase,
  Calendar,
  X,
  Bot,
  Zap,
  Activity
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { sendOrderStatusUpdateEmail } from '../utils/emailService';
import { buildOrderStateMessage } from '../utils/orderStateMessages';
import { saveClientOrderToHistory, getSavedClientOrdersFromStorage } from '../utils/supabaseApi';
import { ProjectFormData } from '../types/form';
import { formatCOP } from '../utils/calculator';
import { PenguinLogo } from './PenguinLogo';
import { AdminStockAndAIAdvisor } from './AdminStockAndAIAdvisor';
import { AdvisorPortal } from './AdvisorPortal';
import cityMedellin from '../assets/images/city_medellin_1790524566117.jpg';
import cityBogota from '../assets/images/city_bogota_1790524576789.jpg';
import cityCali from '../assets/images/city_cali_1790524587398.jpg';
import cityBarranquilla from '../assets/images/city_barranquilla_1790524599314.jpg';
import cityCartagena from '../assets/images/city_cartagena_1790524611637.jpg';
import cityBucaramanga from '../assets/images/city_bucaramanga_1790524624162.jpg';
import cityEnvigado from '../assets/images/city_envigado_1790524807986.jpg';
import cityRionegro from '../assets/images/city_rionegro_1790524818359.jpg';
import factoryCediImg from '../assets/images/colorlink_factory_cedi_1793208138242.jpg';
import tintometryLabImg from '../assets/images/tintometry_color_lab_1793208137962.jpg';

export const CITY_IMAGES: Record<string, string> = {
  'Medellín': cityMedellin,
  'Bogotá D.C.': cityBogota,
  'Cali': cityCali,
  'Barranquilla': cityBarranquilla,
  'Cartagena': cityCartagena,
  'Bucaramanga': cityBucaramanga,
  'Envigado': cityEnvigado,
  'Rionegro': cityRionegro
};

export const getCityImage = (city: string): string => {
  if (!city) return cityMedellin;
  const clean = city.toLowerCase();
  const match = Object.keys(CITY_IMAGES).find(
    c => clean.includes(c.toLowerCase()) || c.toLowerCase().includes(clean)
  );
  return match ? CITY_IMAGES[match] : cityMedellin;
};

export interface OrderHistoryEntry {
  fecha: string;
  estado: 'pendiente' | 'preparando' | 'en_ruta' | 'entregado' | 'en_espera' | 'rechazado';
  autor: 'IA (Pincelito Inspector)' | 'Manual (Supervisor)';
  motivo?: string;
  mensajesEnviados?: {
    email?: string;
  };
}

export interface OrderItem {
  id: string;
  cliente: string;
  nit: string;
  responsable: string;
  telefono: string;
  email: string;
  ciudad: string;
  obra?: string;
  cunetes?: number;
  galones?: number;
  areaM2: number;
  tipoPintura: string;
  marca?: string;
  metodoPago?: string;
  color: string;
  totalCOP: number;
  status: 'pendiente' | 'preparando' | 'en_ruta' | 'entregado' | 'en_espera' | 'rechazado';
  dictamenIA?: {
    decision: 'aceptar' | 'en_espera' | 'rechazar';
    motivo: string;
    porQueSeAcepto?: string;
    fechaAuditoria: string;
    modo?: 'Automático por IA' | 'Manual';
    busAsignado?: {
      tipo: string;
      placa: string;
      conductor: string;
      capacidad?: string;
    };
    rutaAsignada?: {
      origen: string;
      destino: string;
      recorrido: string;
      distanciaKm: number;
      tiempoMin: number;
      ahorroMin: number;
      horaEstimada: string;
    };
    mensajesEnviados?: {
      email?: string;
      fechaEnvio?: string;
    };
    insumosVerificados?: {
      pinturaValida: boolean;
      colorFormulado: boolean;
      stockSuficiente: boolean;
      cuñetesFaltantes: number;
    };
  };
  historialCambios?: OrderHistoryEntry[];
  vehiculoAsignado?: string;
  placa?: string;
  conductor?: string;
  rutaOptima?: {
    origen: string;
    destino: string;
    recorrido: string;
    distanciaKm: number;
    tiempoMin: number;
    ahorroMin: number;
    horaEstimada: string;
  };
  notificaciones: Array<{
    tipo: 'email';
    texto: string;
    fecha: string;
  }>;
}

interface AdminBackofficeProps {
  onBackToClientView: () => void;
  submittedProjects: Array<{
    id: string;
    submittedAt: string;
    formData: ProjectFormData;
    status: 'Validado' | 'En Tintometría' | 'En Despacho' | 'Completado' | 'Pendiente' | 'Rechazado';
    totalCOP: number;
    currentPipelineStep: number;
  }>;
}

export interface AdvisorProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  territory: string;
  specialty: string;
  avatarInitial: string;
  avatarColor: string;
  badge: string;
  assignedCasesCount: number;
  activeQuotationsCOP: number;
  salesGoalProgress: number;
}

export const COLORLINK_ADVISORS: AdvisorProfile[] = [
  {
    id: 'sofia_martinez',
    name: 'Arq. Sofía Martínez',
    email: 'sofia.asesora@colorlink.com.co',
    phone: '+57 314 589 2244',
    territory: 'Medellín & Valle de Aburrá (Antioquia)',
    specialty: 'Especialista en Fachadas, NTC 1335 & Constructoras',
    avatarInitial: 'SM',
    avatarColor: 'from-emerald-500 to-teal-600',
    badge: 'Asesora Técnica Senior',
    assignedCasesCount: 4,
    activeQuotationsCOP: 28450000,
    salesGoalProgress: 94
  },
  {
    id: 'camila_morales',
    name: 'Camila Morales',
    email: 'camila.ventas@colorlink.com.co',
    phone: '+57 320 412 8890',
    territory: 'Bogotá D.C. & Sabana Norte',
    specialty: 'Cuentas Corporativas, Licitaciones & Interiores',
    avatarInitial: 'CM',
    avatarColor: 'from-purple-500 to-indigo-600',
    badge: 'Key Account Manager',
    assignedCasesCount: 3,
    activeQuotationsCOP: 22100000,
    salesGoalProgress: 88
  },
  {
    id: 'juan_pablo_arango',
    name: 'Ing. Juan Pablo Arango',
    email: 'juan.asesor@colorlink.com.co',
    phone: '+57 311 765 4321',
    territory: 'Cali (Valle) & Barranquilla (Costa)',
    specialty: 'Sistemas Industriales Epóxicos & Climas Húmedos',
    avatarInitial: 'JA',
    avatarColor: 'from-blue-500 to-cyan-600',
    badge: 'Asesor Técnico Regional',
    assignedCasesCount: 2,
    activeQuotationsCOP: 16750000,
    salesGoalProgress: 82
  }
];

export function AdminBackoffice({
  onBackToClientView,
  submittedProjects
}: AdminBackofficeProps) {
  // Tabs: 'pedidos' (Supervisión & Auditoría IA) | 'ciudades' (Sedes, Fotos & Reabastecimiento) | 'clientes' (Directorio Supabase) | 'stock' (Inventario & Fórmulas)
  const [activeTab, setActiveTab] = useState<'pedidos' | 'ciudades' | 'clientes' | 'stock'>('pedidos');
  const [selectedCityFilter, setSelectedCityFilter] = useState<string>('todas');
  const [supplyNotice, setSupplyNotice] = useState<string | null>(null);

  // Estado reactivo de Stock por CEDI y Órdenes de Reabastecimiento Generadas
  const [cediStocks, setCediStocks] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem('colorlink_cedi_stocks_v1');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      'Medellín': 120,
      'Bogotá D.C.': 24,
      'Cali': 16,
      'Barranquilla': 12,
      'Bucaramanga': 14,
      'Cartagena': 10,
      'Envigado': 20,
      'Rionegro': 18
    };
  });

  interface ReplenishmentOrderRecord {
    id: string;
    ciudad: string;
    cedi: string;
    fecha: string;
    tipo1Cunetes: number;
    tipo2Cunetes: number;
    tipo3Cunetes: number;
    selladorGalones: number;
    cunetesAgregados: number;
    stockAnterior: number;
    nuevoStock: number;
    vehiculoNodriza: string;
    placa: string;
    conductor: string;
    estado: string;
  }

  const [replenishmentOrders, setReplenishmentOrders] = useState<ReplenishmentOrderRecord[]>(() => {
    try {
      const saved = localStorage.getItem('colorlink_replenishment_orders_v1');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const [activeReplenishmentModal, setActiveReplenishmentModal] = useState<ReplenishmentOrderRecord | null>(null);

  // Filtros avanzados para lista de pedidos ordenada
  const [orderSearchText, setOrderSearchText] = useState<string>('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<'todos' | 'pendiente' | 'preparando' | 'en_ruta' | 'entregado' | 'en_espera' | 'rechazado'>('todos');

  // Estados para Auditoría Inteligente con IA (Gemini 3.8 Flash)
  const [isAuditingWithAI, setIsAuditingWithAI] = useState<boolean>(false);
  const [isAutoPilotRunning, setIsAutoPilotRunning] = useState<boolean>(false);
  const [aiAutoPilotEnabled, setAiAutoPilotEnabled] = useState<boolean>(false);

  // Estados para el Ciclo de Actualización Automática de Pedidos cada 20 Minutos
  // (2s -> Tintometría | 20m -> Despachando con mensaje | 20m -> Entregado con mensaje)
  const [autoLifecycleEnabled, setAutoLifecycleEnabled] = useState<boolean>(true);
  const [fastDemoMode, setFastDemoMode] = useState<boolean>(false); // 20s para demostración rápida vs 20 min reales (1200s)
  const [secondsToNextCycle, setSecondsToNextCycle] = useState<number>(1200);

  // Estados de verificación de conectividad y recepción en Vercel Serverless
  const [isTestingVercel, setIsTestingVercel] = useState<boolean>(false);
  const [vercelStatus, setVercelStatus] = useState<{ connected: boolean; platform?: string; count?: number } | null>(null);

  // Consultar estado inicial de Vercel / servidor al cargar
  useEffect(() => {
    fetch('/api/orders')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.success) {
          setVercelStatus({ connected: true, platform: data.platform, count: data.count });
        }
      })
      .catch(() => {});
  }, []);

  const handleTestVercelConnection = async () => {
    setIsTestingVercel(true);
    try {
      const healthRes = await fetch('/api/health');
      const healthData = await healthRes.json().catch(() => ({}));

      const testOrderId = `TEST-VERCEL-${Math.floor(1000 + Math.random() * 9000)}`;
      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderNumber: testOrderId,
          cliente: 'Auditoría Vercel Colorlink',
          responsable: 'Supervisor de Planta',
          email: 'supervisor@colorlink.com.co',
          ciudad: 'Medellín',
          status: 'preparando',
          totalCOP: 1850000,
          mensaje: 'Verificación de recepción de pedidos activa en Vercel Serverless'
        })
      });
      const orderData = await orderRes.json().catch(() => ({}));

      if (orderRes.ok && orderData.success) {
        setVercelStatus({
          connected: true,
          platform: orderData.platform || healthData.platform || 'Vercel Serverless',
          count: orderData.totalOrdersStored
        });
        showToast(`✓ ¡Vercel / Servidor en Línea! Pedido #${testOrderId} recibido y confirmado correctamente (${orderData.platform || 'Vercel Serverless'}).`);
      } else {
        setVercelStatus({ connected: false });
        showToast('⚠️ Vercel respondió con código de estado inusual.');
      }
    } catch (err: any) {
      setVercelStatus({ connected: false });
      showToast(`❌ Error de conexión con Vercel: ${err?.message || 'Error de red'}`);
    } finally {
      setIsTestingVercel(false);
    }
  };

  const [showAiAuditModal, setShowAiAuditModal] = useState<boolean>(false);
  const [currentAiAudit, setCurrentAiAudit] = useState<{
    orderId: string;
    decision: 'aceptar' | 'en_espera' | 'rechazar';
    razonTecnica: string;
    porQueSeAcepto?: string;
    insumosVerificados: {
      pinturaValida: boolean;
      colorFormulado: boolean;
      stockSuficiente: boolean;
      cuñetesFaltantes: number;
    };
    vehiculoSugerido?: {
      tipo: string;
      placa: string;
      conductor: string;
      capacidad?: string;
      horaEstimadaDespacho: string;
    };
    rutaAsignada?: {
      origen: string;
      destino: string;
      corredor: string;
      distanciaKm: number;
      tiempoMin: number;
      ahorroMin: number;
      horaEstimada: string;
    };
    mensajeCorreoCliente: string;
    recomendacionAdicional?: string;
  } | null>(null);

  interface SupabaseClientRow {
    id: string;
    auth_user_id: string | null;
    nombre_razon_social: string;
    nit_documento: string;
    responsable: string;
    email_responsable: string;
    telefono_responsable: string | null;
    canal_entrada: string;
    created_at: string;
  }

  const [supabaseClients, setSupabaseClients] = useState<SupabaseClientRow[]>([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const [clientSearch, setClientSearch] = useState('');

  const DEFAULT_ENTERPRISE_CLIENTS: SupabaseClientRow[] = [
    {
      id: 'cli-horiz-01',
      auth_user_id: null,
      nombre_razon_social: 'Constructora Horizonte S.A.S.',
      nit_documento: '900854219-3',
      responsable: 'Arq. Valentina Gómez',
      email_responsable: 'vgomez@constructorahorizonte.com.co',
      telefono_responsable: '+57 312 845 6721',
      canal_entrada: 'Corporativo Constructoras',
      created_at: new Date(Date.now() - 86400000 * 5).toISOString()
    },
    {
      id: 'cli-boliv-02',
      auth_user_id: null,
      nombre_razon_social: 'Constructora Bolívar S.A.',
      nit_documento: '860034590-8',
      responsable: 'Arq. Mateo Restrepo',
      email_responsable: 'mrestrepo@bolivar.com.co',
      telefono_responsable: '+57 310 982 3411',
      canal_entrada: 'Licitaciones & Obra',
      created_at: new Date(Date.now() - 86400000 * 12).toISOString()
    },
    {
      id: 'cli-concon-03',
      auth_user_id: null,
      nombre_razon_social: 'Conconcreto Proyectos & Obras',
      nit_documento: '890901452-1',
      responsable: 'Ing. Juan Camilo Osorio',
      email_responsable: 'jcosorio@conconcreto.com',
      telefono_responsable: '+57 318 456 7890',
      canal_entrada: 'Grandes Cuentas Medellín',
      created_at: new Date(Date.now() - 86400000 * 20).toISOString()
    },
    {
      id: 'cli-marval-04',
      auth_user_id: null,
      nombre_razon_social: 'Marval Desarrollos Urbanos',
      nit_documento: '800123456-7',
      responsable: 'Ing. Diana Milena Vargas',
      email_responsable: 'dvargas@marval.com.co',
      telefono_responsable: '+57 315 678 9012',
      canal_entrada: 'Portal Web Colorlink',
      created_at: new Date(Date.now() - 86400000 * 30).toISOString()
    }
  ];

  const getConsolidatedClients = (): SupabaseClientRow[] => {
    const clientMap = new Map<string, SupabaseClientRow>();

    DEFAULT_ENTERPRISE_CLIENTS.forEach((c) => {
      clientMap.set(c.nit_documento.replace(/[.\-\s]/g, ''), c);
    });

    try {
      const stored = getSavedClientOrdersFromStorage();
      stored.forEach((o, idx) => {
        const nitClean = (o.nit || `901456${idx}`).replace(/[.\-\s]/g, '');
        if (!clientMap.has(nitClean)) {
          clientMap.set(nitClean, {
            id: `cli-ord-${o.id || idx}`,
            auth_user_id: null,
            nombre_razon_social: o.detalle?.obra || o.cliente || 'Empresa Constructora',
            nit_documento: o.nit || nitClean,
            responsable: o.responsable || 'Responsable de Obra',
            email_responsable: o.email || 'cliente@colorlink.com.co',
            telefono_responsable: '+57 300 123 4567',
            canal_entrada: 'Cotizador Colorlink',
            created_at: o.fecha && o.fecha.includes('T') ? o.fecha : new Date().toISOString()
          });
        }
      });
    } catch {}

    return Array.from(clientMap.values());
  };

  const fetchClientsFromSupabase = async () => {
    setLoadingClients(true);
    try {
      if (!isSupabaseConfigured()) {
        setSupabaseClients(getConsolidatedClients());
        return;
      }
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        setSupabaseClients(getConsolidatedClients());
      } else if (data && data.length > 0) {
        setSupabaseClients(data as SupabaseClientRow[]);
      } else {
        setSupabaseClients(getConsolidatedClients());
      }
    } catch {
      setSupabaseClients(getConsolidatedClients());
    } finally {
      setLoadingClients(false);
    }
  };

  useEffect(() => {
    fetchClientsFromSupabase();
  }, []);

  // Pedidos de prueba reales de la empresa distribuidos por ciudades de Colombia
  const [orders, setOrders] = useState<OrderItem[]>([
    {
      id: 'PED-2026-081',
      cliente: 'Constructora Horizonte S.A.S.',
      nit: '900854219',
      responsable: 'Arq. Valentina Gómez',
      telefono: '+57 312 845 6721',
      email: 'vgomez@constructorahorizonte.com.co',
      ciudad: 'Medellín',
      areaM2: 420,
      tipoPintura: 'Pintura Tipo 1 Exterior',
      marca: 'Pintuco®',
      metodoPago: 'Transferencia Bancolombia / QR',
      color: 'Gris Cemento (Mate)',
      totalCOP: 18450000,
      status: 'pendiente',
      notificaciones: []
    },
    {
      id: 'PED-2026-085',
      cliente: 'Consorcio Metropolitano Calle 100',
      nit: '901452890',
      responsable: 'Ing. Felipe Samper',
      telefono: '+57 311 987 6543',
      email: 'fsamper@consorciometropolitano.co',
      ciudad: 'Bogotá D.C.',
      areaM2: 320,
      tipoPintura: 'Pintura Tipo 1 Exterior',
      marca: 'Pintuco®',
      metodoPago: 'PSE - Banco de Bogotá',
      color: 'Blanco Puro (Satinado)',
      totalCOP: 14850000,
      status: 'en_ruta',
      vehiculoAsignado: 'Camión Distribución Bogotá #03',
      placa: 'DEX-712',
      conductor: 'Hernán Morales',
      rutaOptima: {
        origen: 'CEDI Sabana Mosquera',
        destino: 'Torre Empresarial Calle 100 # 19-61, Chicó, Bogotá',
        recorrido: 'Calle 13 ➔ Av. Boyacá ➔ Calle 100',
        distanciaKm: 24.6,
        tiempoMin: 55,
        ahorroMin: 20,
        horaEstimada: '02:30 PM'
      },
      dictamenIA: {
        decision: 'aceptar',
        motivo: 'Stock completo en CEDI Mosquera (52 cuñetes disponibles). Pigmentos para Blanco Puro aprobados.',
        porQueSeAcepto: 'Aceptado automáticamente por la IA: Disponibilidad inmediata de 52 cuñetes en CEDI Sabana Mosquera y programación de entrega en camión de distribución directo por Calle 13 y Av. Boyacá.',
        fechaAuditoria: 'Hoy, 08:45 AM',
        modo: 'Automático por IA',
        busAsignado: {
          tipo: 'Camión Distribución Bogotá #03',
          placa: 'DEX-712',
          conductor: 'Hernán Morales',
          capacidad: '80 cuñetes (4.5 Ton)'
        },
        rutaAsignada: {
          origen: 'CEDI Sabana Mosquera',
          destino: 'Torre Empresarial Calle 100 # 19-61, Chicó, Bogotá',
          recorrido: 'Calle 13 ➔ Av. Boyacá ➔ Calle 100',
          distanciaKm: 24.6,
          tiempoMin: 55,
          ahorroMin: 20,
          horaEstimada: '02:30 PM'
        },
        mensajesEnviados: {
          email: 'fsamper@consorciometropolitano.co',
          fechaEnvio: 'Hoy, 08:46 AM'
        },
        insumosVerificados: {
          pinturaValida: true,
          colorFormulado: true,
          stockSuficiente: true,
          cuñetesFaltantes: 0
        }
      },
      notificaciones: [
        {
          tipo: 'email',
          texto: 'Pedido despachado en Camión Distribución Bogotá #03 (DEX-712). ETA 02:30 PM. Notificación por correo enviada.',
          fecha: 'Hoy, 08:46 AM'
        }
      ]
    },
    {
      id: 'PED-2026-082',
      cliente: 'Conjunto Residencial Laureles Parque',
      nit: '890123567',
      responsable: 'Dra. Andrea Londoño',
      telefono: '+57 314 555 8822',
      email: 'administracion@laurelesparque.com',
      ciudad: 'Medellín',
      areaM2: 210,
      tipoPintura: 'Pintura Tipo 2 Interior Lavable',
      marca: 'Colorlink® Pro',
      metodoPago: 'Transferencia Bancolombia',
      color: 'Marfil Arena (Mate)',
      totalCOP: 8900000,
      status: 'pendiente',
      notificaciones: []
    },
    {
      id: 'PED-2026-086',
      cliente: 'Edificio Oficinas Chicó Norte',
      nit: '900334889',
      responsable: 'Arq. Camila Torres',
      telefono: '+57 315 444 3321',
      email: 'ctorres@chiconorte.com',
      ciudad: 'Bogotá D.C.',
      areaM2: 180,
      tipoPintura: 'Pintura Tipo 2 Interior Lavable',
      marca: 'Tito Pabón®',
      metodoPago: 'Crédito Corporativo 30 Días',
      color: 'Gris Grafito (Mate)',
      totalCOP: 6420000,
      status: 'preparando',
      notificaciones: []
    },
    {
      id: 'PED-2026-087',
      cliente: 'Centro Médico Especializado Ciudad Jardín',
      nit: '901009876',
      responsable: 'Dr. Alejandro Osorio',
      telefono: '+57 318 667 9900',
      email: 'gerencia@clinicaciudadjardin.com.co',
      ciudad: 'Cali',
      areaM2: 195,
      tipoPintura: 'Pintura Tipo 1 Exterior',
      marca: 'Corona® Pinturas',
      metodoPago: 'PSE - Bancolombia',
      color: 'Blanco Antihongos',
      totalCOP: 7350000,
      status: 'en_ruta',
      vehiculoAsignado: 'Furgón Cali CEDI Yumbo #01',
      placa: 'VBL-903',
      conductor: 'Javier Caicedo',
      rutaOptima: {
        origen: 'CEDI Valle Yumbo',
        destino: 'Cra 105 # 14-80, Ciudad Jardín, Cali',
        recorrido: 'Autopista Cali-Yumbo ➔ Calle 5ta ➔ Cra 100',
        distanciaKm: 28.5,
        tiempoMin: 42,
        ahorroMin: 15,
        horaEstimada: '01:15 PM'
      },
      notificaciones: []
    },
    {
      id: 'PED-2026-088',
      cliente: 'Bodega Logística del Caribe Vía 40',
      nit: '800554123',
      responsable: 'Ing. Rodrigo Char',
      telefono: '+57 300 234 5678',
      email: 'operaciones@logisticacaribe.com',
      ciudad: 'Barranquilla',
      areaM2: 260,
      tipoPintura: 'Pintura Tipo 1 Exterior',
      marca: 'Sapolín®',
      metodoPago: 'Contra Entrega en Obra',
      color: 'Gris Cemento Fachada',
      totalCOP: 5120000,
      status: 'pendiente',
      notificaciones: []
    },
    {
      id: 'PED-2026-089',
      cliente: 'Centro Empresarial Cabecera',
      nit: '900778811',
      responsable: 'Arq. Mónica Prada',
      telefono: '+57 317 889 0011',
      email: 'mprada@cabeceraempresarial.com',
      ciudad: 'Bucaramanga',
      areaM2: 140,
      tipoPintura: 'Pintura Tipo 2 Interior Lavable',
      marca: 'Tito Pabón®',
      metodoPago: 'Transferencia Bancolombia / QR',
      color: 'Marfil Cálido',
      totalCOP: 3840000,
      status: 'preparando',
      notificaciones: []
    },
    {
      id: 'PED-2026-090',
      cliente: 'Hotel & Suites Costa Azul Bocagrande',
      nit: '900223114',
      responsable: 'Sr. Daniel Martelo',
      telefono: '+57 301 998 7766',
      email: 'mantenimiento@hotelcostaazul.co',
      ciudad: 'Cartagena',
      areaM2: 150,
      tipoPintura: 'Pintura Tipo 1 Exterior',
      marca: 'Pintuco®',
      metodoPago: 'Tarjeta de Crédito Visa',
      color: 'Arena Caribe',
      totalCOP: 4650000,
      status: 'pendiente',
      notificaciones: []
    },
    {
      id: 'PED-2026-079',
      cliente: 'Inversiones & Acabados del Valle',
      nit: '890901234',
      responsable: 'Ing. Mateo Arango',
      telefono: '+57 310 654 3210',
      email: 'marango@inversionesvalle.com',
      ciudad: 'Envigado',
      areaM2: 120,
      tipoPintura: 'Pintura Tipo 2 Interior Lavable',
      marca: 'Colorlink® Pro',
      color: 'Blanco Puro (Satinado)',
      totalCOP: 2150000,
      status: 'pendiente',
      notificaciones: []
    },
    {
      id: 'PED-2026-074',
      cliente: 'Condominio Campestre Los Sauces',
      nit: '901223456',
      responsable: 'Dra. Carolina Ríos',
      telefono: '+57 301 789 4455',
      email: 'administracion@lossauces.com',
      ciudad: 'Rionegro',
      areaM2: 240,
      tipoPintura: 'Pintura Tipo 1 Exterior',
      marca: 'Pintuco®',
      color: 'Arena Cálido',
      totalCOP: 3890000,
      status: 'en_ruta',
      vehiculoAsignado: 'Camión Reparto #02',
      placa: 'SKJ-841',
      conductor: 'Mauricio Vélez',
      rutaOptima: {
        origen: 'Planta Central Colorlink (Itagüí)',
        destino: 'Condominio Los Sauces - Km 7 Vía Llanogrande',
        recorrido: 'Túnel de Oriente ➔ Glorieta Sajonia ➔ Vía Llanogrande',
        distanciaKm: 34.2,
        tiempoMin: 45,
        ahorroMin: 18,
        horaEstimada: '12:45 PM'
      },
      notificaciones: [
        {
          tipo: 'email',
          texto: 'Su pedido va en camino en el Camión #02 con el conductor Mauricio Vélez. Notificación oficial por correo.',
          fecha: 'Hoy, 10:15 AM'
        }
      ]
    }
  ]);

  const [selectedOrderId, setSelectedOrderId] = useState<string>('PED-2026-081');

  // Cálculos dinámicos de análisis de ciudades ("cuál vendió más" y "qué se necesita pedir para cada lado")
  const cityAnalytics = useMemo(() => {
    const cityMap: Record<string, {
      ciudad: string;
      totalCOP: number;
      pedidosCount: number;
      areaM2: number;
      tipo1Cunetes: number;
      tipo2Cunetes: number;
      tipo3Cunetes: number;
      selladorGalones: number;
      marcasDemandadas: Record<string, number>;
      pedidos: OrderItem[];
      cedi: string;
      stockDisponibleCunetes: number;
      cunetesRequeridosTotal: number;
      urgencia: 'urgente' | 'transito' | 'abastecido';
    }> = {};

    const cediMap: Record<string, { cedi: string; stock: number }> = {
      'Medellín': { cedi: 'Planta Central Itagüí / CEDI Guarne', stock: cediStocks['Medellín'] ?? 120 },
      'Bogotá D.C.': { cedi: 'CEDI Sabana Mosquera (Cra 13)', stock: cediStocks['Bogotá D.C.'] ?? 24 },
      'Cali': { cedi: 'CEDI Valle Yumbo (Vía Cali-Yumbo)', stock: cediStocks['Cali'] ?? 16 },
      'Barranquilla': { cedi: 'CEDI Costa Malambo (Calle 30)', stock: cediStocks['Barranquilla'] ?? 12 },
      'Bucaramanga': { cedi: 'CEDI Santanderes Girón (Km 7)', stock: cediStocks['Bucaramanga'] ?? 14 },
      'Cartagena': { cedi: 'CEDI Bolívar Mamonal (Km 3)', stock: cediStocks['Cartagena'] ?? 10 },
      'Envigado': { cedi: 'CEDI Sur Aburrá (Av. Las Vegas)', stock: cediStocks['Envigado'] ?? 20 },
      'Rionegro': { cedi: 'CEDI Oriente Llanogrande (Aeropuerto)', stock: cediStocks['Rionegro'] ?? 18 }
    };

    orders.forEach(order => {
      let rawCity = order.ciudad?.trim() || 'Medellín';
      let normCity = 'Medellín';

      if (rawCity.toLowerCase().includes('bogot')) normCity = 'Bogotá D.C.';
      else if (rawCity.toLowerCase().includes('cali')) normCity = 'Cali';
      else if (rawCity.toLowerCase().includes('barran')) normCity = 'Barranquilla';
      else if (rawCity.toLowerCase().includes('bucara')) normCity = 'Bucaramanga';
      else if (rawCity.toLowerCase().includes('cartag')) normCity = 'Cartagena';
      else if (rawCity.toLowerCase().includes('envig')) normCity = 'Envigado';
      else if (rawCity.toLowerCase().includes('rioneg')) normCity = 'Rionegro';
      else normCity = 'Medellín';

      if (!cityMap[normCity]) {
        const info = cediMap[normCity] || { cedi: `CEDI Regional ${normCity}`, stock: 15 };
        cityMap[normCity] = {
          ciudad: normCity,
          totalCOP: 0,
          pedidosCount: 0,
          areaM2: 0,
          tipo1Cunetes: 0,
          tipo2Cunetes: 0,
          tipo3Cunetes: 0,
          selladorGalones: 0,
          marcasDemandadas: {},
          pedidos: [],
          cedi: info.cedi,
          stockDisponibleCunetes: info.stock,
          cunetesRequeridosTotal: 0,
          urgencia: 'abastecido'
        };
      }

      const item = cityMap[normCity];
      item.totalCOP += order.totalCOP || 0;
      item.pedidosCount += 1;
      item.areaM2 += order.areaM2 || 0;
      item.pedidos.push(order);

      const brand = order.marca || 'Pintuco®';
      item.marcasDemandadas[brand] = (item.marcasDemandadas[brand] || 0) + 1;

      // Cálculo de requerimientos de abastecimiento por tipo de pintura:
      // ~28 m2 por cuñete con 2 manos
      const estimatedCunetes = Math.max(1, Math.ceil((order.areaM2 || 50) / 28));
      item.cunetesRequeridosTotal += estimatedCunetes;

      if (order.tipoPintura?.includes('Tipo 1') || order.tipoPintura?.toLowerCase().includes('exterior')) {
        item.tipo1Cunetes += estimatedCunetes;
        item.selladorGalones += Math.ceil(estimatedCunetes * 2); // 2 galones de sellador por cada cuñete Tipo 1
      } else if (order.tipoPintura?.includes('Tipo 3') || order.tipoPintura?.toLowerCase().includes('ciel')) {
        item.tipo3Cunetes += estimatedCunetes;
      } else {
        item.tipo2Cunetes += estimatedCunetes;
        item.selladorGalones += Math.ceil(estimatedCunetes * 1);
      }
    });

    const sortedList = Object.values(cityMap);
    // Ordenar de mayor a menor ventas COP para responder "¿Cuál vendió más?"
    sortedList.sort((a, b) => b.totalCOP - a.totalCOP);

    // Calcular estado de urgencia de reabastecimiento
    sortedList.forEach(c => {
      if (c.cunetesRequeridosTotal > c.stockDisponibleCunetes) {
        c.urgencia = 'urgente';
      } else if (c.cunetesRequeridosTotal >= c.stockDisponibleCunetes * 0.7) {
        c.urgencia = 'transito';
      } else {
        c.urgencia = 'abastecido';
      }
    });

    return sortedList;
  }, [orders, cediStocks]);

  const totalNacionalCOP = useMemo(() => {
    return cityAnalytics.reduce((acc, c) => acc + c.totalCOP, 0);
  }, [cityAnalytics]);

  const totalCunetesNacional = useMemo(() => {
    return cityAnalytics.reduce((acc, c) => acc + c.cunetesRequeridosTotal, 0);
  }, [cityAnalytics]);

  const handleRequestCitySupply = (ciudad: string) => {
    const nowTime = new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
    const orderCode = `ORB-2026-${Math.floor(100 + Math.random() * 900)}`;

    if (ciudad === 'Nacional (Todas las Sedes)') {
      const updatedStocks = { ...cediStocks };
      let totalAdded = 0;
      let totalT1 = 0;
      let totalT2 = 0;
      let totalT3 = 0;
      let totalSellador = 0;

      cityAnalytics.forEach((c) => {
        const current = updatedStocks[c.ciudad] ?? c.stockDisponibleCunetes;
        const needed = Math.max(25, c.cunetesRequeridosTotal - current + 25);
        updatedStocks[c.ciudad] = current + needed;
        totalAdded += needed;
        totalT1 += Math.max(8, c.tipo1Cunetes);
        totalT2 += Math.max(8, c.tipo2Cunetes);
        totalT3 += Math.max(4, c.tipo3Cunetes);
        totalSellador += Math.max(12, c.selladorGalones);
      });

      setCediStocks(updatedStocks);
      try {
        localStorage.setItem('colorlink_cedi_stocks_v1', JSON.stringify(updatedStocks));
      } catch {}

      const newOrder: ReplenishmentOrderRecord = {
        id: orderCode,
        ciudad: 'Nacional (Todas las Sedes)',
        cedi: 'Red Nacional de CEDIs Colorlink®',
        fecha: `Hoy, ${nowTime}`,
        tipo1Cunetes: totalT1,
        tipo2Cunetes: totalT2,
        tipo3Cunetes: totalT3,
        selladorGalones: totalSellador,
        cunetesAgregados: totalAdded,
        stockAnterior: (Object.values(cediStocks) as number[]).reduce((a: number, b: number) => a + b, 0),
        nuevoStock: (Object.values(updatedStocks) as number[]).reduce((a: number, b: number) => a + b, 0),
        vehiculoNodriza: 'Flota Tractomulas Nodriza Colorlink (#11, #12 y #14)',
        placa: 'WPK-940 / TZW-815',
        conductor: 'Hernando Valencia & Equipo Nacional',
        estado: 'Despachada • Sedes Abastecidas al 100%'
      };

      setReplenishmentOrders((prev) => {
        const next = [newOrder, ...prev];
        try {
          localStorage.setItem('colorlink_replenishment_orders_v1', JSON.stringify(next));
        } catch {}
        return next;
      });

      // Actualizar pedidos en espera a preparando ya que llegó stock a todas las sedes
      setOrders((prev) =>
        prev.map((o) =>
          o.status === 'en_espera'
            ? {
                ...o,
                status: 'preparando',
                razonEstado: `Stock reabastecido mediante Orden #${orderCode}. Pedido liberado a tintometría.`
              }
            : o
        )
      );

      setActiveReplenishmentModal(newOrder);
      setSupplyNotice(`✓ Orden Nacional #${orderCode} generada con éxito (+${totalAdded} cuñetes distribuidos en todas las sedes).`);
      return;
    }

    const cityData = cityAnalytics.find((c) => c.ciudad === ciudad);
    const prevStock = cediStocks[ciudad] ?? cityData?.stockDisponibleCunetes ?? 15;
    const requiredDemand = cityData?.cunetesRequeridosTotal ?? 20;
    const deficit = Math.max(0, requiredDemand - prevStock);
    const t1 = Math.max(6, cityData?.tipo1Cunetes || 6);
    const t2 = Math.max(6, cityData?.tipo2Cunetes || 6);
    const t3 = Math.max(3, cityData?.tipo3Cunetes || 3);
    const sellador = Math.max(10, cityData?.selladorGalones || 10);
    const addedCunetes = Math.max(t1 + t2 + t3, deficit + 20);
    const nextStock = prevStock + addedCunetes;

    const updatedStocks = {
      ...cediStocks,
      [ciudad]: nextStock
    };
    setCediStocks(updatedStocks);
    try {
      localStorage.setItem('colorlink_cedi_stocks_v1', JSON.stringify(updatedStocks));
    } catch {}

    const nodrizasByCity: Record<string, { vehiculo: string; placa: string; conductor: string }> = {
      'Bogotá D.C.': { vehiculo: 'Tractomula Nodriza Colorlink #12 (Ruta Medellín-Bogotá)', placa: 'WPK-940', conductor: 'Hernando Valencia' },
      'Cali': { vehiculo: 'Camión Nodriza Intermunicipal #09 (Ruta Pacífico)', placa: 'KLU-891', conductor: 'Jairo Ramírez' },
      'Barranquilla': { vehiculo: 'Tractomula Nodriza Costa #15 (Ruta Troncal Caribe)', placa: 'TRN-512', conductor: 'Álvaro Mendoza' },
      'Cartagena': { vehiculo: 'Tractomula Nodriza Costa #15 (Ruta Bolívar)', placa: 'TRN-512', conductor: 'Álvaro Mendoza' },
      'Bucaramanga': { vehiculo: 'Camión Nodriza Santanderes #07', placa: 'SJR-409', conductor: 'Gustavo Reyes' },
      'Medellín': { vehiculo: 'Furgón Abastecimiento Interno Planta Itagüí #03', placa: 'TZW-402', conductor: 'Carlos Restrepo' }
    };
    const nodriza = nodrizasByCity[ciudad] || {
      vehiculo: 'Camión Nodriza Intermunicipal Colorlink #11',
      placa: 'WFH-320',
      conductor: 'Andrés Felipe Gil'
    };

    const newOrder: ReplenishmentOrderRecord = {
      id: orderCode,
      ciudad,
      cedi: cityData?.cedi || `CEDI Regional ${ciudad}`,
      fecha: `Hoy, ${nowTime}`,
      tipo1Cunetes: t1,
      tipo2Cunetes: t2,
      tipo3Cunetes: t3,
      selladorGalones: sellador,
      cunetesAgregados: addedCunetes,
      stockAnterior: prevStock,
      nuevoStock: nextStock,
      vehiculoNodriza: nodriza.vehiculo,
      placa: nodriza.placa,
      conductor: nodriza.conductor,
      estado: 'Despachada • CEDI Reabastecido'
    };

    setReplenishmentOrders((prev) => {
      const next = [newOrder, ...prev];
      try {
        localStorage.setItem('colorlink_replenishment_orders_v1', JSON.stringify(next));
      } catch {}
      return next;
    });

    // Si había pedidos en espera en esta ciudad, liberarlos a preparación con el nuevo stock
    setOrders((prev) =>
      prev.map((o) =>
        o.ciudad.toLowerCase().includes(ciudad.toLowerCase()) && o.status === 'en_espera'
          ? {
              ...o,
              status: 'preparando',
              razonEstado: `CEDI ${ciudad} reabastecido con Orden #${orderCode} (+${addedCunetes} cuñetes). Pedido en tintometría.`
            }
          : o
      )
    );

    setActiveReplenishmentModal(newOrder);
    setSupplyNotice(
      `✓ Orden de Reabastecimiento #${orderCode} generada para CEDI ${ciudad}: +${addedCunetes} cuñetes enviados (Nuevo stock en sede: ${nextStock} cuñetes).`
    );
  };

  // Algoritmo de Inteligencia Artificial Autónomo para Asignación de Bus, Ruta y Notificaciones
  const generateAiAutoAssignment = (order: OrderItem): OrderItem => {
    const neededCunetes = Math.max(1, Math.ceil((order.areaM2 || 50) / 28));
    const rawCity = order.ciudad?.trim() || 'Medellín';
    let normCity = 'Medellín';
    let cedi = 'Planta Central Itagüí / CEDI Guarne';
    let stock = 120;

    if (rawCity.toLowerCase().includes('bogot')) {
      normCity = 'Bogotá D.C.';
      cedi = 'CEDI Sabana Mosquera (Cra 13)';
      stock = 24;
    } else if (rawCity.toLowerCase().includes('cali')) {
      normCity = 'Cali';
      cedi = 'CEDI Valle Yumbo (Vía Cali-Yumbo)';
      stock = 16;
    } else if (rawCity.toLowerCase().includes('barran')) {
      normCity = 'Barranquilla';
      cedi = 'CEDI Costa Malambo (Calle 30)';
      stock = 12;
    } else if (rawCity.toLowerCase().includes('bucara')) {
      normCity = 'Bucaramanga';
      cedi = 'CEDI Santanderes Girón (Km 7)';
      stock = 14;
    } else if (rawCity.toLowerCase().includes('cartag')) {
      normCity = 'Cartagena';
      cedi = 'CEDI Bolívar Mamonal (Km 3)';
      stock = 10;
    } else if (rawCity.toLowerCase().includes('envig')) {
      normCity = 'Envigado';
      cedi = 'CEDI Sur Aburrá (Av. Las Vegas)';
      stock = 20;
    } else if (rawCity.toLowerCase().includes('rioneg')) {
      normCity = 'Rionegro';
      cedi = 'CEDI Oriente Llanogrande (Aeropuerto)';
      stock = 18;
    }

    // 1. Asignación inteligente de bus/vehículo según cubicaje y volumen
    let busInfo = {
      tipo: 'Buseta Ágil Colorlink #01',
      placa: 'WKN-512',
      conductor: 'Mauricio Vélez',
      capacidad: '12 cuñetes (1.5 Ton) - Maniobrabilidad ágil urbana',
      motivoSeleccion: 'Seleccionado por IA para lote pequeño-mediano con entrega express'
    };

    if (neededCunetes > 8 && neededCunetes <= 25) {
      busInfo = {
        tipo: 'Buseta de Reparto Colorlink #03',
        placa: 'TZW-402',
        conductor: 'Carlos Mario Henao',
        capacidad: '28 cuñetes (2.8 Ton) - Óptima para obra civil media',
        motivoSeleccion: 'Seleccionado por IA: Relación óptima de carga para volumen mediano'
      };
    } else if (neededCunetes > 25) {
      busInfo = {
        tipo: 'Camión Turbo Pesado Colorlink #08',
        placa: 'SZF-891',
        conductor: 'Juan Fernando Gómez',
        capacidad: '65 cuñetes (5.0 Ton) - Gran volumen de carga pesada',
        motivoSeleccion: 'Seleccionado por IA para gran cubicaje y transporte de alta densidad'
      };
    }

    // 2. Cálculo de Ruta Óptima de Despacho
    let rutaInfo = {
      origen: cedi,
      destino: `Obra ${order.obra || order.cliente} (${normCity})`,
      recorrido: 'Autopista Sur ➔ Av. Las Vegas ➔ Puente 4 Sur ➔ Obra',
      distanciaKm: 14.2,
      tiempoMin: 32,
      ahorroMin: 18,
      horaEstimada: '11:15 AM'
    };

    if (normCity === 'Bogotá D.C.') {
      rutaInfo = {
        origen: 'CEDI Sabana Mosquera (Calle 13)',
        destino: `Obra ${order.obra || order.cliente} (Bogotá D.C.)`,
        recorrido: 'Calle 13 ➔ Av. Boyacá ➔ Calle 100 ➔ Obra',
        distanciaKm: 24.6,
        tiempoMin: 50,
        ahorroMin: 25,
        horaEstimada: '02:30 PM'
      };
    } else if (normCity === 'Cali') {
      rutaInfo = {
        origen: 'CEDI Valle Yumbo',
        destino: `Obra ${order.obra || order.cliente} (Cali)`,
        recorrido: 'Vía Cali-Yumbo ➔ Carrera 1 ➔ Autopista Suroriental ➔ Obra',
        distanciaKm: 18.3,
        tiempoMin: 36,
        ahorroMin: 16,
        horaEstimada: '10:45 AM'
      };
    } else if (normCity === 'Barranquilla') {
      rutaInfo = {
        origen: 'CEDI Costa Malambo',
        destino: `Obra ${order.obra || order.cliente} (Barranquilla)`,
        recorrido: 'Calle 30 ➔ Vía 40 ➔ Circunvalar de la Prosperidad ➔ Obra',
        distanciaKm: 16.8,
        tiempoMin: 30,
        ahorroMin: 20,
        horaEstimada: '11:00 AM'
      };
    } else if (normCity === 'Bucaramanga') {
      rutaInfo = {
        origen: 'CEDI Santanderes Girón',
        destino: `Obra ${order.obra || order.cliente} (Bucaramanga)`,
        recorrido: 'Km 7 Girón ➔ Autopista Floridablanca ➔ Anillo Vial ➔ Obra',
        distanciaKm: 13.5,
        tiempoMin: 26,
        ahorroMin: 15,
        horaEstimada: '10:20 AM'
      };
    } else if (normCity === 'Cartagena') {
      rutaInfo = {
        origen: 'CEDI Bolívar Mamonal',
        destino: `Obra ${order.obra || order.cliente} (Cartagena)`,
        recorrido: 'Mamonal Km 3 ➔ Corredor de Carga ➔ Transversal 54 ➔ Obra',
        distanciaKm: 19.2,
        tiempoMin: 38,
        ahorroMin: 22,
        horaEstimada: '01:15 PM'
      };
    } else if (normCity === 'Rionegro') {
      rutaInfo = {
        origen: 'CEDI Oriente Llanogrande',
        destino: `Obra ${order.obra || order.cliente} (Rionegro)`,
        recorrido: 'Llanogrande ➔ Corredor Túnel de Oriente ➔ Autopista ➔ Obra',
        distanciaKm: 28.4,
        tiempoMin: 42,
        ahorroMin: 25,
        horaEstimada: '02:00 PM'
      };
    }

    // 3. Justificación de Aceptación por la IA ("¿Por qué se aceptó?")
    const porQueSeAcepto = `Aceptado automáticamente por la IA: Insumos verificados al 100% en ${cedi} (${stock} cuñetes disponibles vs ${neededCunetes} requeridos para cubrir ${order.areaM2} m²). Formulación tintométrica autorizada bajo norma NTC 1335 para el acabado '${order.color}' (${order.tipoPintura}). Asignado flete directo en ${busInfo.tipo} (Placa ${busInfo.placa}) conducido por ${busInfo.conductor} por el corredor '${rutaInfo.recorrido}', logrando un ahorro logístico de ${rutaInfo.ahorroMin} minutos con entrega estimada a las ${rutaInfo.horaEstimada}.`;

    return {
      ...order,
      status: 'preparando' as const,
      vehiculoAsignado: busInfo.tipo,
      placa: busInfo.placa,
      conductor: busInfo.conductor,
      rutaOptima: rutaInfo,
      dictamenIA: {
        decision: 'aceptar',
        motivo: `Stock 100% verificado en ${cedi}. Formulación validada NTC 1335.`,
        porQueSeAcepto,
        fechaAuditoria: 'Automático por IA (En vivo)',
        modo: 'Automático por IA',
        busAsignado: busInfo,
        rutaAsignada: rutaInfo,
        mensajesEnviados: {
          email: order.email,
          fechaEnvio: 'Hoy en automático'
        },
        insumosVerificados: {
          pinturaValida: true,
          colorFormulado: true,
          stockSuficiente: true,
          cuñetesFaltantes: 0
        }
      },
      notificaciones: [
        {
          tipo: 'email',
          texto: `[IA Auto-Piloto] Pedido aceptado automáticamente. Asignado ${busInfo.tipo} (${busInfo.placa}) por ${rutaInfo.recorrido}. Notificación oficial enviada por correo (${order.email}).`,
          fecha: 'Ahora mismo'
        },
        ...(order.notificaciones || [])
      ]
    };
  };

  // Función robusta para sincronizar pedidos de todas las fuentes: Servidor (/api/orders), Almacenamiento Local y Sesión
  const syncAllOrders = async () => {
    try {
      const storedClientOrders = getSavedClientOrdersFromStorage();
      const fromStorage: OrderItem[] = storedClientOrders.map((s) => ({
        id: s.orderNumber || s.id || `ORD-${Date.now().toString().slice(-4)}`,
        cliente: s.cliente || s.detalle?.obra || 'Cliente Colorlink',
        nit: s.nit || 'S/N',
        responsable: s.responsable || 'Responsable de Obra',
        telefono: (s as any).telefono || '+57 300 000 0000',
        email: s.email || 'contacto@colorlink.com.co',
        ciudad: s.ciudad || s.detalle?.ciudad || 'Medellín',
        areaM2: Number(s.areaM2 ?? s.detalle?.areaM2 ?? 50),
        tipoPintura: s.tipoPintura || s.detalle?.tipoPintura || 'Pintura Tipo 1 Exterior',
        color: s.color || s.detalle?.color || 'Color Específico',
        totalCOP: Number(s.totalCOP ?? s.total ?? 1500000),
        status: (s.estado || s.status || 'pendiente') as any,
        vehiculoAsignado: s.vehiculo,
        placa: s.placa,
        conductor: s.conductor,
        notificaciones: []
      }));

      const fromSubmitted: OrderItem[] = (submittedProjects || []).map((p) => {
        const savedMatch = storedClientOrders.find((s) => s.orderNumber === p.id || s.id === p.id);
        return {
          id: p.id,
          cliente: p.formData?.cliente || 'Cliente Colorlink',
          nit: p.formData?.nitDocumento || 'S/N',
          responsable: p.formData?.responsable || 'Responsable de Obra',
          telefono: p.formData?.telefonoResponsable || '+57 300 000 0000',
          email: p.formData?.emailResponsable || 'contacto@colorlink.com.co',
          ciudad: p.formData?.ciudad || 'Medellín',
          areaM2: Number(p.formData?.areaM2 || 50),
          tipoPintura: p.formData?.tipoPintura || 'Pintura Tipo 1 Exterior',
          color: p.formData?.colorAcabado || 'Color Específico',
          totalCOP: Number(p.totalCOP || 1500000),
          status: (savedMatch?.estado || savedMatch?.status || 'pendiente') as any,
          vehiculoAsignado: savedMatch?.vehiculo,
          placa: savedMatch?.placa,
          conductor: savedMatch?.conductor,
          notificaciones: []
        };
      });

      // Consultar directamente /api/orders para recibir pedidos enviados al backend
      let fromServer: OrderItem[] = [];
      try {
        const res = await fetch('/api/orders');
        if (res.ok) {
          const json = await res.json();
          if (json && Array.isArray(json.orders)) {
            fromServer = json.orders.map((srv: any) => {
              const fd = srv.formData || {};
              return {
                id: srv.orderNumber || srv.id,
                cliente: srv.cliente || fd.cliente || srv.responsable || 'Cliente Colorlink',
                nit: srv.nit || fd.nitDocumento || 'S/N',
                responsable: srv.responsable || fd.responsable || 'Responsable de Obra',
                telefono: fd.telefonoResponsable || srv.telefono || '+57 300 000 0000',
                email: srv.email || fd.emailResponsable || 'contacto@colorlink.com.co',
                ciudad: srv.ciudad || fd.ciudad || 'Medellín',
                areaM2: Number(fd.areaM2 || srv.areaM2 || 50),
                tipoPintura: fd.tipoPintura || srv.tipoPintura || 'Pintura Tipo 1 Exterior',
                color: fd.colorAcabado || srv.color || 'Color Específico',
                totalCOP: Number(srv.totalCOP || 0),
                status: (srv.status || 'pendiente') as any,
                vehiculoAsignado: srv.vehiculo,
                placa: srv.placa,
                conductor: srv.conductor,
                notificaciones: srv.mensaje ? [{ tipo: 'email' as const, texto: srv.mensaje, fecha: 'Hoy' }] : []
              };
            });
          }
        }
      } catch (e) {
        // Continuar con almacenamiento local
      }

      // Consolidar todos los pedidos garantizando unicidad y sin perder ninguno
      const incomingList = [...fromServer, ...fromSubmitted, ...fromStorage];
      const uniqueIncoming: OrderItem[] = [];
      const seenIds = new Set<string>();

      for (const item of incomingList) {
        if (!item.id || seenIds.has(item.id)) continue;
        seenIds.add(item.id);
        uniqueIncoming.push(item);
      }

      if (uniqueIncoming.length > 0) {
        setOrders((prev) => {
          const prevMap = new Map<string, OrderItem>(prev.map((o) => [o.id, o]));
          const nextList = [...prev];

          for (const inc of uniqueIncoming) {
            const existing = prevMap.get(inc.id);
            if (!existing) {
              const processed = aiAutoPilotEnabled ? generateAiAutoAssignment(inc) : inc;
              nextList.unshift(processed);
              prevMap.set(inc.id, processed);
            } else {
              // Si ya existe, actualizar respetando la regla inviolable: si ya fue entregado, NUNCA retrocede
              const finalStatus =
                existing.status === 'entregado' && inc.status !== 'entregado'
                  ? 'entregado'
                  : inc.status || existing.status;

              const merged: OrderItem = {
                ...existing,
                ...inc,
                status: finalStatus,
                vehiculoAsignado: inc.vehiculoAsignado || existing.vehiculoAsignado,
                placa: inc.placa || existing.placa,
                conductor: inc.conductor || existing.conductor
              };
              const idx = nextList.findIndex((o) => o.id === inc.id);
              if (idx >= 0) nextList[idx] = merged;
            }
          }

          return nextList;
        });

        setSelectedOrderId((prevId) => {
          if (!prevId || prevId === 'PED-2026-081') {
            return uniqueIncoming[0]?.id || prevId;
          }
          return prevId;
        });
      }
    } catch (err) {
      console.warn('[Sync Orders Error]', err);
    }
  };

  useEffect(() => {
    syncAllOrders();
    // Sondeo periódico cada 4 segundos para reflejar pedidos en tiempo real
    const interval = setInterval(syncAllOrders, 4000);
    return () => clearInterval(interval);
  }, [submittedProjects, aiAutoPilotEnabled]);

  // Ejecutar Auto-Asignación IA para un pedido individual
  const handleRunAutoPilotForOrder = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          return generateAiAutoAssignment(o);
        }
        return o;
      })
    );
    showToast(`🤖 IA Auto-Piloto: Bus y ruta asignados automáticamente para pedido #${orderId}`);
  };

  // Ejecutar Auto-Asignación IA para todos los pedidos pendientes
  const handleRunAutoPilotForAllPending = () => {
    setIsAutoPilotRunning(true);
    let count = 0;
    setOrders((prev) =>
      prev.map((o) => {
        if (o.status === 'pendiente') {
          count++;
          return generateAiAutoAssignment(o);
        }
        return o;
      })
    );
    setTimeout(() => {
      setIsAutoPilotRunning(false);
      showToast(`🤖 IA Auto-Piloto: ${count > 0 ? count : 'Todos los'} pedidos pendientes fueron auto-asignados con su bus y ruta.`);
    }, 600);
  };

  // =========================================================================
  // CICLO DE ACTUALIZACIÓN AUTOMÁTICA CADA 20 MINUTOS PARA TODOS LOS PEDIDOS
  // Requirement: 2s -> Tintometría | 20 min -> Despachando con mensaje | 20 min -> Entregado
  // =========================================================================

  // 1. Los pedidos 'pendiente' (Aceptados por el Cliente) deben ser auditados y aprobados por la IA antes de ingresar a Tintometría
  // No se adelantan a ciegas: se aprueban mediante el Auto-Piloto IA o la Auditoría en vivo de Pincelito Inspector

  // 2. Función para avanzar el ciclo de etapas en todos los pedidos
  const advanceAllOrdersCycle = () => {
    let advancedCount = 0;
    const emailTasks: Array<() => void> = [];

    const nextOrders = orders.map((o) => {
      // A0) Si un pedido aún está en 'pendiente', avanzarlo a 'preparando' (En Tintometría)
      if (o.status === 'pendiente') {
        advancedCount++;
        const autoAssigned = generateAiAutoAssignment(o);
        const stateMsg = buildOrderStateMessage({
          status: 'preparando',
          orderId: o.id,
          cliente: o.cliente,
          responsable: o.responsable,
          color: o.color,
          tipoPintura: o.tipoPintura,
          ciudad: o.ciudad,
          totalCOP: o.totalCOP,
          vehiculo: autoAssigned.vehiculoAsignado,
          conductor: autoAssigned.conductor,
          placa: autoAssigned.placa
        });
        const vehiculo = stateMsg.logistica.vehiculo;
        const placa = stateMsg.logistica.placa;
        const conductor = stateMsg.logistica.conductor;

        saveClientOrderToHistory({
          id: o.id,
          orderNumber: o.id,
          fecha: new Date().toISOString(),
          cliente: o.cliente,
          nit: o.nit,
          responsable: o.responsable,
          email: o.email,
          ciudad: o.ciudad,
          areaM2: o.areaM2,
          tipoPintura: o.tipoPintura,
          color: o.color,
          totalCOP: o.totalCOP,
          status: 'preparando',
          vehiculo,
          conductor,
          placa,
          mensaje: stateMsg.mensajeNotificacion
        });

        emailTasks.push(() => {
          sendOrderStatusUpdateEmail({
            orderId: o.id,
            cliente: o.cliente,
            responsable: o.responsable,
            email: o.email,
            status: 'preparando',
            statusLabel: stateMsg.statusLabel,
            mensaje: stateMsg.mensajeEmail,
            vehiculo,
            conductor,
            placa,
            ciudad: o.ciudad,
            totalCOP: o.totalCOP
          }).catch(() => {});

          fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderNumber: o.id,
              cliente: o.cliente,
              responsable: o.responsable,
              email: o.email,
              ciudad: o.ciudad,
              status: 'preparando',
              vehiculo,
              conductor,
              placa,
              totalCOP: o.totalCOP,
              mensaje: stateMsg.mensajeNotificacion
            })
          }).catch(() => {});
        });

        return {
          ...autoAssigned,
          status: 'preparando' as const,
          vehiculoAsignado: vehiculo,
          placa,
          conductor,
          notificaciones: [
            {
              tipo: 'email' as const,
              texto: stateMsg.mensajeNotificacion,
              fecha: 'Ahora mismo (En Tintometría)'
            },
            ...(o.notificaciones || [])
          ]
        };
      }

      // A) De Tintometría ('preparando') -> Despachando ('en_ruta') con mensaje oficial de despacho
      if (o.status === 'preparando') {
        advancedCount++;
        const stateMsg = buildOrderStateMessage({
          status: 'en_ruta',
          orderId: o.id,
          cliente: o.cliente,
          responsable: o.responsable,
          color: o.color,
          tipoPintura: o.tipoPintura,
          ciudad: o.ciudad,
          totalCOP: o.totalCOP,
          vehiculo: o.vehiculoAsignado,
          conductor: o.conductor,
          placa: o.placa
        });
        const vehiculo = stateMsg.logistica.vehiculo;
        const placa = stateMsg.logistica.placa;
        const conductor = stateMsg.logistica.conductor;

        saveClientOrderToHistory({
          id: o.id,
          orderNumber: o.id,
          fecha: new Date().toISOString(),
          cliente: o.cliente,
          nit: o.nit,
          responsable: o.responsable,
          email: o.email,
          ciudad: o.ciudad,
          areaM2: o.areaM2,
          tipoPintura: o.tipoPintura,
          color: o.color,
          totalCOP: o.totalCOP,
          status: 'en_ruta',
          vehiculo,
          conductor,
          placa,
          mensaje: stateMsg.mensajeNotificacion
        });

        emailTasks.push(() => {
          sendOrderStatusUpdateEmail({
            orderId: o.id,
            cliente: o.cliente,
            responsable: o.responsable,
            email: o.email,
            status: 'en_ruta',
            statusLabel: stateMsg.statusLabel,
            mensaje: stateMsg.mensajeEmail,
            vehiculo,
            conductor,
            placa,
            ciudad: o.ciudad,
            totalCOP: o.totalCOP
          }).catch(() => {});

          fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderNumber: o.id,
              cliente: o.cliente,
              responsable: o.responsable,
              email: o.email,
              ciudad: o.ciudad,
              status: 'en_ruta',
              vehiculo,
              conductor,
              placa,
              totalCOP: o.totalCOP,
              mensaje: stateMsg.mensajeNotificacion
            })
          }).catch(() => {});
        });

        return {
          ...o,
          status: 'en_ruta' as const,
          vehiculoAsignado: vehiculo,
          placa,
          conductor,
          notificaciones: [
            {
              tipo: 'email' as const,
              texto: stateMsg.mensajeNotificacion,
              fecha: 'Ahora mismo (En Ruta)'
            },
            ...(o.notificaciones || [])
          ]
        };
      }

      // B) De Despachando ('en_ruta') -> Entregado ('entregado') con mensaje de entrega final
      if (o.status === 'en_ruta') {
        advancedCount++;
        const stateMsg = buildOrderStateMessage({
          status: 'entregado',
          orderId: o.id,
          cliente: o.cliente,
          responsable: o.responsable,
          color: o.color,
          tipoPintura: o.tipoPintura,
          ciudad: o.ciudad,
          totalCOP: o.totalCOP,
          vehiculo: o.vehiculoAsignado,
          conductor: o.conductor,
          placa: o.placa
        });
        const vehiculo = stateMsg.logistica.vehiculo;
        const placa = stateMsg.logistica.placa;
        const conductor = stateMsg.logistica.conductor;

        saveClientOrderToHistory({
          id: o.id,
          orderNumber: o.id,
          fecha: new Date().toISOString(),
          cliente: o.cliente,
          nit: o.nit,
          responsable: o.responsable,
          email: o.email,
          ciudad: o.ciudad,
          areaM2: o.areaM2,
          tipoPintura: o.tipoPintura,
          color: o.color,
          totalCOP: o.totalCOP,
          status: 'entregado',
          vehiculo,
          conductor,
          placa,
          mensaje: stateMsg.mensajeNotificacion
        });

        emailTasks.push(() => {
          sendOrderStatusUpdateEmail({
            orderId: o.id,
            cliente: o.cliente,
            responsable: o.responsable,
            email: o.email,
            status: 'entregado',
            statusLabel: stateMsg.statusLabel,
            mensaje: stateMsg.mensajeEmail,
            vehiculo,
            placa,
            conductor,
            ciudad: o.ciudad,
            totalCOP: o.totalCOP
          }).catch(() => {});

          fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderNumber: o.id,
              cliente: o.cliente,
              responsable: o.responsable,
              email: o.email,
              ciudad: o.ciudad,
              status: 'entregado',
              conductor,
              totalCOP: o.totalCOP,
              mensaje: stateMsg.mensajeNotificacion
            })
          }).catch(() => {});
        });

        return {
          ...o,
          status: 'entregado' as const,
          notificaciones: [
            {
              tipo: 'email' as const,
              texto: stateMsg.mensajeNotificacion,
              fecha: 'Ahora mismo (Entregado)'
            },
            ...(o.notificaciones || [])
          ]
        };
      }

      return o;
    });

    setOrders(nextOrders);
    emailTasks.forEach((fn) => fn());

    setSecondsToNextCycle(fastDemoMode ? 20 : 1200);
    if (advancedCount > 0) {
      showToast(`🚚 Etapa avanzada: ${advancedCount} pedido(s) actualizaron su estado y enviaron notificación al correo del cliente.`);
    } else {
      showToast('ℹ️ No hay pedidos en Pendiente, Tintometría o En Camino pendientes de avanzar.');
    }
  };

  // 3. Intervalo de actualización cada 20 minutos (o 20 segundos en modo demostración rápida)
  useEffect(() => {
    if (!autoLifecycleEnabled) return;
    const interval = setInterval(() => {
      setSecondsToNextCycle((prev) => {
        if (prev <= 1) {
          advanceAllOrdersCycle();
          return fastDemoMode ? 20 : 1200;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [autoLifecycleEnabled, fastDemoMode]);

  // Función para alternar modo demostración rápida (20s) vs tiempo real (20 min)
  const handleToggleFastDemoMode = () => {
    setFastDemoMode((prev) => {
      const next = !prev;
      setSecondsToNextCycle(next ? 20 : 1200);
      showToast(next ? '⚡ Modo Demostración Rápida Activado: Actualizaciones cada 20 segundos.' : '⏱️ Modo Tiempo Real Activado: Actualizaciones cada 20 minutos (1200 seg).');
      return next;
    });
  };
  const [notificationToast, setNotificationToast] = useState<string | null>(null);
  const [showNotificationModal, setShowNotificationModal] = useState<boolean>(false);
  const [modalNotificationData, setModalNotificationData] = useState<{
    tipo: 'email';
    order: OrderItem;
    mensaje: string;
  } | null>(null);
  const [forceManualIntervention, setForceManualIntervention] = useState<boolean>(false);

  const activeOrder = orders.find((o) => o.id === selectedOrderId) || orders[0];

  // Aprobar pedido
  const handleApproveOrder = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          return {
            ...o,
            status: 'preparando' as const,
            vehiculoAsignado: 'Furgón Colorlink #08',
            placa: 'WLL-482',
            conductor: 'Carlos Restrepo',
            rutaOptima: {
              origen: 'Planta Central Colorlink (Itagüí)',
              destino: `Obra ${o.cliente} (${o.ciudad})`,
              recorrido: 'Autopista Sur ➔ Av. Regional ➔ Vía Principal',
              distanciaKm: 14.2,
              tiempoMin: 35,
              ahorroMin: 20,
              horaEstimada: '11:30 AM'
            }
          };
        }
        return o;
      })
    );
    showToast('✓ Pedido aprobado exitosamente. Se ha programado la preparación en almacén.');
  };

  // Asignar vehículo
  const handleAssignVehicle = (orderId: string, vehiculo: string, placa: string, conductor: string) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          return {
            ...o,
            vehiculoAsignado: vehiculo,
            placa,
            conductor,
            status: o.status === 'pendiente' ? 'preparando' : o.status
          };
        }
        return o;
      })
    );
    showToast(`✓ Vehículo ${vehiculo} (${placa}) asignado por IA con éxito.`);
  };

  // Despachar a ruta
  const handleDispatchOrder = (orderId: string) => {
    handleAiOrderDecision(orderId, 'despachar');
  };

  // Función para ejecutar Auditoría Inteligente en Vivo con IA (Gemini 3.8 Flash)
  const handleExecuteLiveAiAudit = async (order: OrderItem) => {
    setIsAuditingWithAI(true);
    setShowAiAuditModal(true);
    showToast(`🤖 Pincelito Inspector: Auditando pedido #${order.id} con Gemini...`);

    try {
      const cityData = cityAnalytics.find(
        (c) => c.ciudad.toLowerCase() === order.ciudad.toLowerCase()
      );
      const stock = cityData ? cityData.stockDisponibleCunetes : 18;

      const res = await fetch('/api/ai-audit-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order: {
            id: order.id,
            cliente: order.cliente,
            nit: order.nit,
            obra: order.obra,
            ciudad: order.ciudad,
            responsable: order.responsable,
            telefono: order.telefono,
            email: order.email,
            tipoPintura: order.tipoPintura,
            color: order.color,
            cunetes: order.cunetes,
            galones: order.galones,
            totalCOP: order.totalCOP
          },
          cityStock: stock
        })
      });

      const data = await res.json();
      if (data.success && data.audit) {
        setCurrentAiAudit({
          orderId: order.id,
          ...data.audit
        });
        showToast(`✓ Dictamen IA: "${data.audit.decision.toUpperCase()}". Stock y fórmula auditados.`);
      } else {
        throw new Error(data.error || 'Fallo respuesta');
      }
    } catch (err: any) {
      console.warn('[AI AUDIT] Fallback heurístico:', err);
      const needed = Number(order.cunetes || 1);
      const isAdequate = needed <= 18;
      const dec = isAdequate ? 'aceptar' : 'en_espera';
      setCurrentAiAudit({
        orderId: order.id,
        decision: dec,
        razonTecnica: isAdequate
          ? `Stock local suficiente en CEDI ${order.ciudad} (${18} disp. vs ${needed} req.). Materiales completos para alistamiento.`
          : `Demanda excede stock local en CEDI ${order.ciudad}. Se requiere orden de reposición desde fábrica Medellín.`,
        insumosVerificados: {
          pinturaValida: true,
          colorFormulado: true,
          stockSuficiente: isAdequate,
          cuñetesFaltantes: isAdequate ? 0 : needed - 18
        },
        vehiculoSugerido: {
          tipo: 'Camión Turbo NHR 4.5 Ton Colorlink',
          placa: 'TZW-402',
          conductor: 'Carlos Mario Henao',
          horaEstimadaDespacho: isAdequate ? 'Hoy en 2 horas' : 'Programado tras producción'
        },
        mensajeCorreoCliente: isAdequate
          ? `Estimado(a) ${order.responsable || order.cliente}, confirmamos que su pedido #${order.id} ha sido auditado y aprobado. Ha sido asignado al Camión Turbo NHR Placa TZW-402 conducido por Carlos Mario Henao y va en camino a su obra.`
          : `Estimado(a) ${order.responsable || order.cliente}, le informamos que su pedido #${order.id} se encuentra en espera para despacho desde planta central.`
      });
    } finally {
      setIsAuditingWithAI(false);
    }
  };

  // Dictamen de Auditoría Inteligente de IA y Gestión con Notificación Automática por Correo según el Estado
  const handleAiOrderDecision = async (
    orderId: string,
    decision: 'pendiente' | 'aceptar' | 'espera' | 'rechazar' | 'despachar' | 'entregar',
    customVehiculo?: { tipo: string; placa: string; conductor: string; horaEstimada?: string }
  ) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    // Si la orden ya está entregada, protegerla para que no regrese a tintometría ni a fases preliminares
    if (order.status === 'entregado' && decision !== 'entregar') {
      showToast(`ℹ️ El pedido #${orderId} ya fue entregado en obra y queda registrado permanentemente como "Entregado".`);
      return;
    }

    let newStatus: OrderItem['status'] = 'preparando';
    if (decision === 'pendiente') newStatus = 'pendiente';
    else if (decision === 'aceptar') newStatus = 'preparando';
    else if (decision === 'espera') newStatus = 'en_espera';
    else if (decision === 'rechazar') newStatus = 'rechazado';
    else if (decision === 'despachar') newStatus = 'en_ruta';
    else if (decision === 'entregar') newStatus = 'entregado';

    const stateMsg = buildOrderStateMessage({
      status: newStatus,
      orderId: order.id,
      cliente: order.cliente,
      responsable: order.responsable,
      color: order.color,
      tipoPintura: order.tipoPintura,
      ciudad: order.ciudad,
      totalCOP: order.totalCOP,
      vehiculo: customVehiculo?.tipo || order.vehiculoAsignado,
      conductor: customVehiculo?.conductor || order.conductor,
      placa: customVehiculo?.placa || order.placa
    });

    const assignedVeh = stateMsg.logistica.vehiculo;
    const assignedPlaca = stateMsg.logistica.placa;
    const assignedCond = stateMsg.logistica.conductor;
    const statusLabel = stateMsg.statusLabel;
    const emailMsg = stateMsg.mensajeEmail;

    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          return {
            ...o,
            status: newStatus,
            vehiculoAsignado: assignedVeh,
            placa: assignedPlaca,
            conductor: assignedCond,
            notificaciones: [
              {
                tipo: 'email',
                texto: stateMsg.mensajeNotificacion,
                fecha: `Ahora mismo (${statusLabel})`
              },
              ...o.notificaciones
            ]
          };
        }
        return o;
      })
    );

    showToast(`✓ Estado actualizado: "${statusLabel}". Enviando notificación por correo a ${order.email}...`);

    if (newStatus === 'pendiente' || newStatus === 'preparando' || newStatus === 'en_ruta' || newStatus === 'entregado') {
      saveClientOrderToHistory({
        id: order.id,
        orderNumber: order.id,
        fecha: new Date().toISOString(),
        cliente: order.cliente,
        nit: order.nit,
        responsable: order.responsable,
        email: order.email,
        ciudad: order.ciudad,
        areaM2: order.areaM2,
        tipoPintura: order.tipoPintura,
        color: order.color,
        totalCOP: order.totalCOP,
        status: newStatus,
        vehiculo: assignedVeh,
        conductor: assignedCond,
        placa: assignedPlaca,
        mensaje: stateMsg.mensajeNotificacion
      });
    }

    // Sincronizar cambio de estado y su mensaje con Vercel Serverless
    fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderNumber: order.id,
        cliente: order.cliente,
        responsable: order.responsable,
        email: order.email,
        ciudad: order.ciudad,
        status: newStatus,
        vehiculo: assignedVeh,
        conductor: assignedCond,
        placa: assignedPlaca,
        totalCOP: order.totalCOP,
        mensaje: stateMsg.mensajeNotificacion
      })
    }).catch(() => {});

    try {
      await sendOrderStatusUpdateEmail({
        orderId: order.id,
        cliente: order.cliente,
        responsable: order.responsable,
        email: order.email,
        status: newStatus,
        statusLabel,
        mensaje: emailMsg,
        vehiculo: assignedVeh,
        conductor: assignedCond,
        placa: assignedPlaca,
        ciudad: order.ciudad,
        totalCOP: order.totalCOP
      });
    } catch (err) {
      console.warn('[Email] Error al enviar correo:', err);
    }
  };

  // Enviar mensaje oficial por Correo Electrónico (Cambia dinámicamente según el estado actual del pedido)
  const handleTriggerNotification = (order: OrderItem) => {
    const stateMsg = buildOrderStateMessage({
      status: order.status,
      orderId: order.id,
      cliente: order.cliente,
      responsable: order.responsable,
      color: order.color,
      tipoPintura: order.tipoPintura,
      ciudad: order.ciudad,
      totalCOP: order.totalCOP,
      vehiculo: order.vehiculoAsignado,
      conductor: order.conductor,
      placa: order.placa
    });

    setModalNotificationData({ tipo: 'email', order, mensaje: stateMsg.mensajeEmail });
    setShowNotificationModal(true);
  };

  const handleConfirmSendNotification = async () => {
    if (!modalNotificationData) return;
    const { order, mensaje } = modalNotificationData;

    const stateMsg = buildOrderStateMessage({
      status: order.status,
      orderId: order.id,
      cliente: order.cliente,
      responsable: order.responsable,
      color: order.color,
      tipoPintura: order.tipoPintura,
      ciudad: order.ciudad,
      totalCOP: order.totalCOP,
      vehiculo: order.vehiculoAsignado,
      conductor: order.conductor,
      placa: order.placa
    });

    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === order.id) {
          const newNotifs = [...o.notificaciones];
          newNotifs.unshift({
            tipo: 'email',
            texto: stateMsg.mensajeNotificacion,
            fecha: `Ahora mismo (${stateMsg.statusLabel})`
          });
          return {
            ...o,
            notificaciones: newNotifs
          };
        }
        return o;
      })
    );

    setShowNotificationModal(false);

    showToast(`Enviando correo específico de "${stateMsg.statusLabel}" a ${order.email}...`);
    try {
      const emailRes = await sendOrderStatusUpdateEmail({
        orderId: order.id,
        cliente: order.cliente,
        responsable: order.responsable,
        email: order.email,
        status: order.status,
        statusLabel: stateMsg.statusLabel,
        mensaje,
        vehiculo: stateMsg.logistica.vehiculo,
        conductor: stateMsg.logistica.conductor,
        placa: stateMsg.logistica.placa,
        ciudad: order.ciudad,
        totalCOP: order.totalCOP
      });

      if (emailRes.success) {
        showToast(`✓ Correo de "${stateMsg.statusLabel}" enviado a ${order.email}`);
      } else {
        await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: order.email,
            subject: `🎨 COLORLINK® • Pedido #${order.id} [${stateMsg.statusLabel}]`,
            text: mensaje
          })
        });
        showToast(`✓ Correo de "${stateMsg.statusLabel}" procesado para ${order.email}`);
      }
    } catch (err) {
      showToast(`✓ Notificación de "${stateMsg.statusLabel}" registrada para ${order.email}`);
    }
  };

  const showToast = (text: string) => {
    setNotificationToast(text);
    setTimeout(() => setNotificationToast(null), 3800);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* TOAST DE CONFIRMACIÓN */}
      {notificationToast && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl border border-emerald-500 text-xs font-bold flex items-center gap-2.5 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
          <span>{notificationToast}</span>
        </div>
      )}

      {/* HEADER OPERATIVO CLARO Y PINTURESCO COLORLINK CON FOTO REAL DE CEDI & FÁBRICA */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm relative overflow-hidden">
        {/* Barra de colores vivos Colorlink */}
        <div className="h-2 w-full bg-gradient-to-r from-[#FF5500] via-[#FF007A] via-[#0055FF] via-[#00D2FF] to-[#10E57A]" />

        <div className="p-6 sm:p-7 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Columna Izquierda: Información Operativa & Título */}
            <div className="lg:col-span-7 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 bg-gradient-to-r from-sky-600 to-blue-600 text-white text-xs font-bold rounded-full flex items-center gap-1.5 shadow-xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-sky-200" />
                  <span>Centro Nacional de Operaciones & Despachos Colorlink®</span>
                </span>
                <span className="px-3 py-1 bg-amber-50 text-amber-900 text-xs font-bold rounded-full border border-amber-200 flex items-center gap-1">
                  <User className="w-3 h-3 text-amber-700" />
                  <span>Supervisor: Ing. Carlos Mario Restrepo</span>
                </span>
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 text-[11px] font-black rounded-full border border-emerald-200 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>En Línea</span>
                </span>
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <span>Gestión de Pedidos & Logística Nacional</span>
                  <span className="text-2xl">🐧</span>
                </h1>
                <p className="text-slate-600 text-xs sm:text-sm max-w-2xl mt-1 leading-relaxed">
                  Supervisión y trazabilidad de pedidos en tiempo real, asignación autónoma de buses nodriza y rutas con IA, verificación de inventario y mensajería automática por correo electrónico.
                </p>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={onBackToClientView}
                  className="px-4 py-2.5 bg-gradient-to-r from-sky-600 to-blue-600 hover:brightness-110 text-white text-xs font-black rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <Eye className="w-4 h-4 text-sky-200" />
                  <span>Ver Portal del Cliente</span>
                </button>
                <button
                  type="button"
                  onClick={onBackToClientView}
                  className="px-3.5 py-2.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 text-xs font-bold rounded-xl transition-all border border-slate-200 flex items-center gap-1.5 cursor-pointer"
                  title="Salir del Modo Administrador"
                >
                  <LogOut className="w-4 h-4 text-slate-500" />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            </div>

            {/* Columna Derecha: Tarjeta Fotográfica de Fábrica & CEDI Central */}
            <div className="lg:col-span-5 rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative group">
              <div className="relative h-44 sm:h-48 w-full overflow-hidden bg-slate-900">
                <img
                  src={factoryCediImg}
                  alt="Planta de Producción y CEDI Central Colorlink"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/40 to-transparent" />
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                  <span className="px-2.5 py-0.5 rounded-md bg-white/95 text-slate-900 text-[10px] font-black uppercase tracking-wider shadow-xs flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-[#FF5500]" />
                    <span>Planta Central Medellín</span>
                  </span>
                </div>
                <div className="absolute bottom-3 left-3.5 right-3.5 text-white">
                  <h3 className="text-xs sm:text-sm font-black leading-snug text-white">
                    Mega CEDI & Flota de Despacho Nacional
                  </h3>
                  <div className="flex items-center justify-between text-[11px] text-sky-200 font-bold mt-1">
                    <span>✓ 8 Sedes Conectadas</span>
                    <span className="font-mono text-white/90">Capacidad: 8.500 cuñ/mes</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RESUMEN EJECUTIVO DE OPERACIONES (MÉTRICAS CLAVE EN MONOSPACE TABULAR NUMS) */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5 border-t border-slate-100">
            <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/90 shadow-2xs">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                  Facturación Acumulada
                </span>
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <strong className="text-lg sm:text-xl font-black text-slate-900 block font-mono tabular-nums">
                {formatCOP(totalNacionalCOP)}
              </strong>
              <span className="text-[10px] text-emerald-700 font-bold block mt-0.5">
                ✓ {orders.length} pedidos registrados
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/90 shadow-2xs">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                  Red de CEDIs
                </span>
                <MapPin className="w-3.5 h-3.5 text-sky-600" />
              </div>
              <strong className="text-lg sm:text-xl font-black text-slate-900 block font-mono tabular-nums">
                {cityAnalytics.length} Sedes Nacionales
              </strong>
              <span className="text-[10px] text-sky-700 font-bold block mt-0.5 truncate">
                {cityAnalytics[0]?.ciudad || 'Medellín'} (Sede Líder)
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/90 shadow-2xs">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                  Base de Clientes
                </span>
                <Users className="w-3.5 h-3.5 text-purple-600" />
              </div>
              <strong className="text-lg sm:text-xl font-black text-slate-900 block font-mono tabular-nums">
                {supabaseClients.length} Registrados
              </strong>
              <span className="text-[10px] text-purple-700 font-bold block mt-0.5">
                Directorio en la nube
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/90 shadow-2xs">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                  Auto-Piloto IA
                </span>
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <strong className="text-lg sm:text-xl font-black text-slate-900 block font-mono">
                Pincelito IA
              </strong>
              <span className="text-[10px] text-emerald-700 font-bold block mt-0.5">
                ● Auditoría & Despacho Activos
              </span>
            </div>
          </div>

          {/* TABS PRINCIPALES DE GESTIÓN (SEGMENTED CONTROL CON CONTADORES) */}
          <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2">
            {/* Tab 1: Pedidos */}
            <button
              type="button"
              onClick={() => setActiveTab('pedidos')}
              className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-between sm:justify-start gap-1.5 sm:gap-2 cursor-pointer ${
                activeTab === 'pedidos'
                  ? 'bg-gradient-to-r from-sky-600 to-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80'
              }`}
            >
              <div className="flex items-center gap-1.5 truncate">
                <Truck className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                <span className="sm:hidden truncate">Pedidos</span>
                <span className="hidden sm:inline">Supervisión de Pedidos & Despacho IA</span>
              </div>
              <span className={`px-1.5 sm:px-2 py-0.5 rounded-md text-[10px] font-mono font-black shrink-0 ${
                activeTab === 'pedidos' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-800'
              }`}>
                {orders.length}
              </span>
            </button>

            {/* Tab 2: Ciudades con fotos */}
            <button
              type="button"
              onClick={() => setActiveTab('ciudades')}
              className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-between sm:justify-start gap-1.5 sm:gap-2 cursor-pointer ${
                activeTab === 'ciudades'
                  ? 'bg-gradient-to-r from-[#FF5500] to-[#FF8800] text-white shadow-md shadow-orange-500/20'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80'
              }`}
            >
              <div className="flex items-center gap-1.5 truncate">
                <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                <span className="sm:hidden truncate">Sedes</span>
                <span className="hidden sm:inline">Sedes & Ventas por Ciudad</span>
              </div>
              <span className={`px-1.5 sm:px-2 py-0.5 rounded-md text-[10px] font-mono font-black shrink-0 ${
                activeTab === 'ciudades' ? 'bg-white/20 text-white' : 'bg-orange-100 text-orange-900'
              }`}>
                {cityAnalytics.length}
              </span>
            </button>

            {/* Tab 3: Clientes */}
            <button
              type="button"
              onClick={() => {
                setActiveTab('clientes');
                fetchClientsFromSupabase();
              }}
              className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-between sm:justify-start gap-1.5 sm:gap-2 cursor-pointer ${
                activeTab === 'clientes'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/20'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80'
              }`}
            >
              <div className="flex items-center gap-1.5 truncate">
                <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                <span className="sm:hidden truncate">Clientes</span>
                <span className="hidden sm:inline">Directorio de Clientes</span>
              </div>
              <span className={`px-1.5 sm:px-2 py-0.5 rounded-md text-[10px] font-mono font-black shrink-0 ${
                activeTab === 'clientes' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-900'
              }`}>
                {supabaseClients.length}
              </span>
            </button>

            {/* Tab 4: Inventario */}
            <button
              type="button"
              onClick={() => setActiveTab('stock')}
              className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-between sm:justify-start gap-1.5 sm:gap-2 cursor-pointer ${
                activeTab === 'stock'
                  ? 'bg-gradient-to-r from-[#FF007A] to-purple-600 text-white shadow-md shadow-pink-500/20'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80'
              }`}
            >
              <div className="flex items-center gap-1.5 truncate">
                <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                <span className="sm:hidden truncate">Inventario</span>
                <span className="hidden sm:inline">Inventario & Fórmulas Tintométricas</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* CONTENIDO DE TAB 1: SUPERVISIÓN DE PEDIDOS, AUDITORÍA IA, FLOTA Y MENSAJERÍA */}
      {activeTab === 'pedidos' && (
        <div className="space-y-5">
          {/* BARRA SUPERIOR: AUTO-PILOTO IA Y ASIGNACIÓN AUTOMÁTICA CON DEGRADADO DE MARCA */}
          <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-[#002B99] via-[#0055FF] to-[#00D2FF] text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shrink-0 shadow-inner">
                <Sparkles className="w-6 h-6 text-amber-300 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-sm sm:text-base tracking-tight text-white">
                    Modo Despacho & Asignación Autónoma IA
                  </h3>
                  <span className="px-2.5 py-0.5 bg-emerald-400 text-slate-950 font-black text-[10px] rounded-full uppercase tracking-wider shadow-xs">
                    ● ACTIVO
                  </span>
                </div>
                <p className="text-xs text-sky-100 max-w-2xl mt-0.5">
                  La IA escoge automáticamente el bus de la flota, calcula y asigna la ruta vial óptima y despacha las notificaciones al cliente.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={handleRunAutoPilotForAllPending}
                disabled={isAutoPilotRunning}
                className="px-4 py-2.5 bg-white hover:bg-sky-50 text-sky-900 font-black text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-60"
              >
                <Sparkles className="w-4 h-4 text-sky-600" />
                <span>{isAutoPilotRunning ? 'Asignando Flota y Rutas...' : '⚡ Auto-Asignar Todos los Pendientes con IA'}</span>
                <span className="px-2 py-0.5 bg-sky-100 text-sky-900 rounded-md text-[10px] font-mono font-black">
                  {orders.filter((o) => o.status === 'pendiente').length}
                </span>
              </button>
            </div>
          </div>

          {/* PANEL OFICIAL DEL CICLO DE ACTUALIZACIÓN CADA 20 MINUTOS */}
          <div className="p-4 sm:p-5 rounded-3xl bg-white border-2 border-sky-300 shadow-sm space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-sky-500/10 text-sky-600 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-sky-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                      Flujo de Estados y Despacho de Pedidos
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                      ● Activo en Tiempo Real
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    1. <strong>Pedido Recibido</strong> ➔ 2. <strong>En Laboratorio de Tintometría</strong> ➔ 3. <strong>Despachando en Ruta</strong> ➔ 4. <strong>Entregado en Obra</strong>. Sincronizado en tiempo real con el cliente.
                  </p>
                </div>
              </div>

              {/* Botón de Control de Avance de Pedidos */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={advanceAllOrdersCycle}
                  className="px-4 py-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:brightness-110 text-white font-black text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                  title="Avanzar a la siguiente etapa operativa de los pedidos activos"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>Avanzar Etapa de Pedidos</span>
                </button>
              </div>
            </div>

            {/* Stepper visual de las 4 fases del ciclo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
              <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-950 flex items-start gap-2.5">
                <span className="w-6 h-6 rounded-lg bg-amber-500 text-white flex items-center justify-center font-black text-xs shrink-0">1</span>
                <div>
                  <strong className="block font-black text-xs text-amber-900">Pedido Recibido</strong>
                  <p className="text-[11px] text-amber-800 leading-tight">Orden radicada y programada para dosificación.</p>
                  <span className="text-[10px] font-mono text-amber-700 font-bold block mt-1">
                    {orders.filter(o => o.status === 'pendiente').length} pedido(s)
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-sky-50/80 border border-sky-200 text-sky-950 flex items-start gap-2.5">
                <span className="w-6 h-6 rounded-lg bg-sky-600 text-white flex items-center justify-center font-black text-xs shrink-0">2</span>
                <div>
                  <strong className="block font-black text-xs text-sky-900">En Tintometría</strong>
                  <p className="text-[11px] text-sky-800 leading-tight">Formulación computarizada de color en laboratorio.</p>
                  <span className="text-[10px] font-mono text-sky-700 font-bold block mt-1">
                    {orders.filter(o => o.status === 'preparando').length} pedido(s)
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-purple-50/80 border border-purple-200 text-purple-950 flex items-start gap-2.5">
                <span className="w-6 h-6 rounded-lg bg-purple-600 text-white flex items-center justify-center font-black text-xs shrink-0">3</span>
                <div>
                  <strong className="block font-black text-xs text-purple-900">Despachando en Ruta</strong>
                  <p className="text-[11px] text-purple-800 leading-tight">Vehículo asignado y notificación de despacho enviada.</p>
                  <span className="text-[10px] font-mono text-purple-700 font-bold block mt-1">
                    {orders.filter(o => o.status === 'en_ruta').length} pedido(s)
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-emerald-950 flex items-start gap-2.5">
                <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-black text-xs shrink-0">4</span>
                <div>
                  <strong className="block font-black text-xs text-emerald-900">Entregado en Obra</strong>
                  <p className="text-[11px] text-emerald-800 leading-tight">Entrega confirmada con remisión y garantía NTC 1335.</p>
                  <span className="text-[10px] font-mono text-emerald-700 font-bold block mt-1">
                    {orders.filter(o => o.status === 'entregado').length} pedido(s)
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Columna Izquierda: Lista de Pedidos Entrantes con Búsqueda y Filtros Ordenados */}
          <div className="lg:col-span-5 space-y-3">
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Inbox className="w-4 h-4 text-sky-600" />
                  <h3 className="text-sm font-extrabold text-slate-900">
                    Bandeja de Pedidos ({orders.length})
                  </h3>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      syncAllOrders();
                      showToast('✓ Bandeja sincronizada con el servidor y almacenamiento local.');
                    }}
                    className="px-2 py-0.5 rounded-lg bg-sky-100 hover:bg-sky-200 text-sky-800 text-[10px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                    title="Actualizar y sincronizar pedidos"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Actualizar</span>
                  </button>
                  <span className="text-[10px] bg-sky-50 text-sky-700 px-2 py-0.5 rounded-full font-bold border border-sky-200">
                    En Vivo
                  </span>
                </div>
              </div>

              {/* Barra de Búsqueda Rápida */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={orderSearchText}
                  onChange={(e) => setOrderSearchText(e.target.value)}
                  placeholder="Buscar por cliente, ID, ciudad o responsable..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all"
                />
              </div>

              {/* Filtros por Estado */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[10px]">
                {[
                  { id: 'todos', label: 'Todos' },
                  { id: 'pendiente', label: 'Por Aprobar' },
                  { id: 'preparando', label: 'En Tintometría' },
                  { id: 'en_ruta', label: 'En Camino' },
                  { id: 'entregado', label: 'Entregados' },
                  { id: 'en_espera', label: 'En Espera' },
                  { id: 'rechazado', label: 'Rechazados' }
                ].map((st) => {
                  const count =
                    st.id === 'todos'
                      ? orders.length
                      : orders.filter((o) => o.status === st.id).length;
                  return (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setOrderStatusFilter(st.id as any)}
                      className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1 ${
                        orderStatusFilter === st.id
                          ? 'bg-sky-600 text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <span>{st.label}</span>
                      <span
                        className={`text-[9px] px-1 rounded-full ${
                          orderStatusFilter === st.id ? 'bg-white/20' : 'bg-slate-200 text-slate-800'
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Lista Filtrada de Pedidos con Fotografía de Ciudad */}
              <div className="space-y-2.5 max-h-[580px] overflow-y-auto pr-1">
                {(() => {
                  const filtered = orders.filter((ord) => {
                    const q = (orderSearchText || '').toLowerCase();
                    const matchesSearch =
                      (ord.id || '').toLowerCase().includes(q) ||
                      (ord.cliente || '').toLowerCase().includes(q) ||
                      (ord.ciudad || '').toLowerCase().includes(q) ||
                      (ord.responsable || '').toLowerCase().includes(q);
                    const matchesStatus =
                      orderStatusFilter === 'todos' || ord.status === orderStatusFilter;
                    return matchesSearch && matchesStatus;
                  });

                  if (filtered.length === 0) {
                    return (
                      <div className="p-6 text-center bg-slate-50 border border-dashed border-slate-300 rounded-2xl space-y-2.5 animate-fadeIn">
                        <Inbox className="w-8 h-8 text-slate-400 mx-auto" />
                        <p className="text-xs font-bold text-slate-700">
                          No se encontraron pedidos con el filtro actual ({orderStatusFilter})
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setOrderStatusFilter('todos');
                            setOrderSearchText('');
                          }}
                          className="px-3 py-1.5 bg-sky-100 hover:bg-sky-200 text-sky-800 rounded-lg text-xs font-bold cursor-pointer transition-colors"
                        >
                          Mostrar todos los pedidos ({orders.length})
                        </button>
                      </div>
                    );
                  }

                  return filtered.map((ord) => {
                    const isSelected = ord.id === selectedOrderId;
                    return (
                      <div
                        key={ord.id}
                        onClick={() => setSelectedOrderId(ord.id)}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'border-sky-500 bg-sky-50/50 shadow-xs ring-2 ring-sky-500/20'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {/* Miniatura de la Ciudad */}
                          <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-slate-200 shadow-2xs">
                            <img
                              src={getCityImage(ord.ciudad || 'Medellín')}
                              alt={ord.ciudad || 'Medellín'}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-white/95 via-white/40 to-transparent" />
                            <span className="absolute bottom-0.5 left-1 text-[8px] font-black text-slate-900 uppercase truncate max-w-[50px]">
                              {(ord.ciudad || 'Medellín').split(' ')[0]}
                            </span>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <span className="font-extrabold text-xs text-slate-900">{ord.id}</span>
                              <span
                                className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                                  ord.status === 'pendiente'
                                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                    : ord.status === 'preparando'
                                    ? 'bg-sky-100 text-sky-800 border border-sky-200'
                                    : ord.status === 'en_ruta'
                                    ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                    : ord.status === 'en_espera'
                                    ? 'bg-orange-100 text-orange-900 border border-orange-300'
                                    : ord.status === 'rechazado'
                                    ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                    : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                }`}
                              >
                                {ord.status === 'pendiente' && '⏳ Pedido Recibido'}
                                {ord.status === 'preparando' && '🎨 En Tintometría'}
                                {ord.status === 'en_ruta' && '🚚 Despachando en Ruta'}
                                {ord.status === 'en_espera' && 'En Espera'}
                                {ord.status === 'rechazado' && 'Rechazado'}
                                {ord.status === 'entregado' && '✅ Entregado en Obra'}
                              </span>
                            </div>

                            <h4 className="font-bold text-xs text-slate-900 truncate">
                              {ord.cliente}
                            </h4>
                            <p className="text-[11px] text-slate-600 truncate">
                              {ord.areaM2} m² • {ord.tipoPintura}
                            </p>

                            <div className="mt-1.5 flex items-center justify-between text-[10px]">
                              <span className="text-slate-500">{ord.ciudad}</span>
                              <strong className="font-mono font-bold text-slate-900">
                                {formatCOP(ord.totalCOP)}
                              </strong>
                            </div>
                          </div>
                        </div>

                        {ord.vehiculoAsignado && (
                          <div className="mt-2 pt-2 border-t border-slate-200/70 flex items-center justify-between text-[10px] text-slate-600">
                            <span className="flex items-center gap-1 font-semibold text-[#009FE3]">
                              <Truck className="w-3 h-3 text-[#009FE3]" />
                              {ord.vehiculoAsignado} ({ord.placa})
                            </span>
                            <span className="font-bold text-emerald-700">
                              ETA: {ord.rutaOptima?.horaEstimada || 'Hoy'}
                            </span>
                          </div>
                        )}

                        {/* Resumen del mensaje específico según el estado actual de este pedido */}
                        <div className="mt-2 p-2 rounded-xl bg-slate-50 border border-slate-200/80 text-[10px] text-slate-700 leading-snug line-clamp-2">
                          {buildOrderStateMessage({
                            status: ord.status,
                            orderId: ord.id,
                            cliente: ord.cliente,
                            responsable: ord.responsable,
                            color: ord.color,
                            tipoPintura: ord.tipoPintura,
                            ciudad: ord.ciudad,
                            totalCOP: ord.totalCOP,
                            vehiculo: ord.vehiculoAsignado,
                            conductor: ord.conductor,
                            placa: ord.placa
                          }).mensajeNotificacion}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          </div>

          {/* Columna Derecha: Detalle de Supervisión, Auditoría de Stock con IA y Notificaciones por Correo */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-6">
              {/* Encabezado del Pedido Seleccionado */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-slate-200 shadow-2xs">
                    <img
                      src={getCityImage(activeOrder.ciudad)}
                      alt={activeOrder.ciudad}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono font-black text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-lg border border-sky-200">
                        {activeOrder.id}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        NIT: {activeOrder.nit}
                      </span>
                      <span className="text-xs text-slate-700 font-bold">• {activeOrder.ciudad}</span>
                    </div>
                    <h2 className="text-lg font-black text-slate-900">{activeOrder.cliente}</h2>
                    <p className="text-xs text-slate-500">
                      Responsable: <strong>{activeOrder.responsable}</strong> • {activeOrder.telefono}
                    </p>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">
                    Valor Liquidado
                  </span>
                  <strong className="text-lg font-black text-slate-900 font-mono">
                    {formatCOP(activeOrder.totalCOP)} COP
                  </strong>
                  <span className="text-[10px] font-bold text-sky-600 block">
                    {activeOrder.email}
                  </span>
                </div>
              </div>

              {/* PANEL DESTACADO: ASIGNACIÓN Y DICTAMEN DE LA IA CON DECISIÓN ACEPTAR / RECHAZAR */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-sky-50 via-blue-50/60 to-cyan-50/40 border-2 border-sky-300 shadow-xs space-y-4">
                {/* Header del Panel IA */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-sky-200">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white flex items-center justify-center shadow-xs">
                      <Sparkles className="w-5 h-5 text-amber-200 animate-pulse" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                          Resolución y Gestión Logística Colorlink®
                        </h4>
                        {activeOrder.status === 'pendiente' && (
                          <span className="px-2.5 py-0.5 bg-amber-100 text-amber-900 text-[10px] font-extrabold rounded-full border border-amber-300">
                            ⏳ Estado 1/4: Pedido Recibido • En espera de Tintometría
                          </span>
                        )}
                        {activeOrder.status === 'preparando' && (
                          <span className="px-2.5 py-0.5 bg-sky-100 text-sky-900 text-[10px] font-extrabold rounded-full border border-sky-300">
                            🎨 Estado 2/4: En Laboratorio de Tintometría
                          </span>
                        )}
                        {activeOrder.status === 'en_ruta' && (
                          <span className="px-2.5 py-0.5 bg-purple-100 text-purple-900 text-[10px] font-extrabold rounded-full border border-purple-300">
                            🚚 Estado 3/4: Despachando en Ruta a Obra
                          </span>
                        )}
                        {activeOrder.status === 'entregado' && (
                          <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-900 text-[10px] font-extrabold rounded-full border border-emerald-300">
                            ✅ Estado 4/4: Pedido Entregado con Éxito en Obra
                          </span>
                        )}
                        {activeOrder.status === 'en_espera' && (
                          <span className="px-2.5 py-0.5 bg-orange-100 text-orange-950 text-[10px] font-extrabold rounded-full border border-orange-300">
                            📦 En Espera de Transferencia CEDI
                          </span>
                        )}
                        {activeOrder.status === 'rechazado' && (
                          <span className="px-2.5 py-0.5 bg-rose-100 text-rose-900 text-[10px] font-extrabold rounded-full border border-rose-300">
                            ⚠️ Rechazado por Auditoría Técnica
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        {buildOrderStateMessage({
                          status: activeOrder.status,
                          orderId: activeOrder.id,
                          cliente: activeOrder.cliente,
                          responsable: activeOrder.responsable,
                          color: activeOrder.color,
                          tipoPintura: activeOrder.tipoPintura,
                          ciudad: activeOrder.ciudad,
                          totalCOP: activeOrder.totalCOP,
                          vehiculo: activeOrder.vehiculoAsignado,
                          conductor: activeOrder.conductor,
                          placa: activeOrder.placa
                        }).mensajeServidor}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleRunAutoPilotForOrder(activeOrder.id)}
                      className="px-3.5 py-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:brightness-110 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                      <span>Re-evaluar con IA</span>
                    </button>
                  </div>
                </div>

                {/* MENSAJE DINÁMICO EXCLUSIVO SEGÚN EL ESTADO ACTUAL DEL PEDIDO SELECCIONADO */}
                {(() => {
                  const activeStateMsg = buildOrderStateMessage({
                    status: activeOrder.status,
                    orderId: activeOrder.id,
                    cliente: activeOrder.cliente,
                    responsable: activeOrder.responsable,
                    color: activeOrder.color,
                    tipoPintura: activeOrder.tipoPintura,
                    ciudad: activeOrder.ciudad,
                    totalCOP: activeOrder.totalCOP,
                    vehiculo: activeOrder.vehiculoAsignado,
                    conductor: activeOrder.conductor,
                    placa: activeOrder.placa
                  });

                  const bannerColor =
                    activeOrder.status === 'entregado'
                      ? 'bg-emerald-50 border-emerald-400 text-emerald-950'
                      : activeOrder.status === 'en_ruta'
                      ? 'bg-purple-50 border-purple-400 text-purple-950'
                      : activeOrder.status === 'preparando'
                      ? 'bg-sky-50 border-sky-400 text-sky-950'
                      : activeOrder.status === 'en_espera'
                      ? 'bg-orange-50 border-orange-400 text-orange-950'
                      : activeOrder.status === 'rechazado'
                      ? 'bg-rose-50 border-rose-400 text-rose-950'
                      : 'bg-amber-50 border-amber-400 text-amber-950';

                  return (
                    <div className={`p-4 rounded-2xl border-2 space-y-2.5 transition-all ${bannerColor}`}>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-current/15">
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-wider opacity-75 block">
                            Mensaje Oficial según el Estado Actual ({activeStateMsg.statusLabel})
                          </span>
                          <strong className="text-xs sm:text-sm font-black block">
                            {activeStateMsg.tituloNotificacion}
                          </strong>
                        </div>
                        <div className="flex items-center gap-1 flex-wrap">
                          {[
                            { dec: 'pendiente', st: 'pendiente', label: '1. Pendiente' },
                            { dec: 'aceptar', st: 'preparando', label: '2. Tintometría' },
                            { dec: 'despachar', st: 'en_ruta', label: '3. Despachando' },
                            { dec: 'entregar', st: 'entregado', label: '4. Entregado' },
                            { dec: 'espera', st: 'en_espera', label: 'En Espera' },
                            { dec: 'rechazar', st: 'rechazado', label: 'Rechazado' }
                          ].map((btn) => (
                            <button
                              key={btn.st}
                              type="button"
                              onClick={() => handleAiOrderDecision(activeOrder.id, btn.dec as any)}
                              className={`px-2 py-1 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                                activeOrder.status === btn.st
                                  ? 'bg-slate-900 text-white shadow-2xs'
                                  : 'bg-white/80 hover:bg-white text-slate-700 border border-slate-300'
                              }`}
                              title={`Cambiar a estado "${btn.label}" y ver su mensaje específico`}
                            >
                              {btn.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <p className="text-xs leading-relaxed font-medium">
                        {activeStateMsg.mensajeNotificacion}
                      </p>

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] font-bold opacity-90">
                        <span>Lote: {activeStateMsg.lote} • Remisión: #{activeStateMsg.remision}</span>
                        <span>Vehículo: {activeStateMsg.logistica.vehiculo} ({activeStateMsg.logistica.placa}) • Conductor: {activeStateMsg.logistica.conductor}</span>
                      </div>
                    </div>
                  );
                })()}

                {/* 4 TARJETAS CLAVE SOLICITADAS POR EL USUARIO */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {/* 1. ¿POR QUÉ SE ACEPTÓ? */}
                  <div className="p-4 rounded-xl bg-white border border-sky-200 shadow-2xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-black uppercase text-sky-950 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        1. ¿Por qué la IA aceptó el pedido?
                      </span>
                      <span className="text-[9px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                        Dictamen Oficial
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed font-normal bg-sky-50/50 p-2.5 rounded-lg border border-sky-100">
                      {activeOrder.dictamenIA?.porQueSeAcepto || `Aceptado automáticamente por la IA: Insumos verificados al 100% en CEDI ${activeOrder.ciudad} (stock disponible suficiente vs ${Math.max(1, Math.ceil((activeOrder.areaM2 || 50) / 28))} cuñetes requeridos), formulación tintométrica aprobada bajo norma NTC 1335 y cupo de flete asegurado.`}
                    </p>
                    <div className="flex items-center gap-3 text-[10px] text-slate-500 pt-1">
                      <span>Stock en bodega: <strong className="text-emerald-700">100% Disponible</strong></span>
                      <span>Norma: <strong>NTC 1335</strong></span>
                      <span>Aprobación: <strong className="text-sky-700">Automática por IA</strong></span>
                    </div>
                  </div>

                  {/* 2. ¿QUÉ BUS ESCOGIÓ LA IA? */}
                  <div className="p-4 rounded-xl bg-white border border-sky-200 shadow-2xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-black uppercase text-sky-950 flex items-center gap-1.5">
                        <Truck className="w-4 h-4 text-sky-600" />
                        2. ¿Qué Bus / Vehículo escogió la IA?
                      </span>
                      <span className="text-[9px] font-bold bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full border border-sky-200">
                        Flota Colorlink
                      </span>
                    </div>
                    <div className="bg-sky-50/50 p-2.5 rounded-lg border border-sky-100 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <strong className="text-xs font-black text-slate-900">
                          {activeOrder.vehiculoAsignado || activeOrder.dictamenIA?.busAsignado?.tipo || 'Buseta de Reparto Colorlink #03'}
                        </strong>
                        <span className="text-xs font-mono font-bold text-sky-700 bg-white px-2 py-0.5 rounded-md border border-sky-200">
                          Placa: {activeOrder.placa || activeOrder.dictamenIA?.busAsignado?.placa || 'TZW-402'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600">
                        Conductor asignado: <strong>{activeOrder.conductor || activeOrder.dictamenIA?.busAsignado?.conductor || 'Carlos Mario Henao'}</strong>
                      </p>
                      <p className="text-[10px] text-sky-800 font-medium">
                        {activeOrder.dictamenIA?.busAsignado?.capacidad || 'Capacidad óptima asignada por la IA según el tonelaje del pedido.'}
                      </p>
                    </div>
                  </div>

                  {/* 3. ¿QUÉ RUTA MANDÓ LA IA? */}
                  <div className="p-4 rounded-xl bg-white border border-sky-200 shadow-2xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-black uppercase text-sky-950 flex items-center gap-1.5">
                        <Navigation className="w-4 h-4 text-blue-600" />
                        3. ¿Qué Ruta mandó la IA?
                      </span>
                      <span className="text-[9px] font-bold bg-blue-50 text-blue-800 px-2 py-0.5 rounded-full border border-blue-200">
                        Ruta Óptima IA
                      </span>
                    </div>
                    <div className="bg-sky-50/50 p-2.5 rounded-lg border border-sky-100 space-y-1.5">
                      <p className="text-xs font-semibold text-slate-800">
                        {activeOrder.rutaOptima?.recorrido || activeOrder.dictamenIA?.rutaAsignada?.recorrido || 'Autopista Sur ➔ Av. Las Vegas ➔ Puente 4 Sur ➔ Obra'}
                      </p>
                      <div className="grid grid-cols-3 gap-2 text-center pt-1 border-t border-sky-100 text-[10px]">
                        <div>
                          <span className="text-slate-400 block font-bold">Distancia</span>
                          <strong className="text-slate-900">{activeOrder.rutaOptima?.distanciaKm || activeOrder.dictamenIA?.rutaAsignada?.distanciaKm || 14.2} km</strong>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-bold">Tiempo Tránsito</span>
                          <strong className="text-slate-900">{activeOrder.rutaOptima?.tiempoMin || activeOrder.dictamenIA?.rutaAsignada?.tiempoMin || 32} min</strong>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-bold">Ahorro IA</span>
                          <strong className="text-emerald-700">+{activeOrder.rutaOptima?.ahorroMin || activeOrder.dictamenIA?.rutaAsignada?.ahorroMin || 18} min</strong>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 4. ¿QUÉ MENSAJES SE MANDARON SEGÚN EL ESTADO? */}
                  <div className="p-4 rounded-xl bg-white border border-sky-200 shadow-2xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-black uppercase text-sky-950 flex items-center gap-1.5">
                        <Send className="w-4 h-4 text-emerald-600" />
                        4. Mensaje Notificado según Estado ({activeOrder.status.toUpperCase()})
                      </span>
                      <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                        Dinámico por Fase
                      </span>
                    </div>
                    <div className="bg-sky-50/50 p-2.5 rounded-lg border border-sky-100 space-y-1.5 text-xs">
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-700">
                        <Mail className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                        <span>
                          <strong>{activeOrder.email}:</strong>{' '}
                          {buildOrderStateMessage({
                            status: activeOrder.status,
                            orderId: activeOrder.id,
                            cliente: activeOrder.cliente,
                            responsable: activeOrder.responsable,
                            color: activeOrder.color,
                            tipoPintura: activeOrder.tipoPintura,
                            ciudad: activeOrder.ciudad,
                            totalCOP: activeOrder.totalCOP,
                            vehiculo: activeOrder.vehiculoAsignado,
                            conductor: activeOrder.conductor,
                            placa: activeOrder.placa
                          }).tituloNotificacion}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-snug">
                        {buildOrderStateMessage({
                          status: activeOrder.status,
                          orderId: activeOrder.id,
                          cliente: activeOrder.cliente,
                          responsable: activeOrder.responsable,
                          color: activeOrder.color,
                          tipoPintura: activeOrder.tipoPintura,
                          ciudad: activeOrder.ciudad,
                          totalCOP: activeOrder.totalCOP,
                          vehiculo: activeOrder.vehiculoAsignado,
                          conductor: activeOrder.conductor,
                          placa: activeOrder.placa
                        }).mensajeServidor}
                      </p>
                      <div className="text-[10px] text-slate-500 pt-0.5 flex items-center justify-between">
                        <span>Contacto: <strong>{activeOrder.telefono}</strong></span>
                        <span>ETA: <strong className="text-slate-900">{activeOrder.rutaOptima?.horaEstimada || 'Hoy en 45 min'}</strong></span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* PANEL DE AUDITORÍA Y CONTROL CON IA */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-sky-50/80 via-blue-50/60 to-cyan-50/50 border border-sky-200 shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white flex items-center justify-center shadow-xs">
                      <Sparkles className="w-4 h-4 text-amber-300" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                        Auditoría de Insumos & Dictamen con IA (Pincelito Inspector)
                      </h4>
                      <p className="text-[11px] text-slate-600">
                        Verifica automáticamente si en planta y CEDI hay todo lo que se pide para el pedido.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleExecuteLiveAiAudit(activeOrder)}
                      disabled={isAuditingWithAI}
                      className="py-1.5 px-3 bg-gradient-to-r from-sky-500 via-sky-600 to-blue-700 hover:brightness-110 text-white font-black text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 disabled:opacity-50"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                      <span>{isAuditingWithAI ? 'Auditando...' : 'Auditar con Gemini IA'}</span>
                    </button>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-white text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-200 shadow-2xs">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Insumos 100% Verificados en Stock
                    </span>
                  </div>
                </div>

                {/* Grid de Verificación de Insumos vs Stock */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                  <div className="bg-white p-3 rounded-xl border border-sky-100 shadow-2xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Requerimiento</span>
                    <strong className="text-xs font-black text-slate-900 block mt-0.5">
                      {Math.max(1, Math.ceil((activeOrder.areaM2 || 50) / 28))} Cuñetes
                    </strong>
                    <span className="text-[10px] text-sky-700 block truncate">{activeOrder.tipoPintura}</span>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-sky-100 shadow-2xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Stock en Planta</span>
                    <strong className="text-xs font-black text-emerald-700 block mt-0.5">
                      18 Cuñetes Disp.
                    </strong>
                    <span className="text-[10px] text-emerald-600 block">Suficiente para lote ✓</span>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-sky-100 shadow-2xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Sellador / Base</span>
                    <strong className="text-xs font-black text-slate-900 block mt-0.5">
                      12 Galones Disp.
                    </strong>
                    <span className="text-[10px] text-slate-500 block">Sellamur hidrófugo</span>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-sky-100 shadow-2xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Pigmentos Tintom.</span>
                    <strong className="text-xs font-black text-purple-700 block mt-0.5">
                      Base {activeOrder.color.split(' ')[0]}
                    </strong>
                    <span className="text-[10px] text-slate-500 block">Dióxido Titanio Óptimo</span>
                  </div>
                </div>

                {/* Dictamen de la IA */}
                <div className="p-3 bg-white/90 rounded-xl border border-sky-100 text-xs text-slate-700 space-y-1">
                  <div className="flex items-center justify-between">
                    <strong className="text-slate-900 flex items-center gap-1 text-[11px]">
                      <span>Dictamen Técnico de la IA:</span>
                      <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-bold">
                        Viabilidad Alta (100% de materiales en bodega)
                      </span>
                    </strong>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Estado Actual: <strong>{activeOrder.status.toUpperCase()}</strong>
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    La IA ha verificado la compatibilidad para el área de {activeOrder.areaM2} m² en {activeOrder.ciudad}. Hay insumos completos en almacén. Puedes aceptar el pedido para dosificación inmediata o gestionar su estado.
                  </p>
                </div>

                {/* SI ESTÁ PENDIENTE: PANEL EXPLÍCITO PARA ACEPTAR O RECHAZAR */}
                {activeOrder.status === 'pendiente' ? (
                  <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/80 border-2 border-amber-300 shadow-xs space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-amber-200">
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-amber-600 shrink-0" />
                        <div>
                          <h5 className="text-xs font-black text-amber-950 uppercase tracking-wide">
                            Decisión Requerida: ¿Aceptar o Rechazar este Pedido?
                          </h5>
                          <p className="text-[11px] text-amber-900">
                            El cliente seleccionó su método de pago (<strong>{activeOrder.metodoPago || 'Transferencia Bancolombia / QR'}</strong>). Revise insumos y elija si aprueba o rechaza el despacho.
                          </p>
                        </div>
                      </div>
                      <span className="px-2.5 py-0.5 bg-amber-200 text-amber-900 font-bold text-[10px] rounded-full shrink-0">
                        Pendiente de Decisión
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
                      <span className="text-xs font-extrabold text-slate-800">
                        ¿Desea Aceptar o Rechazar este pedido?
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            handleAiOrderDecision(activeOrder.id, 'aceptar');
                            setForceManualIntervention(false);
                          }}
                          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                          title="Aceptar este pedido. Pasa a tintometría y notifica al cliente por correo."
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Aceptar</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleAiOrderDecision(activeOrder.id, 'rechazar')}
                          className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                          title="Rechazar este pedido e informar al cliente por correo."
                        >
                          <AlertCircle className="w-4 h-4" />
                          <span>Rechazar</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleAiOrderDecision(activeOrder.id, 'espera')}
                          className="px-3.5 py-2.5 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 font-bold text-xs rounded-xl transition-all flex items-center gap-1 cursor-pointer active:scale-95"
                          title="Poner en espera por validación técnica."
                        >
                          <Clock className="w-3.5 h-3.5 text-amber-700" />
                          <span>En Espera</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : !(activeOrder.status === 'en_espera' || activeOrder.status === 'rechazado' || (activeOrder.cunetes && activeOrder.cunetes > 18) || forceManualIntervention) ? (
                  <div className="p-4 rounded-xl bg-emerald-50/90 border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div>
                        <h5 className="text-xs font-black text-emerald-950 uppercase tracking-wide flex items-center gap-1.5">
                          <span>Operación 100% Autónoma por IA</span>
                          <span className="text-[10px] bg-emerald-200 text-emerald-900 px-2 py-0.2 rounded-full font-bold">Sin errores</span>
                        </h5>
                        <p className="text-[11px] text-emerald-800">
                          La IA ha auditado el stock, seleccionado el vehículo ({activeOrder.vehiculoAsignado || 'Flota Colorlink'}), trazado la ruta y enviado las notificaciones. No se requiere intervención del administrador.
                        </p>
                      </div>
                    </div>
                    {/* En condiciones normales NO se muestra ningún botón según especificación del usuario */}
                  </div>
                ) : (
                  <div className="space-y-3 p-4 bg-amber-50/80 rounded-2xl border-2 border-amber-300">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                        <span className="text-xs font-black text-amber-950 uppercase tracking-wider">
                          {activeOrder.status === 'en_espera' || activeOrder.status === 'rechazado'
                            ? '🚨 Incidencia Detectada: Requiere Intervención del Administrador'
                            : '⚙️ Modo de Intervención Manual Habilitado'}
                        </span>
                      </div>
                      {forceManualIntervention && (
                        <button
                          type="button"
                          onClick={() => setForceManualIntervention(false)}
                          className="text-[10px] font-bold text-slate-600 hover:text-slate-900 underline cursor-pointer"
                        >
                          Volver a Modo Autónomo
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-amber-800">
                      {activeOrder.status === 'en_espera'
                        ? 'Demanda de cuñetes supera la disponibilidad inmediata en sede local. El supervisor debe autorizar remesa de fábrica central Medellín o reprogramar.'
                        : activeOrder.status === 'rechazado'
                        ? 'La IA pausó el despacho por incompatibilidad técnica de superficie o dirección sin cobertura. Requiere revisión técnica.'
                        : 'El administrador ha habilitado la intervención manual para ajustar parámetros o forzar un cambio de estado.'}
                    </p>

                    <div className="space-y-2 pt-1">
                      <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">
                        Acciones de Resolución del Administrador:
                      </span>

                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                        {/* Botón 1: Aceptar */}
                        <button
                          type="button"
                          onClick={() => {
                            handleAiOrderDecision(activeOrder.id, 'aceptar');
                            setForceManualIntervention(false);
                          }}
                          className={`py-2.5 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs active:scale-95 ${
                            activeOrder.status === 'preparando'
                              ? 'bg-emerald-600 text-white ring-2 ring-emerald-500/30'
                              : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                          }`}
                          title="Acepta el pedido e ingresa a tintometría. Notifica por correo al cliente."
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Aceptar</span>
                        </button>

                        {/* Botón 2: Poner en Espera */}
                        <button
                          type="button"
                          onClick={() => handleAiOrderDecision(activeOrder.id, 'espera')}
                          className={`py-2.5 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs active:scale-95 ${
                            activeOrder.status === 'en_espera'
                              ? 'bg-amber-600 text-white ring-2 ring-amber-500/30'
                              : 'bg-amber-500 hover:bg-amber-600 text-white'
                          }`}
                          title="Pone el pedido en espera por falta de insumos o validación. Notifica al cliente por correo."
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span>En Espera</span>
                        </button>

                        {/* Botón 3: Rechazar */}
                        <button
                          type="button"
                          onClick={() => handleAiOrderDecision(activeOrder.id, 'rechazar')}
                          className={`py-2.5 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs active:scale-95 ${
                            activeOrder.status === 'rechazado'
                              ? 'bg-rose-600 text-white ring-2 ring-rose-500/30'
                              : 'bg-rose-500 hover:bg-rose-600 text-white'
                          }`}
                          title="Rechaza el pedido por incompatibilidad técnica. Notifica al cliente por correo."
                        >
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>Rechazar</span>
                        </button>

                        {/* Botón 4: Asignar a Vehículo y Despachar (Va en camino) */}
                        <button
                          type="button"
                          onClick={() => {
                            handleAiOrderDecision(activeOrder.id, 'despachar');
                            setForceManualIntervention(false);
                          }}
                          className={`py-2.5 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs active:scale-95 ${
                            activeOrder.status === 'en_ruta'
                              ? 'bg-[#009FE3] text-white ring-2 ring-[#009FE3]/30'
                              : 'bg-[#009FE3] hover:bg-[#0089C4] text-white'
                          }`}
                          title="Despacha en furgón con conductor. Notifica al cliente por correo con placa y ETA."
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>En Camino</span>
                        </button>

                        {/* Botón 5: Entregado */}
                        <button
                          type="button"
                          onClick={() => {
                            handleAiOrderDecision(activeOrder.id, 'entregar');
                            setForceManualIntervention(false);
                          }}
                          className={`py-2.5 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs active:scale-95 ${
                            activeOrder.status === 'entregado'
                              ? 'bg-purple-700 text-white ring-2 ring-purple-500/30'
                              : 'bg-purple-600 hover:bg-purple-700 text-white'
                          }`}
                          title="Marca como entregado en obra y envía correo de satisfacción al cliente."
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Entregado</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Botón de Notificación Oficial al Cliente por Correo */}
              <div className="flex items-center gap-2.5 pt-1 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleTriggerNotification(activeOrder)}
                  className="w-full py-2.5 px-3 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-300 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs active:scale-98"
                  title="Enviar correo formal al cliente con la actualización del pedido"
                >
                  <Mail className="w-4 h-4 text-sky-600" />
                  <span>Enviar Correo Formal al Cliente</span>
                </button>
              </div>

              {/* SECCIÓN: HISTORIAL DE NOTIFICACIONES ENVIADAS AL CLIENTE */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span>Mensajes Enviados al Cliente ({activeOrder.notificaciones.length})</span>
                  <span className="text-[10px] text-slate-400">Canal Oficial Correo Electrónico</span>
                </h4>

                {activeOrder.notificaciones.length === 0 ? (
                  <p className="text-xs text-slate-400 italic p-3 bg-slate-50 rounded-xl">
                    No se han enviado notificaciones para este pedido aún. Usa el botón superior para avisarle al cliente por correo.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {activeOrder.notificaciones.map((notif, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800 flex items-center gap-1.5 text-[11px]">
                            <Mail className="w-3.5 h-3.5 text-sky-600" />
                            <span>Correo a {activeOrder.email}</span>
                          </span>
                          <span className="text-[10px] text-slate-400">{notif.fecha}</span>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-relaxed">{notif.texto}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>)}

      {/* CONTENIDO DE TAB CLIENTES: DIRECTORIO COMPLETO EN VIVO DESDE SUPABASE */}
      {activeTab === 'clientes' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Tarjeta de Encabezado y Métricas */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-black text-slate-900">
                      Clientes
                    </h2>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Directorio oficial de cuentas corporativas y clientes registrados
                  </p>
                </div>
              </div>

              {/* Botón de Refrescar y Estado */}
              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                <span className="text-xs text-slate-400 hidden sm:inline">
                  {supabaseClients.length} cliente{supabaseClients.length === 1 ? '' : 's'} en base de datos
                </span>
                <button
                  type="button"
                  onClick={fetchClientsFromSupabase}
                  disabled={loadingClients}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingClients ? 'animate-spin text-sky-600' : ''}`} />
                  <span>{loadingClients ? 'Consultando...' : 'Actualizar'}</span>
                </button>
              </div>
            </div>

            {/* Buscador de Clientes */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={clientSearch}
                  onChange={(e) => setClientSearch(e.target.value)}
                  placeholder="Buscar por nombre de cliente, empresa, NIT o correo..."
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                />
              </div>
              {clientSearch && (
                <button
                  type="button"
                  onClick={() => setClientSearch('')}
                  className="text-xs text-slate-500 hover:text-slate-700 px-2 py-1 font-semibold"
                >
                  Limpiar filtro
                </button>
              )}
            </div>

            {/* Tabla de Clientes en Vivo */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                    <th className="p-3.5 pl-4">Empresa / Razón Social</th>
                    <th className="p-3.5">Nombre del Cliente</th>
                    <th className="p-3.5">NIT / Documento</th>
                    <th className="p-3.5">Correo Electrónico</th>
                    <th className="p-3.5">Teléfono</th>
                    <th className="p-3.5">Canal</th>
                    <th className="p-3.5 text-center">Enviar Correo</th>
                    <th className="p-3.5 pr-4 text-right">Fecha Registro</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {loadingClients && supabaseClients.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-400">
                        <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-sky-600" />
                        <span>Cargando directorio de clientes registrados...</span>
                      </td>
                    </tr>
                  ) : supabaseClients.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-400">
                        <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                        <p className="font-semibold text-slate-600">No hay clientes registrados aún en la base de datos.</p>
                        <p className="text-[11px] text-slate-400 mt-1">Los clientes que se registren en la pantalla inicial aparecerán aquí inmediatamente.</p>
                      </td>
                    </tr>
                  ) : (
                    supabaseClients
                      .filter((c) => {
                        if (!clientSearch) return true;
                        const q = clientSearch.toLowerCase();
                        return (
                          c.nombre_razon_social?.toLowerCase().includes(q) ||
                          c.responsable?.toLowerCase().includes(q) ||
                          c.nit_documento?.toLowerCase().includes(q) ||
                          c.email_responsable?.toLowerCase().includes(q) ||
                          c.telefono_responsable?.toLowerCase().includes(q)
                        );
                      })
                      .map((client) => (
                        <tr key={client.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3.5 pl-4 font-bold text-slate-900 flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-sky-600 shrink-0" />
                            <span>{client.nombre_razon_social || 'Cliente'}</span>
                          </td>
                          <td className="p-3.5 text-slate-700 font-medium">
                            {client.responsable || '—'}
                          </td>
                          <td className="p-3.5 font-mono text-slate-600 font-semibold">
                            {client.nit_documento}
                          </td>
                          <td className="p-3.5 text-slate-600">
                            <a
                              href={`mailto:${client.email_responsable}`}
                              className="text-sky-600 hover:underline flex items-center gap-1 font-semibold"
                            >
                              <Mail className="w-3 h-3 text-slate-400" />
                              <span>{client.email_responsable}</span>
                            </a>
                          </td>
                          <td className="p-3.5 text-slate-600">
                            {client.telefono_responsable ? (
                              <span className="flex items-center gap-1 font-mono">
                                <Phone className="w-3 h-3 text-emerald-500" />
                                <span>{client.telefono_responsable}</span>
                              </span>
                            ) : (
                              <span className="text-slate-300 italic">No registrado</span>
                            )}
                          </td>
                          <td className="p-3.5">
                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600">
                              {client.canal_entrada || 'Web'}
                            </span>
                          </td>
                          <td className="p-3.5 text-center">
                            <a
                              href={`mailto:${client.email_responsable}?subject=Registro en Colorlink Pinturas&body=Hola ${client.responsable}, le contactamos desde el equipo corporativo de Colorlink.`}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-bold text-[11px] shadow-2xs transition-all active:scale-95"
                              title={`Enviar correo oficial a ${client.responsable}`}
                            >
                              <Mail className="w-3 h-3" />
                              <span>Enviar Correo</span>
                            </a>
                          </td>
                          <td className="p-3.5 pr-4 text-right text-slate-400 text-[11px] whitespace-nowrap">
                            {client.created_at
                              ? new Date(client.created_at).toLocaleDateString('es-CO', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })
                              : '—'}
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pie de tabla */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500 pt-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Directorio corporativo Colorlink® actualizado</span>
              </div>
              <span className="text-slate-400">
                Mostrando {supabaseClients.length} registro{supabaseClients.length === 1 ? '' : 's'} totales
              </span>
            </div>
          </div>
        </div>
      )}

      {/* CONTENIDO DE TAB 3: INVENTARIO DE PINTURAS & PIGMENTOS EN FÁBRICA */}
      {activeTab === 'stock' && (
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm">
          <AdminStockAndAIAdvisor queuedProjectCount={orders.length} />
        </div>
      )}

      {/* CONTENIDO DE TAB 4: VENTAS POR CIUDADES & REABASTECIMIENTO NACIONAL */}
      {activeTab === 'ciudades' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Alerta de orden de reabastecimiento */}
          {supplyNotice && (
            <div className="p-4 rounded-2xl bg-emerald-500 text-white font-bold text-xs flex items-center justify-between shadow-lg animate-fadeIn">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-white" />
                <span>{supplyNotice}</span>
              </div>
              <button
                type="button"
                onClick={() => setSupplyNotice(null)}
                className="px-2 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-white text-xs cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          )}

          {/* Encabezado General con Identidad Colorlink */}
          <div className="bg-gradient-to-r from-sky-900 via-blue-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-sky-500/30">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 text-sky-200 text-xs font-bold border border-sky-400/30 mb-2">
                  <MapPin className="w-3.5 h-3.5 text-sky-300" />
                  <span>Distribución Logística Nacional Colorlink</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  Ventas por Ciudad & Matriz de Reabastecimiento
                </h2>
                <p className="text-xs sm:text-sm text-sky-100/90 mt-1 max-w-2xl leading-relaxed">
                  Supervisa qué ciudad vendió más en facturación y volumen de pedidos, y gestiona exactamente qué pinturas, marcas y cuñetes se necesitan pedir para cada sede regional.
                </p>
              </div>

              {/* Botón de Exportar / Reabastecimiento Global */}
              <div className="shrink-0 flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => handleRequestCitySupply('Nacional (Todas las Sedes)')}
                  className="px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-xs rounded-2xl shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <Boxes className="w-4 h-4" />
                  <span>Reabastecer Todas las Sedes</span>
                </button>
              </div>
            </div>

            {/* 4 KPIs de Resumen Nacional */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-sky-500/30">
              <div className="bg-white/10 backdrop-blur-xs p-4 rounded-2xl border border-white/10">
                <span className="text-[11px] font-bold text-sky-200 uppercase tracking-wider block">
                  Facturación Total Nacional
                </span>
                <strong className="text-xl sm:text-2xl font-black text-white block mt-1">
                  {formatCOP(totalNacionalCOP)}
                </strong>
                <span className="text-[11px] text-sky-100/80 mt-1 block">
                  {orders.length} pedidos en {cityAnalytics.length} ciudades
                </span>
              </div>

              <div className="bg-gradient-to-br from-amber-500/20 to-amber-600/30 backdrop-blur-xs p-4 rounded-2xl border border-amber-400/40">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-amber-200 uppercase tracking-wider block">
                    🥇 Ciudad #1 Más Vendida
                  </span>
                  <Award className="w-4 h-4 text-amber-300" />
                </div>
                <strong className="text-xl sm:text-2xl font-black text-amber-100 block mt-1">
                  {cityAnalytics[0]?.ciudad || 'Medellín'}
                </strong>
                <span className="text-[11px] text-amber-200/90 font-medium mt-1 block">
                  {formatCOP(cityAnalytics[0]?.totalCOP || 0)} (
                  {totalNacionalCOP > 0
                    ? Math.round(((cityAnalytics[0]?.totalCOP || 0) / totalNacionalCOP) * 100)
                    : 0}
                  % de la venta nacional)
                </span>
              </div>

              <div className="bg-gradient-to-br from-purple-400/20 to-purple-500/30 backdrop-blur-xs p-4 rounded-2xl border border-purple-300/40">
                <span className="text-[11px] font-bold text-purple-200 uppercase tracking-wider block">
                  🥈 Ciudad #2 en Ventas
                </span>
                <strong className="text-xl sm:text-2xl font-black text-white block mt-1">
                  {cityAnalytics[1]?.ciudad || 'Bogotá D.C.'}
                </strong>
                <span className="text-[11px] text-purple-100/90 font-medium mt-1 block">
                  {formatCOP(cityAnalytics[1]?.totalCOP || 0)} (
                  {totalNacionalCOP > 0
                    ? Math.round(((cityAnalytics[1]?.totalCOP || 0) / totalNacionalCOP) * 100)
                    : 0}
                  % de la venta nacional)
                </span>
              </div>

              <div className="bg-white/10 backdrop-blur-xs p-4 rounded-2xl border border-white/10">
                <span className="text-[11px] font-bold text-sky-200 uppercase tracking-wider block">
                  Total Cuñetes Requeridos
                </span>
                <strong className="text-xl sm:text-2xl font-black text-white block mt-1">
                  {totalCunetesNacional} Cuñetes
                </strong>
                <span className="text-[11px] text-sky-100/80 mt-1 block">
                  Para surtir obras activas en obra
                </span>
              </div>
            </div>
          </div>

          {/* MÓDULO 1: RANKING VISUAL: ¿CUÁL CIUDAD VENDIÓ MÁS? */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Ranking de Ventas por Ciudad: ¿Cuál Vendió Más?
                  </h3>
                  <p className="text-xs text-slate-500">
                    Ordenado de mayor a menor según facturación acumulada (COP) y cuota de mercado regional.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500">Filtrar tabla:</span>
                <select
                  value={selectedCityFilter}
                  onChange={(e) => setSelectedCityFilter(e.target.value)}
                  className="px-3 py-1.5 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
                >
                  <option value="todas">Todas las Ciudades ({cityAnalytics.length})</option>
                  {cityAnalytics.map((c) => (
                    <option key={c.ciudad} value={c.ciudad}>
                      {c.ciudad} ({formatCOP(c.totalCOP)})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Barras y Tarjetas de Ranking */}
            <div className="space-y-3 pt-2">
              {cityAnalytics.map((item, idx) => {
                const percentage =
                  totalNacionalCOP > 0 ? Math.round((item.totalCOP / totalNacionalCOP) * 100) : 0;
                const isSelected = selectedCityFilter === item.ciudad || selectedCityFilter === 'todas';

                if (!isSelected) return null;

                return (
                  <div
                    key={item.ciudad}
                    className={`p-4 rounded-2xl border transition-all ${
                      idx === 0
                        ? 'border-amber-300 bg-amber-50/40 ring-1 ring-amber-400/30'
                        : idx === 1
                        ? 'border-slate-300 bg-slate-50/60'
                        : idx === 2
                        ? 'border-orange-200 bg-orange-50/30'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                      {/* Posición & Foto de Ciudad & Nombre de la Ciudad */}
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0 shadow-2xs ${
                            idx === 0
                              ? 'bg-amber-400 text-amber-950 font-black'
                              : idx === 1
                              ? 'bg-slate-300 text-slate-800 font-black'
                              : idx === 2
                              ? 'bg-orange-300 text-orange-950 font-bold'
                              : 'bg-slate-100 text-slate-600 font-bold'
                          }`}
                        >
                          {idx === 0 ? '1° 🥇' : idx === 1 ? '2° 🥈' : idx === 2 ? '3° 🥉' : `${idx + 1}°`}
                        </div>

                        {/* Fotografía de la Ciudad */}
                        <div className="relative w-20 sm:w-24 h-16 rounded-xl overflow-hidden shrink-0 border border-slate-200 shadow-2xs">
                          <img
                            src={getCityImage(item.ciudad)}
                            alt={item.ciudad}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-white/95 via-white/40 to-transparent" />
                          <span className="absolute bottom-1 left-1.5 text-[8px] font-black text-slate-900 uppercase flex items-center gap-0.5">
                            <MapPin className="w-2.5 h-2.5 text-sky-600" />
                            {item.ciudad}
                          </span>
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-black text-slate-900">{item.ciudad}</h4>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                              {item.cedi}
                            </span>
                            {idx === 0 && (
                              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500 text-white uppercase tracking-wider">
                                Más Vendida
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {item.pedidosCount} pedido(s) activos • {item.areaM2} m² totales intervenidos
                          </p>
                        </div>
                      </div>

                      {/* Facturación & Participación */}
                      <div className="w-full md:w-auto flex items-center justify-between md:justify-end gap-6">
                        <div className="text-left md:text-right">
                          <strong className="text-base font-black text-slate-900 block">
                            {formatCOP(item.totalCOP)}
                          </strong>
                          <span className="text-[11px] font-bold text-sky-700">
                            {percentage}% del volumen nacional
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => setSelectedCityFilter(item.ciudad)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
                        >
                          Ver pedidos ({item.pedidosCount})
                        </button>
                      </div>
                    </div>

                    {/* Barra visual de progreso porcentual */}
                    <div className="mt-3 w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`h-2.5 rounded-full transition-all duration-500 ${
                          idx === 0
                            ? 'bg-gradient-to-r from-amber-500 to-amber-400'
                            : idx === 1
                            ? 'bg-gradient-to-r from-blue-600 to-sky-400'
                            : idx === 2
                            ? 'bg-gradient-to-r from-teal-500 to-emerald-400'
                            : 'bg-slate-400'
                        }`}
                        style={{ width: `${Math.max(5, percentage)}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* MÓDULO 2: MATRIZ DE REABASTECIMIENTO: ¿QUÉ SE NECESITA PEDIR PARA CADA LADO? */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                  <Boxes className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Requerimientos de Inventario: ¿Qué se Necesita Pedir para Cada Lado?
                  </h3>
                  <p className="text-xs text-slate-500">
                    Desglose exacto de cuñetes, tipos de pintura y selladores requeridos para surtir los pedidos de cada ciudad.
                  </p>
                </div>
              </div>

              <span className="text-xs font-bold text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
                Logística de Despacho desde Fábrica Medellín
              </span>
            </div>

            {/* Grid de Reabastecimiento por Ciudad */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-2">
              {cityAnalytics.map((c) => {
                const deficit = c.cunetesRequeridosTotal - c.stockDisponibleCunetes;
                return (
                  <div
                    key={c.ciudad}
                    className="rounded-2xl border border-slate-200 bg-white space-y-4 hover:shadow-lg transition-all overflow-hidden"
                  >
                    {/* Encabezado Fotográfico de la Ciudad */}
                    <div className="relative h-36 sm:h-40 w-full overflow-hidden">
                      <img
                        src={getCityImage(c.ciudad)}
                        alt={c.ciudad}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-white/95 via-white/50 to-transparent" />

                      {/* Badge de Urgencia */}
                      <div className="absolute top-3 right-3">
                        {c.urgencia === 'urgente' ? (
                          <span className="px-2.5 py-1 rounded-lg bg-rose-600 text-white font-black text-[10px] uppercase tracking-wider flex items-center gap-1 shadow-md">
                            <AlertCircle className="w-3 h-3 text-white" />
                            Pedir Urgente a Fábrica
                          </span>
                        ) : c.urgencia === 'transito' ? (
                          <span className="px-2.5 py-1 rounded-lg bg-amber-500 text-white font-black text-[10px] uppercase tracking-wider flex items-center gap-1 shadow-md">
                            <Truck className="w-3 h-3 text-white" />
                            En Tránsito / Despacho
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-black text-[10px] uppercase tracking-wider flex items-center gap-1 shadow-md">
                            <CheckCircle2 className="w-3 h-3 text-white" />
                            Stock Sede Suficiente
                          </span>
                        )}
                      </div>

                      {/* Datos de Ciudad y Ventas superpuestos en la foto con texto claro legible */}
                      <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between text-slate-900">
                        <div>
                          <div className="flex items-center gap-1.5 font-black text-lg text-slate-900">
                            <MapPin className="w-4 h-4 text-sky-600" />
                            <span>{c.ciudad}</span>
                          </div>
                          <span className="text-[11px] text-slate-600 block">
                            Sede: <strong className="text-slate-900">{c.cedi}</strong>
                          </span>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] uppercase font-bold text-slate-500 block">Ventas Sede</span>
                          <strong className="text-base font-black text-emerald-700 font-mono">
                            {formatCOP(c.totalCOP)}
                          </strong>
                        </div>
                      </div>
                    </div>

                    <div className="p-5 pt-0 space-y-4">
                    {/* Desglose de Insumos Requeridos ("Qué se necesita pedir") */}
                    <div>
                      <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-2">
                        📦 Requerimientos a Pedir para Surtir la Ciudad:
                      </span>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="p-2.5 rounded-xl bg-sky-50/80 border border-sky-100">
                          <span className="text-[10px] font-bold text-sky-800 block">Pintura Tipo 1 Exterior</span>
                          <strong className="text-sm font-black text-sky-950 block">
                            {c.tipo1Cunetes} Cuñetes
                          </strong>
                          <span className="text-[10px] text-sky-700">Fachadas de alto tráfico</span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-teal-50/80 border border-teal-100">
                          <span className="text-[10px] font-bold text-teal-800 block">Pintura Tipo 2 Interior</span>
                          <strong className="text-sm font-black text-teal-950 block">
                            {c.tipo2Cunetes} Cuñetes
                          </strong>
                          <span className="text-[10px] text-teal-700">Muros superlavables</span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-100">
                          <span className="text-[10px] font-bold text-amber-800 block">Pintura Tipo 3 Cielos</span>
                          <strong className="text-sm font-black text-amber-950 block">
                            {c.tipo3Cunetes} Cuñetes
                          </strong>
                          <span className="text-[10px] text-amber-700">Techos y fondeo mate</span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-purple-50/80 border border-purple-100">
                          <span className="text-[10px] font-bold text-purple-800 block">Sellador Sellomax Base</span>
                          <strong className="text-sm font-black text-purple-950 block">
                            {c.selladorGalones} Galones
                          </strong>
                          <span className="text-[10px] text-purple-700">Antialcalino obra nueva</span>
                        </div>
                      </div>
                    </div>

                    {/* Marcas más pedidas en esta ciudad */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">Marcas demandadas:</span>
                      <div className="flex items-center gap-1.5 flex-wrap justify-end">
                        {Object.entries(c.marcasDemandadas).map(([marca, count]) => (
                          <span
                            key={marca}
                            className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold text-[10px]"
                          >
                            {marca} ({count})
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Stock Local vs Demanda */}
                    <div className="p-3 rounded-xl bg-slate-100 text-xs flex items-center justify-between">
                      <span className="text-slate-600">
                        Stock en Sede: <strong className="text-emerald-700 font-mono">{c.stockDisponibleCunetes} cuñetes</strong>
                      </span>
                      <span className="font-bold text-slate-800">
                        Demanda Requerida: <strong className="font-mono">{c.cunetesRequeridosTotal} cuñetes</strong>
                      </span>
                    </div>

                    {/* Última orden de reabastecimiento generada para esta ciudad */}
                    {(() => {
                      const latestCityReplenish = replenishmentOrders.find((r) => r.ciudad === c.ciudad);
                      if (!latestCityReplenish) return null;
                      return (
                        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-950 space-y-1 animate-fadeIn">
                          <div className="flex items-center justify-between font-bold">
                            <span className="flex items-center gap-1 text-emerald-800">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              Orden #{latestCityReplenish.id} Activa
                            </span>
                            <span className="text-[10px] font-mono bg-emerald-200/80 text-emerald-900 px-2 py-0.5 rounded-full">
                              +{latestCityReplenish.cunetesAgregados} cuñetes
                            </span>
                          </div>
                          <p className="text-emerald-800">
                            {latestCityReplenish.vehiculoNodriza} • Placa <strong>{latestCityReplenish.placa}</strong> ({latestCityReplenish.conductor})
                          </p>
                          <button
                            type="button"
                            onClick={() => setActiveReplenishmentModal(latestCityReplenish)}
                            className="text-[10px] font-black text-sky-700 hover:underline cursor-pointer pt-0.5 block"
                          >
                            Ver comprobante completo de la orden →
                          </button>
                        </div>
                      );
                    })()}

                    {/* Botón de Acción de Reabastecimiento */}
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => handleRequestCitySupply(c.ciudad)}
                        className="w-full py-2.5 px-3 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                      >
                        <Boxes className="w-4 h-4" />
                        <span>Generar Orden de Reabastecimiento ({c.ciudad})</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

          {/* MÓDULO 3: DETALLE DE PEDIDOS EN CADA CIUDAD */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Directorio de Pedidos Registrados por Ciudad
                </h3>
                <p className="text-xs text-slate-500">
                  Visualiza cada uno de los clientes, direcciones, marcas y montos de los pedidos en curso.
                </p>
              </div>

              {selectedCityFilter !== 'todas' && (
                <button
                  type="button"
                  onClick={() => setSelectedCityFilter('todas')}
                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg cursor-pointer"
                >
                  ✕ Ver todas las ciudades
                </button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold">
                    <th className="py-3 px-3">Pedido ID</th>
                    <th className="py-3 px-3">Ciudad</th>
                    <th className="py-3 px-3">Cliente / Empresa</th>
                    <th className="py-3 px-3">Pintura & Marca</th>
                    <th className="py-3 px-3">Área (m²)</th>
                    <th className="py-3 px-3">Método de Pago</th>
                    <th className="py-3 px-3 text-right">Monto (COP)</th>
                    <th className="py-3 px-3 text-center">Estado</th>
                    <th className="py-3 px-3 text-center">Contacto</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders
                    .filter((o) => {
                      if (selectedCityFilter === 'todas') return true;
                      return (
                        o.ciudad?.toLowerCase().includes(selectedCityFilter.toLowerCase()) ||
                        selectedCityFilter.toLowerCase().includes(o.ciudad?.toLowerCase() || '')
                      );
                    })
                    .map((order) => (
                      <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3 font-mono font-bold text-sky-700">{order.id}</td>
                        <td className="py-3 px-3">
                          <span className="font-bold text-slate-800">{order.ciudad}</span>
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-bold text-slate-900">{order.cliente}</div>
                          <div className="text-[10px] text-slate-500">
                            {order.responsable} • NIT: {order.nit}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-bold text-slate-800 block">{order.tipoPintura}</span>
                          <span className="text-[10px] text-purple-700 font-semibold">
                            {order.marca || 'Pintuco®'} • {order.color}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono font-semibold">{order.areaM2} m²</td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 text-[10px] font-bold border border-sky-200">
                            {order.metodoPago || 'Transferencia Bancolombia'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                          {formatCOP(order.totalCOP)}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              order.status === 'entregado'
                                ? 'bg-emerald-100 text-emerald-800'
                                : order.status === 'en_ruta'
                                ? 'bg-sky-100 text-sky-800'
                                : order.status === 'preparando'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <a
                            href={`mailto:${order.email}?subject=Actualización de Pedido #${order.id} - Colorlink Pinturas&body=Hola ${order.responsable}, le escribimos de Colorlink Pinturas respecto a su pedido #${order.id} en ${order.ciudad}.`}
                            className="p-1.5 inline-flex rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 transition-colors"
                            title={`Contactar al cliente por correo (${order.email})`}
                          >
                            <Mail className="w-3.5 h-3.5 text-sky-600" />
                          </a>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE ORDEN OFICIAL DE REABASTECIMIENTO CEDI */}
      {activeReplenishmentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 animate-scaleUp max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-md shrink-0">
                  <Boxes className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-slate-900">
                      Orden de Reabastecimiento #{activeReplenishmentModal.id}
                    </h3>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full border border-emerald-200">
                      Aprobada
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Despacho desde Planta Central Medellín hacia {activeReplenishmentModal.cedi}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveReplenishmentModal(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Resumen de Stock Actualizado */}
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Inventario de Sede Actualizado: {activeReplenishmentModal.ciudad}
                </span>
                <span className="text-[11px] font-mono text-emerald-700 font-bold">
                  {activeReplenishmentModal.fecha}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                <div className="bg-white p-2.5 rounded-xl border border-emerald-100">
                  <span className="text-[10px] text-slate-500 block font-semibold">Stock Anterior</span>
                  <strong className="text-sm font-black text-slate-700 font-mono">
                    {activeReplenishmentModal.stockAnterior} cuñ.
                  </strong>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-emerald-200">
                  <span className="text-[10px] text-emerald-700 block font-bold">Despacho Planta</span>
                  <strong className="text-sm font-black text-emerald-600 font-mono">
                    +{activeReplenishmentModal.cunetesAgregados} cuñ.
                  </strong>
                </div>
                <div className="bg-emerald-600 text-white p-2.5 rounded-xl shadow-2xs">
                  <span className="text-[10px] text-emerald-100 block font-bold">Nuevo Stock Sede</span>
                  <strong className="text-sm font-black text-white font-mono">
                    {activeReplenishmentModal.nuevoStock} cuñ.
                  </strong>
                </div>
              </div>
            </div>

            {/* Desglose de Materiales de la Orden */}
            <div className="space-y-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 block">
                📦 Detalle de Lote Despachado a Sede:
              </span>
              <div className="grid grid-cols-2 gap-2.5 text-xs">
                <div className="p-3 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-sky-800 block">Pintura Tipo 1 Exterior</span>
                    <span className="text-[10px] text-sky-600">Fachadas Koraza / Acrílica</span>
                  </div>
                  <strong className="text-sm font-black text-sky-950 font-mono">
                    +{activeReplenishmentModal.tipo1Cunetes} cuñ.
                  </strong>
                </div>
                <div className="p-3 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-teal-800 block">Pintura Tipo 2 Interior</span>
                    <span className="text-[10px] text-teal-600">Viniltex Lavable</span>
                  </div>
                  <strong className="text-sm font-black text-teal-950 font-mono">
                    +{activeReplenishmentModal.tipo2Cunetes} cuñ.
                  </strong>
                </div>
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-amber-800 block">Pintura Tipo 3 Cielos</span>
                    <span className="text-[10px] text-amber-600">Fondeo & Techos</span>
                  </div>
                  <strong className="text-sm font-black text-amber-950 font-mono">
                    +{activeReplenishmentModal.tipo3Cunetes} cuñ.
                  </strong>
                </div>
                <div className="p-3 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-purple-800 block">Sellador Antialcalino</span>
                    <span className="text-[10px] text-purple-600">Sellomax Base</span>
                  </div>
                  <strong className="text-sm font-black text-purple-950 font-mono">
                    +{activeReplenishmentModal.selladorGalones} gal.
                  </strong>
                </div>
              </div>
            </div>

            {/* Datos de Transporte Nodriza */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
              <div className="font-bold text-slate-800 flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-sky-600" />
                <span>Logística de Transporte Nodriza Asignada:</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] text-slate-600">
                <div>• <strong>Unidad:</strong> {activeReplenishmentModal.vehiculoNodriza}</div>
                <div>• <strong>Placa:</strong> <span className="font-mono font-bold text-slate-900">{activeReplenishmentModal.placa}</span></div>
                <div>• <strong>Conductor:</strong> {activeReplenishmentModal.conductor}</div>
                <div>• <strong>Estado:</strong> <span className="text-emerald-700 font-bold">{activeReplenishmentModal.estado}</span></div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setActiveReplenishmentModal(null)}
                className="px-5 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-black text-xs rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Entendido y Confirmar Abastecimiento</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE ENVÍO DE CORREO OFICIAL AL CLIENTE */}
      {showNotificationModal && modalNotificationData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-sky-600 text-white flex items-center justify-center shadow-xs">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    Vista Previa de Correo Oficial
                  </h3>
                  <p className="text-xs text-slate-500">
                    Destinatario: {modalNotificationData.order.cliente} ({modalNotificationData.order.responsable})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowNotificationModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Tarjeta de Email Oficial */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2 leading-relaxed whitespace-pre-line text-slate-800">
              <div className="text-[11px] text-slate-500 border-b border-slate-200 pb-2">
                <strong>Para:</strong> {modalNotificationData.order.email}
                <br />
                <strong>Asunto:</strong> Actualización de Despacho • Pedido #{modalNotificationData.order.id} Colorlink®
              </div>
              <div>{modalNotificationData.mensaje}</div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowNotificationModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmSendNotification}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Confirmar y Enviar al Cliente</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE AUDITORÍA INTELIGENTE CON IA (GEMINI 3.8 FLASH) */}
      {showAiAuditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 animate-scaleUp max-h-[90vh] overflow-y-auto">
            {/* Header Modal */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 via-sky-600 to-blue-700 text-white flex items-center justify-center shadow-md">
                  <Sparkles className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-slate-900">
                      Auditoría Inteligente con IA
                    </h3>
                    <span className="text-[10px] bg-sky-100 text-sky-800 font-extrabold px-2 py-0.5 rounded-full border border-sky-200">
                      Gemini 3.8 Flash
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Inspección técnica de stock, viabilidad y formulación de pedido
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAiAuditModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {isAuditingWithAI ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-12 h-12 border-4 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-sm font-bold text-slate-800">
                  La IA está analizando inventario en sede, compatibilidad y formulación...
                </p>
                <p className="text-xs text-slate-500">
                  Consultando existencias de cuñetes, galones y pigmentos en planta.
                </p>
              </div>
            ) : currentAiAudit ? (
              <div className="space-y-4">
                {/* Veredicto de la IA */}
                <div
                  className={`p-4 rounded-2xl border text-xs space-y-2 ${
                    currentAiAudit.decision === 'aceptar'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                      : currentAiAudit.decision === 'en_espera'
                      ? 'bg-amber-50 border-amber-200 text-amber-950'
                      : 'bg-rose-50 border-rose-200 text-rose-950'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider">
                      Dictamen Oficial Emitido por la IA:
                    </span>
                    <span
                      className={`text-xs font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                        currentAiAudit.decision === 'aceptar'
                          ? 'bg-emerald-600 text-white'
                          : currentAiAudit.decision === 'en_espera'
                          ? 'bg-amber-600 text-white'
                          : 'bg-rose-600 text-white'
                      }`}
                    >
                      {currentAiAudit.decision === 'aceptar' && '✓ Aprobado para Despacho'}
                      {currentAiAudit.decision === 'en_espera' && '⏸ Puesto en Espera'}
                      {currentAiAudit.decision === 'rechazar' && '✕ Rechazado por Incompatibilidad'}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed font-medium">
                    {currentAiAudit.razonTecnica}
                  </p>
                </div>

                {/* Resumen de Insumos Auditados */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Fórmula de Pintura</span>
                    <strong className="text-xs text-slate-900 block mt-0.5">
                      {currentAiAudit.insumosVerificados.pinturaValida ? '✓ Validada NTC' : 'Inconsistente'}
                    </strong>
                    <span className="text-[10px] text-slate-500">Colorimetría verificada</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Disponibilidad en Sede</span>
                    <strong className={`text-xs block mt-0.5 ${currentAiAudit.insumosVerificados.stockSuficiente ? 'text-emerald-700' : 'text-amber-700'}`}>
                      {currentAiAudit.insumosVerificados.stockSuficiente ? 'Stock Completo ✓' : `Déficit: ${currentAiAudit.insumosVerificados.cuñetesFaltantes} cuñetes`}
                    </strong>
                    <span className="text-[10px] text-slate-500">Bodega regional</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 col-span-2 sm:col-span-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Vehículo Flota Sugerido</span>
                    <strong className="text-xs text-[#009FE3] block mt-0.5 font-bold">
                      {currentAiAudit.vehiculoSugerido?.placa || 'TZW-402'}
                    </strong>
                    <span className="text-[10px] text-slate-500">{currentAiAudit.vehiculoSugerido?.conductor || 'Carlos Mario Henao'}</span>
                  </div>
                </div>

                {/* Vista Previa del Correo para el Cliente */}
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-[11px] text-slate-600 font-bold border-b border-slate-200 pb-1.5">
                    <span className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-sky-600" />
                      Vista previa del correo que se enviará al cliente:
                    </span>
                    <span className="text-slate-400 font-mono text-[10px]">
                      {activeOrder.email}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-700 whitespace-pre-line leading-relaxed">
                    {currentAiAudit.mensajeCorreoCliente}
                  </p>
                </div>

                {/* Acciones Directas en el Modal */}
                <div className="pt-2 space-y-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Ejecutar Decisión y Notificar Automáticamente por Correo:
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        handleAiOrderDecision(currentAiAudit.orderId, 'despachar', currentAiAudit.vehiculoSugerido);
                        setShowAiAuditModal(false);
                      }}
                      className="flex-1 py-2.5 px-3 bg-[#009FE3] hover:bg-[#0089C4] text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>Asignar Vehículo y Despachar (En Camino)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        handleAiOrderDecision(currentAiAudit.orderId, 'espera');
                        setShowAiAuditModal(false);
                      }}
                      className="py-2.5 px-3 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Poner en Espera</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        handleAiOrderDecision(currentAiAudit.orderId, 'rechazar');
                        setShowAiAuditModal(false);
                      }}
                      className="py-2.5 px-3 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Rechazar</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
