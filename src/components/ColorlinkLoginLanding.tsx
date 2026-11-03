import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, Building, User, Phone, Check, ArrowRight, ShieldCheck, MessageCircle, Sparkles, UserCheck, KeyRound, RefreshCw, CheckCircle2, ArrowLeft, X } from 'lucide-react';
import { ColorlinkPenguin } from './ColorlinkPenguin';
import { UserProfile } from '../types/form';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { sendRegistrationWelcomeEmail, sendPasswordRecoveryEmail } from '../utils/emailService';
import paintSplatterBg from '../assets/images/paint_splatter_bg_1788742862980.jpg';

interface ColorlinkLoginLandingProps {
  onLoginSuccess: (user: UserProfile) => void;
  onOpenAdminModal: () => void;
  onOpenAdvisorModal: () => void;
  onExploreDemo?: () => void;
  initialMode?: 'login' | 'register';
  onClose?: () => void;
  customMessage?: string;
  isModal?: boolean;
}

interface StoredAccount {
  id: string;
  email: string;
  password?: string;
  empresa: string;
  nit: string;
  responsable: string;
  telefono: string;
  ciudad?: string;
  createdAt?: string;
}

const ACCOUNTS_STORAGE_KEY = 'colorlink_registered_accounts_v1';

// Base de usuarios limpia desde cero (sin cuentas ficticias ni de prueba)
const DEFAULT_REGISTERED_ACCOUNTS: Record<string, StoredAccount> = {};

function getStoredAccounts(): Record<string, StoredAccount> {
  try {
    const raw = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return { ...DEFAULT_REGISTERED_ACCOUNTS, ...parsed };
  } catch {
    return { ...DEFAULT_REGISTERED_ACCOUNTS };
  }
}

function saveStoredAccount(account: StoredAccount) {
  try {
    const cleanEmail = account.email.trim().toLowerCase();
    const current = getStoredAccounts();
    current[cleanEmail] = {
      ...current[cleanEmail],
      ...account,
      email: cleanEmail
    };
    localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(current));
  } catch (e) {
    console.warn('[Storage] No se pudo guardar cuenta local:', e);
  }
}

