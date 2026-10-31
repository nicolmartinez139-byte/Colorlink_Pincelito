import React from 'react';
import { ColorlinkPenguin } from './ColorlinkPenguin';

interface PenguinLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export function PenguinLogo({
  className = '',
  size = 'md',
  showText = true
}: PenguinLogoProps) {
  const penguinSize = size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'md';

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* PINGUINITO COLORLINK */}
      <div className="relative shrink-0 flex items-center justify-center">
        <ColorlinkPenguin size={penguinSize} withShadow={false} />
      </div>

      {/* TEXTO DE MARCA VIBRANTE */}
      {showText && (
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1 sm:gap-1.5">
            <span className="font-black text-base sm:text-xl tracking-tight bg-gradient-to-r from-[#FF5500] via-[#0055FF] to-[#00D2FF] bg-clip-text text-transparent">
              COLORLINK
            </span>
            <span className="text-[9px] sm:text-[10px] font-black text-[#0055FF] bg-blue-50 px-1 py-0.2 rounded border border-blue-200">
              ®
            </span>
          </div>
          <span className="text-[9px] sm:text-[10px] font-bold text-slate-500 -mt-0.5 tracking-wide hidden min-[360px]:flex items-center gap-1 truncate">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10E57A] inline-block shrink-0"></span>
            Pinturas & Tintometría
          </span>
        </div>
      )}
    </div>
  );
}
