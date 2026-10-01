import { Database, Key, Link2, ArrowRight, CheckCircle2, FileCode2 } from 'lucide-react';

export function RelationalModelView() {
  const tables = [
    {
      name: 'CLIENTE',
      sqlName: 'tbl_cliente',
      description: 'Datos maestros de la entidad jurídica o persona solicitante.',
      color: 'border-sky-500 bg-sky-50/50',
      badgeColor: 'bg-sky-100 text-sky-700',
      columns: [
        { name: 'cliente_id', type: 'UUID / INT', key: 'PK', desc: 'Identificador único del cliente' },
        { name: 'nombre_razon_social', type: 'VARCHAR(150)', key: null, desc: 'Nombre comercial o razón social' },
        { name: 'documento_nit', type: 'VARCHAR(25)', key: 'UQ', desc: 'NIT con dígito de verificación' },
        { name: 'responsable_contacto', type: 'VARCHAR(120)', key: null, desc: 'Persona responsable del proyecto' },
        { name: 'canal_entrada', type: 'VARCHAR(40)', key: null, desc: 'Origen de la solicitud (Web/App/Asesor)' }
      ]
    },
    {
      name: 'PROYECTO',
      sqlName: 'tbl_proyecto',
      description: 'Definición del requerimiento constructivo, dimensión y plazo.',
      color: 'border-purple-500 bg-purple-50/50',
      badgeColor: 'bg-purple-100 text-purple-800',
      columns: [
        { name: 'proyecto_id', type: 'UUID / INT', key: 'PK', desc: 'Identificador único del proyecto' },
        { name: 'cliente_id', type: 'UUID / INT', key: 'FK', desc: 'Referencia a CLIENTE (1 a N)' },
        { name: 'ciudad', type: 'VARCHAR(80)', key: null, desc: 'Ciudad para ruteo logístico y CEDI' },
        { name: 'tipo_proyecto', type: 'VARCHAR(50)', key: null, desc: 'Fachada, Interior, Piso, etc.' },
        { name: 'area_m2', type: 'DECIMAL(10,2)', key: null, desc: 'Área total cuantitativa a recubrir' },
        { name: 'fecha_requerida', type: 'DATE', key: null, desc: 'Fecha límite de inicio/entrega' }
      ]
    },
    {
      name: 'ESPECIFICACIÓN_TÉCNICA',
      sqlName: 'tbl_especificacion_tecnica',
      description: 'Variables químicas y físicas para cálculo determinista de productos.',
      color: 'border-amber-500 bg-amber-50/50',
      badgeColor: 'bg-amber-100 text-amber-800',
      columns: [
        { name: 'especificacion_id', type: 'UUID / INT', key: 'PK', desc: 'Identificador de la especificación' },
        { name: 'proyecto_id', type: 'UUID / INT', key: 'FK', desc: 'Referencia a PROYECTO (1 a 1)' },
        { name: 'superficie', type: 'VARCHAR(60)', key: null, desc: 'Concreto, metal, yeso, madera' },
        { name: 'ambiente', type: 'VARCHAR(60)', key: null, desc: 'Exterior, interior, industrial' },
        { name: 'condicion', type: 'VARCHAR(60)', key: null, desc: 'Nueva, fisuras, humedad, oxidación' },
        { name: 'color_acabado', type: 'VARCHAR(80)', key: null, desc: 'Tono deseado o código tintométrico' }
      ]
    },
    {
      name: 'EVIDENCIA',
      sqlName: 'tbl_evidencia',
      description: 'Soporte cualitativo, fotografías y notas de contexto legal/operativo.',
      color: 'border-emerald-500 bg-emerald-50/50',
      badgeColor: 'bg-emerald-100 text-emerald-800',
      columns: [
        { name: 'evidencia_id', type: 'UUID / INT', key: 'PK', desc: 'Identificador de la evidencia' },
        { name: 'proyecto_id', type: 'UUID / INT', key: 'FK', desc: 'Referencia a PROYECTO (1 a N)' },
        { name: 'descripcion_libre', type: 'TEXT', key: null, desc: 'Texto de alcance e historial' },
        { name: 'fotos_urls', type: 'JSONB / TEXT[]', key: null, desc: 'Rutas en Cloud Storage de imágenes' },
        { name: 'observaciones', type: 'TEXT', key: null, desc: 'Restricciones de seguridad/acceso' },
        { name: 'consentimiento', type: 'BOOLEAN', key: null, desc: 'Aceptación de Habeas Data' }
      ]
    }
  ];

  return (
    <div id="relational-model-view" className="space-y-8">
      {/* Header Conceptual */}
      <div className="bg-white text-slate-800 p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold uppercase mb-2 border border-indigo-200">
              <Database className="w-3.5 h-3.5 text-indigo-600" />
              Modelo Relacional Normalizado
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Estructura de Datos y Modelo Relacional Mínimo</h2>
            <p className="text-slate-600 text-sm mt-1 max-w-3xl">
              De campos capturados a una base de datos relacional limpia (PostgreSQL / Supabase). Evita duplicidad de clientes, asegura trazabilidad y permite automatización de punta a punta.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-emerald-50 px-3.5 py-2 rounded-2xl border border-emerald-200 text-xs text-emerald-800 font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Tercera Forma Normal (3FN)</span>
          </div>
        </div>
      </div>

      {/* Diagrama de Relaciones */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {tables.map((table, idx) => (
          <div
            key={table.name}
            className={`rounded-2xl border-2 ${table.color} bg-white shadow-sm overflow-hidden flex flex-col justify-between transition-all hover:shadow-md`}
          >
            <div>
              {/* Header de la Tabla */}
              <div className="p-4 border-b border-slate-200 bg-slate-50/70">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs font-bold text-slate-900">{table.name}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${table.badgeColor}`}>
                    {table.sqlName}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">{table.description}</p>
              </div>

              {/* Columnas */}
              <div className="p-3 space-y-1.5 font-mono text-xs">
                {table.columns.map((col) => (
                  <div
                    key={col.name}
                    className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      {col.key === 'PK' && (
                        <span className="bg-amber-500 text-white font-bold text-[9px] px-1 py-0.2 rounded shrink-0">
                          PK
                        </span>
                      )}
                      {col.key === 'FK' && (
                        <span className="bg-indigo-500 text-white font-bold text-[9px] px-1 py-0.2 rounded shrink-0">
                          FK
                        </span>
                      )}
                      {col.key === 'UQ' && (
                        <span className="bg-emerald-500 text-white font-bold text-[9px] px-1 py-0.2 rounded shrink-0">
                          UQ
                        </span>
                      )}
                      <span className="text-slate-800 font-semibold truncate">{col.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 shrink-0">{col.type}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer de Relación */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-600 flex items-center gap-1.5">
              <Link2 className="w-3.5 h-3.5 text-slate-400" />
              {idx === 0 && <span>1 Cliente → N Proyectos</span>}
              {idx === 1 && <span>1 Proyecto → 1 Esp. Técnica</span>}
              {idx === 2 && <span>Cruza con Catálogo & Fórmulas</span>}
              {idx === 3 && <span>1 Proyecto → N Evidencias</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Explicación de Ventajas Analíticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-sm">
            1
          </div>
          <h4 className="font-bold text-sm text-slate-900">Menos Duplicidad</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Si un cliente solicita 5 proyectos en distintas ciudades, su información fiscal (NIT, razón social) se almacena una sola vez.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm">
            2
          </div>
          <h4 className="font-bold text-sm text-slate-900">Mayor Trazabilidad</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Cada cambio de especificación técnica o nueva fotografía queda amarrado al <code>proyecto_id</code> único, garantizando auditoría técnica.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
            3
          </div>
          <h4 className="font-bold text-sm text-slate-900">Base para Automatización</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Permite que Activepieces, n8n o FastAPI lean datos atómicos sin tener que parsear textos desordenados o ambiguos.
          </p>
        </div>
      </div>
    </div>
  );
}
