import React, { useState } from 'react';
import {
  UserCheck,
  MessageSquare,
  Phone,
  Mail,
  Building2,
  MapPin,
  Calendar,
  Clock,
  Send,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Package,
  Sparkles,
  TrendingUp,
  LogOut,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  FileText
} from 'lucide-react';
import { formatCOP } from '../utils/calculator';
import { PenguinLogo } from './PenguinLogo';
import { getStoredAdvisorConversations } from '../utils/advisorService';

export interface ClientConversation {
  id: string;
  cliente: string;
  nit: string;
  responsable: string;
  telefono: string;
  email: string;
  ciudad: string;
  obra: string;
  fechaHora: string;
  canal: 'correo' | 'llamada' | 'reunion' | 'visita_obra';
  temaConversacion: string;
  acuerdoAlcanzado: string;
  estado: 'cotizado' | 'en_negociacion' | 'visita_agendada' | 'cerrado_exito' | 'seguimiento';
  montoCOP?: number;
  requerimientoPintura?: string;
}

export interface AdvisorData {
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

export const COLORLINK_ADVISORS: AdvisorData[] = [
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
    badge: 'Consultor Técnico Industrial',
    assignedCasesCount: 3,
    activeQuotationsCOP: 19800000,
    salesGoalProgress: 82
  }
];

interface AdvisorPortalProps {
  currentAdvisor: AdvisorData;
  onLogout: () => void;
  onSwitchAdvisor?: (advisor: AdvisorData) => void;
}

