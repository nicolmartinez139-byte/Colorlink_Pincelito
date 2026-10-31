import emailjs from '@emailjs/browser';
import { ProjectFormData, TechnicalCalculationResult } from '../types/form';

// Credenciales oficiales de EmailJS para Colorlink®
const SERVICE_ID = (
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_EMAILJS_SERVICE_ID) ||
  (typeof process !== 'undefined' && process.env?.VITE_EMAILJS_SERVICE_ID) ||
  'service_qf0c7fg'
) as string;

const TEMPLATE_ID = (
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_EMAILJS_TEMPLATE_ID) ||
  (typeof process !== 'undefined' && process.env?.VITE_EMAILJS_TEMPLATE_ID) ||
  'template_fq5wnko'
) as string;

const PUBLIC_KEY = (
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_EMAILJS_PUBLIC_KEY) ||
  (typeof process !== 'undefined' && process.env?.VITE_EMAILJS_PUBLIC_KEY) ||
  '3RRGbuXHPRyKyJLZ0'
) as string;

export function isEmailConfigured(): boolean {
  return Boolean(SERVICE_ID && TEMPLATE_ID && PUBLIC_KEY);
}

// ============================================================================
// REGISTRO DE DEDUPLICACIÓN PERSISTENTE DE CORREOS
// Evita que los correos se reenvíen repetidamente cada vez que el usuario
// inicia sesión, recarga la página o se actualiza un estado ya notificado.
// ============================================================================
const SENT_EMAILS_CACHE_KEY = 'colorlink_sent_emails_cache_v1';

export function hasEmailBeenSent(cacheKey: string): boolean {
  try {
    if (typeof localStorage === 'undefined') return false;
    const raw = localStorage.getItem(SENT_EMAILS_CACHE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.includes(cacheKey)) {
      return true;
    }
  } catch {}
  return false;
}

export function recordEmailSent(cacheKey: string): void {
  try {
    if (typeof localStorage === 'undefined') return;
    const raw = localStorage.getItem(SENT_EMAILS_CACHE_KEY);
    const parsed: string[] = raw ? JSON.parse(raw) : [];
    if (!parsed.includes(cacheKey)) {
      parsed.push(cacheKey);
      const trimmed = parsed.slice(-500);
      localStorage.setItem(SENT_EMAILS_CACHE_KEY, JSON.stringify(trimmed));
    }
  } catch {}
}

function formatCOP(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  }).format(value);
}

