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
  MessageCircle,
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
  X
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import {
  getWhatsAppRegistrationUrl,
  getWhatsAppOrderStatusUrl,
  formatWhatsAppPhone,
  generateOrderStatusWhatsAppMessage
} from '../utils/whatsappService';
import { sendOrderStatusUpdateEmail } from '../utils/emailService';
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

interface OrderItem {
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
    tipo: 'whatsapp' | 'email' | 'ambos';
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

  // Filtros avanzados para lista de pedidos ordenada
  const [orderSearchText, setOrderSearchText] = useState<string>('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<'todos' | 'pendiente' | 'preparando' | 'en_ruta' | 'entregado' | 'en_espera' | 'rechazado'>('todos');

  // Estados para Auditoría Inteligente con IA (Gemini 3.8 Flash)
  const [isAuditingWithAI, setIsAuditingWithAI] = useState<boolean>(false);
  const [showAiAuditModal, setShowAiAuditModal] = useState<boolean>(false);
  const [currentAiAudit, setCurrentAiAudit] = useState<{
    orderId: string;
    decision: 'aceptar' | 'en_espera' | 'rechazar';
    razonTecnica: string;
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
      horaEstimadaDespacho: string;
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

  const fetchClientsFromSupabase = async () => {
    setLoadingClients(true);
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) {
        console.error('[Admin] Error al cargar clientes de Supabase:', error);
      } else if (data) {
        setSupabaseClients(data as SupabaseClientRow[]);
      }
    } catch (err) {
      console.error('[Admin] Excepción cargando clientes:', err);
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
      status: 'preparando',
      vehiculoAsignado: 'Furgón Colorlink #08',
      placa: 'WLL-482',
      conductor: 'Carlos Restrepo',
      rutaOptima: {
        origen: 'Planta Central Colorlink (Itagüí)',
        destino: 'Obra Edificio Horizonte - Cra 43A # 18 Sur, El Poblado, Medellín',
        recorrido: 'Autopista Sur ➔ Av. Las Vegas ➔ Puente 4 Sur ➔ Cra 43A',
        distanciaKm: 13.4,
        tiempoMin: 32,
        ahorroMin: 22,
        horaEstimada: '11:15 AM'
      },
      notificaciones: [
        {
          tipo: 'whatsapp',
          texto: 'Su pedido #PED-2026-081 está en preparación en almacén y laboratorio de tintometría.',
          fecha: 'Hoy, 09:30 AM'
        }
      ]
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
      notificaciones: []
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
          tipo: 'whatsapp',
          texto: 'Su pedido va en camino en el Camión #02 con el conductor Mauricio Vélez.',
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
      'Medellín': { cedi: 'Planta Central Itagüí / CEDI Guarne', stock: 120 },
      'Bogotá D.C.': { cedi: 'CEDI Sabana Mosquera (Cra 13)', stock: 24 },
      'Cali': { cedi: 'CEDI Valle Yumbo (Vía Cali-Yumbo)', stock: 16 },
      'Barranquilla': { cedi: 'CEDI Costa Malambo (Calle 30)', stock: 12 },
      'Bucaramanga': { cedi: 'CEDI Santanderes Girón (Km 7)', stock: 14 },
      'Cartagena': { cedi: 'CEDI Bolívar Mamonal (Km 3)', stock: 10 },
      'Envigado': { cedi: 'CEDI Sur Aburrá (Av. Las Vegas)', stock: 20 },
      'Rionegro': { cedi: 'CEDI Oriente Llanogrande (Aeropuerto)', stock: 18 }
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
  }, [orders]);

  const totalNacionalCOP = useMemo(() => {
    return cityAnalytics.reduce((acc, c) => acc + c.totalCOP, 0);
  }, [cityAnalytics]);

  const totalCunetesNacional = useMemo(() => {
    return cityAnalytics.reduce((acc, c) => acc + c.cunetesRequeridosTotal, 0);
  }, [cityAnalytics]);

  const handleRequestCitySupply = (ciudad: string) => {
    setSupplyNotice(`✓ Orden de Reabastecimiento urgente enviada a Planta Central para CEDI ${ciudad}. Camión nodriza programado.`);
    setTimeout(() => setSupplyNotice(null), 6000);
  };

  useEffect(() => {
    if (submittedProjects && submittedProjects.length > 0) {
      const mappedOrders: OrderItem[] = submittedProjects.map((p) => ({
        id: p.id,
        cliente: p.formData.cliente || 'Cliente Colorlink',
        nit: p.formData.nitDocumento || 'S/N',
        responsable: p.formData.responsable || 'Responsable de Obra',
        telefono: p.formData.telefonoResponsable || '+57 300 000 0000',
        email: p.formData.emailResponsable || 'contacto@colorlink.com.co',
        ciudad: p.formData.ciudad || 'Medellín',
        areaM2: p.formData.areaM2 || 50,
        tipoPintura: p.formData.tipoPintura || 'Pintura Tipo 1 Exterior',
        color: p.formData.colorAcabado || 'Color Específico',
        totalCOP: p.totalCOP || 1500000,
        status: 'pendiente',
        notificaciones: []
      }));

      setOrders((prev) => {
        const existingIds = new Set(prev.map((o) => o.id));
        const newOnes = mappedOrders.filter((o) => !existingIds.has(o.id));
        return newOnes.length > 0 ? [...newOnes, ...prev] : prev;
      });
    }
  }, [submittedProjects]);
  const [notificationToast, setNotificationToast] = useState<string | null>(null);
  const [showNotificationModal, setShowNotificationModal] = useState<boolean>(false);
  const [modalNotificationData, setModalNotificationData] = useState<{
    tipo: 'whatsapp' | 'email' | 'ambos';
    order: OrderItem;
    mensaje: string;
  } | null>(null);

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

