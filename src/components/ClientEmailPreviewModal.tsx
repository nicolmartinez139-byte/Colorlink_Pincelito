import React from 'react';
import {
  Mail,
  X,
  CheckCircle2,
  Download,
  Truck,
  Clock,
  Calendar,
  ShieldCheck,
  Package,
  Layers,
  Sparkles,
  MapPin,
  Lock,
  FileText
} from 'lucide-react';
import { ProjectFormData, TechnicalCalculationResult } from '../types/form';
import { formatCOP } from '../utils/calculator';
import { ColorlinkRainbowBar } from './ColorlinkSplashes';
import { ColorlinkPenguin } from './ColorlinkPenguin';


interface ClientEmailPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: ProjectFormData;
  technicalCalc: TechnicalCalculationResult;
  orderNumber: string;
  decisionTimestamp: string;
  onDownloadPDF: () => void;
}

export function ClientEmailPreviewModal({
  isOpen,
  onClose,
  formData,
  technicalCalc,
  orderNumber,
  decisionTimestamp,
  onDownloadPDF
}: ClientEmailPreviewModalProps) {
  if (!isOpen) return null;

  const presupuesto = technicalCalc.presupuesto;

  // Calcular fecha estimada de entrega
  const getEstimatedArrivalDate = (tiempoEntregaDias: string) => {
    const days = tiempoEntregaDias.includes('24') ? 1 : tiempoEntregaDias.includes('48') ? 2 : 3;
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toLocaleDateString('es-CO', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const fechaLlegada = getEstimatedArrivalDate(presupuesto.tiempoEntregaDias);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/40 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white w-full max-w-2xl max-h-[92vh] rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-scaleUp">
        {/* Barra de Colores Institucional Colorlink */}
        <ColorlinkRainbowBar className="h-1.5 w-full shrink-0" />

        {/* Cabecera del Cliente de Correo */}
        <div className="bg-gradient-to-r from-sky-600 via-sky-700 to-blue-800 text-white p-4 sm:p-5 flex items-center justify-between border-b border-sky-900/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 text-white border border-white/20 flex items-center justify-center shrink-0 shadow-2xs">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-wider font-mono font-bold bg-white/20 text-white border border-white/30 px-2 py-0.5 rounded-full">
                  Correo Transaccional Entregado
                </span>
                <span className="text-[11px] text-blue-100">Servidor Colorlink SMTP</span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white truncate max-w-md">
                Bandeja de Entrada: {formData.emailResponsable || 'correo@cliente.com'}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-blue-100 hover:text-white hover:bg-white/15 rounded-xl transition-colors cursor-pointer"
            title="Cerrar vista de correo"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Metadatos del Mensaje */}
        <div className="bg-slate-50 p-4 border-b border-slate-200 text-xs text-slate-600 space-y-1.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span className="font-bold text-slate-800">
              Asunto: <span className="font-semibold text-blue-700">🎨 COLORLINK® • Cotización Oficial & Estado de tu Pedido #{orderNumber}</span>
            </span>
            <span className="text-[11px] text-slate-500 shrink-0">{decisionTimestamp || 'Hace un momento'}</span>
          </div>
          <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-[11px]">
            <span>
              <strong>De:</strong> Colorlink Despachos &lt;notificaciones@colorlink.com.co&gt;
            </span>
            <span>
              <strong>Para:</strong> {formData.responsable || formData.cliente} &lt;{formData.emailResponsable}&gt;
            </span>
          </div>
        </div>

        {/* Cuerpo del Correo - Plantilla Colorida Profesional */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 text-slate-800 text-xs sm:text-sm">
          {/* ENCABEZADO VIBRANTE DE MARCA */}
          <div className="rounded-2xl p-6 bg-gradient-to-r from-[#002B99] via-[#0055FF] to-[#00D2FF] text-white text-center shadow-lg relative overflow-hidden">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/30 mb-3">
              <span className="text-xl">🐧🎨</span>
              <span className="font-black text-sm tracking-wider">COLORLINK®</span>
              <span className="text-[10px] font-black bg-white text-[#0055FF] px-2 py-0.5 rounded-full">PINTURAS</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              COTIZACIÓN OFICIAL APROBADA
            </h2>
            <p className="text-xs sm:text-sm text-sky-100 mt-1 font-medium">
              Especificación Técnica & Despacho a Obra #{orderNumber}
            </p>
            <div className="inline-block mt-3 px-3.5 py-1 rounded-full text-xs font-black bg-[#10E57A] text-slate-950 uppercase tracking-wider shadow-md">
              ✓ Cotización Confirmada & Registrada
            </div>
          </div>

          {/* Saludo al cliente */}
          <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-200 text-xs sm:text-sm text-slate-700 leading-relaxed">
            <p className="mb-2">
              Hola <strong className="text-slate-900 font-bold">{formData.responsable || formData.cliente}</strong>,
            </p>
            <p>
              Te confirmamos la liquidación de la cotización oficial para tu proyecto en <strong className="text-[#0055FF] font-bold">{formData.cliente}</strong> (NIT: <span className="font-mono">{formData.nitDocumento}</span>) con destino en <strong className="text-slate-900">{formData.ciudad}</strong>.
            </p>
          </div>

          {/* TABLA DE ESPECIFICACIÓN Y DOSIFICACIÓN CON FILAS ALTERNAS SUAVES */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-slate-900 tracking-wide flex items-center gap-1.5">
                <Package className="w-4 h-4 text-[#0055FF]" />
                Dosificación de Materiales Fabricados
              </span>
              <span className="text-[10px] font-bold text-slate-500">Norma NTC 1335</span>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full min-w-[460px] text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gradient-to-r from-[#0055FF] to-[#00D2FF] text-white">
                    <th className="py-2.5 px-3 font-bold">Presentación</th>
                    <th className="py-2.5 px-3 font-bold text-center">Cantidad</th>
                    <th className="py-2.5 px-3 font-bold">Uso Técnico Certificado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="bg-white">
                    <td className="py-2.5 px-3 font-bold text-slate-900">Cuñetes (5 Galones)</td>
                    <td className="py-2.5 px-3 font-black text-center text-[#FF5500] text-sm">{technicalCalc.cuñetesRequeridos}</td>
                    <td className="py-2.5 px-3 text-slate-600">Área general ({formData.areaM2} m²) a {technicalCalc.manosSugeridas} manos</td>
                  </tr>
                  <tr className="bg-slate-50/80">
                    <td className="py-2.5 px-3 font-bold text-slate-900">Galones Sueltos</td>
                    <td className="py-2.5 px-3 font-black text-center text-[#0055FF] text-sm">{technicalCalc.galonesSueltosRequeridos}</td>
                    <td className="py-2.5 px-3 text-slate-600">Ajuste técnico con {technicalCalc.factorDesperdicioPorcentaje}% de desperdicio</td>
                  </tr>
                  <tr className="bg-white">
                    <td className="py-2.5 px-3 font-bold text-slate-900">{formData.tipoPintura || 'Pintura Tipo 1'}</td>
                    <td className="py-2.5 px-3 font-black text-center text-emerald-600 text-sm">Acabado</td>
                    <td className="py-2.5 px-3 text-slate-600">Color: {formData.colorAcabado || 'Gris'} • Sustrato: {formData.superficie}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* RESUMEN ECONÓMICO RESALTADO EN COLOR VIVO */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-[#002B99] via-[#0055FF] to-[#00D2FF] text-white shadow-lg space-y-2">
            <div className="flex justify-between text-xs text-sky-100">
              <span>Subtotal Materiales:</span>
              <span className="font-mono font-bold text-white">{formatCOP(presupuesto.subtotalMateriales)} COP</span>
            </div>
            <div className="flex justify-between text-xs text-sky-100">
              <span>Flete Asegurado ({formData.ciudad}):</span>
              <span className="font-mono font-bold text-[#FFD000]">
                {presupuesto.fleteEnvio === 0 ? 'GRATIS' : `${formatCOP(presupuesto.fleteEnvio)} COP`}
              </span>
            </div>
            <div className="flex justify-between text-xs text-sky-100">
              <span>IVA (19% Legal):</span>
              <span className="font-mono font-bold text-white">{formatCOP(presupuesto.ivaValor)} COP</span>
            </div>
            <div className="pt-2 border-t border-white/20 flex items-center justify-between">
              <span className="font-black text-sm uppercase tracking-wider text-white">TOTAL OFICIAL (COP):</span>
              <span className="text-xl sm:text-2xl font-black text-[#FFD000] font-mono drop-shadow-sm">
                {formatCOP(presupuesto.totalPresupuesto)} COP
              </span>
            </div>
          </div>

          {/* BOTÓN CON DEGRADADO VIBRANTE */}
          <div className="text-center pt-1">
            <a
              href={`https://wa.me/573212460658?text=Hola%20Colorlink,%20acabo%20de%20revisar%20mi%20cotizaci%C3%B3n%20${orderNumber}%20para%20${encodeURIComponent(formData.cliente)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-[#FF5500] via-[#FF7700] to-[#FF007A] hover:brightness-110 text-white font-black text-xs uppercase tracking-wider rounded-full shadow-lg shadow-orange-500/25 transition-all cursor-pointer"
            >
              <span>Confirmar Despacho por WhatsApp 🚚</span>
            </a>
          </div>


          {/* En qué Bus / Furgón va, cuándo llega y a qué hora aproximada */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-blue-50/80 via-indigo-50/50 to-slate-50 border border-blue-200/90 space-y-3.5 shadow-2xs">
            <div className="flex items-center justify-between pb-2.5 border-b border-blue-200/70">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-blue-700" />
                <span className="text-xs font-black uppercase tracking-wider text-slate-900">
                  Hoja de Ruta & Vehículo de Transporte Asignado
                </span>
              </div>
              <span className="text-[10px] font-mono bg-blue-100 text-blue-800 border border-blue-200 px-2.5 py-0.5 rounded-md font-bold">
                Guía #REM-CLK-84291-CO
              </span>
            </div>

            {/* Datos del Furgón/Bus */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-white p-3.5 rounded-xl border border-blue-100/90 shadow-2xs space-y-1">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block">
                  ¿En qué vehículo de carga va?
                </span>
                <p className="font-bold text-slate-900 text-sm">
                  Furgón Enlace Troncal Colorlink #08
                </p>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Carrocería térmica climatizada para preservación de resinas acrílicas.
                </p>
                <div className="pt-1 flex items-center gap-2 text-[11px] text-blue-800 font-mono font-bold bg-blue-50/90 border border-blue-200 px-2 py-0.5 rounded-md w-fit">
                  <span>Placa: WLL-482 (Envigado)</span>
                </div>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-blue-100/90 shadow-2xs space-y-1">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block">
                  Conductor Asignado & Contacto
                </span>
                <p className="font-bold text-slate-900 text-sm">
                  Carlos Mario Restrepo
                </p>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Licencia C2 Transporte de Carga Especializada.
                </p>
                <div className="pt-1 text-[11px] text-emerald-800 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md w-fit">
                  Celular cabina: +57 311 890 2341
                </div>
              </div>
            </div>

            {/* Cuándo llega y hora aproximada */}
            <div className="p-3.5 rounded-xl bg-white border border-blue-200/80 shadow-2xs space-y-2 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="text-slate-600 flex items-center gap-1.5 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                  <strong>Fecha estimada de llegada:</strong>
                </span>
                <span className="font-bold text-blue-700 capitalize text-sm">
                  {fechaLlegada}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="text-slate-600 flex items-center gap-1.5 font-medium">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  <strong>Hora aproximada de entrega:</strong>
                </span>
                <span className="font-bold text-slate-900 text-sm">
                  10:30 AM a 12:30 PM (Jornada Mañana)
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pt-1.5 border-t border-slate-100">
                <span className="text-slate-600 flex items-center gap-1.5 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-sky-600" />
                  <strong>Destino de entrega:</strong>
                </span>
                <span className="text-slate-900 font-medium">
                  Obra en {formData.ciudad} ({formData.tipoObra})
                </span>
              </div>
            </div>
          </div>

          {/* Pie de mensaje */}
          <div className="text-slate-500 text-[11px] space-y-1 pt-2 border-t border-slate-100">
            <p>Este correo ha sido generado automáticamente por el sistema de Tintometría y Despachos Colorlink Pintuco.</p>
            <p>Si tienes dudas sobre tu entrega, comunícate con la línea de atención técnica nacional al 01 8000 111 247 o escribe a soporte@colorlink.com.co.</p>
          </div>
        </div>

        {/* Acciones del Modal */}
        <div className="bg-slate-100 p-4 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            Cerrar Notificación
          </button>
          <button
            type="button"
            onClick={onDownloadPDF}
            className="px-5 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Descargar Recibo en PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
}