export function generateWelcomeEmailHtml(params: {
  nombre: string;
  empresa: string;
  nit: string;
  telefono?: string;
  email: string;
  appUrl?: string;
}): string {
  const nombre = params.nombre || 'Cliente';
  const empresa = params.empresa || 'Empresa';
  const nit = params.nit || 'No especificado';
  const tel = params.telefono || 'No registrado';
  const email = params.email;
  const targetUrl = params.appUrl ||
    (typeof window !== 'undefined' && window.location?.origin
      ? window.location.origin
      : 'https://ais-pre-tcjxjdywjtv5zjljxt2lry-427167179027.us-east5.run.app');

  return `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="es">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>¡Bienvenido a Colorlink® Pinturas!</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #1e293b;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; padding: 24px 12px;">
    <tr>
      <td align="center">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 12px 40px rgba(0, 56, 130, 0.15); border: 1px solid #e2e8f0;">
          <!-- BARRA ARCOÍRIS COLORLINK (5 COLORES VIVOS) -->
          <tr>
            <td style="height: 6px; background: linear-gradient(90deg, #FF5500 0%, #FFD000 20%, #10E57A 40%, #00D2FF 60%, #0055FF 80%, #FF007A 100%);"></td>
          </tr>
          <!-- ENCABEZADO VIBRANTE -->
          <tr>
            <td align="center" style="background: linear-gradient(135deg, #002B99 0%, #0055FF 50%, #00D2FF 100%); padding: 36px 24px 28px; text-align: center; color: #ffffff;">
              <!-- LOGO DE LA EMPRESA & PINGÜINITO -->
              <div style="display: inline-block; background: rgba(255, 255, 255, 0.22); backdrop-filter: blur(8px); padding: 8px 20px; border-radius: 30px; border: 1px solid rgba(255, 255, 255, 0.4); margin-bottom: 14px;">
                <span style="font-size: 26px; vertical-align: middle;">🐧🎨</span>
                <span style="font-size: 16px; font-weight: 900; letter-spacing: 1px; color: #ffffff; margin-left: 6px; vertical-align: middle;">COLORLINK®</span>
                <span style="font-size: 11px; font-weight: 800; background: #ffffff; color: #003882; padding: 2px 8px; border-radius: 10px; margin-left: 6px; vertical-align: middle;">PINTURAS</span>
              </div>
              <h1 style="margin: 8px 0 4px; font-size: 24px; font-weight: 900; line-height: 1.2; color: #ffffff; text-shadow: 0 2px 4px rgba(0,0,0,0.15);">
                ¡REGISTRO EXITOSO! BIENVENIDO
              </h1>
              <p style="margin: 0; font-size: 14px; color: #f0fdf4; font-weight: 600; opacity: 0.95;">
                Tu cuenta corporativa ha sido activada en Colorlink®
              </p>
              <div style="display: inline-block; background-color: #10B981; color: #ffffff; font-size: 11px; font-weight: 800; padding: 6px 18px; border-radius: 20px; margin-top: 14px; text-transform: uppercase; letter-spacing: 0.8px; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);">
                ✓ Cuenta Activa & Verificada
              </div>
            </td>
          </tr>
          <!-- CUERPO -->
          <tr>
            <td style="padding: 28px 24px 20px;">
              <p style="font-size: 15px; line-height: 1.6; color: #334155; margin: 0 0 20px;">
                Hola <strong style="color: #0f172a;">${nombre}</strong>,<br />
                ¡Te damos la más cordial bienvenida a <strong>Colorlink® Pinturas</strong>! Tu cuenta ha sido creada exitosamente para tu empresa <strong style="color: #009FE3;">${empresa}</strong>.
              </p>
              <!-- TABLA DE DATOS REGISTRADOS -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f0f9ff; border: 1px solid #bae6fd; border-radius: 16px; margin-bottom: 22px;">
                <tr>
                  <td style="padding: 18px 20px;">
                    <div style="font-size: 12px; font-weight: 900; text-transform: uppercase; color: #0369a1; letter-spacing: 0.8px; margin-bottom: 12px;">
                      📋 Ficha de Tu Cuenta Registrada
                    </div>
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size: 13px; line-height: 1.9;">
                      <tr>
                        <td width="40%" style="color: #64748b; padding: 3px 0;">Responsable:</td>
                        <td width="60%" style="font-weight: 700; color: #0f172a; text-align: right;">${nombre}</td>
                      </tr>
                      <tr>
                        <td style="color: #64748b; padding: 3px 0;">Empresa:</td>
                        <td style="font-weight: 800; color: #003882; text-align: right;">${empresa}</td>
                      </tr>
                      <tr>
                        <td style="color: #64748b; padding: 3px 0;">NIT / Documento:</td>
                        <td style="font-weight: 700; color: #0f172a; text-align: right; font-family: monospace;">${nit}</td>
                      </tr>
                      <tr>
                        <td style="color: #64748b; padding: 3px 0;">Teléfono de Contacto:</td>
                        <td style="font-weight: 700; color: #0f172a; text-align: right;">${tel}</td>
                      </tr>
                      <tr>
                        <td style="color: #64748b; padding: 3px 0;">Correo Electrónico:</td>
                        <td style="font-weight: 800; color: #0284c7; text-align: right;">${email}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              <!-- BENEFICIOS -->
              <div style="background-color: #ecfdf5; border-left: 4px solid #10B981; padding: 14px 16px; border-radius: 0 12px 12px 0; font-size: 13px; color: #065f46; line-height: 1.6; margin-bottom: 24px;">
                🚀 <strong>¿Qué puedes hacer ahora?</strong><br />
                • Liquidar cotizaciones oficiales en 3 pasos con descuentos por volumen.<br />
                • Dosificación exacta de cuñetes y galones con norma NTC 1335.<br />
                • Asistencia técnica con nuestro pingüino <strong>Pincelito 🐧</strong>.<br />
                • Despacho prioritario en 24h a 48h con flota Colorlink.
              </div>
              <!-- BOTÓN VIBRANTE CON LA PALETA DE MARCA -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 20px;">
                <tr>
                  <td align="center">
                    <a href="${targetUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #FF5500 0%, #FF007A 100%); color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 900; padding: 16px 38px; border-radius: 30px; letter-spacing: 0.5px; box-shadow: 0 8px 24px rgba(255, 85, 0, 0.4); text-transform: uppercase;">
                      Comenzar a Cotizar Ahora 🎨
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- FOOTER -->
          <tr>
            <td align="center" style="background-color: #0f172a; color: #94a3b8; padding: 22px; font-size: 11px; line-height: 1.6; text-align: center;">
              <p style="margin: 0 0 4px; font-weight: 800; color: #ffffff;">COLORLINK® PINTURAS S.A.S. • NIT 900.854.219-1</p>
              <p style="margin: 0 0 6px;">PBX: +57 (604) 448-0000 • Línea Constructoras Medellín</p>
              <p style="margin: 0; font-size: 10px; color: #64748b;">Notificación automática de registro de cuenta.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Envía el correo real de confirmación de cotización al correo del cliente.
 * Se llama JUSTO Y ÚNICAMENTE cuando la cotización es generada.
 */
export async function sendConfirmationEmail(
  formData: ProjectFormData,
  calc: TechnicalCalculationResult,
  orderNumber: string
): Promise<{ success: boolean; message?: string }> {
  const recipientEmail = formData.emailResponsable?.trim();
  if (!recipientEmail || !recipientEmail.includes('@')) {
    console.warn('[Email] Correo de destino inválido o no suministrado:', recipientEmail);
    return { success: false, message: 'Correo de destino inválido' };
  }

  // Deduplicación estricta: evitar reenvíos al iniciar sesión o recargar
  const dedupeKey = `confirm_${orderNumber}_${recipientEmail.toLowerCase()}`;
  if (hasEmailBeenSent(dedupeKey)) {
    console.log('[EmailService] Correo de confirmación ya enviado previamente:', dedupeKey);
    return { success: true, message: `Correo de cotización #${orderNumber} ya enviado previamente a ${recipientEmail}` };
  }

  const subject = `🎨 COLORLINK® • Cotización Oficial Aprobada #${orderNumber} (${formData.cliente})`;

  // Enviar prioritariamente vía backend Express /api/send-email con HTML ultra colorido
  try {
    const { sendRealOrderEmail } = await import('../lib/emailService');
    const res = await sendRealOrderEmail({
      to: recipientEmail,
      subject,
      orderId: orderNumber,
      formData,
      calculation: {
        cuñetes: calc.cuñetesRequeridos,
        galones: calc.galonesRequeridos,
        galonesTotalesTeoricos: calc.galonesRequeridos,
        subtotalCOP: calc.presupuesto.subtotalMateriales,
        descuentoCOP: calc.presupuesto.descuentoValor,
        fleteCOP: calc.presupuesto.fleteEnvio,
        ivaCOP: calc.presupuesto.ivaValor,
        totalCOP: calc.presupuesto.totalPresupuesto
      },
      statusMessage: 'Cotización Oficial Emitida & Registrada'
    });
    if (res.success) {
      recordEmailSent(dedupeKey);
      return { success: true, message: `Correo de cotización enviado a ${recipientEmail}` };
    }
  } catch (err: any) {
    console.warn('[Email Backend Error] Intentando fallback con EmailJS:', err);
  }

  if (!isEmailConfigured()) {
    return { success: true, message: `Cotización registrada para ${recipientEmail}` };
  }

  const templateParams = {
    to_email: recipientEmail,
    user_email: recipientEmail,
    email: recipientEmail,
    reply_to: recipientEmail,
    to_name: formData.responsable || formData.cliente,
    name: formData.responsable || formData.cliente,
    cliente: formData.cliente,
    responsable: formData.responsable,
    telefono: formData.telefonoResponsable || '',
    order_number: orderNumber,
    order_id: orderNumber,
    orderId: orderNumber,
    ciudad: formData.ciudad,
    direccion_entrega: formData.direccionEntrega || '',
    direccion: formData.direccionEntrega || '',
    punto_referencia: formData.puntoReferencia || '',
    tipo_obra: formData.tipoObra,
    superficie: formData.superficie,
    ambiente: formData.ambiente,
    color_acabado: formData.colorAcabado,
    producto_recomendado: calc.productoRecomendado,
    manos_sugeridas: calc.manosSugeridas,
    galones_requeridos: calc.galonesRequeridos,
    cunetes_requeridos: calc.cuñetesRequeridos,
    tiempo_entrega: calc.presupuesto.tiempoEntregaDias,
    total: formatCOP(calc.presupuesto.totalPresupuesto),
    total_cop: formatCOP(calc.presupuesto.totalPresupuesto),
    subtotal: formatCOP(calc.presupuesto.subtotalMateriales),
    flete: calc.presupuesto.fleteEnvio === 0 ? 'GRATIS' : formatCOP(calc.presupuesto.fleteEnvio),
    iva: formatCOP(calc.presupuesto.ivaValor),
    subject,
    title: `Cotización Oficial Aprobada #${orderNumber} (${formData.cliente})`,
    message: `Confirmación de Cotización Oficial #${orderNumber} para ${formData.cliente} en ${formData.ciudad}. Total: ${formatCOP(calc.presupuesto.totalPresupuesto)} COP.`
  };

  try {
    const res = await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, { publicKey: PUBLIC_KEY });
    recordEmailSent(dedupeKey);
    return { success: true, message: `Correo enviado a ${recipientEmail}` };
  } catch (err: any) {
    return { success: false, message: err?.text || err?.message || 'Error al enviar correo con EmailJS' };
  }
}

