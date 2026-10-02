import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Package,
  Layers,
  TrendingDown,
  RefreshCw,
  Plus,
  ShoppingCart,
  Sliders,
  Check,
  Info,
  Droplet,
  ArrowRight,
  ShieldCheck,
  Zap,
  Wrench,
  Database,
  Search
} from 'lucide-react';
import { formatCOP } from '../utils/calculator';
import { OFFICIAL_TOOLS_INVENTORY, PaintingTool } from '../data/toolsInventory';
import {
  fetchToolsInventoryFromSupabase,
  updateToolStockInSupabase,
  seedToolsInventoryToSupabase
} from '../utils/supabaseApi';

export interface PigmentItem {
  id: string;
  name: string;
  code: string;
  category: 'primario' | 'blanco_negro' | 'base';
  hexColor: string;
  currentStockLiters: number;
  capacityLiters: number;
  unit: 'Litros' | 'Cuñetes';
  status: 'optimo' | 'medio' | 'critico';
  proveedor: string;
  costoPorUnidadCOP: number;
  suggestedReorder: number;
}

export interface ColorRecipe {
  name: string;
  code: string;
  targetHex: string;
  baseRequerida: string;
  formulaPorGalon: {
    blancoMl: number;
    negroMl: number;
    amarilloMl: number;
    azulMl: number;
    rojoMl: number;
  };
  descripcion: string;
}

export const INITIAL_STOCK: PigmentItem[] = [
  // Blanco y Negro
  {
    id: 'pig-blanco',
    name: 'Blanco Dióxido de Titanio Ti-Pure R-902',
    code: 'PW-01',
    category: 'blanco_negro',
    hexColor: '#FFFFFF',
    currentStockLiters: 24.5,
    capacityLiters: 30,
    unit: 'Litros',
    status: 'optimo',
    proveedor: 'Chemours Colombia S.A.',
    costoPorUnidadCOP: 48000,
    suggestedReorder: 0
  },
  {
    id: 'pig-negro',
    name: 'Negro de Carbón Concentrado (Lámpara / High Jet)',
    code: 'PBk-07',
    category: 'blanco_negro',
    hexColor: '#1A1A1A',
    currentStockLiters: 2.8,
    capacityLiters: 20,
    unit: 'Litros',
    status: 'critico', // 14%
    proveedor: 'Orion Engineered Carbons',
    costoPorUnidadCOP: 62000,
    suggestedReorder: 15
  },
  // Primarios
  {
    id: 'pig-amarillo',
    name: 'Amarillo Primario / Ocre (PY74 & Óxido)',
    code: 'PY-74',
    category: 'primario',
    hexColor: '#EAB308',
    currentStockLiters: 8.2,
    capacityLiters: 25,
    unit: 'Litros',
    status: 'medio', // 32%
    proveedor: 'Clariant Pigments Colombia',
    costoPorUnidadCOP: 54000,
    suggestedReorder: 10
  },
  {
    id: 'pig-azul',
    name: 'Azul Primario Ftalocianina Alfa',
    code: 'PB-15:3',
    category: 'primario',
    hexColor: '#2563EB',
    currentStockLiters: 16.4,
    capacityLiters: 20,
    unit: 'Litros',
    status: 'optimo', // 82%
    proveedor: 'Sun Chemical Pigmentos',
    costoPorUnidadCOP: 58000,
    suggestedReorder: 0
  },
  {
    id: 'pig-rojo',
    name: 'Rojo Primario / Magenta (Quinacridona & Óxido)',
    code: 'PR-122',
    category: 'primario',
    hexColor: '#DC2626',
    currentStockLiters: 5.1,
    capacityLiters: 20,
    unit: 'Litros',
    status: 'critico', // 25%
    proveedor: 'DIC Corporation Colombia',
    costoPorUnidadCOP: 65000,
    suggestedReorder: 12
  },
  // Bases Portadoras
  {
    id: 'base-pastel',
    name: 'Base Pastel Portadora (Blanca Alta Densidad)',
    code: 'BASE-P',
    category: 'base',
    hexColor: '#F8FAFC',
    currentStockLiters: 120, // cuñetes
    capacityLiters: 180,
    unit: 'Cuñetes',
    status: 'optimo',
    proveedor: 'Colorlink Planta Central Medellín',
    costoPorUnidadCOP: 145000,
    suggestedReorder: 0
  },
  {
    id: 'base-deep',
    name: 'Base Acento / Deep (Semisaturada)',
    code: 'BASE-D',
    category: 'base',
    hexColor: '#CBD5E1',
    currentStockLiters: 38,
    capacityLiters: 100,
    unit: 'Cuñetes',
    status: 'medio',
    proveedor: 'Colorlink Planta Central Medellín',
    costoPorUnidadCOP: 155000,
    suggestedReorder: 25
  },
  {
    id: 'base-clear',
    name: 'Base Clear Neutra (Colores Intensos / Puros)',
    code: 'BASE-C',
    category: 'base',
    hexColor: '#E2E8F0',
    currentStockLiters: 22,
    capacityLiters: 80,
    unit: 'Cuñetes',
    status: 'critico',
    proveedor: 'Colorlink Planta Central Medellín',
    costoPorUnidadCOP: 165000,
    suggestedReorder: 30
  }
];

