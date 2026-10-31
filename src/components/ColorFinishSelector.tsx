import React, { useState, useEffect, useMemo } from 'react';
import { Palette, Check, Sparkles, Pipette, CheckCircle2, Search, Sliders, Layers } from 'lucide-react';

export interface ColorOption {
  id: string;
  name: string;
  hex: string;
  category: 'neutro' | 'tierra' | 'verde' | 'azul' | 'acento' | 'estandar';
  isCaseStudy?: boolean;
  baseType: 'Blanco Línea' | 'Pastel' | 'Deep' | 'Accent';
  isStockDirecto: boolean;
  codigoRef?: string;
}

export const PRESET_COLORS: ColorOption[] = [
  // --- BLANCOS & NEUTROS ---
  {
    id: 'gris-cemento',
    name: 'Gris Cemento',
    hex: '#64748B',
    category: 'neutro',
    isCaseStudy: true,
    baseType: 'Pastel',
    isStockDirecto: true,
    codigoRef: 'RAL 7037'
  },
  {
    id: 'blanco-puro',
    name: 'Blanco Puro',
    hex: '#FFFFFF',
    category: 'estandar',
    baseType: 'Blanco Línea',
    isStockDirecto: true,
    codigoRef: 'RAL 9003'
  },
  {
    id: 'blanco-nieve',
    name: 'Blanco Nieve',
    hex: '#F8FAFC',
    category: 'estandar',
    baseType: 'Blanco Línea',
    isStockDirecto: true,
    codigoRef: 'RAL 9016'
  },
  {
    id: 'hueso-natural',
    name: 'Hueso Natural',
    hex: '#F5F5F0',
    category: 'neutro',
    baseType: 'Pastel',
    isStockDirecto: true,
    codigoRef: 'RAL 9010'
  },
  {
    id: 'marfil-arena',
    name: 'Marfil / Arena',
    hex: '#E8DFD1',
    category: 'neutro',
    baseType: 'Pastel',
    isStockDirecto: true,
    codigoRef: 'RAL 1013'
  },
  {
    id: 'beige-canela',
    name: 'Beige Canela',
    hex: '#D4C5B9',
    category: 'neutro',
    baseType: 'Pastel',
    isStockDirecto: true,
    codigoRef: 'RAL 1014'
  },
  {
    id: 'gris-perla',
    name: 'Gris Perla',
    hex: '#CBD5E1',
    category: 'neutro',
    baseType: 'Pastel',
    isStockDirecto: true,
    codigoRef: 'RAL 7035'
  },
  {
    id: 'gris-grafito',
    name: 'Gris Grafito',
    hex: '#334155',
    category: 'neutro',
    baseType: 'Deep',
    isStockDirecto: false,
    codigoRef: 'RAL 7024'
  },
  {
    id: 'negro-ebano',
    name: 'Negro Ébano',
    hex: '#0F172A',
    category: 'neutro',
    baseType: 'Accent',
    isStockDirecto: true,
    codigoRef: 'RAL 9005'
  },

  // --- TIERRA & CÁLIDOS ---
  {
    id: 'terracota-teja',
    name: 'Terracota / Teja',
    hex: '#B45309',
    category: 'tierra',
    baseType: 'Deep',
    isStockDirecto: false,
    codigoRef: 'RAL 8004'
  },
  {
    id: 'ocre-colonial',
    name: 'Ocre Colonial',
    hex: '#D97706',
    category: 'tierra',
    baseType: 'Accent',
    isStockDirecto: false,
    codigoRef: 'RAL 1024'
  },
  {
    id: 'mostaza-suave',
    name: 'Mostaza Suave',
    hex: '#EAB308',
    category: 'tierra',
    baseType: 'Deep',
    isStockDirecto: false,
    codigoRef: 'RAL 1005'
  },
  {
    id: 'ladrillo-vivo',
    name: 'Ladrillo Vivo',
    hex: '#9A3412',
    category: 'tierra',
    baseType: 'Deep',
    isStockDirecto: false,
    codigoRef: 'RAL 3009'
  },
  {
    id: 'caramelo',
    name: 'Caramelo Cálido',
    hex: '#C2410C',
    category: 'tierra',
    baseType: 'Deep',
    isStockDirecto: false,
    codigoRef: 'RAL 8002'
  },
  {
    id: 'salmon-calido',
    name: 'Salmón Cálido',
    hex: '#FB923C',
    category: 'tierra',
    baseType: 'Pastel',
    isStockDirecto: false,
    codigoRef: 'RAL 3022'
  },
  {
    id: 'cafe-moca',
    name: 'Café Moca',
    hex: '#78350F',
    category: 'tierra',
    baseType: 'Accent',
    isStockDirecto: false,
    codigoRef: 'RAL 8017'
  },
  {
    id: 'palo-de-rosa',
    name: 'Palo de Rosa',
    hex: '#F43F5E',
    category: 'tierra',
    baseType: 'Pastel',
    isStockDirecto: false,
    codigoRef: 'RAL 3015'
  },

  // --- VERDES & BOTÁNICOS ---
  {
    id: 'verde-oliva',
    name: 'Verde Oliva',
    hex: '#4D7C0F',
    category: 'verde',
    baseType: 'Deep',
    isStockDirecto: false,
    codigoRef: 'RAL 6003'
  },
  {
    id: 'verde-menta',
    name: 'Verde Menta',
    hex: '#86EFAC',
    category: 'verde',
    baseType: 'Pastel',
    isStockDirecto: true,
    codigoRef: 'RAL 6019'
  },
  {
    id: 'verde-esmeralda',
    name: 'Verde Esmeralda',
    hex: '#059669',
    category: 'verde',
    baseType: 'Deep',
    isStockDirecto: false,
    codigoRef: 'RAL 6029'
  },
  {
    id: 'verde-bosque',
    name: 'Verde Bosque',
    hex: '#14532D',
    category: 'verde',
    baseType: 'Accent',
    isStockDirecto: false,
    codigoRef: 'RAL 6005'
  },
  {
    id: 'verde-eucalipto',
    name: 'Verde Eucalipto',
    hex: '#15803D',
    category: 'verde',
    baseType: 'Deep',
    isStockDirecto: false,
    codigoRef: 'RAL 6010'
  },
  {
    id: 'verde-jade',
    name: 'Verde Jade',
    hex: '#0D9488',
    category: 'verde',
    baseType: 'Deep',
    isStockDirecto: false,
    codigoRef: 'RAL 6026'
  },
  {
    id: 'verde-pistacho',
    name: 'Pistacho Fresco',
    hex: '#84CC16',
    category: 'verde',
    baseType: 'Pastel',
    isStockDirecto: false,
    codigoRef: 'RAL 6018'
  },
  {
    id: 'verde-cesped',
    name: 'Verde Canchas / Césped',
    hex: '#16A34A',
    category: 'verde',
    baseType: 'Deep',
    isStockDirecto: true,
    codigoRef: 'RAL 6001'
  },

  // --- AZULES & FRÍOS ---
  {
    id: 'azul-fachada',
    name: 'Azul Fachada',
    hex: '#1E40AF',
    category: 'azul',
    baseType: 'Accent',
    isStockDirecto: false,
    codigoRef: 'RAL 5010'
  },
  {
    id: 'azul-caribe',
    name: 'Azul Caribe',
    hex: '#0284C7',
    category: 'azul',
    baseType: 'Deep',
    isStockDirecto: false,
    codigoRef: 'RAL 5015'
  },
  {
    id: 'azul-marino',
    name: 'Azul Marino',
    hex: '#1E3A8A',
    category: 'azul',
    baseType: 'Accent',
    isStockDirecto: true,
    codigoRef: 'RAL 5002'
  },
  {
    id: 'celeste-cielo',
    name: 'Celeste Cielo',
    hex: '#7DD3FC',
    category: 'azul',
    baseType: 'Pastel',
    isStockDirecto: true,
    codigoRef: 'RAL 5012'
  },
  {
    id: 'azul-petroleo',
    name: 'Azul Petróleo',
    hex: '#0E7490',
    category: 'azul',
    baseType: 'Deep',
    isStockDirecto: false,
    codigoRef: 'RAL 5020'
  },
  {
    id: 'azul-indigo',
    name: 'Azul Índigo',
    hex: '#4338CA',
    category: 'azul',
    baseType: 'Accent',
    isStockDirecto: false,
    codigoRef: 'RAL 5000'
  },
  {
    id: 'turquesa-colonial',
    name: 'Turquesa Colonial',
    hex: '#06B6D4',
    category: 'azul',
    baseType: 'Deep',
    isStockDirecto: false,
    codigoRef: 'RAL 5018'
  },
  {
    id: 'azul-real',
    name: 'Azul Real',
    hex: '#2563EB',
    category: 'azul',
    baseType: 'Deep',
    isStockDirecto: true,
    codigoRef: 'RAL 5005'
  },

  // --- VIVOS & ACENTOS ---
  {
    id: 'amarillo-sol',
    name: 'Amarillo Tráfico / Sol',
    hex: '#FACC15',
    category: 'acento',
    baseType: 'Accent',
    isStockDirecto: true,
    codigoRef: 'RAL 1023'
  },
  {
    id: 'naranja-mandarina',
    name: 'Naranja Mandarina',
    hex: '#EA580C',
    category: 'acento',
    baseType: 'Accent',
    isStockDirecto: false,
    codigoRef: 'RAL 2004'
  },
  {
    id: 'rojo-coral',
    name: 'Rojo Coral',
    hex: '#DC2626',
    category: 'acento',
    baseType: 'Accent',
    isStockDirecto: true,
    codigoRef: 'RAL 3020'
  },
  {
    id: 'rojo-bermellon',
    name: 'Rojo Bermellón',
    hex: '#B91C1C',
    category: 'acento',
    baseType: 'Accent',
    isStockDirecto: false,
    codigoRef: 'RAL 3001'
  },
  {
    id: 'magenta-fucsia',
    name: 'Magenta Fucsia',
    hex: '#D946EF',
    category: 'acento',
    baseType: 'Accent',
    isStockDirecto: false,
    codigoRef: 'RAL 4010'
  },
  {
    id: 'violeta-lavanda',
    name: 'Violeta Lavanda',
    hex: '#8B5CF6',
    category: 'acento',
    baseType: 'Pastel',
    isStockDirecto: false,
    codigoRef: 'RAL 4005'
  },
  {
    id: 'vino-tinto',
    name: 'Borgoña / Vino Tinto',
    hex: '#881337',
    category: 'acento',
    baseType: 'Accent',
    isStockDirecto: false,
    codigoRef: 'RAL 3005'
  }
];