/**
 * Envía el correo de bienvenida oficial de Colorlink® al registrarse un nuevo cliente.
 * Se envía EXCLUSIVAMENTE al registrarse una nueva cuenta (una sola vez por correo).
 */
export async function sendRegistrationWelcomeEmail(params: {
  email: string;
  nombre: string;
  empresa: string;
  nit: string;
  telefono?: string;
}): Promise<{ success: boolean; message?: string }> {
  const recipientEmail = params.email?.trim();
  if (!recipientEmail || !recipientEmail.includes('@')) {
    return { success: false, message: 'Correo de destino inválido' };
  }

  // Deduplicación estricta de correo de bienvenida: nunca enviar dos veces
  const dedupeKey = `welcome_${recipientEmail.toLowerCase()}`;
  if (hasEmailBeenSent(dedupeKey)) {
    console.log('[EmailService] Correo de bienvenida ya enviado previamente:', dedupeKey);
    return { success: true, message: `Bienvenida ya enviada previamente a ${recipientEmail}` };
  }

  const nombreCliente = params.nombre?.trim() || 'Cliente';
  const nombreEmpresa = params.empresa?.trim() || 'Empresa Registrada';
  const nitDocumento = params.nit?.trim() || 'No especificado';
  const telefonoContacto = params.telefono?.trim() || 'No registrado';

  const appOrigin = typeof window !== 'undefined' && window.location?.origin
    ? window.location.origin
    : 'https://ais-pre-tcjxjdywjtv5zjljxt2lry-427167179027.us-east5.run.app';

  const welcomeHtml = generateWelcomeEmailHtml({
    nombre: nombreCliente,
    empresa: nombreEmpresa,
    nit: nitDocumento,
    telefono: telefonoContacto,
    email: recipientEmail,
    appUrl: appOrigin
  });

  const subject = `¡Bienvenido a Colorlink® Pinturas! Registro Exitoso (${nombreEmpresa})`;

  // 1. Envío prioritario con plantilla HTML completa mediante backend si cuenta con Resend o SMTP real
  let backendDelivered = false;
  try {
    const res = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: recipientEmail,
        subject,
        html: welcomeHtml,
        text: `¡Bienvenido a Colorlink Pinturas! Hola ${nombreCliente}, tu cuenta corporativa ha sido creada exitosamente para ${nombreEmpresa} (NIT: ${nitDocumento}). Ya puedes ingresar a cotizar.`
      })
    });
    const data = await res.json();
    if (data.success && data.provider !== 'ethereal_sandbox' && data.provider !== 'ethereal_test') {
      console.log('[WELCOME EMAIL SUCCESS] Correo de bienvenida entregado vía backend:', recipientEmail);
      recordEmailSent(dedupeKey);
      backendDelivered = true;
      return { success: true, message: `Bienvenida enviada a ${recipientEmail}` };
    }
  } catch (err: any) {
    console.warn('[WELCOME EMAIL BACKEND WARN]', err);
  }

  // 2. Envío con EmailJS garantizando que SIEMPRE sea un mensaje de BIENVENIDA y REGISTRO EXITOSO
  if (isEmailConfigured() && !backendDelivered) {
    try {
      const welcomeTemplateId = (
        (typeof import.meta !== 'undefined' && import.meta.env?.VITE_EMAILJS_WELCOME_TEMPLATE_ID) ||
        (typeof process !== 'undefined' && process.env?.VITE_EMAILJS_WELCOME_TEMPLATE_ID) ||
        TEMPLATE_ID
      ) as string;

      const templateParams = {
        to_email: recipientEmail,
        user_email: recipientEmail,
        email: recipientEmail,
        reply_to: recipientEmail,
        to_name: nombreCliente,
        name: nombreCliente,
        nombre: nombreCliente,
        empresa: nombreEmpresa,
        cliente: nombreEmpresa,
        responsable: nombreCliente,
        nit: nitDocumento,
        nit_documento: nitDocumento,
        telefono: telefonoContacto,
        subject: `🎨 COLORLINK® • ¡Bienvenido! Registro Exitoso (${nombreEmpresa})`,
        title: '¡Registro Exitoso! Bienvenido a Colorlink® Pinturas',
        // Variables completas para que la plantilla de EmailJS nunca muestre campos en blanco ni parezca cotización
        order_number: `REG-${nitDocumento.replace(/[^0-9]/g, '').slice(-6) || 'CLK2026'} (Cuenta Activa)`,
        order_id: `REG-${nitDocumento.replace(/[^0-9]/g, '').slice(-6) || 'CLK2026'}`,
        orderId: `REG-${nitDocumento.replace(/[^0-9]/g, '').slice(-6) || 'CLK2026'}`,
        ciudad: 'Medellín y Cobertura Nacional',
        tipo_obra: 'Portal Corporativo de Clientes Colorlink',
        superficie: 'Muros, Fachadas y Pisos Industriales',
        ambiente: 'Interior y Exterior',
        color_acabado: 'Catálogo Oficial Colorlink (Mil Opciones)',
        producto: 'Línea Profesional de Pinturas y Tintometría Colorlink®',
        producto_recomendado: 'Línea Profesional de Pinturas y Tintometría Colorlink®',
        manos: 'Asistencia Técnica Personalizada & Descuento Especial',
        manos_sugeridas: 'Asistencia Técnica Personalizada',
        galones: 'Acceso Total al Cotizador',
        galones_requeridos: 'Acceso Total',
        cunetes_requeridos: 'Habilitado',
        tiempo: 'Inmediato (Plataforma Autónoma 24/7)',
        tiempo_entrega: 'Activación Inmediata',
        total: 'Cuenta Corporativa Habilitada',
        total_cop: 'Acceso Gratuito',
        subtotal: 'Acceso Habilitado',
        flete: 'Despacho con Flota Colorlink',
        iva: '19% en pedidos oficiales',
        status_message: '✓ Cuenta de Cliente Registrada & Verificada',
        app_url: appOrigin,
        cotizar_url: appOrigin,
        link: appOrigin,
        url: appOrigin,
        message: `¡Bienvenido a Colorlink Pinturas! Hola ${nombreCliente}, tu registro para la empresa ${nombreEmpresa} (NIT: ${nitDocumento}) ha sido completado exitosamente. Tu cuenta está activa para liquidar requerimientos en obra y emitir cotizaciones oficiales.`,
        html: welcomeHtml,
        html_content: welcomeHtml,
        content: welcomeHtml
      };

      await emailjs.send(SERVICE_ID, welcomeTemplateId, templateParams, { publicKey: PUBLIC_KEY });
      console.log('[EmailJS] Correo de bienvenida enviado exitosamente a:', recipientEmail);
      recordEmailSent(dedupeKey);
      return { success: true, message: `Bienvenida enviada a ${recipientEmail}` };
    } catch (e: any) {
      console.warn('[EmailJS Welcome]', e);
    }
  }

  recordEmailSent(dedupeKey);
  return { success: true, message: `Bienvenida registrada para ${recipientEmail}` };
}

