import { useState } from 'react';
import { FORM_SPECIFICATION, REDUNDANT_FIELDS_ELIMINATED } from '../data/dictionaryData';
import { CheckCircle2, XCircle, AlertCircle, ShieldAlert, Sparkles, Filter, Search, Copy, Check } from 'lucide-react';

export function DataDictionaryView() {
  const [selectedModule, setSelectedModule] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const filteredFields = FORM_SPECIFICATION.filter(field => {
    const matchModule = selectedModule === 'all' || field.module === selectedModule;
    const matchQuery = searchQuery === '' ||
      field.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      field.technicalKey.toLowerCase().includes(searchQuery.toLowerCase()) ||
      field.validation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      field.automationRole.toLowerCase().includes(searchQuery.toLowerCase());
    return matchModule && matchQuery;
  });

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const getModuleBadge = (module: string) => {
    switch (module) {
      case 'Identificación':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Proyecto':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Técnico':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Evidencia':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div id="data-dictionary-view" className="space-y-8">
      {/* Header and Value Statement */}
      <div className="bg-white text-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold uppercase tracking-wider mb-2 border border-blue-200">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              Arquitectura de Captura Inteligente
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Diccionario de Datos: Formulario Mínimo Viable (MVP)</h2>
            <p className="text-slate-600 text-sm mt-1 max-w-3xl">
              Estructura estrictamente normalizada en 4 módulos para alimentar motores de decisión, verificación de inventarios y cotizaciones automáticas sin fricción para el usuario.
            </p>
          </div>
          <div className="flex items-center gap-3 self-start md:self-auto">
            <div className="bg-slate-50 border border-slate-200 px-4 py-2 rounded-2xl text-center">
              <span className="text-2xl font-bold text-blue-600">{FORM_SPECIFICATION.length}</span>
              <span className="block text-xs text-slate-500 uppercase font-semibold">Campos Esenciales</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 px-4 py-2 rounded-2xl text-center">
              <span className="text-2xl font-bold text-emerald-600">4</span>
              <span className="block text-xs text-slate-500 uppercase font-semibold">Módulos Core</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
          <Filter className="w-4 h-4 text-slate-500 shrink-0 ml-1" />
          <span className="text-xs font-semibold text-slate-500 uppercase shrink-0 mr-1">Filtrar por:</span>
          {(['all', 'Identificación', 'Proyecto', 'Técnico', 'Evidencia'] as const).map((mod) => (
            <button
              key={mod}
              id={`filter-btn-${mod}`}
              onClick={() => setSelectedModule(mod)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
                selectedModule === mod
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {mod === 'all' ? 'Todos los Módulos' : mod}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="search-dictionary-input"
            type="text"
            placeholder="Buscar por campo, tipo o regla..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Main Specification Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3.5 px-4">Módulo & Nombre</th>
                <th className="py-3.5 px-4">Clave Técnica (Key)</th>
                <th className="py-3.5 px-4">Tipo de Dato</th>
                <th className="py-3.5 px-4 text-center">Obligatorio</th>
                <th className="py-3.5 px-4 min-w-[220px]">Validación Básica</th>
                <th className="py-3.5 px-4 min-w-[260px]">Rol en Automatización y Decisión</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredFields.map((field) => (
                <tr key={field.id} id={`spec-row-${field.id}`} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex flex-col gap-1">
                      <span className={`inline-flex items-center w-fit px-2 py-0.5 rounded text-[10px] font-semibold border ${getModuleBadge(field.module)}`}>
                        {field.module}
                      </span>
                      <span className="font-semibold text-slate-900">{field.name}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5">
                      <code className="px-2 py-0.5 bg-slate-100 text-slate-800 rounded font-mono text-xs border border-slate-200">
                        {field.technicalKey}
                      </code>
                      <button
                        title="Copiar clave técnica"
                        onClick={() => copyToClipboard(field.technicalKey, field.id)}
                        className="text-slate-400 hover:text-slate-700 p-1"
                      >
                        {copiedKey === field.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono block mt-0.5">{field.sqlType}</span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-700">
                    <span className="inline-flex items-center px-2 py-1 rounded-md bg-slate-100 text-slate-800 text-xs font-medium border border-slate-200/80">
                      {field.dataType}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    {field.required ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-xs font-semibold border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Sí
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full text-xs font-medium">
                        Opcional
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 text-xs leading-relaxed">
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 font-sans">
                      {field.validation}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-700 text-xs leading-relaxed">
                    <div className="text-slate-700 font-medium">{field.automationRole}</div>
                    <div className="text-slate-500 text-[11px] mt-1 italic">{field.businessRule}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Redundant Fields Elimination Section */}
      <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-amber-950">Campos Redundantes Eliminados (Control de Calidad y Fricción Cero)</h3>
            <p className="text-xs text-amber-800">
              Para evitar llenar al cliente de preguntas innecesarias y acelerar la automatización, se descartaron los siguientes datos:
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {REDUNDANT_FIELDS_ELIMINATED.map((item, idx) => (
            <div key={idx} className="bg-white p-4 rounded-xl border border-amber-200/70 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-start gap-2 mb-1.5">
                  <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span className="text-sm font-bold text-slate-900">{item.field}</span>
                </div>
                <p className="text-xs text-slate-600 mb-2.5 leading-relaxed">{item.reason}</p>
              </div>
              <div className="bg-emerald-50 border border-emerald-200/80 p-2.5 rounded-lg text-xs text-emerald-900">
                <span className="font-semibold block text-[11px] text-emerald-700 uppercase mb-0.5">Solución Automatizada:</span>
                {item.alternative}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
