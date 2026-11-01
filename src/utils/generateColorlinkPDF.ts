import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ProjectFormData, TechnicalCalculationResult } from '../types/form';
import { formatCOP } from './calculator';

export interface PDFDecisionInfo {
  decision: 'accepted' | 'rejected' | 'pending';
  orderNumber?: string;
  decisionTimestamp?: string;
  rejectionReason?: string;
  rejectionNotes?: string;
  metodoPago?: string;
}

/**
 * Generates an official, high-quality vector PDF document for Colorlink cotizaciones.
 * Background: Crisp white with authentic Colorlink signature paint splashes and rainbow bar.
 */
export function createColorlinkPDFDoc(
  formData: ProjectFormData,
  technicalCalc: TechnicalCalculationResult,
  decisionInfo?: PDFDecisionInfo
): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297mm
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  // --- 1. COLORLINK PAINT SPLASHES (Vector-drawn decorative stains) ---
  // Top-Right Yellow/Orange Splat
  doc.setFillColor(255, 209, 0); // Yellow
  doc.circle(pageWidth - 8, 8, 18, 'F');
  doc.circle(pageWidth - 26, 12, 8, 'F');
  doc.circle(pageWidth - 14, 28, 9, 'F');
  doc.setFillColor(255, 138, 0); // Orange
  doc.circle(pageWidth - 32, 22, 4.5, 'F');
  doc.circle(pageWidth - 10, 36, 3.5, 'F');
  doc.circle(pageWidth - 38, 10, 3, 'F');

  // Top-Left Subtle Cyan/Blue Splat
  doc.setFillColor(0, 159, 227); // Cyan
  doc.circle(4, 18, 14, 'F');
  doc.circle(18, 8, 7, 'F');
  doc.setFillColor(0, 56, 130); // Royal Blue
  doc.circle(16, 26, 4, 'F');
  doc.circle(2, 34, 3, 'F');

  // Bottom-Right Magenta/Pink Splat
  doc.setFillColor(229, 0, 125); // Magenta
  doc.circle(pageWidth - 6, pageHeight - 10, 18, 'F');
  doc.circle(pageWidth - 24, pageHeight - 16, 8, 'F');
  doc.circle(pageWidth - 12, pageHeight - 32, 6, 'F');
  doc.setFillColor(194, 0, 102);
  doc.circle(pageWidth - 30, pageHeight - 26, 3.5, 'F');

  // Bottom-Left Green Splat
  doc.setFillColor(0, 166, 81); // Green
  doc.circle(6, pageHeight - 12, 14, 'F');
  doc.circle(20, pageHeight - 8, 6, 'F');
  doc.setFillColor(120, 190, 32); // Lime Green
  doc.circle(16, pageHeight - 22, 4, 'F');
  doc.circle(2, pageHeight - 28, 3, 'F');

  let currentY = 16;

  // --- 2. HEADER: LOGO PINGÜINITO COLORLINK & METADATA ---
  let imageAdded = false;

  if (typeof document !== 'undefined') {
    const penguinImgEl = document.querySelector('img[alt*="Pingüin"], img[src*="colorlink_penguin"]') as HTMLImageElement | null;
    if (penguinImgEl && penguinImgEl.complete && penguinImgEl.naturalWidth > 0) {
      try {
        // Marco institucional para el pingüinito
        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(0, 159, 227); // Colorlink Cyan
        doc.setLineWidth(0.6);
        doc.roundedRect(margin, currentY - 1, 20, 20, 3.5, 3.5, 'FD');

        doc.addImage(penguinImgEl, 'JPEG', margin + 1, currentY, 18, 18);
        imageAdded = true;
      } catch {
        imageAdded = false;
      }
    }
  }

  // Si no se cargó el elemento DOM o es entorno aislado, dibujamos el pingüinito vector de alta precisión
  if (!imageAdded) {
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(0, 159, 227);
    doc.setLineWidth(0.6);
    doc.roundedRect(margin, currentY - 1, 20, 20, 3.5, 3.5, 'FD');

    const cx = margin + 10;
    const cy = currentY + 9;

    // Sombra suave en los pies
    doc.setFillColor(210, 220, 230);
    doc.ellipse(cx, cy + 7.5, 6, 1.2, 'F');

    // Patitas naranjas
    doc.setFillColor(245, 158, 11);
    doc.ellipse(cx - 2.8, cy + 7, 2.2, 1, 'F');
    doc.ellipse(cx + 2.8, cy + 7, 2.2, 1, 'F');

    // Cuerpo negro pizarra
    doc.setFillColor(30, 41, 59);
    doc.ellipse(cx, cy + 2, 5.5, 6, 'F'); // cuerpo
    doc.circle(cx, cy - 2.5, 4.2, 'F'); // cabeza

    // Alitas saludando
    doc.ellipse(cx - 5.2, cy + 2, 1.6, 3.5, 'F');
    doc.ellipse(cx + 5.2, cy + 2, 1.6, 3.5, 'F');

    // Pecho blanco
    doc.setFillColor(255, 255, 255);
    doc.ellipse(cx, cy + 2.2, 3.8, 4.8, 'F');
    doc.ellipse(cx, cy - 1.8, 3, 2.8, 'F');

    // Ojitos
    doc.setFillColor(15, 23, 42);
    doc.circle(cx - 1.3, cy - 2.4, 0.7, 'F');
    doc.circle(cx + 1.3, cy - 2.4, 0.7, 'F');
    doc.setFillColor(255, 255, 255);
    doc.circle(cx - 1.1, cy - 2.6, 0.25, 'F');
    doc.circle(cx + 1.5, cy - 2.6, 0.25, 'F');

    // Mejillas rosadas
    doc.setFillColor(251, 113, 133);
    doc.circle(cx - 2.3, cy - 1.2, 0.7, 'F');
    doc.circle(cx + 2.3, cy - 1.2, 0.7, 'F');

    // Pico naranja
    doc.setFillColor(245, 158, 11);
    doc.triangle(cx - 1.1, cy - 1.5, cx + 1.1, cy - 1.5, cx, cy - 0.2, 'F');

    // Boina de pintor celeste Colorlink
    doc.setFillColor(0, 159, 227);
    doc.ellipse(cx - 0.5, cy - 5.8, 3.8, 1.2, 'F');
    doc.circle(cx - 0.5, cy - 6.6, 0.6, 'F');
  }

  // Title Text
  const textX = margin + 24;
  doc.setTextColor(15, 23, 42); // slate-900
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('COLORLINK®', textX, currentY + 7);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105); // slate-600
  doc.text('El color de la calidad • Sistema Integral de Recubrimientos Arquitectónicos', textX, currentY + 12);
  doc.text('Línea Profesional Especializada para Obras y Constructoras', textX, currentY + 16.5);

  // Right Header: Folio & Date
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(0, 56, 130);
  doc.text('COTIZACIÓN #COT-2026-CLK', pageWidth - margin, currentY + 6, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  const todayStr = new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });
  doc.text(`Fecha de Emisión: ${todayStr}`, pageWidth - margin, currentY + 11, { align: 'right' });
  doc.text('Validez Comercial: 15 Días Calendario', pageWidth - margin, currentY + 15.5, { align: 'right' });

  if (decisionInfo) {
    if (decisionInfo.decision === 'accepted') {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(5, 150, 105); // emerald-600
      doc.text(`ESTADO: TOTAL ACEPTADO (${decisionInfo.orderNumber || 'AUTORIZADO'})`, pageWidth - margin, currentY + 19.5, { align: 'right' });
    } else if (decisionInfo.decision === 'rejected') {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(225, 29, 72); // rose-600
      doc.text('ESTADO: TOTAL RECHAZADO', pageWidth - margin, currentY + 19.5, { align: 'right' });
    } else {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(217, 119, 6); // amber-600
      doc.text('ESTADO: TOTAL PENDIENTE', pageWidth - margin, currentY + 19.5, { align: 'right' });
    }
  }

  currentY += 23;

  // --- 3. RAINBOW PAINT BAR ---
  const colors = [
    [255, 209, 0], // Yellow
    [255, 106, 0], // Orange
    [227, 6, 19],  // Red
    [229, 0, 125], // Magenta
    [111, 44, 145], // Purple
    [0, 56, 130],  // Royal Blue
    [0, 159, 227], // Cyan
    [0, 166, 81],  // Green
    [120, 190, 32], // Lime
  ];
  const barSegmentWidth = contentWidth / colors.length;
  colors.forEach((c, idx) => {
    doc.setFillColor(c[0], c[1], c[2]);
    doc.rect(margin + idx * barSegmentWidth, currentY, barSegmentWidth, 2, 'F');
  });

  currentY += 6;

  // --- 4. CLIENT & PROJECT METADATA CARDS (4 Boxes) ---
  const boxWidth = (contentWidth - 6) / 2;
  const boxHeight = 16;

  // Box 1: Cliente & NIT
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.roundedRect(margin, currentY, boxWidth, boxHeight, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text('CLIENTE / RAZÓN SOCIAL', margin + 3, currentY + 4.5);
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(formData.cliente || 'Consumidor Final', margin + 3, currentY + 9.5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`NIT: ${formData.nitDocumento || 'Consumidor'}`, margin + 3, currentY + 13.5);

  // Box 2: Responsable & Contacto
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin + boxWidth + 6, currentY, boxWidth, boxHeight, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text('RESPONSABLE / CONTACTO DE OBRA', margin + boxWidth + 9, currentY + 4.5);
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(formData.responsable || 'No especificado', margin + boxWidth + 9, currentY + 9.5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Tel: ${formData.telefonoResponsable || 'No registrado'}`, margin + boxWidth + 9, currentY + 13.5);

  currentY += boxHeight + 3;

  // Box 3: Ciudad & Logística
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, currentY, boxWidth, boxHeight, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text('CIUDAD DE DESTINO & ENTREGA', margin + 3, currentY + 4.5);
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  const destinoText = formData.direccionEntrega 
    ? `${formData.ciudad || 'Medellín'}: ${formData.direccionEntrega}`.slice(0, 38)
    : (formData.ciudad || 'Colombia');
  doc.text(destinoText, margin + 3, currentY + 9.5);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(4, 120, 87); // emerald-700
  doc.text(`Despacho: ${technicalCalc.presupuesto.tiempoEntregaDias}`, margin + 3, currentY + 13.5);

  // Box 4: Especificación de Obra
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin + boxWidth + 6, currentY, boxWidth, boxHeight, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text('ÁREA DE OBRA & APLICACIÓN', margin + boxWidth + 9, currentY + 4.5);
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text(`${formData.areaM2} m²`, margin + boxWidth + 9, currentY + 9.5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`${formData.tipoObra} • ${formData.superficie}`, margin + boxWidth + 9, currentY + 13.5);

  currentY += boxHeight + 4;

  // --- 5. CHEMICAL SPECIFICATION BANNER ---
  const bannerHeight = 23;
  const badgeWidth = 44;
  const badgeX = pageWidth - margin - badgeWidth - 2;
  const maxTextWidth = contentWidth - badgeWidth - 8;

  doc.setFillColor(239, 246, 255); // blue-50
  doc.setDrawColor(191, 219, 254); // blue-200
  doc.roundedRect(margin, currentY, contentWidth, bannerHeight, 2.5, 2.5, 'FD');

  // Title / Section Tag
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(30, 58, 138); // blue-900
  doc.text('SISTEMA QUÍMICO HOMOLOGADO POR INGENIERÍA COLORLINK:', margin + 4, currentY + 4.8);

  // Recommended Product Name (constrained to prevent overlap)
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text(technicalCalc.productoRecomendado, margin + 4, currentY + 9.6, { maxWidth: maxTextWidth });

  // Conditioning & Technical Performance on separate clean lines
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(71, 85, 105); // slate-600
  doc.text(
    `Acondicionamiento: ${technicalCalc.selladorImprimanteRequerido}`,
    margin + 4,
    currentY + 14.2,
    { maxWidth: maxTextWidth }
  );
  const coatsInfo = technicalCalc.esManosPersonalizadas
    ? `${technicalCalc.manosSugeridas} manos (Personalizado por cliente)`
    : `${technicalCalc.manosSugeridas} manos (${technicalCalc.manosSugeridas === 1 ? '1 mano suficiente' : 'Norma NTC'})`;
  const colorSpec = formData.dosColoresHabilitado
    ? `Dúo 2 Colores (${100 - (formData.proporcionColorSecundario || 30)}% Base / ${formData.proporcionColorSecundario || 30}% Acento)`
    : `Color: ${formData.colorAcabado || 'Estándar'}`;
  doc.text(
    `Rendimiento: ${technicalCalc.rendimientoTeoricoM2Galon} m²/gal • ${coatsInfo} • ${colorSpec}`,
    margin + 4,
    currentY + 18.4,
    { maxWidth: maxTextWidth }
  );

  // Cuñetes badge on right (fixed position with no overlapping text)
  doc.setFillColor(0, 56, 130);
  doc.roundedRect(badgeX, currentY + 4.5, badgeWidth, 14, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text(
    `${technicalCalc.cuñetesRequeridos} Cuñetes + ${technicalCalc.galonesSueltosRequeridos} Gal`,
    badgeX + badgeWidth / 2,
    currentY + 10.8,
    { align: 'center' }
  );
  doc.setFontSize(6);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(191, 219, 254);
  doc.text('Presentación Óptima', badgeX + badgeWidth / 2, currentY + 15, { align: 'center' });

  currentY += bannerHeight + 4;

  // --- 6. DETAILED ITEMS TABLE WITH REAL COP PRICES ---
  const tableRows = technicalCalc.presupuesto.items.map((item) => [
    item.name + '\n' + item.description,
    item.presentation,
    String(item.quantity),
    formatCOP(item.unitPrice),
    formatCOP(item.totalPrice),
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [['Descripción del Material / Recubrimiento', 'Presentación', 'Cant.', 'Precio Unitario', 'Total Parcial']],
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: [241, 245, 249],
      textColor: [30, 41, 59],
      fontStyle: 'bold',
      fontSize: 8,
      halign: 'left',
    },
    columnStyles: {
      0: { cellWidth: 78, fontSize: 7.5 },
      1: { cellWidth: 26, fontSize: 7.5 },
      2: { cellWidth: 16, halign: 'center', fontStyle: 'bold', fontSize: 8 },
      3: { cellWidth: 30, halign: 'right', fontSize: 7.5 },
      4: { cellWidth: 32, halign: 'right', fontStyle: 'bold', fontSize: 8 },
    },
    styles: {
      lineColor: [226, 232, 240],
      lineWidth: 0.2,
      cellPadding: 2.5,
      textColor: [15, 23, 42],
    },
    margin: { left: margin, right: margin },
  });

  const finalY = (doc as any).lastAutoTable.finalY + 4;
  currentY = finalY;

  // --- 7. FINANCIAL TOTALS & FACTORY WARRANTY SECTION ---
  const halfWidth = (contentWidth - 6) / 2;

  // Left Column: Logistics & Guarantee
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, currentY, halfWidth, 38, 2.5, 2.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text('LOGÍSTICA & SEGURO DE TRANSPORTE:', margin + 3.5, currentY + 5.5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.text(`• Despacho directo a obra en ${formData.ciudad}.`, margin + 3.5, currentY + 10);
  doc.text('• Póliza contra derrames y roturas incluida.', margin + 3.5, currentY + 14);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(180, 83, 9); // amber-700
  doc.text('GARANTÍA TÉCNICA DE FÁBRICA COLORLINK:', margin + 3.5, currentY + 21);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.text('• Certificación de durabilidad, adherencia e impermeabilidad.', margin + 3.5, currentY + 25.5);
  doc.text('• Cumplimiento estricto normas técnicas ICONTEC / NTC.', margin + 3.5, currentY + 29.5);
  doc.text('• Acompañamiento y prueba en obra por asesor técnico.', margin + 3.5, currentY + 33.5);

  // Right Column: Financial Liquidation Card (White with colorful splashes)
  const cardX = margin + halfWidth + 6;
  doc.setFillColor(255, 255, 255); // Crisp White
  doc.setDrawColor(203, 213, 225); // slate-300
  doc.roundedRect(cardX, currentY, halfWidth, 38, 2.5, 2.5, 'FD');

  // Decorative vector paint stains on the white totals card
  doc.setFillColor(255, 209, 0); // Yellow top-right
  doc.circle(cardX + halfWidth - 3, currentY + 3, 4, 'F');
  doc.setFillColor(255, 138, 0); // Orange
  doc.circle(cardX + halfWidth - 8, currentY + 4, 1.8, 'F');

  doc.setFillColor(0, 159, 227); // Cyan top-left
  doc.circle(cardX + 4, currentY + 4, 3, 'F');

  doc.setFillColor(229, 0, 125); // Magenta bottom-right
  doc.circle(cardX + halfWidth - 4, currentY + 35, 3.5, 'F');
  doc.setFillColor(0, 166, 81); // Green bottom-left
  doc.circle(cardX + 4, currentY + 35, 3, 'F');

  const rightX = cardX + 3.5;
  const rightValX = pageWidth - margin - 3.5;
  let summaryY = currentY + 5.5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105); // slate-600
  doc.text('Subtotal Materiales:', rightX, summaryY);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text(formatCOP(technicalCalc.presupuesto.subtotalMateriales), rightValX, summaryY, { align: 'right' });

  if (technicalCalc.presupuesto.descuentoPorcentaje > 0) {
    summaryY += 4.5;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(4, 120, 87); // emerald-700
    doc.text(`Desc. Constructora (-${technicalCalc.presupuesto.descuentoPorcentaje}%):`, rightX, summaryY);
    doc.setFont('helvetica', 'bold');
    doc.text(`-${formatCOP(technicalCalc.presupuesto.descuentoValor)}`, rightValX, summaryY, { align: 'right' });
  }

  summaryY += 4.5;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 64, 175); // blue-800
  doc.text(`Flete Asegurado (${formData.ciudad}):`, rightX, summaryY);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(formatCOP(technicalCalc.presupuesto.fleteEnvio), rightValX, summaryY, { align: 'right' });

  summaryY += 4.5;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('IVA Reglamentario (19%):', rightX, summaryY);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(formatCOP(technicalCalc.presupuesto.ivaValor), rightValX, summaryY, { align: 'right' });

  // Divider line
  summaryY += 3.5;
  doc.setDrawColor(203, 213, 225);
  doc.line(rightX, summaryY, rightValX, summaryY);

  summaryY += 5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('TOTAL GENERAL A PAGAR:', rightX, summaryY);

  doc.setFontSize(11);
  doc.setTextColor(5, 150, 105); // emerald-600
  doc.text(formatCOP(technicalCalc.presupuesto.totalPresupuesto), rightValX, summaryY, { align: 'right' });

  currentY += 41;

  // --- 7.5 CONFORMIDAD DEL CLIENTE: ACEPTACIÓN O RECHAZO DEL TOTAL ---
  const statusBoxHeight = 15;
  const isAccepted = decisionInfo?.decision === 'accepted';
  const isRejected = decisionInfo?.decision === 'rejected';

  if (isAccepted) {
    doc.setFillColor(236, 253, 245); // emerald-50
    doc.setDrawColor(16, 185, 129); // emerald-500
    doc.roundedRect(margin, currentY, contentWidth, statusBoxHeight, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(6, 95, 70); // emerald-800
    doc.text('✓ CONFORMIDAD DEL CLIENTE: TOTAL ACEPTADO Y APROBADO', margin + 4, currentY + 5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(4, 120, 87);
    const authText = `Autorizado por: ${formData.responsable || formData.cliente} • Orden #${decisionInfo?.orderNumber || 'ORD-CLK-2026'} • Registrado: ${decisionInfo?.decisionTimestamp || todayStr}`;
    doc.text(authText, margin + 4, currentY + 9);

    const payText = `Método de pago: ${(decisionInfo?.metodoPago || formData.metodoPago || 'Bancolombia').toUpperCase()} • Monto Total Autorizado: ${formatCOP(technicalCalc.presupuesto.totalPresupuesto)} COP`;
    doc.text(payText, margin + 4, currentY + 12.5);
  } else if (isRejected) {
    doc.setFillColor(254, 242, 242); // rose-50
    doc.setDrawColor(244, 63, 94); // rose-500
    doc.roundedRect(margin, currentY, contentWidth, statusBoxHeight, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(159, 18, 57); // rose-800
    doc.text('✕ CONFORMIDAD DEL CLIENTE: TOTAL RECHAZADO', margin + 4, currentY + 5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(190, 18, 60);
    const rejText = `El cliente no autorizó el valor cotizado de ${formatCOP(technicalCalc.presupuesto.totalPresupuesto)} COP • Fecha: ${decisionInfo?.decisionTimestamp || todayStr}`;
    doc.text(rejText, margin + 4, currentY + 9);

    const reasonText = `Motivo de rechazo: ${decisionInfo?.rejectionReason || 'No especificado'}${decisionInfo?.rejectionNotes ? ` ("${decisionInfo.rejectionNotes}")` : ''}`;
    doc.text(reasonText, margin + 4, currentY + 12.5);
  } else {
    // Pendiente
    doc.setFillColor(254, 249, 195); // amber-50
    doc.setDrawColor(245, 158, 11); // amber-500
    doc.roundedRect(margin, currentY, contentWidth, statusBoxHeight, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(146, 64, 14); // amber-800
    doc.text('⏳ CONFORMIDAD DEL CLIENTE: PENDIENTE DE ACEPTACIÓN DEL TOTAL', margin + 4, currentY + 5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(180, 83, 9);
    doc.text(`Valor total liquidado: ${formatCOP(technicalCalc.presupuesto.totalPresupuesto)} COP. Propuesta comercial sujeta a confirmación por parte del cliente.`, margin + 4, currentY + 9);
    doc.text(`Emitida para: ${formData.responsable || formData.cliente} • Ciudad de Entrega: ${formData.ciudad}`, margin + 4, currentY + 12.5);
  }

  currentY += statusBoxHeight + 3;

  // --- 8. FOOTER: TERMS & CERTIFICATION BADGE ---
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, currentY, pageWidth - margin, currentY);

  currentY += 4;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text('• Documento generado de forma automática mediante el Sistema Digital de Presupuestación Técnica Colorlink.', margin, currentY);
  doc.text('• La aplicación de los productos debe seguir las recomendaciones de la Ficha Técnica oficial del fabricante.', margin, currentY + 3.5);

  const hashVal = Math.random().toString(36).substring(2, 10).toUpperCase();
  doc.setFont('helvetica', 'bold');
  doc.text(`Certificación Digital Colorlink | Hash: CLK-${hashVal} | Colombia`, pageWidth - margin, currentY + 2, { align: 'right' });

  return doc;
}

/**
 * Downloads the official Colorlink PDF directly
 */
export function generateColorlinkPDF(
  formData: ProjectFormData,
  technicalCalc: TechnicalCalculationResult,
  decisionInfo?: PDFDecisionInfo
): void {
  const doc = createColorlinkPDFDoc(formData, technicalCalc, decisionInfo);
  const cleanClientName = (formData.cliente || 'Cliente').replace(/[^a-zA-Z0-9]/g, '_');
  const statusSuffix = decisionInfo?.decision === 'accepted' ? '_ACEPTADA' : decisionInfo?.decision === 'rejected' ? '_RECHAZADA' : '';
  const fileName = `Cotizacion_Colorlink_${cleanClientName}_${formData.ciudad || 'Obra'}${statusSuffix}.pdf`;
  doc.save(fileName);
}

/**
 * Prints the official Colorlink PDF document seamlessly even inside iframes
 */
export function printColorlinkPDF(
  formData: ProjectFormData,
  technicalCalc: TechnicalCalculationResult,
  decisionInfo?: PDFDecisionInfo
): void {
  try {
    const doc = createColorlinkPDFDoc(formData, technicalCalc, decisionInfo);
    doc.autoPrint();

    const pdfBlob = doc.output('blob');
    const blobUrl = URL.createObjectURL(pdfBlob);

    // Create a hidden iframe to trigger the browser's native print dialog
    const iframeId = 'colorlink-print-frame';
    let iframe = document.getElementById(iframeId) as HTMLIFrameElement;
    if (iframe) {
      iframe.remove();
    }

    iframe = document.createElement('iframe');
    iframe.id = iframeId;
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.style.visibility = 'hidden';
    iframe.src = blobUrl;
    document.body.appendChild(iframe);

    iframe.onload = () => {
      setTimeout(() => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        } catch {
          // If browser iframe print is blocked by sandbox, fallback to window.print()
          window.print();
        }
      }, 300);
    };
  } catch {
    // Standard window.print fallback
    window.print();
  }
}
