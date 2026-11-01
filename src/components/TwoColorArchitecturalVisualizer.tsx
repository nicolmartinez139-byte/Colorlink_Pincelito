import React, { useState, useMemo } from 'react';
import { Palette, Sparkles, ArrowLeftRight, Check, Eye, SlidersHorizontal, Home, Building, BedDouble, Info, CheckCircle2 } from 'lucide-react';
import { PRESET_COLORS, ColorOption } from './ColorFinishSelector';

export interface ArchitecturalPair {
  id: string;
  name: string;
  tag: string;
  ambienteRecomendado: string;
  colorPrincipal: { name: string; hex: string; codigo?: string };
  colorSecundario: { name: string; hex: string; codigo?: string };
  descripcion: string;
}

export const ARCHITECTURAL_HARMONY_PAIRS: ArchitecturalPair[] = [
  {
    id: 'nordico-grafito',
    name: 'Contraste Nórdico Moderno',
    tag: 'Elegancia & Sobriedad',
    ambienteRecomendado: 'Salas, Oficinas y Fachadas Minimalistas',
    colorPrincipal: { name: 'Blanco Nieve', hex: '#F8FAFC', codigo: 'RAL 9016' },
    colorSecundario: { name: 'Gris Grafito', hex: '#334155', codigo: 'RAL 7024' },
    descripcion: 'Paredes y fachadas luminosas con muro focal en gris profundo que añade alta sofisticación y resalta la luz natural.'
  },
  {
    id: 'mediterraneo-terracota',
    name: 'Cálido Mediterráneo',
    tag: 'Confort & Tierra',
    ambienteRecomendado: 'Comedores, Terrazas y Casas Campestres',
    colorPrincipal: { name: 'Marfil / Arena', hex: '#E8DFD1', codigo: 'RAL 1013' },
    colorSecundario: { name: 'Terracota / Teja', hex: '#B45309', codigo: 'RAL 8004' },
    descripcion: 'Base crema suave inspirada en arena de playa con acento terracota artesanal que evoca ladrillo y tejas coloniales.'
  },
  {
    id: 'oceano-contemporaneo',
    name: 'Elegancia Costera & Océano',
    tag: 'Serenidad & Frescura',
    ambienteRecomendado: 'Habitaciones, Salas y Fachadas Costeras',
    colorPrincipal: { name: 'Gris Perla', hex: '#CBD5E1', codigo: 'RAL 7035' },
    colorSecundario: { name: 'Azul Océano', hex: '#0284C7', codigo: 'RAL 5015' },
    descripcion: 'Gris claro neutro balanceado con azul cobalto vibrante, transmitiendo amplitud visual, frescura y relajación.'
  },
  {
    id: 'biofilia-oliva',
    name: 'Biofilia Urbana & Verde',
    tag: 'Natural & Orgánico',
    ambienteRecomendado: 'Zonas Sociales, Balcones y Espacios Holísticos',
    colorPrincipal: { name: 'Hueso Natural', hex: '#F5F5F0', codigo: 'RAL 9010' },
    colorSecundario: { name: 'Verde Oliva', hex: '#65A30D', codigo: 'RAL 6003' },
    descripcion: 'Paleta orgánica que conecta el interior con la vegetación exterior, ideal para iluminar con calidez botánica.'
  },
  {
    id: 'colorlink-dinamico',
    name: 'Industrial Dinámico Colorlink',
    tag: 'Energía & Vanguardia',
    ambienteRecomendado: 'Espacios Creativos, Locales y Muros Corporativos',
    colorPrincipal: { name: 'Gris Cemento', hex: '#64748B', codigo: 'RAL 7037' },
    colorSecundario: { name: 'Naranja Vivo', hex: '#EA580C', codigo: 'RAL 2004' },
    descripcion: 'Contraste contemporáneo de alto impacto. Muros neutros de concreto urbano con acento naranja que irradia vitalidad.'
  },
  {
    id: 'loft-mostaza',
    name: 'Loft Metropolitano',
    tag: 'Moderno & Chic',
    ambienteRecomendado: 'Estudios, Fachadas y Lobbies',
    colorPrincipal: { name: 'Gris Concreto', hex: '#475569', codigo: 'RAL 7015' },
    colorSecundario: { name: 'Mostaza Suave', hex: '#EAB308', codigo: 'RAL 1005' },
    descripcion: 'Estilo arquitectónico cosmopolita: gris piedra oscuro que destaca la luz dorada y mobiliario de madera o hierro.'
  },
  {
    id: 'pacifico-azul-profundo',
    name: 'Marino Profundo & Blanco Puro',
    tag: 'Clásico Náutico',
    ambienteRecomendado: 'Dormitorios Principales y Fachadas Elegantes',
    colorPrincipal: { name: 'Blanco Puro', hex: '#FFFFFF', codigo: 'RAL 9003' },
    colorSecundario: { name: 'Azul Marino Real', hex: '#1E3A8A', codigo: 'RAL 5002' },
    descripcion: 'El gran clásico arquitectónico atemporal. Máxima reflectancia lumínica combinada con la nobleza del azul noche.'
  },
  {
    id: 'minimalista-moka',
    name: 'Minimalista Canela & Moka',
    tag: 'Acogedor & Suave',
    ambienteRecomendado: 'Salas de Espera, Recámaras y Consultorios',
    colorPrincipal: { name: 'Beige Canela', hex: '#D4C5B9', codigo: 'RAL 1014' },
    colorSecundario: { name: 'Café Moka', hex: '#78350F', codigo: 'RAL 8016' },
    descripcion: 'Transmite confort térmico y calidez hogareña con tonos terrosos sutiles libres de estridencias.'
  }
];