const INITIAL_CONVERSATIONS: Record<string, ClientConversation[]> = {
  sofia_martinez: [
    {
      id: 'CONV-SM-01',
      cliente: 'Constructora Horizonte S.A.S.',
      nit: '900.854.219-3',
      responsable: 'Arq. Valentina Gómez',
      telefono: '+57 312 845 6721',
      email: 'vgomez@constructorahorizonte.com.co',
      ciudad: 'Medellín',
      obra: 'Edificio Residencial Horizonte (El Poblado, Cra 43A)',
      fechaHora: 'Hoy, 09:30 AM',
      canal: 'correo',
      temaConversacion: 'Mantenimiento preventivo de fachada de 5 pisos (85 m²). Presenta microfisuras leves y humedad por exposición directa a lluvias. Preguntó por formulación Gris Cemento mate y si el Sellamur hidrófugo viene incluido en la cotización.',
      acuerdoAlcanzado: 'Se confirmó cotización de 4 cuñetes Tipo 1 Exterior Gris + 1 galón Sellamur hidrófugo ($1.681.500 COP). Se acordó envío de muestra física de color hoy a las 2:00 PM y despacho prioritario el viernes.',
      estado: 'en_negociacion',
      montoCOP: 1681500,
      requerimientoPintura: 'Tipo 1 Acrílica Fachada Gris Cemento (CLK-402)'
    },
    {
      id: 'CONV-SM-02',
      cliente: 'Arquitectura & Concretos de Antioquia',
      nit: '901.228.450-1',
      responsable: 'Ing. Mateo Restrepo',
      telefono: '+57 310 492 8812',
      email: 'mrestrepo@arquitecturaconcretos.com',
      ciudad: 'Medellín',
      obra: 'Torre Laureles Plaza (Circular 4ta)',
      fechaHora: 'Ayer, 04:15 PM',
      canal: 'visita_obra',
      temaConversacion: 'Inspección de 220 m² de revoque fresco en zonas comunes interiores. Se conversó sobre pintura superlavable Tipo 2 blanco nieve resistente a roce y limpieza con hidrolavadora suave.',
      acuerdoAlcanzado: 'Se envió cotización formal por 8 cuñetes Tipo 2 Interior ($2.704.000 COP). Aceptaron crédito a 30 días con Bancolombia.',
      estado: 'cotizado',
      montoCOP: 2704000,
      requerimientoPintura: 'Tipo 2 Interior Blanco Nieve'
    },
    {
      id: 'CONV-SM-03',
      cliente: 'Urbanizaciones El Tesoro S.A.',
      nit: '890.312.678-4',
      responsable: 'Dra. Carolina Echavarría',
      telefono: '+57 314 772 3190',
      email: 'cechavarria@eltesoro.com.co',
      ciudad: 'Envigado',
      obra: 'Conjunto Bosques del Sur (Muros perimetrales)',
      fechaHora: '25 Sep 2026, 11:00 AM',
      canal: 'llamada',
      temaConversacion: 'Consulta sobre pintura elastomérica antialcalina para muros de contención expuestos a tierra húmeda y filtraciones en ladera.',
      acuerdoAlcanzado: 'Se agendó visita técnica con el químico de Colorlink para el próximo lunes a las 8:30 AM con prueba de adherencia.',
      estado: 'visita_agendada',
      montoCOP: 5400000,
      requerimientoPintura: 'Elastomérica Especial Sellamur'
    }
  ],
  camila_morales: [
    {
      id: 'CONV-CM-01',
      cliente: 'Consorcio Metropolitano Calle 100',
      nit: '901.452.890-7',
      responsable: 'Ing. Felipe Samper',
      telefono: '+57 311 987 6543',
      email: 'fsamper@consorciometropolitano.co',
      ciudad: 'Bogotá D.C.',
      obra: 'Complejo Empresarial Calle 100 con Autopista Norte',
      fechaHora: 'Hoy, 08:45 AM',
      canal: 'correo',
      temaConversacion: 'Licitación de 320 m² de fachada institucional. Comparó cotización de Pintuco® vs Colorlink® Pro de fábrica. Solicitó desglose de ahorro del 15% y certificado NTC 1335 para interventoría IDU.',
      acuerdoAlcanzado: 'Se enviaron fichas técnicas NTC 1335 y comparativo formal de precios. El cliente confirmó que si mantenemos despacho gratuito desde Mosquera firman orden de compra por $12.800.000 COP.',
      estado: 'en_negociacion',
      montoCOP: 12800000,
      requerimientoPintura: 'Tipo 1 Fachadas Gris Grafito UV'
    },
    {
      id: 'CONV-CM-02',
      cliente: 'Constructora Bolívar Regional Centro',
      nit: '860.034.567-2',
      responsable: 'Arq. Mariana Silva',
      telefono: '+57 315 890 2234',
      email: 'msilva@constructorabolivar.com',
      ciudad: 'Bogotá D.C.',
      obra: 'Proyecto VIS Ciudadela La Felicidad (Fase 3)',
      fechaHora: '26 Sep 2026, 03:30 PM',
      canal: 'reunion',
      temaConversacion: 'Requerimiento masivo de cielorrasos Tipo 3 para 180 apartamentos. Conversaron sobre rendimiento de 35 m² por cuñete y tiempo de secado rápido entre manos para entrega antes de fin de mes.',
      acuerdoAlcanzado: 'Cerrado con éxito. Se pactó despacho de 35 cuñetes de cielo raso mate para entregar el 30 de septiembre.',
      estado: 'cerrado_exito',
      montoCOP: 9800000,
      requerimientoPintura: 'Tipo 3 Cielorraso Blanco Mate'
    }
  ],
  juan_pablo_arango: [
    {
      id: 'CONV-JA-01',
      cliente: 'Industrias Químicas del Valle S.A.',
      nit: '900.567.891-0',
      responsable: 'Ing. Carlos H. Caicedo',
      telefono: '+57 316 234 5678',
      email: 'chcaicedo@quimicasdelvalle.com',
      ciudad: 'Cali',
      obra: 'Planta de Producción Zona Franca Yumbo',
      fechaHora: 'Hoy, 10:00 AM',
      canal: 'llamada',
      temaConversacion: 'Conversación sobre recubrimiento de pisos con epóxico alto tráfico 100% sólidos resistente a derrames de ácidos leves y grasas industriales.',
      acuerdoAlcanzado: 'Se envió cotización de 14 kits epóxicos industriales + catalizador poliamídico ($8.900.000 COP) con despacho desde CEDI Yumbo.',
      estado: 'seguimiento',
      montoCOP: 8900000,
      requerimientoPintura: 'Epóxico Industrial 100% Sólidos'
    },
    {
      id: 'CONV-JA-02',
      cliente: 'Constructora Marval Costa',
      nit: '890.201.345-9',
      responsable: 'Ing. Alberto Char',
      telefono: '+57 317 654 3210',
      email: 'achar@marvalcosta.com',
      ciudad: 'Barranquilla',
      obra: 'Torres del Malecón (Frente al Río Magdalena)',
      fechaHora: '26 Sep 2026, 02:00 PM',
      canal: 'correo',
      temaConversacion: 'Consulta por pinturas con resistencia a alta salinidad marina, humedad relativa del 90% y sol caribeño para balcones expuestos.',
      acuerdoAlcanzado: 'Recomendada Pintura 100% Acrílica Tipo 1 con fungicida antialgas reforzado. Muestra enviada por Servientrega.',
      estado: 'en_negociacion',
      montoCOP: 7850000,
      requerimientoPintura: 'Tipo 1 Acrílica Tropical Antihongos'
    }
  ]
};

