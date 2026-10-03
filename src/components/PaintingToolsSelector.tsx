import React, { useState, useEffect } from 'react';
import { OFFICIAL_TOOLS_INVENTORY, PaintingTool } from '../data/toolsInventory';
import { ToolItemSelection } from '../types/form';
import { formatCOP } from '../utils/calculator';
import { fetchToolsInventoryFromSupabase } from '../utils/supabaseApi';
import { ToolProductImage } from './ToolProductImage';
import {
  Wrench,
  Plus,
  Minus,
  Check,
  ShoppingBag,
  Search
} from 'lucide-react';

interface PaintingToolsSelectorProps {
  selectedTools: ToolItemSelection[];
  onChange: (tools: ToolItemSelection[]) => void;
}

export function PaintingToolsSelector({ selectedTools = [], onChange }: PaintingToolsSelectorProps) {
  const [tools, setTools] = useState<PaintingTool[]>(OFFICIAL_TOOLS_INVENTORY);
  const [activeCategory, setActiveCategory] = useState<'todas' | 'brochas' | 'rodillos' | 'preparacion' | 'proteccion'>('todas');
  const [searchFilter, setSearchFilter] = useState('');

  // Cargar inventario en segundo plano para control de existencia interna
  useEffect(() => {
    let isMounted = true;
    fetchToolsInventoryFromSupabase().then(liveTools => {
      if (isMounted && liveTools && liveTools.length > 0) {
        setTools(liveTools);
      }
    }).catch(() => {});
    return () => { isMounted = false; };
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
    // Control de límite interno de stock sin mostrárselo al cliente
    const maxAllowed = tool.stock > 0 ? tool.stock : 999;
    const newQty = Math.max(0, Math.min(maxAllowed, currentQty + delta));

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
      {/* Encabezado sin 'de Pintor' y sin menciones técnicas de stock para el cliente */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-gradient-to-tr from-[#FF5500] to-[#FF007A] text-white shadow-xs">
              <Wrench className="w-4 h-4" />
            </span>
            <h4 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
              Herramientas y Accesorios (Brochas, Rodillos y Cintas)
            </h4>
          </div>
          <p className="text-xs text-slate-500">
            Agrega brochas profesionales, rodillos antigoteo, lijas, plásticos y espátulas para tu proyecto.
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
          <span className="text-[11px] font-bold text-slate-500 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shrink-0">
            Adicionales para tu obra
          </span>
        )}
      </div>

      {/* Barra de Filtros de Categorías y Buscador */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'todas', label: 'Todas las herramientas' },
            { id: 'brochas', label: '🖌️ Brochas (2", 3", Angular)' },
            { id: 'rodillos', label: '🪣 Rodillos y Mangos' },
            { id: 'preparacion', label: '📏 Cintas, Lijas y Espátulas' },
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

        <div className="relative min-w-[200px]">
          <input
            type="text"
            placeholder="Buscar brocha, rodillo, cinta..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0055FF] transition-all"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
        </div>
      </div>

      {/* Grid de Productos con Imágenes de Referencia Realistas y SIN Stocks Visibles al Cliente */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredTools.map(tool => {
          const qty = getToolQuantity(tool.id);
          const isSelected = qty > 0;

          return (
            <div
              key={tool.id}
              className={`p-4 rounded-3xl border transition-all flex flex-col justify-between group ${
                isSelected
                  ? 'bg-white border-[#0055FF] ring-2 ring-[#0055FF]/20 shadow-md'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
              }`}
            >
              <div className="space-y-3">
                {/* Cabecera del producto: Imagen de Referencia Realista + Título y Badge */}
                <div className="flex items-start gap-3">
                  {/* IMAGEN DE REFERENCIA TÉCNICA VISUAL */}
                  <div className="flex flex-col items-center gap-1 shrink-0">
                    <ToolProductImage
                      toolId={tool.id}
                      name={tool.nombre}
                      categoria={tool.categoria}
                      className="w-20 h-20 sm:w-22 sm:h-22 transition-transform duration-200 group-hover:scale-105"
                    />
                    <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded text-center tracking-tight border border-slate-200/60">
                      Foto de Ref.
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 truncate">
                        {tool.badge}
                      </span>
                    </div>
                    <h5 className="text-xs sm:text-sm font-black text-slate-900 leading-snug">
                      {tool.nombre}
                    </h5>
                    <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                      Presentación: {tool.unidad}
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                  {tool.descripcion}
                </p>

                {/* Precio Unitario Oficial */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 font-medium">
                    Precio unitario:
                  </span>
                  <span className="text-sm font-black font-mono text-[#0055FF]">
                    {formatCOP(tool.precioCOP)} COP
                  </span>
                </div>
              </div>

              {/* Botón de Cantidad y Subtotal */}
              <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs">
                  {qty > 0 ? (
                    <strong className="text-emerald-700 font-mono font-bold">
                      Subtotal: {formatCOP(qty * tool.precioCOP)}
                    </strong>
                  ) : (
                    <span className="text-slate-400 text-[11px]">0 seleccionadas</span>
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
                    className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#FF5500] to-[#FF007A] text-white disabled:opacity-30 disabled:cursor-not-allowed hover:brightness-110 font-black flex items-center justify-center cursor-pointer transition-all shadow-2xs"
                    title="Agregar"
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
