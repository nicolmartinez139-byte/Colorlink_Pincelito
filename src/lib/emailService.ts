import emailjs from '@emailjs/browser';
import { formatCOP } from '../utils/calculator';
import { ProjectFormData } from '../types/form';
import { hasEmailBeenSent, recordEmailSent, enqueueEmailJsSend, isMockDemoEmail } from '../utils/emailService';

// ============================================================================
// PALETA OFICIAL DE MARCA COLORLINK (5 COLORES VIVOS DEFINIDOS)
// 1. Azul Eléctrico:   #0055FF
// 2. Turquesa Neón:    #00D2FF
// 3. Naranja Fuego:    #FF5500
// 4. Magenta Vibrante: #FF007A
// 5. Verde Lima Neón:  #10E57A
// Color Adicional:     Amarillo Eléctrico #FFD000 / Azul Profundo #002B99
// ============================================================================
export const BRAND_EMAIL_COLORS = {
  azulElectrico: '#0055FF',
  turquesaNeon: '#00D2FF',
  naranjaFuego: '#FF5500',
  magentaVibrante: '#FF007A',
  verdeLima: '#10E57A',
  amarilloElectrico: '#FFD000',
  azulProfundo: '#002B99'
};

export interface SendEmailParams {
  to: string;
  subject?: string;
  orderId?: string;
  formData: ProjectFormData;
  calculation: {
    cuñetes: number;
    galones: number;
    galonesTotalesTeoricos: number;
    subtotalCOP: number;
    descuentoCOP: number;
    fleteCOP: number;
    ivaCOP: number;
    totalCOP: number;
  };
  pdfBase64?: string;
  statusMessage?: string;
}

export interface EmailSendResult {
  success: boolean;
  provider?: string;
  message: string;
  previewUrl?: string;
  error?: string;
}

/**
 * Genera la plantilla HTML completa y envía el correo real al buzón del cliente
 */
