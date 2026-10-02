import React, { useState, useEffect } from 'react';
import { OFFICIAL_TOOLS_INVENTORY, PaintingTool } from '../data/toolsInventory';
import { ToolItemSelection } from '../types/form';
import { formatCOP } from '../utils/calculator';
import { fetchToolsInventoryFromSupabase } from '../utils/supabaseApi';
import {
  Wrench,
  Plus,
  Minus,
  Check,
  Package,
  Sparkles,
  AlertCircle,
  ShoppingBag,
  Database,
  Search,
  RefreshCw,
  CheckCircle2
} from 'lucide-react';

interface PaintingToolsSelectorProps {
  selectedTools: ToolItemSelection[];
  onChange: (tools: ToolItemSelection[]) => void;
}

export function PaintingToolsSelector({ selectedTools = [], onChange }: PaintingToolsSelectorProps) {
  const [tools, setTools] = useState<PaintingTool[]>(OFFICIAL_TOOLS_INVENTORY);
  const [isLoadingSupabase, setIsLoadingSupabase] = useState<boolean>(true);
  const [isSyncedWithSupabase, setIsSyncedWithSupabase] = useState<boolean>(false);
  const [activeCategory, setActiveCategory] = useState<'todas' | 'brochas' | 'rodillos' | 'preparacion' | 'proteccion'>('todas');
  const [searchFilter, setSearchFilter] = useState('');

  // Cargar inventario en vivo desde Supabase
  const loadInventory = async () => {
    setIsLoadingSupabase(true);
    try {
      const liveTools = await fetchToolsInventoryFromSupabase();
      if (liveTools && liveTools.length > 0) {
        setTools(liveTools);
        setIsSyncedWithSupabase(true);
      }
    } catch (e) {
      console.warn('[PaintingToolsSelector] Error al cargar inventario:', e);
    } finally {
      setIsLoadingSupabase(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  const filteredTools = tools.filter(tool => {
    const matchesCategory = activeCategory === 'todas' || tool.categoria === activeCategory;
    const matchesSearch = searchFilter === '' ||
      tool.nombre.toLowerCase().includes(searchFilter.toLowerCase()) ||
      tool.descripcion.toLowerCase().includes(searchFilter.toLowerCase()) ||
      tool.sku.toLowerCase().includes(searchFilter.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getToolQuantity = (toolId: string): number => {
    const found = selectedTools.find(t => t.id === toolId);
    return found ? found.cantidad : 0;
  };

  const handleUpdateQuantity = (tool: PaintingTool, delta: number) => {
    const currentQty = getToolQuantity(tool.id);
    const newQty = Math.max(0, Math.min(tool.stock, currentQty + delta));

    let updatedList: ToolItemSelection[];
    if (newQty === 0) {
      updatedList = selectedTools.filter(t => t.id !== tool.id);
    } else {
      const existingIndex = selectedTools.findIndex(t => t.id === tool.id);
      const toolSelection: ToolItemSelection = {
        id: tool.id,
        nombre: tool.nombre,
        categoria: tool.categoria,
        precioCOP: tool.precioCOP,
        cantidad: newQty,
        subtotalCOP: newQty * tool.precioCOP,
        sku: tool.sku,
        unidad: tool.unidad,
        stock: tool.stock,
        icono: tool.icono,
        descripcion: tool.descripcion
      };

      if (existingIndex >= 0) {
        updatedList = [...selectedTools];
        updatedList[existingIndex] = toolSelection;
      } else {
        updatedList = [...selectedTools, toolSelection];
      }
    }

    onChange(updatedList);
  };

  const totalHerramientasCOP = selectedTools.reduce((acc, t) => acc + (t.subtotalCOP || 0), 0);
  const totalItemsCount = selectedTools.reduce((acc, t) => acc + (t.cantidad || 0), 0);

  return (
    <div className="space-y-4 rounded-3xl p-5 sm:p-6 bg-slate-50/90 border border-slate-200">
      {/* Encabezado con Indicador de Stock en Bodega & Supabase */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-gradient-to-tr from-[#FF5500] to-[#FF007A] text-white shadow-xs">
              <Wrench className="w-4 h-4" />
            </span>
            <h4 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
              Herramientas y Accesorios de Pintor (Brochas, Rodillos y Cintas)
            </h4>
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
              <Database className="w-3 h-3 text-emerald-600" />
              <span>Inventario Supabase Activo</span>
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Agrega brochas profesionales, rodillos antigoteo, lijas, plásticos y espátulas con stock en bodega garantizado para tu proyecto.
          </p>
        </div>

        {totalItemsCount > 0 ? (
          <div className="px-3.5 py-1.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-2 shrink-0 shadow-2xs">
            <ShoppingBag className="w-4 h-4 text-emerald-600" />
            <div className="text-right">
              <span className="text-[10px] font-bold block uppercase text-emerald-700">
                {totalItemsCount} {totalItemsCount === 1 ? 'accesorio' : 'accesorios'} seleccionados
              </span>
              <span className="text-xs font-black font-mono text-emerald-950">
                +{formatCOP(totalHerramientasCOP)} COP
              </span>
            </div>
          </div>
        ) : (
          <span className="text-[11px] font-bold text-slate-500 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shrink-0 flex items-center gap-1.5">
            <Package className="w-3.5 h-3.5 text-slate-400" />
            <span>Stock CEDI Central Listo</span>
          </span>
        )}
      </div>

      {/* Barra de Filtros, Categorías y Búsqueda */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        {/* Selector de Categorías */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'todas', label: 'Todas las herramientas' },
            { id: 'brochas', label: '🖌️ Brochas de Recorte' },
            { id: 'rodillos', label: '🪣 Rodillos y Mangos' },
            { id: 'preparacion', label: '🛠️ Lijas, Espátulas y Cintas' },
            { id: 'proteccion', label: '🛡️ Plásticos y Varillas' }
          ].map(cat => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Buscador Rápido de Herramientas */}
        <div className="relative min-w-[200px]">
          <input
            type="text"
            placeholder="Buscar brocha, rodillo, SKU..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0055FF] transition-all"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
        </div>
      </div>

      {/* Grid de Productos con Stock y Control de Cantidad */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredTools.map(tool => {
          const qty = getToolQuantity(tool.id);
          const isSelected = qty > 0;
          const isLowStock = tool.stock > 0 && tool.stock <= tool.stockMinimo;
          const isOutOfStock = tool.stock <= 0;

          return (
            <div
              key={tool.id}
              className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between ${
                isSelected
                  ? 'bg-white border-[#0055FF] ring-2 ring-[#0055FF]/20 shadow-md'
                  : 'bg-white/80 border-slate-200 hover:border-slate-300 hover:bg-white shadow-2xs'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl shrink-0 p-1.5 bg-slate-50 rounded-xl border border-slate-100">{tool.icono}</span>
                    <div>
                      <span className="text-xs font-black text-slate-900 leading-snug block">
                        {tool.nombre}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        SKU: {tool.sku}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 shrink-0">
                    {tool.badge}
                  </span>
                </div>

                <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                  {tool.descripcion}
                </p>

                {/* Stock e Indicador en Bodega */}
                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5 text-slate-400" />
                    {isOutOfStock ? (
                      <span className="font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                        Agotado temporalmente
                      </span>
                    ) : isLowStock ? (
                      <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                        Últimas {tool.stock} unidades en stock
                      </span>
                    ) : (
                      <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        {tool.stock} en stock en bodega
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-black font-mono text-[#0055FF]">
                    {formatCOP(tool.precioCOP)} COP
                  </span>
                </div>
              </div>

              {/* Botón de Cantidad */}
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  {qty > 0 ? (
                    <strong className="text-emerald-700 font-mono font-bold">
                      Subtotal: {formatCOP(qty * tool.precioCOP)}
                    </strong>
                  ) : (
                    <span>Presentación: {tool.unidad}</span>
                  )}
                </span>

                <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => handleUpdateQuantity(tool, -1)}
                    disabled={qty === 0}
                    className="w-7 h-7 rounded-lg bg-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-200 text-slate-700 font-black flex items-center justify-center cursor-pointer transition-colors shadow-2xs"
                    title="Disminuir"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>

                  <span className="w-8 text-center font-black font-mono text-xs text-slate-900">
                    {qty}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleUpdateQuantity(tool, 1)}
                    disabled={qty >= tool.stock || isOutOfStock}
                    className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#FF5500] to-[#FF007A] text-white disabled:opacity-30 disabled:cursor-not-allowed hover:brightness-110 font-black flex items-center justify-center cursor-pointer transition-all shadow-2xs"
                    title={qty >= tool.stock ? 'Límite de stock alcanzado' : 'Agregar'}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
