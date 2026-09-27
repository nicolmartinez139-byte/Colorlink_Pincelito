/**
 * Servicio de mensajería y enlace directo para WhatsApp en Colorlink® Pinturas
 */

export interface RegistrationWhatsAppParams {
  nombre: string;
  empresa: string;
  nit: string;
  telefono?: string;
  email: string;
}

export interface ReceiptWhatsAppParams {
  orderId: string;
  cliente: string;
  nit: string;
  responsable: string;
  telefono?: string;
  email?: string;
  ciudad: string;
  producto: string;
  marca?: string;
  metodoPago?: string;
  color: string;
  cunetes: number;
  galones: number;
  totalCOP: number;
  subtotalCOP: number;
  flete: string;
  tiempoEntregaDias?: number;
  fechaLlegada?: string;
}

export interface OrderStatusWhatsAppParams {
  orderId: string;
  cliente: string;
  responsable: string;
  telefono?: string;
  email?: string;
  ciudad?: string;
  status: 'aprobado' | 'preparando' | 'en_ruta' | 'entregado';
  producto?: string;
  color?: string;
  totalCOP?: number;
  vehiculo?: string;
  placa?: string;
  conductor?: string;
  horaEstimada?: string;
}

/**
 * Limpia y normaliza el número telefónico para formato internacional de WhatsApp.
 * Si es un número colombiano de 10 dígitos que inicia en 3, agrega el prefijo 57.
 */
export function formatWhatsAppPhone(phone?: string): string {
  if (!phone) return '';
  const digits = phone.replace(/[^0-9]/g, '');
  if (!digits) return '';

  // Si ya tiene código de país internacional (ej: 573...)
  if (digits.startsWith('57') && digits.length === 12) {
    return digits;
  }
  // Número celular estándar Colombia (10 dígitos, ej: 3212460658)
  if (digits.length === 10 && digits.startsWith('3')) {
    return `57${digits}`;
  }
  return digits;
}

function formatCOP(val: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  }).format(val);
}

/**
 * 1. Mensaje para Confirmación de Registro
 */
export function generateRegistrationWhatsAppMessage(params: RegistrationWhatsAppParams): string {
  const nombre = params.nombre?.trim() || 'Cliente';
  const empresa = params.empresa?.trim() || 'Empresa Registrada';
  const nit = params.nit?.trim() || 'No especificado';
  const tel = params.telefono?.trim() || 'No registrado';
  const email = params.email?.trim() || 'No registrado';

  return `🎨 *COLORLINK® PINTURAS • REGISTRO EXITOSO* 🎨

¡Hola *${nombre}*! Te confirmamos que tu registro en Colorlink Pinturas ha sido completado y guardado exitosamente en nuestra base de datos.

📋 *DATOS DE TU CUENTA REGISTRADA:*
• *Nombre del Cliente:* ${nombre}
• *Nombre de la Empresa:* ${empresa}
• *NIT / Documento:* ${nit}
• *Teléfono:* ${tel}
• *Correo Electrónico:* ${email}

✅ *ESTADO DE LA CUENTA:*
Tu cuenta corporativa está activa para liquidar requerimientos en obra, calcular dosificación de galones y cuñetes en tiempo real y emitir cotizaciones oficiales.

¡Bienvenido a Colorlink Pinturas!`;
}

/**
 * 2. Mensaje para Recibo Oficial de Pedido / Cotización Aprobada
 */
export function generateReceiptWhatsAppMessage(params: ReceiptWhatsAppParams): string {
  const nombre = params.responsable?.trim() || 'Cliente';
  const empresa = params.cliente?.trim() || 'Constructora';
  const orderId = params.orderId || 'CLK-2026';
  const total = formatCOP(params.totalCOP);
  const subtotal = formatCOP(params.subtotalCOP);

  return `🧾 *COLORLINK® PINTURAS • RECIBO OFICIAL DE COMPRA #${orderId}* 🧾

¡Hola *${nombre}*! Confirmamos la liquidación y emisión del recibo oficial para tu obra en *${empresa}*.

📋 *RESUMEN FISCAL & TÉCNICO:*
• *Número de Pedido:* #${orderId}
• *Cliente / Empresa:* ${empresa}
• *NIT / Documento:* ${params.nit}
• *Ciudad de Entrega:* ${params.ciudad}
• *Marca de Pintura:* ${params.marca || 'Pintuco®'}
• *Especificación Técnica:* ${params.producto} (${params.color})
• *Dosificación Requerida:* ${params.cunetes} Cuñete(s) (5 gal) y ${params.galones} Galón(es)

💰 *DETALLE DE PAGO & LIQUIDACIÓN:*
• *Subtotal Materiales:* ${subtotal} COP
• *Flete Logístico:* ${params.flete || 'GRATIS'}
• *TOTAL OFICIAL:* *${total} COP*
• *Método de Pago Seleccionado:* ${params.metodoPago || 'Transferencia Bancolombia / QR'}
• *Fecha Estimada de Llegada:* ${params.fechaLlegada || '1 a 2 días hábiles'}

🚚 *ESTADO LOGÍSTICO:*
Tu orden ha sido registrada en el CEDI Central Colorlink (Medellín/Itagüí) para tintometría automatizada. También hemos enviado una copia del recibo a tu correo: ${params.email || 'registrado'}.

¡Gracias por construir con Colorlink® Pinturas!`;
}

