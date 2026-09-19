import { formatCOP } from '../utils/calculator';
import { ProjectFormData } from '../types/form';
import { SupabaseOrder } from './supabaseService';

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

  const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>${resolvedSubject}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 20px; color: #1e293b; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; }
    .header { background: linear-gradient(135deg, #1d4ed8 0%, #4338ca 50%, #db2777 100%); padding: 30px 25px; text-align: center; color: #ffffff; }
    .header h1 { margin: 10px 0 4px; font-size: 24px; font-weight: 900; letter-spacing: -0.5px; }
    .header p { margin: 0; font-size: 13px; opacity: 0.95; }
    .status-badge { display: inline-block; background: #10b981; color: #ffffff; font-size: 11px; font-weight: 800; padding: 4px 12px; border-radius: 20px; margin-top: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
    .content { padding: 25px 25px 15px; }
    .greeting { font-size: 15px; line-height: 1.5; color: #334155; margin-bottom: 20px; }
    .order-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 18px; margin-bottom: 20px; }
    .order-title { font-size: 13px; font-weight: 800; text-transform: uppercase; color: #64748b; margin-bottom: 12px; letter-spacing: 0.5px; }
    .data-row { display: flex; justify-content: space-between; font-size: 13px; padding: 6px 0; border-bottom: 1px dashed #e2e8f0; }
    .data-row:last-child { border-bottom: none; }
    .data-label { color: #64748b; }
    .data-value { font-weight: 700; color: #0f172a; text-align: right; }
    .table-spec { width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 13px; }
    .table-spec th { background: #eff6ff; color: #1d4ed8; text-align: left; padding: 10px; font-weight: 800; border-radius: 6px 6px 0 0; }
    .table-spec td { padding: 10px; border-bottom: 1px solid #f1f5f9; }
    .total-box { background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%); color: #ffffff; border-radius: 14px; padding: 20px; margin: 20px 0; border: 1px solid #3b82f6; }
    .total-row { display: flex; justify-content: space-between; align-items: baseline; }
    .total-label { font-size: 13px; color: #bfdbfe; font-weight: 700; }
    .total-amount { font-size: 22px; font-weight: 900; color: #ffffff; font-family: monospace; }
    .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
    .footer a { color: #2563eb; text-decoration: none; font-weight: 600; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div style="font-size: 36px; line-height: 1;">🐧🎨</div>
      <h1>COLORLINK® PINTURAS</h1>
      <p>Especificación Técnica Oficial & Despacho a Obra</p>
      <div class="status-badge">${statusMessage || 'Pedido Recibido & Registrado en Supabase'}</div>
    </div>

    <div class="content">
      <div class="greeting">
        Hola <strong>${formData.responsable || 'Cliente'}</strong>,<br>
        Confirmamos que hemos recibido y liquidado satisfactoriamente los requerimientos para tu obra en <strong>${formData.cliente || 'Constructora'}</strong>.
      </div>

      <div class="order-box">
        <div class="order-title">Detalles del Proyecto & Despacho</div>
        <div class="data-row"><span class="data-label">Código de Pedido:</span><span class="data-value">${orderId || 'PED-2026-081'}</span></div>
        <div class="data-row"><span class="data-label">Cliente / Razón Social:</span><span class="data-value">${formData.cliente}</span></div>
        <div class="data-row"><span class="data-label">NIT / Documento:</span><span class="data-value">${formData.nitDocumento}</span></div>
        <div class="data-row"><span class="data-label">Ciudad de Entrega:</span><span class="data-value">${formData.ciudad}</span></div>
        <div class="data-row"><span class="data-label">Área a Cubrir:</span><span class="data-value">${formData.areaM2} m²</span></div>
        <div class="data-row"><span class="data-label">Sustrato & Ambiente:</span><span class="data-value">${formData.superficie} • ${formData.ambiente}</span></div>
        <div class="data-row"><span class="data-label">Color & Acabado:</span><span class="data-value">${formData.colorAcabado}</span></div>
        <div class="data-row"><span class="data-label">Fecha Programada:</span><span class="data-value">${formData.fechaRequerida || 'Prioritaria'}</span></div>
      </div>

      <div class="order-box">
        <div class="order-title">Dosificación de Material Fabricado</div>
        <table class="table-spec">
          <tr><th>Presentación</th><th>Cantidad</th><th>Uso Técnico</th></tr>
          <tr>
            <td><strong>Cuñetes (5 Galones)</strong></td>
            <td><strong>${calculation.cuñetes} cuñetes</strong></td>
            <td>Área general (2 manos recomendadas)</td>
          </tr>
          <tr>
            <td><strong>Galones Adicionales</strong></td>
            <td><strong>${calculation.galones} galones</strong></td>
            <td>Ajuste exacto con 10% de desperdicio</td>
          </tr>
        </table>
      </div>

      <div class="total-box">
        <div class="total-row" style="margin-bottom: 6px; font-size: 12px; color: #dbeafe;">
          <span>Subtotal Pinturas:</span>
          <span style="font-family: monospace;">${formatCOP(calculation.subtotalCOP)}</span>
        </div>
        <div class="total-row" style="margin-bottom: 6px; font-size: 12px; color: #dbeafe;">
          <span>Flete Especial a ${formData.ciudad}:</span>
          <span style="font-family: monospace;">${calculation.fleteCOP === 0 ? 'GRATIS (Medellín/Metropolitana)' : formatCOP(calculation.fleteCOP)}</span>
        </div>
        <div class="total-row" style="border-top: 1px solid rgba(255,255,255,0.25); padding-top: 10px; margin-top: 8px;">
          <span class="total-label">TOTAL LIQUIDADO (IVA Inc):</span>
          <span class="total-amount">${formatCOP(calculation.totalCOP)} COP</span>
        </div>
      </div>

      <p style="font-size: 12px; color: #64748b; line-height: 1.6;">
        🚚 <strong>Seguimiento de Despacho:</strong> Tu pedido ha sido enlazado a nuestra flota de furgones. Nuestro asistente <strong>Pincelito 🐧</strong> y la asesora técnica Arq. Sofía Martínez coordinarán la hora exacta de entrega con el transportador.
      </p>
    </div>

    <div class="footer">
      <p>COLORLINK PINTURAS S.A.S. • NIT 900.854.219-1 • Planta Central Itagüí, Antioquia</p>
      <p>Línea Constructoras & WhatsApp: +57 (604) 448-0000 • <a href="mailto:ventas@colorlink.com.co">ventas@colorlink.com.co</a></p>
      <p style="font-size: 10px; color: #cbd5e1; margin-top: 10px;">Este es un correo oficial generado automáticamente. No respondas a este mensaje si ya estás en contacto con tu asesor.</p>
    </div>
  </div>
</body>
</html>
  `.trim();

  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to,
        subject: resolvedSubject,
        html: htmlContent,
        text: `COLORLINK PINTURAS - Pedido #${orderId || 'CLK'}. Total: ${formatCOP(calculation.totalCOP)} COP. Cliente: ${formData.cliente}.`,
        pdfBase64,
        pdfFileName: `Cotizacion_Colorlink_${orderId || 'CLK'}.pdf`
      })
    });

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('[EMAIL CLIENT ERROR]', error);
    return {
      success: false,
      message: 'No se pudo conectar con el servidor de correos',
      error: error.message
    };
  }
}
