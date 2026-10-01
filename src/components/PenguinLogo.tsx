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
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-black text-lg sm:text-xl tracking-tight bg-gradient-to-r from-[#FF6A00] via-[#009FE3] to-[#003882] bg-clip-text text-transparent">
              COLORLINK
            </span>
            <span className="text-[10px] font-black text-[#009FE3] bg-sky-50 px-1.5 py-0.2 rounded-md border border-sky-200">
              ®
            </span>
          </div>
          <span className="text-[10px] font-bold text-slate-500 -mt-0.5 tracking-wide flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
            Pinturas & Tintometría
          </span>
        </div>
      )}
    </div>
  );
}
