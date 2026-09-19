import { useState } from 'react';
import { StandaloneClientForm } from './components/StandaloneClientForm';
import { AdminBackoffice } from './components/AdminBackoffice';
import { CustomerSupabasePortal } from './components/CustomerSupabasePortal';
import { ColorlinkRainbowBar } from './components/ColorlinkSplashes';
import { PenguinLogo } from './components/PenguinLogo';
import { ColorlinkLoginLanding } from './components/ColorlinkLoginLanding';
import { ProjectFormData } from './types/form';
import { CASE_STUDY_PRESET } from './data/dictionaryData';
import { calculateTechnicalRequirements } from './utils/calculator';
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
  Package
} from 'lucide-react';
import { getActiveSession, logoutFromSupabase, UserProfile } from './lib/supabaseService';

export default function App() {
  // Role switcher: 'client' (default) | 'admin'
  const [userRole, setUserRole] = useState<'client' | 'admin'>('client');
  const [showAdminLoginModal, setShowAdminLoginModal] = useState<boolean>(false);
  const [showCustomerSupabasePortal, setShowCustomerSupabasePortal] = useState<boolean>(false);
  const [activeClient, setActiveClient] = useState<UserProfile | null>(null);
  const [adminUsername, setAdminUsername] = useState<string>('');
  const [adminPassword, setAdminPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Initial projects in admin inbox
  const initialHorizonteCalc = calculateTechnicalRequirements({
    ...CASE_STUDY_PRESET,
    cliente: CASE_STUDY_PRESET.cliente || 'Constructora Horizonte S.A.S.',
    nitDocumento: CASE_STUDY_PRESET.nitDocumento || '900.854.219-3',
    responsable: CASE_STUDY_PRESET.responsable || 'Arq. Valentina Gómez',
    emailResponsable: CASE_STUDY_PRESET.emailResponsable || 'vgomez@constructorahorizonte.com.co',
    telefonoResponsable: CASE_STUDY_PRESET.telefonoResponsable || '+57 312 845 6721',
    canalEntrada: 'Portal Clientes',
    ciudad: 'Medellín',
    tipoObra: 'Fachada Edificio',
    areaM2: 85,
    fechaRequerida: '2026-09-24',
    superficie: 'Concreto / Revoque',
    ambiente: 'Exterior Intemperie',
    condicion: 'Fisuras leves y humedad',
    colorAcabado: 'Gris (Mate)',
    descripcionLibre: 'Mantenimiento preventivo en fachada de edificio de 5 pisos con fisuras superficiales y humedad de lluvia directa.',
    fotos: [{ name: 'fachada_norte_fisuras.jpg', size: '2.4 MB' }],
    observaciones: 'Acceso por andamios colgantes certificados de obra.',
    consentimiento: true
  } as ProjectFormData);

  const [submittedProjects, setSubmittedProjects] = useState([
    {
      id: 'PROJ-HORIZONTE-01',
      submittedAt: 'Hoy, 09:15 AM',
      formData: {
        cliente: 'Constructora Horizonte S.A.S.',
        nitDocumento: '900.854.219-3',
        responsable: 'Arq. Valentina Gómez',
        emailResponsable: 'vgomez@constructorahorizonte.com.co',
        telefonoResponsable: '+57 312 845 6721',
        canalEntrada: 'Portal Clientes' as const,
        ciudad: 'Medellín',
        tipoObra: 'Fachada Edificio' as const,
        areaM2: 85,
        fechaRequerida: '2026-09-24',
        superficie: 'Concreto / Revoque' as const,
        ambiente: 'Exterior Intemperie' as const,
        condicion: 'Fisuras leves y humedad' as const,
        colorAcabado: 'Gris (Mate)',
        descripcionLibre: 'Mantenimiento preventivo en fachada de edificio de 5 pisos con fisuras superficiales y humedad de lluvia directa.',
        fotos: [{ name: 'fachada_norte_fisuras.jpg', size: '2.4 MB' }],
        observaciones: 'Acceso por andamios colgantes certificados de obra.',
        consentimiento: true
      },
      status: 'Validado' as const,
      totalCOP: initialHorizonteCalc.presupuesto.totalPresupuesto,
      currentPipelineStep: 15
    }
  ]);

  // When a client submits a quote, record it in the admin inbox
  const handleClientSubmit = (submittedData: ProjectFormData) => {
    const calc = calculateTechnicalRequirements(submittedData);
    const newProject = {
      id: `PROJ-${Date.now().toString().slice(-4)}`,
      submittedAt: 'Recién ingresado',
      formData: submittedData,
      status: 'Validado' as const,
      totalCOP: calc.presupuesto.totalPresupuesto,
      currentPipelineStep: 8
    };

    setSubmittedProjects((prev) => [newProject, ...prev]);
  };

  // Si el usuario está en rol cliente y no ha iniciado sesión,
  // mostramos la pantalla de inicio con estilo idéntico a la Imagen 1 y el logo de la Imagen 2.
  if (userRole === 'client' && !activeClient) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
        <ColorlinkRainbowBar className="h-1.5 w-full" />
        <ColorlinkLoginLanding
          onLoginSuccess={(user) => {
            setActiveClient(user);
          }}
          onOpenAdminModal={() => setShowAdminLoginModal(true)}
        />

        {/* Modal de Acceso de Administrador */}
        {showAdminLoginModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-xs animate-fadeIn">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5">
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
                    Usuario Administrador:
                  </label>
                  <input
                    type="text"
                    required
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                    placeholder="admin@colorlink.com.co"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">
                    Contraseña de Acceso:
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="Colorlink2026*"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAdminLoginModal(false);
                      setLoginError(null);
                    }}
                    className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Ingresar como Admin</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-sans selection:bg-[#E5007D] selection:text-white">
      {/* Barra de Colores Institucional Colorlink */}
      <ColorlinkRainbowBar className="h-2 w-full" />

      {/* TOP HEADER */}
      <header className="bg-white/95 backdrop-blur-xs border-b border-slate-200/80 sticky top-0 z-40 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-3.5 gap-4">
            {/* Logo y Branding Colorlink con Pingüinito Pintor */}
            <div className="flex items-center gap-3">
              <PenguinLogo size="md" />
              {userRole === 'admin' && (
                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-slate-900 text-amber-300 border border-amber-400/40">
                  Modo Administrador
                </span>
              )}
            </div>

            {/* Selector de Rol / Acceso a Administrador */}
            <div className="flex items-center gap-2 sm:gap-3">
              {userRole === 'client' ? (
                <>
                  {/* Info de contacto cliente */}
                  <div className="hidden lg:flex items-center gap-2 text-xs text-slate-600 border-r border-slate-200/80 pr-3 mr-1 font-semibold">
                    <Phone className="w-3.5 h-3.5 text-[#FF6A00]" />
                    <span>Línea Constructoras: (604) 448-0000</span>
                  </div>

                  {activeClient && (
                    <div className="flex items-center gap-2 mr-1">
                      <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-slate-700 bg-white border border-slate-200/90 px-3 py-1.5 rounded-xl font-bold shadow-2xs">
                        <User className="w-3.5 h-3.5 text-[#E5007D]" />
                        <span className="truncate max-w-[160px]">{activeClient.responsable || activeClient.empresa}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          logoutFromSupabase();
                          setActiveClient(null);
                        }}
                        className="px-3 py-1.5 text-xs font-bold text-rose-600 hover:text-white bg-white hover:bg-rose-500 border border-rose-200/90 hover:border-rose-500 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95"
                        title="Cerrar sesión y volver a la pantalla del pingüino"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Cerrar Sesión</span>
                      </button>
                    </div>
                  )}

                  {/* Botón Acceso Administrador: Solo el candado sin texto */}
                  <button
                    type="button"
                    onClick={() => setShowAdminLoginModal(true)}
                    className="p-2.5 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-800 rounded-xl transition-all border border-slate-200/90 shadow-2xs cursor-pointer active:scale-95"
                    title="Acceso Administrador"
                  >
                    <Lock className="w-4 h-4 text-amber-500" />
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
                    className="px-4 py-2 bg-gradient-to-r from-[#E5007D] via-[#6A0DAD] to-[#009FE3] hover:opacity-95 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
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
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {userRole === 'client' ? (
          /* VISTA EXCLUSIVA DEL CLIENTE: Solo el formulario con su propia IA integrada */
          <StandaloneClientForm
            onSuccessSubmit={handleClientSubmit}
            onLogout={() => {
              logoutFromSupabase();
              setActiveClient(null);
            }}
          />
        ) : (
          /* VISTA EXCLUSIVA DEL ADMINISTRADOR: Caso principal, 15 pasos, bandeja de solicitudes, SQL y human-in-the-loop */
          <AdminBackoffice
            onBackToClientView={() => setUserRole('client')}
            submittedProjects={submittedProjects}
          />
        )}
      </main>

      {/* MODAL DE INICIO DE SESIÓN DE ADMINISTRADOR */}
      {showAdminLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5">
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
                  Usuario Administrador:
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={adminUsername}
                    onChange={(e) => {
                      setAdminUsername(e.target.value);
                      if (loginError) setLoginError(null);
                    }}
                    placeholder="admin@colorlink.com.co"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 transition-all font-mono"
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
                    className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 transition-all font-mono"
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
              <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-[11px] text-amber-950 space-y-1.5">
                <div className="flex items-center justify-between font-bold">
                  <span className="flex items-center gap-1 text-amber-900">
                    <Key className="w-3.5 h-3.5 text-amber-700" /> Credenciales Oficiales de Acceso:
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setAdminUsername('admin@colorlink.com.co');
                      setAdminPassword('Colorlink2026*');
                      setLoginError(null);
                    }}
                    className="text-[10px] bg-amber-200/80 hover:bg-amber-300 text-amber-950 font-bold px-2 py-0.5 rounded-md cursor-pointer transition-colors"
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
                  className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <ShieldCheck className="w-4 h-4 text-amber-300" />
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

      {/* MODAL PORTAL DE CLIENTES SUPABASE */}
      <CustomerSupabasePortal
        isOpen={showCustomerSupabasePortal}
        onClose={() => {
          setShowCustomerSupabasePortal(false);
          setActiveClient(getActiveSession());
        }}
        onSessionChange={(user) => setActiveClient(user)}
      />

      {/* FOOTER CORPORATIVO */}
      <footer className="bg-slate-900 border-t border-slate-800 py-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 space-y-1.5">
          <p className="font-semibold text-slate-300">
            Portal Oficial de Especificación Técnica & Cotizaciones • Colorlink S.A.S.
          </p>
          <p className="text-[11px] text-slate-500">
            {userRole === 'client'
              ? 'Pinturas y Recubrimientos de Alto Rendimiento • Medellín, Colombia'
              : 'Centro de Operaciones y Automatización Backoffice • Colorlink S.A.S.'}
          </p>
        </div>
      </footer>
    </div>
  );
}
