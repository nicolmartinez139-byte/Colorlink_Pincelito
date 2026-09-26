import React, { useState, useEffect } from 'react';
import { Palette, Check, Sparkles, Pipette, Info, CheckCircle2 } from 'lucide-react';

export interface ColorOption {
  id: string;
  name: string;
  hex: string;
  category: 'neutro' | 'tierra' | 'acento' | 'estandar';
  isCaseStudy?: boolean;
  baseType: 'Blanco Línea' | 'Pastel' | 'Deep' | 'Accent';
  isStockDirecto: boolean;
}

export const PRESET_COLORS: ColorOption[] = [
  {
    id: 'gris-cemento',
    name: 'Gris',
    hex: '#64748B',
    category: 'neutro',
    isCaseStudy: true,
    baseType: 'Pastel',
    isStockDirecto: true
  },
  {
    id: 'blanco-puro',
    name: 'Blanco Puro',
    hex: '#FFFFFF',
    category: 'estandar',
    baseType: 'Blanco Línea',
    isStockDirecto: true
  },
  {
    id: 'marfil-arena',
    name: 'Marfil / Arena',
    hex: '#E8DFD1',
    category: 'neutro',
    baseType: 'Pastel',
    isStockDirecto: true
  },
  {
    id: 'gris-grafito',
    name: 'Gris Grafito',
    hex: '#334155',
    category: 'neutro',
    baseType: 'Deep',
    isStockDirecto: false
  },
  {
    id: 'terracota-teja',
    name: 'Terracota / Teja',
    hex: '#B45309',
    category: 'tierra',
    baseType: 'Deep',
    isStockDirecto: false
  },
  {
    id: 'ocre-colonial',
    name: 'Ocre Colonial',
    hex: '#D97706',
    category: 'tierra',
    baseType: 'Accent',
    isStockDirecto: false
  },
  {
    id: 'verde-oliva',
    name: 'Verde Oliva',
    hex: '#4D7C0F',
    category: 'acento',
    baseType: 'Deep',
    isStockDirecto: false
  },
  {
    id: 'azul-fachada',
    name: 'Azul Fachada',
    hex: '#1E40AF',
    category: 'acento',
    baseType: 'Accent',
    isStockDirecto: false
  }
];

export const FINISH_OPTIONS = [
  {
    id: 'Mate',
    name: 'Mate',
    desc: 'Disimula imperfecciones y microfisuras en concreto exterior (Recomendado)',
    isRecommended: true
  },
  {
    id: 'Satinado',
    name: 'Satinado',
    desc: 'Acabado terso con suave brillo y mayor lavabilidad',
    isRecommended: false
  },
  {
    id: 'Semibrillante',
    name: 'Semibrillante',
    desc: 'Alta resistencia a roces y humedad',
    isRecommended: false
  },
  {
    id: 'Brillante',
    name: 'Brillante',
    desc: 'Máxima reflectividad (común en metales o pisos)',
    isRecommended: false
  }
];

interface ColorFinishSelectorProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function ColorFinishSelector({ value, onChange, error }: ColorFinishSelectorProps) {
  // Parse initial state from value if possible
  const initialPreset = value
    ? PRESET_COLORS.find(
        (c) => value.toLowerCase().includes(c.name.toLowerCase()) || value.toLowerCase().includes(c.id)
      )
    : null;

