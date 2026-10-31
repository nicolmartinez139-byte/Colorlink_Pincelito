import React, { useState } from 'react';
import {
  Sparkles,
  Layers,
  Wrench,
  Truck,
  CheckCircle2,
  ArrowDown,
  Palette,
  MapPin,
  Camera,
  Check,
  Package
} from 'lucide-react';
import { UserProfile } from '../types/form';
import { PenguinLogo } from './PenguinLogo';
import { ColorlinkRainbowBar, ColorlinkConfettiDots } from './ColorlinkSplashes';

// Importar imágenes reales de alta calidad para cada producto y solución
import paintShowroomImg from '../assets/images/colorlink_paint_showroom_1793121952018.jpg';
import paintToolsImg from '../assets/images/paint_tools_catalog_1793121938995.jpg';
import facadeImg from '../assets/images/paint_facade_ref_1790519863937.jpg';
import interiorImg from '../assets/images/paint_interior_ref_1790519875663.jpg';
import interiorBathKitchenImg from '../assets/images/interior_bath_kitchen_paint_1793414384795.jpg';
import ceilingImg from '../assets/images/paint_ceiling_ref_1790519886503.jpg';
import exteriorT2Img from '../assets/images/exterior_t2_ref_1790522631426.jpg';
import medellinImg from '../assets/images/city_medellin_1790524566117.jpg';
import bogotaImg from '../assets/images/city_bogota_1790524576789.jpg';
import caliImg from '../assets/images/city_cali_1790524587398.jpg';
import barranquillaImg from '../assets/images/city_barranquilla_1790524599314.jpg';
import penguinPhoto from '../assets/images/colorlink_penguin_1788742140265.jpg';
import metalEnamelImg from '../assets/images/metal_enamel_gates_1793208135790.jpg';
import epoxyFloorImg from '../assets/images/epoxy_industrial_floor_1793208134956.jpg';
import woodVarnishImg from '../assets/images/wood_varnish_deck_1793208136674.jpg';
import tintometryLabImg from '../assets/images/tintometry_color_lab_1793208137962.jpg';

interface ColorlinkShowcasePresentationProps {
  activeUser?: UserProfile | null;
  onOpenLogin: () => void;
  onOpenRegister: () => void;
  onScrollToCalculator: () => void;
}