export const COLOR_RECIPES: ColorRecipe[] = [
  {
    name: 'Gris Cemento Arquitectónico (Caso Horizonte)',
    code: 'CLK-402',
    targetHex: '#78716C',
    baseRequerida: 'Base Pastel Portadora',
    formulaPorGalon: {
      blancoMl: 4,
      negroMl: 14,
      amarilloMl: 6,
      azulMl: 0,
      rojoMl: 1
    },
    descripcion: 'Tono neutro estándar para fachadas corporativas y residenciales modernas.'
  },
  {
    name: 'Verde Oliva Foresta',
    code: 'CLK-315',
    targetHex: '#4D6B53',
    baseRequerida: 'Base Acento Deep',
    formulaPorGalon: {
      blancoMl: 6,
      negroMl: 8,
      amarilloMl: 22,
      azulMl: 14,
      rojoMl: 0
    },
    descripcion: 'Mezcla equilibrada de Amarillo Primario y Azul Ftalocianina ajustado con Negro de Carbón.'
  },
  {
    name: 'Terracota Colonial Fachada',
    code: 'CLK-520',
    targetHex: '#9E4734',
    baseRequerida: 'Base Acento Deep',
    formulaPorGalon: {
      blancoMl: 2,
      negroMl: 4,
      amarilloMl: 16,
      azulMl: 0,
      rojoMl: 28
    },
    descripcion: 'Dominancia de Rojo Primario con matiz de Amarillo Óxido y sombra en Negro.'
  },
  {
    name: 'Azul Pacífico Intenso',
    code: 'CLK-110',
    targetHex: '#1E3A8A',
    baseRequerida: 'Base Clear Neutra',
    formulaPorGalon: {
      blancoMl: 2,
      negroMl: 3,
      amarilloMl: 0,
      azulMl: 34,
      rojoMl: 5
    },
    descripcion: 'Formulación pura a base de Azul Primario con toque de Magenta para profundidad.'
  },
  {
    name: 'Ocre Andino Dorado',
    code: 'CLK-240',
    targetHex: '#B45309',
    baseRequerida: 'Base Pastel Portadora',
    formulaPorGalon: {
      blancoMl: 8,
      negroMl: 2,
      amarilloMl: 32,
      azulMl: 0,
      rojoMl: 9
    },
    descripcion: 'Alto contenido de pigmento Amarillo con ajuste cálido de Rojo y amortiguación blanca.'
  }
];

interface AdminStockAndAIAdvisorProps {
  queuedProjectCount?: number;
}