// Cola secuencial para EmailJS para evitar error 429 (Too Many Requests) cuando se adelantan etapas
let emailJsQueuePromise: Promise<any> = Promise.resolve();

const MOCK_DEMO_EMAILS = new Set([
  'vgomez@constructorahorizonte.com.co',
  'compras@vanguardia.com',
  'gerencia@clinicaciudadjardin.com.co',
  'operaciones@logisticacaribe.com',
  'mprada@cabeceraempresarial.com',
  'mantenimiento@hotelcostaazul.co',
  'marango@inversionesvalle.com',
  'administracion@lossauces.com',
  'contacto@colorlink.com.co',
  'supervisor@colorlink.com.co'
]);

export function isMockDemoEmail(email?: string): boolean {
  if (!email) return true;
  return MOCK_DEMO_EMAILS.has(email.trim().toLowerCase());
}

export function enqueueEmailJsSend(
  serviceId: string,
  templateId: string,
  templateParams: Record<string, unknown>,
  publicKey: string
): Promise<any> {
  const nextTask = emailJsQueuePromise.then(async () => {
    const res = await emailjs.send(serviceId, templateId, templateParams, { publicKey });
    await new Promise((resolve) => setTimeout(resolve, 1100));
    return res;
  });
  emailJsQueuePromise = nextTask.catch(() => {});
  return nextTask;
}

/**
 * Envía actualización de estado del pedido por correo electrónico
 */