interface TwoColorArchitecturalVisualizerProps {
  colorPrincipal: string; // Nombre o hex del color 1
  colorSecundario?: string; // Nombre o hex del color 2
  dosColoresHabilitado: boolean;
  proporcionSecundario?: number; // Ej: 30 (% para color secundario)
  onChangeColorPrincipal: (color: string) => void;
  onChangeColorSecundario: (color: string) => void;
  onChangeDosColores: (enabled: boolean) => void;
  onChangeProporcion?: (proporcion: number) => void;
  areaTotalM2?: number;
}

export function TwoColorArchitecturalVisualizer({
  colorPrincipal,
  colorSecundario = 'Gris Grafito',
  dosColoresHabilitado,
  proporcionSecundario = 30,
  onChangeColorPrincipal,
  onChangeColorSecundario,
  onChangeDosColores,
  onChangeProporcion,
  areaTotalM2 = 0
}: TwoColorArchitecturalVisualizerProps) {
  const [activeScene, setActiveScene] = useState<'living' | 'facade' | 'bedroom'>('living');
  const [customHex1, setCustomHex1] = useState<string>('#F8FAFC');
  const [customHex2, setCustomHex2] = useState<string>('#334155');

  // Resolver color HEX para Color 1
  const hex1 = useMemo(() => {
    if (!colorPrincipal) return '#F8FAFC';
    const found = PRESET_COLORS.find(
      (c) => c.name.toLowerCase() === colorPrincipal.toLowerCase() || c.id === colorPrincipal
    );
    if (found) return found.hex;
    if (colorPrincipal.startsWith('#')) return colorPrincipal;
    const match = colorPrincipal.match(/#[0-9A-Fa-f]{6}/);
    if (match) return match[0];
    return '#E2E8F0';
  }, [colorPrincipal]);

  // Resolver color HEX para Color 2
  const hex2 = useMemo(() => {
    if (!colorSecundario) return '#334155';
    const found = PRESET_COLORS.find(
      (c) => c.name.toLowerCase() === colorSecundario.toLowerCase() || c.id === colorSecundario
    );
    if (found) return found.hex;
    if (colorSecundario.startsWith('#')) return colorSecundario;
    const match = colorSecundario.match(/#[0-9A-Fa-f]{6}/);
    if (match) return match[0];
    return '#334155';
  }, [colorSecundario]);

  // Intercambiar colores 1 y 2
  const handleSwapColors = () => {
    const temp1 = colorPrincipal;
    const temp2 = colorSecundario || 'Gris Grafito';
    onChangeColorPrincipal(temp2);
    onChangeColorSecundario(temp1);
  };

  // Aplicar dúo armónico prediseñado
  const handleApplyDuo = (duo: ArchitecturalPair) => {
    onChangeDosColores(true);
    onChangeColorPrincipal(`${duo.colorPrincipal.name} [${duo.colorPrincipal.hex}]`);
    onChangeColorSecundario(`${duo.colorSecundario.name} [${duo.colorSecundario.hex}]`);
  };

  // Cálculo de proporciones y m² para desglose de pintura
  const pct2 = proporcionSecundario || 30;
  const pct1 = 100 - pct2;
  const area1 = Math.round((areaTotalM2 * pct1) / 100);
  const area2 = Math.round((areaTotalM2 * pct2) / 100);

  return (
    <div className="space-y-4">
      {/* Selector de Modo: 1 Color Monocromático vs 2 Colores Dúo Arquitectónico */}
      <div className="p-1.5 bg-slate-100 rounded-2xl flex items-center justify-between border border-slate-200">
        <button
          type="button"
          onClick={() => onChangeDosColores(false)}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-2 ${
            !dosColoresHabilitado
              ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <div className="w-3.5 h-3.5 rounded-full border border-slate-300 shadow-inner" style={{ backgroundColor: hex1 }} />
          <span>1 Color Sólido (Monocromático)</span>
        </button>

        <button
          type="button"
          onClick={() => onChangeDosColores(true)}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-2 ${
            dosColoresHabilitado
              ? 'bg-gradient-to-r from-blue-600 to-sky-600 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <div className="flex items-center -space-x-1.5">
            <div className="w-3.5 h-3.5 rounded-full border border-white shadow-xs" style={{ backgroundColor: hex1 }} />
            <div className="w-3.5 h-3.5 rounded-full border border-white shadow-xs" style={{ backgroundColor: hex2 }} />
          </div>
          <span>Combinación de 2 Colores (Principal + Acento / Molduras)</span>
          <span className="text-[10px] bg-white/20 text-white px-1.5 py-0.2 rounded-full font-bold uppercase">
            Diseño
          </span>
        </button>
      </div>

      {/* Si está activo el modo 2 colores */}
      {dosColoresHabilitado && (
        <div className="space-y-4 animate-fadeIn">
          {/* Panel de Configuración de los 2 Colores */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
            {/* Color 1: Principal */}
            <div className="md:col-span-5 p-3.5 rounded-xl border border-sky-100 bg-sky-50/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-black tracking-wider text-sky-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-sky-500" />
                  Color Principal ({pct1}% Área Base)
                </span>
                <span className="text-[10px] text-slate-500 font-mono font-bold">
                  {hex1.toUpperCase()}
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <input
                  type="color"
                  value={hex1}
                  onChange={(e) => {
                    setCustomHex1(e.target.value);
                    onChangeColorPrincipal(`Color Personalizado [${e.target.value}]`);
                  }}
                  className="w-9 h-9 rounded-xl border border-slate-300 cursor-pointer p-0 bg-transparent shrink-0 shadow-xs"
                  title="Seleccionar color con cuentagotas"
                />
                <div className="min-w-0 flex-1">
                  <strong className="text-xs font-black text-slate-900 block truncate">
                    {colorPrincipal || 'Seleccionar Tono Principal'}
                  </strong>
                  <span className="text-[10px] text-slate-500 block truncate">
                    Muros predominantes, áreas amplias o cuerpo de fachada
                  </span>
                </div>
              </div>

              {/* Selector Rápido de Presets para Color 1 */}
              <div className="flex flex-wrap gap-1 pt-1 border-t border-sky-100">
                {PRESET_COLORS.slice(0, 7).map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => onChangeColorPrincipal(c.name)}
                    className="w-5 h-5 rounded-md border border-slate-300 shadow-2xs hover:scale-110 transition-transform cursor-pointer relative"
                    style={{ backgroundColor: c.hex }}
                    title={`Seleccionar ${c.name} (${c.hex})`}
                  />
                ))}
              </div>
            </div>

            {/* Botón Central de Intercambio (⇄) y Proporción */}
            <div className="md:col-span-2 flex flex-col items-center justify-center gap-2 py-1">
              <button
                type="button"
                onClick={handleSwapColors}
                className="w-10 h-10 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:brightness-110 text-white flex items-center justify-center shadow-md active:scale-95 transition-all cursor-pointer"
                title="Intercambiar Color Principal y Color de Acento"
              >
                <ArrowLeftRight className="w-4 h-4" />
              </button>
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">
                Intercambiar
              </span>

              {/* Selector de proporción rápida */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                {[
                  { p: 20, label: '80/20' },
                  { p: 30, label: '70/30' },
                  { p: 40, label: '60/40' }
                ].map((ratio) => (
                  <button
                    key={ratio.p}
                    type="button"
                    onClick={() => onChangeProporcion && onChangeProporcion(ratio.p)}
                    className={`px-1.5 py-0.5 rounded-lg text-[9px] font-bold cursor-pointer transition-all ${
                      pct2 === ratio.p
                        ? 'bg-white text-slate-900 shadow-2xs font-black'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                    title={`Proporción: ${100 - ratio.p}% Principal / ${ratio.p}% Secundario`}
                  >
                    {ratio.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Color 2: Secundario / Acento */}
            <div className="md:col-span-5 p-3.5 rounded-xl border border-purple-100 bg-purple-50/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-black tracking-wider text-purple-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-500" />
                  Color Secundario ({pct2}% Acento / Molduras)
                </span>
                <span className="text-[10px] text-slate-500 font-mono font-bold">
                  {hex2.toUpperCase()}
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <input
                  type="color"
                  value={hex2}
                  onChange={(e) => {
                    setCustomHex2(e.target.value);
                    onChangeColorSecundario(`Color Acento Personalizado [${e.target.value}]`);
                  }}
                  className="w-9 h-9 rounded-xl border border-slate-300 cursor-pointer p-0 bg-transparent shrink-0 shadow-xs"
                  title="Seleccionar color de acento con cuentagotas"
                />
                <div className="min-w-0 flex-1">
                  <strong className="text-xs font-black text-slate-900 block truncate">
                    {colorSecundario || 'Gris Grafito'}
                  </strong>
                  <span className="text-[10px] text-slate-500 block truncate">
                    Pared focal, molduras, marcos, columnas o voladizos
                  </span>
                </div>
              </div>

              {/* Selector Rápido de Presets para Color 2 */}
              <div className="flex flex-wrap gap-1 pt-1 border-t border-purple-100">
                {PRESET_COLORS.slice(7, 14).map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => onChangeColorSecundario(c.name)}
                    className="w-5 h-5 rounded-md border border-slate-300 shadow-2xs hover:scale-110 transition-transform cursor-pointer relative"
                    style={{ backgroundColor: c.hex }}
                    title={`Seleccionar ${c.name} (${c.hex})`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* PALETAS ARMÓNICAS PREDISEÑADAS POR ARQUITECTOS (1 CLIC) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Dúos Armónicos Recomendados por Diseñadores Colorlink:
              </span>
              <span className="text-[10px] text-slate-400">Haz clic para aplicar la combinación exacta</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {ARCHITECTURAL_HARMONY_PAIRS.map((duo) => {
                const isActive =
                  (colorPrincipal.includes(duo.colorPrincipal.name) || hex1.toLowerCase() === duo.colorPrincipal.hex.toLowerCase()) &&
                  (colorSecundario?.includes(duo.colorSecundario.name) || hex2.toLowerCase() === duo.colorSecundario.hex.toLowerCase());

                return (
                  <button
                    key={duo.id}
                    type="button"
                    onClick={() => handleApplyDuo(duo)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer relative ${
                      isActive
                        ? 'border-blue-500 bg-blue-50/60 ring-2 ring-blue-500/20 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <div
                        className="w-6 h-6 rounded-lg border border-black/15 shadow-2xs"
                        style={{ backgroundColor: duo.colorPrincipal.hex }}
                        title={`Principal: ${duo.colorPrincipal.name}`}
                      />
                      <div
                        className="w-6 h-6 rounded-lg border border-black/15 shadow-2xs"
                        style={{ backgroundColor: duo.colorSecundario.hex }}
                        title={`Acento: ${duo.colorSecundario.name}`}
                      />
                      {isActive && (
                        <Check className="w-3.5 h-3.5 text-blue-600 ml-auto" />
                      )}
                    </div>
                    <strong className="text-[11px] font-black text-slate-900 block truncate leading-tight">
                      {duo.name}
                    </strong>
                    <span className="text-[9px] text-slate-500 block truncate">
                      {duo.colorPrincipal.name} + {duo.colorSecundario.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* VISUALIZADOR ARQUITECTÓNICO EN VIVO: CÓMO SE VEN LOS 2 COLORES JUNTOS */}
          <div className="rounded-3xl border-2 border-slate-200/90 bg-white p-4 sm:p-5 shadow-sm space-y-3 overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#FF5500] to-[#0055FF] text-white flex items-center justify-center font-bold shadow-xs">
                  <Eye className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-2">
                    <span>Simulador Arquitectónico en Vivo</span>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-full">
                      Render Fotorrealista
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Previsualización precisa de cómo interactúan ambos tonos con iluminación y sombras reales.
                  </p>
                </div>
              </div>

              {/* Selector de Escenas Arquitectónicas */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setActiveScene('living')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeScene === 'living'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Home className="w-3 h-3" />
                  <span>Sala Moderna</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveScene('facade')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeScene === 'facade'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Building className="w-3 h-3" />
                  <span>Fachada Exterior</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveScene('bedroom')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeScene === 'bedroom'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <BedDouble className="w-3 h-3" />
                  <span>Dormitorio / Suite</span>
                </button>
              </div>
            </div>

            {/* CONTENEDOR DEL LIENZO ARQUITECTÓNICO VECTORIAL DE ALTA DEFINICIÓN */}
            <div className="relative w-full aspect-video sm:aspect-[16/9] max-h-[420px] rounded-2xl overflow-hidden border border-slate-300 shadow-inner bg-slate-900 select-none">
              {/* ESCENA 1: SALA CONTEMPORÁNEA (Muros Principales en Color 1 + Muro Focal de Acento en Color 2) */}
              {activeScene === 'living' && (
                <svg viewBox="0 0 1000 562.5" className="w-full h-full object-cover">
                  <defs>
                    {/* Gradiente de luz cenital suave en pared principal */}
                    <linearGradient id="mainWallGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#ffffff" stopOpacity="0.18" />
                      <stop offset="100%" stopColor="#000000" stopOpacity="0.22" />
                    </linearGradient>
                    {/* Gradiente de sombra en esquina de muro de acento */}
                    <linearGradient id="accentCornerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#000000" stopOpacity="0.32" />
                      <stop offset="25%" stopColor="#000000" stopOpacity="0.05" />
                      <stop offset="100%" stopColor="#ffffff" stopOpacity="0.1" />
                    </linearGradient>
                    {/* Gradiente del piso de parquet */}
                    <linearGradient id="floorGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#3d2a1d" />
                      <stop offset="40%" stopColor="#5c4033" />
                      <stop offset="100%" stopColor="#2b1d14" />
                    </linearGradient>
                    {/* Reflejo de luz en el piso */}
                    <linearGradient id="floorReflection" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#ffffff" stopOpacity="0.15" />
                      <stop offset="60%" stopColor="#ffffff" stopOpacity="0.02" />
                      <stop offset="100%" stopColor="#000000" stopOpacity="0.3" />
                    </linearGradient>
                  </defs>

                  {/* 1. Muro Principal Izquierdo & Techo Cove (Color 1 - Principal) */}
                  <polygon points="0,0 340,70 340,430 0,510" fill={hex1} />
                  <polygon points="0,0 340,70 340,430 0,510" fill="url(#mainWallGrad)" />

                  {/* Techo blanco suave arquitectónico */}
                  <polygon points="0,0 1000,0 720,70 340,70" fill="#f8fafc" />
                  <polygon points="0,0 1000,0 720,70 340,70" fill="#000000" fillOpacity="0.08" />

                  {/* 2. Muro Focal de Acento de Fondo (Color 2 - Secundario) */}
                  <polygon points="340,70 720,70 720,430 340,430" fill={hex2} />
                  <polygon points="340,70 720,70 720,430 340,430" fill="url(#accentCornerGrad)" />

                  {/* Muro Derecho con luz natural (Color 1 - Principal) */}
                  <polygon points="720,70 1000,0 1000,510 720,430" fill={hex1} />
                  <polygon points="720,70 1000,0 1000,510 720,430" fill="#000000" fillOpacity="0.15" />

                  {/* Zócalos / Rodapiés blancos de 10cm */}
                  <polygon points="0,510 340,430 340,422 0,502" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                  <polygon points="340,430 720,430 720,422 340,422" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                  <polygon points="720,430 1000,510 1000,502 720,422" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />

                  {/* 3. Piso de madera de roble con perspectiva */}
                  <polygon points="0,510 340,430 720,430 1000,510 1000,562.5 0,562.5" fill="url(#floorGrad)" />
                  <polygon points="0,510 340,430 720,430 1000,510 1000,562.5 0,562.5" fill="url(#floorReflection)" />

                  {/* Listones de madera del piso */}
                  <line x1="120" y1="562.5" x2="380" y2="430" stroke="#1f140c" strokeWidth="1" opacity="0.4" />
                  <line x1="280" y1="562.5" x2="440" y2="430" stroke="#1f140c" strokeWidth="1" opacity="0.4" />
                  <line x1="500" y1="562.5" x2="530" y2="430" stroke="#1f140c" strokeWidth="1" opacity="0.4" />
                  <line x1="720" y1="562.5" x2="620" y2="430" stroke="#1f140c" strokeWidth="1" opacity="0.4" />
                  <line x1="880" y1="562.5" x2="680" y2="430" stroke="#1f140c" strokeWidth="1" opacity="0.4" />

                  {/* Ventana de piso a techo a la izquierda con luz natural */}
                  <polygon points="40,80 180,110 180,390 40,420" fill="#e0f2fe" fillOpacity="0.4" stroke="#94a3b8" strokeWidth="3" />
                  <line x1="110" y1="95" x2="110" y2="405" stroke="#94a3b8" strokeWidth="2" />
                  <line x1="40" y1="240" x2="180" y2="245" stroke="#94a3b8" strokeWidth="2" />

                  {/* Cuadro de galería de arte en el Muro de Acento */}
                  <rect x="470" y="130" width="120" height="150" rx="3" fill="#ffffff" stroke="#1e293b" strokeWidth="4" />
                  <rect x="480" y="140" width="100" height="130" fill="#f1f5f9" />
                  {/* Arte abstracto enmarcado */}
                  <circle cx="530" cy="205" r="30" fill={hex1} />
                  <path d="M490,240 Q530,170 570,240" stroke={hex2} strokeWidth="5" fill="none" />

                  {/* Sofá de diseño contemporáneo frente al muro de acento */}
                  {/* Sombra del sofá */}
                  <ellipse cx="530" cy="460" rx="190" ry="24" fill="#000000" fillOpacity="0.35" />
                  {/* Cuerpo del sofá */}
                  <rect x="370" y="340" width="320" height="90" rx="14" fill="#334155" />
                  <rect x="360" y="380" width="340" height="45" rx="10" fill="#1e293b" />
                  {/* Cojines decorativos que combinan ambos tonos */}
                  <rect x="390" y="360" width="45" height="40" rx="6" fill={hex1} stroke="#ffffff" strokeWidth="1" />
                  <rect x="625" y="360" width="45" height="40" rx="6" fill={hex2} stroke="#ffffff" strokeWidth="1" />

                  {/* Lámpara colgante moderna de techo */}
                  <line x1="530" y1="70" x2="530" y2="105" stroke="#94a3b8" strokeWidth="2" />
                  <polygon points="510,125 550,125 540,105 520,105" fill="#f59e0b" />
                  {/* Haz de luz cálido de la lámpara */}
                  <polygon points="530,125 410,310 650,310" fill="#fbbf24" fillOpacity="0.08" />

                  {/* Etiquetas / Pines flotantes interactivos de Color */}
                  {/* Pin Color 1 */}
                  <g transform="translate(140, 260)">
                    <rect x="0" y="0" width="145" height="34" rx="17" fill="#0f172a" fillOpacity="0.85" stroke="#38bdf8" strokeWidth="1.5" />
                    <circle cx="17" cy="17" r="10" fill={hex1} stroke="#ffffff" strokeWidth="1.5" />
                    <text x="34" y="16" fill="#ffffff" fontSize="10" fontWeight="bold" fontFamily="sans-serif">Color Base (Muros)</text>
                    <text x="34" y="27" fill="#38bdf8" fontSize="9" fontFamily="monospace">{hex1.toUpperCase()} • {pct1}%</text>
                  </g>

                  {/* Pin Color 2 */}
                  <g transform="translate(620, 160)">
                    <rect x="0" y="0" width="155" height="34" rx="17" fill="#0f172a" fillOpacity="0.85" stroke="#c084fc" strokeWidth="1.5" />
                    <circle cx="17" cy="17" r="10" fill={hex2} stroke="#ffffff" strokeWidth="1.5" />
                    <text x="34" y="16" fill="#ffffff" fontSize="10" fontWeight="bold" fontFamily="sans-serif">Acento (Muro Focal)</text>
                    <text x="34" y="27" fill="#c084fc" fontSize="9" fontFamily="monospace">{hex2.toUpperCase()} • {pct2}%</text>
                  </g>
                </svg>
              )}

              {/* ESCENA 2: FACHADA EXTERIOR DE EDIFICIO / RESIDENCIA MODERNA */}
              {activeScene === 'facade' && (
                <svg viewBox="0 0 1000 562.5" className="w-full h-full object-cover">
                  <defs>
                    <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#38bdf8" />
                      <stop offset="60%" stopColor="#bae6fd" />
                      <stop offset="100%" stopColor="#f0f9ff" />
                    </linearGradient>
                    <linearGradient id="facadeShadow" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#ffffff" stopOpacity="0.1" />
                      <stop offset="100%" stopColor="#000000" stopOpacity="0.3" />
                    </linearGradient>
                  </defs>

                  {/* Cielo abierto */}
                  <rect x="0" y="0" width="1000" height="380" fill="url(#skyGrad)" />
                  {/* Suelo / Acera y grama */}
                  <rect x="0" y="470" width="1000" height="92.5" fill="#64748b" />
                  <rect x="0" y="470" width="1000" height="20" fill="#22c55e" />

                  {/* CUERPO PRINCIPAL DEL EDIFICIO (Color 1 - Fachada Predominante) */}
                  <rect x="180" y="110" width="640" height="360" rx="4" fill={hex1} />
                  <rect x="180" y="110" width="640" height="360" rx="4" fill="url(#facadeShadow)" />

                  {/* VOLADIZO & MARCOS ARQUITECTÓNICOS SUPERIORES (Color 2 - Acento) */}
                  {/* Cornisa superior volada */}
                  <rect x="160" y="90" width="680" height="25" rx="3" fill={hex2} />
                  {/* Marco perimetral sobresaliente de segundo piso (Acento) */}
                  <rect x="220" y="140" width="300" height="140" rx="6" fill={hex2} stroke="#000000" strokeOpacity="0.2" strokeWidth="2" />

                  {/* Ventanal amplio piso superior con vidrio espejado */}
                  <rect x="235" y="155" width="270" height="110" rx="4" fill="#0284c7" fillOpacity="0.55" stroke="#ffffff" strokeWidth="2" />
                  <line x1="370" y1="155" x2="370" y2="265" stroke="#ffffff" strokeWidth="2" />

                  {/* Balcón con baranda de vidrio templado */}
                  <rect x="560" y="160" width="220" height="120" rx="4" fill={hex1} />
                  <rect x="580" y="180" width="180" height="85" fill="#0369a1" fillOpacity="0.5" />
                  {/* Moldura del balcón en Color 2 */}
                  <rect x="550" y="270" width="240" height="14" rx="2" fill={hex2} />

                  {/* MARQUESINA & PUERTA PRINCIPAL EN PLANTA BAJA (Color 2 - Acento) */}
                  {/* Marquesina volada sobre entrada */}
                  <polygon points="420,330 650,330 630,350 400,350" fill={hex2} />
                  <rect x="420" y="350" width="140" height="120" fill="#1e293b" />
                  {/* Puerta de entrada en madera fina */}
                  <rect x="440" y="365" width="65" height="105" fill="#78350f" stroke="#b45309" strokeWidth="2" />
                  {/* Columna estructural frontal en Color 2 */}
                  <rect x="630" y="340" width="22" height="130" fill={hex2} />

                  {/* Ventanal comercial inferior */}
                  <rect x="220" y="350" width="160" height="100" fill="#38bdf8" fillOpacity="0.45" stroke="#ffffff" strokeWidth="2" />

                  {/* Arbustos de jardinería moderna frente a la fachada */}
                  <ellipse cx="200" cy="475" rx="35" ry="25" fill="#15803d" />
                  <ellipse cx="230" cy="470" rx="30" ry="22" fill="#16a34a" />
                  <ellipse cx="780" cy="475" rx="40" ry="26" fill="#15803d" />
                  <ellipse cx="820" cy="470" rx="32" ry="20" fill="#22c55e" />

                  {/* Etiquetas de Color en Fachada */}
                  <g transform="translate(670, 370)">
                    <rect x="0" y="0" width="155" height="34" rx="17" fill="#0f172a" fillOpacity="0.88" stroke="#38bdf8" strokeWidth="1.5" />
                    <circle cx="17" cy="17" r="10" fill={hex1} stroke="#ffffff" strokeWidth="1.5" />
                    <text x="34" y="16" fill="#ffffff" fontSize="10" fontWeight="bold" fontFamily="sans-serif">Muros Fachada</text>
                    <text x="34" y="27" fill="#38bdf8" fontSize="9" fontFamily="monospace">{hex1.toUpperCase()} • {pct1}%</text>
                  </g>

                  <g transform="translate(180, 50)">
                    <rect x="0" y="0" width="165" height="34" rx="17" fill="#0f172a" fillOpacity="0.88" stroke="#c084fc" strokeWidth="1.5" />
                    <circle cx="17" cy="17" r="10" fill={hex2} stroke="#ffffff" strokeWidth="1.5" />
                    <text x="34" y="16" fill="#ffffff" fontSize="10" fontWeight="bold" fontFamily="sans-serif">Molduras & Marcos</text>
                    <text x="34" y="27" fill="#c084fc" fontSize="9" fontFamily="monospace">{hex2.toUpperCase()} • {pct2}%</text>
                  </g>
                </svg>
              )}

              {/* ESCENA 3: DORMITORIO / SUITE MINIMALISTA */}
              {activeScene === 'bedroom' && (
                <svg viewBox="0 0 1000 562.5" className="w-full h-full object-cover">
                  {/* Muro lateral izquierdo (Color 1 - Principal) */}
                  <polygon points="0,0 280,60 280,440 0,510" fill={hex1} />
                  <polygon points="0,0 280,60 280,440 0,510" fill="#000000" fillOpacity="0.15" />

                  {/* Muro lateral derecho (Color 1 - Principal) */}
                  <polygon points="720,60 1000,0 1000,510 720,440" fill={hex1} />
                  <polygon points="720,60 1000,0 1000,510 720,440" fill="#000000" fillOpacity="0.12" />

                  {/* Techo */}
                  <polygon points="0,0 1000,0 720,60 280,60" fill="#ffffff" />
                  <polygon points="0,0 1000,0 720,60 280,60" fill="#000000" fillOpacity="0.05" />

                  {/* MURO CABECERO DE ACENTO (Color 2 - Secundario) */}
                  <polygon points="280,60 720,60 720,440 280,440" fill={hex2} />
                  {/* Textura sutil o listonado en muro de acento */}
                  <line x1="360" y1="60" x2="360" y2="440" stroke="#ffffff" strokeOpacity="0.12" strokeWidth="2" />
                  <line x1="440" y1="60" x2="440" y2="440" stroke="#ffffff" strokeOpacity="0.12" strokeWidth="2" />
                  <line x1="520" y1="60" x2="520" y2="440" stroke="#ffffff" strokeOpacity="0.12" strokeWidth="2" />
                  <line x1="600" y1="60" x2="600" y2="440" stroke="#ffffff" strokeOpacity="0.12" strokeWidth="2" />
                  <line x1="680" y1="60" x2="680" y2="440" stroke="#ffffff" strokeOpacity="0.12" strokeWidth="2" />

                  {/* Piso alfombrado o madera clara */}
                  <polygon points="0,510 280,440 720,440 1000,510 1000,562.5 0,562.5" fill="#d1d5db" />

                  {/* Cama king size con respaldo contemporáneo */}
                  <rect x="360" y="270" width="280" height="150" rx="10" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1" />
                  <rect x="380" y="230" width="240" height="90" rx="8" fill="#1e293b" />
                  {/* Almohadas y plumón */}
                  <rect x="400" y="280" width="80" height="40" rx="6" fill="#ffffff" />
                  <rect x="520" y="280" width="80" height="40" rx="6" fill="#ffffff" />
                  <rect x="370" y="320" width="260" height="110" rx="6" fill={hex1} stroke="#cbd5e1" strokeWidth="1" />
                  {/* Pie de cama manta decorativa en Color 2 */}
                  <rect x="370" y="390" width="260" height="40" fill={hex2} />

                  {/* Mesitas de noche flotantes con lámparas */}
                  <rect x="290" y="330" width="55" height="35" rx="4" fill="#334155" />
                  <circle cx="317" cy="315" r="12" fill="#fbbf24" fillOpacity="0.8" />
                  <rect x="655" y="330" width="55" height="35" rx="4" fill="#334155" />
                  <circle cx="682" cy="315" r="12" fill="#fbbf24" fillOpacity="0.8" />

                  {/* Etiquetas de Color */}
                  <g transform="translate(110, 220)">
                    <rect x="0" y="0" width="145" height="34" rx="17" fill="#0f172a" fillOpacity="0.85" stroke="#38bdf8" strokeWidth="1.5" />
                    <circle cx="17" cy="17" r="10" fill={hex1} stroke="#ffffff" strokeWidth="1.5" />
                    <text x="34" y="16" fill="#ffffff" fontSize="10" fontWeight="bold" fontFamily="sans-serif">Muros Laterales</text>
                    <text x="34" y="27" fill="#38bdf8" fontSize="9" fontFamily="monospace">{hex1.toUpperCase()} • {pct1}%</text>
                  </g>

                  <g transform="translate(560, 110)">
                    <rect x="0" y="0" width="160" height="34" rx="17" fill="#0f172a" fillOpacity="0.85" stroke="#c084fc" strokeWidth="1.5" />
                    <circle cx="17" cy="17" r="10" fill={hex2} stroke="#ffffff" strokeWidth="1.5" />
                    <text x="34" y="16" fill="#ffffff" fontSize="10" fontWeight="bold" fontFamily="sans-serif">Cabecero Acento</text>
                    <text x="34" y="27" fill="#c084fc" fontSize="9" fontFamily="monospace">{hex2.toUpperCase()} • {pct2}%</text>
                  </g>
                </svg>
              )}
            </div>

            {/* TARJETA DE BALANCE VOLUMÉTRICO DE PINTURA (CUÁNTA PINTURA PARA CADA COLOR) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl border border-black/15 shadow-2xs shrink-0" style={{ backgroundColor: hex1 }} />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <strong className="text-slate-900 font-black truncate">{colorPrincipal}</strong>
                    <span className="text-[10px] bg-sky-100 text-sky-800 font-mono font-bold px-1.5 py-0.2 rounded-md">
                      {pct1}% Base
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 block">
                    {areaTotalM2 > 0 ? `Área estimada: ~${area1} m²` : 'Color para muros predominantes'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl border border-black/15 shadow-2xs shrink-0" style={{ backgroundColor: hex2 }} />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <strong className="text-slate-900 font-black truncate">{colorSecundario}</strong>
                    <span className="text-[10px] bg-purple-100 text-purple-800 font-mono font-bold px-1.5 py-0.2 rounded-md">
                      {pct2}% Acento
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 block">
                    {areaTotalM2 > 0 ? `Área estimada: ~${area2} m²` : 'Color para muro focal o molduras'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
