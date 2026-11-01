import React from 'react';
import { Layers, CheckCircle2, Info, Sparkles, AlertTriangle } from 'lucide-react';
import { getRealisticCoatsRecommendation } from '../utils/calculator';
import { PaintTypeCategory } from '../types/form';

interface CoatRecommendationSelectorProps {
  tipoPintura?: PaintTypeCategory;
  superficie?: string;
  condicion?: string;
  tipoObra?: string;
  value?: number; // manos seleccionadas (1, 2, 3, 4)
  onChange: (manos: number) => void;
  areaM2?: number;
}

export function CoatRecommendationSelector({
  tipoPintura = 'Tipo 1',
  superficie = 'Concreto / Revoque',
  condicion = 'Nueva sin pintar',
  tipoObra = 'Muros Interiores',
  value,
  onChange,
  areaM2 = 0
}: CoatRecommendationSelectorProps) {
  const coatRec = getRealisticCoatsRecommendation(tipoPintura, superficie, condicion, tipoObra);
  const manosRecomendadas = coatRec.manos;
  const manosActivas = (value && value >= 1 && value <= 4) ? value : manosRecomendadas;
  const esDiferenteDeRecomendada = manosActivas !== manosRecomendadas;

  const COAT_OPTIONS = [
    {
      manos: 1,
      titulo: '1 Mano',
      subtitulo: 'Mantenimiento / Refresco',
      detalle: 'Recomendado únicamente para techos/cielos en buen estado, o repinte de color idéntico de alto cubrimiento.'
    },
    {
      manos: 2,
      titulo: '2 Manos',
      subtitulo: 'Estándar Oficial NTC',
      detalle: 'Norma técnica NTC 1335. 1ª mano de anclaje/fondo y 2ª mano de nivelación, poder cubriente y textura lavable.'
    },
    {
      manos: 3,
      titulo: '3 Manos',
      subtitulo: 'Refuerzo Técnico',
      detalle: 'Indispensable en maderas (barniz), membranas elastoméricas (DFT >150µm), revoques vírgenes o cambio drástico de color.'
    },
    {
      manos: 4,
      titulo: '4 Manos',
      subtitulo: 'Protección Extrema',
      detalle: 'Tráfico industrial pesado, inmersión o ambientes marinos de corrosión severa C5.'
    }
  ];

  return (
    <div className="space-y-3 p-4 sm:p-5 rounded-2xl border border-slate-200/90 bg-slate-50/60 transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#0055FF] to-[#00D2FF] text-white flex items-center justify-center font-bold shadow-xs">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-1.5">
              <span>Número de Manos de Pintura (Dosificación Realista)</span>
              <span className="text-[10px] font-bold text-sky-700 bg-sky-100 px-2 py-0.5 rounded-full border border-sky-200">
                {coatRec.norma}
              </span>
            </h4>
            <p className="text-[11px] text-slate-500">
              El número de manos varía según el tipo de producto, sustrato y estado de la pared.
            </p>
          </div>
        </div>

        {/* Indicador de recomendación */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto bg-white px-2.5 py-1 rounded-xl border border-slate-200 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span className="text-[11px] font-bold text-slate-700">
            Sugerido por IA & Ficha Técnica: <strong className="text-blue-700">{manosRecomendadas} {manosRecomendadas === 1 ? 'Mano' : 'Manos'}</strong>
          </span>
        </div>
      </div>

      {/* Botones de Selección de Manos */}
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
                  ? 'border-[#0055FF] bg-gradient-to-b from-blue-50/90 to-sky-50/50 shadow-md ring-2 ring-[#0055FF]/30'
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
                  Recomendado
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

              <p className="text-[10px] text-slate-500 leading-tight">
                {opt.detalle}
              </p>
            </button>
          );
        })}
      </div>

      {/* Explicación Técnica Detallada Realista */}
      <div className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 transition-all ${
        esDiferenteDeRecomendada
          ? 'bg-amber-50/80 border-amber-200 text-amber-900'
          : 'bg-blue-50/70 border-blue-200 text-blue-950'
      }`}>
        {esDiferenteDeRecomendada ? (
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        ) : (
          <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
        )}
        <div className="space-y-0.5">
          <span className="font-bold block">
            {esDiferenteDeRecomendada
              ? `Personalización activa (${manosActivas} manos seleccionadas):`
              : `Justificación Técnica Oficial (${tipoPintura} sobre ${superficie}):`}
          </span>
          <p className="text-[11px] leading-relaxed text-slate-700">
            {coatRec.motivo}
          </p>
          {esDiferenteDeRecomendada && (
            <p className="text-[10px] text-amber-800 font-medium pt-1">
              * Nota: Al aplicar {manosActivas} {manosActivas === 1 ? 'mano' : 'manos'} en lugar de las {manosRecomendadas} recomendadas, el cálculo de galones y presupuesto se ajustó automáticamente. Verifique que el espesor de película seca cumpla con los requisitos de garantía en obra.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
