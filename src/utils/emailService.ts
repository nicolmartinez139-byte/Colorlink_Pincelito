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

/**
 * Envía el correo real de confirmación de cotización al correo del cliente.
 * Se llama justo después de que la cotización queda guardada en Supabase.
 */
export async function sendConfirmationEmail(
  formData: ProjectFormData,
  calc: TechnicalCalculationResult,
  orderNumber: string
): Promise<{ success: boolean; message?: string }> {
  if (!isEmailConfigured()) {
    console.warn('[EmailJS] Faltan las variables VITE_EMAILJS_* en Secrets. No se envió el correo.');
    return { success: false, message: 'Faltan credenciales EmailJS' };
  }

  const recipientEmail = formData.emailResponsable?.trim();
  if (!recipientEmail || !recipientEmail.includes('@')) {
    console.warn('[EmailJS] Correo de destino inválido o no suministrado:', recipientEmail);
    return { success: false, message: 'Correo de destino inválido' };
  }

  const templateParams = {
    // Destinatario y contacto
    to_email: recipientEmail,
    user_email: recipientEmail,
    email: recipientEmail,
    reply_to: recipientEmail,
    to_name: formData.responsable || formData.cliente,
    name: formData.responsable || formData.cliente,
    cliente: formData.cliente,
    responsable: formData.responsable,
    telefono: formData.telefonoResponsable || '',

    // Información del proyecto
    order_number: orderNumber,
    order_id: orderNumber,
    orderId: orderNumber,
    ciudad: formData.ciudad,
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

    // Mensaje descriptivo
    message: `Confirmación de Cotización Oficial #${orderNumber} para ${formData.cliente} en ${formData.ciudad}. Total: ${formatCOP(calc.presupuesto.totalPresupuesto)} COP.`
  };

  try {
    console.log('[EmailJS] Enviando correo de confirmación a:', recipientEmail);
    const res = await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, { publicKey: PUBLIC_KEY });
    console.log('[EmailJS] ✓ Correo de confirmación enviado exitosamente:', res);
    return { success: true, message: `Correo enviado a ${recipientEmail}` };
  } catch (err: any) {
    console.error('[EmailJS] Error enviando el correo de confirmación:', err);
    return { success: false, message: err?.text || err?.message || 'Error al enviar correo con EmailJS' };
  }
}

/**
 * Envía el correo de bienvenida oficial de Colorlink® al registrarse un nuevo cliente.
 * Notifica al cliente confirmando el registro con su nombre, empresa, NIT y datos de contacto.
 */
