import { useState, useEffect } from 'react';
import { StandaloneClientForm } from './components/StandaloneClientForm';
import { AdminBackoffice } from './components/AdminBackoffice';
import { ColorlinkRainbowBar } from './components/ColorlinkSplashes';
import { PenguinLogo } from './components/PenguinLogo';
import { ColorlinkLoginLanding } from './components/ColorlinkLoginLanding';
import { ColorlinkShowcasePresentation } from './components/ColorlinkShowcasePresentation';
import { AdvisorPortal, AdvisorData, COLORLINK_ADVISORS } from './components/AdvisorPortal';
import { ProjectFormData } from './types/form';
import { calculateTechnicalRequirements } from './utils/calculator';
import { submitProjectToSupabase, fetchSubmittedProjects, SubmittedProject, saveClientOrderToHistory } from './utils/supabaseApi';
import { sendConfirmationEmail } from './utils/emailService';
import { getLogisticsForCity } from './utils/orderStateMessages';
import { isSupabaseConfigured } from './lib/supabase';
import {
  ShieldCheck,
  Lock,
  UserCheck,
  Sparkles,
  Phone,
  MessageSquare,
  ArrowRight,
  CheckCircle2,
  X,
  LogOut,
  Building2,
  ExternalLink,
  Eye,
  EyeOff,
  AlertCircle,
  Key,
  Database,
  User,
  Package,
  Layers,
  BookOpen
} from 'lucide-react';
import { UserProfile } from './types/form';

const ACTIVE_CLIENT_STORAGE_KEY = 'colorlink_active_client_v1';
const USER_ROLE_STORAGE_KEY = 'colorlink_user_role_v1';
const SUBMITTED_PROJECTS_STORAGE_KEY = 'colorlink_submitted_projects_v1';
const PURGE_FLAG_V10 = 'colorlink_purge_zero_v10_total_reset';

export function purgeAllStoredData(): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const keys = [
        'colorlink_client_orders_history_v1',
        'colorlink_submitted_projects_v1',
        'colorlink_registered_accounts_v1',
        'colorlink_sim_mode_v1',
        'colorlink_active_client_v1',
        'colorlink_active_advisor_v1',
        'colorlink_sent_emails_cache_v1',
        'colorlink_advisor_conversations_v1'
      ];
      keys.forEach((k) => localStorage.removeItem(k));
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const k = localStorage.key(i);
        if (k && (k.startsWith('colorlink_client_progress_') || k.startsWith('colorlink_reset_to_zero_'))) {
          localStorage.removeItem(k);
        }
      }
    }
  } catch {}
}

// Ejecutar inmediatamente al cargar el módulo para que los initializers de useState arranquen estrictamente desde 0
if (typeof window !== 'undefined' && window.localStorage) {
  try {
    if (localStorage.getItem(PURGE_FLAG_V10) !== 'done') {
      purgeAllStoredData();
      localStorage.setItem(PURGE_FLAG_V10, 'done');
      fetch('/api/orders', { method: 'DELETE' }).catch(() => {});
    }
  } catch {}
}

