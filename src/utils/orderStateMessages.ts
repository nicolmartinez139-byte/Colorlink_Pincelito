// =========================================================================
// GENERADOR DINÁMICO DE MENSAJES Y NOTIFICACIONES SEGÚN EL ESTADO DEL PEDIDO
// Cada estado cuenta con un mensaje único, detallado y contextualizado.
// =========================================================================

export interface LogisticsInfo {
  vehiculo: string;
  placa: string;
  conductor: string;
  telefono: string;
  corredorRuta: string;
  tiempoEstimado: string;
}

export const CITY_LOGISTICS_FLEET: Record<string, LogisticsInfo> = {
  Medellín: {
    vehiculo: 'Camión Turbo NHR 4.5 Ton Colorlink',
    placa: 'TZW-402',
    conductor: 'Carlos Restrepo',
    telefono: '310 482 9011',
    corredorRuta: 'Autopista Sur - Corredor Vía Regional',
    tiempoEstimado: '35 a 45 minutos'
  },
  Bogotá: {
    vehiculo: 'Camión NPR 5.0 Ton Colorlink',
    placa: 'WKL-815',
    conductor: 'Hernán Darío Gómez',
    telefono: '315 772 4320',
    corredorRuta: 'Corredor Calle 80 - Av. Boyacá',
    tiempoEstimado: '50 a 60 minutos'
  },
  Cali: {
    vehiculo: 'Camión Turbo NPR 4.0 Ton Colorlink',
    placa: 'VCM-631',
    conductor: 'Mauricio Arango',
    telefono: '312 654 9812',
    corredorRuta: 'Autopista Oriental - Vía Cañasgordas',
    tiempoEstimado: '40 a 50 minutos'
  },
  Barranquilla: {
    vehiculo: 'Furgón Hino Dutro 3.5 Ton Colorlink',
    placa: 'QWE-194',
    conductor: 'Jairo Beleño',
    telefono: '301 923 4411',
    corredorRuta: 'Vía 40 - Anillo Vial Circunvalar',
    tiempoEstimado: '30 a 40 minutos'
  },
  Cartagena: {
    vehiculo: 'Furgón Isuzu Forward 4.0 Ton Colorlink',
    placa: 'THK-509',
    conductor: 'Wilson Mendoza',
    telefono: '314 811 2299',
    corredorRuta: 'Corredor Industrial Mamonal - Bosque',
    tiempoEstimado: '40 a 50 minutos'
  },
  Bucaramanga: {
    vehiculo: 'Camión Chevrolet FTR 4.5 Ton Colorlink',
    placa: 'XVZ-720',
    conductor: 'Néstor Prada',
    telefono: '318 340 1928',
    corredorRuta: 'Autopista Floridablanca - Piedecuesta',
    tiempoEstimado: '35 a 45 minutos'
  }
};

export function getLogisticsForCity(ciudad?: string): LogisticsInfo {
  if (!ciudad) return CITY_LOGISTICS_FLEET['Medellín'];
  const key = Object.keys(CITY_LOGISTICS_FLEET).find((c) =>
    ciudad.toLowerCase().includes(c.toLowerCase())
  );
  return key ? CITY_LOGISTICS_FLEET[key] : {
    vehiculo: 'Camión Turbo Reparto Colorlink',
    placa: 'KLF-228',
    conductor: 'Andrea Montoya',
    telefono: '311 550 8844',
    corredorRuta: 'Corredor vial metropolitano',
    tiempoEstimado: '45 minutos'
  };
}

export interface StateMessageResult {
  status: string;
  statusLabel: string;
  tituloNotificacion: string;
  mensajeNotificacion: string;
  mensajeEmail: string;
  mensajeServidor: string;
  logistica: LogisticsInfo;
  lote: string;
  remision: string;
  badgeColor: string;
}