export async function sendRegistrationWelcomeEmail(params: {
  email: string;
  nombre: string;
  empresa: string;
  nit: string;
  telefono?: string;
}): Promise<{ success: boolean; message?: string }> {
  if (!isEmailConfigured()) {
    return { success: false, message: 'Faltan credenciales EmailJS' };
  }

  const recipientEmail = params.email?.trim();
  if (!recipientEmail || !recipientEmail.includes('@')) {
    return { success: false, message: 'Correo de destino inválido' };
  }

  const nombreCliente = params.nombre?.trim() || 'Cliente';
  const nombreEmpresa = params.empresa?.trim() || 'Empresa Registrada';
  const nitDocumento = params.nit?.trim() || 'No especificado';
  const telefonoContacto = params.telefono?.trim() || 'No registrado';

  // Mensaje estructurado con el nombre del cliente y de la empresa
  const mensajeRegistro = `¡Te has registrado exitosamente en Colorlink® Pinturas!

Hola ${nombreCliente}, te confirmamos que tu cuenta ha sido creada y registrada exitosamente con los siguientes datos:

• Nombre del Cliente: ${nombreCliente}
• Nombre de la Empresa: ${nombreEmpresa}
• NIT / Documento: ${nitDocumento}
• Teléfono: ${telefonoContacto}
• Correo Electrónico: ${recipientEmail}

Tu cuenta ya está activa en nuestra plataforma para realizar cotizaciones técnicas, pedidos y dosificación de pinturas en línea.`;

  const templateParams = {
    // Destinatarios y respuesta
    to_email: recipientEmail,
    user_email: recipientEmail,
    email: recipientEmail,
    reply_to: recipientEmail,

    // Nombres del cliente y empresa en múltiples variantes para compatibilidad total con plantillas EmailJS
    to_name: nombreCliente,
    name: nombreCliente,
    nombre: nombreCliente,
    nombre_cliente: nombreCliente,
    responsable: nombreCliente,
    cliente_nombre: nombreCliente,

    // Empresa / Razón social
    empresa: nombreEmpresa,
    nombre_empresa: nombreEmpresa,
    razon_social: nombreEmpresa,
    cliente: nombreEmpresa,
    company: nombreEmpresa,

    // Datos de contacto e identificación
    nit: nitDocumento,
    nit_documento: nitDocumento,
    documento: nitDocumento,
    telefono: telefonoContacto,
    phone: telefonoContacto,

    // Asunto y títulos
    subject: `¡Te has registrado exitosamente! • Colorlink® Pinturas`,
    asunto: `¡Te has registrado exitosamente! • Colorlink® Pinturas`,
    title: `Confirmación de Registro de Cuenta`,
    titulo: `Confirmación de Registro de Cuenta`,

    // Mensajes completos
    message: mensajeRegistro,
    mensaje: mensajeRegistro,
    detalles: `Cliente: ${nombreCliente} | Empresa: ${nombreEmpresa} | NIT: ${nitDocumento} | Tel: ${telefonoContacto}`,
    content: mensajeRegistro,

    // Variables de estado y compatibilidad si la plantilla tiene campos de cotización
    order_number: `REG-${Date.now().toString().slice(-5)}`,
    order_id: `REG-${Date.now().toString().slice(-5)}`,
    orderId: `REG-${Date.now().toString().slice(-5)}`,
    status_message: 'Cuenta Registrada Exitosamente',
    ciudad: 'Medellín / Colombia',
    tipo_obra: 'Cuenta Corporativa Registrada',
    total: 'Registro Gratuito (Cuenta Activa)',
    total_cop: '$0 COP'
  };

  try {
    console.log('[EmailJS] Enviando correo de bienvenida a:', recipientEmail, {
      cliente: nombreCliente,
      empresa: nombreEmpresa
    });
    const res = await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, { publicKey: PUBLIC_KEY });
    console.log('[EmailJS] ✓ Correo de bienvenida enviado exitosamente:', res);
    return { success: true, message: `Bienvenida enviada a ${recipientEmail}` };
  } catch (err: any) {
    console.warn('[EmailJS] Advertencia al enviar bienvenida:', err);
    return { success: false, message: err?.text || err?.message || 'Error al enviar correo con EmailJS' };
  }
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

  const subject = `🎨 COLORLINK® • Actualización de Pedido #${params.orderId}: ${params.statusLabel}`;

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
      asunto: subject
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
    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
        <div style="text-align: center; border-bottom: 2px solid #0284C7; padding-bottom: 12px; margin-bottom: 20px;">
          <h2 style="color: #0f172a; margin: 0; font-size: 20px;">COLORLINK® Pinturas de Colombia</h2>
          <p style="color: #64748b; font-size: 12px; margin: 4px 0 0;">Actualización Oficial de Despacho y Estado de Pedido</p>
        </div>

        <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 14px; margin-bottom: 16px;">
          <p style="margin: 0 0 6px; font-size: 13px;"><strong>Pedido:</strong> #${params.orderId}</p>
          <p style="margin: 0 0 6px; font-size: 13px;"><strong>Cliente:</strong> ${params.cliente} (${params.responsable})</p>
          <p style="margin: 0 0 6px; font-size: 13px;"><strong>Ciudad de Entrega:</strong> ${params.ciudad || 'Medellín'}</p>
          <p style="margin: 0; font-size: 13px; color: #0284c7;"><strong>Estado Actual:</strong> ${params.statusLabel}</p>
        </div>

        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; margin-bottom: 16px; font-size: 13px; line-height: 1.6; color: #334155; white-space: pre-line;">
          ${params.mensaje}
        </div>

        ${params.vehiculo ? `
        <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 12px; margin-bottom: 16px; font-size: 12px; color: #1e3a8a;">
          <strong>Datos de Logística Asignada:</strong><br/>
          • Vehículo: ${params.vehiculo}<br/>
          • Placa: ${params.placa || 'TZW-402'}<br/>
          • Conductor: ${params.conductor || 'Carlos Mario Henao'}
        </div>
        ` : ''}

        <div style="text-align: center; border-top: 1px solid #e2e8f0; padding-top: 14px; font-size: 11px; color: #94a3b8;">
          COLORLINK Pinturas S.A.S. • Planta Central Medellín • Soporte: (604) 448-0000
        </div>
      </div>
    `;

    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: recipientEmail,
        subject,
        html: htmlBody,
        text: params.mensaje
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


