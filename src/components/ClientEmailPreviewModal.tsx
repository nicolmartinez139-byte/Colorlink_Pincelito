import React, { useState, useEffect } from 'react';
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
  MapPin,
  Sparkles
} from 'lucide-react';
import { ProjectFormData, TechnicalCalculationResult } from '../types/form';
import { formatCOP } from '../utils/calculator';
import { ColorlinkRainbowBar } from './ColorlinkSplashes';
import { buildOrderStateMessage } from '../utils/orderStateMessages';

interface ClientEmailPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: ProjectFormData;
  technicalCalc: TechnicalCalculationResult;
  orderNumber: string | null;
  decisionTimestamp: string;
  onDownloadPDF: () => void;
  currentPhase?: 'aceptado' | 'preparando' | 'en_ruta' | 'entregado';
}

export function ClientEmailPreviewModal({
  isOpen,
  onClose,
  formData,
  technicalCalc,
  orderNumber,
  decisionTimestamp,
  onDownloadPDF,
  currentPhase = 'aceptado'
}: ClientEmailPreviewModalProps) {
  const [previewPhase, setPreviewPhase] = useState<'aceptado' | 'preparando' | 'en_ruta' | 'entregado'>(currentPhase);

  useEffect(() => {
    setPreviewPhase(currentPhase);
  }, [currentPhase, isOpen]);

  if (!isOpen) return null;

  const presupuesto = technicalCalc.presupuesto;
  const safeOrderNum = orderNumber || 'ORD-CLK-2026';

  const mappedStatus = previewPhase === 'aceptado' ? 'pendiente' : previewPhase;
  const stateMsg = buildOrderStateMessage({
    status: mappedStatus,
    orderId: safeOrderNum,
    cliente: formData.cliente || 'Constructora / Proyecto',
    responsable: formData.responsable || formData.cliente || 'Cliente Colorlink',
    color: formData.colorAcabado || 'Blanco Puro',
    tipoPintura: formData.tipoPintura || 'Pintura Tipo 1 Exterior',
    ciudad: formData.ciudad || 'Medellín',
    totalCOP: presupuesto.totalPresupuesto,
    cuñetes: technicalCalc.cuñetesRequeridos
  });

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

  // Configuración visual dinámica por cada estado del pedido
  const phaseConfig = {
    aceptado: {
      subject: `📋 COLORLINK® • Pedido Confirmado #${safeOrderNum} (En espera de Tintometría - 2s)`,
      bannerGradient: 'from-amber-600 via-orange-600 to-amber-500',
      bannerEmoji: '📋⏳',
      bannerTitle: 'PEDIDO CONFIRMADO Y EN COLA DE LABORATORIO',
      bannerSubtitle: `Orden #${safeOrderNum} registrada • Ingresando a Tintometría en 2 segundos`,
      badgeText: '✓ Paso 1/4: Pedido Radicado • Pasa a Tintometría (2s)',
      badgeClass: 'bg-white text-amber-950',
      calloutBg: 'bg-amber-50/90 border-amber-300 text-amber-950',
      calloutTitle: '📋 Mensaje de Estado: Pedido Recibido en Planta',
      extraDetail: `Se ha verificado la disponibilidad de ${technicalCalc.cuñetesRequeridos} cuñete(s) de ${formData.tipoPintura || 'Tipo 1'} en la sede de ${formData.ciudad || 'Medellín'}. A los 2 segundos tu pedido pasará automáticamente a formulación computarizada de color.`
    },
    preparando: {
      subject: `🎨 COLORLINK® • Tu Pedido #${safeOrderNum} ingresó al Laboratorio de Tintometría`,
      bannerGradient: 'from-[#003882] via-[#0072CE] to-[#00D2FF]',
      bannerEmoji: '🧪🎨',
      bannerTitle: 'PEDIDO EN LABORATORIO DE TINTOMETRÍA (2 SEG)',
      bannerSubtitle: `Dosificación computarizada activa para "${formData.colorAcabado || 'Color Específico'}" • ${stateMsg.lote}`,
      badgeText: '🎨 Paso 2/4: Formulación de Pigmentos en Curso',
      badgeClass: 'bg-[#10E57A] text-slate-950',
      calloutBg: 'bg-sky-50/90 border-sky-300 text-sky-950',
      calloutTitle: '🧪 Mensaje de Estado: Preparación y Dosificación en Tintometría',
      extraDetail: `Nuestros químicos están inyectando los pigmentos de alta pureza para el tono "${formData.colorAcabado || 'Seleccionado'}" sobre base ${formData.tipoPintura || 'Tipo 1'} con agitación giroscópica a 1.400 RPM (${stateMsg.lote}). En 20 minutos se notificará la salida del camión.`
    },
    en_ruta: {
      subject: `🚚 COLORLINK® • ¡Se está Despachando tu Pedido #${safeOrderNum} hacia ${formData.ciudad}!`,
      bannerGradient: 'from-indigo-800 via-purple-700 to-blue-700',
      bannerEmoji: '🚚🛣️',
      bannerTitle: '¡PEDIDO DESPACHANDO Y EN RUTA A TU OBRA!',
      bannerSubtitle: `Viajando en ${stateMsg.logistica.vehiculo} (Placa ${stateMsg.logistica.placa}) • Remisión #${stateMsg.remision}`,
      badgeText: `🚚 Paso 3/4: En Ruta con ${stateMsg.logistica.conductor} (ETA: ${stateMsg.logistica.tiempoEstimado})`,
      badgeClass: 'bg-amber-300 text-slate-950',
      calloutBg: 'bg-purple-50/90 border-purple-300 text-purple-950',
      calloutTitle: '🚚 Mensaje de Estado: Despacho Activo en Ruta Vial',
      extraDetail: `Tu pedido terminó tintometría a los 20 minutos y ya salió por ${stateMsg.logistica.corredorRuta} conducido por ${stateMsg.logistica.conductor} (Tel: ${stateMsg.logistica.telefono}). Lleva remisión física #${stateMsg.remision}.`
    },
    entregado: {
      subject: `✅ COLORLINK® • ¡Pedido #${safeOrderNum} Entregado con Éxito en Obra y Garantía NTC 1335!`,
      bannerGradient: 'from-emerald-800 via-emerald-600 to-teal-500',
      bannerEmoji: '✅🏆',
      bannerTitle: '¡PEDIDO ENTREGADO CON ÉXITO EN OBRA!',
      bannerSubtitle: `Recibido conforme en ${formData.ciudad} • Remisión #${stateMsg.remision} Firmada`,
      badgeText: '✅ Paso 4/4: Entrega Completada & Certificado NTC 1335 Emitido',
      badgeClass: 'bg-white text-emerald-950',
      calloutBg: 'bg-emerald-50/90 border-emerald-300 text-emerald-950',
      calloutTitle: '✅ Mensaje de Estado: Entrega Finalizada y Garantía Activa',
      extraDetail: `El conductor ${stateMsg.logistica.conductor} completó la descarga de los ${technicalCalc.cuñetesRequeridos} cuñete(s) y ${technicalCalc.galonesSueltosRequeridos} galón(es) en obra. Queda radicado tu Certificado de Calidad Norma Icontec NTC 1335 (${stateMsg.lote}).`
    }
  }[previewPhase];

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
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] uppercase tracking-wider font-mono font-bold bg-white/20 text-white border border-white/30 px-2 py-0.5 rounded-full">
                  Mensaje Dinámico según Estado
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

        {/* Selector de Estado para previsualizar cómo cambia el mensaje según el estado */}
        <div className="bg-slate-100 px-4 py-2.5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span className="text-[11px] font-extrabold text-slate-700 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-sky-600" />
            <span>Ver mensaje según el estado del pedido:</span>
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { id: 'aceptado', label: '1. Confirmado' },
              { id: 'preparando', label: '2. Tintometría (2s)' },
              { id: 'en_ruta', label: '3. Despachando (20m)' },
              { id: 'entregado', label: '4. Entregado (20m)' }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setPreviewPhase(tab.id as any)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                  previewPhase === tab.id
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                {tab.label}
                {currentPhase === tab.id && ' (Actual)'}
              </button>
            ))}
          </div>
        </div>

        {/* Metadatos del Mensaje */}
        <div className="bg-slate-50 p-4 border-b border-slate-200 text-xs text-slate-600 space-y-1.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span className="font-bold text-slate-800">
              Asunto: <span className="font-semibold text-blue-700">{phaseConfig.subject}</span>
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
            <span className="font-mono text-[10px] bg-sky-100 text-sky-900 px-2 py-0.5 rounded-md font-bold">
              Estado: {stateMsg.statusLabel}
            </span>
          </div>
        </div>

        {/* Cuerpo del Correo - Plantilla Dinámica según el Estado */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 text-slate-800 text-xs sm:text-sm">
          {/* ENCABEZADO VIBRANTE QUE CAMBIA SEGÚN EL ESTADO */}
          <div className={`rounded-2xl p-6 bg-gradient-to-r ${phaseConfig.bannerGradient} text-white text-center shadow-lg relative overflow-hidden transition-all`}>
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/30 mb-3">
              <span className="text-xl">{phaseConfig.bannerEmoji}</span>
              <span className="font-black text-sm tracking-wider">COLORLINK®</span>
              <span className="text-[10px] font-black bg-white text-slate-900 px-2 py-0.5 rounded-full">PINTURAS</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {phaseConfig.bannerTitle}
            </h2>
            <p className="text-xs sm:text-sm text-white/90 mt-1 font-medium">
              {phaseConfig.bannerSubtitle}
            </p>
            <div className={`inline-block mt-3 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-md ${phaseConfig.badgeClass}`}>
              {phaseConfig.badgeText}
            </div>
          </div>

          {/* BLOQUE PRINCIPAL DE MENSAJE ESPECÍFICO DEL ESTADO */}
          <div className={`p-4 sm:p-5 rounded-2xl border-2 space-y-2.5 ${phaseConfig.calloutBg}`}>
            <div className="flex items-center justify-between border-b border-current/15 pb-2">
              <strong className="text-xs sm:text-sm font-black uppercase tracking-wide">
                {phaseConfig.calloutTitle}
              </strong>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-white/80 text-slate-900 border border-slate-200">
                {stateMsg.lote}
              </span>
            </div>
            <p className="text-xs sm:text-sm whitespace-pre-line leading-relaxed font-medium">
              {stateMsg.mensajeEmail}
            </p>
            <div className="p-3 rounded-xl bg-white/85 border border-slate-200/80 text-xs text-slate-700 leading-relaxed">
              <strong>Detalle Operativo de esta Fase:</strong> {phaseConfig.extraDetail}
            </div>
          </div>

          {/* TABLA DE ESPECIFICACIÓN Y DOSIFICACIÓN CON FILAS ALTERNAS SUAVES */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-slate-900 tracking-wide flex items-center gap-1.5">
                <Package className="w-4 h-4 text-[#0055FF]" />
                Dosificación de Materiales Fabricados
              </span>
              <span className="text-[10px] font-bold text-slate-500">Norma NTC 1335 • {stateMsg.remision}</span>
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

          {/* Hoja de Ruta & Vehículo de Transporte Asignado según Ciudad y Estado */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-blue-50/80 via-indigo-50/50 to-slate-50 border border-blue-200/90 space-y-3.5 shadow-2xs">
            <div className="flex items-center justify-between pb-2.5 border-b border-blue-200/70">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-blue-700" />
                <span className="text-xs font-black uppercase tracking-wider text-slate-900">
                  {previewPhase === 'entregado'
                    ? 'Certificación de Entrega y Remisión Firmada en Obra'
                    : previewPhase === 'en_ruta'
                    ? 'Vehículo en Tránsito Activo hacia tu Obra'
                    : 'Unidad de Transporte Reservada para tu Despacho'}
                </span>
              </div>
              <span className="text-[10px] font-mono bg-blue-100 text-blue-800 border border-blue-200 px-2.5 py-0.5 rounded-md font-bold">
                Guía #{stateMsg.remision}
              </span>
            </div>

            {/* Datos del Furgón/Bus */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-white p-3.5 rounded-xl border border-blue-100/90 shadow-2xs space-y-1">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block">
                  Vehículo de Flota ({formData.ciudad})
                </span>
                <p className="font-bold text-slate-900 text-sm">
                  {stateMsg.logistica.vehiculo}
                </p>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Ruta: {stateMsg.logistica.corredorRuta}
                </p>
                <div className="pt-1 flex items-center gap-2 text-[11px] text-blue-800 font-mono font-bold bg-blue-50/90 border border-blue-200 px-2 py-0.5 rounded-md w-fit">
                  <span>Placa: {stateMsg.logistica.placa}</span>
                </div>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-blue-100/90 shadow-2xs space-y-1">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block">
                  Conductor Asignado & Contacto
                </span>
                <p className="font-bold text-slate-900 text-sm">
                  {stateMsg.logistica.conductor}
                </p>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Tiempo estimado de ruta: {stateMsg.logistica.tiempoEstimado}
                </p>
                <div className="pt-1 text-[11px] text-emerald-800 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md w-fit">
                  Celular cabina: +57 {stateMsg.logistica.telefono}
                </div>
              </div>
            </div>

            {/* Cuándo llega y hora aproximada */}
            <div className="p-3.5 rounded-xl bg-white border border-blue-200/80 shadow-2xs space-y-2 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="text-slate-600 flex items-center gap-1.5 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                  <strong>Estado logístico:</strong>
                </span>
                <span className="font-bold text-blue-700 text-sm">
                  {stateMsg.statusLabel} ({fechaLlegada})
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pt-1.5 border-t border-slate-100">
                <span className="text-slate-600 flex items-center gap-1.5 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-sky-600" />
                  <strong>Destino de entrega:</strong>
                </span>
                <span className="text-slate-900 font-medium">
                  {formData.direccionEntrega ? `${formData.direccionEntrega}, ` : ''}Obra en {formData.ciudad} ({formData.tipoObra})
                </span>
              </div>
            </div>
          </div>

          {/* Pie de mensaje */}
          <div className="text-slate-500 text-[11px] space-y-1 pt-2 border-t border-slate-100">
            <p>Este correo dinámico cambia automáticamente de acuerdo con el estado real de tu pedido en Colorlink® Pinturas.</p>
          </div>
        </div>

        {/* Acciones del Modal */}
        <div className="bg-slate-100 p-4 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            Cerrar Vista Previa
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
