import React from 'react';

/**
 * ColorlinkPaintSplashes Component
 * Renders decorative, colorful paint splatters and stains (amarillo, cian, magenta, verde, naranja)
 * in the iconic vibrant Colorlink aesthetic over a crisp white document canvas.
 */
export function ColorlinkPaintSplashes({ className = '' }: { className?: string }) {
  return (
    <div className={`pointer-events-none select-none overflow-hidden ${className}`}>
      {/* Mancha 1: Esquina Superior Derecha - Amarillo Cálido + Ámbar Dorado */}
      <svg
        className="absolute -top-6 -right-6 w-44 h-44 opacity-45"
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M130,45 C155,30 185,55 175,85 C165,115 190,140 160,165 C130,190 100,165 75,175 C50,185 30,150 45,120 C60,90 40,65 70,45 C100,25 105,60 130,45 Z"
          fill="#FFD100"
        />
        {/* Gotas satélite */}
        <circle cx="185" cy="40" r="7" fill="#FFD100" />
        <circle cx="160" cy="20" r="4.5" fill="#FF9E00" />
        <circle cx="195" cy="90" r="5" fill="#FFD100" />
        <circle cx="50" cy="185" r="6" fill="#FF9E00" />
        <circle cx="30" cy="165" r="3.5" fill="#FFD100" />
      </svg>

      {/* Mancha 2: Lateral Izquierdo Superior - Cyan Eléctrico Colorlink */}
      <svg
        className="absolute top-16 -left-10 w-48 h-48 opacity-45"
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M40,90 C25,65 55,35 85,45 C115,55 140,30 165,60 C190,90 165,120 175,145 C185,170 150,190 120,175 C90,160 65,180 45,150 C25,120 55,115 40,90 Z"
          fill="#009FE3"
        />
        <circle cx="20" cy="45" r="8" fill="#009FE3" />
        <circle cx="45" cy="20" r="5" fill="#0077B6" />
        <circle cx="10" cy="120" r="6" fill="#009FE3" />
        <circle cx="185" cy="50" r="4.5" fill="#38BDF8" />
        <circle cx="95" cy="185" r="5" fill="#0077B6" />
      </svg>

      {/* Mancha 3: Esquina Inferior Derecha - Magenta / Fucsia Colorlink */}
      <svg
        className="absolute -bottom-10 -right-8 w-52 h-52 opacity-40"
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M120,160 C145,175 175,145 165,115 C155,85 180,60 150,35 C120,10 90,35 65,25 C40,15 20,50 35,80 C50,110 30,135 60,155 C90,175 95,140 120,160 Z"
          fill="#EC4899"
        />
        <circle cx="180" cy="165" r="8" fill="#EC4899" />
        <circle cx="150" cy="190" r="5" fill="#F43F5E" />
        <circle cx="195" cy="115" r="6" fill="#FB7185" />
        <circle cx="40" cy="30" r="5.5" fill="#F472B6" />
      </svg>

      {/* Mancha 4: Lateral Inferior Izquierdo - Verde Esmeralda */}
      <svg
        className="absolute bottom-24 -left-8 w-36 h-36 opacity-40"
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M80,120 C60,140 30,120 40,90 C50,60 25,40 55,20 C85,0 110,30 130,45 C150,60 145,95 125,115 C105,135 100,100 80,120 Z"
          fill="#10B981"
        />
        <circle cx="25" cy="140" r="6" fill="#10B981" />
        <circle cx="45" cy="160" r="4" fill="#059669" />
        <circle cx="150" cy="30" r="5" fill="#10B981" />
      </svg>

      {/* Gotitas decorativas sutiles en el centro */}
      <div className="absolute top-1/3 right-12 w-2.5 h-2.5 rounded-full bg-amber-400 opacity-40" />
      <div className="absolute top-1/3 right-16 w-1.5 h-1.5 rounded-full bg-rose-400 opacity-40" />
      <div className="absolute top-2/3 left-14 w-2 h-2 rounded-full bg-sky-400 opacity-40" />
      <div className="absolute top-2/3 left-20 w-1.5 h-1.5 rounded-full bg-emerald-400 opacity-35" />
    </div>
  );
}

/**
 * ColorlinkRainbowBar Component
 * A continuous vibrant rainbow paint bar featuring Colorlink's authentic signature colors
 */
export function ColorlinkRainbowBar({ className = 'h-2' }: { className?: string }) {
  return (
    <div className={`w-full flex ${className} rounded-full overflow-hidden shadow-xs`}>
      <div className="flex-1 bg-[#FF6A00]" title="Naranja Cálido" />
      <div className="flex-1 bg-[#FFD100]" title="Amarillo Sol" />
      <div className="flex-1 bg-[#00A651]" title="Verde Esmeralda" />
      <div className="flex-1 bg-[#009FE3]" title="Cian Colorlink" />
      <div className="flex-1 bg-[#003882]" title="Azul Real" />
      <div className="flex-1 bg-[#8B5CF6]" title="Violeta" />
      <div className="flex-1 bg-[#EC4899]" title="Magenta / Fucsia" />
    </div>
  );
}
