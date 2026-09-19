import React from 'react';
import penguinImg from '../assets/images/colorlink_penguin_1788742140265.jpg';

interface ColorlinkPenguinProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  withShadow?: boolean;
}

export function ColorlinkPenguin({
  className = '',
  size = 'md',
  withShadow = false
}: ColorlinkPenguinProps) {
  const sizeMap = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
    '2xl': 'w-32 h-32'
  };

  const [imgError, setImgError] = React.useState(false);

  return (
    <div className={`relative inline-flex items-center justify-center select-none ${className}`}>
      {withShadow && (
        <div className="absolute -bottom-1.5 w-3/4 h-2 bg-slate-400/30 rounded-full blur-xs" />
      )}

      {!imgError ? (
        <img
          src={penguinImg}
          alt="Colorlink Pingüinito Mascota"
          className={`${sizeMap[size]} object-contain rounded-full`}
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
        />
      ) : (
        /* Vector fallback idéntico al pingüinito tierno de la imagen 2 */
        <svg
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`${sizeMap[size]} shrink-0`}
        >
          {/* Sombra suave en los pies */}
          <ellipse cx="60" cy="112" rx="35" ry="6" fill="#000000" opacity="0.15" />

          {/* Patita izquierda apoyada en suelo */}
          <ellipse cx="44" cy="104" rx="14" ry="7" fill="#F59E0B" stroke="#B45309" strokeWidth="2" />
          {/* Patita derecha alzada caminando alegre */}
          <ellipse cx="78" cy="100" rx="13" ry="6" fill="#F59E0B" stroke="#B45309" strokeWidth="2" transform="rotate(-15 78 100)" />

          {/* Ala izquierda extendida saludando */}
          <path
            d="M 22 55 C 10 50, 12 70, 32 75 C 34 68, 30 58, 22 55 Z"
            fill="#1E293B"
            stroke="#0F172A"
            strokeWidth="2"
          />

          {/* Cuerpo y cabeza principal */}
          <path
            d="M 60 14 C 40 14, 28 32, 28 55 C 28 72, 34 98, 60 98 C 86 98, 92 72, 92 55 C 92 32, 80 14, 60 14 Z"
            fill="#1E293B"
            stroke="#0F172A"
            strokeWidth="2.5"
          />

          {/* Ala derecha extendida */}
          <path
            d="M 88 56 C 104 52, 108 68, 86 78 C 86 70, 88 62, 88 56 Z"
            fill="#1E293B"
            stroke="#0F172A"
            strokeWidth="2"
          />

          {/* Barriguita y pecho blanco grande */}
          <path
            d="M 60 48 C 44 48, 36 64, 38 82 C 40 94, 52 95, 60 95 C 68 95, 80 94, 82 82 C 84 64, 76 48, 60 48 Z"
            fill="#FFFFFF"
          />

          {/* Máscara blanca facial en forma de corazón invertido */}
          <path
            d="M 60 46 C 53 46, 44 38, 44 30 C 44 23, 50 20, 56 22 C 58 23, 59 24, 60 26 C 61 24, 62 23, 64 22 C 70 20, 76 23, 76 30 C 76 38, 67 46, 60 46 Z"
            fill="#FFFFFF"
          />

          {/* Cachetitos rosados tiernos (blush) */}
          <ellipse cx="43" cy="36" rx="4.5" ry="3" fill="#FDA4AF" opacity="0.85" />
          <ellipse cx="77" cy="36" rx="4.5" ry="3" fill="#FDA4AF" opacity="0.85" />

          {/* Ojos cerrados sonrientes en arco (^ ^) */}
          <path
            d="M 46 31 Q 50 26 54 31"
            stroke="#0F172A"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M 66 31 Q 70 26 74 31"
            stroke="#0F172A"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />

          {/* Pico sonriente abierto con lengüita */}
          <path
            d="M 54 34 Q 60 33 66 34 Q 60 44 54 34 Z"
            fill="#F59E0B"
            stroke="#B45309"
            strokeWidth="1.5"
          />
          {/* Lengüita rosada en el interior de la boca */}
          <path
            d="M 57 37 Q 60 35 63 37 Q 60 41 57 37 Z"
            fill="#EF4444"
          />
        </svg>
      )}
    </div>
  );
}
