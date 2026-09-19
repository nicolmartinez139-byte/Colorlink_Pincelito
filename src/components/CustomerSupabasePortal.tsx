import React, { useState, useEffect } from 'react';
import {
  Package,
  Clock,
  CheckCircle2,
  Truck,
  User,
  LogOut,
  Mail,
  Send,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Database,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  X,
  FileText,
  RefreshCw,
  Phone,
  Building2,
  Calendar,
  Check
} from 'lucide-react';
import {
  UserProfile,
  SupabaseOrder,
  getActiveSession,
  getUserOrdersFromSupabase,
  loginInSupabase,
  registerInSupabase,
  logoutFromSupabase
} from '../lib/supabaseService';
import { isSupabaseConfigured } from '../lib/supabase';
import { formatCOP } from '../utils/calculator';
import { sendRealOrderEmail } from '../lib/emailService';
import { ColorlinkRainbowBar } from './ColorlinkSplashes';

interface CustomerSupabasePortalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectOrder?: (order: SupabaseOrder) => void;
  initialEmail?: string;
  onSessionChange?: (user: UserProfile | null) => void;
}

export function CustomerSupabasePortal({
  isOpen,
  onClose,
  onSelectOrder,
  initialEmail,
  onSessionChange
}: CustomerSupabasePortalProps) {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(getActiveSession());
  const [ordersTab, setOrdersTab] = useState<'pendientes' | 'comprados'>('pendientes');
  const [pendingOrders, setPendingOrders] = useState<SupabaseOrder[]>([]);
  const [purchasedOrders, setPurchasedOrders] = useState<SupabaseOrder[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Estados de Auth
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [emailInput, setEmailInput] = useState<string>(initialEmail || 'vgomez@constructorahorizonte.com.co');
  const [passwordInput, setPasswordInput] = useState<string>('123456');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [empresaInput, setEmpresaInput] = useState<string>('Constructora Horizonte S.A.S.');
  const [nitInput, setNitInput] = useState<string>('900854219');
  const [responsableInput, setResponsableInput] = useState<string>('Arq. Valentina Gómez');
  const [telefonoInput, setTelefonoInput] = useState<string>('+57 312 845 6721');
  const [ciudadInput, setCiudadInput] = useState<string>('Medellín');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccessNotice, setAuthSuccessNotice] = useState<string | null>(null);

  // Estado para envío de correo real
  const [sendingEmailId, setSendingEmailId] = useState<string | null>(null);
  const [emailSentNotice, setEmailSentNotice] = useState<{ id: string; message: string } | null>(null);

  const supabaseActive = isSupabaseConfigured();

  // Cargar pedidos del usuario activo
  const loadOrders = async (userEmail: string) => {
    setIsLoading(true);
    try {
      const result = await getUserOrdersFromSupabase(userEmail);
      setPendingOrders(result.pendientes);
      setPurchasedOrders(result.comprados);
    } catch (err) {
      console.error('Error cargando pedidos:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      const active = getActiveSession();
      setCurrentUser(active);
      onSessionChange?.(active);
      if (active) {
        loadOrders(active.email);
      }
    }
  }, [isOpen]);

  useEffect(() => {
    if (currentUser) {
      loadOrders(currentUser.email);
    }
  }, [currentUser]);

  if (!isOpen) return null;

  // Manejar Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsLoading(true);

    const res = await loginInSupabase(emailInput, passwordInput);
    setIsLoading(false);

    if (res.success && res.user) {
      setCurrentUser(res.user);
      onSessionChange?.(res.user);
      setAuthSuccessNotice('¡Sesión iniciada exitosamente!');
      setTimeout(() => setAuthSuccessNotice(null), 3000);
    } else {
      setAuthError(res.error || 'Credenciales inválidas.');
    }
  };

  // Manejar Registro
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsLoading(true);

    const res = await registerInSupabase(emailInput, passwordInput, {
      empresa: empresaInput,
      nit: nitInput,
      responsable: responsableInput,
      telefono: telefonoInput,
      ciudad: ciudadInput
    });
    setIsLoading(false);

    if (res.success && res.user) {
      setCurrentUser(res.user);
      onSessionChange?.(res.user);
      setAuthSuccessNotice('¡Cuenta creada y guardada con éxito!');
      setTimeout(() => setAuthSuccessNotice(null), 3500);
    } else {
      setAuthError(res.error || 'No se pudo crear la cuenta.');
    }
  };

  const handleLogout = () => {
    logoutFromSupabase();
    setCurrentUser(null);
    onSessionChange?.(null);
    setPendingOrders([]);
    setPurchasedOrders([]);
  };

  // Enviar correo real al buzón del cliente
  const handleSendRealEmail = async (order: SupabaseOrder) => {
    setSendingEmailId(order.id);
    setEmailSentNotice(null);

    try {
      const result = await sendRealOrderEmail({
        to: order.cliente_email,
        subject: `🎨 COLORLINK® • Pedido #${order.id} (${order.estado.toUpperCase()}) - ${order.cliente_empresa}`,
        orderId: order.id,
        formData: {
          cliente: order.cliente_empresa,
          nitDocumento: order.nit,
          responsable: order.cliente_nombre,
          emailResponsable: order.cliente_email,
          telefonoResponsable: order.telefono,
          canalEntrada: 'Portal Clientes',
          ciudad: order.ciudad,
          tipoObra: 'Fachada Edificio',
          areaM2: order.area_m2,
          fechaRequerida: 'Entrega Inmediata',
          superficie: 'Concreto / Revoque',
          ambiente: 'Exterior Intemperie',
          condicion: 'Nueva sin pintar',
          colorAcabado: order.color,
          descripcionLibre: 'Pedido registrado en Supabase',
          fotos: [],
          observaciones: 'Despacho programado',
          consentimiento: true
        },
        calculation: {
          cuñetes: Math.ceil((order.area_m2 / 100) * 4),
          galones: 1,
          galonesTotalesTeoricos: Math.ceil((order.area_m2 / 100) * 20),
          subtotalCOP: order.subtotal_cop,
          descuentoCOP: 0,
          fleteCOP: order.flete_cop,
          ivaCOP: order.total_cop * 0.19,
          totalCOP: order.total_cop
        },
        statusMessage:
          order.estado === 'en_ruta'
            ? `En Ruta con ${order.conductor || 'Conductor'} (${order.placa || 'Furgón'})`
            : order.estado === 'en_preparacion'
            ? 'En Preparación en Laboratorio de Tintometría'
            : order.estado === 'entregado'
            ? 'Entregado en Obra Satisfactoriamente'
            : 'Cotización Pendiente de Aprobación'
      });

      if (result.success) {
        setEmailSentNotice({
          id: order.id,
          message: `✓ ¡Mensaje real enviado exitosamente a ${order.cliente_email}!`
        });
      } else {
        setEmailSentNotice({
          id: order.id,
          message: `Aviso: ${result.message || 'Verifica la configuración de correo en .env'}`
        });
      }
    } catch (err: any) {
      setEmailSentNotice({
        id: order.id,
        message: 'No se pudo enviar el correo en este momento.'
      });
    } finally {
      setSendingEmailId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/45 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 my-auto max-h-[92vh] flex flex-col overflow-hidden">
        {/* Barra de Colores Institucional Colorlink */}
        <ColorlinkRainbowBar className="h-1.5 w-full shrink-0" />

        <div className="p-6 sm:p-7 space-y-5 flex-1 flex flex-col overflow-hidden">
        {/* HEADER DEL PORTAL SUPABASE */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-700 text-white flex items-center justify-center shadow-md shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  Portal de Clientes • Base de Datos Supabase
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-black rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                  {supabaseActive ? 'Supabase Conectado ✓' : 'Sincronizado'}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Usuarios, contraseñas y registro de compras y pedidos pendientes guardados en Supabase.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
            title="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* NOTIFICACIÓN DE ÉXITO */}
        {authSuccessNotice && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center gap-2 animate-fadeIn shrink-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{authSuccessNotice}</span>
          </div>
        )}

        {/* CONTENIDO PRINCIPAL: SI NO HA INICIADO SESIÓN */}
        {!currentUser ? (
          <div className="space-y-4 overflow-y-auto flex-1 p-1">
            <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 text-xs space-y-1">
              <span className="font-bold text-blue-950 block">
                🔐 Accede a tu cuenta de cliente en Supabase
              </span>
              <p className="text-slate-600">
                Inicia sesión con tu correo y contraseña para ver todo lo que has comprado, tus pedidos pendientes y el seguimiento en ruta.
              </p>
            </div>

            {/* Selector de Pestañas: Iniciar Sesión vs Registrarse */}
            <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-bold">
              <button
                type="button"
                onClick={() => setAuthMode('login')}
                className={`flex-1 py-2 rounded-lg transition-all ${
                  authMode === 'login'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Iniciar Sesión
              </button>
              <button
                type="button"
                onClick={() => setAuthMode('register')}
                className={`flex-1 py-2 rounded-lg transition-all ${
                  authMode === 'register'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Crear Cuenta Nueva
              </button>
            </div>

            {authError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            {/* FORMULARIO DE INICIO DE SESIÓN */}
            {authMode === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Correo electrónico registrado en Supabase:
                  </label>
                  <input
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="ej: vgomez@constructorahorizonte.com.co"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Contraseña:
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder="Tu contraseña secreta"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>💡 Prueba rápida: vgomez@constructorahorizonte.com.co</span>
                  <button
                    type="button"
                    onClick={() => {
                      setEmailInput('vgomez@constructorahorizonte.com.co');
                      setPasswordInput('123456');
                    }}
                    className="text-blue-600 font-bold hover:underline cursor-pointer"
                  >
                    Usar de prueba
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <Lock className="w-4 h-4 text-blue-200" />
                  <span>{isLoading ? 'Conectando con Supabase...' : 'Ingresar a mi Cuenta'}</span>
                </button>
              </form>
            ) : (
              /* FORMULARIO DE REGISTRO EN SUPABASE */
              <form onSubmit={handleRegister} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Empresa o Cliente:
                    </label>
                    <input
                      type="text"
                      required
                      value={empresaInput}
                      onChange={(e) => setEmpresaInput(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      NIT o Documento:
                    </label>
                    <input
                      type="text"
                      required
                      value={nitInput}
                      onChange={(e) => setNitInput(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nombre del Responsable:
                    </label>
                    <input
                      type="text"
                      required
                      value={responsableInput}
                      onChange={(e) => setResponsableInput(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Teléfono / WhatsApp:
                    </label>
                    <input
                      type="text"
                      required
                      value={telefonoInput}
                      onChange={(e) => setTelefonoInput(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Correo electrónico:
                  </label>
                  <input
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Crea una Contraseña:
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <Database className="w-4 h-4" />
                  <span>{isLoading ? 'Registrando en Supabase...' : 'Crear Cuenta y Guardar en Supabase'}</span>
                </button>
              </form>
            )}
          </div>
        ) : (
          /* PANEL CON SESIÓN ACTIVA: "LO QUE HA COMPRADO" Y "LO QUE ESTÁ PENDIENTE" */
          <div className="flex-1 flex flex-col overflow-hidden space-y-4">
            {/* PERFIL DEL CLIENTE ACTIVO */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200/90 flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                  {currentUser.responsable.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-xs sm:text-sm text-slate-900">
                      {currentUser.responsable}
                    </span>
                    <span className="px-2 py-0.2 bg-blue-100 text-blue-800 text-[10px] font-bold rounded-md">
                      {currentUser.empresa}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {currentUser.email} • NIT {currentUser.nit} • {currentUser.ciudad}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => loadOrders(currentUser.email)}
                  className="p-2 text-slate-500 hover:text-blue-600 hover:bg-white rounded-xl transition-all"
                  title="Actualizar pedidos de Supabase"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-2.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                  title="Cerrar sesión"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Salir</span>
                </button>
              </div>
            </div>

            {/* SELECTOR DE PESTAÑAS: PENDIENTES VS COMPRADOS */}
            <div className="flex border-b border-slate-200 text-xs font-bold shrink-0">
              <button
                type="button"
                onClick={() => setOrdersTab('pendientes')}
                className={`pb-3 px-4 flex items-center gap-2 transition-all cursor-pointer border-b-2 ${
                  ordersTab === 'pendientes'
                    ? 'border-blue-600 text-blue-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Clock className="w-4 h-4 text-amber-500" />
                <span>Lo que está pendiente</span>
                <span className="px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 text-[10px]">
                  {pendingOrders.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setOrdersTab('comprados')}
                className={`pb-3 px-4 flex items-center gap-2 transition-all cursor-pointer border-b-2 ${
                  ordersTab === 'comprados'
                    ? 'border-blue-600 text-blue-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                <span>Lo que ha comprado / En ruta</span>
                <span className="px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-800 text-[10px]">
                  {purchasedOrders.length}
                </span>
              </button>
            </div>

            {/* LISTA DE PEDIDOS SEGÚN LA PESTAÑA SELECCIONADA */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {ordersTab === 'pendientes' && (
                <>
                  {pendingOrders.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 space-y-2">
                      <Clock className="w-8 h-8 mx-auto text-slate-300" />
                      <p className="text-xs">No tienes pedidos pendientes en este momento.</p>
                    </div>
                  ) : (
                    pendingOrders.map((ord) => (
                      <div
                        key={ord.id}
                        className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3 hover:border-blue-300 transition-all"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-1.5 mb-1">
                              <span className="font-extrabold text-xs text-slate-900">{ord.id}</span>
                              <span className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-amber-100 text-amber-800">
                                {ord.estado === 'en_preparacion'
                                  ? 'En Tintometría y Almacén'
                                  : 'Pendiente de Aprobación'}
                              </span>
                            </div>
                            <h4 className="font-bold text-xs text-slate-800">{ord.tipo_pintura}</h4>
                            <p className="text-[11px] text-slate-500">
                              {ord.area_m2} m² • Color: {ord.color} • {ord.ciudad}
                            </p>
                          </div>

                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 uppercase font-bold block">
                              Total
                            </span>
                            <strong className="text-xs font-mono font-black text-slate-900">
                              {formatCOP(ord.total_cop)}
                            </strong>
                          </div>
                        </div>

                        {/* ACCIONES DEL PEDIDO: ENVIAR MENSAJE AL CORREO REAL */}
                        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                          <span className="text-[10px] text-slate-400">
                            Registrado en Supabase: {new Date(ord.created_at).toLocaleDateString()}
                          </span>

                          <button
                            type="button"
                            onClick={() => handleSendRealEmail(ord)}
                            disabled={sendingEmailId === ord.id}
                            className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                            title="Enviar correo real a tu bandeja de entrada"
                          >
                            <Mail className="w-3.5 h-3.5 text-blue-600" />
                            <span>
                              {sendingEmailId === ord.id
                                ? 'Enviando correo real...'
                                : 'Enviar a mi correo real'}
                            </span>
                          </button>
                        </div>

                        {emailSentNotice?.id === ord.id && (
                          <div className="p-2 bg-emerald-50 text-emerald-800 text-[11px] font-bold rounded-xl border border-emerald-200">
                            {emailSentNotice.message}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </>
              )}

              {ordersTab === 'comprados' && (
                <>
                  {purchasedOrders.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 space-y-2">
                      <Package className="w-8 h-8 mx-auto text-slate-300" />
                      <p className="text-xs">No tienes pedidos finalizados o en ruta todavía.</p>
                    </div>
                  ) : (
                    purchasedOrders.map((ord) => (
                      <div
                        key={ord.id}
                        className="p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-blue-300 shadow-2xs space-y-3 transition-all"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-1.5 mb-1">
                              <span className="font-extrabold text-xs text-slate-900">{ord.id}</span>
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${
                                  ord.estado === 'entregado'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-blue-100 text-blue-800'
                                }`}
                              >
                                {ord.estado === 'entregado'
                                  ? '✓ Entregado en Obra'
                                  : '🚚 En Ruta de Despacho'}
                              </span>
                            </div>
                            <h4 className="font-bold text-xs text-slate-800">{ord.tipo_pintura}</h4>
                            <p className="text-[11px] text-slate-500">
                              {ord.area_m2} m² • Color: {ord.color} • {ord.ciudad}
                            </p>
                          </div>

                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 uppercase font-bold block">
                              Liquidado
                            </span>
                            <strong className="text-xs font-mono font-black text-slate-900">
                              {formatCOP(ord.total_cop)}
                            </strong>
                          </div>
                        </div>

                        {ord.vehiculo_asignado && (
                          <div className="p-2.5 rounded-xl bg-slate-50 text-[11px] text-slate-600 flex items-center justify-between">
                            <span className="flex items-center gap-1.5 font-medium">
                              <Truck className="w-3.5 h-3.5 text-blue-600" />
                              {ord.vehiculo_asignado} (Placa {ord.placa})
                            </span>
                            <span className="font-bold text-slate-700">
                              Conductor: {ord.conductor}
                            </span>
                          </div>
                        )}

                        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                          <span className="text-[10px] text-slate-400">
                            Entregado: {new Date(ord.created_at).toLocaleDateString()}
                          </span>

                          <button
                            type="button"
                            onClick={() => handleSendRealEmail(ord)}
                            disabled={sendingEmailId === ord.id}
                            className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                            title="Reenviar comprobante a tu correo"
                          >
                            <Mail className="w-3.5 h-3.5 text-blue-600" />
                            <span>
                              {sendingEmailId === ord.id
                                ? 'Enviando correo...'
                                : 'Enviar comprobante a mi correo'}
                            </span>
                          </button>
                        </div>

                        {emailSentNotice?.id === ord.id && (
                          <div className="p-2 bg-blue-50 text-blue-800 text-[11px] font-bold rounded-xl border border-blue-200">
                            {emailSentNotice.message}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </>
              )}
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
