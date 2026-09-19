import emailjs from '@emailjs/browser';
import { ProjectFormData, TechnicalCalculationResult } from '../types/form';

// Configura estos 3 valores como Secrets en AI Studio (Settings > Secrets):
//   VITE_EMAILJS_SERVICE_ID   = service_qf0c7fg
//   VITE_EMAILJS_TEMPLATE_ID  = template_fq5wnko
//   VITE_EMAILJS_PUBLIC_KEY   = 3RRGbuXHPRyKyJLZ0
const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID as string;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID as string;
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY as string;

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
): Promise<void> {
  if (!isEmailConfigured()) {
    console.warn('[EmailJS] Faltan las variables VITE_EMAILJS_* en Secrets. No se envió el correo.');
    return;
  }

  const templateParams = {
    to_email: formData.emailResponsable,
    name: formData.responsable,
    cliente: formData.cliente,
    order_number: orderNumber,
    ciudad: formData.ciudad,
    tipo_obra: formData.tipoObra,
    producto_recomendado: calc.productoRecomendado,
    manos_sugeridas: calc.manosSugeridas,
    galones_requeridos: calc.galonesRequeridos,
    tiempo_entrega: calc.presupuesto.tiempoEntregaDias,
    total: formatCOP(calc.presupuesto.totalPresupuesto)
  };

  try {
    await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, { publicKey: PUBLIC_KEY });
  } catch (err) {
    // No detenemos el flujo del usuario si el correo falla: el proyecto ya quedó guardado en Supabase
    console.error('[EmailJS] Error enviando el correo de confirmación:', err);
  }
}