export default function App() {
  // Role switcher: 'client' (default) | 'admin' | 'advisor'
  const [userRole, setUserRole] = useState<'client' | 'admin' | 'advisor'>(() => {
    try {
      const savedRole = localStorage.getItem(USER_ROLE_STORAGE_KEY);
      if (savedRole === 'admin' || savedRole === 'client' || savedRole === 'advisor') {
        return savedRole;
      }
    } catch {}
    return 'client';
  });
  const [showAdminLoginModal, setShowAdminLoginModal] = useState<boolean>(false);
  const [showAdvisorLoginModal, setShowAdvisorLoginModal] = useState<boolean>(false);
  const [activeAdvisor, setActiveAdvisor] = useState<AdvisorData | null>(null);
  const [advisorEmail, setAdvisorEmail] = useState<string>('');
  const [advisorPassword, setAdvisorPassword] = useState<string>('');
  const [showAdvisorPassword, setShowAdvisorPassword] = useState<boolean>(false);
  const [advisorLoginError, setAdvisorLoginError] = useState<string | null>(null);

  const [activeClient, setActiveClient] = useState<UserProfile | null>(() => {
    try {
      if (typeof window !== 'undefined' && localStorage.getItem(PURGE_FLAG_V10) === 'done') {
        const savedClient = localStorage.getItem(ACTIVE_CLIENT_STORAGE_KEY);
        if (savedClient) return JSON.parse(savedClient);
      }
    } catch {}
    return null;
  });

  // Limpieza inicial para comenzar desde 0 (sin usuarios mock ni pedidos de prueba)
  useEffect(() => {
    try {
      if (localStorage.getItem(PURGE_FLAG_V10) !== 'done') {
        purgeAllStoredData();
        localStorage.setItem(PURGE_FLAG_V10, 'done');
        setSubmittedProjects([]);
        setActiveClient(null);
      }
      fetch('/api/orders', { method: 'DELETE' }).catch(() => {});
    } catch {}
  }, []);

  const [adminUsername, setAdminUsername] = useState<string>('');
  const [adminPassword, setAdminPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [showClientAuthModal, setShowClientAuthModal] = useState<boolean>(false);
  const [clientAuthModalMode, setClientAuthModalMode] = useState<'login' | 'register'>('register');
  const [clientAuthCustomMessage, setClientAuthCustomMessage] = useState<string | undefined>(undefined);
  const [showCatalogWhileLoggedIn, setShowCatalogWhileLoggedIn] = useState<boolean>(false);

  useEffect(() => {
    try {
      localStorage.setItem(USER_ROLE_STORAGE_KEY, userRole);
    } catch {}
  }, [userRole]);

  useEffect(() => {
    try {
      if (activeClient) {
        localStorage.setItem(ACTIVE_CLIENT_STORAGE_KEY, JSON.stringify(activeClient));
      } else {
        localStorage.removeItem(ACTIVE_CLIENT_STORAGE_KEY);
      }
    } catch {}
  }, [activeClient]);

  useEffect(() => {
    try {
      if (activeAdvisor) {
        localStorage.setItem('colorlink_active_advisor_v1', JSON.stringify(activeAdvisor));
      } else {
        localStorage.removeItem('colorlink_active_advisor_v1');
      }
    } catch {}
  }, [activeAdvisor]);

  // Lista de proyectos iniciada desde 0
  const [submittedProjects, setSubmittedProjects] = useState<any[]>(() => {
    try {
      if (typeof window !== 'undefined' && localStorage.getItem(PURGE_FLAG_V10) === 'done') {
        const saved = localStorage.getItem(SUBMITTED_PROJECTS_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      }
    } catch {}
    return [];
  });

  useEffect(() => {
    try {
      const lightweight = submittedProjects.map((p: any) => ({
        ...p,
        formData: {
          ...p.formData,
          fotos: (p.formData?.fotos || []).map((f: any) => ({ name: f.name, size: f.size }))
        }
      }));
      localStorage.setItem(SUBMITTED_PROJECTS_STORAGE_KEY, JSON.stringify(lightweight));
    } catch {}
  }, [submittedProjects]);

  // Sincronizar proyectos existentes desde Supabase si las credenciales están configuradas
  useEffect(() => {
    if (isSupabaseConfigured()) {
      fetchSubmittedProjects()
        .then((remoteProjects) => {
          if (remoteProjects && remoteProjects.length > 0) {
            setSubmittedProjects((prev) => {
              // Mantener proyectos remotos y agregar locales que no estén en remotos
              const remoteIds = new Set(remoteProjects.map((p) => p.id));
              const nonDuplicated = prev.filter((p) => !remoteIds.has(p.id));
              return [...remoteProjects, ...nonDuplicated];
            });
          }
        })
        .catch((err) => {
          console.warn('[Supabase] Consulta de proyectos iniciales:', {
            message: err?.message || err,
            code: err?.code,
            details: err?.details,
            hint: err?.hint
          });
        });
    }
  }, []);

  // When a client submits a quote, record it in the admin inbox and save to Supabase
  const handleClientSubmit = async (submittedData: ProjectFormData, preferredOrderId?: string) => {
    const calc = calculateTechnicalRequirements(submittedData);
    const tempId = preferredOrderId || `ORD-CLK-2026-${Date.now().toString().slice(-4)}`;
    const newProject = {
      id: tempId,
      submittedAt: 'Recién ingresado',
      formData: submittedData,
      status: 'Validado' as const,
      totalCOP: calc.presupuesto.totalPresupuesto,
      currentPipelineStep: 8
    };

    // Actualizar UI inmediatamente para experiencia fluida
    setSubmittedProjects((prev) => [newProject, ...prev.filter((p) => p.id !== tempId)]);

    // Guardar en Supabase
    try {
      console.log('[Supabase] Enviando cotización y proyecto a Supabase...', {
        cliente: submittedData.cliente,
        nit: submittedData.nitDocumento,
        ciudad: submittedData.ciudad,
        totalCOP: calc.presupuesto.totalPresupuesto
      });

      const { proyectoId, orderNumber } = await submitProjectToSupabase(submittedData, calc);
      console.log(`[Supabase] Proyecto guardado exitosamente en base de datos. ID: ${proyectoId}, Pedido: ${orderNumber}`);

      const finalId = preferredOrderId || orderNumber || tempId;
      if (finalId !== tempId) {
        setSubmittedProjects((prev) =>
          prev.map((p) => (p.id === tempId ? { ...p, id: finalId } : p))
        );
      }

      // La IA audita automáticamente el pedido al ingresar y lo acepta a preparación con logística asignada
      try {
        const logistics = getLogisticsForCity(submittedData.ciudad);
        const neededCunetes = Math.max(1, Math.ceil((Number(submittedData.areaM2) || 50) / 28));
        const aiMotivo = `Aceptado automáticamente por la IA: Insumos verificados al 100% en CEDI Regional ${submittedData.ciudad || 'Medellín'} (${neededCunetes} cuñetes requeridos para ${submittedData.areaM2} m²). Formulación validada bajo Norma NTC 1335 para ${submittedData.colorAcabado || 'Color Específico'}. Asignado ${logistics.vehiculo} (${logistics.placa}) con el conductor ${logistics.conductor} por ${logistics.corredorRuta}.`;

        saveClientOrderToHistory({
          id: finalId,
          orderNumber: finalId,
          fecha: new Date().toISOString(),
          cliente: submittedData.cliente || submittedData.responsable || 'Cliente Colorlink',
          nit: submittedData.nitDocumento || '',
          responsable: submittedData.responsable || 'Responsable de Obra',
          email: submittedData.emailResponsable || '',
          ciudad: submittedData.ciudad || 'Medellín',
          areaM2: Number(submittedData.areaM2 || 50),
          tipoPintura: submittedData.tipoPintura || 'Pintura Tipo 1 Exterior',
          color: submittedData.colorAcabado || 'Color Específico',
          totalCOP: calc.presupuesto.totalPresupuesto,
          status: 'preparando', // Aceptado automáticamente por la IA para preparación en tintometría
          vehiculo: logistics.vehiculo,
          conductor: logistics.conductor,
          placa: logistics.placa,
          mensaje: aiMotivo,
          detalle: {
            obra: submittedData.cliente || 'Obra Colorlink',
            tipoObra: submittedData.tipoObra || 'Fachada / Obra',
            areaM2: Number(submittedData.areaM2 || 50),
            tipoPintura: submittedData.tipoPintura || 'Pintura Tipo 1 Exterior',
            color: submittedData.colorAcabado || 'Color Específico',
            ciudad: submittedData.ciudad || 'Medellín'
          }
        });
      } catch (e) {
        console.warn('[History Save Error]', e);
      }

      // Enviar correo de confirmación mediante EmailJS si está configurado
      try {
        await sendConfirmationEmail(submittedData, calc, finalId);
      } catch (emailErr) {
        console.warn('[EmailJS] Advertencia al enviar correo de confirmación:', emailErr);
      }

      // Enviar al backend / Vercel para recepción y registro directo en servidor
      try {
        const logistics = getLogisticsForCity(submittedData.ciudad);
        fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderNumber: finalId,
            cliente: submittedData.cliente,
            nit: submittedData.nitDocumento,
            responsable: submittedData.responsable,
            email: submittedData.emailResponsable,
            ciudad: submittedData.ciudad,
            formData: submittedData,
            totalCOP: calc.presupuesto.totalPresupuesto,
            status: 'preparando',
            vehiculo: logistics.vehiculo,
            conductor: logistics.conductor,
            placa: logistics.placa
          })
        }).catch((apiErr) => console.warn('[Vercel API Orders] Envío local/Vercel:', apiErr));
      } catch (e) {}
    } catch (error: any) {
      // Log detallado exacto de Supabase para depuración precisa
      console.error('[Supabase Error] Error exacto al guardar en Supabase:', {
        message: error?.message || (typeof error === 'string' ? error : JSON.stringify(error)),
        code: error?.code,
        details: error?.details,
        hint: error?.hint,
        errorObject: error
      });
    }
  };

  // Si el usuario está en rol asesor, mostramos el Portal de Asesores Comerciales
  if (userRole === 'advisor' && activeAdvisor) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
        <ColorlinkRainbowBar className="h-1.5 w-full" />
        <AdvisorPortal
          currentAdvisor={activeAdvisor}
          onLogout={() => {
            setUserRole('client');
            setActiveAdvisor(null);
          }}
          onSwitchAdvisor={(adv) => setActiveAdvisor(adv)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      {/* Barra de Colores Institucional Colorlink */}
      <ColorlinkRainbowBar className="h-2 w-full" />

      {/* TOP HEADER */}
      <header className="bg-white/95 backdrop-blur-xs border-b border-slate-200/80 sticky top-0 z-40 shadow-2xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-2 sm:py-3.5 gap-2 sm:gap-4">
            {/* Logo y Branding Colorlink con Pingüinito Pintor */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <PenguinLogo size="md" />
              {userRole === 'admin' && (
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xs">
                  Admin
                </span>
              )}
            </div>

            {/* Selector de Rol / Acceso a Administrador */}
            <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
              {userRole === 'client' ? (
                <>
                  {/* Info de contacto cliente */}
                  <div className="hidden lg:flex items-center gap-2 text-xs text-slate-600 border-r border-slate-200/80 pr-3 mr-1 font-semibold">
                    <Phone className="w-3.5 h-3.5 text-sky-600" />
                    <span>Línea Constructoras: (604) 448-0000</span>
                  </div>

                  {!activeClient ? (
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setClientAuthModalMode('login');
                          setClientAuthCustomMessage(undefined);
                          setShowClientAuthModal(true);
                        }}
                        className="px-2.5 sm:px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-sky-700 bg-white hover:bg-slate-50 border border-slate-200/90 rounded-xl transition-all cursor-pointer shadow-2xs active:scale-95 whitespace-nowrap"
                      >
                        Iniciar Sesión
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setClientAuthModalMode('register');
                          setClientAuthCustomMessage('Crea tu cuenta para cotizar, guardar tus compras y emitir tus facturas oficiales.');
                          setShowClientAuthModal(true);
                        }}
                        className="px-2.5 sm:px-3.5 py-1.5 text-xs font-black text-white bg-gradient-to-r from-[#FF5500] to-[#FF007A] hover:brightness-110 rounded-xl transition-all shadow-xs cursor-pointer active:scale-95 whitespace-nowrap"
                      >
                        Registrarse
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <span className="hidden md:inline-flex items-center gap-1.5 text-xs text-slate-700 bg-white border border-slate-200/90 px-3 py-1.5 rounded-xl font-bold shadow-2xs">
                        <User className="w-3.5 h-3.5 text-sky-600" />
                        <span className="truncate max-w-[140px]">{activeClient.responsable || activeClient.empresa}</span>
                      </span>

                      {/* Botón opcional para ver u ocultar el catálogo cuando se requiera consultar */}
                      <button
                        type="button"
                        onClick={() => setShowCatalogWhileLoggedIn(!showCatalogWhileLoggedIn)}
                        className={`px-2.5 sm:px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-2xs active:scale-95 flex items-center gap-1.5 whitespace-nowrap ${
                          showCatalogWhileLoggedIn
                            ? 'bg-orange-50 text-[#FF5500] border border-orange-300 font-extrabold'
                            : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90'
                        }`}
                        title="Ver o consultar el catálogo ilustrado de pinturas"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-[#FF5500]" />
                        <span className="hidden sm:inline">{showCatalogWhileLoggedIn ? 'Ocultar Catálogo' : 'Ver Catálogo'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setShowCatalogWhileLoggedIn(false);
                          const el = document.getElementById('cotizador-colorlink');
                          el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }}
                        className="px-2.5 sm:px-3 py-1.5 text-xs font-black text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 rounded-xl transition-all shadow-xs cursor-pointer active:scale-95 flex items-center gap-1 sm:gap-1.5 whitespace-nowrap"
                      >
                        <Package className="w-3.5 h-3.5" />
                        <span className="hidden xs:inline">Hacer Pedido</span>
                        <span className="xs:hidden">Pedir</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (activeClient) {
                            try {
                              const idPart = (activeClient.email || activeClient.nit || 'default').trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
                              localStorage.removeItem(`colorlink_client_progress_v1_${idPart}`);
                              sessionStorage.removeItem(`colorlink_client_progress_v1_${idPart}`);
                            } catch {}
                          }
                          setActiveClient(null);
                          setShowCatalogWhileLoggedIn(false);
                        }}
                        className="px-2 sm:px-3 py-1.5 text-xs font-bold text-rose-600 hover:text-white bg-white hover:bg-rose-500 border border-rose-200/90 hover:border-rose-500 rounded-xl transition-all flex items-center gap-1 cursor-pointer shadow-2xs active:scale-95 whitespace-nowrap"
                        title="Cerrar sesión"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Salir</span>
                      </button>
                    </div>
                  )}

                  {/* Botón Acceso Administrador: Solo el candado sin texto */}
                  <button
                    type="button"
                    onClick={() => setShowAdminLoginModal(true)}
                    className="p-2 sm:p-2.5 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-800 rounded-xl transition-all border border-slate-200/90 shadow-2xs cursor-pointer active:scale-95 shrink-0"
                    title="Acceso Administrador"
                  >
                    <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-600" />
                  </button>
                </>
              ) : (
                /* Controles cuando está en Modo Administrador */
                <div className="flex items-center gap-2">
                  <span className="hidden sm:inline-flex text-xs text-slate-700 bg-white border border-slate-200 px-3 py-1.5 rounded-xl font-bold shadow-2xs">
                    Ing. Carlos Restrepo
                  </span>
                  <button
                    type="button"
                    onClick={() => setUserRole('client')}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-sky-500 via-sky-600 to-blue-600 hover:opacity-95 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95 whitespace-nowrap"
                  >
                    <span>Volver a Vista Cliente</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {userRole === 'client' ? (
          <>
            {/* PRESENTACIÓN OFICIAL DE TODO LO QUE HAY EN COLORLINK:
                Solo se muestra en la portada antes de iniciar sesión.
                Una vez iniciada la sesión, ya no se muestra (el cliente ingresa directo a su cotizador y pedidos).
                Si el cliente desea consultarlo mientras está autenticado, puede alternarlo con el botón "Ver Catálogo". */}
            {(!activeClient || showCatalogWhileLoggedIn) && (
              <div className="space-y-4 mb-6 animate-fadeIn">
                {activeClient && (
                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-orange-50 via-sky-50 to-white border border-orange-200/90 text-slate-800 text-xs shadow-xs">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-[#FF5500]" />
                      <span>
                        Estás consultando el <strong>Catálogo Ilustrado Colorlink®</strong>.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowCatalogWhileLoggedIn(false)}
                      className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 font-bold rounded-xl border border-slate-200 shadow-2xs cursor-pointer flex items-center gap-1.5 active:scale-95 transition-all text-xs"
                    >
                      <span>Volver al Cotizador</span>
                      <X className="w-3.5 h-3.5 text-slate-500" />
                    </button>
                  </div>
                )}
                <ColorlinkShowcasePresentation
                  activeUser={activeClient}
                  onOpenLogin={() => {
                    setClientAuthModalMode('login');
                    setClientAuthCustomMessage('Inicia sesión para ingresar al cotizador oficial y realizar pedidos a obra.');
                    setShowClientAuthModal(true);
                  }}
                  onOpenRegister={() => {
                    setClientAuthModalMode('register');
                    setClientAuthCustomMessage('Crea tu cuenta de cliente o constructora para acceder al cotizador y realizar pedidos oficiales.');
                    setShowClientAuthModal(true);
                  }}
                  onScrollToCalculator={() => {
                    if (activeClient) {
                      setShowCatalogWhileLoggedIn(false);
                    }
                    const el = document.getElementById('cotizador-colorlink');
                    el?.scrollIntoView({ behavior: 'smooth' });
                    if (!activeClient) {
                      setClientAuthModalMode('login');
                      setClientAuthCustomMessage('Inicia sesión o regístrate para acceder al cotizador y realizar tu pedido oficial.');
                      setShowClientAuthModal(true);
                    }
                  }}
                />
              </div>
            )}

            {/* SECCIÓN DEL COTIZADOR Y PEDIDOS (DESDE DONDE SE VE LA IMAGEN HACIA ABAJO)
                SOLO SE MUESTRA SI INICIAN SESIÓN O SE REGISTRAN */}
            <div id="cotizador-colorlink" className="scroll-mt-6">
              {activeClient ? (
                <StandaloneClientForm
                  activeUser={activeClient}
                  onSuccessSubmit={handleClientSubmit}
                  onRequestAuth={(mode, reason) => {
                    setClientAuthModalMode(mode);
                    setClientAuthCustomMessage(reason);
                    setShowClientAuthModal(true);
                  }}
                  onUserLoggedIn={(user) => {
                    setActiveClient(user);
                  }}
                  onLogout={() => {
                    if (activeClient) {
                      try {
                        const idPart = (activeClient.email || activeClient.nit || 'default').trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
                        localStorage.removeItem(`colorlink_client_progress_v1_${idPart}`);
                        sessionStorage.removeItem(`colorlink_client_progress_v1_${idPart}`);
                      } catch {}
                    }
                    setActiveClient(null);
                  }}
                />
              ) : (
                /* TARJETA DE BLOQUEO AMIGABLE CON INVITACIÓN A INICIAR SESIÓN O REGISTRARSE */
                <div className="relative overflow-hidden rounded-[32px] bg-white border border-slate-200/90 shadow-xl p-8 sm:p-12 text-center max-w-4xl mx-auto my-6 animate-fadeIn">
                  <ColorlinkRainbowBar className="h-2 w-full absolute top-0 left-0" />

                  <div className="max-w-2xl mx-auto space-y-6">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-xs font-bold shadow-2xs">
                      <Lock className="w-3.5 h-3.5 text-[#FF5500]" />
                      <span>Acceso Reservado para Clientes & Constructoras</span>
                    </div>

                    <div className="space-y-3">
                      <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                        Cotizador Oficial y Pedidos a Obra{' '}
                        <span className="bg-gradient-to-r from-[#FF5500] via-[#FF007A] to-[#0099FF] bg-clip-text text-transparent">
                          Colorlink®
                        </span>
                      </h2>
                      <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                        Para calcular metraje con tarifas preferenciales de fábrica, liquidar fletes según tu municipio y emitir órdenes con remisión y factura oficial DIAN, por favor <strong>inicia sesión con tu cuenta</strong> o <strong>regístrate en 30 segundos</strong>.
                      </p>
                    </div>

                    {/* BENEFICIOS DESTACADOS */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-left py-2">
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 shadow-2xs space-y-1.5">
                        <div className="w-9 h-9 rounded-xl bg-orange-100 text-[#FF5500] flex items-center justify-center font-bold text-sm">
                          🏷️
                        </div>
                        <h4 className="font-bold text-xs text-slate-900">Tarifas Mayoristas</h4>
                        <p className="text-[11px] text-slate-600 leading-tight">
                          Descuentos especiales por volumen directo de fábrica para constructoras y pintores.
                        </p>
                      </div>

                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 shadow-2xs space-y-1.5">
                        <div className="w-9 h-9 rounded-xl bg-sky-100 text-[#0099FF] flex items-center justify-center font-bold text-sm">
                          🚚
                        </div>
                        <h4 className="font-bold text-xs text-slate-900">Despacho a Obra</h4>
                        <p className="text-[11px] text-slate-600 leading-tight">
                          Liquidación de flete por ciudad y entrega en camión programada directo al proyecto.
                        </p>
                      </div>

                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 shadow-2xs space-y-1.5">
                        <div className="w-9 h-9 rounded-xl bg-pink-100 text-[#FF007A] flex items-center justify-center font-bold text-sm">
                          🤖
                        </div>
                        <h4 className="font-bold text-xs text-slate-900">Diagnóstico IA Pincelito</h4>
                        <p className="text-[11px] text-slate-600 leading-tight">
                          Cálculo de galones y cuñetes según m² con asesoría técnica en vivo.
                        </p>
                      </div>
                    </div>

                    {/* BOTONES DE ACCIÓN DIRECTOS */}
                    <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
                      <button
                        type="button"
                        onClick={() => {
                          setClientAuthModalMode('login');
                          setClientAuthCustomMessage('Inicia sesión para ingresar al cotizador oficial y realizar pedidos a obra.');
                          setShowClientAuthModal(true);
                        }}
                        className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#FF5500] via-[#FF007A] to-[#FF5500] hover:brightness-110 text-white font-black text-sm shadow-md shadow-orange-500/25 cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-2"
                      >
                        <User className="w-4 h-4" />
                        <span>Iniciar Sesión</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setClientAuthModalMode('register');
                          setClientAuthCustomMessage('Crea tu cuenta empresarial o de cliente para acceder al cotizador y comprar directamente.');
                          setShowClientAuthModal(true);
                        }}
                        className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-2"
                      >
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        <span>Crear Cuenta / Registrarse</span>
                      </button>
                    </div>

                    <p className="text-xs text-slate-400 pt-1">
                      🔒 Tus datos comerciales y fiscales están protegidos bajo la Ley 1581 de Protección de Datos de Colombia.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          /* VISTA EXCLUSIVA DEL ADMINISTRADOR: Caso principal, 15 pasos, bandeja de solicitudes, SQL y human-in-the-loop */
          <AdminBackoffice
            onBackToClientView={() => setUserRole('client')}
            submittedProjects={submittedProjects}
            onClearSubmittedProjects={() => setSubmittedProjects([])}
          />
        )}
      </main>

      {/* MODAL DE INICIO DE SESIÓN DE ADMINISTRADOR */}
      {showAdminLoginModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex flex-col items-center justify-start sm:justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-7 shadow-2xl border border-slate-200 space-y-4 sm:space-y-5 my-auto">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-xs">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Acceso Restringido Colorlink®
                  </h3>
                  <p className="text-xs text-slate-500">
                    Ingreso exclusivo para administradores y dirección técnica
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowAdminLoginModal(false);
                  setLoginError(null);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* FORMULARIO DE LOGIN CON CONTRASEÑA Y USUARIO EXACTOS */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const cleanUser = adminUsername.trim().toLowerCase();
                const cleanPass = adminPassword.trim();

                const validUsers = ['admin@colorlink.com.co', 'admin'];
                const validPass = 'Colorlink2026*';

                if (validUsers.includes(cleanUser) && cleanPass === validPass) {
                  setUserRole('admin');
                  setShowAdminLoginModal(false);
                  setAdminPassword('');
                  setLoginError(null);
                } else {
                  setLoginError('Credenciales incorrectas. Verifique que el usuario sea "admin@colorlink.com.co" y la contraseña sea "Colorlink2026*".');
                }
              }}
              className="space-y-4"
            >
              {loginError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-xs text-rose-800 animate-fadeIn">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{loginError}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Correo Electrónico Administrador:
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={adminUsername}
                    onChange={(e) => {
                      setAdminUsername(e.target.value);
                      if (loginError) setLoginError(null);
                    }}
                    placeholder="admin@colorlink.com.co"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Contraseña de Seguridad:
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={adminPassword}
                    onChange={(e) => {
                      setAdminPassword(e.target.value);
                      if (loginError) setLoginError(null);
                    }}
                    placeholder="••••••••••••"
                    className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* HINT DE PRUEBA RÁPIDA / CREDENCIALES OFICIALES */}
              <div className="p-3 rounded-2xl bg-sky-50/70 border border-sky-200/80 text-[11px] text-sky-950 space-y-1.5">
                <div className="flex items-center justify-between font-bold">
                  <span className="flex items-center gap-1 text-sky-900">
                    <Key className="w-3.5 h-3.5 text-sky-600" /> Credenciales Oficiales de Acceso:
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setAdminUsername('admin@colorlink.com.co');
                      setAdminPassword('Colorlink2026*');
                      setLoginError(null);
                    }}
                    className="text-[10px] bg-sky-200/80 hover:bg-sky-300 text-sky-950 font-bold px-2 py-0.5 rounded-md cursor-pointer transition-colors"
                  >
                    Autocompletar
                  </button>
                </div>
                <p className="text-slate-600">
                  Usuario: <strong className="font-mono text-slate-800">admin@colorlink.com.co</strong><br />
                  Contraseña: <strong className="font-mono text-slate-800">Colorlink2026*</strong>
                </p>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-sky-500 via-sky-600 to-blue-600 hover:brightness-110 text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <ShieldCheck className="w-4 h-4 text-white" />
                  <span>Validar & Entrar al Backoffice</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAdminLoginModal(false);
                    setLoginError(null);
                  }}
                  className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

            {/* MODAL DE INICIO DE SESIÓN / REGISTRO DEL CLIENTE */}
      {showClientAuthModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex flex-col items-center justify-start sm:justify-center p-3 sm:p-4 animate-fadeIn">
          <div className="relative w-full max-w-[430px] my-auto pt-6 pb-6">
            <ColorlinkLoginLanding
              isModal={true}
              initialMode={clientAuthModalMode}
              customMessage={clientAuthCustomMessage}
              onClose={() => setShowClientAuthModal(false)}
              onLoginSuccess={(user) => {
                setActiveClient(user);
                setShowClientAuthModal(false);
                setTimeout(() => {
                  const el = document.getElementById('cotizador-colorlink');
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }, 150);
              }}
              onOpenAdminModal={() => {
                setShowClientAuthModal(false);
                setShowAdminLoginModal(true);
              }}
              onOpenAdvisorModal={() => {
                setShowClientAuthModal(false);
                setShowAdvisorLoginModal(true);
              }}
            />
          </div>
        </div>
      )}

      {/* FOOTER CORPORATIVO */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 space-y-1.5">
          <p className="font-semibold text-slate-700">
            Portal Oficial de Especificación Técnica & Cotizaciones • Colorlink S.A.S.
          </p>
          <p className="text-[11px] text-slate-400">
            {userRole === 'client'
              ? 'Pinturas y Recubrimientos de Alto Rendimiento • Medellín, Colombia'
              : 'Centro de Operaciones y Automatización Backoffice • Colorlink S.A.S.'}
          </p>
        </div>
      </footer>
    </div>
  );
}