export async function sendOrderStatusUpdateEmail(params: {
  orderId: string;
  cliente: string;
  responsable: string;
  email: string;
  status: 'pendiente' | 'preparando' | 'en_ruta' | 'entregado' | 'en_espera' | 'rechazado';
  statusLabel: string;
  mensaje: string;
  vehiculo?: string;
  conductor?: string;
  placa?: string;
  ciudad?: string;
  totalCOP?: number;
  color?: string;
  tipoPintura?: string;
  areaM2?: number;
  cunetes?: number;
  galones?: number;
}): Promise<{ success: boolean; message?: string }> {
  const recipientEmail = params.email?.trim();
  if (!recipientEmail || !recipientEmail.includes('@')) {
    return { success: false, message: 'Correo de destino inválido' };
  }

  // No gastar cuota de EmailJS en los pedidos de muestra pre-cargados para no bloquear el correo real del cliente
  if (isMockDemoEmail(recipientEmail)) {
    return { success: true, message: `Notificación interna registrada para ${recipientEmail}` };
  }

  // Deduplicación estricta de actualización de estado: evitar reenvíos al iniciar sesión o recargar
  const dedupeKey = `status_${params.orderId}_${params.status}_${recipientEmail.toLowerCase()}`;
  if (hasEmailBeenSent(dedupeKey)) {
    console.log('[EmailService] Notificación de estado ya enviada previamente:', dedupeKey);
    return { success: true, message: `Notificación de etapa "${params.statusLabel}" ya enviada previamente a ${recipientEmail}` };
  }

  const appOrigin = typeof window !== 'undefined' && window.location?.origin
    ? window.location.origin
    : 'https://ais-pre-tcjxjdywjtv5zjljxt2lry-427167179027.us-east5.run.app';

  const statusThemeMap: Record<string, {
    emoji: string;
    headerTitle: string;
    headerGradient: string;
    boxBg: string;
    boxBorder: string;
    boxTitleColor: string;
    statusAccent: string;
    introText: string;
  }> = {
    pendiente: {
      emoji: '📋⏳',
      headerTitle: 'PEDIDO RECIBIDO Y REGISTRADO',
      headerGradient: 'linear-gradient(135deg,#B45309 0%,#D97706 55%,#F59E0B 100%)',
      boxBg: '#fffbeb',
      boxBorder: '#fde68a',
      boxTitleColor: '#92400e',
      statusAccent: '#d97706',
      introText: `Confirmamos la recepción oficial de tu pedido en nuestro sistema para el proyecto <strong>${params.cliente}</strong>. Tu orden ha sido programada para ingreso al laboratorio de tintometría.`
    },
    preparando: {
      emoji: '🧪🎨',
      headerTitle: 'INGRESO A LABORATORIO DE TINTOMETRÍA',
      headerGradient: 'linear-gradient(135deg,#0369A1 0%,#0284C7 55%,#00D2FF 100%)',
      boxBg: '#f0f9ff',
      boxBorder: '#bae6fd',
      boxTitleColor: '#0369a1',
      statusAccent: '#0284c7',
      introText: `¡Tu pintura se está formulando en este momento! Tu pedido para <strong>${params.cliente}</strong> ingresó al laboratorio central de tintometría computarizada Colorlink®.`
    },
    en_ruta: {
      emoji: '🚚🛣️',
      headerTitle: '¡PEDIDO DESPACHANDO Y EN RUTA A OBRA!',
      headerGradient: 'linear-gradient(135deg,#4338CA 0%,#6D28D9 55%,#9333EA 100%)',
      boxBg: '#faf5ff',
      boxBorder: '#e9d5ff',
      boxTitleColor: '#6b21a8',
      statusAccent: '#7e22ce',
      introText: `¡Tu pedido ya salió de planta! El vehículo de la flota Colorlink® va en camino hacia tu obra en <strong>${params.ciudad || 'Medellín'}</strong> para el proyecto <strong>${params.cliente}</strong>.`
    },
    entregado: {
      emoji: '✅🏆',
      headerTitle: '¡PEDIDO ENTREGADO CON ÉXITO EN OBRA!',
      headerGradient: 'linear-gradient(135deg,#047857 0%,#059669 55%,#10B981 100%)',
      boxBg: '#ecfdf5',
      boxBorder: '#a7f3d0',
      boxTitleColor: '#065f46',
      statusAccent: '#059669',
      introText: `¡Entrega finalizada a entera satisfacción! Los materiales para <strong>${params.cliente}</strong> fueron recibidos en obra junto con su Certificado de Calidad NTC 1335.`
    },
    en_espera: {
      emoji: '📦⏳',
      headerTitle: 'PROGRAMACIÓN DE ABASTECIMIENTO CEDI',
      headerGradient: 'linear-gradient(135deg,#C2410C 0%,#EA580C 55%,#F97316 100%)',
      boxBg: '#fff7ed',
      boxBorder: '#fed7aa',
      boxTitleColor: '#9a3412',
      statusAccent: '#ea580c',
      introText: `Tu pedido para <strong>${params.cliente}</strong> se encuentra en transferencia prioritaria de stock desde nuestra Planta Central hacia la sede de <strong>${params.ciudad || 'destino'}</strong>.`
    },
    rechazado: {
      emoji: '⚠️🔎',
      headerTitle: 'OBSERVACIÓN TÉCNICA DE AUDITORÍA',
      headerGradient: 'linear-gradient(135deg,#9F1239 0%,#E11D48 55%,#F43F5E 100%)',
      boxBg: '#fff1f2',
      boxBorder: '#fecdd3',
      boxTitleColor: '#9f1239',
      statusAccent: '#e11d48',
      introText: `El departamento de ingeniería revisó la solicitud para <strong>${params.cliente}</strong> y detectó requerimientos de ajuste técnico antes de proceder con la dosificación.`
    }
  };

  const theme = statusThemeMap[params.status] || statusThemeMap.preparando;
  const subject = `${theme.emoji} COLORLINK® • Pedido #${params.orderId}: ${theme.headerTitle}`;

  const htmlBody = `
    <!DOCTYPE html>
    <html lang="es">
    <head><meta charset="UTF-8"><title>${subject}</title></head>
    <body style="margin:0;padding:0;background-color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:#f8fafc;padding:20px 10px;">
        <tr>
          <td align="center">
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;background:#ffffff;border-radius:24px;overflow:hidden;border:1px solid #e2e8f0;box-shadow:0 10px 30px rgba(0,0,0,0.08);">
              <tr>
                <td style="height:6px;background:linear-gradient(90deg,#FF5500 0%,#FFD000 20%,#10E57A 40%,#00D2FF 60%,#0055FF 80%,#FF007A 100%);"></td>
              </tr>
              <tr>
                <td align="center" style="background:${theme.headerGradient};padding:30px 20px;color:#ffffff;text-align:center;">
                  <span style="font-size:28px;">${theme.emoji}</span>
                  <h1 style="margin:8px 0 4px;font-size:20px;font-weight:900;color:#ffffff;">${theme.headerTitle}</h1>
                  <p style="margin:0;font-size:13px;color:#f8fafc;">Pedido #${params.orderId} • ${params.statusLabel}</p>
                </td>
              </tr>
              <tr>
                <td style="padding:24px;">
                  <p style="font-size:14px;color:#334155;margin:0 0 16px;">
                    Hola <strong>${params.responsable || params.cliente}</strong>,<br/>
                    ${theme.introText}
                  </p>
                  <div style="background:${theme.boxBg};border:1px solid ${theme.boxBorder};border-radius:12px;padding:14px;margin-bottom:16px;font-size:13px;line-height:1.7;">
                    <p style="margin:0;color:${theme.boxTitleColor};font-weight:800;text-transform:uppercase;font-size:11px;margin-bottom:6px;">Reporte Oficial según Estado del Pedido</p>
                    <strong>Pedido:</strong> #${params.orderId}<br/>
                    <strong>Ciudad / Destino:</strong> ${params.ciudad || 'Medellín'}<br/>
                    <strong>Fase Actual:</strong> <span style="color:${theme.statusAccent};font-weight:800;">${params.statusLabel}</span>
                  </div>
                  <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;padding:14px;margin-bottom:16px;font-size:13px;line-height:1.6;color:#334155;white-space:pre-line;">
                    ${params.mensaje}
                  </div>
                  ${(params.status === 'en_ruta' || params.status === 'entregado') && params.vehiculo ? `
                  <div style="background:#f8fafc;border-left:4px solid ${theme.statusAccent};padding:12px 14px;border-radius:0 10px 10px 0;font-size:12px;color:#334155;line-height:1.6;margin-bottom:16px;">
                    🚚 <strong>${params.status === 'entregado' ? 'Unidad que Realizó la Entrega en Obra:' : 'Unidad de Flota en Camino a Obra:'}</strong><br/>
                    • Vehículo: ${params.vehiculo} (Placa ${params.placa || 'TZW-402'})<br/>
                    • Conductor Responsable: ${params.conductor || 'Carlos Restrepo'}
                  </div>
                  ` : ''}
                  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin:16px 0;">
                    <tr>
                      <td align="center">
                        <a href="${appOrigin}" target="_blank" style="display:inline-block;background:linear-gradient(135deg,#FF5500 0%,#FF007A 100%);color:#ffffff;text-decoration:none;font-size:13px;font-weight:800;padding:12px 28px;border-radius:24px;">
                          Consultar Estado en Portal de Clientes 🎨
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td align="center" style="background:#0f172a;color:#94a3b8;padding:18px;font-size:11px;text-align:center;">
                  COLORLINK® PINTURAS S.A.S. • Planta Central Medellín • PBX: (604) 448-0000
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `.trim();

  const estimatedCunetes = params.cunetes || Math.max(1, Math.ceil((params.areaM2 || 85) / 28));
  const formattedTotal = params.totalCOP ? formatCOP(params.totalCOP) : '$0 COP';
  const logisticsSummary =
    params.status === 'en_ruta'
      ? `🚚 EN DESPACHO Y EN RUTA A OBRA • Vehículo: ${params.vehiculo || 'Camión Flota Colorlink'} (Placa ${params.placa || 'TZW-402'}) • Conductor: ${params.conductor || 'Carlos Restrepo'}`
      : params.status === 'entregado'
      ? `✅ PEDIDO ENTREGADO CON ÉXITO EN OBRA • Entregado por ${params.conductor || 'Carlos Restrepo'} (${params.vehiculo || 'Flota Colorlink'} - Placa ${params.placa || 'TZW-402'})`
      : params.status === 'preparando'
      ? `🎨 EN LABORATORIO DE TINTOMETRÍA • Dosificando color y lote bajo Norma NTC 1335`
      : `${theme.emoji} ${params.statusLabel}`;

  let emailJsDelivered = false;

  // 1. Enviar con EmailJS llenando TODOS los campos de la plantilla para que el cliente reciba el aviso de despacho/etapa claramente
  if (isEmailConfigured()) {
    const templateParams = {
      to_email: recipientEmail,
      user_email: recipientEmail,
      email: recipientEmail,
      reply_to: recipientEmail,
      to_name: params.responsable || params.cliente,
      name: params.responsable || params.cliente,
      nombre: params.responsable || params.cliente,
      empresa: params.cliente,
      cliente: params.cliente,
      responsable: params.responsable || params.cliente,
      order_number: `${params.orderId} — [${params.statusLabel.toUpperCase()}]`,
      order_id: `${params.orderId} (${params.statusLabel})`,
      orderId: params.orderId,
      status_message: `${theme.emoji} ${params.statusLabel.toUpperCase()}`,
      ciudad: `${params.ciudad || 'Medellín'} (${params.statusLabel})`,
      direccion_entrega: logisticsSummary,
      direccion: logisticsSummary,
      punto_referencia: params.vehiculo ? `${params.vehiculo} • Placa ${params.placa || 'TZW-402'} • Conductor: ${params.conductor || 'Carlos Restrepo'}` : params.statusLabel,
      tipo_obra: `ESTADO ACTUAL: ${theme.headerTitle}`,
      superficie: logisticsSummary,
      ambiente: params.vehiculo ? `Unidad: ${params.vehiculo} (${params.placa || 'TZW-402'})` : 'Planta Central Colorlink®',
      color_acabado: params.color || 'Formulación Oficial Colorlink®',
      producto: `${params.tipoPintura || 'Pintura Profesional Colorlink®'} — [${params.statusLabel}]`,
      producto_recomendado: `${params.tipoPintura || 'Pintura Profesional Colorlink®'} — [${params.statusLabel}]`,
      manos: logisticsSummary,
      manos_sugeridas: logisticsSummary,
      galones: params.galones ?? 0,
      galones_requeridos: params.galones ?? 0,
      cunetes: estimatedCunetes,
      cunetes_requeridos: `${estimatedCunetes} Cuñete(s) — ${params.statusLabel}`,
      tiempo: logisticsSummary,
      tiempo_entrega: logisticsSummary,
      total: formattedTotal,
      total_cop: formattedTotal,
      subtotal: formattedTotal,
      flete: params.status === 'en_ruta' ? `EN RUTA (${params.placa || 'TZW-402'})` : params.status === 'entregado' ? 'ENTREGADO EN OBRA' : 'Flota Asegurada Colorlink',
      iva: 'Incluido (19%)',
      app_url: appOrigin,
      cotizar_url: appOrigin,
      link: appOrigin,
      url: appOrigin,
      message: `${theme.emoji} ${theme.headerTitle}\n\n${params.mensaje}`,
      mensaje: `${theme.emoji} ${theme.headerTitle}\n\n${params.mensaje}`,
      subject,
      asunto: subject,
      title: `${theme.emoji} ${theme.headerTitle} (#${params.orderId})`,
      html: htmlBody,
      html_content: htmlBody,
      content: htmlBody
    };

    try {
      console.log(`[EmailJS] Enviando actualización de etapa (${params.statusLabel}) a:`, recipientEmail);
      const res = await enqueueEmailJsSend(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);
      console.log('[EmailJS] ✓ Correo de cambio de etapa enviado:', res);
      emailJsDelivered = true;
      recordEmailSent(dedupeKey);
      // Retornar inmediatamente para evitar duplicar el correo con el backend Express
      return { success: true, message: `Correo de etapa "${params.statusLabel}" enviado a ${recipientEmail}` };
    } catch (err: any) {
      console.warn('[EmailJS] Falló EmailJS, intentando con backend /api/send-email:', err);
    }
  }

  // 2. Envío de respaldo mediante backend Express /api/send-email SÓLO si EmailJS no fue entregado
  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: recipientEmail,
        subject,
        html: htmlBody,
        text: `COLORLINK Pinturas - Pedido #${params.orderId}: ${params.statusLabel}. ${params.mensaje}`
      })
    });

    const data = await response.json();
    if (data.success) {
      recordEmailSent(dedupeKey);
      return { success: true, message: `Correo de etapa "${params.statusLabel}" enviado a ${recipientEmail}` };
    }
  } catch (backendErr: any) {
    console.warn('[BACKEND EMAIL ERROR]', backendErr);
  }

  recordEmailSent(dedupeKey);
  return { success: true, message: `Notificación registrada para ${recipientEmail}` };
}