  const [selectedPresetId, setSelectedPresetId] = useState<string>(initialPreset?.id || '');
  const [selectedFinish, setSelectedFinish] = useState<string>(value && value.includes('(') ? value.split('(')[1]?.replace(')', '') || 'Mate' : 'Mate');
  const [customHex, setCustomHex] = useState<string>('#64748B');
  const [customName, setCustomName] = useState<string>('');
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);

  // Sync with incoming value if preset changes externally
  useEffect(() => {
    if (!value) {
      setSelectedPresetId('');
      setIsCustomMode(false);
      return;
    }
    const matchedPreset = PRESET_COLORS.find(
      (c) => value.toLowerCase().includes(c.name.toLowerCase()) || value.toLowerCase().includes(c.id)
    );
    if (matchedPreset) {
      setSelectedPresetId(matchedPreset.id);
      setIsCustomMode(false);
    }
  }, [value]);

  const handleSelectPreset = (preset: ColorOption) => {
    setSelectedPresetId(preset.id);
    setIsCustomMode(false);
    setCustomHex(preset.hex);
    const finishToUse = selectedFinish || 'Mate';
    const combined = `${preset.name} (${finishToUse})`;
    onChange(combined);
  };

  const handleFinishChange = (finish: string) => {
    setSelectedFinish(finish);
    if (isCustomMode) {
      const colorLabel = customName.trim() || 'Color Personalizado';
      onChange(`${colorLabel} [${customHex}] (${finish})`);
    } else if (selectedPresetId) {
      const currentPreset = PRESET_COLORS.find((p) => p.id === selectedPresetId);
      const colorLabel = currentPreset ? currentPreset.name : 'Color';
      onChange(`${colorLabel} (${finish})`);
    }
  };

  const handleCustomColorChange = (newHex: string) => {
    setCustomHex(newHex);
    setIsCustomMode(true);
    const colorLabel = customName.trim() || 'Color Personalizado';
    onChange(`${colorLabel} [${newHex}] (${selectedFinish})`);
  };

  const handleCustomNameChange = (name: string) => {
    setCustomName(name);
    setIsCustomMode(true);
    onChange(`${name || 'Personalizado'} [${customHex}] (${selectedFinish})`);
  };

  const activePreset = PRESET_COLORS.find((p) => p.id === selectedPresetId);
  const activeColorHex = isCustomMode ? customHex : activePreset?.hex || '#64748B';
  const isDirectStock = !isCustomMode && activePreset?.isStockDirecto;

  return (
    <div id="color-finish-selector-container" className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-slate-700">
          Color / Acabado <span className="text-rose-500">*</span>
        </label>
        <span className="text-[11px] text-blue-600 font-medium inline-flex items-center gap-1">
          <Palette className="w-3.5 h-3.5" /> Carta de Color & Tintometría
        </span>
      </div>

      {/* Selector Desplegable Rápido (Todo sale 'Seleccionar...' si no hay simulación) */}
      <div>
        <select
          id="color-finish-quick-select"
          value={isCustomMode ? 'custom' : selectedPresetId || ''}
          onChange={(e) => {
            const val = e.target.value;
            if (!val) {
              setSelectedPresetId('');
              setIsCustomMode(false);
              onChange('');
            } else if (val === 'custom') {
              setIsCustomMode(true);
              const colorLabel = customName.trim() || 'Color Personalizado';
              onChange(`${colorLabel} [${customHex}] (${selectedFinish || 'Mate'})`);
            } else {
              const matched = PRESET_COLORS.find(c => c.id === val);
              if (matched) handleSelectPreset(matched);
            }
          }}
          className={`w-full px-3.5 py-2.5 text-xs bg-slate-50/80 border ${
            error ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
          } rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#009FE3] transition-all font-medium text-slate-800`}
        >
          <option value="">-- Seleccionar Tono de la Carta Oficial --</option>
          <optgroup label="Tonos Neutros & Fachadas">
            <option value="gris-cemento">Gris Cemento [#64748B] - (Recomendado Fachadas)</option>
            <option value="blanco-puro">Blanco Puro [#FFFFFF] - (Línea Base)</option>
            <option value="marfil-arena">Marfil / Arena [#E8DFD1] - (Neutro Cálido)</option>
            <option value="gris-grafito">Gris Grafito [#334155] - (Neutro Profundo)</option>
          </optgroup>
          <optgroup label="Tonos Tierra & Acentos">
            <option value="terracota-teja">Terracota / Teja [#B45309]</option>
            <option value="ocre-colonial">Ocre Colonial [#D97706]</option>
            <option value="verde-oliva">Verde Oliva [#4D7C0F]</option>
            <option value="azul-fachada">Azul Fachada [#1E40AF]</option>
          </optgroup>
          <option value="custom">★ Otro Color Personalizado (Hex / Tintometría)</option>
        </select>
        {error && <p className="text-[11px] text-rose-600 mt-1">{error}</p>}
      </div>

      {/* Grid de Colores Muestras */}
      <div className="space-y-2">
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
          1. Selecciona el Tono (Carta Oficial Pintuco / ColorLink):
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {PRESET_COLORS.map((color) => {
            const isSelected = !isCustomMode && selectedPresetId === color.id;
            return (
              <button
                key={color.id}
                id={`color-preset-btn-${color.id}`}
                type="button"
                onClick={() => handleSelectPreset(color)}
                className={`relative flex items-center gap-2.5 p-2 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'border-[#009FE3] bg-sky-50/70 ring-2 ring-[#009FE3]/25 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                {/* Chip Swatch */}
                <div
                  className="w-7 h-7 rounded-lg shrink-0 border border-black/15 shadow-inner flex items-center justify-center transition-transform hover:scale-105"
                  style={{ backgroundColor: color.hex }}
                >
                  {isSelected && (
                    <Check
                      className={`w-4 h-4 drop-shadow ${
                        color.hex === '#FFFFFF' || color.hex === '#E8DFD1' ? 'text-slate-900' : 'text-white'
                      }`}
                    />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-slate-800 truncate block">{color.name}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono block truncate">
                    {color.isCaseStudy ? '★ Caso Clase' : color.hex}
                  </span>
                </div>

                {color.isCaseStudy && (
                  <span className="absolute -top-1.5 -right-1 bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full shadow-xs">
                    Caso
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Opción Personalizada / Selector Libre */}
      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Pipette className="w-4 h-4 text-slate-600" />
            <span className="text-xs font-semibold text-slate-700">
              ¿Deseas un tono personalizado o código RAL / Pantone / Tintometría?
            </span>
          </div>
          <div className="flex items-center gap-2">
            <input
              id="input-native-color-picker"
              type="color"
              value={customHex}
              onChange={(e) => handleCustomColorChange(e.target.value)}
              className="w-7 h-7 rounded-lg border border-slate-300 cursor-pointer p-0 bg-transparent"
              title="Escoger color exacto"
            />
            <span className="text-xs font-mono text-slate-600 bg-white px-2 py-1 rounded border border-slate-200">
              {customHex.toUpperCase()}
            </span>
          </div>
        </div>

        <input
          id="input-custom-color-name"
          type="text"
          placeholder="Ej. Gris Cemento Especial, Blanco Humo, RAL 7038..."
          value={customName}
          onChange={(e) => handleCustomNameChange(e.target.value)}
          className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Selector de Acabado */}
      <div className="space-y-2">
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
          2. Selecciona el Tipo de Acabado:
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {FINISH_OPTIONS.map((finish) => {
            const isSelected = selectedFinish === finish.id;
            return (
              <button
                key={finish.id}
                id={`finish-btn-${finish.id}`}
                type="button"
                onClick={() => handleFinishChange(finish.id)}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  isSelected
                    ? 'border-[#009FE3] bg-[#009FE3] text-white shadow-xs font-bold'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="text-xs font-semibold">{finish.name}</div>
                {finish.isRecommended && (
                  <span
                    className={`inline-block text-[9px] mt-0.5 px-1.5 py-0.2 rounded font-medium ${
                      isSelected ? 'bg-sky-800 text-sky-100' : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    Recomendado Fachadas
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Resumen Visual del Color & Acabado Seleccionado */}
      <div className={`p-3.5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs transition-all ${
        value
          ? 'bg-slate-50 text-slate-800 border-slate-200/90'
          : 'bg-amber-50/40 text-slate-700 border-dashed border-amber-300'
      }`}>
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl border shadow-xs shrink-0 flex items-center justify-center ${
              value ? 'border-slate-200' : 'border-dashed border-slate-300 bg-white'
            }`}
            style={{ backgroundColor: value ? activeColorHex : '#FFFFFF' }}
          >
            {value ? (
              <CheckCircle2
                className={`w-5 h-5 ${
                  activeColorHex === '#FFFFFF' || activeColorHex === '#E8DFD1' ? 'text-slate-800' : 'text-white'
                }`}
              />
            ) : (
              <Palette className="w-5 h-5 text-slate-400" />
            )}
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">
              {value ? 'Selección Final Guardada:' : 'Color y Acabado Pendiente de Seleccionar:'}
            </span>
            <span className="text-sm font-bold text-slate-900 block">
              {value || 'Ningún color seleccionado aún (haz clic en un tono arriba)'}
            </span>
            {value ? (
              <span className="text-[11px] text-blue-600 font-mono font-bold block">Código Hex: {activeColorHex}</span>
            ) : (
              <span className="text-[11px] text-amber-700 font-medium block">Selecciona un color de la carta para continuar</span>
            )}
          </div>
        </div>

        {value && (
          <div className="text-right sm:self-center">
            {isDirectStock ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-700 text-[11px] font-semibold border border-emerald-400/30">
                <Check className="w-3 h-3 text-emerald-600" /> Stock Inmediato CEDI
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-800 text-[11px] font-semibold border border-amber-400/30">
                <Sparkles className="w-3 h-3 text-amber-600" /> Máquina Tintometría
              </span>
            )}
          </div>
        )}
      </div>

      {error && <p className="text-[11px] text-rose-600 mt-1">{error}</p>}
    </div>
  );
}