export function AdminStockAndAIAdvisor({
  queuedProjectCount = 2
}: AdminStockAndAIAdvisorProps) {
  const [stock, setStock] = useState<PigmentItem[]>(INITIAL_STOCK);
  const [selectedRecipe, setSelectedRecipe] = useState<ColorRecipe>(COLOR_RECIPES[0]);
  const [galonesToMix, setGalonesToMix] = useState<number>(6); // Default 6 galones de la orden Horizonte
  const [isReplenishing, setIsReplenishing] = useState<boolean>(false);
  const [replenishSuccess, setReplenishSuccess] = useState<boolean>(false);

  // Estados para inventario de brochas y herramientas en Supabase
  const [toolsStock, setToolsStock] = useState<PaintingTool[]>(OFFICIAL_TOOLS_INVENTORY);
  const [toolsSearch, setToolsSearch] = useState<string>('');
  const [loadingTools, setLoadingTools] = useState<boolean>(false);
  const [toolUpdateNotice, setToolUpdateNotice] = useState<string | null>(null);

  const loadTools = async () => {
    setLoadingTools(true);
    try {
      const data = await fetchToolsInventoryFromSupabase();
      if (data && data.length > 0) {
        setToolsStock(data);
      }
    } catch (e) {
      console.warn('[AdminStockAndAIAdvisor] Error loading tools:', e);
    } finally {
      setLoadingTools(false);
    }
  };

  useEffect(() => {
    loadTools();
  }, []);

  const handleAdjustStock = async (toolId: string, delta: number) => {
    const item = toolsStock.find(t => t.id === toolId);
    if (!item) return;
    const newStock = Math.max(0, item.stock + delta);
    setToolsStock(prev => prev.map(t => t.id === toolId ? { ...t, stock: newStock } : t));
    const ok = await updateToolStockInSupabase(toolId, newStock);
    if (ok) {
      setToolUpdateNotice(`✓ Stock de ${item.nombre} actualizado a ${newStock} unidades en Supabase`);
      setTimeout(() => setToolUpdateNotice(null), 3500);
    }
  };

  const handleSeedAllTools = async () => {
    setLoadingTools(true);
    await seedToolsInventoryToSupabase();
    await loadTools();
    setToolUpdateNotice('✓ Catálogo de brochas y herramientas sincronizado en Supabase');
    setTimeout(() => setToolUpdateNotice(null), 3500);
  };

  // AI Calculation of what is lacking
  const lackingItems = stock.filter((item) => item.status === 'critico' || item.status === 'medio');
  const criticalItems = stock.filter((item) => item.status === 'critico');

  // Total investment to replenish lacking items
  const totalReplenishCost = lackingItems.reduce(
    (acc, it) => acc + it.suggestedReorder * it.costoPorUnidadCOP,
    0
  );

  const handleReplenishAllWithAI = () => {
    setIsReplenishing(true);
    setTimeout(() => {
      setStock((prev) =>
        prev.map((item) => ({
          ...item,
          currentStockLiters: item.capacityLiters,
          status: 'optimo',
          suggestedReorder: 0
        }))
      );
      setIsReplenishing(false);
      setReplenishSuccess(true);
      setTimeout(() => setReplenishSuccess(false), 4000);
    }, 1200);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 1. SECCIÓN DE ALERTA DE IA: ¿QUÉ HACE FALTA EN FÁBRICA? */}
      <div className="bg-gradient-to-r from-amber-500/15 via-indigo-500/10 to-blue-500/15 border-2 border-amber-300/80 rounded-3xl p-6 sm:p-7 shadow-lg relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 bg-amber-500 text-slate-950 font-black text-xs rounded-full flex items-center gap-1.5 shadow-sm">
                <Sparkles className="w-3.5 h-3.5" />
                IA DE REABASTECIMIENTO COLORLINK
              </span>
              <span className="px-2.5 py-0.5 bg-rose-600 text-white font-extrabold text-[10px] rounded-md animate-pulse">
                {criticalItems.length} INSUMOS EN NIVEL CRÍTICO
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Diagnóstico de Demanda & Faltantes Detectados por la IA
            </h2>

            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              La IA cruzó el inventario disponible con la orden de <strong>Constructora Horizonte (85 m² / 6 galones Gris Cemento)</strong> y las {queuedProjectCount} cotizaciones recibidas hoy.
            </p>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            <button
              type="button"
              onClick={handleReplenishAllWithAI}
              disabled={isReplenishing || criticalItems.length === 0}
              className="px-6 py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-black rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
            >
              {isReplenishing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Procesando Orden de Compra...</span>
                </>
              ) : replenishSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>¡Inventario Reabastecido al 100%!</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4 text-amber-300" />
                  <span>Generar Orden de Compra con IA ({formatCOP(totalReplenishCost)})</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* LISTADO ESPECÍFICO DE LO QUE HACE FALTA */}
        <div className="mt-6 pt-5 border-t border-slate-200/80 grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {/* Faltante 1: Negro de Carbón */}
          <div className="bg-white/90 backdrop-blur-xs p-4 rounded-2xl border border-rose-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                Alerta Crítica • Stock al 14%
              </span>
              <span className="w-3 h-3 rounded-full bg-black border border-slate-300" />
            </div>
            <h4 className="text-xs font-bold text-slate-900">
              Concentrado Negro de Carbón (PBk-07)
            </h4>
            <p className="text-[11px] text-slate-600 leading-snug">
              Quedan solo <strong>2.8 L</strong>. Para preparar el Gris Cemento y los tonos de fachada en cola se requieren <strong>5.2 L</strong>.
            </p>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">Falta comprar:</span>
              <strong className="text-rose-700 font-mono font-bold">+15 Litros</strong>
            </div>
          </div>

          {/* Faltante 2: Rojo Magenta */}
          <div className="bg-white/90 backdrop-blur-xs p-4 rounded-2xl border border-amber-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                Alerta Media • Stock al 25%
              </span>
              <span className="w-3 h-3 rounded-full bg-red-600 border border-slate-300" />
            </div>
            <h4 className="text-xs font-bold text-slate-900">
              Concentrado Rojo Magenta / Óxido (PR-122)
            </h4>
            <p className="text-[11px] text-slate-600 leading-snug">
              Quedan <strong>5.1 L</strong>. Las órdenes de tonos cálidos y terracota agotarán el stock antes del fin de semana.
            </p>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">Falta comprar:</span>
              <strong className="text-amber-800 font-mono font-bold">+12 Litros</strong>
            </div>
          </div>

          {/* Faltante 3: Base Clear Neutra */}
          <div className="bg-white/90 backdrop-blur-xs p-4 rounded-2xl border border-amber-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                Alerta Media • Stock al 27%
              </span>
              <span className="w-3 h-3 rounded-full bg-slate-300 border border-slate-400" />
            </div>
            <h4 className="text-xs font-bold text-slate-900">
              Base Clear Neutra para Colores Intensos
            </h4>
            <p className="text-[11px] text-slate-600 leading-snug">
              Quedan <strong>22 Cuñetes</strong> en bodega. Se proyecta un déficit para aplicaciones de alta saturación cromática.
            </p>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">Falta solicitar a planta:</span>
              <strong className="text-amber-800 font-mono font-bold">+30 Cuñetes</strong>
            </div>
          </div>
        </div>
      </div>

      {/* 2. TABLA Y MONITOR DE STOCK DE COLORES PRIMARIOS, BLANCO Y NEGRO */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                Stock de Tintometría: Primarios, Blanco, Negro y Bases Portadoras
              </h3>
              <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-black rounded-full">
                Hero Euro-Tint
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Concentrados líquidos calibrados para la dispensación automatizada de cualquier color del abanico Colorlink.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl font-bold border border-emerald-200">
              <CheckCircle2 className="w-4 h-4" /> Calibración Delta E &lt; 0.4
            </span>
          </div>
        </div>

        {/* TABLA DE PIGMENTOS */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">Color / Pigmento</th>
                  <th className="p-3">Código</th>
                  <th className="p-3">Categoría</th>
                  <th className="p-3 text-center">Nivel Actual</th>
                  <th className="p-3 text-center">Capacidad</th>
                  <th className="p-3 text-center">Estado</th>
                  <th className="p-3">Proveedor Homologado</th>
                  <th className="p-3 text-right">Sugerencia IA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stock.map((item) => {
                  const percentage = Math.round((item.currentStockLiters / item.capacityLiters) * 100);
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-2.5">
                          <span
                            className="w-4 h-4 rounded-md shrink-0 border border-slate-300 shadow-2xs"
                            style={{ backgroundColor: item.hexColor }}
                          />
                          <div>
                            <span className="font-bold text-slate-900 block">{item.name}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 font-mono text-slate-600 font-bold">{item.code}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                          item.category === 'blanco_negro'
                            ? 'bg-slate-100 text-slate-800'
                            : item.category === 'primario'
                            ? 'bg-blue-50 text-blue-800'
                            : 'bg-purple-50 text-purple-800'
                        }`}>
                          {item.category === 'blanco_negro' ? 'Blanco / Negro' : item.category === 'primario' ? 'Primario' : 'Base'}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex flex-col items-center">
                          <span className="font-mono font-bold text-slate-800">
                            {item.currentStockLiters} {item.unit}
                          </span>
                          <div className="w-20 bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1">
                            <div
                              className={`h-full rounded-full ${
                                item.status === 'critico'
                                  ? 'bg-rose-500'
                                  : item.status === 'medio'
                                  ? 'bg-amber-500'
                                  : 'bg-emerald-500'
                              }`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-center font-mono text-slate-500">
                        {item.capacityLiters} {item.unit}
                      </td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          item.status === 'critico'
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : item.status === 'medio'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}>
                          {item.status === 'critico' ? 'Crítico (Reponer)' : item.status === 'medio' ? 'Moderado' : 'Óptimo'}
                        </span>
                      </td>
                      <td className="p-3 text-slate-600 truncate max-w-[150px]">{item.proveedor}</td>
                      <td className="p-3 text-right">
                        {item.suggestedReorder > 0 ? (
                          <span className="text-rose-600 font-bold font-mono">
                            Pedir +{item.suggestedReorder} {item.unit}
                          </span>
                        ) : (
                          <span className="text-emerald-700 text-[11px] font-semibold">✓ Abastecido</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 3. SIMULADOR DE FÓRMULAS DE COLOR (CÓMO SE MEZCLAN LOS PRIMARIOS + BLANCO Y NEGRO) */}
      <div className="bg-white text-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-black rounded-md">
                LABORATORIO QUÍMICO
              </span>
              <h3 className="text-lg sm:text-xl font-black text-slate-900">
                Simulador de Tintometría: Mezcla de Primarios + Blanco & Negro
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Visualiza cómo se dosifica cada mililitro de colorante líquido en la máquina dispensadora para formular el color exacto.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-200">
            <span className="text-xs text-slate-600 pl-2 font-medium">Cantidad de Galones a Tinturar:</span>
            <input
              type="number"
              min="1"
              max="50"
              value={galonesToMix}
              onChange={(e) => setGalonesToMix(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-16 px-2 py-1 bg-white text-slate-900 font-mono font-bold text-center rounded-xl border border-slate-300 text-xs"
            />
          </div>
        </div>

        {/* SELECTOR DE COLORES */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {COLOR_RECIPES.map((recipe) => (
            <button
              key={recipe.code}
              type="button"
              onClick={() => setSelectedRecipe(recipe)}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                selectedRecipe.code === recipe.code
                  ? 'border-blue-500 bg-blue-50/60 ring-2 ring-blue-400/30'
                  : 'border-slate-200 bg-slate-50/70 hover:bg-slate-100'
              }`}
            >
              <div
                className="w-full h-8 rounded-xl mb-2 border border-slate-200 shadow-inner"
                style={{ backgroundColor: recipe.targetHex }}
              />
              <span className="text-[11px] font-bold block truncate text-slate-900">
                {recipe.name}
              </span>
              <span className="text-[10px] font-mono text-slate-500">
                {recipe.code}
              </span>
            </button>
          ))}
        </div>

        {/* DOSIFICACIÓN Y RECETA DE MEZCLA */}
        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-4 space-y-3">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">
              Color Seleccionado
            </span>
            <div className="flex items-center gap-3">
              <div
                className="w-14 h-14 rounded-2xl border-2 border-slate-200 shadow-sm shrink-0"
                style={{ backgroundColor: selectedRecipe.targetHex }}
              />
              <div>
                <h4 className="font-bold text-slate-900 text-sm">{selectedRecipe.name}</h4>
                <span className="text-xs text-blue-600 font-mono font-bold">{selectedRecipe.code}</span>
                <span className="text-[11px] text-slate-600 block mt-0.5">{selectedRecipe.baseRequerida}</span>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {selectedRecipe.descripcion}
            </p>
          </div>

          <div className="md:col-span-8 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">
                Dosificación requerida para {galonesToMix} {galonesToMix === 1 ? 'Galón' : 'Galones'}:
              </span>
              <span className="text-[10px] text-emerald-700 font-mono font-bold">
                Hero Euro-Tint Precision: ±0.05 ml
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
              {/* Blanco */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-white border border-slate-400" />
                  <span className="text-[11px] text-slate-700 font-bold">Blanco</span>
                </div>
                <span className="font-mono font-black text-slate-900 text-base">
                  {selectedRecipe.formulaPorGalon.blancoMl * galonesToMix} ml
                </span>
                <span className="text-[10px] text-slate-500 block">({selectedRecipe.formulaPorGalon.blancoMl} ml/gal)</span>
              </div>

              {/* Negro */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-black border border-slate-700" />
                  <span className="text-[11px] text-slate-700 font-bold">Negro</span>
                </div>
                <span className="font-mono font-black text-slate-900 text-base">
                  {selectedRecipe.formulaPorGalon.negroMl * galonesToMix} ml
                </span>
                <span className="text-[10px] text-slate-500 block">({selectedRecipe.formulaPorGalon.negroMl} ml/gal)</span>
              </div>

              {/* Amarillo */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                  <span className="text-[11px] text-slate-700 font-bold">Amarillo</span>
                </div>
                <span className="font-mono font-black text-slate-900 text-base">
                  {selectedRecipe.formulaPorGalon.amarilloMl * galonesToMix} ml
                </span>
                <span className="text-[10px] text-slate-500 block">({selectedRecipe.formulaPorGalon.amarilloMl} ml/gal)</span>
              </div>

              {/* Azul */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <span className="text-[11px] text-slate-700 font-bold">Azul</span>
                </div>
                <span className="font-mono font-black text-slate-900 text-base">
                  {selectedRecipe.formulaPorGalon.azulMl * galonesToMix} ml
                </span>
                <span className="text-[10px] text-slate-500 block">({selectedRecipe.formulaPorGalon.azulMl} ml/gal)</span>
              </div>

              {/* Rojo */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  <span className="text-[11px] text-slate-700 font-bold">Rojo</span>
                </div>
                <span className="font-mono font-black text-slate-900 text-base">
                  {selectedRecipe.formulaPorGalon.rojoMl * galonesToMix} ml
                </span>
                <span className="text-[10px] text-slate-500 block">({selectedRecipe.formulaPorGalon.rojoMl} ml/gal)</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500 font-medium">
              <span>Agitación requerida: 3 minutos en agitador giroscópico a 700 RPM</span>
              <span className="text-emerald-700 font-bold">✓ Homologado NTC</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. SECCIÓN: INVENTARIO DE BROCHAS, RODILLOS Y HERRAMIENTAS EN SUPABASE */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-md space-y-6">
        {/* Notificación de actualización */}
        {toolUpdateNotice && (
          <div className="p-3.5 rounded-2xl bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-md animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-white" />
            <span>{toolUpdateNotice}</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#FF5500] to-[#FF007A] text-white flex items-center justify-center font-bold shadow-xs">
                <Wrench className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <span>Inventario de Brochas, Rodillos y Accesorios</span>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                    <Database className="w-3 h-3 text-emerald-600" />
                    <span>Supabase Live</span>
                  </span>
                </h3>
                <p className="text-xs text-slate-500">
                  Control de existencias reales de bodega para herramientas de pintura vendidas en el cotizador.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Buscador */}
            <div className="relative flex-1 sm:w-60">
              <input
                type="text"
                placeholder="Buscar brocha, SKU..."
                value={toolsSearch}
                onChange={(e) => setToolsSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0055FF] transition-all"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>

            {/* Botón Sincronizar */}
            <button
              type="button"
              onClick={handleSeedAllTools}
              disabled={loadingTools}
              className="px-3.5 py-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:brightness-110 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer shrink-0 disabled:opacity-50"
              title="Guardar o restaurar catálogo en Supabase"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingTools ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Sincronizar Supabase</span>
            </button>
          </div>
        </div>

        {/* Tabla de Herramientas y Control de Stock */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-2xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-black text-[10px] tracking-wider">
              <tr>
                <th className="p-3.5">Herramienta / Brocha</th>
                <th className="p-3.5">Categoría</th>
                <th className="p-3.5">Precio Venta</th>
                <th className="p-3.5 text-center">Stock Actual</th>
                <th className="p-3.5 text-center">Estado Bodega</th>
                <th className="p-3.5 text-right">Ajuste de Stock Rápido (Supabase)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {toolsStock
                .filter(t => 
                  toolsSearch === '' ||
                  t.nombre.toLowerCase().includes(toolsSearch.toLowerCase()) ||
                  t.sku.toLowerCase().includes(toolsSearch.toLowerCase()) ||
                  t.categoria.toLowerCase().includes(toolsSearch.toLowerCase())
                )
                .map((tool) => {
                  const isCrit = tool.stock > 0 && tool.stock <= tool.stockMinimo;
                  const isZero = tool.stock <= 0;

                  return (
                    <tr key={tool.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5">
                        <div className="flex items-center gap-2.5">
                          <span className="text-xl p-1 bg-slate-100 rounded-lg">{tool.icono}</span>
                          <div>
                            <span className="font-extrabold text-slate-900 block leading-tight">
                              {tool.nombre}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              SKU: {tool.sku} • {tool.unidad}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 capitalize">
                          {tool.categoria}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono font-bold text-slate-800">
                        {formatCOP(tool.precioCOP)}
                      </td>
                      <td className="p-3.5 text-center">
                        <span className="font-mono font-black text-sm text-slate-900">
                          {tool.stock}
                        </span>
                        <span className="text-[10px] text-slate-400 block font-normal">
                          unidades
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        {isZero ? (
                          <span className="px-2 py-1 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-800 border border-rose-300">
                            Agotado
                          </span>
                        ) : isCrit ? (
                          <span className="px-2 py-1 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-300">
                            Stock Bajo (≤{tool.stockMinimo})
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            ✓ Óptimo en CEDI
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleAdjustStock(tool.id, -5)}
                            disabled={tool.stock <= 0}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed text-slate-700 rounded-lg font-bold text-[11px] transition-colors cursor-pointer"
                            title="Descontar 5 unidades"
                          >
                            -5
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAdjustStock(tool.id, 10)}
                            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg font-bold text-[11px] transition-colors cursor-pointer shadow-2xs"
                            title="Ingresar 10 unidades a bodega"
                          >
                            +10
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAdjustStock(tool.id, 50)}
                            className="px-2.5 py-1 bg-gradient-to-r from-sky-500 to-blue-600 hover:brightness-110 text-white rounded-lg font-bold text-[11px] transition-all cursor-pointer shadow-2xs"
                            title="Reabastecer 50 unidades de fábrica"
                          >
                            +50 Reabastecer
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