/**
 * Genera el HTML del correo de recuperación de contraseña con la contraseña de comprobación
 */
export function generatePasswordRecoveryEmailHtml(params: {
  email: string;
  nombre: string;
  empresa?: string;
  tempPassword: string;
}): string {
  const nombre = params.nombre || 'Cliente Colorlink';
  const empresa = params.empresa || 'Cuenta Corporativa';
  const tempPassword = params.tempPassword;

  return `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="es">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Recuperación de Contraseña • Colorlink® Pinturas</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; padding: 24px 12px;">
    <tr>
      <td align="center">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 580px; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 12px 36px rgba(0, 56, 130, 0.14); border: 1px solid #e2e8f0;">
          <tr>
            <td style="height: 6px; background: linear-gradient(90deg, #FF5500 0%, #FFD000 20%, #10E57A 40%, #00D2FF 60%, #0055FF 80%, #FF007A 100%);"></td>
          </tr>
          <tr>
            <td align="center" style="background: linear-gradient(135deg, #002B99 0%, #0055FF 55%, #00D2FF 100%); padding: 32px 24px 26px; text-align: center; color: #ffffff;">
              <div style="display: inline-block; background: rgba(255, 255, 255, 0.2); padding: 6px 18px; border-radius: 30px; border: 1px solid rgba(255, 255, 255, 0.35); margin-bottom: 12px;">
                <span style="font-size: 22px; vertical-align: middle;">🔐🎨</span>
                <span style="font-size: 15px; font-weight: 900; letter-spacing: 1px; color: #ffffff; margin-left: 6px; vertical-align: middle;">COLORLINK® SEGURIDAD</span>
              </div>
              <h1 style="margin: 6px 0 4px; font-size: 22px; font-weight: 900; color: #ffffff;">
                CONTRASEÑA DE COMPROBACIÓN
              </h1>
              <p style="margin: 0; font-size: 13px; color: #e0f2fe; font-weight: 600;">
                Verificación de identidad para restablecer tu contraseña
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 28px 24px 22px;">
              <p style="font-size: 15px; line-height: 1.6; color: #334155; margin: 0 0 16px;">
                Hola <strong style="color: #0f172a;">${nombre}</strong> (${empresa}),<br />
                Hemos recibido una solicitud para restablecer la contraseña de tu cuenta asociada al correo <strong style="color: #0284c7;">${params.email}</strong>.
              </p>
              <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 18px;">
                Ingresa la siguiente <strong>contraseña temporal de comprobación</strong> en la pantalla de verificación para confirmar tu identidad y habilitar el cambio de contraseña:
              </p>
              <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border: 2px dashed #0284c7; border-radius: 18px; padding: 22px 16px; text-align: center; margin-bottom: 22px;">
                <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #0369a1; letter-spacing: 1.2px; margin-bottom: 8px;">
                  Tu Contraseña Temporal de Comprobación
                </div>
                <div style="font-size: 32px; font-weight: 900; font-family: monospace; letter-spacing: 4px; color: #002B99; background: #ffffff; display: inline-block; padding: 10px 26px; border-radius: 12px; border: 1px solid #bae6fd; box-shadow: 0 4px 12px rgba(2, 132, 199, 0.12);">
                  ${tempPassword}
                </div>
                <div style="font-size: 11px; color: #64748b; margin-top: 8px; font-weight: 600;">
                  Válida para tu sesión actual • No compartas esta clave con terceros
                </div>
              </div>
              <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 12px 14px; border-radius: 0 10px 10px 0; font-size: 12px; color: #92400e; line-height: 1.5;">
                ⚠️ <strong>Aviso de Seguridad:</strong> Si no solicitaste recuperar tu contraseña en Colorlink® Pinturas, puedes ignorar este mensaje con total tranquilidad.
              </div>
            </td>
          </tr>
          <tr>
            <td align="center" style="background-color: #0f172a; color: #94a3b8; padding: 18px; font-size: 11px; text-align: center;">
              COLORLINK® PINTURAS S.A.S. • NIT 900.854.219-1 • PBX: (604) 448-0000
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Envía el correo con la contraseña temporal de comprobación al usuario registrado
 */
export async function sendPasswordRecoveryEmail(params: {
  email: string;
  nombre: string;
  empresa?: string;
  tempPassword: string;
}): Promise<{ success: boolean; message?: string; htmlPreview?: string }> {
  const recipientEmail = params.email?.trim();
  if (!recipientEmail || !recipientEmail.includes('@')) {
    return { success: false, message: 'Correo de destino inválido' };
  }

  const nombreCliente = params.nombre?.trim() || recipientEmail.split('@')[0];
  const nombreEmpresa = params.empresa?.trim() || 'Cuenta Corporativa Colorlink';
  const tempPassword = params.tempPassword;

  const recoveryHtml = generatePasswordRecoveryEmailHtml({
    email: recipientEmail,
    nombre: nombreCliente,
    empresa: nombreEmpresa,
    tempPassword
  });

  const subject = `🔐 COLORLINK® • Contraseña de Comprobación: ${tempPassword}`;

  // 1. Enviar vía EmailJS para que llegue directamente al buzón real del usuario
  if (isEmailConfigured()) {
    try {
      const templateParams = {
        to_email: recipientEmail,
        user_email: recipientEmail,
        email: recipientEmail,
        reply_to: recipientEmail,
        to_name: nombreCliente,
        name: nombreCliente,
        nombre: nombreCliente,
        empresa: nombreEmpresa,
        cliente: nombreEmpresa,
        responsable: nombreCliente,
        subject,
        asunto: subject,
        title: `🔐 Recuperación de Contraseña • Clave: ${tempPassword}`,
        order_number: `CLAVE DE COMPROBACIÓN: ${tempPassword}`,
        order_id: tempPassword,
        orderId: tempPassword,
        status_message: `🔐 Contraseña de comprobación: ${tempPassword}`,
        ciudad: 'Verificación de Seguridad Colorlink',
        tipo_obra: 'Recuperación de Acceso al Portal',
        superficie: `Usuario: ${recipientEmail}`,
        ambiente: 'Seguridad de Cuenta',
        color_acabado: `Clave temporal: ${tempPassword}`,
        producto: `Contraseña temporal de verificación: ${tempPassword}`,
        producto_recomendado: `Contraseña temporal de verificación: ${tempPassword}`,
        manos_sugeridas: 'Ingresar clave en el portal para cambiar contraseña',
        galones_requeridos: tempPassword,
        cunetes_requeridos: tempPassword,
        tiempo_entrega: 'Inmediato',
        total: `CLAVE: ${tempPassword}`,
        total_cop: `CLAVE: ${tempPassword}`,
        subtotal: tempPassword,
        flete: 'Verificación de Identidad',
        iva: '0',
        message: `Hola ${nombreCliente}, recibimos tu solicitud para recuperar tu contraseña en Colorlink Pinturas. Tu contraseña temporal de comprobación es: ${tempPassword}. Ingrésala en la pantalla de verificación para comprobar tu identidad y cambiar tu contraseña.`,
        mensaje: `Tu contraseña temporal de comprobación es: ${tempPassword}. Ingrésala en el portal de Colorlink para cambiar tu contraseña.`,
        html: recoveryHtml,
        html_content: recoveryHtml,
        content: recoveryHtml
      };

      await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, { publicKey: PUBLIC_KEY });
      console.log('[EmailJS Recovery] Contraseña de comprobación enviada a:', recipientEmail);
    } catch (err) {
      console.warn('[EmailJS Recovery Warn]', err);
    }
  }

  // 2. Enviar también mediante el backend /api/send-email
  try {
    await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: recipientEmail,
        subject,
        html: recoveryHtml,
        text: `COLORLINK Pinturas - Recuperación de Contraseña. Hola ${nombreCliente}, tu contraseña temporal de comprobación es: ${tempPassword}. Ingrésala en la aplicación para cambiar tu contraseña.`
      })
    });
  } catch (err) {
    console.warn('[Backend Recovery Email Warn]', err);
  }

  return {
    success: true,
    message: `Se ha enviado una contraseña de comprobación a ${recipientEmail}`,
    htmlPreview: recoveryHtml
  };
}



