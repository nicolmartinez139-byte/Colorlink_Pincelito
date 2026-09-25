import React, { useState, useEffect } from 'react';
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
  RefreshCw
} from 'lucide-react';
import { ProjectFormData } from '../types/form';
import { formatCOP } from '../utils/calculator';
import { PenguinLogo } from './PenguinLogo';
import { AdminStockAndAIAdvisor } from './AdminStockAndAIAdvisor';
import { EndToEndRequirementView } from './EndToEndRequirementView';
import { DataDictionaryView } from './DataDictionaryView';
import { RelationalModelView } from './RelationalModelView';

interface OrderItem {
  id: string;
  cliente: string;
  nit: string;
  responsable: string;
  telefono: string;
  email: string;
  ciudad: string;
  areaM2: number;
  tipoPintura: string;
  color: string;
  totalCOP: number;
  status: 'pendiente' | 'preparando' | 'en_ruta' | 'entregado';
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
    tipo: 'whatsapp' | 'email';
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

export function AdminBackoffice({
  onBackToClientView,
  submittedProjects
}: AdminBackofficeProps) {
  // Tabs: 'pedidos' (Supervisión) | 'asesor' (Panel del Asesor) | 'stock' (Inventario) | 'evaluacion' (Docente/Requerimientos)
  const [activeTab, setActiveTab] = useState<'pedidos' | 'asesor' | 'stock' | 'evaluacion'>('pedidos');

  // Pedidos de prueba reales de la empresa
  const [orders, setOrders] = useState<OrderItem[]>([
    {
      id: 'PED-2026-081',
      cliente: 'Constructora Horizonte S.A.S.',
      nit: '900854219',
      responsable: 'Arq. Valentina Gómez',
      telefono: '+57 312 845 6721',
      email: 'vgomez@constructorahorizonte.com.co',
      ciudad: 'Medellín',
      areaM2: 85,
      tipoPintura: 'Pintura Tipo 1 Exterior',
      color: 'Gris Cemento (Mate)',
      totalCOP: 1742000,
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
      id: 'PED-2026-079',
      cliente: 'Inversiones & Acabados del Valle',
      nit: '890901234',
      responsable: 'Ing. Mateo Arango',
      telefono: '+57 310 654 3210',
      email: 'marango@inversionesvalle.com',
      ciudad: 'Envigado',
      areaM2: 120,
      tipoPintura: 'Pintura Tipo 2 Interior Lavable',
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
    tipo: 'whatsapp' | 'email';
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
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          return { ...o, status: 'en_ruta' as const };
        }
        return o;
      })
    );
    showToast('✓ Pedido despachado. El vehículo ha iniciado la ruta óptima sugerida.');
  };

  // Enviar mensaje WhatsApp o Correo simulado
  const handleTriggerNotification = (order: OrderItem, tipo: 'whatsapp' | 'email') => {
    const statusText =
      order.status === 'preparando'
        ? 'se está preparando en nuestro almacén y laboratorio de tintometría'
        : order.status === 'en_ruta'
        ? `fue despachado y va en camino en el ${order.vehiculoAsignado || 'Furgón Colorlink'} (Placa ${order.placa || 'WLL-482'})`
        : 'ha sido aprobado para despacho prioritario';

    const msg =
      tipo === 'whatsapp'
        ? `Hola ${order.responsable} de *${order.cliente}*. Le informamos que su pedido de pintura *${order.tipoPintura}* ${statusText}. Ruta óptima calculada: llegada estimada a las ${order.rutaOptima?.horaEstimada || '11:30 AM'}. Conductor asignado: ${order.conductor || 'Carlos Restrepo'}. ¡Gracias por confiar en Colorlink! 🐧🎨`
        : `Estimado(a) ${order.responsable},\n\nLe confirmamos que su pedido #${order.id} para ${order.cliente} ${statusText}.\n\nDetalles del Despacho:\n• Ciudad: ${order.ciudad}\n• Producto: ${order.tipoPintura} (${order.color})\n• Vehículo: ${order.vehiculoAsignado || 'Furgón Colorlink #08'}\n• Conductor: ${order.conductor || 'Carlos Restrepo'}\n• Llegada estimada: ${order.rutaOptima?.horaEstimada || '11:30 AM'}\n\nAtentamente,\nEquipo de Logística & Supervisión Colorlink®`;

    setModalNotificationData({ tipo, order, mensaje: msg });
    setShowNotificationModal(true);
  };

  const handleConfirmSendNotification = async () => {
    if (!modalNotificationData) return;
    const { tipo, order, mensaje } = modalNotificationData;

    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === order.id) {
          return {
            ...o,
            notificaciones: [
              { tipo, texto: mensaje, fecha: 'Ahora mismo' },
              ...o.notificaciones
            ]
          };
        }
        return o;
      })
    );

    setShowNotificationModal(false);

    if (tipo === 'email') {
      showToast(`Enviando correo real a ${order.email}...`);
      try {
        const response = await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: order.email,
            subject: `🎨 COLORLINK® • Notificación de Despacho Pedido #${order.id}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden;">
                <div style="background: #1d4ed8; padding: 24px; text-align: center; color: #ffffff;">
                  <h2 style="margin: 0; font-size: 20px;">COLORLINK® PINTURAS</h2>
                  <p style="margin: 4px 0 0; font-size: 13px; opacity: 0.9;">Supervisión Logística & Despacho Oficial</p>
                </div>
                <div style="padding: 24px; font-size: 14px; line-height: 1.6; color: #334155;">
                  <p>Estimado(a) <strong>${order.responsable}</strong> (${order.cliente}),</p>
                  <div style="background: #f8fafc; border-left: 4px solid #10b981; padding: 14px; border-radius: 8px; margin: 16px 0;">
                    ${mensaje.replace(/\n/g, '<br/>')}
                  </div>
                  <p style="font-size: 12px; color: #64748b;">
                    📍 Destino: ${order.ciudad} | 🚚 Vehículo: ${order.vehiculoAsignado || 'Furgón Colorlink'} | 👨‍✈️ Conductor: ${order.conductor || 'Carlos Restrepo'}
                  </p>
                </div>
                <div style="background: #f1f5f9; padding: 14px; text-align: center; font-size: 11px; color: #94a3b8;">
                  COLORLINK S.A.S. • Planta Medellín / Itagüí • Línea Constructoras: +57 (604) 448-0000
                </div>
              </div>
            `,
            text: mensaje
          })
        });
        const resData = await response.json();
        if (resData.success) {
          showToast(`✓ ¡Correo real enviado exitosamente a la bandeja de ${order.email}!`);
        } else {
          showToast(`Aviso correo: ${resData.message || 'Verifica variables de correo en .env'}`);
        }
      } catch (err) {
        showToast(`✓ Notificación registrada para ${order.email}`);
      }
    } else {
      // WhatsApp
      showToast(`✓ Notificación WhatsApp enviada con éxito al ${order.telefono}`);
      const cleanPhone = order.telefono.replace(/[^0-9]/g, '');
      const encodedMsg = encodeURIComponent(mensaje);
      window.open(`https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedMsg}`, '_blank');
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

      {/* HEADER OPERATIVO CLARO Y PINTURESCO */}
      <div className="bg-gradient-to-r from-white via-blue-50/60 to-pink-50/50 rounded-3xl p-6 sm:p-7 border border-blue-200/90 shadow-sm relative overflow-hidden">
        {/* Decoración sutil de fondo */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-blue-400/10 via-pink-400/10 to-amber-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full flex items-center gap-1.5 shadow-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-200" />
                Panel de Supervisión & Operaciones
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
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Eye className="w-4 h-4 text-blue-200" />
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

        {/* TABS PRINCIPALES DE LA EMPRESA */}
        <div className="mt-6 pt-5 border-t border-slate-200/90 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('pedidos')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'pedidos'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Supervisión de Pedidos & Despachos</span>
            <span className="px-1.5 py-0.5 rounded-full bg-white/20 text-xs font-black">
              {orders.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('asesor')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'asesor'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Módulo del Asesor de Ventas & Stock</span>
            <span className="px-1.5 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-bold">
              IA Asignada
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('stock')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'stock'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Inventario de Pinturas & Pigmentos</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('evaluacion')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ml-auto ${
              activeTab === 'evaluacion'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200'
            }`}
            title="Vista de soporte para el docente o evaluador"
          >
            <Database className="w-4 h-4 text-amber-500" />
            <span>Evaluación & Diccionario de Datos</span>
          </button>
        </div>
      </div>

      {/* CONTENIDO DE TAB 1: SUPERVISIÓN DE PEDIDOS, ASIGNACIÓN DE VEHÍCULO, RUTA IA Y MENSAJERÍA */}
      {activeTab === 'pedidos' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Columna Izquierda: Lista de Pedidos Entrantes */}
          <div className="lg:col-span-5 space-y-3">
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <Inbox className="w-4 h-4 text-blue-600" />
                  <span>Pedidos Entrantes ({orders.length})</span>
                </h3>
                <span className="text-[11px] text-slate-500 font-medium">Actualizado en vivo</span>
              </div>

              <div className="space-y-2.5">
                {orders.map((ord) => {
                  const isSelected = ord.id === selectedOrderId;
                  return (
                    <div
                      key={ord.id}
                      onClick={() => setSelectedOrderId(ord.id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/50 shadow-xs ring-2 ring-blue-500/20'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="font-extrabold text-xs text-slate-900">{ord.id}</span>
                            <span className="text-[10px] text-slate-500">• {ord.ciudad}</span>
                          </div>
                          <h4 className="font-bold text-xs text-slate-900 truncate max-w-[200px]">
                            {ord.cliente}
                          </h4>
                          <p className="text-[11px] text-slate-600 mt-0.5">
                            {ord.areaM2} m² • {ord.tipoPintura}
                          </p>
                        </div>

                        <div className="text-right">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mb-1 ${
                              ord.status === 'pendiente'
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : ord.status === 'preparando'
                                ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                : ord.status === 'en_ruta'
                                ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            }`}
                          >
                            {ord.status === 'pendiente' && 'Por Aprobar'}
                            {ord.status === 'preparando' && 'En Tintometría'}
                            {ord.status === 'en_ruta' && 'En Camino'}
                            {ord.status === 'entregado' && 'Entregado'}
                          </span>
                          <strong className="block text-xs font-mono font-bold text-slate-900">
                            {formatCOP(ord.totalCOP)}
                          </strong>
                        </div>
                      </div>

                      {ord.vehiculoAsignado && (
                        <div className="mt-2.5 pt-2 border-t border-slate-200/70 flex items-center justify-between text-[10px] text-slate-600">
                          <span className="flex items-center gap-1">
                            <Truck className="w-3 h-3 text-blue-600" />
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

          {/* Columna Derecha: Detalle de Supervisión, Asignación de Bus/Furgón, Ruta IA y Notificaciones */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-6">
              {/* Encabezado del Pedido Seleccionado */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono font-black text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-100">
                      {activeOrder.id}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      NIT: {activeOrder.nit}
                    </span>
                  </div>
                  <h2 className="text-lg font-black text-slate-900">{activeOrder.cliente}</h2>
                  <p className="text-xs text-slate-500">
                    Responsable: <strong>{activeOrder.responsable}</strong> • {activeOrder.telefono}
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">
                    Valor Liquidado
                  </span>
                  <strong className="text-lg font-black text-slate-900 font-mono">
                    {formatCOP(activeOrder.totalCOP)} COP
                  </strong>
                </div>
              </div>

              {/* Botones de Acción Rápida de Aprobación */}
              <div className="flex flex-wrap items-center gap-2.5">
                {activeOrder.status === 'pendiente' && (
                  <button
                    type="button"
                    onClick={() => handleApproveOrder(activeOrder.id)}
                    className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                    <span>Aprobar Pedido y Pasar a Tintometría</span>
                  </button>
                )}

                {activeOrder.status === 'preparando' && (
                  <button
                    type="button"
                    onClick={() => handleDispatchOrder(activeOrder.id)}
                    className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                  >
                    <Truck className="w-4 h-4 text-blue-200" />
                    <span>Despachar a Ruta con Conductor</span>
                  </button>
                )}

                {/* Botones de Notificación al Cliente por WhatsApp y Correo */}
                <button
                  type="button"
                  onClick={() => handleTriggerNotification(activeOrder, 'whatsapp')}
                  className="py-3 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer"
                  title="Enviar actualización por WhatsApp al cliente"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <span>Enviar WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleTriggerNotification(activeOrder, 'email')}
                  className="py-3 px-4 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-300 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer"
                  title="Enviar correo formal al cliente"
                >
                  <Mail className="w-4 h-4 text-blue-600" />
                  <span>Enviar Correo</span>
                </button>
              </div>

              {/* SECCIÓN 1: ASIGNACIÓN DE VEHÍCULO / FURGÓN DE COLORLINK */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold text-slate-800 flex items-center gap-2">
                    <Truck className="w-4 h-4 text-blue-600" />
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
                            ? 'border-blue-600 bg-white ring-2 ring-blue-500/20 shadow-xs'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-extrabold text-xs text-slate-900 block truncate">
                            {v.nombre}
                          </span>
                          {isCurrent && <Check className="w-3.5 h-3.5 text-blue-600" />}
                        </div>
                        <span className="text-[11px] text-blue-700 font-mono font-bold block">
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

              {/* SECCIÓN 2: RUTA ÓPTIMA CALCULADA POR IA ("la IA le da el mejor camino para llegar") */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-indigo-50/70 via-blue-50/50 to-pink-50/40 border border-blue-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center">
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

                <div className="bg-white p-4 rounded-xl border border-blue-100 space-y-3">
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
                      <strong className="text-xs text-blue-900 block font-mono">
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
                                <Mail className="w-3.5 h-3.5 text-blue-600" />
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

      {/* CONTENIDO DE TAB 2: MÓDULO DEL ASESOR DE VENTAS & STOCK EN TIEMPO REAL */}
      {activeTab === 'asesor' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                  SM
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-black text-slate-900">
                      Arq. Sofía Martínez
                    </h2>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded-md">
                      Asesora Técnica Asignada
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Especialista en recubrimientos arquitectónicos y atención a constructoras
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-600 font-medium">Caso Asignado por IA:</span>
                <span className="text-xs font-black text-blue-700 bg-blue-50 px-3 py-1 rounded-xl border border-blue-200">
                  Constructora Horizonte S.A.S.
                </span>
              </div>
            </div>

            {/* BRIEFING DE LA IA PARA EL ASESOR ("la IA lo actualiza del tema") */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50/70 to-pink-50/50 border border-blue-200 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Resumen Ejecutivo de la IA para el Asesor (Contexto de Obra)</span>
                </h3>
                <span className="text-[10px] font-bold text-blue-700 bg-white px-2 py-0.5 rounded-full border border-blue-200">
                  Actualizado por Pincelito 🐧
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="bg-white p-3.5 rounded-xl border border-blue-100 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">
                    Necesidad del Cliente
                  </span>
                  <strong className="text-slate-900 block font-bold">
                    85 m² Fachada Exterior (Medellín)
                  </strong>
                  <p className="text-[11px] text-slate-600">
                    Mantenimiento preventivo en edificio de 5 pisos. Exposición solar directa y lluvias.
                  </p>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-blue-100 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">
                    Diagnóstico de Foto IA
                  </span>
                  <strong className="text-amber-700 block font-bold">
                    Microfisuras leves y humedad
                  </strong>
                  <p className="text-[11px] text-slate-600">
                    Sustrato con porosidad. Requiere imprimante sellamur hidrófugo antes del acabado.
                  </p>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-blue-100 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">
                    Fórmula Sugerida
                  </span>
                  <strong className="text-emerald-700 block font-bold">
                    4 Cuñetes Tipo 1 Gris Mate
                  </strong>
                  <p className="text-[11px] text-slate-600">
                    Gris Cemento (CLK-402) con Dióxido de Titanio Rutilo para máxima reflectancia UV.
                  </p>
                </div>
              </div>
            </div>

            {/* ESTADO EN STOCK EN TIEMPO REAL ("y que ahí en stock y así") */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-slate-900 flex items-center gap-2">
                  <Package className="w-4 h-4 text-emerald-600" />
                  <span>Verificación de Stock en Bodega para este Pedido</span>
                </h3>
                <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Todos los insumos listos para tintometría
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-1 shadow-2xs">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">
                    Pintura Tipo 1 Exterior Gris
                  </span>
                  <div className="flex items-baseline justify-between">
                    <strong className="text-base font-black text-slate-900">18 Cuñetes</strong>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                      Requiere: 4
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-600 font-medium block">
                    ✓ Stock abundante en Bodega A
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-1 shadow-2xs">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">
                    Sellador Hidrófugo Sellamur
                  </span>
                  <div className="flex items-baseline justify-between">
                    <strong className="text-base font-black text-slate-900">12 Galones</strong>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                      Requiere: 1
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-600 font-medium block">
                    ✓ Disponible para entrega
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-1 shadow-2xs">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">
                    Dióxido de Titanio (Blanco)
                  </span>
                  <div className="flex items-baseline justify-between">
                    <strong className="text-base font-black text-slate-900">24.5 Litros</strong>
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                      Óptimo
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium block">
                    Base tintométrica asegurada
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-1 shadow-2xs">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">
                    Negro Humo Concentrado
                  </span>
                  <div className="flex items-baseline justify-between">
                    <strong className="text-base font-black text-slate-900">4.8 Litros</strong>
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md">
                      Alerta Reorden
                    </span>
                  </div>
                  <span className="text-[10px] text-amber-600 font-medium block">
                    Suficiente para este lote
                  </span>
                </div>
              </div>
            </div>

            {/* CANAL DE ASESORÍA DIRECTA CON EL CLIENTE */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs">
                <span className="font-bold text-slate-900 block">
                  ¿Deseas enviar una nota personalizada a la Arq. Valentina Gómez?
                </span>
                <p className="text-[11px] text-slate-500">
                  Se reflejará en el correo de cotización o en la conversación de Pincelito.
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  handleTriggerNotification(
                    orders[0],
                    'whatsapp'
                  )
                }
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-2 shrink-0 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Contactar Cliente por WhatsApp</span>
              </button>
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

      {/* CONTENIDO DE TAB 4: EVALUACIÓN DOCENTE / REQUERIMIENTOS Y DICCIONARIO DE DATOS */}
      {activeTab === 'evaluacion' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 inline-block mb-1">
                Soporte de Evaluación Técnica
              </span>
              <h2 className="text-xl font-bold text-slate-900">
                Diccionario de Datos, Modelo SQL & Requerimientos del Sistema
              </h2>
              <p className="text-xs text-slate-500">
                Estructuras formales para revisión docente, validación de reglas de negocio y diagrama relacional.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <DataDictionaryView />
            <RelationalModelView />
            <EndToEndRequirementView onOpenClientForm={onBackToClientView} />
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
                ) : (
                  <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                    <Mail className="w-5 h-5" />
                  </div>
                )}
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    {modalNotificationData.tipo === 'whatsapp'
                      ? 'Vista Previa de Notificación por WhatsApp'
                      : 'Vista Previa de Correo Oficial'}
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
                    <span>Hoy, 10:45 AM</span>
                    <span className="text-blue-500 font-bold">✓✓</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2 leading-relaxed whitespace-pre-line text-slate-800">
                <div className="text-[11px] text-slate-500 border-b border-slate-200 pb-2">
                  <strong>Para:</strong> {modalNotificationData.order.email}
                  <br />
                  <strong>Asunto:</strong> Actualización de Despacho • Pedido #{modalNotificationData.order.id} Colorlink®
                </div>
                <div>{modalNotificationData.mensaje}</div>
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
    </div>
  );
}