/**
 * 3. Mensaje para Actualizaciones de Estado del Pedido
 */
export function generateOrderStatusWhatsAppMessage(params: OrderStatusWhatsAppParams): string {
  const nombre = params.responsable?.trim() || 'Cliente';
  const empresa = params.cliente?.trim() || 'Constructora';
  const orderId = params.orderId || 'CLK-2026';

  let estadoTitulo = 'ACTUALIZACIÓN DE PEDIDO';
  let estadoDetalle = '';
  let icono = '🔔';

  switch (params.status) {
    case 'aprobado':
      icono = '🟢';
      estadoTitulo = 'PEDIDO APROBADO Y CONFIRMADO';
      estadoDetalle = `Tu pedido ha sido aprobado formalmente y programado para preparación inmediata en nuestra planta central de tintometría.`;
      break;
    case 'preparando':
      icono = '🟡';
      estadoTitulo = 'EN PREPARACIÓN & TINTOMETRÍA';
      estadoDetalle = `Nuestros químicos y operarios de laboratorio están preparando y dosificando tu pintura con los pigmentos y resinas oficiales en planta.`;
      break;
    case 'en_ruta':
      icono = '🚚';
      estadoTitulo = 'PEDIDO DESPACHADO • EN CAMINO A TU OBRA';
      estadoDetalle = `El pedido fue cargado y va en camino hacia *${params.ciudad || 'tu obra'}*.
• *Vehículo Asignado:* ${params.vehiculo || 'Furgón Colorlink #08'} (Placa: ${params.placa || 'WLL-482'})
• *Conductor:* ${params.conductor || 'Carlos Restrepo'}
• *Llegada Estimada:* ${params.horaEstimada || '10:30 AM - 12:30 PM'}
• *Ruta:* Optimización por IA para evitar embotellamientos viales.`;
      break;
    case 'entregado':
      icono = '✅';
      estadoTitulo = 'PEDIDO ENTREGADO A SATISFACCIÓN';
      estadoDetalle = `El furgón ha completado la entrega de los materiales en tu obra. Recibido conforme por el personal autorizado.`;
      break;
  }

  return `${icono} *COLORLINK® PINTURAS • ${estadoTitulo}* ${icono}

Estimado(a) *${nombre}* (*${empresa}*), te informamos el estado en tiempo real de tu pedido *#${orderId}*:

📍 *ESTADO ACTUAL:*
${estadoDetalle}

${params.producto ? `📦 *Producto:* ${params.producto} (${params.color || 'Acabado Estándar'})` : ''}
${params.totalCOP ? `💵 *Total:* ${formatCOP(params.totalCOP)} COP` : ''}

Por favor ten personal disponible en obra para la recepción.
Atentamente,
*Equipo de Logística & Tintometría Colorlink®* 🐧🎨`;
}

/**
 * URLs directas para WhatsApp
 */
export function getWhatsAppRegistrationUrl(params: RegistrationWhatsAppParams): string {
  const cleanPhone = formatWhatsAppPhone(params.telefono);
  const message = generateRegistrationWhatsAppMessage(params);
  const encodedText = encodeURIComponent(message);
  return cleanPhone
    ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedText}`
    : `https://api.whatsapp.com/send?text=${encodedText}`;
}

export function getWhatsAppReceiptUrl(params: ReceiptWhatsAppParams): string {
  const cleanPhone = formatWhatsAppPhone(params.telefono);
  const message = generateReceiptWhatsAppMessage(params);
  const encodedText = encodeURIComponent(message);
  return cleanPhone
    ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedText}`
    : `https://api.whatsapp.com/send?text=${encodedText}`;
}

export function getWhatsAppOrderStatusUrl(params: OrderStatusWhatsAppParams): string {
  const cleanPhone = formatWhatsAppPhone(params.telefono);
  const message = generateOrderStatusWhatsAppMessage(params);
  const encodedText = encodeURIComponent(message);
  return cleanPhone
    ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedText}`
    : `https://api.whatsapp.com/send?text=${encodedText}`;
}

/**
 * Notificación por Webhook si existe
 */
export async function sendWhatsAppNotification(params: RegistrationWhatsAppParams): Promise<{
  success: boolean;
  message?: string;
  whatsappUrl: string;
}> {
  const whatsappUrl = getWhatsAppRegistrationUrl(params);
  const webhookUrl = (
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_WHATSAPP_WEBHOOK_URL) ||
    (typeof process !== 'undefined' && process.env?.VITE_WHATSAPP_WEBHOOK_URL) ||
    ''
  ) as string;

  if (webhookUrl) {
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: formatWhatsAppPhone(params.telefono),
          rawPhone: params.telefono,
          nombre: params.nombre,
          empresa: params.empresa,
          nit: params.nit,
          email: params.email,
          message: generateRegistrationWhatsAppMessage(params),
          timestamp: new Date().toISOString()
        })
      });

      if (response.ok) {
        console.log('[WhatsApp API] ✓ Notificación enviada por webhook');
        return { success: true, message: 'Enviado por webhook WhatsApp', whatsappUrl };
      }
    } catch (err) {
      console.warn('[WhatsApp API] Error al enviar al webhook:', err);
    }
  }

  return {
    success: true,
    message: 'Enlace de WhatsApp listo para envío',
    whatsappUrl
  };
}
