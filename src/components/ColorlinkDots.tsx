import React from 'react';

/**
 * ColorlinkConfettiDots Component
 * Renders elegant, clean, vibrant multi-colored polka dots / confetti dots
 * (amarillo, naranja, fucsia/magenta, azul rey, cian, verde esmeralda, violeta)
 * distributed harmoniously across the canvas.
 */
export function ColorlinkConfettiDots({ className = '' }: { className?: string }) {
  return (
    <div className={`pointer-events-none select-none overflow-hidden ${className}`}>
      {/* Top right cluster - Varied vibrant colors */}
      <div className="absolute top-3 right-6 w-3.5 h-3.5 rounded-full bg-[#FF6A00] opacity-85 shadow-2xs" />
      <div className="absolute top-8 right-14 w-2 h-2 rounded-full bg-[#009FE3] opacity-90" />
      <div className="absolute top-4 right-24 w-2.5 h-2.5 rounded-full bg-[#EC4899] opacity-85" />
      <div className="absolute top-12 right-8 w-1.5 h-1.5 rounded-full bg-[#FFD100] opacity-90" />
      <div className="absolute top-10 right-28 w-2 h-2 rounded-full bg-[#00A651] opacity-80" />

      {/* Top left cluster - Varied vibrant colors */}
      <div className="absolute top-4 left-6 w-3 h-3 rounded-full bg-[#009FE3] opacity-85 shadow-2xs" />
      <div className="absolute top-10 left-16 w-2 h-2 rounded-full bg-[#FFD100] opacity-90" />
      <div className="absolute top-3 left-28 w-2.5 h-2.5 rounded-full bg-[#EC4899] opacity-85" />
      <div className="absolute top-12 left-8 w-1.5 h-1.5 rounded-full bg-[#8B5CF6] opacity-80" />
      <div className="absolute top-8 left-36 w-2 h-2 rounded-full bg-[#FF6A00] opacity-85" />

      {/* Center ambient scattered dots - Varied vibrant colors */}
      <div className="absolute top-1/2 left-10 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-[#00A651] opacity-75" />
      <div className="absolute top-1/2 right-12 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-[#FF6A00] opacity-80" />
      <div className="absolute top-1/3 left-1/4 w-2 h-2 rounded-full bg-[#EC4899] opacity-75" />
      <div className="absolute top-2/3 right-1/4 w-2 h-2 rounded-full bg-[#FFD100] opacity-80" />
      <div className="absolute top-1/4 right-1/3 w-1.5 h-1.5 rounded-full bg-[#009FE3] opacity-75" />
      <div className="absolute top-3/4 left-1/3 w-2 h-2 rounded-full bg-[#8B5CF6] opacity-80" />
      <div className="absolute top-1/3 right-1/5 w-2 h-2 rounded-full bg-[#00A651] opacity-70" />

      {/* Bottom left cluster - Varied vibrant colors */}
      <div className="absolute bottom-4 left-8 w-3 h-3 rounded-full bg-[#00A651] opacity-85 shadow-2xs" />
      <div className="absolute bottom-9 left-18 w-2 h-2 rounded-full bg-[#FF6A00] opacity-85" />
      <div className="absolute bottom-3 left-32 w-2.5 h-2.5 rounded-full bg-[#009FE3] opacity-85" />
      <div className="absolute bottom-10 left-6 w-1.5 h-1.5 rounded-full bg-[#EC4899] opacity-80" />
      <div className="absolute bottom-6 left-44 w-2 h-2 rounded-full bg-[#FFD100] opacity-80" />

      {/* Bottom right cluster - Varied vibrant colors */}
      <div className="absolute bottom-4 right-8 w-3.5 h-3.5 rounded-full bg-[#EC4899] opacity-85 shadow-2xs" />
      <div className="absolute bottom-10 right-18 w-2 h-2 rounded-full bg-[#FFD100] opacity-90" />
      <div className="absolute bottom-3 right-28 w-2.5 h-2.5 rounded-full bg-[#009FE3] opacity-85" />
      <div className="absolute bottom-12 right-6 w-1.5 h-1.5 rounded-full bg-[#8B5CF6] opacity-80" />
      <div className="absolute bottom-8 right-36 w-2 h-2 rounded-full bg-[#FF6A00] opacity-80" />
      <div className="absolute bottom-5 right-48 w-1.5 h-1.5 rounded-full bg-[#00A651] opacity-75" />
    </div>
  );
}

/**
 * Compact multi-colored dots for cards/boxes
 */
export function ColorlinkDotsCompact({ className = '' }: { className?: string }) {
  return (
    <div className={`pointer-events-none select-none overflow-hidden ${className}`}>
      {/* Top right */}
      <div className="absolute top-2.5 right-4 w-2.5 h-2.5 rounded-full bg-[#FF6A00] opacity-85" />
      <div className="absolute top-6 right-8 w-1.5 h-1.5 rounded-full bg-[#009FE3] opacity-85" />
      <div className="absolute top-3 right-12 w-2 h-2 rounded-full bg-[#EC4899] opacity-80" />
      
      {/* Top left */}
      <div className="absolute top-2.5 left-4 w-2 h-2 rounded-full bg-[#00A651] opacity-85" />
      <div className="absolute top-6 left-9 w-1.5 h-1.5 rounded-full bg-[#FFD100] opacity-80" />
      
      {/* Bottom left */}
      <div className="absolute bottom-2.5 left-5 w-2.5 h-2.5 rounded-full bg-[#8B5CF6] opacity-85" />
      <div className="absolute bottom-6 left-10 w-1.5 h-1.5 rounded-full bg-[#FF6A00] opacity-80" />
      
      {/* Bottom right */}
      <div className="absolute bottom-2.5 right-5 w-2.5 h-2.5 rounded-full bg-[#EC4899] opacity-85" />
      <div className="absolute bottom-6 right-11 w-1.5 h-1.5 rounded-full bg-[#009FE3] opacity-80" />
      <div className="absolute bottom-3 right-18 w-2 h-2 rounded-full bg-[#FFD100] opacity-75" />
    </div>
  );
}
