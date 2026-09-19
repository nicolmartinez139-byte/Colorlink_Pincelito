import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, Building, User, Phone, Check, ArrowRight, ShieldCheck } from 'lucide-react';
import { ColorlinkPenguin } from './ColorlinkPenguin';
import { loginInSupabase, registerInSupabase, UserProfile } from '../lib/supabaseService';
import paintSplatterBg from '../assets/images/paint_splatter_bg_1788742862980.jpg';

interface ColorlinkLoginLandingProps {
  onLoginSuccess: (user: UserProfile) => void;
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

  // Activación de la simulación con el punto chiquito azul
  const handleTriggerSimulation = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await loginInSupabase('vgomez@constructorahorizonte.com.co', '123456');
      if (res.success && res.user) {
        onLoginSuccess(res.user);
      } else {
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
        onLoginSuccess(simProfile);
      }
    } catch {
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
      onLoginSuccess(simProfile);
    } finally {
      setLoading(false);
    }
  };

  // Acción de Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const emailToUse = username.trim() || 'vgomez@constructorahorizonte.com.co';
    const passToUse = password.trim() || '123456';

    setLoading(true);
    try {
      const res = await loginInSupabase(emailToUse, passToUse);
      if (res.success && res.user) {
        onLoginSuccess(res.user);
      } else {
        setErrorMessage(res.error || 'Credenciales inválidas. Revisa tu usuario y contraseña.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al iniciar sesión.');
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
      const res = await registerInSupabase(regEmail, regPassword, {
        empresa: regEmpresa || 'Constructora Cliente',
        nit: regNit || '900123456',
        responsable: regResponsable || regEmail.split('@')[0],
        telefono: regTelefono || '+57 300 000 0000',
        ciudad: 'Medellín'
      });

      if (res.success && res.user) {
        onLoginSuccess(res.user);
      } else {
        setErrorMessage(res.error || 'No se pudo crear la cuenta.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al registrarse.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 overflow-x-hidden bg-[#1e144a]">
      {/* IMAGEN Y MANCHAS DE PINTURA ARTÍSTICAS DE FONDO */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
        {/* Imagen de fondo generada con manchas y salpicaduras de pintura multicolor */}
        <img
          src={paintSplatterBg}
          alt="Paint Splatter Background"
          className="w-full h-full object-cover opacity-90 scale-105"
          referrerPolicy="no-referrer"
        />

        {/* Gradiente suave para asegurar legibilidad de la tarjeta */}
        <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-[1px]" />

        {/* Mancha de pintura 1: Cyan / Turquesa Eléctrico Superior Izquierda */}
        <svg
          className="absolute -top-10 -left-10 w-72 h-72 opacity-85 animate-pulse"
          style={{ animationDuration: '6s' }}
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
          <div className="p-1.5 rounded-full bg-gradient-to-tr from-cyan-400 via-indigo-500 to-fuchsia-500 shadow-xl">
            <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-full bg-white flex items-center justify-center p-1.5 overflow-hidden border-2 border-white shadow-inner">
              {/* Mascota Pingüino Colorlink */}
              <ColorlinkPenguin size="xl" className="transform hover:scale-105 transition-transform" />
            </div>
          </div>
        </div>

        {/* TÍTULO PRINCIPAL */}
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#159cc4] tracking-tight">
            {mode === 'login' ? 'Inicia sesión ahora' : 'Crear cuenta nueva'}
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            {mode === 'login'
              ? 'Accede para gestionar tus pedidos y cotizaciones'
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
          <div className="mb-4 p-3 bg-sky-50 border border-sky-200 rounded-2xl text-xs text-sky-800 text-center">
            Para restablecer tu contraseña o consultar tus datos corporativos, comunícate al PBX <strong>(604) 448-0000</strong> o ingresa con la cuenta demo.
          </div>
        )}

        {mode === 'login' ? (
          /* FORMULARIO DE INICIO DE SESIÓN (Idéntico a la Imagen 1) */
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Campo Username */}
            <div className="space-y-1.5 text-left">
              <label className="block text-xs font-semibold text-slate-500 pl-2">
                Username *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your Username (ej: Constructora Horizonte)"
                  className="w-full bg-[#f1f3f5] hover:bg-[#e9ecef] focus:bg-white text-slate-800 placeholder:text-slate-400 text-sm font-medium px-5 py-3.5 rounded-full border-0 focus:ring-2 focus:ring-[#20b8dc] transition-all outline-none"
                />
              </div>
            </div>

            {/* Campo Password */}
            <div className="space-y-1.5 text-left">
              <label className="block text-xs font-semibold text-slate-500 pl-2">
                Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your Password"
                  className="w-full bg-[#f1f3f5] hover:bg-[#e9ecef] focus:bg-white text-slate-800 placeholder:text-slate-400 text-sm font-medium px-5 py-3.5 pr-11 rounded-full border-0 focus:ring-2 focus:ring-[#20b8dc] transition-all outline-none"
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
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-500 select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-[#20b8dc] rounded border-slate-300 focus:ring-[#20b8dc] cursor-pointer"
                />
                <span>Remember me</span>
              </label>
            </div>

            {/* BOTÓN PRINCIPAL: ACCESO */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-[#20b8dc] hover:bg-[#18a2c2] active:bg-[#148ea9] text-white font-black text-sm tracking-widest uppercase py-3.5 sm:py-4 rounded-full shadow-[0_8px_20px_-4px_rgba(32,184,220,0.6)] hover:shadow-xl transition-all active:scale-[0.98] cursor-pointer"
            >
              {loading ? 'ACCEDIENDO...' : 'ACCESO'}
            </button>

            {/* ENLACES INFERIORES: ¿No tienes una cuenta? / ¿Se te olvidó tu contraseña? */}
            <div className="flex items-center justify-between text-xs font-bold pt-2 px-1 text-[#159cc4]">
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setErrorMessage(null);
                }}
                className="hover:underline cursor-pointer"
              >
                ¿No tienes una cuenta?
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setForgotPasswordMsg(true)}
                  className="hover:underline cursor-pointer text-right"
                >
                  ¿Se te olvidó tu contraseña?
                </button>

                {/* PUNTO CHIQUITO DE AZUL: Al oprimirse activa la simulación */}
                <button
                  type="button"
                  onClick={handleTriggerSimulation}
                  className="w-2.5 h-2.5 rounded-full bg-[#20b8dc] hover:bg-blue-600 hover:scale-150 transition-all cursor-pointer shadow-xs focus:outline-none"
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

            <div className="space-y-1 text-left">
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
              className="w-full mt-3 bg-[#20b8dc] hover:bg-[#18a2c2] text-white font-black text-sm tracking-wider uppercase py-3.5 rounded-full shadow-lg transition-all active:scale-[0.98] cursor-pointer"
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
                className="text-xs font-bold text-[#159cc4] hover:underline cursor-pointer"
              >
                ¿Ya tienes una cuenta? Inicia sesión
              </button>
            </div>
          </form>
        )}

        {/* Punto chiquito de azul en la tarjeta */}
        <button
          type="button"
          onClick={handleTriggerSimulation}
          className="absolute bottom-3.5 right-4 w-2.5 h-2.5 rounded-full bg-[#20b8dc] hover:bg-blue-600 hover:scale-150 transition-all cursor-pointer shadow-xs focus:outline-none"
          title="Simulación"
          aria-label="Simulación"
        />
      </div>

      {/* PIE DE PÁGINA CON ACCESO ADMINISTRADOR DISCRETO */}
      <div className="relative z-10 mt-6 flex items-center justify-between w-full max-w-[430px] px-2 text-[11px] text-white/70">
        <span>© 2026 COLORLINK Pinturas & Tintometría</span>
        <button
          type="button"
          onClick={onOpenAdminModal}
          className="flex items-center gap-1.5 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-lg backdrop-blur-xs transition-colors cursor-pointer"
          title="Acceso restringido para personal técnico y comercial"
        >
          <Lock className="w-3 h-3 text-cyan-300" />
          <span>Acceso Administrador</span>
        </button>
      </div>
    </div>
  );
}