export function AdvisorPortal({ currentAdvisor, onLogout, onSwitchAdvisor }: AdvisorPortalProps) {
  const getMergedConversations = () => {
    const stored = getStoredAdvisorConversations();
    const storedForAdvisor = stored[currentAdvisor.id] || [];
    const initialList = INITIAL_CONVERSATIONS[currentAdvisor.id] || INITIAL_CONVERSATIONS.sofia_martinez;
    // Evitar duplicados por id
    const existingIds = new Set(storedForAdvisor.map((c: any) => c.id));
    const combined = [...storedForAdvisor, ...initialList.filter((c: any) => !existingIds.has(c.id))];
    return combined;
  };

  const [conversations, setConversations] = useState<ClientConversation[]>(getMergedConversations());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [selectedConversation, setSelectedConversation] = useState<ClientConversation | null>(
    conversations[0] || null
  );

  React.useEffect(() => {
    const handleLeadAdded = () => {
      const updated = getMergedConversations();
      setConversations(updated);
      if (updated.length > 0) {
        setSelectedConversation(updated[0]);
      }
    };

    window.addEventListener('colorlink_advisor_lead_added', handleLeadAdded);
    return () => {
      window.removeEventListener('colorlink_advisor_lead_added', handleLeadAdded);
    };
  }, [currentAdvisor.id]);

  React.useEffect(() => {
    const updated = getMergedConversations();
    setConversations(updated);
    setSelectedConversation(updated[0] || null);
  }, [currentAdvisor.id]);

  // Modal para registrar nueva conversación
  const [showNewConversationModal, setShowNewConversationModal] = useState(false);
  const [newCliente, setNewCliente] = useState('');
  const [newNit, setNewNit] = useState('');
  const [newResponsable, setNewResponsable] = useState('');
  const [newTelefono, setNewTelefono] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newCiudad, setNewCiudad] = useState((currentAdvisor.territory || 'Medellín').split(' ')[0] || 'Medellín');
  const [newObra, setNewObra] = useState('');
  const [newCanal, setNewCanal] = useState<'correo' | 'llamada' | 'reunion' | 'visita_obra'>('correo');
  const [newTema, setNewTema] = useState('');
  const [newAcuerdo, setNewAcuerdo] = useState('');
  const [newMonto, setNewMonto] = useState('');
  const [newPintura, setNewPintura] = useState('Pintura Tipo 1 Exterior');

  const filteredConversations = conversations.filter(conv => {
    const q = (searchTerm || '').toLowerCase();
    const matchesSearch =
      (conv.cliente || '').toLowerCase().includes(q) ||
      (conv.responsable || '').toLowerCase().includes(q) ||
      (conv.temaConversacion || '').toLowerCase().includes(q) ||
      (conv.ciudad || '').toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'todos' || conv.estado === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateConversation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCliente.trim() || !newTema.trim()) return;

    const newConv: ClientConversation = {
      id: `CONV-${Date.now().toString().slice(-4)}`,
      cliente: newCliente.trim(),
      nit: newNit.trim() || '900.000.000-1',
      responsable: newResponsable.trim() || 'Contacto Comercial',
      telefono: newTelefono.trim() || '+57 300 000 0000',
      email: newEmail.trim() || 'cliente@obra.com.co',
      ciudad: newCiudad,
      obra: newObra.trim() || `Proyecto ${newCiudad}`,
      fechaHora: 'Hoy, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      canal: newCanal,
      temaConversacion: newTema.trim(),
      acuerdoAlcanzado: newAcuerdo.trim() || 'Seguimiento agendado en 48 horas.',
      estado: 'en_negociacion',
      montoCOP: Number(newMonto) || 1500000,
      requerimientoPintura: newPintura
    };

    setConversations(prev => [newConv, ...prev]);
    setSelectedConversation(newConv);
    setShowNewConversationModal(false);

    // Reset fields
    setNewCliente('');
    setNewNit('');
    setNewResponsable('');
    setNewTelefono('');
    setNewEmail('');
    setNewObra('');
    setNewTema('');
    setNewAcuerdo('');
    setNewMonto('');
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* HEADER DE BIENVENIDA DEL ASESOR */}
      <div className="bg-gradient-to-r from-sky-900 via-blue-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-sky-500/30">
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-tr ${currentAdvisor.avatarColor} text-white flex items-center justify-center font-black text-2xl shadow-lg border-2 border-white/20`}>
              {currentAdvisor.avatarInitial}
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="px-3 py-1 bg-emerald-500/30 text-emerald-300 font-bold text-xs rounded-full border border-emerald-400/30 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Módulo de Asesor Activo
                </span>
                <span className="px-3 py-1 bg-white/10 text-purple-200 font-semibold text-xs rounded-full border border-white/10">
                  {currentAdvisor.territory}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
                {currentAdvisor.name}
              </h1>
              <p className="text-xs sm:text-sm text-purple-200 mt-0.5">
                {currentAdvisor.badge} • {currentAdvisor.specialty}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setShowNewConversationModal(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>+ Registrar Conversación</span>
            </button>
            <button
              type="button"
              onClick={onLogout}
              className="px-4 py-2.5 bg-white/10 hover:bg-rose-500/80 text-white font-bold text-xs rounded-xl border border-white/20 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
              title="Cerrar sesión de asesor"
            >
              <LogOut className="w-4 h-4" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>

        {/* 4 KPIs DEL ASESOR */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10 text-xs">
          <div className="bg-white/5 p-3.5 rounded-2xl border border-white/10">
            <span className="text-[10px] font-bold text-purple-200 uppercase tracking-wider block">Clientes & Obras Atendidas</span>
            <strong className="text-lg font-black text-white block mt-0.5">
              {conversations.length} Contactos Registrados
            </strong>
            <span className="text-[10px] text-emerald-300 font-medium block mt-0.5">
              ✓ Historial 100% documentado
            </span>
          </div>

          <div className="bg-white/5 p-3.5 rounded-2xl border border-white/10">
            <span className="text-[10px] font-bold text-purple-200 uppercase tracking-wider block">Cartera en Negociación</span>
            <strong className="text-lg font-black text-emerald-300 block mt-0.5">
              {formatCOP(currentAdvisor.activeQuotationsCOP)}
            </strong>
            <span className="text-[10px] text-purple-200 block mt-0.5">
              Cotizaciones activas
            </span>
          </div>

          <div className="bg-white/5 p-3.5 rounded-2xl border border-white/10">
            <span className="text-[10px] font-bold text-purple-200 uppercase tracking-wider block">Cumplimiento Meta Mes</span>
            <strong className="text-lg font-black text-amber-300 block mt-0.5">
              {currentAdvisor.salesGoalProgress}% Alcanzado
            </strong>
            <span className="text-[10px] text-amber-200 block mt-0.5">
              Meta regional: 90%
            </span>
          </div>

          <div className="bg-white/5 p-3.5 rounded-2xl border border-white/10">
            <span className="text-[10px] font-bold text-purple-200 uppercase tracking-wider block">Línea Directa Asesor</span>
            <strong className="text-sm font-mono font-bold text-sky-200 block mt-0.5">
              {currentAdvisor.phone}
            </strong>
            <span className="text-[10px] text-slate-300 block mt-0.5">
              {currentAdvisor.email}
            </span>
          </div>
        </div>
      </div>

      {/* SECCIÓN PRINCIPAL: ¿CON QUÉ CLIENTES HA HABLADO Y SOBRE QUÉ? */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Columna Izquierda: Lista de Clientes con los que ha conversado */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-purple-600" />
                  <span>Clientes Atendidos ({filteredConversations.length})</span>
                </h2>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Bitácora de contactos, llamadas y acuerdos en obra
                </p>
              </div>

              <span className="px-2.5 py-1 bg-purple-50 text-purple-700 text-[10px] font-bold rounded-lg border border-purple-200">
                En Vivo
              </span>
            </div>

            {/* Barra de Búsqueda y Filtros */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar cliente, obra, ciudad o tema..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all"
                />
              </div>

              {/* Filtro por estado */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[10px]">
                {[
                  { id: 'todos', label: 'Todos' },
                  { id: 'en_negociacion', label: 'En Negociación' },
                  { id: 'cotizado', label: 'Cotizado' },
                  { id: 'visita_agendada', label: 'Visita' },
                  { id: 'cerrado_exito', label: 'Cerrado' }
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setStatusFilter(f.id)}
                    className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition-all cursor-pointer ${
                      statusFilter === f.id
                        ? 'bg-purple-600 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Lista de Conversaciones */}
            <div className="space-y-2.5 max-h-[580px] overflow-y-auto pr-1">
              {filteredConversations.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No se encontraron conversaciones con ese filtro.
                </div>
              ) : (
                filteredConversations.map((conv) => {
                  const isSelected = selectedConversation?.id === conv.id;
                  return (
                    <div
                      key={conv.id}
                      onClick={() => setSelectedConversation(conv)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-purple-600 bg-purple-50/60 shadow-xs ring-2 ring-purple-500/20'
                          : 'border-slate-200 hover:border-purple-300 bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div>
                          <span className="font-extrabold text-xs text-slate-900 block truncate max-w-[210px]">
                            {conv.cliente}
                          </span>
                          <span className="text-[11px] text-purple-700 font-semibold block">
                            {conv.responsable} • {conv.ciudad}
                          </span>
                        </div>

                        <span
                          className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full shrink-0 ${
                            conv.estado === 'cerrado_exito'
                              ? 'bg-emerald-100 text-emerald-800'
                              : conv.estado === 'visita_agendada'
                              ? 'bg-sky-100 text-sky-800'
                              : conv.estado === 'cotizado'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-purple-100 text-purple-800'
                          }`}
                        >
                          {conv.estado === 'cerrado_exito' && 'Cerrado ✓'}
                          {conv.estado === 'visita_agendada' && 'Visita'}
                          {conv.estado === 'cotizado' && 'Cotizado'}
                          {conv.estado === 'en_negociacion' && 'Negociación'}
                          {conv.estado === 'seguimiento' && 'Seguimiento'}
                        </span>
                      </div>

                      {/* Resumen de Sobre Qué Hablaron */}
                      <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                        <strong className="text-slate-800 font-semibold">Tema: </strong>
                        {conv.temaConversacion}
                      </p>

                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                        <span className="flex items-center gap-1 font-medium">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {conv.fechaHora}
                        </span>
                        {conv.montoCOP && (
                          <span className="font-mono font-bold text-slate-900">
                            {formatCOP(conv.montoCOP)}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Columna Derecha: Detalle Profundo de la Conversación Seleccionada */}
        <div className="lg:col-span-7 space-y-4">
          {selectedConversation ? (
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-6">
              {/* Encabezado del Detalle */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-lg border border-purple-200">
                      {selectedConversation.id}
                    </span>
                    <span className="text-xs text-slate-500">
                      NIT: <strong>{selectedConversation.nit}</strong>
                    </span>
                    <span className="text-xs text-slate-500 font-semibold">• {selectedConversation.ciudad}</span>
                  </div>
                  <h3 className="text-xl font-black text-slate-900">
                    {selectedConversation.cliente}
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Contacto: <strong className="text-slate-800">{selectedConversation.responsable}</strong> • {selectedConversation.telefono}
                  </p>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    Obra: <strong className="text-slate-700">{selectedConversation.obra}</strong>
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">
                    Monto Estimado de Obra
                  </span>
                  <strong className="text-xl font-black text-slate-900 font-mono">
                    {formatCOP(selectedConversation.montoCOP || 0)}
                  </strong>
                  <span className="text-[10px] text-emerald-600 font-bold block">
                    Asesor a Cargo: {(currentAdvisor.name || '').split(' ')[0]}
                  </span>
                </div>
              </div>

              {/* Botones de Comunicación Inmediata con el Cliente */}
              <div className="flex flex-wrap items-center gap-2.5">
                <a
                  href={`mailto:${selectedConversation.email}?subject=${encodeURIComponent(
                    `Seguimiento Técnico Colorlink® • Obra ${selectedConversation.obra}`
                  )}&body=${encodeURIComponent(
                    `Hola ${selectedConversation.responsable}, le habla ${currentAdvisor.name} de Colorlink® Pinturas respecto al proyecto "${selectedConversation.obra}". ¿Cómo avanza la revisión de la cotización?`
                  )}`}
                  className="flex-1 py-3 px-4 bg-sky-600 hover:bg-sky-700 text-white text-xs font-black rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <Mail className="w-4 h-4 text-sky-200" />
                  <span>Contactar por Correo ({selectedConversation.email})</span>
                </a>

                <a
                  href={`tel:${selectedConversation.telefono}`}
                  className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Phone className="w-4 h-4 text-slate-600" />
                  <span>Llamar ({selectedConversation.telefono})</span>
                </a>
              </div>

              {/* TARJETA 1: ¿SOBRE QUÉ HABLARON? (TEMA EXACTO) */}
              <div className="p-5 rounded-2xl bg-purple-50/60 border border-purple-200 space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-black text-purple-900">
                  <FileText className="w-4 h-4 text-purple-600" />
                  <span>DETALLE DE LO CONVERSADO (¿SOBRE QUÉ SE HABLÓ?):</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-normal bg-white p-4 rounded-xl border border-purple-100 shadow-2xs">
                  {selectedConversation.temaConversacion}
                </p>
                <div className="text-[11px] text-purple-800 font-semibold flex items-center gap-2">
                  <span>Pintura / Sistema Requerido:</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-white font-mono text-[10px] text-purple-950 border border-purple-200">
                    {selectedConversation.requerimientoPintura || 'Pintura Arquitectónica Colorlink'}
                  </span>
                </div>
              </div>

              {/* TARJETA 2: ACUERDOS ALCANZADOS & PRÓXIMO PASO */}
              <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-black text-emerald-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>ACUERDO ALCANZADO & COMPROMISO DE COLORLINK:</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-normal bg-white p-4 rounded-xl border border-emerald-100 shadow-2xs">
                  {selectedConversation.acuerdoAlcanzado}
                </p>
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span>Canal de contacto: <strong className="capitalize">{selectedConversation.canal.replace('_', ' ')}</strong></span>
                  <span>Registrado el: <strong>{selectedConversation.fechaHora}</strong></span>
                </div>
              </div>

              {/* TARJETA 3: BRIEFING DE LA IA DE PLANTA PARA ESTA OBRA */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-black text-slate-900">
                    <Sparkles className="w-4 h-4 text-sky-600" />
                    <span>Recomendación Técnica de la IA (Pincelito)</span>
                  </div>
                  <span className="text-[10px] text-sky-700 font-bold bg-white px-2 py-0.5 rounded-full border border-sky-200">
                    NTC 1335
                  </span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Para la obra en <strong>{selectedConversation.ciudad}</strong>, verificar si el revoque tiene menos de 28 días de curado. En tal caso, aplicar siempre imprimante antialcalino antes de las dos manos de acabado para evitar eflorescencias.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 border border-slate-200 shadow-sm text-center space-y-3">
              <MessageSquare className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-700">Selecciona un cliente de la lista</p>
              <p className="text-xs text-slate-400">Verás el historial de lo que se habló, acuerdos y cotizaciones.</p>
            </div>
          )}
        </div>
      </div>

      {/* MODAL PARA REGISTRAR NUEVA CONVERSACIÓN CON CLIENTE */}
      {showNewConversationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Registrar Nueva Conversación con Cliente
                  </h3>
                  <p className="text-xs text-slate-500">
                    Asesor: {currentAdvisor.name} ({currentAdvisor.territory})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowNewConversationModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateConversation} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Cliente / Constructora / Empresa *</label>
                  <input
                    type="text"
                    required
                    value={newCliente}
                    onChange={(e) => setNewCliente(e.target.value)}
                    placeholder="Ej. Constructora Horizonte S.A.S."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Responsable / Cargo *</label>
                  <input
                    type="text"
                    required
                    value={newResponsable}
                    onChange={(e) => setNewResponsable(e.target.value)}
                    placeholder="Ej. Arq. Valentina Gómez"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Teléfono de Contacto *</label>
                  <input
                    type="text"
                    required
                    value={newTelefono}
                    onChange={(e) => setNewTelefono(e.target.value)}
                    placeholder="+57 312 845 6721"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Ciudad *</label>
                  <select
                    value={newCiudad}
                    onChange={(e) => setNewCiudad(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold cursor-pointer"
                  >
                    <option value="Medellín">Medellín</option>
                    <option value="Bogotá D.C.">Bogotá D.C.</option>
                    <option value="Cali">Cali</option>
                    <option value="Barranquilla">Barranquilla</option>
                    <option value="Cartagena">Cartagena</option>
                    <option value="Bucaramanga">Bucaramanga</option>
                    <option value="Envigado">Envigado</option>
                    <option value="Rionegro">Rionegro</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Canal Usado</label>
                  <select
                    value={newCanal}
                    onChange={(e) => setNewCanal(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold cursor-pointer"
                  >
                    <option value="correo">Correo Electrónico</option>
                    <option value="llamada">Llamada Telefónica</option>
                    <option value="visita_obra">Visita en Obra</option>
                    <option value="reunion">Reunión Virtual</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Nombre de la Obra / Proyecto</label>
                <input
                  type="text"
                  value={newObra}
                  onChange={(e) => setNewObra(e.target.value)}
                  placeholder="Ej. Fachada Edificio Horizonte (Cra 43A)"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                />
              </div>

              {/* Campo Crítico: Sobre qué se habló */}
              <div className="space-y-1">
                <label className="font-bold text-purple-900 flex items-center justify-between">
                  <span>¿Sobre qué hablaron? (Detalle de la Conversación) *</span>
                  <span className="text-[10px] text-slate-400 font-normal">Requerimiento, dudas, problemas en obra</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={newTema}
                  onChange={(e) => setNewTema(e.target.value)}
                  placeholder="Describe con precisión qué solicitó el cliente, qué dudas tuvo sobre la pintura, si hubo reclamos por humedad, rendimiento, color o precios..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-normal leading-relaxed"
                />
              </div>

              {/* Campo Crítico: Qué acuerdos alcanzaron */}
              <div className="space-y-1">
                <label className="font-bold text-emerald-900 flex items-center justify-between">
                  <span>¿Qué acuerdo se alcanzó? (Próximos pasos y compromisos) *</span>
                  <span className="text-[10px] text-slate-400 font-normal">Muestra de color, descuento, fecha de entrega</span>
                </label>
                <textarea
                  required
                  rows={2}
                  value={newAcuerdo}
                  onChange={(e) => setNewAcuerdo(e.target.value)}
                  placeholder="Ej. Se acordó enviar muestra física hoy a las 3:00 PM y mantener descuento del 15% de fábrica."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-normal leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Monto Estimado de Cotización (COP)</label>
                  <input
                    type="number"
                    value={newMonto}
                    onChange={(e) => setNewMonto(e.target.value)}
                    placeholder="1680000"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Pintura o Sistema Tratado</label>
                  <input
                    type="text"
                    value={newPintura}
                    onChange={(e) => setNewPintura(e.target.value)}
                    placeholder="Tipo 1 Exterior Gris Mate"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowNewConversationModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black rounded-xl shadow-md cursor-pointer active:scale-95 flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>Guardar Conversación</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
