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
    return { success: true, message: `Correo enviado a ${recipientEmail}` };
  } catch (err: any) {
    return { success: false, message: err?.text || err?.message || 'Error al enviar correo con EmailJS' };
  }
}

/**
 * Envía el correo de bienvenida oficial de Colorlink® al registrarse un nuevo cliente.
 * Se envía EXCLUSIVAMENTE al registrarse una nueva cuenta.
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
      return { success: true, message: `Bienvenida enviada a ${recipientEmail}` };
    } catch (e: any) {
      console.warn('[EmailJS Welcome]', e);
    }
  }

  return { success: true, message: `Bienvenida registrada para ${recipientEmail}` };
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
}): Promise<{ success: boolean; message?: string }> {
  const recipientEmail = params.email?.trim();
  if (!recipientEmail || !recipientEmail.includes('@')) {
    return { success: false, message: 'Correo de destino inválido' };
  }

  const appOrigin = typeof window !== 'undefined' && window.location?.origin
    ? window.location.origin
    : 'https://ais-pre-tcjxjdywjtv5zjljxt2lry-427167179027.us-east5.run.app';

  const subject = `🎨 COLORLINK® • Actualización de Pedido #${params.orderId}: ${params.statusLabel}`;

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
                <td align="center" style="background:linear-gradient(135deg,#002B99 0%,#0055FF 55%,#00D2FF 100%);padding:30px 20px;color:#ffffff;text-align:center;">
                  <span style="font-size:24px;">🚚🎨</span>
                  <h1 style="margin:8px 0 4px;font-size:20px;font-weight:900;color:#ffffff;">ACTUALIZACIÓN DE DESPACHO</h1>
                  <p style="margin:0;font-size:13px;color:#e0f2fe;">Pedido #${params.orderId} • ${params.statusLabel}</p>
                </td>
              </tr>
              <tr>
                <td style="padding:24px;">
                  <p style="font-size:14px;color:#334155;margin:0 0 16px;">
                    Hola <strong>${params.responsable || params.cliente}</strong>,<br/>
                    Te informamos el avance del despacho para tu proyecto en <strong>${params.cliente}</strong>.
                  </p>
                  <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:12px;padding:14px;margin-bottom:16px;font-size:13px;line-height:1.7;">
                    <p style="margin:0;color:#0369a1;font-weight:800;text-transform:uppercase;font-size:11px;margin-bottom:6px;">Detalles de Estado</p>
                    <strong>Pedido:</strong> #${params.orderId}<br/>
                    <strong>Ciudad:</strong> ${params.ciudad || 'Medellín'}<br/>
                    <strong>Estado Actual:</strong> <span style="color:#0055FF;font-weight:800;">${params.statusLabel}</span>
                  </div>
                  <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;padding:14px;margin-bottom:16px;font-size:13px;line-height:1.6;color:#334155;white-space:pre-line;">
                    ${params.mensaje}
                  </div>
                  ${params.vehiculo ? `
                  <div style="background:#f8fafc;border-left:4px solid #10E57A;padding:12px 14px;border-radius:0 10px 10px 0;font-size:12px;color:#334155;line-height:1.6;margin-bottom:16px;">
                    🚚 <strong>Logística Asignada:</strong><br/>
                    • Vehículo: ${params.vehiculo} (Placa ${params.placa || 'WLL-482'})<br/>
                    • Conductor: ${params.conductor || 'Carlos Mario Henao'}
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

  // 1. Intentar con EmailJS si está configurado
  if (isEmailConfigured()) {
    const templateParams = {
      to_email: recipientEmail,
      user_email: recipientEmail,
      email: recipientEmail,
      reply_to: recipientEmail,
      to_name: params.responsable || params.cliente,
      name: params.responsable || params.cliente,
      cliente: params.cliente,
      responsable: params.responsable,
      order_number: params.orderId,
      order_id: params.orderId,
      status_message: params.statusLabel,
      ciudad: params.ciudad || 'Medellín',
      total: params.totalCOP ? formatCOP(params.totalCOP) : '$0 COP',
      total_cop: params.totalCOP ? formatCOP(params.totalCOP) : '$0 COP',
      message: params.mensaje,
      mensaje: params.mensaje,
      subject,
      asunto: subject,
      title: subject,
      html: htmlBody,
      html_content: htmlBody,
      content: htmlBody
    };

    try {
      console.log('[EmailJS] Enviando actualización de pedido a:', recipientEmail);
      const res = await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, { publicKey: PUBLIC_KEY });
      console.log('[EmailJS] ✓ Correo de actualización enviado:', res);
      return { success: true, message: `Actualización enviada a ${recipientEmail}` };
    } catch (err: any) {
      console.warn('[EmailJS] Falló EmailJS, intentando con backend /api/send-email:', err);
    }
  }

  // 2. Envío o registro mediante backend Express /api/send-email
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
      console.log('[BACKEND EMAIL SUCCESS]', data);
      return { success: true, message: `Correo oficial procesado para ${recipientEmail}` };
    }
  } catch (backendErr: any) {
    console.warn('[BACKEND EMAIL ERROR]', backendErr);
  }

  return { success: true, message: `Notificación registrada para ${recipientEmail}` };
}


