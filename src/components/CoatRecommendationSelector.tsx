import React from 'react';
import { Layers, CheckCircle2, Sparkles, AlertTriangle, Bot, Check, ShieldCheck } from 'lucide-react';
import { getRealisticCoatsRecommendation } from '../utils/calculator';
import { PaintTypeCategory } from '../types/form';

interface CoatRecommendationSelectorProps {
  tipoPintura?: PaintTypeCategory;
  marcaPintura?: string;
  colorAcabado?: string;
  colorSecundario?: string;
  dosColoresHabilitado?: boolean;
  superficie?: string;
  condicion?: string;
  tipoObra?: string;
  value?: number; // manos seleccionadas (1, 2, 3, 4)
  onChange: (manos: number) => void;
  areaM2?: number;
}

export function CoatRecommendationSelector({
  tipoPintura = 'Tipo 1',
  marcaPintura = 'Pintuco®',
  colorAcabado = 'Blanco Puro',
  colorSecundario,
  dosColoresHabilitado = false,
  superficie = 'Concreto / Revoque',
  condicion = 'Nueva sin pintar',
  tipoObra = 'Muros Interiores',
  value,
  onChange,
  areaM2 = 0
}: CoatRecommendationSelectorProps) {
  const coatRec = getRealisticCoatsRecommendation(
    tipoPintura,
    superficie,
    condicion,
    tipoObra,
    marcaPintura,
    colorAcabado,
    colorSecundario,
    dosColoresHabilitado
  );
  const manosRecomendadas = coatRec.manos;
  const manosActivas = (value && value >= 1 && value <= 4) ? value : manosRecomendadas;
  const esDiferenteDeRecomendada = manosActivas !== manosRecomendadas;

  const colorDescripcion = dosColoresHabilitado
    ? `Dúo [Base: ${colorAcabado} + Acento: ${colorSecundario || 'Acento'}]`
    : (colorAcabado || 'Tono Estándar');

  const COAT_OPTIONS = [
    {
      manos: 1,
      titulo: '1 Mano',
      subtitulo: 'Mantenimiento / Cielos',
      detalle: 'Óptimo para techos o cielos rasos en buen estado, o repintes de color idéntico sin cambiar de tono.'
    },
    {
      manos: 2,
      titulo: '2 Manos',
      subtitulo: 'Estándar Oficial NTC 1335',
      detalle: '1ª mano de anclaje uniforme y 2ª mano de cubrimiento superior al 96% con textura lavable.'
    },
    {
      manos: 3,
      titulo: '3 Manos',
      subtitulo: 'Refuerzo Técnico / Madera / DFT',
      detalle: 'Indispensable en maderas (barniz NTC 1148), membranas elastoméricas (DFT >150µm), revoques vírgenes o cambio drástico de color.'
    },
    {
      manos: 4,
      titulo: '4 Manos',
      subtitulo: 'Protección Extrema',
      detalle: 'Tráfico industrial severo de montacargas, inmersión continua o ambientes marinos de corrosión C5.'
    }
  ];

  return (
    <div className="space-y-4 p-5 sm:p-6 rounded-3xl border-2 border-blue-200/90 bg-gradient-to-br from-blue-50/70 via-white to-sky-50/50 shadow-sm transition-all animate-fadeIn">
      {/* HEADER: DICTAMEN DE INTELIGENCIA ARTIFICIAL TRAS SELECCIÓN DE MARCA Y COLOR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-blue-100">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#0055FF] via-[#0072CE] to-[#00D2FF] text-white flex items-center justify-center font-bold shadow-md shrink-0">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-black tracking-wider text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full border border-blue-200">
                Dictamen Técnico de IA Colorlink®
              </span>
              <span className="text-[10px] text-slate-500 font-mono font-bold">
                {coatRec.norma}
              </span>
            </div>
            <h4 className="text-sm sm:text-base font-black text-slate-900 mt-0.5">
              La IA Determinó que se Requieren: <strong className="text-blue-700 underline decoration-blue-300 underline-offset-4">{manosRecomendadas} {manosRecomendadas === 1 ? 'Mano' : 'Manos de Pintura'}</strong>
            </h4>
          </div>
        </div>

        {/* Resumen de Parámetros Evaluados por la IA */}
        <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-auto bg-white/90 p-2 rounded-2xl border border-blue-200 shadow-2xs text-xs">
          <span className="text-[11px] font-bold text-slate-600">
            Marca: <strong className="text-slate-900">{marcaPintura}</strong>
          </span>
          <span className="text-slate-300">•</span>
          <span className="text-[11px] font-bold text-slate-600">
            Color: <strong className="text-blue-700 truncate max-w-[140px] inline-block align-bottom">{colorDescripcion}</strong>
          </span>
        </div>
      </div>

      {/* Justificación Técnica Oficial de la IA */}
      <div className="p-3.5 rounded-2xl bg-white border border-blue-200/80 shadow-2xs flex items-start gap-3">
        <div className="w-7 h-7 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
          <Sparkles className="w-4 h-4" />
        </div>
        <div className="space-y-1 text-xs">
          <strong className="block text-slate-900 font-black">
            ¿Por qué la IA recomienda exactamente {manosRecomendadas} {manosRecomendadas === 1 ? 'mano' : 'manos'} para tu proyecto?
          </strong>
          <p className="text-[11px] text-slate-700 leading-relaxed">
            {coatRec.motivo}
          </p>
          <div className="pt-1 flex flex-wrap items-center gap-2 text-[10px] text-slate-500">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Sustrato: <strong>{superficie}</strong>
            </span>
            <span>•</span>
            <span>Condición: <strong>{condicion}</strong></span>
            <span>•</span>
            <span>Producto: <strong>{tipoPintura}</strong></span>
          </div>
        </div>
      </div>

      {/* Opciones Interactivas para Ajustar o Confirmar Manos */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
            Selecciona o confirma el número de manos a aplicar:
          </span>
          {esDiferenteDeRecomendada && (
            <button
              type="button"
              onClick={() => onChange(manosRecomendadas)}
              className="text-[10px] font-black text-blue-700 hover:text-blue-900 underline cursor-pointer"
            >
              Restablecer a {manosRecomendadas} manos sugeridas por IA
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {COAT_OPTIONS.map((opt) => {
            const isSelected = manosActivas === opt.manos;
            const isRecommended = opt.manos === manosRecomendadas;

            return (
              <button
                key={opt.manos}
                type="button"
                onClick={() => onChange(opt.manos)}
                className={`p-3 rounded-2xl border text-left transition-all relative cursor-pointer ${
                  isSelected
                    ? 'border-[#0055FF] bg-gradient-to-b from-blue-50/95 to-sky-50/50 shadow-md ring-2 ring-[#0055FF]/30'
                    : 'border-slate-200 bg-white hover:border-sky-300 hover:shadow-2xs'
                }`}
              >
                {isRecommended && (
                  <span className={`absolute -top-2 right-2 text-[9px] font-black px-2 py-0.5 rounded-full shadow-2xs flex items-center gap-1 ${
                    isSelected
                      ? 'bg-[#0055FF] text-white'
                      : 'bg-emerald-600 text-white'
                  }`}>
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    Sugerido por IA
                  </span>
                )}

                <div className="flex items-center justify-between mb-1">
                  <span className={`text-sm font-black ${isSelected ? 'text-[#0055FF]' : 'text-slate-900'}`}>
                    {opt.titulo}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 font-bold">
                    {opt.manos}x
                  </span>
                </div>

                <div className="text-[11px] font-bold text-slate-700 mb-1 leading-tight">
                  {opt.subtitulo}
                </div>

                <p className="text-[10px] text-slate-500 leading-tight line-clamp-2">
                  {opt.detalle}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Alerta en caso de personalización manual */}
      {esDiferenteDeRecomendada && (
        <div className="p-3 rounded-xl bg-amber-50/90 border border-amber-300/80 text-amber-950 text-xs flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold block">
              Personalización manual: Has configurado {manosActivas} {manosActivas === 1 ? 'mano' : 'manos'} (La IA recomendó {manosRecomendadas}):
            </span>
            <p className="text-[11px] text-amber-900">
              El volumen de galones y presupuesto comercial se recalculó para {manosActivas} {manosActivas === 1 ? 'mano' : 'manos'}. Asegúrate de que el contratista o maestro pintor alcance la cobertura adecuada en obra.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
