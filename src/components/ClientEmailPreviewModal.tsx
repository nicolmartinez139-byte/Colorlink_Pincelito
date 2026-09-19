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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-2xl max-h-[92vh] rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-scaleUp">
        {/* Barra de Colores Institucional Colorlink */}
        <ColorlinkRainbowBar className="h-1.5 w-full shrink-0" />

        {/* Cabecera del Cliente de Correo */}
        <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-800 text-white p-4 sm:p-5 flex items-center justify-between border-b border-blue-900/30">
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
              Asunto: <span className="font-semibold text-blue-700">Cotización Aceptada #{orderNumber} • Confirmación de Registro, Recibo Oficial y Logística de Despacho</span>
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

        {/* Cuerpo del Correo */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 text-slate-800 text-xs sm:text-sm">
          {/* Saludo y Confirmación de Cuenta */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50/60 border border-blue-200 space-y-2">
            <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>¡Hola, {formData.responsable || formData.cliente}! Tu cuenta ha sido creada exitosamente</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              Te confirmamos que tu registro en el sistema <strong>Colorlink de Pintuco</strong> se completó con éxito para la empresa <strong>{formData.cliente}</strong> (NIT o documento: <strong>{formData.nitDocumento}</strong>).
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-700 font-medium">
              <span className="bg-white px-2.5 py-1 rounded-lg border border-blue-200 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-blue-600" /> Usuario: <strong>{formData.emailResponsable}</strong>
              </span>
              <span className="bg-white px-2.5 py-1 rounded-lg border border-blue-200 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-blue-600" /> Contraseña: <strong>•••••••• (Registrada)</strong>
              </span>
            </div>
          </div>

          {/* Adjunto del Recibo Oficial */}
          <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-blue-950 block">
                    Recibo Oficial de Cotización #{orderNumber}.pdf
                  </span>
                  <span className="text-[11px] text-blue-800">
                    Documento comercial con validez tributaria y firma autorizada
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={onDownloadPDF}
                className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Descargar Recibo PDF</span>
              </button>
            </div>

            {/* Fila Técnica de Manos y Desperdicio en el Correo */}
            <div className="pt-2 border-t border-blue-200/80 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-blue-950">
              <div className="bg-white/90 p-2.5 rounded-xl border border-blue-200">
                <span className="text-[10px] text-blue-800 font-bold block flex items-center gap-1">
                  <Layers className="w-3 h-3 text-blue-700" /> Número de Manos:
                </span>
                <strong className="text-xs">{technicalCalc.manosSugeridas} manos de Pintura {formData.tipoPintura || 'Tipo 1'}</strong>
                <p className="text-[10px] text-slate-600 mt-0.5">{technicalCalc.explicacionManos}</p>
              </div>

              <div className="bg-white/90 p-2.5 rounded-xl border border-blue-200">
                <span className="text-[10px] text-blue-800 font-bold block flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-600" /> Factor de Desperdicio Técnico:
                </span>
                <strong className="text-xs">+{technicalCalc.factorDesperdicioPorcentaje}% (+{technicalCalc.galonesDesperdicio} galones)</strong>
                <p className="text-[10px] text-slate-600 mt-0.5">
                  Base neta: {technicalCalc.galonesNetosSinDesperdicio} gal ➔ Total despachado: {technicalCalc.galonesRequeridos} gal.
                </p>
              </div>
            </div>

            <div className="text-right pt-1">
              <span className="text-xs text-blue-900 font-medium">Total liquidado a pagar: </span>
              <strong className="text-sm font-black text-blue-950 font-mono">
                {formatCOP(presupuesto.totalPresupuesto)} COP
              </strong>
            </div>
          </div>

          {/* En qué Bus / Furgón va, cuándo llega y a qué hora aproximada */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-blue-50/80 via-indigo-50/50 to-slate-50 border border-blue-200/90 space-y-3.5 shadow-2xs">
            <div className="flex items-center justify-between pb-2.5 border-b border-blue-200/70">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-blue-700" />
                <span className="text-xs font-black uppercase tracking-wider text-blue-950">
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
                <span className="font-bold text-blue-900 capitalize text-sm">
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
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
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
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Descargar Recibo en PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
}