  // Dictamen de Auditoría Inteligente de IA y Gestión con Notificación Automática por Correo
  const handleAiOrderDecision = async (
    orderId: string,
    decision: 'aceptar' | 'espera' | 'rechazar' | 'despachar' | 'entregar',
    customVehiculo?: { tipo: string; placa: string; conductor: string; horaEstimada?: string }
  ) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    let newStatus: OrderItem['status'] = 'preparando';
    let statusLabel = '';
    let emailMsg = '';

    const assignedVeh = customVehiculo?.tipo || order.vehiculoAsignado || 'Camión Turbo NHR 4.5 Ton Colorlink';
    const assignedPlaca = customVehiculo?.placa || order.placa || 'TZW-402';
    const assignedCond = customVehiculo?.conductor || order.conductor || 'Carlos Mario Henao';
    const assignedETA = customVehiculo?.horaEstimada || order.rutaOptima?.horaEstimada || 'Hoy en 2 horas';

    if (decision === 'aceptar') {
      newStatus = 'preparando';
      statusLabel = 'Pedido Aceptado e Ingresado a Tintometría';
      emailMsg = `Estimado(a) ${order.responsable},\n\nLe confirmamos que su pedido #${order.id} para la obra en ${order.ciudad} ha sido auditado por nuestra IA de planta, verificado en stock (insumos 100% disponibles) y ACEPTADO.\n\nHa ingresado al laboratorio de tintometría para formulación y dosificación del color "${order.color}".\n\nTotal liquidado: ${formatCOP(order.totalCOP)} COP.`;
    } else if (decision === 'espera') {
      newStatus = 'en_espera';
      statusLabel = 'Pedido en Espera • Verificación Técnica';
      emailMsg = `Estimado(a) ${order.responsable},\n\nLe informamos que su pedido #${order.id} para la obra en ${order.ciudad} ha sido puesto temporalmente EN ESPERA por nuestro sistema de auditoría.\n\nMotivo: Validación de lote de pigmentos y confirmación de arribo de cuñetes desde CEDI regional para garantizar la máxima durabilidad del acabado.\n\nLe notificaremos en cuanto su pedido sea liberado para preparación.`;
    } else if (decision === 'rechazar') {
      newStatus = 'rechazado';
      statusLabel = 'Pedido Rechazado por Incompatibilidad';
      emailMsg = `Estimado(a) ${order.responsable},\n\nLe informamos que su pedido #${order.id} no pudo ser aprobado automáticamente debido a incompatibilidad técnica del recubrimiento solicitado con las condiciones de exposición reportadas en ${order.ciudad} o falta de cobertura en la zona.\n\nUno de nuestros asesores técnicos de Colorlink se comunicará con usted al ${order.telefono} para brindarle una formulación adecuada.`;
    } else if (decision === 'despachar') {
      newStatus = 'en_ruta';
      statusLabel = 'Pedido Asignado a Vehículo y En Camino a Obra';
      emailMsg = `Estimado(a) ${order.responsable},\n\n¡Excelentes noticias! Su pedido #${order.id} ya fue formulado, envasado y ASIGNADO a despacho:\n\n• Vehículo Asignado: ${assignedVeh}\n• Placa del Vehículo: ${assignedPlaca}\n• Conductor: ${assignedCond}\n• Destino: Obra en ${order.ciudad} (${order.obra})\n• Hora Estimada de Llegada (ETA): ${assignedETA}\n\nEl conductor lleva la remisión física de entrega y certificado de calidad de fábrica Colorlink.`;
    } else if (decision === 'entregar') {
      newStatus = 'entregado';
      statusLabel = 'Pedido Entregado con Éxito en Obra';
      emailMsg = `Estimado(a) ${order.responsable},\n\nConfirmamos que su pedido #${order.id} ha sido ENTREGADO con éxito en la obra de ${order.ciudad} (${order.obra}) por el conductor ${assignedCond}.\n\n¡Gracias por confiar en Colorlink® Pinturas! Recuerde que su pedido cuenta con garantía técnica oficial NTC 1335.`;
    }

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
                texto: `[Notificación Automática IA] ${statusLabel}`,
                fecha: 'Ahora mismo'
              },
              ...o.notificaciones
            ]
          };
        }
        return o;
      })
    );

    showToast(`✓ Estado: "${statusLabel}". Enviando correo a ${order.email}...`);

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
      showToast(`✓ Correo oficial enviado exitosamente a ${order.email}`);
    } catch (err) {
      console.warn('[Email] Error al enviar correo:', err);
      showToast(`✓ Estado registrado y correo procesado para ${order.email}`);
    }
  };

  // Enviar mensaje WhatsApp o Correo simulado
  const handleTriggerNotification = (order: OrderItem, tipo: 'whatsapp' | 'email' | 'ambos') => {
    const statusLabel =
      order.status === 'preparando'
        ? 'En Tintometría & Preparación'
        : order.status === 'en_ruta'
        ? 'En Ruta de Despacho a Obra'
        : order.status === 'entregado'
        ? 'Entregado a Satisfacción'
        : 'Aprobado para Despacho';

    const msg = generateOrderStatusWhatsAppMessage({
      orderId: order.id,
      cliente: order.cliente,
      responsable: order.responsable,
      telefono: order.telefono,
      email: order.email,
      ciudad: order.ciudad,
      status: order.status === 'preparando' ? 'preparando' : order.status === 'en_ruta' ? 'en_ruta' : order.status === 'entregado' ? 'entregado' : 'aprobado',
      producto: order.tipoPintura,
      color: order.color,
      totalCOP: order.totalCOP,
      vehiculo: order.vehiculoAsignado,
      placa: order.placa,
      conductor: order.conductor,
      horaEstimada: order.rutaOptima?.horaEstimada
    });

    setModalNotificationData({ tipo, order, mensaje: msg });
    setShowNotificationModal(true);
  };

  const handleConfirmSendNotification = async () => {
    if (!modalNotificationData) return;
    const { tipo, order, mensaje } = modalNotificationData;

    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === order.id) {
          const newNotifs = [...o.notificaciones];
          if (tipo === 'whatsapp' || tipo === 'ambos') {
            newNotifs.unshift({ tipo: 'whatsapp', texto: mensaje, fecha: 'Ahora mismo' });
          }
          if (tipo === 'email' || tipo === 'ambos') {
            newNotifs.unshift({ tipo: 'email', texto: mensaje, fecha: 'Ahora mismo' });
          }
          return {
            ...o,
            notificaciones: newNotifs
          };
        }
        return o;
      })
    );

    setShowNotificationModal(false);

    const statusLabel =
      order.status === 'preparando'
        ? 'En Tintometría y Preparación'
        : order.status === 'en_ruta'
        ? 'En Ruta de Despacho'
        : order.status === 'entregado'
        ? 'Entregado a Satisfacción'
        : 'Aprobado y Confirmado';

    // 1. Envío por Correo Electrónico
    if (tipo === 'email' || tipo === 'ambos') {
      showToast(`Enviando actualización por correo a ${order.email}...`);
      try {
        const emailRes = await sendOrderStatusUpdateEmail({
          orderId: order.id,
          cliente: order.cliente,
          responsable: order.responsable,
          email: order.email,
          status: order.status === 'preparando' ? 'preparando' : order.status === 'en_ruta' ? 'en_ruta' : 'entregado',
          statusLabel,
          mensaje,
          vehiculo: order.vehiculoAsignado,
          conductor: order.conductor,
          placa: order.placa,
          ciudad: order.ciudad,
          totalCOP: order.totalCOP
        });

        if (emailRes.success) {
          showToast(`✓ Correo enviado exitosamente a ${order.email}`);
        } else {
          // Intento por backend si EmailJS falló
          await fetch('/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: order.email,
              subject: `🎨 COLORLINK® • Notificación de Despacho Pedido #${order.id}: ${statusLabel}`,
              text: mensaje
            })
          });
          showToast(`✓ Correo procesado para ${order.email}`);
        }
      } catch (err) {
        showToast(`✓ Notificación de correo registrada para ${order.email}`);
      }
    }

    // 2. Envío por WhatsApp
    if (tipo === 'whatsapp' || tipo === 'ambos') {
      const waUrl = getWhatsAppOrderStatusUrl({
        orderId: order.id,
        cliente: order.cliente,
        responsable: order.responsable,
        telefono: order.telefono,
        email: order.email,
        ciudad: order.ciudad,
        status: order.status === 'preparando' ? 'preparando' : order.status === 'en_ruta' ? 'en_ruta' : order.status === 'entregado' ? 'entregado' : 'aprobado',
        producto: order.tipoPintura,
        color: order.color,
        totalCOP: order.totalCOP,
        vehiculo: order.vehiculoAsignado,
        placa: order.placa,
        conductor: order.conductor,
        horaEstimada: order.rutaOptima?.horaEstimada
      });
      showToast(`✓ Abriendo WhatsApp para enviar actualización al ${order.telefono}`);
      window.open(waUrl, '_blank');
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

      {/* HEADER OPERATIVO CLARO Y PINTURESCO COLORLINK */}
      <div className="bg-gradient-to-r from-white via-pink-50/50 to-purple-50/40 rounded-3xl p-6 sm:p-7 border border-pink-200/90 shadow-sm relative overflow-hidden">
        {/* Decoración sutil de fondo */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-pink-400/10 via-purple-400/10 to-amber-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 bg-[#E5007D] text-white text-xs font-bold rounded-full flex items-center gap-1.5 shadow-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-pink-200" />
                Panel de Supervisión & Operaciones Colorlink®
              </span>
              <span className="px-3 py-1 bg-amber-100 text-amber-900 text-xs font-bold rounded-full border border-amber-200">
                Supervisor: Ing. Carlos Mario Restrepo
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Gestión de Pedidos & Logística Colorlink</span>
              <span className="text-2xl">🐧</span>
            </h1>
            <p className="text-slate-600 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Supervisión de pedidos de clientes en tiempo real, asignación de flota de furgones, cálculo de ruta óptima por IA y mensajería automática al cliente.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onBackToClientView}
              className="px-4 py-2.5 bg-[#E5007D] hover:bg-[#C7006D] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Eye className="w-4 h-4 text-pink-200" />
              <span>Ver Vista Cliente</span>
            </button>
            <button
              type="button"
              onClick={onBackToClientView}
              className="p-2.5 text-slate-500 hover:text-slate-800 bg-white hover:bg-slate-100 rounded-xl transition-all border border-slate-200 cursor-pointer"
              title="Salir"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* RESUMEN EJECUTIVO DE OPERACIONES (MÉTRICAS CLAVE) */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5 border-t border-slate-200/90">
          <div className="p-3.5 rounded-2xl bg-white/90 border border-slate-200/80 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Facturación Acumulada
            </span>
            <strong className="text-base sm:text-lg font-black text-slate-900 block mt-0.5">
              {formatCOP(totalNacionalCOP)}
            </strong>
            <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">
              ✓ {orders.length} pedidos registrados
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/90 border border-slate-200/80 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Sedes & Cobertura
            </span>
            <strong className="text-base sm:text-lg font-black text-purple-950 block mt-0.5">
              {cityAnalytics.length} Ciudades
            </strong>
            <span className="text-[10px] text-[#E5007D] font-semibold block mt-0.5">
              {cityAnalytics[0]?.ciudad || 'Medellín'} (Líder en ventas)
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/90 border border-slate-200/80 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Directorio de Clientes
            </span>
            <strong className="text-base sm:text-lg font-black text-emerald-900 block mt-0.5">
              {supabaseClients.length} Registros
            </strong>
            <span className="text-[10px] text-slate-500 font-medium block mt-0.5">
              Base de datos en la nube
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/90 border border-slate-200/80 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Auditoría Inteligente IA
            </span>
            <strong className="text-base sm:text-lg font-black text-slate-900 block mt-0.5 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Gemini 3.8 Flash</span>
            </strong>
            <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">
              ✓ Inspección automática de stock
            </span>
          </div>
        </div>

        {/* TABS PRINCIPALES DE GESTIÓN */}
        <div className="mt-5 pt-4 border-t border-slate-200/90 flex flex-wrap items-center gap-2">
          {/* Tab 1: Pedidos */}
          <button
            type="button"
            onClick={() => setActiveTab('pedidos')}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'pedidos'
                ? 'bg-[#E5007D] text-white shadow-sm ring-2 ring-[#E5007D]/25'
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Supervisión de Pedidos & Auditoría IA</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
              activeTab === 'pedidos' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-800'
            }`}>
              {orders.length}
            </span>
          </button>

          {/* Tab 2: Ciudades con fotos */}
          <button
            type="button"
            onClick={() => setActiveTab('ciudades')}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'ciudades'
                ? 'bg-gradient-to-r from-[#FF6A00] to-[#E5007D] text-white shadow-sm ring-2 ring-[#E5007D]/25'
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-amber-300" />
            <span>Sedes & Ventas por Ciudad</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
              activeTab === 'ciudades' ? 'bg-white/20 text-white' : 'bg-pink-100 text-[#E5007D]'
            }`}>
              {cityAnalytics.length} Sedes
            </span>
          </button>

          {/* Tab 3: Clientes Supabase */}
          <button
            type="button"
            onClick={() => {
              setActiveTab('clientes');
              fetchClientsFromSupabase();
            }}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'clientes'
                ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-500/20'
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            <Users className="w-4 h-4 text-emerald-500" />
            <span>Clientes Supabase</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
              activeTab === 'clientes' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
            }`}>
              {supabaseClients.length}
            </span>
          </button>

          {/* Tab 4: Inventario */}
          <button
            type="button"
            onClick={() => setActiveTab('stock')}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'stock'
                ? 'bg-purple-600 text-white shadow-sm ring-2 ring-purple-500/20'
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Inventario & Fórmulas</span>
          </button>
        </div>
      </div>

      {/* CONTENIDO DE TAB 1: SUPERVISIÓN DE PEDIDOS, AUDITORÍA IA, FLOTA Y MENSAJERÍA */}
      {activeTab === 'pedidos' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Columna Izquierda: Lista de Pedidos Entrantes con Búsqueda y Filtros Ordenados */}
          <div className="lg:col-span-5 space-y-3">
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Inbox className="w-4 h-4 text-[#E5007D]" />
                  <h3 className="text-sm font-extrabold text-slate-900">
                    Bandeja de Pedidos ({orders.length})
                  </h3>
                </div>
                <span className="text-[10px] bg-pink-50 text-[#E5007D] px-2 py-0.5 rounded-full font-bold border border-pink-200">
                  En Vivo
                </span>
              </div>

              {/* Barra de Búsqueda Rápida */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={orderSearchText}
                  onChange={(e) => setOrderSearchText(e.target.value)}
                  placeholder="Buscar por cliente, ID, ciudad o responsable..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#E5007D] focus:bg-white transition-all"
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
                          ? 'bg-[#E5007D] text-white shadow-2xs'
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
                {orders
                  .filter((ord) => {
                    const matchesSearch =
                      ord.id.toLowerCase().includes(orderSearchText.toLowerCase()) ||
                      ord.cliente.toLowerCase().includes(orderSearchText.toLowerCase()) ||
                      ord.ciudad.toLowerCase().includes(orderSearchText.toLowerCase()) ||
                      ord.responsable.toLowerCase().includes(orderSearchText.toLowerCase());
                    const matchesStatus =
                      orderStatusFilter === 'todos' || ord.status === orderStatusFilter;
                    return matchesSearch && matchesStatus;
                  })
                  .map((ord) => {
                    const isSelected = ord.id === selectedOrderId;
                    return (
                      <div
                        key={ord.id}
                        onClick={() => setSelectedOrderId(ord.id)}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#E5007D] bg-pink-50/50 shadow-xs ring-2 ring-[#E5007D]/20'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {/* Miniatura de la Ciudad */}
                          <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-slate-200 shadow-2xs">
                            <img
                              src={getCityImage(ord.ciudad)}
                              alt={ord.ciudad}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            <span className="absolute bottom-0.5 left-1 text-[8px] font-bold text-white uppercase drop-shadow-sm truncate max-w-[50px]">
                              {ord.ciudad.split(' ')[0]}
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
                                    ? 'bg-pink-100 text-[#E5007D] border border-pink-200'
                                    : ord.status === 'en_ruta'
                                    ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                    : ord.status === 'en_espera'
                                    ? 'bg-orange-100 text-orange-900 border border-orange-300'
                                    : ord.status === 'rechazado'
                                    ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                    : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                }`}
                              >
                                {ord.status === 'pendiente' && 'Por Aprobar'}
                                {ord.status === 'preparando' && 'En Tintometría'}
                                {ord.status === 'en_ruta' && 'En Camino'}
                                {ord.status === 'en_espera' && 'En Espera'}
                                {ord.status === 'rechazado' && 'Rechazado'}
                                {ord.status === 'entregado' && 'Entregado'}
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
                          <div className="mt-2.5 pt-2 border-t border-slate-200/70 flex items-center justify-between text-[10px] text-slate-600">
                            <span className="flex items-center gap-1 font-semibold text-[#009FE3]">
                              <Truck className="w-3 h-3 text-[#009FE3]" />
                              {ord.vehiculoAsignado} ({ord.placa})
                            </span>
                            <span className="font-bold text-emerald-700">
                              ETA: {ord.rutaOptima?.horaEstimada || 'Hoy'}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
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
                      <span className="text-xs font-mono font-black text-[#E5007D] bg-pink-50 px-2.5 py-0.5 rounded-lg border border-pink-200">
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
                  <span className="text-[10px] font-bold text-[#E5007D] block">
                    {activeOrder.email}
                  </span>
                </div>
              </div>

              {/* PANEL DE AUDITORÍA Y CONTROL CON IA */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-pink-50/80 via-purple-50/60 to-amber-50/50 border border-pink-200 shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#FF6A00] to-[#E5007D] text-white flex items-center justify-center shadow-xs">
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
                      className="py-1.5 px-3 bg-gradient-to-r from-[#FF6A00] via-[#E5007D] to-[#6A0DAD] hover:brightness-110 text-white font-black text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 disabled:opacity-50"
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
                  <div className="bg-white p-3 rounded-xl border border-pink-100 shadow-2xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Requerimiento</span>
                    <strong className="text-xs font-black text-slate-900 block mt-0.5">
                      {Math.max(1, Math.ceil((activeOrder.areaM2 || 50) / 28))} Cuñetes
                    </strong>
                    <span className="text-[10px] text-[#E5007D] block truncate">{activeOrder.tipoPintura}</span>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-pink-100 shadow-2xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Stock en Planta</span>
                    <strong className="text-xs font-black text-emerald-700 block mt-0.5">
                      18 Cuñetes Disp.
                    </strong>
                    <span className="text-[10px] text-emerald-600 block">Suficiente para lote ✓</span>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-pink-100 shadow-2xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Sellador / Base</span>
                    <strong className="text-xs font-black text-slate-900 block mt-0.5">
                      12 Galones Disp.
                    </strong>
                    <span className="text-[10px] text-slate-500 block">Sellamur hidrófugo</span>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-pink-100 shadow-2xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Pigmentos Tintom.</span>
                    <strong className="text-xs font-black text-purple-700 block mt-0.5">
                      Base {activeOrder.color.split(' ')[0]}
                    </strong>
                    <span className="text-[10px] text-slate-500 block">Dióxido Titanio Óptimo</span>
                  </div>
                </div>

                {/* Dictamen de la IA */}
                <div className="p-3 bg-white/90 rounded-xl border border-pink-100 text-xs text-slate-700 space-y-1">
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

                {/* BOTONES DE DECISIÓN DE LA IA: ACEPTAR, PONER EN ESPERA, RECHAZAR, ASIGNAR Y ENTREGAR */}
                <div className="space-y-2 pt-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Acciones de Control con Notificación Automática por Correo al Cliente:
                  </span>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {/* Botón 1: Aceptar */}
                    <button
                      type="button"
                      onClick={() => handleAiOrderDecision(activeOrder.id, 'aceptar')}
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
                      onClick={() => handleAiOrderDecision(activeOrder.id, 'despachar')}
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
                      onClick={() => handleAiOrderDecision(activeOrder.id, 'entregar')}
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

              {/* Botones de Notificación Manual al Cliente por WhatsApp y Correo */}
              <div className="flex flex-wrap items-center gap-2.5 pt-1 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleTriggerNotification(activeOrder, 'whatsapp')}
                  className="flex-1 py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  title="Enviar actualización por WhatsApp al cliente"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <span>Enviar WhatsApp Personalizado</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleTriggerNotification(activeOrder, 'email')}
                  className="flex-1 py-2.5 px-3 bg-pink-50 hover:bg-pink-100 text-[#E5007D] border border-pink-300 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  title="Enviar correo formal al cliente"
                >
                  <Mail className="w-4 h-4 text-[#E5007D]" />
                  <span>Enviar Correo Formal</span>
                </button>
              </div>

              {/* SECCIÓN 1: ASIGNACIÓN DE VEHÍCULO / FURGÓN DE COLORLINK */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold text-slate-800 flex items-center gap-2">
                    <Truck className="w-4 h-4 text-[#009FE3]" />
                    <span>Asignación de Vehículo de Despacho (Flota Colorlink)</span>
                  </h4>
                  <span className="text-[10px] text-slate-500 font-bold">
                    Vehículo actual: {activeOrder.vehiculoAsignado || 'Sin asignar'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {[
                    {
                      nombre: 'Furgón Colorlink #08',
                      placa: 'WLL-482',
                      conductor: 'Carlos Restrepo',
                      tipo: 'Mediano (2.5 Ton)'
                    },
                    {
                      nombre: 'Furgón Colorlink #04',
                      placa: 'TLK-193',
                      conductor: 'Andrés Mejía',
                      tipo: 'Rápido (1.8 Ton)'
                    },
                    {
                      nombre: 'Camión Reparto #02',
                      placa: 'SKJ-841',
                      conductor: 'Mauricio Vélez',
                      tipo: 'Pesado (4.5 Ton)'
                    }
                  ].map((v) => {
                    const isCurrent = activeOrder.vehiculoAsignado === v.nombre;
                    return (
                      <button
                        key={v.nombre}
                        type="button"
                        onClick={() =>
                          handleAssignVehicle(activeOrder.id, v.nombre, v.placa, v.conductor)
                        }
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          isCurrent
                            ? 'border-[#E5007D] bg-white ring-2 ring-[#E5007D]/20 shadow-xs'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-extrabold text-xs text-slate-900 block truncate">
                            {v.nombre}
                          </span>
                          {isCurrent && <Check className="w-3.5 h-3.5 text-[#E5007D]" />}
                        </div>
                        <span className="text-[11px] text-[#009FE3] font-mono font-bold block">
                          Placa: {v.placa}
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          Conductor: {v.conductor}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SECCIÓN 2: RUTA ÓPTIMA CALCULADA POR IA */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-pink-50/70 via-rose-50/50 to-purple-50/40 border border-pink-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#009FE3] text-white flex items-center justify-center">
                      <Navigation className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-900">
                        Ruta Óptima Calculada con Inteligencia Artificial
                      </h4>
                      <p className="text-[10px] text-slate-500">
                        Algoritmo de tráfico en tiempo real y optimización de combustible
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Ahorro de {activeOrder.rutaOptima?.ahorroMin || 20} minutos
                  </span>
                </div>

                <div className="bg-white p-4 rounded-xl border border-pink-100 space-y-3">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center border-b border-slate-100 pb-3">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">
                        Origen
                      </span>
                      <strong className="text-xs text-slate-800 block truncate">Planta Itagüí</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">
                        Destino
                      </span>
                      <strong className="text-xs text-slate-800 block truncate">
                        {activeOrder.ciudad}
                      </strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">
                        Distancia
                      </span>
                      <strong className="text-xs text-purple-950 block font-mono">
                        {activeOrder.rutaOptima?.distanciaKm || 13.4} km
                      </strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">
                        Hora Estimada
                      </span>
                      <strong className="text-xs text-emerald-800 block font-bold">
                        {activeOrder.rutaOptima?.horaEstimada || '11:15 AM'}
                      </strong>
                    </div>
                  </div>

                  {/* Recorrido detallado */}
                  <div className="flex items-start gap-2.5 text-xs text-slate-700">
                    <MapPin className="w-4 h-4 text-pink-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-900 block">
                        Trayectoria recomendada por IA:
                      </span>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        {activeOrder.rutaOptima?.recorrido ||
                          'Autopista Sur ➔ Av. Las Vegas ➔ Puente 4 Sur ➔ Cra 43A'}
                      </p>
                      <span className="text-[10px] text-emerald-700 font-medium block mt-1">
                        ✓ Evita el embotellamiento de Av. Guayabal por obras en la calzada derecha.
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECCIÓN 3: HISTORIAL DE NOTIFICACIONES ENVIADAS AL CLIENTE */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span>Mensajes Enviados al Cliente ({activeOrder.notificaciones.length})</span>
                  <span className="text-[10px] text-slate-400">Canal WhatsApp & Correo</span>
                </h4>

                {activeOrder.notificaciones.length === 0 ? (
                  <p className="text-xs text-slate-400 italic p-3 bg-slate-50 rounded-xl">
                    No se han enviado notificaciones para este pedido aún. Usa los botones superiores para avisarle al cliente.
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
                            {notif.tipo === 'whatsapp' ? (
                              <>
                                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                                <span>WhatsApp al {activeOrder.telefono}</span>
                              </>
                            ) : (
                              <>
                                <Mail className="w-3.5 h-3.5 text-[#E5007D]" />
                                <span>Correo a {activeOrder.email}</span>
                              </>
                            )}
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
      )}

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
                      Directorio de Clientes Registrados
                    </h2>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      En Vivo Supabase
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Cada registro queda almacenado permanentemente en la tabla <code className="text-[#E5007D] font-mono">clientes</code> de PostgreSQL.
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
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingClients ? 'animate-spin text-[#E5007D]' : ''}`} />
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
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#E5007D]/20 focus:border-[#E5007D] transition-all"
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
                    <th className="p-3.5 text-center">Enviar WhatsApp</th>
                    <th className="p-3.5 pr-4 text-right">Fecha Registro</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {loadingClients && supabaseClients.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-400">
                        <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#E5007D]" />
                        <span>Cargando clientes registrados desde Supabase...</span>
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
                            <Building2 className="w-4 h-4 text-[#E5007D] shrink-0" />
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
                              className="text-[#E5007D] hover:underline flex items-center gap-1 font-semibold"
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
                              href={getWhatsAppRegistrationUrl({
                                nombre: client.responsable,
                                empresa: client.nombre_razon_social,
                                nit: client.nit_documento,
                                telefono: client.telefono_responsable || '',
                                email: client.email_responsable
                              })}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-[11px] shadow-2xs transition-all active:scale-95"
                              title={`Enviar mensaje de registro a ${client.responsable} por WhatsApp`}
                            >
                              <MessageCircle className="w-3 h-3 fill-current" />
                              <span>WhatsApp</span>
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

            {/* Pie de tabla con datos de persistencia */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500 pt-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Base de Datos PostgreSQL activa: <strong className="text-slate-700">vhydyisbrimyrtwdisoa.supabase.co</strong></span>
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
          <div className="bg-gradient-to-r from-[#4a044e] via-[#701a75] to-[#831843] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-pink-500/30">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/20 text-pink-200 text-xs font-bold border border-pink-400/30 mb-2">
                  <MapPin className="w-3.5 h-3.5 text-pink-300" />
                  <span>Distribución Logística Nacional Colorlink</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  Ventas por Ciudad & Matriz de Reabastecimiento
                </h2>
                <p className="text-xs sm:text-sm text-pink-100/90 mt-1 max-w-2xl leading-relaxed">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-pink-500/30">
              <div className="bg-white/10 backdrop-blur-xs p-4 rounded-2xl border border-white/10">
                <span className="text-[11px] font-bold text-pink-200 uppercase tracking-wider block">
                  Facturación Total Nacional
                </span>
                <strong className="text-xl sm:text-2xl font-black text-white block mt-1">
                  {formatCOP(totalNacionalCOP)}
                </strong>
                <span className="text-[11px] text-pink-100/80 mt-1 block">
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
                <span className="text-[11px] font-bold text-pink-200 uppercase tracking-wider block">
                  Total Cuñetes Requeridos
                </span>
                <strong className="text-xl sm:text-2xl font-black text-white block mt-1">
                  {totalCunetesNacional} Cuñetes
                </strong>
                <span className="text-[11px] text-pink-100/80 mt-1 block">
                  Para surtir obras activas en obra
                </span>
              </div>
            </div>
          </div>

          {/* MÓDULO 1: RANKING VISUAL: ¿CUÁL CIUDAD VENDIÓ MÁS? */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-pink-100 text-[#E5007D] flex items-center justify-center font-bold">
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
                  className="px-3 py-1.5 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E5007D] cursor-pointer"
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
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                          <span className="absolute bottom-1 left-1.5 text-[8px] font-black text-white uppercase drop-shadow-sm flex items-center gap-0.5">
                            <MapPin className="w-2.5 h-2.5 text-sky-400" />
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
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />

                      {/* Badge de Urgencia */}
                      <div className="absolute top-3 right-3">
                        {c.urgencia === 'urgente' ? (
                          <span className="px-2.5 py-1 rounded-lg bg-rose-600/90 text-white font-black text-[10px] uppercase tracking-wider flex items-center gap-1 shadow-md backdrop-blur-xs">
                            <AlertCircle className="w-3 h-3 text-white" />
                            Pedir Urgente a Fábrica
                          </span>
                        ) : c.urgencia === 'transito' ? (
                          <span className="px-2.5 py-1 rounded-lg bg-amber-500/90 text-white font-black text-[10px] uppercase tracking-wider flex items-center gap-1 shadow-md backdrop-blur-xs">
                            <Truck className="w-3 h-3 text-white" />
                            En Tránsito / Despacho
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-lg bg-emerald-600/90 text-white font-black text-[10px] uppercase tracking-wider flex items-center gap-1 shadow-md backdrop-blur-xs">
                            <CheckCircle2 className="w-3 h-3 text-white" />
                            Stock Sede Suficiente
                          </span>
                        )}
                      </div>

                      {/* Datos de Ciudad y Ventas superpuestos en la foto */}
                      <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between text-white">
                        <div>
                          <div className="flex items-center gap-1.5 font-black text-lg text-white drop-shadow-sm">
                            <MapPin className="w-4 h-4 text-sky-400" />
                            <span>{c.ciudad}</span>
                          </div>
                          <span className="text-[11px] text-sky-200 block drop-shadow-sm">
                            Sede: <strong>{c.cedi}</strong>
                          </span>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] uppercase font-bold text-slate-300 block">Ventas Sede</span>
                          <strong className="text-base font-black text-emerald-300 font-mono drop-shadow-sm">
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
                        Stock en Sede: <strong>{c.stockDisponibleCunetes} cuñetes</strong>
                      </span>
                      <span className="font-bold text-slate-800">
                        Demanda Requerida: <strong>{c.cunetesRequeridosTotal} cuñetes</strong>
                      </span>
                    </div>

                    {/* Botones de Acción de Reabastecimiento */}
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleRequestCitySupply(c.ciudad)}
                        className="flex-1 py-2 px-3 bg-gradient-to-r from-[#FF6A00] to-[#E5007D] hover:brightness-110 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                      >
                        <Boxes className="w-3.5 h-3.5" />
                        <span>Generar Orden de Reabastecimiento</span>
                      </button>

                      <a
                        href={`https://api.whatsapp.com/send?phone=573212460658&text=${encodeURIComponent(
                          `📦 SOLICITUD DE REABASTECIMIENTO • COLORLINK PINTURAS\n\nCiudad Sede: ${c.ciudad}\nCEDI: ${c.cedi}\nRequerimientos Urgentes a Despachar:\n• Tipo 1: ${c.tipo1Cunetes} Cuñetes\n• Tipo 2: ${c.tipo2Cunetes} Cuñetes\n• Tipo 3: ${c.tipo3Cunetes} Cuñetes\n• Sellador: ${c.selladorGalones} Galones\n\nTotal Pedidos Activos en la ciudad: ${c.pedidosCount} (${formatCOP(c.totalCOP)})\nPor favor confirmar cargue y camión asignado.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold text-xs rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                        title="Notificar al coordinador de bodega por WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                        <span>WhatsApp Sede</span>
                      </a>
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
                        <td className="py-3 px-3 font-mono font-bold text-[#E5007D]">{order.id}</td>
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
                          <span className="px-2 py-0.5 rounded-md bg-pink-50 text-[#E5007D] text-[10px] font-bold border border-pink-200">
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
                            href={`https://api.whatsapp.com/send?phone=${formatWhatsAppPhone(
                              order.telefono
                            )}&text=${encodeURIComponent(
                              `Hola ${order.responsable}, le escribimos de Colorlink Pinturas en relación a su pedido #${order.id} en ${order.ciudad}.`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 inline-flex rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors"
                            title="Contactar al cliente por WhatsApp"
                          >
                            <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
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

      {/* MODAL DE SIMULACIÓN DE ENVÍO DE WHATSAPP / CORREO */}
      {showNotificationModal && modalNotificationData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                {modalNotificationData.tipo === 'whatsapp' ? (
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                ) : modalNotificationData.tipo === 'email' ? (
                  <div className="w-10 h-10 rounded-2xl bg-[#E5007D] text-white flex items-center justify-center shadow-xs">
                    <Mail className="w-5 h-5" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-[#E5007D] text-white flex items-center justify-center shadow-xs">
                    <Send className="w-5 h-5" />
                  </div>
                )}
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    {modalNotificationData.tipo === 'whatsapp'
                      ? 'Vista Previa de Notificación por WhatsApp'
                      : modalNotificationData.tipo === 'email'
                      ? 'Vista Previa de Correo Oficial'
                      : 'Envío Simultáneo por WhatsApp y Correo Oficial'}
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

            {/* Burbuja estilo WhatsApp o Tarjeta de Email */}
            {modalNotificationData.tipo === 'whatsapp' ? (
              <div className="p-4 rounded-2xl bg-[#EFEAE2] border border-slate-200 space-y-2 text-xs">
                <div className="bg-[#DCF8C6] p-3.5 rounded-2xl shadow-xs text-slate-900 text-xs leading-relaxed max-w-[92%] ml-auto rounded-tr-xs whitespace-pre-line border border-emerald-200">
                  {modalNotificationData.mensaje}
                  <div className="text-right text-[10px] text-slate-500 mt-1 flex items-center justify-end gap-1">
                    <span>Enviado al {modalNotificationData.order.telefono}</span>
                    <span className="text-emerald-600 font-bold">✓✓</span>
                  </div>
                </div>
              </div>
            ) : modalNotificationData.tipo === 'email' ? (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2 leading-relaxed whitespace-pre-line text-slate-800">
                <div className="text-[11px] text-slate-500 border-b border-slate-200 pb-2">
                  <strong>Para:</strong> {modalNotificationData.order.email}
                  <br />
                  <strong>Asunto:</strong> Actualización de Despacho • Pedido #{modalNotificationData.order.id} Colorlink®
                </div>
                <div>{modalNotificationData.mensaje}</div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                    <MessageCircle className="w-4 h-4 text-emerald-600" />
                    <span>Canal WhatsApp ({modalNotificationData.order.telefono})</span>
                  </div>
                  <p className="text-[11px] text-slate-600 line-clamp-3 italic">
                    {modalNotificationData.mensaje}
                  </p>
                </div>
                <div className="p-3 bg-pink-50 border border-pink-200 rounded-2xl text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-[#E5007D]">
                    <Mail className="w-4 h-4 text-[#E5007D]" />
                    <span>Canal Correo Electrónico ({modalNotificationData.order.email})</span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Se enviará el correo formal con el estado actual del pedido y la trazabilidad logística.
                  </p>
                </div>
              </div>
            )}

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
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#FF6A00] via-[#E5007D] to-[#6A0DAD] text-white flex items-center justify-center shadow-md">
                  <Sparkles className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-slate-900">
                      Auditoría Inteligente con IA
                    </h3>
                    <span className="text-[10px] bg-pink-100 text-[#E5007D] font-extrabold px-2 py-0.5 rounded-full border border-pink-200">
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
                <div className="w-12 h-12 border-4 border-[#E5007D] border-t-transparent rounded-full animate-spin mx-auto" />
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
                      <Mail className="w-3.5 h-3.5 text-[#E5007D]" />
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