export function buildOrderStateMessage(params: {
  status: string;
  orderId: string;
  cliente: string;
  responsable?: string;
  color?: string;
  tipoPintura?: string;
  ciudad?: string;
  totalCOP?: number;
  vehiculo?: string;
  conductor?: string;
  placa?: string;
  cuñetes?: number;
}): StateMessageResult {
  const {
    status,
    orderId,
    cliente,
    responsable = cliente,
    color = 'Blanco Puro / Específico',
    tipoPintura = 'Pintura Acrílica Tipo 1',
    ciudad = 'Medellín',
    totalCOP = 0,
    cuñetes = 5
  } = params;

  const defaultLogistics = getLogisticsForCity(ciudad);
  const logistica: LogisticsInfo = {
    vehiculo: params.vehiculo || defaultLogistics.vehiculo,
    placa: params.placa || defaultLogistics.placa,
    conductor: params.conductor || defaultLogistics.conductor,
    telefono: defaultLogistics.telefono,
    corredorRuta: defaultLogistics.corredorRuta,
    tiempoEstimado: defaultLogistics.tiempoEstimado
  };

  const cleanId = String(orderId || '2026').replace(/\D/g, '').slice(-4) || '2026';
  const lote = `LOTE-${cleanId}-NTC`;
  const remision = `REM-CLK-${cleanId}`;

  switch (status) {
    case 'pendiente':
      return {
        status: 'pendiente',
        statusLabel: 'Aceptado por Cliente • Pendiente Aprobación IA',
        tituloNotificacion: '📋 Pedido Aceptado por Cliente • En Auditoría IA',
        mensajeNotificacion: `📋 [Aceptado por Cliente] Orden #${orderId} de "${cliente}" aceptada formalmente. En proceso de auditoría inteligente por la IA de Colorlink® (Pincelito Inspector) para validar stock en CEDI ${ciudad}, formulación bajo norma NTC 1335 y asignación logística antes del paso a Tintometría.`,
        mensajeEmail: `Estimado(a) ${responsable},\n\nLe confirmamos que su pedido #${orderId} para el proyecto "${cliente}" en ${ciudad} ha sido formalmente aceptado.\n\n• Producto: ${tipoPintura}\n• Color Seleccionado: ${color}\n• Estado Actual: Aceptado por el Cliente • En proceso de Auditoría y Validación por Inteligencia Artificial.\n\nUna vez la IA certifique la disponibilidad en CEDI y compatibilidad técnica, su orden pasará de inmediato al laboratorio de Tintometría.\n\nTotal liquidado: ${new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(totalCOP)}.`,
        mensajeServidor: `Pedido #${orderId} de "${cliente}" aceptado por el cliente. En proceso de validación y aprobación por la IA.`,
        logistica,
        lote,
        remision,
        badgeColor: 'bg-amber-100 text-amber-900 border-amber-300'
      };

    case 'preparando':
      return {
        status: 'preparando',
        statusLabel: 'Aprobado por IA • En Tintometría',
        tituloNotificacion: '🎨 Aprobado por la IA • En Laboratorio de Tintometría',
        mensajeNotificacion: `🎨 [Aprobado por IA & En Tintometría] ¡Tu pedido #${orderId} fue auditado y aprobado al 100% por la IA e ingresó al laboratorio de tintometría computarizada Colorlink® en ${ciudad}! Se inició la dosificación micrométrica de pigmentos para el color "${color}" con base ${tipoPintura} bajo Norma NTC 1335 (${lote}). Próximo paso: Despacho hacia tu obra.`,
        mensajeEmail: `Estimado(a) ${responsable},\n\n¡Excelentes noticias! Su pedido #${orderId} ha sido auditado y aprobado formalmente por la Inteligencia Artificial de Colorlink® y ya ingresó a preparación en nuestro laboratorio de tintometría.\n\n• Dictamen IA: APROBADO (Insumos y stock 100% verificados)\n• Formulación computarizada para: "${color}"\n• Base química: ${tipoPintura} (Norma Técnica Colombiana NTC 1335)\n• Control de calidad: Lote ${lote}\n• Cantidad: ${cuñetes} cuñete(s)\n\nSu pedido será formulado y mezclado para posterior despacho en flota Colorlink hacia su obra en ${ciudad}.`,
        mensajeServidor: `Pedido #${orderId} auditado y aprobado por la IA. En laboratorio de tintometría para dosificación de "${color}".`,
        logistica,
        lote,
        remision,
        badgeColor: 'bg-sky-100 text-sky-900 border-sky-300'
      };

    case 'en_ruta':
      return {
        status: 'en_ruta',
        statusLabel: 'Despachando • En Ruta a Obra',
        tituloNotificacion: '🚚 Despachando Pedido • En Ruta hacia tu Obra',
        mensajeNotificacion: `🚚 [Despacho en Ruta] ¡Tu pedido #${orderId} completó tintometría y SE ESTÁ DESPACHANDO hacia tu obra en ${ciudad}! Asignado al ${logistica.vehiculo} (Placa: ${logistica.placa}), conducido por ${logistica.conductor} (Móvil: ${logistica.telefono}). Ruta: ${logistica.corredorRuta}. Llegada estimada: ${logistica.tiempoEstimado}. Remisión física oficial #${remision}.`,
        mensajeEmail: `Estimado(a) ${responsable},\n\n¡Excelentes noticias! Su pedido #${orderId} ha terminado satisfactoriamente su dosificación en tintometría y SE ESTÁ DESPACHANDO hacia su obra en ${ciudad}.\n\n🚚 DETALLES DE DESPACHO:\n• Vehículo de Flota: ${logistica.vehiculo}\n• Placa Oficial: ${logistica.placa}\n• Conductor Responsable: ${logistica.conductor} (Tel: ${logistica.telefono})\n• Corredor Vial: ${logistica.corredorRuta}\n• Tiempo Estimado de Llegada: ${logistica.tiempoEstimado}\n• Número de Remisión Física: #${remision}\n\nEl conductor lleva la remisión impresa y el certificado de lote ${lote}.`,
        mensajeServidor: `Pedido #${orderId} despachado hacia ${ciudad} en ${logistica.vehiculo} (${logistica.placa}) con conductor ${logistica.conductor}.`,
        logistica,
        lote,
        remision,
        badgeColor: 'bg-purple-100 text-purple-900 border-purple-300'
      };

    case 'entregado':
      return {
        status: 'entregado',
        statusLabel: 'Entregado con Éxito en Obra',
        tituloNotificacion: '✅ Pedido Entregado con Éxito en tu Obra',
        mensajeNotificacion: `✅ [Entrega Finalizada] ¡Tu pedido #${orderId} fue ENTREGADO con éxito en tu obra en ${ciudad} por el conductor ${logistica.conductor}! Se firmó la remisión física oficial #${remision} a entera satisfacción y se radicó el Certificado Técnico de Calidad NTC 1335 (${lote}). ¡Garantía de durabilidad y cobertura activada!`,
        mensajeEmail: `Estimado(a) ${responsable},\n\nLe confirmamos que su pedido #${orderId} ha sido ENTREGADO con total éxito y satisfacción en su obra en ${ciudad} por nuestro conductor ${logistica.conductor}.\n\n📄 SOPORTES ENTREGADOS EN OBRA:\n• Remisión Oficial Firmada: #${remision}\n• Certificado de Calidad Técnica: Norma Icontec NTC 1335 (${lote})\n• Color Verificado: "${color}"\n• Tipo de Pintura: ${tipoPintura}\n\nAgradecemos su preferencia por COLORLINK® Pinturas Colombia. Su garantía oficial de fábrica queda 100% activa.`,
        mensajeServidor: `Pedido #${orderId} entregado con éxito en ${ciudad}. Remisión #${remision} y certificado NTC 1335 archivados.`,
        logistica,
        lote,
        remision,
        badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300'
      };

    case 'en_espera':
      return {
        status: 'en_espera',
        statusLabel: 'En Espera de Stock • Sede CEDI Central',
        tituloNotificacion: '📦 Surtido Complementario en Tránsito',
        mensajeNotificacion: `📦 [En Espera de Abastecimiento] Pedido #${orderId}: Se programó transferencia de insumos desde la Planta Central Medellín hacia la sede ${ciudad} para completar ${cuñetes} cuñetes de ${tipoPintura}. Su pedido tiene máxima prioridad en la siguiente rotación de flota.`,
        mensajeEmail: `Estimado(a) ${responsable},\n\nLe informamos que su pedido #${orderId} está en programación de abastecimiento directo desde nuestra Fábrica Principal de Medellín hacia la sede ${ciudad}.\n\nUn asesor logístico se comunicará para coordinar la ventana exacta de entrega sin demoras.`,
        mensajeServidor: `Pedido #${orderId} en espera de abastecimiento para ${ciudad} desde planta principal.`,
        logistica,
        lote,
        remision,
        badgeColor: 'bg-orange-100 text-orange-950 border-orange-300'
      };

    case 'rechazado':
      return {
        status: 'rechazado',
        statusLabel: 'Rechazado por Auditoría Técnica',
        tituloNotificacion: '⚠️ Solicitud No Aprobada por Parámetros Técnicos',
        mensajeNotificacion: `⚠️ [Auditoría Técnica] Pedido #${orderId}: No es posible proceder con la formulación de ${tipoPintura} para las condiciones de superficie y clima informadas en ${ciudad} según los estándares de la norma NTC 1335. Se requiere asesoría técnica presencial.`,
        mensajeEmail: `Estimado(a) ${responsable},\n\nLe informamos que su pedido #${orderId} ha sido revisado por nuestro departamento técnico y requiere ajustes de compatibilidad química antes de formular.\n\nPor favor comuníquese con su asesor técnico asignado.`,
        mensajeServidor: `Pedido #${orderId} rechazado técnicamente para ${ciudad}.`,
        logistica,
        lote,
        remision,
        badgeColor: 'bg-rose-100 text-rose-900 border-rose-300'
      };

    default:
      return {
        status,
        statusLabel: `Estado: ${status}`,
        tituloNotificacion: `Actualización de Pedido #${orderId}`,
        mensajeNotificacion: `El pedido #${orderId} para ${cliente} se encuentra en estado "${status}".`,
        mensajeEmail: `Actualización de pedido #${orderId}: ${status}`,
        mensajeServidor: `Pedido #${orderId} en estado ${status}.`,
        logistica,
        lote,
        remision,
        badgeColor: 'bg-slate-100 text-slate-800 border-slate-300'
      };
  }
}
