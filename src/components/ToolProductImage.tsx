import React from 'react';

interface ToolProductImageProps {
  toolId: string;
  name: string;
  categoria: string;
  className?: string;
}

/**
 * Renderiza una imagen de referencia técnica realista para cada herramienta y brocha
 * del catálogo de Colorlink Pinturas.
 */
export function ToolProductImage({ toolId, name, categoria, className = 'w-16 h-16' }: ToolProductImageProps) {
  // 1. Brocha Profesional 2"
  if (toolId === 'brocha-pro-2') {
    return (
      <div className={`relative flex items-center justify-center bg-gradient-to-b from-amber-50/80 via-white to-slate-100 rounded-2xl p-1.5 border border-amber-200/60 shadow-inner shrink-0 ${className}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md" fill="none">
          {/* Cerdas suaves de la brocha con textura y puntas */}
          <path d="M38 10 H62 L64 38 C64 42, 36 42, 36 38 Z" fill="#1e293b" />
          <path d="M40 10 L41 38 M44 10 L44 38 M48 10 L48 38 M52 10 L52 38 M56 10 L56 38 M60 10 L59 38" stroke="#334155" strokeWidth="1" strokeDasharray="1,2" />
          {/* Punta con matiz de pintura fresca cyan */}
          <path d="M38 10 H62 L61 17 C54 19, 46 19, 39 17 Z" fill="#00D2FF" opacity="0.9" />
          {/* Virola de acero inoxidable con remaches */}
          <rect x="35" y="38" width="30" height="20" rx="3" fill="url(#steel-grad-1)" stroke="#94a3b8" strokeWidth="1" />
          <circle cx="42" cy="48" r="1.8" fill="#475569" />
          <circle cx="58" cy="48" r="1.8" fill="#475569" />
          <line x1="36" y1="44" x2="64" y2="44" stroke="#e2e8f0" strokeWidth="1" />
          {/* Mango de madera barnizada ergonómico */}
          <path d="M42 58 C42 66, 44 76, 46 88 C47 94, 53 94, 54 88 C56 76, 58 66, 58 58 Z" fill="url(#wood-grad-1)" stroke="#b45309" strokeWidth="1" />
          {/* Orificio para colgar */}
          <circle cx="50" cy="88" r="2.5" fill="#f8fafc" stroke="#78350f" strokeWidth="1" />
          <defs>
            <linearGradient id="steel-grad-1" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#94a3b8" />
              <stop offset="35%" stopColor="#f1f5f9" />
              <stop offset="70%" stopColor="#cbd5e1" />
              <stop offset="100%" stopColor="#64748b" />
            </linearGradient>
            <linearGradient id="wood-grad-1" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#b45309" />
              <stop offset="45%" stopColor="#fde68a" />
              <stop offset="70%" stopColor="#d97706" />
              <stop offset="100%" stopColor="#92400e" />
            </linearGradient>
          </defs>
        </svg>
        <span className="absolute bottom-1 right-1 text-[9px] font-black font-mono px-1 py-0.2 bg-slate-900 text-white rounded">2"</span>
      </div>
    );
  }

  // 2. Brocha Profesional 3" Master Obra
  if (toolId === 'brocha-pro-3') {
    return (
      <div className={`relative flex items-center justify-center bg-gradient-to-b from-orange-50/80 via-white to-slate-100 rounded-2xl p-1.5 border border-orange-200/60 shadow-inner shrink-0 ${className}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md" fill="none">
          {/* Cerdas anchas de 3" */}
          <path d="M30 10 H70 L72 38 C72 43, 28 43, 28 38 Z" fill="#0f172a" />
          <path d="M32 10 L33 38 M37 10 L37 38 M43 10 L43 38 M50 10 L50 38 M57 10 L57 38 M63 10 L63 38 M68 10 L67 38" stroke="#334155" strokeWidth="1" strokeDasharray="1,2" />
          {/* Mancha naranja marca Colorlink */}
          <path d="M30 10 H70 L69 18 C60 20, 40 20, 31 18 Z" fill="#FF5500" opacity="0.9" />
          {/* Virola cromada de 3" */}
          <rect x="27" y="38" width="46" height="20" rx="3" fill="url(#steel-grad-2)" stroke="#94a3b8" strokeWidth="1" />
          <circle cx="35" cy="48" r="2" fill="#475569" />
          <circle cx="50" cy="48" r="2" fill="#475569" />
          <circle cx="65" cy="48" r="2" fill="#475569" />
          {/* Mango ergonómico master */}
          <path d="M40 58 C40 68, 43 78, 45 88 C46 94, 54 94, 55 88 C57 78, 60 68, 60 58 Z" fill="url(#wood-grad-2)" stroke="#78350f" strokeWidth="1" />
          <circle cx="50" cy="88" r="3" fill="#f8fafc" stroke="#78350f" strokeWidth="1" />
          <defs>
            <linearGradient id="steel-grad-2" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#64748b" />
              <stop offset="25%" stopColor="#f8fafc" />
              <stop offset="60%" stopColor="#cbd5e1" />
              <stop offset="100%" stopColor="#475569" />
            </linearGradient>
            <linearGradient id="wood-grad-2" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#92400e" />
              <stop offset="40%" stopColor="#fef3c7" />
              <stop offset="70%" stopColor="#b45309" />
              <stop offset="100%" stopColor="#78350f" />
            </linearGradient>
          </defs>
        </svg>
        <span className="absolute bottom-1 right-1 text-[9px] font-black font-mono px-1 py-0.2 bg-[#FF5500] text-white rounded">3"</span>
      </div>
    );
  }

  // 3. Brocha Angular 2.5" Recortes Precisos
  if (toolId === 'brocha-angular-25') {
    return (
      <div className={`relative flex items-center justify-center bg-gradient-to-b from-sky-50/80 via-white to-slate-100 rounded-2xl p-1.5 border border-sky-200/60 shadow-inner shrink-0 ${className}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md" fill="none">
          {/* Cerdas cortadas en ángulo diagonal de 45° */}
          <path d="M34 26 L66 10 L68 38 C68 42, 32 42, 32 38 Z" fill="#1e293b" />
          {/* Punta con pintura morada Colorlink */}
          <path d="M34 26 L66 10 L65 17 L35 30 Z" fill="#FF007A" opacity="0.9" />
          {/* Virola con inclinación */}
          <rect x="31" y="38" width="38" height="19" rx="3" fill="url(#steel-grad-1)" stroke="#94a3b8" strokeWidth="1" />
          <circle cx="39" cy="47" r="1.8" fill="#475569" />
          <circle cx="61" cy="47" r="1.8" fill="#475569" />
          {/* Mango angular delgado de corte fino */}
          <path d="M43 57 C41 68, 43 78, 46 89 C47 94, 53 94, 54 89 C57 78, 59 68, 57 57 Z" fill="#0f172a" stroke="#334155" strokeWidth="1" />
          <circle cx="50" cy="88" r="2.5" fill="#f8fafc" />
        </svg>
        <span className="absolute bottom-1 right-1 text-[9px] font-black font-mono px-1 py-0.2 bg-purple-700 text-white rounded">2.5" 📐</span>
      </div>
    );
  }

  // 4. Rodillo Antigoteo Microfibra 9"
  if (toolId === 'rodillo-microfibra-9') {
    return (
      <div className={`relative flex items-center justify-center bg-gradient-to-b from-blue-50/80 via-white to-slate-100 rounded-2xl p-1.5 border border-blue-200/60 shadow-inner shrink-0 ${className}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md" fill="none">
          {/* Cilindro de felpa microfibra con rayas clásicas azules */}
          <rect x="24" y="14" width="52" height="24" rx="7" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5" />
          <line x1="33" y1="14" x2="39" y2="38" stroke="#00D2FF" strokeWidth="3.5" strokeLinecap="round" />
          <line x1="47" y1="14" x2="53" y2="38" stroke="#0055FF" strokeWidth="3.5" strokeLinecap="round" />
          <line x1="61" y1="14" x2="67" y2="38" stroke="#00D2FF" strokeWidth="3.5" strokeLinecap="round" />
          {/* Tapa lateral del rodillo */}
          <ellipse cx="24" cy="26" rx="4" ry="12" fill="#0284c7" />
          <ellipse cx="76" cy="26" rx="3" ry="12" fill="#0284c7" />
          {/* Varilla de acero cromado */}
          <path d="M76 26 H84 V56 H54 V70" stroke="#94a3b8" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M76 26 H84 V56 H54 V70" stroke="#f1f5f9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          {/* Mango plástico ergonómico azul marino con agarre */}
          <rect x="47" y="68" width="14" height="26" rx="5" fill="#003882" stroke="#0f172a" strokeWidth="1" />
          <line x1="49" y1="74" x2="59" y2="74" stroke="#38bdf8" strokeWidth="1.5" />
          <line x1="49" y1="80" x2="59" y2="80" stroke="#38bdf8" strokeWidth="1.5" />
          <line x1="49" y1="86" x2="59" y2="86" stroke="#38bdf8" strokeWidth="1.5" />
        </svg>
        <span className="absolute bottom-1 right-1 text-[9px] font-black font-mono px-1 py-0.2 bg-blue-600 text-white rounded">9"</span>
      </div>
    );
  }

  // 5. Rodillo Epóxico / Industrial 9"
  if (toolId === 'rodillo-epoxico-9') {
    return (
      <div className={`relative flex items-center justify-center bg-gradient-to-b from-amber-50/80 via-white to-slate-100 rounded-2xl p-1.5 border border-amber-300/60 shadow-inner shrink-0 ${className}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md" fill="none">
          {/* Cilindro epóxico de poliamida texturado amarillo/dorado */}
          <rect x="24" y="14" width="52" height="24" rx="6" fill="#fef08a" stroke="#ca8a04" strokeWidth="1.5" />
          <line x1="33" y1="14" x2="39" y2="38" stroke="#eab308" strokeWidth="3" strokeDasharray="3,3" />
          <line x1="48" y1="14" x2="54" y2="38" stroke="#ca8a04" strokeWidth="3" strokeDasharray="3,3" />
          <line x1="63" y1="14" x2="69" y2="38" stroke="#eab308" strokeWidth="3" strokeDasharray="3,3" />
          {/* Núcleo fenólico resistente a solventes */}
          <ellipse cx="24" cy="26" rx="4" ry="12" fill="#713f12" />
          <ellipse cx="76" cy="26" rx="3" ry="12" fill="#713f12" />
          {/* Varilla de acero galvanizado pesado */}
          <path d="M76 26 H84 V56 H54 V70" stroke="#64748b" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
          {/* Mango industrial negro resistente a tinner */}
          <rect x="47" y="68" width="14" height="26" rx="5" fill="#18181b" stroke="#3f3f46" strokeWidth="1" />
        </svg>
        <span className="absolute bottom-1 right-1 text-[9px] font-black font-mono px-1 py-0.2 bg-amber-600 text-white rounded">Epoxi 9"</span>
      </div>
    );
  }

  // 6. Repuesto Felpa Microfibra 9"
  if (toolId === 'repuesto-felpa-9') {
    return (
      <div className={`relative flex items-center justify-center bg-gradient-to-b from-slate-50 via-white to-blue-50 rounded-2xl p-1.5 border border-slate-200 shadow-inner shrink-0 ${className}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md" fill="none">
          {/* Tubo cilíndrico de repuesto en perspectiva horizontal */}
          <rect x="20" y="28" width="60" height="44" rx="8" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" />
          <line x1="32" y1="28" x2="42" y2="72" stroke="#00D2FF" strokeWidth="4" />
          <line x1="50" y1="28" x2="60" y2="72" stroke="#0055FF" strokeWidth="4" />
          <line x1="66" y1="28" x2="74" y2="72" stroke="#00D2FF" strokeWidth="4" />
          {/* Núcleo interior hueco de plástico */}
          <ellipse cx="20" cy="50" rx="7" ry="22" fill="#0284c7" />
          <ellipse cx="20" cy="50" rx="3.5" ry="12" fill="#0f172a" />
          <ellipse cx="80" cy="50" rx="5" ry="22" fill="#0284c7" />
        </svg>
        <span className="absolute bottom-1 right-1 text-[9px] font-black font-mono px-1 py-0.2 bg-emerald-600 text-white rounded">Repuesto</span>
      </div>
    );
  }

  // 7. Mini Rodillo 4" con Mango para Rincones
  if (toolId === 'mini-rodillo-4') {
    return (
      <div className={`relative flex items-center justify-center bg-gradient-to-b from-sky-50 via-white to-slate-100 rounded-2xl p-1.5 border border-sky-200 shadow-inner shrink-0 ${className}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md" fill="none">
          {/* Mini cilindro compacto de 4" */}
          <rect x="34" y="16" width="32" height="18" rx="5" fill="#fef08a" stroke="#facc15" strokeWidth="1.5" />
          <ellipse cx="34" cy="25" rx="3" ry="9" fill="#ca8a04" />
          <ellipse cx="66" cy="25" rx="3" ry="9" fill="#ca8a04" />
          {/* Brazo largo para radiador y rincones */}
          <path d="M66 25 H74 V56 H54 V72" stroke="#94a3b8" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="48" y="70" width="12" height="24" rx="4" fill="#0284c7" />
        </svg>
        <span className="absolute bottom-1 right-1 text-[9px] font-black font-mono px-1 py-0.2 bg-sky-600 text-white rounded">Mini 4"</span>
      </div>
    );
  }

  // 8. Espátula Flexible Inoxidable 4"
  if (toolId === 'espatula-inox-4') {
    return (
      <div className={`relative flex items-center justify-center bg-gradient-to-b from-slate-100 via-white to-zinc-200 rounded-2xl p-1.5 border border-slate-300 shadow-inner shrink-0 ${className}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md" fill="none">
          {/* Hoja trapezoidal de acero inoxidable brillante */}
          <polygon points="26,12 74,12 66,54 34,54" fill="url(#blade-grad)" stroke="#94a3b8" strokeWidth="1" />
          <line x1="26" y1="12" x2="74" y2="12" stroke="#f8fafc" strokeWidth="2" />
          {/* Remaches de bronce */}
          <circle cx="43" cy="50" r="1.8" fill="#ca8a04" />
          <circle cx="57" cy="50" r="1.8" fill="#ca8a04" />
          {/* Mango ergonómico bimaterial engomado */}
          <path d="M40 54 H60 V88 C60 94, 40 94, 40 88 Z" fill="#0f172a" stroke="#334155" strokeWidth="1" />
          <rect x="44" y="60" width="12" height="18" rx="3" fill="#ea580c" />
          <circle cx="50" cy="86" r="2.5" fill="#f8fafc" />
          <defs>
            <linearGradient id="blade-grad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#cbd5e1" />
              <stop offset="30%" stopColor="#f8fafc" />
              <stop offset="70%" stopColor="#e2e8f0" />
              <stop offset="100%" stopColor="#94a3b8" />
            </linearGradient>
          </defs>
        </svg>
        <span className="absolute bottom-1 right-1 text-[9px] font-black font-mono px-1 py-0.2 bg-zinc-800 text-white rounded">Inox 4"</span>
      </div>
    );
  }

  // 9. Cinta de Enmascarar Azul Pro 1" x 50m
  if (toolId === 'cinta-azul-50m') {
    return (
      <div className={`relative flex items-center justify-center bg-gradient-to-b from-blue-50 via-white to-sky-100 rounded-2xl p-1.5 border border-blue-300 shadow-inner shrink-0 ${className}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md" fill="none">
          {/* Rollo de cinta en perspectiva */}
          <ellipse cx="50" cy="46" rx="36" ry="24" fill="#0284c7" stroke="#0369a1" strokeWidth="1.5" />
          <ellipse cx="50" cy="46" rx="22" ry="14" fill="#d97706" />
          <ellipse cx="50" cy="46" rx="16" ry="10" fill="#f8fafc" />
          {/* Espesor y altura del rollo de cinta */}
          <path d="M14 46 V58 C14 74, 86 74, 86 58 V46 Z" fill="#0369a1" />
          <ellipse cx="50" cy="58" rx="36" ry="24" fill="#0284c7" opacity="0.3" />
          {/* Pestaña de cinta despegándose */}
          <path d="M86 52 C90 48, 88 34, 76 30" stroke="#38bdf8" strokeWidth="5" strokeLinecap="round" />
        </svg>
        <span className="absolute bottom-1 right-1 text-[9px] font-black font-mono px-1 py-0.2 bg-blue-600 text-white rounded">50m</span>
      </div>
    );
  }

  // 10. Bandeja Plástica Reforzada 9"
  if (toolId === 'bandeja-pintor-9') {
    return (
      <div className={`relative flex items-center justify-center bg-gradient-to-b from-slate-100 via-white to-zinc-200 rounded-2xl p-1.5 border border-slate-300 shadow-inner shrink-0 ${className}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md" fill="none">
          {/* Bandeja plástica rectangular de 9" en perspectiva cenital */}
          <polygon points="16,22 84,22 74,82 26,82" fill="#1e293b" stroke="#0f172a" strokeWidth="1.5" />
          {/* Zona estriada escurridora */}
          <polygon points="22,28 78,28 70,56 30,56" fill="#334155" />
          <line x1="26" y1="34" x2="74" y2="34" stroke="#475569" strokeWidth="1.5" />
          <line x1="28" y1="40" x2="72" y2="40" stroke="#475569" strokeWidth="1.5" />
          <line x1="30" y1="46" x2="70" y2="46" stroke="#475569" strokeWidth="1.5" />
          <line x1="32" y1="52" x2="68" y2="52" stroke="#475569" strokeWidth="1.5" />
          {/* Pozo reservorio profundo con pintura azul fresca */}
          <polygon points="30,58 70,58 66,78 34,78" fill="#00D2FF" />
          {/* Borde exterior reforzado */}
          <polygon points="12,18 88,18 78,86 22,86" fill="none" stroke="#64748b" strokeWidth="1.5" />
        </svg>
        <span className="absolute bottom-1 right-1 text-[9px] font-black font-mono px-1 py-0.2 bg-slate-800 text-white rounded">Bandeja 9"</span>
      </div>
    );
  }

  // 11. Lija de Agua Grano 150/220
  if (toolId === 'lija-agua-pack') {
    return (
      <div className={`relative flex items-center justify-center bg-gradient-to-b from-stone-100 via-white to-stone-200 rounded-2xl p-1.5 border border-stone-300 shadow-inner shrink-0 ${className}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md" fill="none">
          {/* Hoja 1 de fondo */}
          <rect x="22" y="16" width="56" height="66" rx="3" fill="#292524" transform="rotate(-6 50 50)" />
          {/* Hoja 2 intermedia */}
          <rect x="22" y="16" width="56" height="66" rx="3" fill="#44403c" transform="rotate(3 50 50)" />
          {/* Hoja 3 frontal con textura abrasiva de grano */}
          <rect x="22" y="18" width="56" height="64" rx="3" fill="#1c1917" stroke="#78716c" strokeWidth="1" />
          <circle cx="34" cy="30" r="1" fill="#a8a29e" />
          <circle cx="48" cy="42" r="1" fill="#a8a29e" />
          <circle cx="62" cy="36" r="1" fill="#a8a29e" />
          <circle cx="40" cy="58" r="1" fill="#a8a29e" />
          <circle cx="56" cy="68" r="1" fill="#a8a29e" />
          {/* Esquina doblada técnica */}
          <polygon points="68,18 78,28 68,28" fill="#d6d3d1" />
          <text x="30" y="52" fill="#e7e5e4" fontSize="9" fontWeight="900" fontFamily="monospace">GRANO 220</text>
        </svg>
        <span className="absolute bottom-1 right-1 text-[9px] font-black font-mono px-1 py-0.2 bg-stone-800 text-white rounded">x3 Pliegos</span>
      </div>
    );
  }

  // 12. Plástico Protector de Pisos 20m
  if (toolId === 'plastico-protector-20m') {
    return (
      <div className={`relative flex items-center justify-center bg-gradient-to-b from-sky-50 via-white to-blue-50 rounded-2xl p-1.5 border border-sky-300 shadow-inner shrink-0 ${className}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md" fill="none">
          {/* Rollo tubular de polietileno transparente / azul claro */}
          <rect x="18" y="32" width="64" height="34" rx="6" fill="#e0f2fe" stroke="#38bdf8" strokeWidth="1.5" />
          <line x1="28" y1="32" x2="28" y2="66" stroke="#bae6fd" strokeWidth="2" strokeDasharray="3,3" />
          <line x1="44" y1="32" x2="44" y2="66" stroke="#bae6fd" strokeWidth="2" strokeDasharray="3,3" />
          <line x1="60" y1="32" x2="60" y2="66" stroke="#bae6fd" strokeWidth="2" strokeDasharray="3,3" />
          <ellipse cx="18" cy="49" rx="5" ry="17" fill="#0284c7" />
          <ellipse cx="82" cy="49" rx="5" ry="17" fill="#38bdf8" />
          {/* Lámina desplegándose cubriendo el suelo */}
          <path d="M26 66 L12 86 H88 L74 66 Z" fill="#bae6fd" opacity="0.6" stroke="#38bdf8" strokeWidth="1" />
        </svg>
        <span className="absolute bottom-1 right-1 text-[9px] font-black font-mono px-1 py-0.2 bg-sky-700 text-white rounded">40 m²</span>
      </div>
    );
  }

  // 13. Extensión Telescópica Aluminio 4m
  if (toolId === 'extension-telescopica-4m') {
    return (
      <div className={`relative flex items-center justify-center bg-gradient-to-b from-slate-100 via-white to-zinc-200 rounded-2xl p-1.5 border border-slate-300 shadow-inner shrink-0 ${className}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md" fill="none">
          {/* Punta roscada universal para rodillo */}
          <path d="M84 14 L88 18 L82 24 L78 20 Z" fill="#f59e0b" />
          {/* Tubo de aluminio superior delgado */}
          <line x1="78" y1="20" x2="52" y2="46" stroke="#cbd5e1" strokeWidth="5" strokeLinecap="round" />
          <line x1="78" y1="20" x2="52" y2="46" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
          {/* Collarín de bloqueo / twist-lock negro */}
          <circle cx="52" cy="46" r="5" fill="#0f172a" />
          {/* Tubo de aluminio inferior grueso */}
          <line x1="52" y1="46" x2="22" y2="76" stroke="#94a3b8" strokeWidth="8" strokeLinecap="round" />
          <line x1="52" y1="46" x2="22" y2="76" stroke="#f1f5f9" strokeWidth="3" strokeLinecap="round" />
          {/* Empuñadura ergonómica de caucho */}
          <line x1="28" y1="70" x2="16" y2="82" stroke="#ea580c" strokeWidth="10" strokeLinecap="round" />
        </svg>
        <span className="absolute bottom-1 right-1 text-[9px] font-black font-mono px-1 py-0.2 bg-orange-600 text-white rounded">2m-4m</span>
      </div>
    );
  }

  // Fallback genérico por categoría
  return (
    <div className={`flex items-center justify-center bg-slate-100 rounded-2xl border border-slate-200 shrink-0 ${className}`}>
      <span className="text-2xl">{categoria === 'brochas' ? '🖌️' : categoria === 'rodillos' ? '🪣' : '🛠️'}</span>
    </div>
  );
}