export function ColorlinkLoginLanding({
  onLoginSuccess,
  onOpenAdminModal,
  onOpenAdvisorModal,
  onExploreDemo,
  initialMode,
  onClose,
  customMessage,
  isModal
}: ColorlinkLoginLandingProps) {
  const isModalMode = isModal ?? Boolean(onClose);
  const [mode, setMode] = useState<'login' | 'register' | 'forgot_email' | 'forgot_verify' | 'forgot_reset'>(
    initialMode || 'login'
  );
  
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

  // Forgot Password / Recovery fields
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [generatedTempPassword, setGeneratedTempPassword] = useState('');
  const [verificationPasswordInput, setVerificationPasswordInput] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [recoveryClientInfo, setRecoveryClientInfo] = useState<{ nombre: string; empresa: string } | null>(null);
  const [showRecoveryEmailPreview, setShowRecoveryEmailPreview] = useState(false);
  
  // Feedback
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Acción de Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const emailToUse = username.trim().toLowerCase();
    const passToUse = password.trim();

    if (!emailToUse || !passToUse) {
      setErrorMessage('Por favor ingresa tu correo electrónico y contraseña.');
      return;
    }

    setLoading(true);
    try {
      // Verificar si tiene contraseña actualizada o registrada en el almacén local
      const storedAccounts = getStoredAccounts();
      const storedAccount = storedAccounts[emailToUse];
      if (storedAccount?.password && storedAccount.password !== passToUse) {
        setErrorMessage('La contraseña ingresada no coincide con la registrada para este correo. Puedes usar "¿Se te olvidó tu contraseña?" para cambiarla.');
        setLoading(false);
        return;
      }

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
        id: clientRow?.id || storedAccount?.id || authUser?.id || `usr-${Date.now()}`,
        empresa: clientRow?.nombre_razon_social || storedAccount?.empresa || emailToUse.split('@')[0],
        nit: clientRow?.nit_documento || storedAccount?.nit || '',
        responsable: clientRow?.responsable || storedAccount?.responsable || emailToUse.split('@')[0],
        email: clientRow?.email_responsable || storedAccount?.email || emailToUse,
        telefono: clientRow?.telefono_responsable || storedAccount?.telefono || '',
        ciudad: 'Medellín',
        createdAt: clientRow?.created_at || storedAccount?.createdAt || new Date().toISOString()
      };

      // Sincronizar cuenta en registro local para futuras recuperaciones de contraseña
      saveStoredAccount({
        id: userProfile.id,
        email: userProfile.email,
        password: storedAccount?.password || passToUse,
        empresa: userProfile.empresa,
        nit: userProfile.nit,
        responsable: userProfile.responsable,
        telefono: userProfile.telefono,
        ciudad: userProfile.ciudad,
        createdAt: userProfile.createdAt
      });

      onLoginSuccess(userProfile);
    } catch (err: any) {
      console.error('[Login Error]', err);
      setErrorMessage('Error al verificar credenciales.');
    } finally {
      setLoading(false);
    }
  };

  // Paso 1 Recuperar Contraseña: Verificar si el correo está registrado y enviar contraseña temporal
  const handleSendRecoveryEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanEmail = recoveryEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMessage('Por favor ingresa un correo electrónico válido.');
      return;
    }

    setLoading(true);
    try {
      // 1. Buscar en tabla 'clientes' de Supabase
      let foundClient: { nombre: string; empresa: string; email: string } | null = null;
      try {
        const { data: clientRows } = await supabase
          .from('clientes')
          .select('*')
          .ilike('email_responsable', cleanEmail)
          .limit(1);

        if (clientRows && clientRows.length > 0) {
          const row = clientRows[0];
          foundClient = {
            nombre: row.responsable || cleanEmail.split('@')[0],
            empresa: row.nombre_razon_social || 'Empresa Registrada',
            email: row.email_responsable || cleanEmail
          };
        }
      } catch (dbErr) {
        console.warn('[Recovery DB Check]', dbErr);
      }

      // 2. Buscar también en cuentas registradas localmente
      if (!foundClient) {
        const storedAccounts = getStoredAccounts();
        const localMatch = storedAccounts[cleanEmail];
        if (localMatch) {
          foundClient = {
            nombre: localMatch.responsable || cleanEmail.split('@')[0],
            empresa: localMatch.empresa || 'Empresa Registrada',
            email: cleanEmail
          };
        }
      }

      if (!foundClient) {
        setErrorMessage(
          `El correo "${cleanEmail}" no se encuentra registrado. Verifica que esté bien escrito o crea una cuenta nueva.`
        );
        setLoading(false);
        return;
      }

      // 3. Generar contraseña temporal de comprobación (6 dígitos claros)
      const tempPass = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedTempPassword(tempPass);
      setRecoveryClientInfo({ nombre: foundClient.nombre, empresa: foundClient.empresa });
      setVerificationPasswordInput('');
      setShowRecoveryEmailPreview(false);

      // 4. Enviar correo real con la contraseña de comprobación
      await sendPasswordRecoveryEmail({
        email: cleanEmail,
        nombre: foundClient.nombre,
        empresa: foundClient.empresa,
        tempPassword: tempPass
      });

      setSuccessMessage(
        `¡Correo verificado! Hemos enviado una contraseña de comprobación a ${cleanEmail}.`
      );
      setMode('forgot_verify');
    } catch (err: any) {
      console.error('[Recovery Error]', err);
      setErrorMessage('No se pudo procesar la solicitud en este momento. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  // Paso 2 Recuperar Contraseña: Comprobar que la contraseña enviada al correo coincide
  const handleVerifyTemporaryPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanInput = verificationPasswordInput.trim();
    if (!cleanInput) {
      setErrorMessage('Por favor ingresa la contraseña de comprobación que llegó a tu correo.');
      return;
    }

    if (cleanInput !== generatedTempPassword) {
      setErrorMessage('La contraseña de comprobación ingresada no es correcta. Verifica el correo enviado e intenta de nuevo.');
      return;
    }

    setSuccessMessage('¡Identidad comprobada con éxito! Ahora ingresa tu nueva contraseña.');
    setNewPassword('');
    setConfirmNewPassword('');
    setMode('forgot_reset');
  };

  // Paso 3 Recuperar Contraseña: Cambiar a la nueva contraseña
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanNewPass = newPassword.trim();
    const cleanConfirmPass = confirmNewPassword.trim();

    if (cleanNewPass.length < 6) {
      setErrorMessage('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (cleanNewPass !== cleanConfirmPass) {
      setErrorMessage('Las contraseñas no coinciden. Por favor verifica ambos campos.');
      return;
    }

    setLoading(true);
    try {
      const cleanEmail = recoveryEmail.trim().toLowerCase();

      // Actualizar en Supabase Auth si hay sesión activa
      try {
        await supabase.auth.updateUser({ password: cleanNewPass });
      } catch {
        // Continuar guardando en almacén de cuentas
      }

      // Guardar la nueva contraseña asociada al correo del usuario
      const currentAccounts = getStoredAccounts();
      const existing = currentAccounts[cleanEmail];
      saveStoredAccount({
        id: existing?.id || `usr-${Date.now()}`,
        email: cleanEmail,
        password: cleanNewPass,
        empresa: recoveryClientInfo?.empresa || existing?.empresa || cleanEmail.split('@')[0],
        nit: existing?.nit || '',
        responsable: recoveryClientInfo?.nombre || existing?.responsable || cleanEmail.split('@')[0],
        telefono: existing?.telefono || '',
        ciudad: existing?.ciudad || 'Medellín'
      });

      setUsername(cleanEmail);
      setPassword('');
      setMode('login');
      setSuccessMessage('¡Contraseña actualizada correctamente! Ahora puedes iniciar sesión con tu nueva contraseña.');
    } catch (err: any) {
      console.error('[Reset Password Error]', err);
      setErrorMessage('Ocurrió un error al guardar la nueva contraseña.');
    } finally {
      setLoading(false);
    }
  };

  // Acción de Registro
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!regEmail || !regPassword) {
      setErrorMessage('Por favor ingresa correo y contraseña.');
      return;
    }

    setLoading(true);
    try {
      const nitLimpio = (regNit || '').replace(/[.\-\s]/g, '');
      const cleanRegEmail = regEmail.trim().toLowerCase();

      // 1. Intentar registrar en Supabase Auth
      let authUserId: string | null = null;
      try {
        const { data: authData } = await supabase.auth.signUp({
          email: cleanRegEmail,
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

      // 2. Guardar registro en la tabla 'clientes' de Supabase si está disponible
      let clienteId = `CLI-${Date.now().toString().slice(-6)}`;
      let clientCreatedAt = new Date().toISOString();

      if (isSupabaseConfigured()) {
        try {
          const { data: newClient } = await supabase
            .from('clientes')
            .insert({
              auth_user_id: authUserId,
              nombre_razon_social: regEmpresa || 'Cliente Registrado',
              nit_documento: nitLimpio || `NIT-${Date.now().toString().slice(-6)}`,
              responsable: regResponsable || cleanRegEmail.split('@')[0],
              email_responsable: cleanRegEmail,
              telefono_responsable: regTelefono || null,
              canal_entrada: 'Registro Portal Web'
            })
            .select('*')
            .single();

          if (newClient) {
            clienteId = newClient.id;
            clientCreatedAt = newClient.created_at || clientCreatedAt;
          }
        } catch (clientErr: any) {
          console.warn('[Supabase Clientes] Guardado en modo local:', clientErr?.message || clientErr);
        }
      }

      // Guardar también en almacén local para soporte de login y cotizaciones
      saveStoredAccount({
        id: clienteId,
        email: cleanRegEmail,
        password: regPassword.trim(),
        empresa: regEmpresa || 'Cliente Registrado',
        nit: nitLimpio || '',
        responsable: regResponsable || cleanRegEmail.split('@')[0],
        telefono: regTelefono || '',
        ciudad: 'Medellín',
        createdAt: clientCreatedAt
      });

      // Enviar correo de bienvenida corporativo mediante EmailJS
      try {
        await sendRegistrationWelcomeEmail({
          email: cleanRegEmail,
          nombre: regResponsable || cleanRegEmail.split('@')[0],
          empresa: regEmpresa || 'Cliente Registrado',
          nit: nitLimpio || 'No especificado',
          telefono: regTelefono
        });
      } catch (welcomeErr) {
        console.warn('[EmailJS] Advertencia al enviar bienvenida:', welcomeErr);
      }

      const userProfile: UserProfile = {
        id: clienteId,
        empresa: regEmpresa || 'Cliente Registrado',
        nit: nitLimpio || '',
        responsable: regResponsable || cleanRegEmail.split('@')[0],
        email: cleanRegEmail,
        telefono: regTelefono || '',
        ciudad: 'Medellín',
        createdAt: clientCreatedAt
      };

      // Ingreso directo e inmediato al cotizador sin pantallas intermedias ni interrupciones
      onLoginSuccess(userProfile);
    } catch (err: any) {
      console.error('[Registro Error]', err);
      setErrorMessage(err?.message || 'No se pudo completar el registro en este momento. Por favor verifica tus datos e intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={isModalMode ? "relative w-full flex flex-col items-center justify-center p-0" : "relative min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 overflow-x-hidden bg-gradient-to-br from-slate-100 via-sky-50 to-blue-50"}>
      {!isModalMode && (
        <>
          {/* IMAGEN Y MANCHAS DE PINTURA ARTÍSTICAS DE FONDO */}
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
        {/* Imagen de fondo generada con manchas y salpicaduras de pintura multicolor */}
        <img
          src={paintSplatterBg}
          alt="Paint Splatter Background"
          className="w-full h-full object-cover opacity-60 scale-105"
          referrerPolicy="no-referrer"
        />

        {/* Gradiente suave claro para asegurar legibilidad cristalina */}
        <div className="absolute inset-0 bg-white/75 backdrop-blur-[0.5px]" />

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

        {/* Mancha de pintura 2: Azul Eléctrico y Celeste Superior Derecha */}
        <svg
          className="absolute -top-8 -right-8 w-80 h-80 opacity-80"
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M135,40 C165,20 195,50 185,85 C175,120 205,150 170,175 C135,200 100,175 70,185 C40,195 20,155 35,120 C50,85 30,55 65,35 C100,15 105,60 135,40 Z"
            fill="#0284c7"
          />
          <circle cx="195" cy="35" r="8" fill="#0ea5e9" />
          <circle cx="165" cy="15" r="5" fill="#38bdf8" />
          <circle cx="205" cy="95" r="6" fill="#0284c7" />
          <circle cx="45" cy="190" r="7" fill="#38bdf8" />
          <circle cx="25" cy="165" r="4.5" fill="#0ea5e9" />
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
        <div className="absolute bottom-1/3 left-1/6 w-5 h-5 rounded-full bg-sky-400 shadow-sm opacity-80" />
        <div className="absolute bottom-1/4 right-1/5 w-3 h-3 rounded-full bg-emerald-400 shadow-sm opacity-85" />
        <div className="absolute top-2/3 right-1/3 w-4 h-4 rounded-full bg-amber-400 shadow-sm opacity-75" />
      </div>

      {/* CABECERA DE MARCA SUPERIOR: COLORLINK ® Pinturas & Tintometría */}
      <div className="relative z-10 mb-6 sm:mb-8 text-center flex flex-col items-center">
        <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-md px-5 py-2 rounded-full shadow-lg border border-white/40 mb-2">
          <span className="font-black text-xl sm:text-2xl tracking-tight bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-700 bg-clip-text text-transparent">
            COLORLINK
          </span>
          <span className="text-[11px] font-black text-sky-600 bg-sky-50 px-1.5 py-0.5 rounded-md border border-sky-200">
            ®
          </span>
          <span className="text-slate-300 font-light">|</span>
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Pinturas & Tintometría
          </span>
          </div>
        </div>
      </>
    )}

      {/* TARJETA FLOTANTE BLANCA CON ESQUINAS REDONDEADAS (Estilo Imagen 1) */}
      <div className={`relative z-10 w-full max-w-[430px] bg-white rounded-[32px] sm:rounded-[36px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.35)] px-6 sm:px-9 pb-8 pt-14 sm:pt-16 border border-white/80 transition-all ${isModalMode ? 'mt-12 sm:mt-14 mb-4' : 'mt-4'}`}>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 z-30 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
            title="Cerrar y seguir explorando el cotizador"
          >
            <X className="w-5 h-5" />
          </button>
        )}
        {/* Barra superior de 5 colores vivos de marca con esquinas redondeadas coincidentes */}
        <div className="absolute top-0 left-0 right-0 h-2.5 flex rounded-t-[36px] overflow-hidden">
          <div className="flex-1 bg-[#FF5500]" />
          <div className="flex-1 bg-[#FFD000]" />
          <div className="flex-1 bg-[#10E57A]" />
          <div className="flex-1 bg-[#00D2FF]" />
          <div className="flex-1 bg-[#0055FF]" />
          <div className="flex-1 bg-[#FF007A]" />
        </div>

        {/* BADGE CIRCULAR SUPERPUESTO CON EL PINGÜINITO TIERNO (Imagen 2) */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-20 flex items-center justify-center pointer-events-none">
          <div className="p-1.5 rounded-full bg-gradient-to-tr from-[#FF5500] via-[#00D2FF] to-[#0055FF] shadow-2xl pointer-events-auto">
            <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-full bg-white flex items-center justify-center p-1.5 overflow-hidden border-2 border-white shadow-inner">
              {/* Mascota Pingüino Colorlink */}
              <ColorlinkPenguin size="xl" className="transform hover:scale-105 transition-transform" />
            </div>
          </div>
        </div>

        {/* TÍTULO PRINCIPAL CON DEGRADADO VIBRANTE COLORIDO */}
        <div className="text-center mb-6">
          {customMessage && (
            <div className="mb-4 p-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl flex items-start gap-2.5 text-xs text-amber-900 text-left animate-fadeIn">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span className="font-semibold leading-relaxed">{customMessage}</span>
            </div>
          )}
          <h1 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-[#FF5500] via-[#0055FF] to-[#00D2FF] bg-clip-text text-transparent tracking-tight">
            {mode === 'login'
              ? 'Inicia sesión ahora'
              : mode === 'register'
              ? 'Crear cuenta nueva'
              : mode === 'forgot_email'
              ? 'Recuperar contraseña'
              : mode === 'forgot_verify'
              ? 'Comprobar identidad'
              : 'Cambiar contraseña'}
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-semibold">
            {mode === 'login'
              ? 'Accede para gestionar tus pedidos de pintura y cotizaciones'
              : mode === 'register'
              ? 'Ingresa los datos para registrar tu empresa'
              : mode === 'forgot_email'
              ? 'Ingresa tu correo registrado para recibir una contraseña de comprobación'
              : mode === 'forgot_verify'
              ? 'Ingresa la contraseña temporal que enviamos a tu correo electrónico'
              : 'Define tu nueva contraseña para acceder a tu cuenta'}
          </p>
        </div>

        {/* MENSAJE DE ERROR O ALERTA */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 text-center font-medium">
            {errorMessage}
          </div>
        )}

        {/* MENSAJE DE ÉXITO */}
        {successMessage && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 text-center font-semibold flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {mode === 'login' ? (
          /* FORMULARIO DE INICIO DE SESIÓN CON TOQUES COLORIDOS */
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Campo Correo Electrónico */}
            <div className="space-y-1.5 text-left">
              <label className="block text-xs font-bold text-slate-600 pl-2">
                Correo Electrónico *
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Ingresa tu correo electrónico (ej: proyectos@empresa.com)"
                  className="w-full bg-[#f8fafc] hover:bg-slate-100 focus:bg-white text-slate-800 placeholder:text-slate-400 text-sm font-medium px-5 py-3.5 rounded-full border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30 transition-all outline-none"
                />
              </div>
            </div>

            {/* Campo Password */}
            <div className="space-y-1.5 text-left">
              <label className="block text-xs font-bold text-slate-600 pl-2">
                Contraseña *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ingresa tu contraseña"
                  className="w-full bg-[#f8fafc] hover:bg-slate-100 focus:bg-white text-slate-800 placeholder:text-slate-400 text-sm font-medium px-5 py-3.5 pr-11 rounded-full border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30 transition-all outline-none"
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
                  className="w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500 cursor-pointer"
                />
                <span>Recordarme</span>
              </label>
            </div>

            {/* BOTÓN PRINCIPAL: ACCESO COLORIDO Y VIBRANTE CON LA PALETA DE MARCA */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-gradient-to-r from-[#FF5500] via-[#FF007A] to-[#0055FF] hover:brightness-110 text-white font-black text-sm tracking-widest uppercase py-3.5 sm:py-4 rounded-full shadow-[0_10px_25px_-5px_rgba(255,85,0,0.45)] hover:shadow-[0_15px_30px_-5px_rgba(255,85,0,0.55)] transition-all active:scale-[0.98] cursor-pointer"
            >
              {loading ? 'ACCEDIENDO...' : 'ACCESO'}
            </button>

            {/* ACCESO PARA ASESORES COMERCIALES */}
            <div className="pt-1">
              <button
                type="button"
                onClick={onOpenAdvisorModal}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-sky-50 to-blue-50 hover:from-sky-100 hover:to-blue-100 text-sky-700 font-bold text-xs rounded-full transition-all border border-sky-200/90 shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <UserCheck className="w-3.5 h-3.5 text-sky-600" />
                <span>¿Eres Asesor Comercial? Ingresa aquí</span>
              </button>
            </div>

            {/* BOTÓN PARA EXPLORAR / VER DEMOSTRACIÓN PREVIA DEL COTIZADOR ANTES DE REGISTRARSE */}
            {onExploreDemo && (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={onExploreDemo}
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:brightness-110 text-white font-black text-xs rounded-full transition-all shadow-[0_4px_14px_rgba(16,185,129,0.35)] flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <Eye className="w-4 h-4 text-emerald-100" />
                  <span>👁️ Ver Demostración / Explorar Cotizador</span>
                </button>
              </div>
            )}

            {/* ENLACES INFERIORES VIBRANTES */}
            <div className="flex items-center justify-between text-xs font-bold pt-2 px-1">
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className="text-sky-600 hover:text-sky-700 hover:underline cursor-pointer transition-colors"
              >
                ¿No tienes una cuenta?
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setRecoveryEmail(username.trim());
                    setErrorMessage(null);
                    setSuccessMessage(null);
                    setMode('forgot_email');
                  }}
                  className="text-slate-500 hover:text-sky-700 hover:underline cursor-pointer transition-colors"
                >
                  ¿Se te olvidó tu contraseña?
                </button>
              </div>
            </div>
          </form>
        ) : mode === 'forgot_email' ? (
          /* PASO 1 RECUPERAR CONTRASEÑA: PEDIR EL CORREO REGISTRADO */
          <form onSubmit={handleSendRecoveryEmail} className="space-y-4">
            <div className="p-3 bg-sky-50 border border-sky-200/80 rounded-2xl text-xs text-sky-900 leading-relaxed text-left">
              <p className="font-bold flex items-center gap-1.5 text-sky-800 mb-1">
                <Mail className="w-4 h-4 text-sky-600" />
                Paso 1 de 3: Verifica tu correo registrado
              </p>
              Ingresa el correo electrónico con el que te registraste. Si tu cuenta está registrada, te enviaremos una <strong>contraseña temporal de comprobación</strong> a tu correo.
            </div>

            <div className="space-y-1.5 text-left">
              <label className="block text-xs font-bold text-slate-600 pl-2">
                Correo Electrónico Registrado *
              </label>
              <input
                type="email"
                required
                value={recoveryEmail}
                onChange={(e) => setRecoveryEmail(e.target.value)}
                placeholder="Ej: proyectos@empresa.com"
                className="w-full bg-[#f8fafc] hover:bg-slate-100 focus:bg-white text-slate-800 placeholder:text-slate-400 text-sm font-medium px-5 py-3.5 rounded-full border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30 transition-all outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#FF5500] via-[#FF007A] to-[#0055FF] hover:brightness-110 text-white font-black text-xs sm:text-sm tracking-wider uppercase py-3.5 rounded-full shadow-[0_10px_25px_-5px_rgba(255,85,0,0.45)] transition-all active:scale-[0.98] cursor-pointer"
            >
              {loading ? 'VERIFICANDO Y ENVIANDO CORREO...' : 'ENVIAR CONTRASEÑA AL CORREO'}
            </button>

            <div className="flex items-center justify-between pt-2 px-1 text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className="text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Volver al inicio de sesión</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className="text-sky-600 hover:text-sky-700 hover:underline cursor-pointer"
              >
                Crear cuenta nueva
              </button>
            </div>
          </form>
        ) : mode === 'forgot_verify' ? (
          /* PASO 2 RECUPERAR CONTRASEÑA: COMPROBAR CON LA CONTRASEÑA ENVIADA AL CORREO */
          <form onSubmit={handleVerifyTemporaryPassword} className="space-y-4">
            <div className="p-3 bg-sky-50 border border-sky-200/80 rounded-2xl text-xs text-sky-900 leading-relaxed text-left space-y-1.5">
              <p className="font-bold flex items-center gap-1.5 text-sky-800">
                <KeyRound className="w-4 h-4 text-sky-600" />
                Paso 2 de 3: Comprobar contraseña enviada
              </p>
              <p>
                Enviamos una contraseña temporal de comprobación a <strong className="text-sky-700">{recoveryEmail}</strong>. Ingrésala abajo para comprobar que eres tú y pasar a cambiar tu contraseña.
              </p>
              <div className="pt-1 flex flex-wrap items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setShowRecoveryEmailPreview(!showRecoveryEmailPreview)}
                  className="text-[11px] font-bold text-sky-700 bg-white hover:bg-sky-100 px-2.5 py-1 rounded-lg border border-sky-200 cursor-pointer transition-colors"
                >
                  {showRecoveryEmailPreview ? 'Ocultar vista previa del correo' : '📩 Ver correo enviado'}
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleSendRecoveryEmail}
                  className="text-[11px] font-bold text-slate-600 hover:text-sky-700 flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Reenviar clave</span>
                </button>
              </div>
              {showRecoveryEmailPreview && (
                <div className="mt-2 p-2.5 bg-white rounded-xl border border-sky-200 text-[11px] text-slate-700 space-y-1 shadow-2xs">
                  <div className="font-bold text-slate-900 border-b border-slate-100 pb-1">
                    Asunto: 🔐 COLORLINK® • Contraseña de Comprobación
                  </div>
                  <p>
                    Hola <strong>{recoveryClientInfo?.nombre || recoveryEmail}</strong>, tu contraseña temporal para comprobar tu identidad es:
                  </p>
                  <div className="text-center py-1.5 bg-sky-50 rounded-lg font-mono font-black text-base tracking-widest text-sky-900 border border-sky-200">
                    {generatedTempPassword}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-1.5 text-left">
              <label className="block text-xs font-bold text-slate-600 pl-2">
                Contraseña de Comprobación *
              </label>
              <input
                type="text"
                required
                value={verificationPasswordInput}
                onChange={(e) => setVerificationPasswordInput(e.target.value)}
                placeholder="Ingresa la clave de 6 dígitos enviada a tu correo"
                className="w-full bg-[#f8fafc] hover:bg-slate-100 focus:bg-white text-slate-800 placeholder:text-slate-400 text-sm font-mono font-bold tracking-widest text-center px-5 py-3.5 rounded-full border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30 transition-all outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[#FF5500] via-[#FF007A] to-[#0055FF] hover:brightness-110 text-white font-black text-xs sm:text-sm tracking-wider uppercase py-3.5 rounded-full shadow-[0_10px_25px_-5px_rgba(255,85,0,0.45)] transition-all active:scale-[0.98] cursor-pointer"
            >
              COMPROBAR Y CONTINUAR
            </button>

            <div className="flex items-center justify-between pt-1 px-1 text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setMode('forgot_email');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className="text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Cambiar correo</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className="text-sky-600 hover:text-sky-700 hover:underline cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </form>
        ) : mode === 'forgot_reset' ? (
          /* PASO 3 RECUPERAR CONTRASEÑA: OPCIÓN PARA CAMBIAR LA CONTRASEÑA */
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 leading-relaxed text-left">
              <p className="font-bold flex items-center gap-1.5 text-emerald-800 mb-0.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Paso 3 de 3: Crear nueva contraseña
              </p>
              Identidad verificada para <strong>{recoveryEmail}</strong>. Ingresa tu nueva contraseña a continuación.
            </div>

            <div className="space-y-1.5 text-left">
              <label className="block text-xs font-bold text-slate-600 pl-2">
                Nueva Contraseña *
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full bg-[#f8fafc] hover:bg-slate-100 focus:bg-white text-slate-800 placeholder:text-slate-400 text-sm font-medium px-5 py-3.5 pr-11 rounded-full border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30 transition-all outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  tabIndex={-1}
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5 text-left">
              <label className="block text-xs font-bold text-slate-600 pl-2">
                Confirmar Nueva Contraseña *
              </label>
              <div className="relative">
                <input
                  type={showConfirmNewPassword ? 'text' : 'password'}
                  required
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="Repite tu nueva contraseña"
                  className="w-full bg-[#f8fafc] hover:bg-slate-100 focus:bg-white text-slate-800 placeholder:text-slate-400 text-sm font-medium px-5 py-3.5 pr-11 rounded-full border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30 transition-all outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  tabIndex={-1}
                >
                  {showConfirmNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#FF5500] via-[#FF007A] to-[#0055FF] hover:brightness-110 text-white font-black text-xs sm:text-sm tracking-wider uppercase py-3.5 rounded-full shadow-[0_10px_25px_-5px_rgba(255,85,0,0.45)] transition-all active:scale-[0.98] cursor-pointer"
            >
              {loading ? 'GUARDANDO CONTRASEÑA...' : 'CAMBIAR CONTRASEÑA'}
            </button>

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 hover:underline cursor-pointer"
              >
                Cancelar y volver al inicio de sesión
              </button>
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
                  NIT (Solo números) *
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={regNit}
                  onChange={(e) => setRegNit(e.target.value.replace(/\D/g, ''))}
                  placeholder="Ej: 900854219"
                  className="w-full bg-[#f1f3f5] text-slate-800 text-xs font-mono font-medium px-4 py-3 rounded-2xl border-0 focus:ring-2 focus:ring-[#20b8dc] outline-none"
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
                  Teléfono / Celular (Solo números)
                </label>
                <input
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={regTelefono}
                  onChange={(e) => setRegTelefono(e.target.value.replace(/\D/g, ''))}
                  placeholder="Ej: 3001234567"
                  className="w-full bg-[#f1f3f5] text-slate-800 text-xs font-mono font-medium px-4 py-3 rounded-2xl border-0 focus:ring-2 focus:ring-[#20b8dc] outline-none"
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
              className="w-full mt-3 bg-gradient-to-r from-[#FF5500] via-[#FF007A] to-[#0055FF] hover:brightness-110 text-white font-black text-sm tracking-wider uppercase py-3.5 rounded-full shadow-[0_10px_25px_-5px_rgba(255,85,0,0.45)] hover:shadow-[0_15px_30px_-5px_rgba(255,85,0,0.55)] transition-all active:scale-[0.98] cursor-pointer"
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
                className="text-xs font-bold text-sky-600 hover:text-sky-700 hover:underline cursor-pointer transition-colors"
              >
                ¿Ya tienes una cuenta? Inicia sesión
              </button>
            </div>
          </form>
        )}

      </div>

      {!isModalMode && (
        <>
          {/* VISUALIZACIÓN PREVIA DE LO QUE HAY ANTES DE REGISTRARSE */}
      <div className="relative z-10 mt-8 w-full max-w-2xl px-4 animate-fadeIn">
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-5 sm:p-6 shadow-xl border border-sky-100 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <span className="text-[10px] uppercase font-black tracking-wider text-sky-600 bg-sky-50 px-2.5 py-1 rounded-full border border-sky-200">
                Visualización Previa del Sistema
              </span>
              <h2 className="text-base sm:text-lg font-black text-slate-800 mt-1">
                Conoce lo que incluye Colorlink® antes de registrarte
              </h2>
            </div>
            {onExploreDemo && (
              <button
                type="button"
                onClick={onExploreDemo}
                className="self-start sm:self-center px-4 py-2 bg-gradient-to-r from-sky-500 via-sky-600 to-blue-600 hover:brightness-110 text-white text-xs font-black rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-all active:scale-95"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Explorar Cotizador en Vivo</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-sky-50/50 transition-colors">
              <div className="flex items-center gap-2 font-black text-xs text-slate-800 mb-1">
                <span className="text-base">📐</span>
                <span>Cotizador Inteligente de Metraje</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Ingresa las medidas de tu pared o fachada y calcula la dosificación exacta de cuñetes (5 gal) y galones con 10% de holgura técnica.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-sky-50/50 transition-colors">
              <div className="flex items-center gap-2 font-black text-xs text-slate-800 mb-1">
                <span className="text-base">🎨</span>
                <span>Laboratorio de Tintometría</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Más de 2,000 colores formulados en acabados Mate y Satinado bajo Norma Técnica NTC 1335 y NTC 5828 (Cero VOC).
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-sky-50/50 transition-colors">
              <div className="flex items-center gap-2 font-black text-xs text-slate-800 mb-1">
                <span className="text-base">🐧</span>
                <span>Pincelito con Visión Artificial</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Sube fotos de tus paredes para recibir diagnósticos de humedad, sustratos y recomendaciones técnicas en tiempo real.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:bg-sky-50/50 transition-colors">
              <div className="flex items-center gap-2 font-black text-xs text-slate-800 mb-1">
                <span className="text-base">🚚</span>
                <span>Logística & Furgones de Despacho</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Entrega programada con remisión oficial en Medellín, Bogotá, Cali, Barranquilla, Bucaramanga, Cartagena, Envigado y Rionegro.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* PIE DE PÁGINA CON ACCESO ASESOR Y ADMINISTRADOR */}
      <div className="relative z-10 mt-6 flex flex-wrap items-center justify-between gap-2 w-full max-w-2xl px-4 text-[11px] text-slate-500 font-medium">
        <span>© 2026 COLORLINK Pinturas & Tintometría</span>
        <div className="flex items-center gap-2">
          {onExploreDemo && (
            <button
              type="button"
              onClick={onExploreDemo}
              className="flex items-center gap-1.5 text-emerald-700 hover:text-emerald-900 bg-white/90 hover:bg-white px-2.5 py-1.5 rounded-xl border border-emerald-300 shadow-2xs backdrop-blur-xs transition-colors cursor-pointer font-bold"
              title="Ver demostración del cotizador"
            >
              <Eye className="w-3.5 h-3.5 text-emerald-600" />
              <span>Demostración</span>
            </button>
          )}
          <button
            type="button"
            onClick={onOpenAdvisorModal}
            className="flex items-center gap-1.5 text-sky-700 hover:text-sky-900 bg-white/90 hover:bg-white px-2.5 py-1.5 rounded-xl border border-sky-200/90 shadow-2xs backdrop-blur-xs transition-colors cursor-pointer font-bold"
            title="Ingreso para Asesores Comerciales y Técnicos"
          >
            <UserCheck className="w-3.5 h-3.5 text-sky-600" />
            <span>Asesores</span>
          </button>
          <button
            type="button"
            onClick={onOpenAdminModal}
            className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 bg-white/90 hover:bg-white px-2.5 py-1.5 rounded-xl border border-slate-200/90 shadow-2xs backdrop-blur-xs transition-colors cursor-pointer font-medium"
            title="Acceso restringido para personal técnico y directivo"
          >
            <Lock className="w-3 h-3 text-amber-500" />
            <span>Admin</span>
          </button>
        </div>
      </div>
    </>
  )}
    </div>
  );
}