export const FINISH_OPTIONS = [
  {
    id: 'Mate',
    name: 'Mate',
    desc: 'Cero brillo, disimula irregularidades y microfisuras en muros (Recomendado Fachadas)',
    isRecommended: true
  },
  {
    id: 'Satinado',
    name: 'Satinado',
    desc: 'Tersura sedosa con suave brillo reflectivo y mayor facilidad de lavado',
    isRecommended: false
  },
  {
    id: 'Semibrillante',
    name: 'Semibrillante',
    desc: 'Mayor resistencia a la abrasión, grasa y humedad en zonas de alto tráfico',
    isRecommended: false
  },
  {
    id: 'Brillante',
    name: 'Brillante',
    desc: 'Brillo espejo para esmaltes en puertas metálicas, rejas y pisos epóxicos',
    isRecommended: false
  },
  {
    id: 'Texturizado',
    name: 'Texturizado / Graniplast',
    desc: 'Grano fino para revestimiento de alta protección y resistencia a intemperie',
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
  const [selectedFinish, setSelectedFinish] = useState<string>(
    value && value.includes('(') ? value.split('(')[1]?.replace(')', '') || 'Mate' : 'Mate'
  );
  const [activeTab, setActiveTab] = useState<'todos' | 'neutro' | 'tierra' | 'verde' | 'azul' | 'acento'>('todos');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [customHex, setCustomHex] = useState<string>('#64748B');
  const [customName, setCustomName] = useState<string>('');
  const [customRefCode, setCustomRefCode] = useState<string>('');
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
      const codePart = customRefCode.trim() ? ` [${customRefCode.trim()}]` : '';
      const colorLabel = customName.trim() || 'Color Personalizado';
      onChange(`${colorLabel}${codePart} [${customHex}] (${finish})`);
    } else if (selectedPresetId) {
      const currentPreset = PRESET_COLORS.find((p) => p.id === selectedPresetId);
      const colorLabel = currentPreset ? currentPreset.name : 'Color';
      onChange(`${colorLabel} (${finish})`);
    }
  };

  const handleCustomColorChange = (newHex: string) => {
    setCustomHex(newHex);
    setIsCustomMode(true);
    setSelectedPresetId('');
    const codePart = customRefCode.trim() ? ` [${customRefCode.trim()}]` : '';
    const colorLabel = customName.trim() || 'Color Tintometría Personalizado';
    onChange(`${colorLabel}${codePart} [${newHex}] (${selectedFinish})`);
  };

  const handleCustomNameChange = (name: string) => {
    setCustomName(name);
    setIsCustomMode(true);
    setSelectedPresetId('');
    const codePart = customRefCode.trim() ? ` [${customRefCode.trim()}]` : '';
    onChange(`${name || 'Personalizado'}${codePart} [${customHex}] (${selectedFinish})`);
  };

  const handleCustomRefChange = (ref: string) => {
    setCustomRefCode(ref);
    setIsCustomMode(true);
    setSelectedPresetId('');
    const codePart = ref.trim() ? ` [${ref.trim()}]` : '';
    const label = customName.trim() || 'Color Formulado';
    onChange(`${label}${codePart} [${customHex}] (${selectedFinish})`);
  };

  // Filtered colors
  const filteredColors = useMemo(() => {
    return PRESET_COLORS.filter((color) => {
      const matchesTab =
        activeTab === 'todos' ||
        (activeTab === 'neutro' && (color.category === 'neutro' || color.category === 'estandar')) ||
        color.category === activeTab;

      const matchesSearch =
        !searchTerm.trim() ||
        color.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        color.hex.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (color.codigoRef && color.codigoRef.toLowerCase().includes(searchTerm.toLowerCase()));

      return matchesTab && matchesSearch;
    });
  }, [activeTab, searchTerm]);

  const activePreset = PRESET_COLORS.find((p) => p.id === selectedPresetId);
  const activeColorHex = isCustomMode ? customHex : activePreset?.hex || '#64748B';
  const isDirectStock = !isCustomMode && activePreset?.isStockDirecto;

  return (
    <div id="color-finish-selector-container" className="space-y-4">
      {/* ENCABEZADO Y BADGE TINTOMÉTRICO */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#FF5500] via-[#FF007A] to-[#0099FF] text-white flex items-center justify-center font-bold text-xs shadow-2xs">
            <Palette className="w-4 h-4 text-white" />
          </div>
          <div>
            <label className="block text-xs font-black text-slate-900">
              Color y Acabado Oficial <span className="text-rose-500">*</span>
            </label>
            <span className="text-[11px] text-slate-500">
              Manejamos <strong>todos los colores</strong>: Carta oficial de fábrica, sistema tintométrico con +2.000 tonos o fórmula a medida.
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[11px] font-bold text-purple-800 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" /> Tintometría Computarizada
          </span>
        </div>
      </div>

      {/* BANNER INSTITUCIONAL: MANEJAMOS TODOS LOS COLORES */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-sky-50/90 via-blue-50/60 to-purple-50/70 border border-sky-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-2xs">
        <div className="space-y-0.5">
          <strong className="text-sky-950 font-black flex items-center gap-1.5">
            <span>🎨 Colorlink® maneja todos los colores del mercado</span>
          </strong>
          <p className="text-slate-600 text-[11px] leading-relaxed">
            Puedes escoger entre los <strong>tonos más pedidos de la carta de fábrica</strong>, introducir cualquier <strong>código RAL / Pantone / NCS</strong>, o utilizar el <strong>selector cuentagotas para formular cualquier color exacto</strong> en máquina computarizada.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setIsCustomMode(true);
            setSelectedPresetId('');
          }}
          className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold border border-slate-200 shadow-2xs text-[11px] cursor-pointer shrink-0 transition-all active:scale-95 flex items-center gap-1.5"
        >
          <Pipette className="w-3.5 h-3.5 text-sky-600" />
          <span>Formular Color Propio</span>
        </button>
      </div>

      {/* SELECTOR DESPLEGABLE RÁPIDO */}
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
              const matched = PRESET_COLORS.find((c) => c.id === val);
              if (matched) handleSelectPreset(matched);
            }
          }}
          className={`w-full px-3.5 py-2.5 text-xs bg-slate-50/80 border ${
            error ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
          } rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#009FE3] transition-all font-medium text-slate-800`}
        >
          <option value="">-- Seleccionar Tono de la Carta Oficial Colorlink® --</option>
          <optgroup label="⚪ Tonos Neutros & Blancos (Fachadas e Interiores)">
            {PRESET_COLORS.filter((c) => c.category === 'neutro' || c.category === 'estandar').map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} [{c.hex}] - {c.codigoRef || 'Línea Base'}
              </option>
            ))}
          </optgroup>
          <optgroup label="🧱 Tonos Cálidos & Tierras">
            {PRESET_COLORS.filter((c) => c.category === 'tierra').map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} [{c.hex}] - {c.codigoRef || 'Tintometría'}
              </option>
            ))}
          </optgroup>
          <optgroup label="🌿 Tonos Verdes & Botánicos">
            {PRESET_COLORS.filter((c) => c.category === 'verde').map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} [{c.hex}] - {c.codigoRef || 'Tintometría'}
              </option>
            ))}
          </optgroup>
          <optgroup label="🌊 Tonos Azules & Fríos">
            {PRESET_COLORS.filter((c) => c.category === 'azul').map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} [{c.hex}] - {c.codigoRef || 'Tintometría'}
              </option>
            ))}
          </optgroup>
          <optgroup label="🎨 Tonos Vivos & Acentos">
            {PRESET_COLORS.filter((c) => c.category === 'acento').map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} [{c.hex}] - {c.codigoRef || 'Tintometría'}
              </option>
            ))}
          </optgroup>
          <option value="custom">★ Otro Color Personalizado (Hex / Pantone / RAL / Muestra en Obra)</option>
        </select>
        {error && <p className="text-[11px] text-rose-600 mt-1">{error}</p>}
      </div>

      {/* PESTAÑAS DE CATEGORÍA DE COLOR & BUSCADOR EN VIVO */}
      <div className="space-y-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block">
            1. Explora por Familias de Color ({PRESET_COLORS.length} tonos en carta rápida):
          </span>
          {/* Input de Búsqueda de Color */}
          <div className="relative w-full sm:w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar tono (ej: marfil, gris, azul)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#009FE3] text-slate-800"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Botones de Pestañas */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100/80 rounded-2xl border border-slate-200">
          {[
            { id: 'todos', label: 'Todos', count: PRESET_COLORS.length },
            { id: 'neutro', label: '⚪ Neutros & Blancos', count: 9 },
            { id: 'tierra', label: '🧱 Cálidos & Tierra', count: 8 },
            { id: 'verde', label: '🌿 Verdes', count: 8 },
            { id: 'azul', label: '🌊 Azules', count: 8 },
            { id: 'acento', label: '🎨 Vivos & Acentos', count: 7 }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-white text-slate-950 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <span>{tab.label}</span>
              <span className="ml-1 text-[10px] text-slate-400 font-mono">({tab.count})</span>
            </button>
          ))}
        </div>

        {/* GRID DE MUESTRAS DE COLOR */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 max-h-72 overflow-y-auto p-1 rounded-2xl border border-slate-200/80 bg-slate-50/50">
          {filteredColors.map((color) => {
            const isSelected = !isCustomMode && selectedPresetId === color.id;
            return (
              <button
                key={color.id}
                id={`color-preset-btn-${color.id}`}
                type="button"
                onClick={() => handleSelectPreset(color)}
                className={`relative flex items-center gap-2 p-2 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[#009FE3] bg-sky-50 ring-2 ring-[#009FE3]/30 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-sky-300 hover:shadow-2xs'
                }`}
              >
                {/* Chip Swatch con borde sutil */}
                <div
                  className="w-7 h-7 rounded-lg shrink-0 border border-black/15 shadow-inner flex items-center justify-center transition-transform hover:scale-105"
                  style={{ backgroundColor: color.hex }}
                >
                  {isSelected && (
                    <Check
                      className={`w-4 h-4 drop-shadow ${
                        color.hex === '#FFFFFF' || color.hex === '#F8FAFC' || color.hex === '#F5F5F0' || color.hex === '#E8DFD1' || color.hex === '#86EFAC' || color.hex === '#FACC15'
                          ? 'text-slate-900'
                          : 'text-white'
                      }`}
                    />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <span className="text-xs font-bold text-slate-900 truncate block leading-tight">
                    {color.name}
                  </span>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-[10px] text-slate-400 font-mono block truncate">
                      {color.codigoRef || color.hex}
                    </span>
                  </div>
                </div>

                {color.isCaseStudy && (
                  <span className="absolute -top-1.5 -right-1 bg-amber-500 text-white text-[8px] font-bold px-1.5 py-0.2 rounded-full shadow-xs">
                    Caso
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* HERRAMIENTA TINTOMÉTRICA AVANZADA: CUALQUIER COLOR HEX, RAL, PANTONE O CÓDIGO */}
      <div className={`p-4 rounded-2xl border transition-all space-y-3 ${
        isCustomMode
          ? 'bg-purple-50/60 border-purple-300 shadow-sm ring-2 ring-purple-500/20'
          : 'bg-slate-50 border-slate-200'
      }`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-2 border-b border-slate-200/80">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
              <Pipette className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-xs font-black text-slate-900 block">
                Formulación de Color Exacto & Cuentagotas (16 Millones de Colores)
              </span>
              <span className="text-[11px] text-slate-500">
                Selecciona cualquier tono del espectro o escribe el código de catálogo de tu cliente.
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-[11px] font-bold text-slate-600">Colorimetro:</label>
            <input
              id="input-native-color-picker"
              type="color"
              value={customHex}
              onChange={(e) => handleCustomColorChange(e.target.value)}
              className="w-8 h-8 rounded-xl border border-slate-300 cursor-pointer p-0 bg-transparent shadow-xs"
              title="Escoger color exacto con el cuentagotas"
            />
            <span className="text-xs font-mono font-black text-purple-900 bg-white px-2.5 py-1 rounded-lg border border-purple-200 shadow-2xs">
              {customHex.toUpperCase()}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">
              Nombre descriptivo del color:
            </label>
            <input
              id="input-custom-color-name"
              type="text"
              placeholder="Ej. Gris Platino Proyecto, Azul Corporativo EPM..."
              value={customName}
              onChange={(e) => handleCustomNameChange(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">
              Código Tintométrico (RAL, Pantone, NCS o Colorlink):
            </label>
            <input
              id="input-custom-color-code"
              type="text"
              placeholder="Ej. RAL 7035, Pantone 19-4052, Código de Obra..."
              value={customRefCode}
              onChange={(e) => handleCustomRefChange(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {isCustomMode && (
          <div className="p-2.5 rounded-xl bg-purple-100/70 border border-purple-200 text-[11px] text-purple-900 flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-bold">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              Modo Color Personalizado Activo: La máquina dosificará la base exacta al emitir el pedido.
            </span>
            <button
              type="button"
              onClick={() => {
                setIsCustomMode(false);
                const defaultColor = PRESET_COLORS[0];
                handleSelectPreset(defaultColor);
              }}
              className="text-[10px] font-black underline hover:text-purple-700 cursor-pointer"
            >
              Volver a Carta Estándar
            </button>
          </div>
        )}
      </div>

      {/* SELECTOR DE TIPO DE ACABADO */}
      <div className="space-y-2">
        <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block">
          2. Selecciona el Tipo de Acabado:
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {FINISH_OPTIONS.map((finish) => {
            const isSelected = selectedFinish === finish.id;
            return (
              <button
                key={finish.id}
                id={`finish-btn-${finish.id}`}
                type="button"
                onClick={() => handleFinishChange(finish.id)}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[#009FE3] bg-[#009FE3] text-white shadow-xs font-bold'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="text-xs font-bold">{finish.name}</div>
                {finish.isRecommended && (
                  <span
                    className={`inline-block text-[9px] mt-0.5 px-1.5 py-0.2 rounded font-bold ${
                      isSelected ? 'bg-sky-900 text-sky-100' : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    Recomendado
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* RESUMEN VISUAL DEL COLOR & ACABADO SELECCIONADO */}
      <div
        className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs transition-all ${
          value
            ? 'bg-white text-slate-800 border-slate-200/90 shadow-sm'
            : 'bg-amber-50/40 text-slate-700 border-dashed border-amber-300'
        }`}
      >
        <div className="flex items-center gap-3.5">
          <div
            className={`w-12 h-12 rounded-2xl border shadow-sm shrink-0 flex items-center justify-center transition-all ${
              value ? 'border-slate-300' : 'border-dashed border-slate-300 bg-white'
            }`}
            style={{ backgroundColor: value ? activeColorHex : '#FFFFFF' }}
          >
            {value ? (
              <CheckCircle2
                className={`w-6 h-6 drop-shadow ${
                  activeColorHex === '#FFFFFF' || activeColorHex === '#F8FAFC' || activeColorHex === '#E8DFD1'
                    ? 'text-slate-900'
                    : 'text-white'
                }`}
              />
            ) : (
              <Palette className="w-5 h-5 text-slate-400" />
            )}
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">
              {value ? 'Color & Acabado Seleccionado:' : 'Pendiente de Seleccionar:'}
            </span>
            <span className="text-sm font-black text-slate-900 block">
              {value || 'Ningún color seleccionado aún (haz clic en un tono arriba)'}
            </span>
            {value && (
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[11px] text-sky-700 font-mono font-bold">
                  Código: {activeColorHex.toUpperCase()}
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-[11px] text-slate-600 font-semibold">
                  Acabado: {selectedFinish}
                </span>
              </div>
            )}
          </div>
        </div>

        {value && (
          <div className="text-right sm:self-center shrink-0">
            {isDirectStock ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300 shadow-2xs">
                <Check className="w-3.5 h-3.5 text-emerald-600" /> Stock Inmediato CEDI
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-100 text-purple-900 text-xs font-bold border border-purple-300 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-purple-600" /> Máquina Tintométrica Colorlink®
              </span>
            )}
          </div>
        )}
      </div>

      {error && <p className="text-[11px] text-rose-600 mt-1">{error}</p>}
    </div>
  );
}
