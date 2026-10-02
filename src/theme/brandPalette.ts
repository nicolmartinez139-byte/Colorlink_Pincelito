/**
 * PALETA OFICIAL DE MARCA COLORLINK® (5 COLORES VIVOS Y LLAMATIVOS)
 * 
 * 1. Azul Eléctrico:  #0055FF (Primario / Confianza tecnológica / Tintometría)
 * 2. Turquesa Neón:   #00D2FF (Secundario / Frescura / Agilidad)
 * 3. Naranja Fuego:   #FF5500 (Acción Principal / Energía / Botones destacados)
 * 4. Magenta Vibrante:#FF007A (Acento Cromático / Colorimetría / Creatividad)
 * 5. Verde Lima Neón: #10E57A (Aprobación / Éxito / Entrega inmediata)
 * 
 * Color de contraste adicional:
 * - Amarillo Eléctrico: #FFD000 (Pendiente / Atención / Destacados)
 */

export const BRAND_COLORS = {
  azulElectrico: '#0055FF',
  turquesaNeon: '#00D2FF',
  naranjaFuego: '#FF5500',
  magentaVibrante: '#FF007A',
  verdeLima: '#10E57A',
  amarilloElectrico: '#FFD000',
  azulProfundo: '#002B99',
  oscuroTexto: '#070D1F'
} as const;

export const BRAND_GRADIENTS = {
  // Degradados de Botones y Encabezados
  naranjaFuego: 'from-[#FF5500] via-[#FF7700] to-[#FF007A]',
  azulElectrico: 'from-[#0055FF] via-[#0099FF] to-[#00D2FF]',
  turquesaVerde: 'from-[#00D2FF] via-[#00E5A3] to-[#10E57A]',
  magentaVioleta: 'from-[#FF007A] via-[#E00096] to-[#0055FF]',
  arcoiris: 'from-[#FF5500] via-[#FFD000] via-[#10E57A] via-[#00D2FF] to-[#FF007A]',
  tarjetaEncabezado: 'from-[#002B99] via-[#0055FF] to-[#00D2FF]',
  tarjetaCalida: 'from-[#FF5500] via-[#FF7700] to-[#FFD000]',
  fondoSuave: 'from-blue-50/80 via-cyan-50/50 to-orange-50/40'
} as const;
