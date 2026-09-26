import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, Building, User, Phone, Check, ArrowRight, ShieldCheck } from 'lucide-react';
import { ColorlinkPenguin } from './ColorlinkPenguin';
import { UserProfile } from '../types/form';
import { supabase } from '../lib/supabase';
import paintSplatterBg from '../assets/images/paint_splatter_bg_1788742862980.jpg';

interface ColorlinkLoginLandingProps {
  onLoginSuccess: (user: UserProfile, isSimulation?: boolean) => void;
  onOpenAdminModal: () => void;
}

export function ColorlinkLoginLanding({
  onLoginSuccess,
  onOpenAdminModal
}: ColorlinkLoginLandingProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  
  // Login fields
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  
  // Register fields
  const [regEmpresa, setRegEmpresa] = useState('');
  const [regNit, setRegNit] = useState('');
  const [regResponsable, setRegResponsable] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regTelefono, setRegTelefono] = useState('');
  const [regPassword, setRegPassword] = useState('');
  
  // Feedback
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [forgotPasswordMsg, setForgotPasswordMsg] = useState(false);

  // Activación de la simulación con el punto chiquito multicolor
  const handleTriggerSimulation = () => {
    const simProfile: UserProfile = {
      id: 'horizonte-sim-001',
      empresa: 'Constructora Horizonte S.A.S.',
      nit: '900854219',
      responsable: 'Arq. Valentina Gómez',
      email: 'vgomez@constructorahorizonte.com.co',
      telefono: '+57 312 456 7890',
      ciudad: 'Medellín',
      createdAt: new Date().toISOString()
    };
    onLoginSuccess(simProfile, true);
  };

  // Entrada directa como Invitado / Sin cuenta (Modo Real no simulado)
  const handleGuestEntry = () => {
    const guestProfile: UserProfile = {
      id: `guest-${Date.now()}`,
      empresa: '',
      nit: '',
      responsable: '',
      email: '',
      telefono: '',
      ciudad: '',
      createdAt: new Date().toISOString()
    };
    onLoginSuccess(guestProfile, false);
  };

  // Acción de Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const emailToUse = username.trim();
    const passToUse = password.trim();

    if (!emailToUse || !passToUse) {
      setErrorMessage('Por favor ingresa tu correo y contraseña, o entra como invitado.');
      return;
    }

    setLoading(true);
    try {
      // 1. Intentar autenticar con Supabase Auth si coincide
      let authUser: any = null;
      try {
        const { data: authData } = await supabase.auth.signInWithPassword({
          email: emailToUse,
          password: passToUse
        });
        authUser = authData?.user;
      } catch {
        // Continuar verificando en tabla de clientes
      }

      // 2. Buscar datos del cliente en la tabla clientes
      const nitQuery = emailToUse.replace(/[.\-\s]/g, '');
      const { data: clientRow } = await supabase
        .from('clientes')
        .select('*')
        .or(`email_responsable.ilike.${emailToUse},nit_documento.eq.${nitQuery},nombre_razon_social.ilike.%${emailToUse}%`)
        .maybeSingle();

      const userProfile: UserProfile = {
        id: clientRow?.id || authUser?.id || `usr-${Date.now()}`,
        empresa: clientRow?.nombre_razon_social || emailToUse.split('@')[0],
        nit: clientRow?.nit_documento || '',
        responsable: clientRow?.responsable || emailToUse.split('@')[0],
        email: clientRow?.email_responsable || emailToUse,
        telefono: clientRow?.telefono_responsable || '',
        ciudad: 'Medellín',
        createdAt: clientRow?.created_at || new Date().toISOString()
      };

      onLoginSuccess(userProfile, false);
    } catch (err: any) {
      console.error('[Login Error]', err);
      setErrorMessage('Error al verificar credenciales.');
    } finally {
      setLoading(false);
    }
  };

  // Acción de Registro
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!regEmail || !regPassword) {
      setErrorMessage('Por favor ingresa correo y contraseña.');
      return;
    }

    setLoading(true);
    try {
      const nitLimpio = (regNit || '').replace(/[.\-\s]/g, '');

      // 1. Intentar registrar en Supabase Auth
      let authUserId: string | null = null;
      try {
        const { data: authData } = await supabase.auth.signUp({
          email: regEmail,
          password: regPassword,
          options: {
            data: {
              empresa: regEmpresa,
              responsable: regResponsable,
              nit: nitLimpio
            }
          }
        });
        if (authData?.user?.id) {
          authUserId = authData.user.id;
        }
      } catch (authErr) {
        console.warn('[Supabase Auth] Registro Auth:', authErr);
      }

      // 2. Guardar el nuevo cliente en la tabla 'clientes' de Supabase
      let clienteId: string | null = null;
      let existingClient: any = null;

      if (nitLimpio) {
        const { data } = await supabase
          .from('clientes')
          .select('*')
          .eq('nit_documento', nitLimpio)
          .maybeSingle();
        existingClient = data;
      }

      if (!existingClient && regEmail) {
        const { data } = await supabase
          .from('clientes')
          .select('*')
          .eq('email_responsable', regEmail)
          .maybeSingle();
        existingClient = data;
      }

      if (existingClient) {
        clienteId = existingClient.id;
        console.log('[Supabase] Cliente ya registrado previamente:', clienteId);
      } else {
        const { data: newClient, error: clientErr } = await supabase
          .from('clientes')
          .insert({
            auth_user_id: authUserId,
            nombre_razon_social: regEmpresa || 'Cliente Registrado',
            nit_documento: nitLimpio || `NIT-${Date.now().toString().slice(-6)}`,
            responsable: regResponsable || regEmail.split('@')[0],
            email_responsable: regEmail,
            telefono_responsable: regTelefono || null,
            canal_entrada: 'Registro Portal Web'
          })
          .select('*')
          .single();

        if (clientErr) {
          console.error('[Supabase Clientes] Error al insertar cliente:', clientErr);
          throw clientErr;
        }
        clienteId = newClient.id;
        console.log('[Supabase] Cliente guardado exitosamente en tabla clientes:', clienteId);
      }

      const userProfile: UserProfile = {
        id: clienteId || `usr-${Date.now()}`,
        empresa: regEmpresa || existingClient?.nombre_razon_social || '',
        nit: nitLimpio || existingClient?.nit_documento || '',
        responsable: regResponsable || existingClient?.responsable || regEmail.split('@')[0],
        email: regEmail,
        telefono: regTelefono || existingClient?.telefono_responsable || '',
        ciudad: 'Medellín',
        createdAt: new Date().toISOString()
      };

      onLoginSuccess(userProfile, false);
    } catch (err: any) {
      console.error('[Registro Error]', err);
      setErrorMessage(err?.message || 'Error al conectar con la base de datos de Supabase.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 overflow-x-hidden bg-gradient-to-br from-slate-100 via-sky-50 to-pink-50">
      {/* IMAGEN Y MANCHAS DE PINTURA ARTÍSTICAS DE FONDO */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
        {/* Imagen de fondo generada con manchas y salpicaduras de pintura multicolor */}
        <img
          src={paintSplatterBg}
          alt="Paint Splatter Background"
          className="w-full h-full object-cover opacity-60 scale-105"
          referrerPolicy="no-referrer"
        />

        {/* Gradiente suave para asegurar legibilidad de la tarjeta */}
        <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px]" />

        {/* Mancha de pintura 1: Cyan / Turquesa Eléctrico Superior Izquierda */}
        <svg
          className="absolute -top-10 -left-10 w-72 h-72 opacity-85"
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M45,85 C20,55 60,25 95,35 C130,45 155,20 180,50 C205,80 180,120 190,150 C200,180 160,200 125,180 C90,160 55,190 35,155 C15,120 70,115 45,85 Z"
            fill="#00d2ff"
          />
          <circle cx="25" cy="40" r="10" fill="#00d2ff" />
          <circle cx="55" cy="18" r="6" fill="#00b4d8" />
          <circle cx="10" cy="115" r="7.5" fill="#00d2ff" />
          <circle cx="210" cy="65" r="5" fill="#0077b6" />
          <circle cx="110" cy="195" r="6" fill="#00b4d8" />
        </svg>

        {/* Mancha de pintura 2: Magenta / Fucsia Vibrante Superior Derecha */}
        <svg
          className="absolute -top-8 -right-8 w-80 h-80 opacity-80"
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M135,40 C165,20 195,50 185,85 C175,120 205,150 170,175 C135,200 100,175 70,185 C40,195 20,155 35,120 C50,85 30,55 65,35 C100,15 105,60 135,40 Z"
            fill="#ec4899"
          />
          <circle cx="195" cy="35" r="8" fill="#ec4899" />
          <circle cx="165" cy="15" r="5" fill="#f43f5e" />
          <circle cx="205" cy="95" r="6" fill="#ec4899" />
          <circle cx="45" cy="190" r="7" fill="#f43f5e" />
          <circle cx="25" cy="165" r="4.5" fill="#ec4899" />
        </svg>

        {/* Mancha de pintura 3: Amarillo Sol / Naranja en la parte inferior izquierda */}
        <svg
          className="absolute -bottom-12 -left-8 w-80 h-80 opacity-85"
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M50,110 C30,70 75,40 110,50 C145,60 170,30 190,70 C210,110 180,140 170,175 C160,210 115,195 85,185 C55,175 25,190 20,150 C15,110 70,150 50,110 Z"
            fill="#f59e0b"
          />
          <circle cx="15" cy="90" r="9" fill="#fbbf24" />
          <circle cx="35" cy="60" r="6" fill="#f59e0b" />
          <circle cx="195" cy="180" r="7" fill="#f97316" />
          <circle cx="175" cy="205" r="4" fill="#fbbf24" />
          <circle cx="75" cy="205" r="6" fill="#f59e0b" />
        </svg>

        {/* Mancha de pintura 4: Púrpura / Violeta Intenso en la parte inferior derecha */}
        <svg
          className="absolute -bottom-16 -right-12 w-88 h-88 opacity-80"
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M115,165 C145,180 180,150 170,115 C160,80 190,50 155,25 C120,0 85,30 55,20 C25,10 5,50 25,85 C45,120 20,150 55,170 C90,190 85,150 115,165 Z"
            fill="#8b5cf6"
          />
          <circle cx="180" cy="130" r="8" fill="#8b5cf6" />
          <circle cx="195" cy="100" r="5" fill="#a855f7" />
          <circle cx="15" cy="70" r="6" fill="#7c3aed" />
          <circle cx="130" cy="195" r="7" fill="#8b5cf6" />
        </svg>

        {/* Salpicaduras y gotas de pintura flotantes centrales */}
        <div className="absolute top-1/4 left-1/5 w-4 h-4 rounded-full bg-yellow-400 shadow-sm opacity-90" />
        <div className="absolute top-1/3 right-1/4 w-3.5 h-3.5 rounded-full bg-cyan-400 shadow-sm opacity-85" />
        <div className="absolute bottom-1/3 left-1/6 w-5 h-5 rounded-full bg-pink-500 shadow-sm opacity-80" />
        <div className="absolute bottom-1/4 right-1/5 w-3 h-3 rounded-full bg-emerald-400 shadow-sm opacity-85" />
        <div className="absolute top-2/3 right-1/3 w-4 h-4 rounded-full bg-amber-400 shadow-sm opacity-75" />
      </div>

      {/* CABECERA DE MARCA SUPERIOR: COLORLINK ® Pinturas & Tintometría */}
      <div className="relative z-10 mb-6 sm:mb-8 text-center flex flex-col items-center">
        <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-md px-5 py-2 rounded-full shadow-lg border border-white/40 mb-2">
          <span className="font-black text-xl sm:text-2xl tracking-tight bg-gradient-to-r from-blue-700 via-indigo-600 to-pink-600 bg-clip-text text-transparent">
            COLORLINK
          </span>
          <span className="text-[11px] font-black text-pink-500 bg-pink-50 px-1.5 py-0.5 rounded-md border border-pink-200">
            ®
          </span>
          <span className="text-slate-300 font-light">|</span>
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Pinturas & Tintometría
          </span>
        </div>
      </div>

      {/* TARJETA FLOTANTE BLANCA CON ESQUINAS REDONDEADAS (Estilo Imagen 1) */}
      <div className="relative z-10 w-full max-w-[430px] bg-white rounded-[36px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.4)] px-6 sm:px-9 pb-8 pt-14 sm:pt-16 border border-white/80 transition-all">
        {/* BADGE CIRCULAR SUPERPUESTO CON EL PINGÜINITO TIERNO (Imagen 2) */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex items-center justify-center">
          <div className="p-1.5 rounded-full bg-gradient-to-tr from-[#FFD100] via-[#FF6A00] via-[#E5007D] via-[#6A0DAD] to-[#009FE3] shadow-xl">
            <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-full bg-white flex items-center justify-center p-1.5 overflow-hidden border-2 border-white shadow-inner">
              {/* Mascota Pingüino Colorlink */}
              <ColorlinkPenguin size="xl" className="transform hover:scale-105 transition-transform" />
            </div>
          </div>
        </div>

        {/* TÍTULO PRINCIPAL CON DEGRADADO VIBRANTE COLORIDO */}
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-[#FF6A00] via-[#E5007D] to-[#6A0DAD] bg-clip-text text-transparent tracking-tight">
            {mode === 'login' ? 'Inicia sesión ahora' : 'Crear cuenta nueva'}
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-semibold">
            {mode === 'login'
              ? 'Accede para gestionar tus pedidos de pintura y cotizaciones'
              : 'Ingresa los datos para registrar tu empresa'}
          </p>
        </div>

        {/* MENSAJE DE ERROR O ALERTA */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 text-center font-medium">
            {errorMessage}
          </div>
        )}

        {forgotPasswordMsg && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800 text-center">
            Para restablecer tu contraseña o consultar tus datos corporativos, comunícate al PBX <strong>(604) 448-0000</strong> o ingresa con la cuenta demo.
          </div>
        )}

        {mode === 'login' ? (
          /* FORMULARIO DE INICIO DE SESIÓN CON TOQUES COLORIDOS */
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Campo Username */}
            <div className="space-y-1.5 text-left">
              <label className="block text-xs font-bold text-slate-600 pl-2">
                Username *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your Username (ej: Constructora Horizonte)"
                  className="w-full bg-[#f8fafc] hover:bg-slate-100 focus:bg-white text-slate-800 placeholder:text-slate-400 text-sm font-medium px-5 py-3.5 rounded-full border border-slate-200 focus:border-[#E5007D] focus:ring-2 focus:ring-[#E5007D]/30 transition-all outline-none"
                />
              </div>
            </div>

            {/* Campo Password */}
            <div className="space-y-1.5 text-left">
              <label className="block text-xs font-bold text-slate-600 pl-2">
                Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your Password"
                  className="w-full bg-[#f8fafc] hover:bg-slate-100 focus:bg-white text-slate-800 placeholder:text-slate-400 text-sm font-medium px-5 py-3.5 pr-11 rounded-full border border-slate-200 focus:border-[#E5007D] focus:ring-2 focus:ring-[#E5007D]/30 transition-all outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Checkbox Remember me */}
            <div className="flex items-center pt-1 pl-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-600 select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-[#E5007D] rounded border-slate-300 focus:ring-[#E5007D] cursor-pointer"
                />
                <span>Remember me</span>
              </label>
            </div>

            {/* BOTÓN PRINCIPAL: ACCESO COLORIDO Y VIBRANTE */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-gradient-to-r from-[#FF6A00] via-[#E5007D] to-[#6A0DAD] hover:from-[#FF7A10] hover:via-[#F00084] hover:to-[#7B1FA2] text-white font-black text-sm tracking-widest uppercase py-3.5 sm:py-4 rounded-full shadow-[0_10px_25px_-5px_rgba(229,0,125,0.5)] hover:shadow-[0_15px_30px_-5px_rgba(229,0,125,0.6)] transition-all active:scale-[0.98] cursor-pointer"
            >
              {loading ? 'ACCEDIENDO...' : 'ACCESO'}
            </button>

            {/* ENTRADA DIRECTA: COTIZAR SIN INICIAR SESIÓN */}
            <div className="pt-1">
              <button
                type="button"
                onClick={handleGuestEntry}
                className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-full transition-all border border-slate-200 shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Cotizar directamente sin iniciar sesión</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#009FE3]" />
              </button>
            </div>

            {/* ENLACES INFERIORES VIBRANTES */}
            <div className="flex items-center justify-between text-xs font-bold pt-2 px-1">
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setErrorMessage(null);
                }}
                className="text-[#E5007D] hover:text-[#FF6A00] hover:underline cursor-pointer transition-colors"
              >
                ¿No tienes una cuenta?
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setForgotPasswordMsg(true)}
                  className="text-slate-500 hover:text-slate-800 hover:underline cursor-pointer"
                >
                  ¿Se te olvidó tu contraseña?
                </button>

                {/* PUNTO CHIQUITO COLORIDO: Al oprimirse activa la simulación */}
                <button
                  type="button"
                  onClick={handleTriggerSimulation}
                  className="w-3 h-3 rounded-full bg-gradient-to-r from-amber-400 via-rose-500 to-violet-500 hover:scale-150 transition-all cursor-pointer shadow-xs focus:outline-none"
                  title="Simulación"
                  aria-label="Simulación"
                />
              </div>
            </div>
          </form>
        ) : (
          /* FORMULARIO DE REGISTRO NUEVO CLIENTE */
          <form onSubmit={handleRegister} className="space-y-3">
            <div className="space-y-1 text-left">
              <label className="block text-[11px] font-semibold text-slate-500 pl-2">
                Empresa o Razón Social *
              </label>
              <input
                type="text"
                value={regEmpresa}
                onChange={(e) => setRegEmpresa(e.target.value)}
                placeholder="Ej: Inversiones y Obras del Valle"
                className="w-full bg-[#f1f3f5] text-slate-800 placeholder:text-slate-400 text-xs font-medium px-4 py-3 rounded-2xl border-0 focus:ring-2 focus:ring-[#20b8dc] outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2 text-left">
              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-slate-500 pl-2">
                  NIT *
                </label>
                <input
                  type="text"
                  value={regNit}
                  onChange={(e) => setRegNit(e.target.value)}
                  placeholder="900854219"
                  className="w-full bg-[#f1f3f5] text-slate-800 text-xs font-medium px-4 py-3 rounded-2xl border-0 focus:ring-2 focus:ring-[#20b8dc] outline-none"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-slate-500 pl-2">
                  Contacto *
                </label>
                <input
                  type="text"
                  value={regResponsable}
                  onChange={(e) => setRegResponsable(e.target.value)}
                  placeholder="Arq. o Ing."
                  className="w-full bg-[#f1f3f5] text-slate-800 text-xs font-medium px-4 py-3 rounded-2xl border-0 focus:ring-2 focus:ring-[#20b8dc] outline-none"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-left">
              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-slate-500 pl-2">
                  Correo Electrónico *
                </label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="proyectos@empresa.com"
                  className="w-full bg-[#f1f3f5] text-slate-800 text-xs font-medium px-4 py-3 rounded-2xl border-0 focus:ring-2 focus:ring-[#20b8dc] outline-none"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-slate-500 pl-2">
                  Teléfono / Celular
                </label>
                <input
                  type="tel"
                  value={regTelefono}
                  onChange={(e) => setRegTelefono(e.target.value)}
                  placeholder="+57 300 123 4567"
                  className="w-full bg-[#f1f3f5] text-slate-800 text-xs font-medium px-4 py-3 rounded-2xl border-0 focus:ring-2 focus:ring-[#20b8dc] outline-none"
                />
              </div>
            </div>

            <div className="space-y-1 text-left">
              <label className="block text-[11px] font-semibold text-slate-500 pl-2">
                Contraseña para ingresar *
              </label>
              <input
                type="password"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full bg-[#f1f3f5] text-slate-800 text-xs font-medium px-4 py-3 rounded-2xl border-0 focus:ring-2 focus:ring-[#20b8dc] outline-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-3 bg-gradient-to-r from-[#FF6A00] via-[#E5007D] to-[#6A0DAD] hover:from-[#FF7A10] hover:via-[#F00084] hover:to-[#7B1FA2] text-white font-black text-sm tracking-wider uppercase py-3.5 rounded-full shadow-[0_10px_25px_-5px_rgba(229,0,125,0.5)] hover:shadow-[0_15px_30px_-5px_rgba(229,0,125,0.6)] transition-all active:scale-[0.98] cursor-pointer"
            >
              {loading ? 'REGISTRANDO...' : 'REGISTRARME Y ENTRAR'}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMessage(null);
                }}
                className="text-xs font-bold text-[#E5007D] hover:text-[#FF6A00] hover:underline cursor-pointer transition-colors"
              >
                ¿Ya tienes una cuenta? Inicia sesión
              </button>
            </div>
          </form>
        )}

        {/* Punto chiquito colorido en la tarjeta */}
        <button
          type="button"
          onClick={handleTriggerSimulation}
          className="absolute bottom-3.5 right-4 w-3 h-3 rounded-full bg-gradient-to-r from-amber-400 via-rose-500 to-violet-500 hover:scale-150 transition-all cursor-pointer shadow-xs focus:outline-none"
          title="Simulación rápida"
          aria-label="Simulación"
        />
      </div>

      {/* PIE DE PÁGINA CON ACCESO ADMINISTRADOR DISCRETO */}
      <div className="relative z-10 mt-6 flex items-center justify-between w-full max-w-[430px] px-2 text-[11px] text-slate-500 font-medium">
        <span>© 2026 COLORLINK Pinturas & Tintometría</span>
        <button
          type="button"
          onClick={onOpenAdminModal}
          className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 bg-white/80 hover:bg-white px-2.5 py-1 rounded-xl border border-slate-200/90 shadow-2xs backdrop-blur-xs transition-colors cursor-pointer"
          title="Acceso restringido para personal técnico y comercial"
        >
          <Lock className="w-3 h-3 text-amber-500" />
          <span>Acceso Administrador</span>
        </button>
      </div>
    </div>
  );
}