export function ColorlinkShowcasePresentation({
  activeUser,
  onOpenLogin,
  onOpenRegister,
  onScrollToCalculator
}: ColorlinkShowcasePresentationProps) {
  const [activeTab, setActiveTab] = useState<'pinturas' | 'colores' | 'herramientas' | 'ia' | 'logistica'>('pinturas');

  return (
    <div className="mb-8 space-y-6 animate-fadeIn">
      {/* HERO PRINCIPAL: 100% EN LA TEMÁTICA COLORLINK BLANCO/CLARO, SIN AZULES OSCUROS */}
      <div className="relative overflow-hidden rounded-[28px] sm:rounded-[36px] bg-white text-slate-800 p-4 sm:p-9 shadow-lg border border-slate-200/90">
        {/* Barra de colores vivos institucional Colorlink */}
        <ColorlinkRainbowBar className="h-2.5 w-full absolute top-0 left-0" />
        <ColorlinkConfettiDots className="absolute inset-0 z-0 opacity-40 pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center pt-2">
          {/* Columna Izquierda: Branding, Título solo "Colorlink®" y Explicación */}
          <div className="lg:col-span-7 space-y-3.5 sm:space-y-4">
            {/* Badge superior */}
            <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-gradient-to-r from-orange-50 via-sky-50 to-pink-50 border border-slate-200 text-[11px] sm:text-xs font-bold text-slate-800 shadow-2xs">
              <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#10E57A] animate-pulse" />
              <span className="bg-gradient-to-r from-[#FF5500] via-[#0055FF] to-[#FF007A] bg-clip-text text-transparent font-black">
                Tintometría Computarizada, Herramientas & Despacho a Obra
              </span>
            </div>

            {/* Título: Solo Colorlink® con tipografía de marca vibrante */}
            <div className="space-y-1">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-none">
                <span className="bg-gradient-to-r from-[#FF5500] via-[#0055FF] to-[#00D2FF] bg-clip-text text-transparent">
                  Colorlink
                </span>
                <span className="text-[#FF007A]">®</span>
              </h1>
              <p className="text-xs sm:text-base text-slate-600 font-medium leading-relaxed pt-1">
                Fábrica oficial de pinturas de alta durabilidad en Colombia. Explora libremente todas las líneas de pintura arquitectónica, calcula tus metros cuadrados, agrega tus herramientas y cotiza en tiempo real.
              </p>
            </div>

            {/* Banner amigable: Registro solo al comprar */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-amber-50/90 via-orange-50/70 to-yellow-50/80 border border-amber-200/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-2xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shrink-0 shadow-xs text-sm sm:text-base">
                  🛒
                </div>
                <div>
                  <span className="font-extrabold text-slate-900 block text-xs">
                    {activeUser ? 'Sesión de cliente activa y lista para pedidos' : 'Acceso al Cotizador & Pedidos: Inicia sesión o regístrate'}
                  </span>
                  <span className="text-slate-600 text-[11px]">
                    {activeUser
                      ? 'Accede a cotizaciones ilimitadas con precios de fábrica y despacho programado a obra.'
                      : 'Para proteger tarifas preferenciales de fábrica y liquidar flete a obra, ingresa con tu cuenta o regístrate.'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-stretch sm:self-auto shrink-0 w-full sm:w-auto">
                {activeUser ? (
                  <div className="w-full sm:w-auto px-3.5 py-1.5 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-900 font-bold flex items-center justify-center gap-1.5 text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Sesión: {activeUser.responsable?.split(' ')[0] || activeUser.empresa}</span>
                  </div>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={onOpenLogin}
                      className="flex-1 sm:flex-initial px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold transition-all border border-slate-200 shadow-2xs cursor-pointer text-xs text-center active:scale-95"
                    >
                      Iniciar Sesión
                    </button>
                    <button
                      type="button"
                      onClick={onOpenRegister}
                      className="flex-1 sm:flex-initial px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#FF5500] to-[#FF007A] hover:brightness-110 text-white font-black shadow-xs transition-all cursor-pointer text-xs text-center active:scale-95"
                    >
                      Registrarme
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Botón de llamada a la acción */}
            <div className="pt-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
              <button
                type="button"
                onClick={onScrollToCalculator}
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-[#FF5500] via-[#FF8800] to-[#FFD000] hover:brightness-110 text-slate-950 font-black text-xs sm:text-sm rounded-2xl shadow-md shadow-orange-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
              >
                <ArrowDown className="w-4 h-4 text-slate-950 animate-bounce" />
                <span>{activeUser ? 'Hacer Mi Pedido Ahora ↓' : 'Iniciar Sesión para Cotizar & Pedir ↓'}</span>
              </button>
              <span className="text-xs text-slate-500 font-semibold text-center sm:text-left">
                {activeUser
                  ? `✓ Sesión de ${activeUser.responsable?.split(' ')[0] || activeUser.empresa} lista para formalizar pedido`
                  : '✓ Acceso a cotizador mayorista para clientes y constructoras'}
              </span>
            </div>
          </div>

          {/* Columna Derecha: Imagen Principal Fotográfica con Colores Vivos */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden border-2 border-slate-200/90 shadow-xl bg-white group">
              <img
                src={paintShowroomImg}
                alt="Colorlink Pinturas Showroom Oficial"
                className="w-full h-64 sm:h-72 object-cover transform group-hover:scale-105 transition-transform duration-500"
              />
              {/* Overlay y badges flotantes con imágenes de colores */}
              <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-md border border-slate-200 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-black text-slate-800">Laboratorio de Tintometría</span>
              </div>

              <div className="absolute bottom-3 right-3 bg-gradient-to-r from-[#FF5500] via-[#0055FF] to-[#FF007A] text-white px-3 py-1.5 rounded-xl shadow-lg text-xs font-black flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Fórmula Oficial NTC 1335</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CATÁLOGO VISUAL CON FOTOGRAFÍAS REALES Y TABS TEMÁTICOS */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/90 shadow-sm space-y-6">
        {/* Selector de Pestañas con Colores Vivos de Marca */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-sky-600" />
            <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              Catálogo Ilustrado Colorlink®
            </h2>
          </div>
          <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
            Fotografías oficiales de pinturas, herramientas e IA
          </span>
        </div>

        {/* Botones de Categorías */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-2.5">
          {[
            {
              id: 'pinturas',
              title: '1. Líneas de Pintura',
              desc: 'Fachadas, Muros, Esmaltes, Epóxicos',
              icon: Layers,
              activeClass: 'bg-gradient-to-r from-sky-500 via-sky-600 to-blue-600 text-white shadow-md shadow-sky-500/20'
            },
            {
              id: 'colores',
              title: '2. Todos los Colores',
              desc: 'Tintometría & 16.7M de Tonos',
              icon: Palette,
              activeClass: 'bg-gradient-to-r from-[#FF5500] via-[#FF007A] to-[#0055FF] text-white shadow-md shadow-pink-500/20'
            },
            {
              id: 'herramientas',
              title: '3. Brochas & Rodillos',
              desc: 'Herramientas de Pintor',
              icon: Wrench,
              activeClass: 'bg-gradient-to-r from-[#FF5500] to-[#FF8800] text-white shadow-md shadow-orange-500/20'
            },
            {
              id: 'ia',
              title: '4. IA Vision Pincelito',
              desc: 'Diagnóstico de Fotos',
              icon: Sparkles,
              activeClass: 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-indigo-500/20'
            },
            {
              id: 'logistica',
              title: '5. Despacho en Camión',
              desc: 'Medellín, Bogotá, Cali & más',
              icon: Truck,
              activeClass: 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/20'
            }
          ].map((cat) => {
            const Icon = cat.icon;
            const isSelected = activeTab === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveTab(cat.id as any)}
                className={`p-3 sm:p-3.5 rounded-2xl text-left border transition-all cursor-pointer ${
                  cat.id === 'logistica' ? 'col-span-2 sm:col-span-1' : ''
                } ${
                  isSelected
                    ? `${cat.activeClass} border-transparent ring-2 ring-sky-400/30`
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-sky-600'}`} />
                  <span className={`text-xs font-black block truncate ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                    {cat.title}
                  </span>
                </div>
                <span className={`text-[10px] block ${isSelected ? 'text-white/90' : 'text-slate-500'}`}>
                  {cat.desc}
                </span>
              </button>
            );
          })}
        </div>

        {/* CONTENIDO DE CADA CATEGORÍA CON IMÁGENES FOTOGRÁFICAS REALES */}
        <div className="pt-2">
          {/* TAB 1: TODAS LAS LÍNEAS DE PINTURAS */}
          {activeTab === 'pinturas' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-fadeIn">
              {/* Tarjeta 1: Exterior Tipo 1 & Elastomérica */}
              <div className="rounded-3xl border border-slate-200 overflow-hidden bg-white shadow-sm hover:shadow-md transition-all flex flex-col">
                <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                  <img
                    src={facadeImg}
                    alt="Pintura Exterior Fachadas Tipo 1"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-2.5 left-2.5 bg-sky-600 text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md shadow-xs">
                    Exterior Fachadas Tipo 1
                  </span>
                  <span className="absolute bottom-2.5 right-2.5 bg-white/95 text-slate-900 text-xs font-black px-2.5 py-0.5 rounded-lg shadow-sm font-mono">
                    $398.000 / cuñete
                  </span>
                </div>
                <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-black text-slate-900 text-sm">Fachadas 100% Acrílica & Elastomérica</h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Máxima resistencia intemperie (NTC 1335 / 5828). Filtro UV, antialgas y puenteo de microfisuras de hasta 1.5mm.
                    </p>
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-sky-700">
                    <span>✓ Durabilidad 5 a 7 años</span>
                    <span className="text-slate-400 font-normal">Superlavable intemperie</span>
                  </div>
                </div>
              </div>

              {/* Tarjeta 2: Interior Tipo 1 Lavable */}
              <div className="rounded-3xl border border-slate-200 overflow-hidden bg-white shadow-sm hover:shadow-md transition-all flex flex-col">
                <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                  <img
                    src={interiorImg}
                    alt="Pintura Interior Tipo 1 Lavable"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-2.5 left-2.5 bg-emerald-600 text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md shadow-xs">
                    Interior Lavable Tipo 1
                  </span>
                  <span className="absolute bottom-2.5 right-2.5 bg-white/95 text-slate-900 text-xs font-black px-2.5 py-0.5 rounded-lg shadow-sm font-mono">
                    $298.000 / cuñete
                  </span>
                </div>
                <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-black text-slate-900 text-sm">Vinilo Interior Ultra Lavable</h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Resistente a más de 800 ciclos de lavado. Poder cubriente &gt;96%, bajo olor ecológico para salas, alcobas y oficinas.
                    </p>
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-emerald-700">
                    <span>✓ Acabado Mate & Satinado</span>
                    <span className="text-slate-400 font-normal">4 a 6 años certificados</span>
                  </div>
                </div>
              </div>

              {/* Tarjeta 3: Cielorrasos, Baños y Cocinas */}
              <div className="rounded-3xl border border-slate-200 overflow-hidden bg-white shadow-sm hover:shadow-md transition-all flex flex-col">
                <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                  <img
                    src={interiorBathKitchenImg}
                    alt="Pintura Baños, Cocinas y Cielorrasos"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-2.5 left-2.5 bg-cyan-600 text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md shadow-xs">
                    Baños, Cocinas & Techos
                  </span>
                  <span className="absolute bottom-2.5 right-2.5 bg-white/95 text-slate-900 text-xs font-black px-2.5 py-0.5 rounded-lg shadow-sm font-mono">
                    $335.000 / cuñete
                  </span>
                </div>
                <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-black text-slate-900 text-sm">Antihongos & Antirreflejo</h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Fórmula hidrorrepelente que resiste vapor y grasa en cocinas. También opción mate pura para techos de yeso y drywall.
                    </p>
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-cyan-700">
                    <span>✓ Protección Antihongos</span>
                    <span className="text-slate-400 font-normal">Cero salpicadura</span>
                  </div>
                </div>
              </div>

              {/* Tarjeta 4: Esmaltes & Metales */}
              <div className="rounded-3xl border border-slate-200 overflow-hidden bg-white shadow-sm hover:shadow-md transition-all flex flex-col">
                <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                  <img
                    src={metalEnamelImg}
                    alt="Esmaltes y Anticorrosivos para Metales"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-2.5 left-2.5 bg-orange-600 text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md shadow-xs">
                    Esmaltes & Metales
                  </span>
                  <span className="absolute bottom-2.5 right-2.5 bg-white/95 text-slate-900 text-xs font-black px-2.5 py-0.5 rounded-lg shadow-sm font-mono">
                    $74.500 / galón
                  </span>
                </div>
                <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-black text-slate-900 text-sm">Esmalte Sintético & Anticorrosivo</h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Alquídico brillante y satinado (NTC 1283 / 1651). Protección inhibidora contra óxido para rejas, puertas, vigas y tuberías.
                    </p>
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-orange-700">
                    <span>✓ Gran Dureza y Brillo</span>
                    <span className="text-slate-400 font-normal">Interior & Exterior</span>
                  </div>
                </div>
              </div>

              {/* Tarjeta 5: Industrial & Pisos Epóxicos */}
              <div className="rounded-3xl border border-slate-200 overflow-hidden bg-white shadow-sm hover:shadow-md transition-all flex flex-col">
                <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                  <img
                    src={epoxyFloorImg}
                    alt="Epóxica para Pisos y Zonas Industriales"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-2.5 left-2.5 bg-purple-600 text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md shadow-xs">
                    Epóxica & Pisos (A+B)
                  </span>
                  <span className="absolute bottom-2.5 right-2.5 bg-white/95 text-slate-900 text-xs font-black px-2.5 py-0.5 rounded-lg shadow-sm font-mono">
                    $168.000 / kit galón
                  </span>
                </div>
                <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-black text-slate-900 text-sm">Epóxica Altos Sólidos & Poliuretano</h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Resistencia química y mecánica a montacargas y tránsito pesado (NTC 4060). También pintura de Tráfico Vial (NTC 1360).
                    </p>
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-purple-700">
                    <span>✓ Tránsito Pesado</span>
                    <span className="text-slate-400 font-normal">Bodegas y Parqueaderos</span>
                  </div>
                </div>
              </div>

              {/* Tarjeta 6: Maderas & Barnices */}
              <div className="rounded-3xl border border-slate-200 overflow-hidden bg-white shadow-sm hover:shadow-md transition-all flex flex-col">
                <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                  <img
                    src={woodVarnishImg}
                    alt="Barnices y Lacas Protectoras para Madera"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-2.5 left-2.5 bg-amber-700 text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md shadow-xs">
                    Maderas & Especiales
                  </span>
                  <span className="absolute bottom-2.5 right-2.5 bg-white/95 text-slate-900 text-xs font-black px-2.5 py-0.5 rounded-lg shadow-sm font-mono">
                    $79.000 / galón
                  </span>
                </div>
                <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-black text-slate-900 text-sm">Barniz & Laca Poliuretano Maderas</h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Protege y realza la veta de puertas, decks, pérgolas y pisos de madera (NTC 1148). Filtro UV e impermeabilidad total.
                    </p>
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-amber-700">
                    <span>✓ Realza la Veta Natural</span>
                    <span className="text-slate-400 font-normal">Brillante / Satinado / Mate</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TODOS LOS COLORES & TINTOMETRÍA COMPUTARIZADA */}
          {activeTab === 'colores' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="p-6 rounded-3xl bg-gradient-to-r from-orange-50/80 via-pink-50/70 to-sky-50/80 border border-slate-200/90 shadow-xs">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 text-xs font-black text-slate-800 shadow-2xs">
                      <Palette className="w-3.5 h-3.5 text-[#FF5500]" />
                      <span>Tintometría Computarizada Oficial • 16.7 Millones de Colores</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                      Manejamos Todos los Colores y Acabados del Mercado
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
                      En Colorlink® no te limitas a un catálogo fijo. Puedes elegir tonos de nuestras cartas arquitectónicas, ingresar cualquier código de referencia internacional (RAL, Pantone®, NCS) o usar el selector de color hexadecimal para formular cualquier tono imaginable en minutos.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={onScrollToCalculator}
                      className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#FF5500] to-[#FF007A] text-white font-black text-xs shadow-md hover:brightness-110 transition-all cursor-pointer flex items-center gap-2 active:scale-95"
                    >
                      <Palette className="w-4 h-4" />
                      <span>Probar Selector en Cotizador</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Muestrario de Familias de Colores Populares */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                {[
                  { name: 'Blanco Puro', hex: '#FFFFFF', family: 'Neutros & Blancos', ral: 'RAL 9010' },
                  { name: 'Gris Cemento', hex: '#8E9296', family: 'Neutros & Fachadas', ral: 'RAL 7038' },
                  { name: 'Terracota Teja', hex: '#C25D43', family: 'Cálidos & Tierra', ral: 'RAL 8004' },
                  { name: 'Verde Eucalipto', hex: '#587A65', family: 'Botánicos', ral: 'RAL 6011' },
                  { name: 'Azul Océano', hex: '#1C496B', family: 'Azules Profundos', ral: 'RAL 5003' },
                  { name: 'Naranja Colorlink', hex: '#FF5500', family: 'Acentos Vivos', ral: 'Colorlink Signature' }
                ].map((color) => (
                  <div
                    key={color.name}
                    className="p-3 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div
                      className="h-16 w-full rounded-xl border border-black/10 shadow-inner mb-2.5 transition-transform hover:scale-105"
                      style={{ backgroundColor: color.hex }}
                    />
                    <div>
                      <span className="text-[11px] font-black text-slate-800 block truncate">{color.name}</span>
                      <span className="text-[10px] text-slate-400 block font-mono">{color.hex}</span>
                      <span className="text-[9px] font-bold text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded mt-1 inline-block">
                        {color.ral}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Acabados disponibles */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 sm:gap-3 pt-2">
                {[
                  { name: 'Mate Elegante', desc: 'Cero brillo, disimula imperfecciones en muros y techos', icon: '☁️' },
                  { name: 'Satinado Lavable', desc: 'Tacto sedoso de fácil limpieza, brillo sutil decorativo', icon: '✨' },
                  { name: 'Semibrillante', desc: 'Resistente a humedad y condensación en baños y cocinas', icon: '💧' },
                  { name: 'Brillante Extremo', desc: 'Máxima reflectividad y protección para esmaltes y metales', icon: '🌟' },
                  { name: 'Texturizado Graniplast', desc: 'Relleno de grano fino arquitectónico para fachadas', icon: '🧱' }
                ].map((finish, idx) => (
                  <div
                    key={finish.name}
                    className={`p-3 sm:p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-left ${
                      idx === 4 ? 'col-span-2 sm:col-span-1' : ''
                    }`}
                  >
                    <span className="text-xl block mb-1">{finish.icon}</span>
                    <strong className="text-xs font-black text-slate-900 block">{finish.name}</strong>
                    <span className="text-[10px] text-slate-500 leading-tight block mt-1">{finish.desc}</span>
                  </div>
                ))}
              </div>

              {/* FOTOGRAFÍA OFICIAL DEL LABORATORIO DE TINTOMETRÍA COLORLINK */}
              <div className="rounded-3xl border border-slate-200/90 overflow-hidden bg-white shadow-sm grid grid-cols-1 md:grid-cols-12 gap-0">
                <div className="md:col-span-6 relative h-56 sm:h-64 md:h-auto overflow-hidden bg-slate-100">
                  <img
                    src={tintometryLabImg}
                    alt="Laboratorio de Tintometría Computarizada Colorlink"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-3 left-3 px-3 py-1 bg-white/95 backdrop-blur-xs text-slate-900 font-black text-[10px] uppercase rounded-full shadow-xs border border-slate-200/80 flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-[#FF5500]" />
                    <span>Laboratorio Certificado NTC</span>
                  </span>
                </div>
                <div className="md:col-span-6 p-5 sm:p-6 flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md inline-block">
                      Tecnología Industrial Suiza & Alemana
                    </span>
                    <h4 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                      Dispensador Robótico de Pigmentos & Espectrofotometría
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Cada galón o cuñete se formula con dosificación micrométrica computarizada. Garantizamos repetibilidad absoluta de color entre lotes con una desviación delta E menor a 0.5.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-[11px] font-bold text-slate-700">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span>Formulación en &lt; 3 minutos</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-sky-500" />
                      <span>24 Canales de Tinta Libre VOC</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      <span>Lectura Pantone® y RAL</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-purple-500" />
                      <span>Historial de Lote Guardado</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: HERRAMIENTAS DE PINTOR */}
          {activeTab === 'herramientas' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center animate-fadeIn">
              {/* Imagen Fotográfica Real Grande de las Herramientas */}
              <div className="md:col-span-6 rounded-3xl overflow-hidden border-2 border-slate-200 shadow-md">
                <img
                  src={paintToolsImg}
                  alt="Herramientas Profesionales de Pintura Colorlink"
                  className="w-full h-72 sm:h-80 object-cover"
                />
              </div>

              {/* Detalle de Herramientas disponibles para agregar al cotizador */}
              <div className="md:col-span-6 space-y-3.5">
                <div className="p-3.5 rounded-2xl bg-orange-50/70 border border-orange-200/90 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center font-black shrink-0 shadow-xs">
                    🖌️
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <h4 className="font-black text-slate-900 text-xs sm:text-sm">Brochas Profesionales Cerdas Suaves (2", 3" y 4")</h4>
                      <span className="font-mono text-xs font-black text-orange-950">$14.500 COP</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Cerdas sintéticas finas de alta retención que evitan marcas de brocha y facilitan recortes de esquinas y marcos.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-sky-50/70 border border-sky-200/90 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#0055FF] text-white flex items-center justify-center font-black shrink-0 shadow-xs">
                    🎯
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <h4 className="font-black text-slate-900 text-xs sm:text-sm">Rodillo Antigoteo Microfibra 9" con Mango</h4>
                      <span className="font-mono text-xs font-black text-sky-950">$28.500 COP</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Microfibra de alta densidad con mango ergonómico. Cero salpicaduras de pintura en pisos y avance 40% más rápido.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-200/90 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-black shrink-0 shadow-xs">
                    🛡️
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <h4 className="font-black text-slate-900 text-xs sm:text-sm">Bandejas, Cintas de Enmascarar & Lijas de Agua</h4>
                      <span className="font-mono text-xs font-black text-purple-950">Desde $8.500 COP</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Kit completo de protección para zócalos, ventanas, pisos y preparación de muros disponible en el paso 2 del cotizador.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: IA VISION PINCELITO */}
          {activeTab === 'ia' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center animate-fadeIn">
              <div className="md:col-span-5 rounded-3xl overflow-hidden border-2 border-slate-200 shadow-md relative bg-slate-50 flex items-center justify-center">
                <img
                  src={penguinPhoto}
                  alt="Pincelito Pingüino Pintor IA Colorlink"
                  className="w-full h-72 sm:h-80 object-contain p-4"
                />
                <span className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1 rounded-xl text-xs font-black text-slate-800 border border-slate-200 shadow-xs">
                  🐧 Pincelito Asistente Oficial
                </span>
              </div>

              <div className="md:col-span-7 space-y-3.5">
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-purple-100 text-purple-800 px-2.5 py-0.5 rounded-md border border-purple-300">
                    Visión Artificial Gemini & Asesor Humano en Vivo
                  </span>
                  <h3 className="text-xl font-black text-slate-900">
                    Diagnóstico Inteligente de Paredes por Fotografía
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Sube una foto de tu fachada o pared directamente en el formulario o en el chat: la IA de Pincelito inspecciona si hay fisuras superficiales, humedad de lluvia o necesidad de imprimante sellador.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                    <span className="font-black text-slate-900 flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5 text-sky-600" /> Cámara Web o Celular
                    </span>
                    <p className="text-slate-600 text-[11px]">
                      Toma fotos en vivo con tu celular y la IA te valida el tipo de pintura exacto.
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                    <span className="font-black text-slate-900 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Asesor Humano en Vivo
                    </span>
                    <p className="text-slate-600 text-[11px]">
                      Conéctate al instante con un ingeniero asesor comercial para validar tu proyecto.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: LOGÍSTICA & DESPACHO A OBRA */}
          {activeTab === 'logistica' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className="text-base font-black text-slate-900">Despacho Asegurado en Camión Directo a tu Obra</h3>
                  <p className="text-xs text-slate-600">Entregas programadas en las principales capitales y municipios de Colombia</p>
                </div>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300">
                  ✓ Póliza de transporte contra derrames incluida
                </span>
              </div>

              {/* 4 Fotos reales de ciudades con cobertura */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-2xs group">
                  <div className="h-28 overflow-hidden">
                    <img src={medellinImg} alt="Medellín" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="p-2.5 text-center">
                    <span className="font-black text-xs text-slate-900 block">Medellín & Valle de Aburrá</span>
                    <span className="text-[10px] text-sky-700 font-bold">Entrega 24 horas</span>
                  </div>
                </div>

                <div className="rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-2xs group">
                  <div className="h-28 overflow-hidden">
                    <img src={bogotaImg} alt="Bogotá" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="p-2.5 text-center">
                    <span className="font-black text-xs text-slate-900 block">Bogotá D.C. & Sabana</span>
                    <span className="text-[10px] text-sky-700 font-bold">Entrega 24-48 horas</span>
                  </div>
                </div>

                <div className="rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-2xs group">
                  <div className="h-28 overflow-hidden">
                    <img src={caliImg} alt="Cali" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="p-2.5 text-center">
                    <span className="font-black text-xs text-slate-900 block">Cali & Valle del Cauca</span>
                    <span className="text-[10px] text-sky-700 font-bold">Entrega 48 horas</span>
                  </div>
                </div>

                <div className="rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-2xs group">
                  <div className="h-28 overflow-hidden">
                    <img src={barranquillaImg} alt="Barranquilla" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="p-2.5 text-center">
                    <span className="font-black text-xs text-slate-900 block">Barranquilla & Costa</span>
                    <span className="text-[10px] text-sky-700 font-bold">Entrega 48-72 horas</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
