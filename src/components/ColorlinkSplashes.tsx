import React from 'react';

/**
 * ColorlinkPaintSplashes Component
 * Renders decorative, colorful paint splatters and stains (amarillo, cian, magenta, verde, naranja)
 * in the iconic vibrant Colorlink aesthetic over a crisp white document canvas.
 */
export function ColorlinkPaintSplashes({ className = '' }: { className?: string }) {
  return (
    <div className={`pointer-events-none select-none overflow-hidden ${className}`}>
      {/* Mancha 1: Esquina Superior Derecha - Amarillo Brillante + Salpicaduras Naranja */}
      <svg
        className="absolute -top-6 -right-6 w-44 h-44 opacity-80"
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
        <circle cx="160" cy="20" r="4.5" fill="#FF8A00" />
        <circle cx="195" cy="90" r="5" fill="#FFD100" />
        <circle cx="50" cy="185" r="6" fill="#FF8A00" />
        <circle cx="30" cy="165" r="3.5" fill="#FFD100" />
        <path
          d="M140,80 C150,70 165,85 155,95 C145,105 135,90 140,80 Z"
          fill="#FF6D00"
        />
      </svg>

      {/* Mancha 2: Lateral Izquierdo Superior - Cyan Eléctrico y Azul Real */}
      <svg
        className="absolute top-20 -left-10 w-48 h-48 opacity-75"
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M40,90 C25,65 55,35 85,45 C115,55 140,30 165,60 C190,90 165,120 175,145 C185,170 150,190 120,175 C90,160 65,180 45,150 C25,120 55,115 40,90 Z"
          fill="#009FE3"
        />
        <circle cx="20" cy="45" r="8" fill="#009FE3" />
        <circle cx="45" cy="20" r="5" fill="#0056B3" />
        <circle cx="10" cy="120" r="6" fill="#009FE3" />
        <circle cx="185" cy="50" r="4.5" fill="#00A8FF" />
        <circle cx="95" cy="185" r="5" fill="#0056B3" />
      </svg>

      {/* Mancha 3: Esquina Inferior Derecha - Magenta Vibrante / Fucsia Colorlink */}
      <svg
        className="absolute -bottom-10 -right-8 w-52 h-52 opacity-70"
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M120,160 C145,175 175,145 165,115 C155,85 180,60 150,35 C120,10 90,35 65,25 C40,15 20,50 35,80 C50,110 30,135 60,155 C90,175 95,140 120,160 Z"
          fill="#E5007D"
        />
        <circle cx="180" cy="165" r="8" fill="#E5007D" />
        <circle cx="150" cy="190" r="5" fill="#C20066" />
        <circle cx="195" cy="115" r="6" fill="#E5007D" />
        <circle cx="40" cy="30" r="5.5" fill="#FF1493" />
        <circle cx="15" cy="70" r="4" fill="#C20066" />
      </svg>

      {/* Mancha 4: Lateral Inferior Izquierdo - Verde Lima / Esmeralda */}
      <svg
        className="absolute bottom-28 -left-8 w-36 h-36 opacity-70"
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M80,120 C60,140 30,120 40,90 C50,60 25,40 55,20 C85,0 110,30 130,45 C150,60 145,95 125,115 C105,135 100,100 80,120 Z"
          fill="#00A651"
        />
        <circle cx="25" cy="140" r="6" fill="#00A651" />
        <circle cx="45" cy="160" r="4" fill="#78BE20" />
        <circle cx="150" cy="30" r="5" fill="#00A651" />
        <circle cx="140" cy="130" r="4.5" fill="#78BE20" />
      </svg>

      {/* Gotitas decorativas sutiles en el centro */}
      <div className="absolute top-1/3 right-12 w-3 h-3 rounded-full bg-amber-400 opacity-60" />
      <div className="absolute top-1/3 right-16 w-1.5 h-1.5 rounded-full bg-pink-500 opacity-60" />
      <div className="absolute top-2/3 left-14 w-2.5 h-2.5 rounded-full bg-cyan-400 opacity-60" />
      <div className="absolute top-2/3 left-20 w-1.5 h-1.5 rounded-full bg-emerald-500 opacity-50" />
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
      <div className="flex-1 bg-[#FFD100]" title="Amarillo" />
      <div className="flex-1 bg-[#FF6A00]" title="Naranja" />
      <div className="flex-1 bg-[#E30613]" title="Rojo" />
      <div className="flex-1 bg-[#E5007D]" title="Magenta" />
      <div className="flex-1 bg-[#6F2C91]" title="Violeta" />
      <div className="flex-1 bg-[#003882]" title="Azul Real" />
      <div className="flex-1 bg-[#009FE3]" title="Cian" />
      <div className="flex-1 bg-[#00A651]" title="Verde Esmeralda" />
      <div className="flex-1 bg-[#78BE20]" title="Verde Lima" />
    </div>
  );
}