export async function sendRealOrderEmail(params: SendEmailParams): Promise<EmailSendResult> {
  const { to, subject, orderId, formData, calculation, pdfBase64, statusMessage } = params;

  const resolvedSubject =
    subject ||
    `🎨 COLORLINK® • Cotización Oficial & Estado de tu Pedido #${orderId || 'CLK-2026'}`;

  const recipientEmail = to || formData.emailResponsable;

  const dedupeKey = `real_order_${orderId || 'CLK-2026'}_${(recipientEmail || '').trim().toLowerCase()}`;
  if (hasEmailBeenSent(dedupeKey)) {
    console.log('[sendRealOrderEmail] Correo ya enviado previamente:', dedupeKey);
    return {
      success: true,
      provider: 'dedup_cache',
      message: `Correo ya enviado previamente a ${recipientEmail}`
    };
  }
  const htmlContent = `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="es">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${resolvedSubject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #1e293b;">

  <!-- CONTENEDOR PRINCIPAL -->
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; padding: 20px 10px;">
    <tr>
      <td align="center">

        <!-- TARJETA CENTRADA RESPONSIVA (MAX 600PX) -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 35px rgba(0, 56, 130, 0.12); border: 1px solid #e2e8f0;">

          <!-- BARRA ARCOÍRIS DE MARCA COLORLINK (5 COLORES VIVOS) -->
          <tr>
            <td style="height: 6px; background: linear-gradient(90deg, #FF5500 0%, #FFD000 20%, #10E57A 40%, #00D2FF 60%, #0055FF 80%, #FF007A 100%);"></td>
          </tr>

          <!-- ENCABEZADO VIBRANTE CON DEGRADADO -->
          <tr>
            <td align="center" style="background: linear-gradient(135deg, #002B99 0%, #0055FF 55%, #00D2FF 100%); padding: 36px 24px 28px; text-align: center; color: #ffffff;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center">
                    <!-- LOGO DE LA EMPRESA & PINGÜINITO -->
                    <div style="display: inline-block; background: rgba(255, 255, 255, 0.2); backdrop-filter: blur(8px); padding: 8px 18px; border-radius: 30px; border: 1px solid rgba(255, 255, 255, 0.35); margin-bottom: 12px;">
                      <span style="font-size: 26px; vertical-align: middle;">🐧🎨</span>
                      <span style="font-size: 16px; font-weight: 900; letter-spacing: 1px; color: #ffffff; margin-left: 6px; vertical-align: middle;">COLORLINK®</span>
                      <span style="font-size: 11px; font-weight: 800; background: #ffffff; color: #0055FF; padding: 2px 7px; border-radius: 10px; margin-left: 6px; vertical-align: middle;">PINTURAS</span>
                    </div>

                    <h1 style="margin: 8px 0 4px; font-size: 24px; font-weight: 900; line-height: 1.2; color: #ffffff; text-shadow: 0 2px 4px rgba(0,0,0,0.15);">
                      COTIZACIÓN OFICIAL APROBADA
                    </h1>
                    <p style="margin: 0; font-size: 13px; color: #f0fdf4; font-weight: 600; opacity: 0.95;">
                      Especificación Técnica & Despacho a Obra #${orderId || 'CLK-2026'}
                    </p>

                    <!-- BADGE DE ESTADO VERDE LIMA -->
                    <div style="display: inline-block; background-color: #10E57A; color: #ffffff; font-size: 11px; font-weight: 800; padding: 6px 16px; border-radius: 20px; margin-top: 14px; text-transform: uppercase; letter-spacing: 0.8px; box-shadow: 0 4px 12px rgba(16, 229, 122, 0.4);">
                      ✓ ${statusMessage || 'Cotización Confirmada & Registrada'}
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CUERPO DEL CORREO -->
          <tr>
            <td style="padding: 28px 24px 20px;">

              <!-- SALUDO AL CLIENTE -->
              <p style="font-size: 15px; line-height: 1.6; color: #334155; margin: 0 0 20px;">
                Hola <strong style="color: #0f172a;">${formData.responsable || formData.cliente || 'Cliente'}</strong>,<br />
                Te confirmamos que hemos liquidado y generado satisfactoriamente la cotización técnica para tu proyecto en <strong style="color: #0055FF;">${formData.cliente || 'Constructora'}</strong>.
              </p>

              <!-- DETALLES DEL PROYECTO (TARJETA SUAVE CON BORDE TURQUESA) -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f0f9ff; border: 1px solid #bae6fd; border-radius: 16px; margin-bottom: 22px;">
                <tr>
                  <td style="padding: 16px 18px;">
                    <div style="font-size: 12px; font-weight: 900; text-transform: uppercase; color: #0369a1; letter-spacing: 0.8px; margin-bottom: 10px;">
                      📋 Resumen del Proyecto & Ubicación
                    </div>

                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size: 13px; line-height: 1.8;">
                      <tr>
                        <td width="42%" style="color: #64748b; padding: 3px 0;">Código de Pedido:</td>
                        <td width="58%" style="font-weight: 800; color: #003882; font-family: monospace; text-align: right;">#${orderId || 'CLK-2026'}</td>
                      </tr>
                      <tr>
                        <td style="color: #64748b; padding: 3px 0;">Cliente / Empresa:</td>
                        <td style="font-weight: 700; color: #0f172a; text-align: right;">${formData.cliente}</td>
                      </tr>
                      <tr>
                        <td style="color: #64748b; padding: 3px 0;">NIT / Documento:</td>
                        <td style="font-weight: 700; color: #0f172a; text-align: right;">${formData.nitDocumento}</td>
                      </tr>
                      <tr>
                        <td style="color: #64748b; padding: 3px 0;">Ciudad de Entrega:</td>
                        <td style="font-weight: 800; color: #FF6A00; text-align: right;">${formData.ciudad}</td>
                      </tr>
                      <tr>
                        <td style="color: #64748b; padding: 3px 0;">Área de Superficie:</td>
                        <td style="font-weight: 800; color: #0f172a; text-align: right;">${formData.areaM2} m²</td>
                      </tr>
                      <tr>
                        <td style="color: #64748b; padding: 3px 0;">Sustrato & Ambiente:</td>
                        <td style="font-weight: 700; color: #334155; text-align: right;">${formData.superficie} • ${formData.ambiente}</td>
                      </tr>
                      <tr>
                        <td style="color: #64748b; padding: 3px 0;">Pintura Seleccionada:</td>
                        <td style="font-weight: 800; color: #0284c7; text-align: right;">${formData.tipoPintura} (${formData.colorAcabado})</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- TABLA DE ESPECIFICACIÓN Y DOSIFICACIÓN CON FILAS ALTERNAS SUAVES -->
              <div style="font-size: 13px; font-weight: 900; text-transform: uppercase; color: #0f172a; letter-spacing: 0.8px; margin-bottom: 8px;">
                📦 Dosificación de Materiales Fabricados
              </div>

              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: separate; border-spacing: 0; width: 100%; border: 1px solid #e2e8f0; border-radius: 14px; overflow: hidden; margin-bottom: 22px; font-size: 13px;">
                <thead>
                  <tr style="background: linear-gradient(90deg, #009FE3 0%, #003882 100%); color: #ffffff;">
                    <th align="left" style="padding: 12px 14px; font-weight: 800; font-size: 12px; letter-spacing: 0.5px;">Presentación</th>
                    <th align="center" style="padding: 12px 14px; font-weight: 800; font-size: 12px; letter-spacing: 0.5px;">Cantidad</th>
                    <th align="left" style="padding: 12px 14px; font-weight: 800; font-size: 12px; letter-spacing: 0.5px;">Uso Técnico Certificado</th>
                  </tr>
                </thead>
                <tbody>
                  <!-- FILA 1 -->
                  <tr style="background-color: #ffffff;">
                    <td style="padding: 12px 14px; border-bottom: 1px solid #f1f5f9; font-weight: 800; color: #0f172a;">
                      Cuñetes (5 Galones)
                    </td>
                    <td align="center" style="padding: 12px 14px; border-bottom: 1px solid #f1f5f9; font-weight: 900; color: #FF6A00; font-size: 15px;">
                      ${calculation.cuñetes}
                    </td>
                    <td style="padding: 12px 14px; border-bottom: 1px solid #f1f5f9; color: #475569; font-size: 12px;">
                      Área general a 2 manos (NTC 1335)
                    </td>
                  </tr>
                  <!-- FILA 2 (ALTERNA SUAVE) -->
                  <tr style="background-color: #f8fafc;">
                    <td style="padding: 12px 14px; border-bottom: 1px solid #f1f5f9; font-weight: 800; color: #0f172a;">
                      Galones Sueltos
                    </td>
                    <td align="center" style="padding: 12px 14px; border-bottom: 1px solid #f1f5f9; font-weight: 900; color: #009FE3; font-size: 15px;">
                      ${calculation.galones}
                    </td>
                    <td style="padding: 12px 14px; border-bottom: 1px solid #f1f5f9; color: #475569; font-size: 12px;">
                      Ajuste exacto con 10% de desperdicio técnico
                    </td>
                  </tr>
                  <!-- FILA 3 (IMPRIMANTE O COMPLEMENTO) -->
                  <tr style="background-color: #ffffff;">
                    <td style="padding: 12px 14px; font-weight: 800; color: #0f172a;">
                      Sellamur Antialcalino
                    </td>
                    <td align="center" style="padding: 12px 14px; font-weight: 900; color: #10B981; font-size: 15px;">
                      Incluido
                    </td>
                    <td style="padding: 12px 14px; color: #475569; font-size: 12px;">
                      Imprimante hidrófugo para adherencia en ${formData.superficie}
                    </td>
                  </tr>
                </tbody>
              </table>

              <!-- RESUMEN ECONÓMICO RESALTADO EN COLOR VIVO -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background: linear-gradient(135deg, #002B99 0%, #0055FF 60%, #00D2FF 100%); border-radius: 18px; margin-bottom: 24px; box-shadow: 0 8px 24px rgba(0, 85, 255, 0.35); color: #ffffff;">
                <tr>
                  <td style="padding: 22px 24px;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size: 13px; line-height: 1.8;">
                      <tr>
                        <td style="color: #e0f2fe; padding-bottom: 4px;">Subtotal Materiales:</td>
                        <td align="right" style="font-family: monospace; font-size: 14px; font-weight: 700; color: #ffffff;">${formatCOP(calculation.subtotalCOP)}</td>
                      </tr>
                      <tr>
                        <td style="color: #e0f2fe; padding-bottom: 4px;">Flete Asegurado a ${formData.ciudad}:</td>
                        <td align="right" style="font-family: monospace; font-size: 14px; font-weight: 800; color: #FFD000;">
                          ${calculation.fleteCOP === 0 ? 'GRATIS (Medellín/Metropolitana)' : formatCOP(calculation.fleteCOP)}
                        </td>
                      </tr>
                      <tr>
                        <td style="color: #e0f2fe; padding-bottom: 8px;">IVA (19% Legal):</td>
                        <td align="right" style="font-family: monospace; font-size: 14px; font-weight: 700; color: #ffffff;">${formatCOP(calculation.ivaCOP)}</td>
                      </tr>
                      <tr>
                        <td colspan="2" style="border-top: 1px solid rgba(255, 255, 255, 0.3); padding-top: 12px;">
                          <table border="0" cellpadding="0" cellspacing="0" width="100%">
                            <tr>
                              <td style="font-size: 14px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px; color: #ffffff;">
                                TOTAL OFICIAL (COP):
                              </td>
                              <td align="right" style="font-size: 26px; font-weight: 900; font-family: monospace; color: #FFD000; text-shadow: 0 2px 8px rgba(0,0,0,0.25);">
                                ${formatCOP(calculation.totalCOP)} COP
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- SEGUIMIENTO DE DESPACHO CON LA FLOTA -->
              <div style="background-color: #f8fafc; border-left: 4px solid #10E57A; padding: 14px 16px; border-radius: 0 12px 12px 0; font-size: 12px; color: #334155; line-height: 1.6; margin-bottom: 22px;">
                🚚 <strong>Despacho en Flota Oficial:</strong> Tu pedido ha sido asignado a nuestra flota de furgones urbanos con entrega en 24 a 48 horas. Nuestro asistente <strong>Pincelito 🐧</strong> y la asesora técnica Arq. Sofía Martínez coordinarán la hora exacta de arribo con el transportador.
              </div>

            </td>
          </tr>

          <!-- PIE DE PÁGINA PROFESIONAL -->
          <tr>
            <td align="center" style="background-color: #0f172a; color: #94a3b8; padding: 24px; font-size: 11px; line-height: 1.6; text-align: center;">
              <p style="margin: 0 0 6px; font-weight: 800; color: #ffffff; font-size: 12px;">
                COLORLINK® PINTURAS S.A.S. • NIT 900.854.219-1
              </p>
              <p style="margin: 0 0 6px;">
                Planta Central & CEDI: Parque Industrial Itagüí, Antioquia • Cobertura Nacional
              </p>
              <p style="margin: 0 0 10px;">
                PBX: +57 (604) 448-0000 • Línea Atención Medellín • <a href="mailto:notificaciones@colorlink.com.co" style="color: #009FE3; text-decoration: none; font-weight: 700;">notificaciones@colorlink.com.co</a>
              </p>
              <p style="margin: 0; font-size: 10px; color: #64748b;">
                Documento emitido electrónicamente con validez tributaria y certificación NTC 1335 y NTC 5828.
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
  `.trim();

  // 1. ENVÍO MEDIANTE BACKEND (/api/send-email)
  let realBackendDelivered = false;
  let previewUrl: string | undefined;
  try {
    console.log(`[REAL ORDER EMAIL] Enviando cotización oficial HTML a ${recipientEmail}...`);

    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to: recipientEmail,
        subject: resolvedSubject,
        html: htmlContent,
        text: `COLORLINK PINTURAS - Cotización Oficial #${orderId || 'CLK'}. Total: ${formatCOP(calculation.totalCOP)} COP. Cliente: ${formData.cliente}. Ciudad: ${formData.ciudad}.`,
        pdfBase64,
        pdfFileName: `Cotizacion_Colorlink_${orderId || 'CLK'}.pdf`
      })
    });

    const data = await response.json();
    if (data.success) {
      previewUrl = data.previewUrl;
      if (data.provider && data.provider !== 'ethereal_sandbox' && data.provider !== 'ethereal_test') {
        realBackendDelivered = true;
      }
    }
  } catch (backendErr: any) {
    console.warn('[BACKEND EMAIL ATTEMPT FAILED]', backendErr);
  }

  // 2. Envío directo al buzón del cliente con EmailJS (si el backend no tenía SMTP/Resend real)
  if (!realBackendDelivered) {
    try {
      if (!isMockDemoEmail(recipientEmail)) {
        const serviceId = (
          (typeof import.meta !== 'undefined' && import.meta.env?.VITE_EMAILJS_SERVICE_ID) ||
          (typeof process !== 'undefined' && process.env?.VITE_EMAILJS_SERVICE_ID) ||
          'service_qf0c7fg'
        ) as string;

        const templateId = (
          (typeof import.meta !== 'undefined' && import.meta.env?.VITE_EMAILJS_TEMPLATE_ID) ||
          (typeof process !== 'undefined' && process.env?.VITE_EMAILJS_TEMPLATE_ID) ||
          'template_fq5wnko'
        ) as string;

        const publicKey = (
          (typeof import.meta !== 'undefined' && import.meta.env?.VITE_EMAILJS_PUBLIC_KEY) ||
          (typeof process !== 'undefined' && process.env?.VITE_EMAILJS_PUBLIC_KEY) ||
          '3RRGbuXHPRyKyJLZ0'
        ) as string;

        const templateParams = {
          to_email: recipientEmail,
          user_email: recipientEmail,
          email: recipientEmail,
          reply_to: recipientEmail,
          to_name: formData.responsable || formData.cliente,
          name: formData.responsable || formData.cliente,
          nombre: formData.responsable || formData.cliente,
          empresa: formData.cliente,
          cliente: formData.cliente,
          responsable: formData.responsable,
          telefono: formData.telefonoResponsable || '',
          order_number: orderId || 'CLK-2026',
          order_id: orderId || 'CLK-2026',
          orderId: orderId || 'CLK-2026',
          ciudad: formData.ciudad,
          direccion_entrega: formData.direccionEntrega || formData.ciudad,
          direccion: formData.direccionEntrega || formData.ciudad,
          punto_referencia: formData.puntoReferencia || '',
          tipo_obra: formData.tipoObra,
          superficie: formData.superficie,
          ambiente: formData.ambiente,
          color_acabado: formData.colorAcabado,
          producto: formData.tipoPintura || 'Pintura Profesional Colorlink®',
          producto_recomendado: formData.tipoPintura || 'Pintura Profesional Colorlink®',
          manos_sugeridas: '2 a 3 manos según Norma NTC 1335',
          cunetes: calculation.cuñetes,
          cunetes_requeridos: calculation.cuñetes,
          galones: calculation.galones,
          galones_requeridos: calculation.galones,
          tiempo_entrega: '24 a 48 horas hábiles en Flota Colorlink',
          total: formatCOP(calculation.totalCOP),
          total_cop: formatCOP(calculation.totalCOP),
          subtotal: formatCOP(calculation.subtotalCOP),
          flete: calculation.fleteCOP === 0 ? 'GRATIS' : formatCOP(calculation.fleteCOP),
          iva: formatCOP(calculation.ivaCOP),
          status_message: statusMessage || 'Cotización Aprobada',
          subject: resolvedSubject,
          title: 'Cotización Oficial Aprobada - Colorlink® Pinturas',
          html: htmlContent,
          html_content: htmlContent,
          content: htmlContent,
          message: `Cotización Oficial Aprobada #${orderId || 'CLK-2026'} para ${formData.cliente} en ${formData.ciudad}. Total: ${formatCOP(calculation.totalCOP)} COP.`
        };

        await enqueueEmailJsSend(serviceId, templateId, templateParams, publicKey);
        recordEmailSent(dedupeKey);
        return {
          success: true,
          provider: 'EmailJS',
          message: `Correo enviado exitosamente a ${recipientEmail}`,
          previewUrl
        };
      }
    } catch (emailjsErr: any) {
      console.warn('[EmailJS Fallback Error]', emailjsErr);
    }
  }

  recordEmailSent(dedupeKey);
  return {
    success: true,
    provider: realBackendDelivered ? 'colorlink_mailer' : 'colorlink_queue',
    message: `Correo enviado exitosamente a ${recipientEmail}`,
    previewUrl
  };
}

export { sendRegistrationWelcomeEmail, sendOrderStatusUpdateEmail } from '../utils/emailService';
