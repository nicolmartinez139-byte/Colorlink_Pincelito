// Servicio unificado para registrar y sincronizar conversaciones con los Asesores Técnicos de Colorlink
export interface AdvisorLeadData {
  id?: string;
  cliente: string;
  nit?: string;
  responsable: string;
  telefono: string;
  email: string;
  ciudad: string;
  obra: string;
  consulta: string;
  acuerdoAlcanzado?: string;
  canal?: 'correo' | 'llamada' | 'reunion' | 'visita_obra';
  estado?: 'cotizado' | 'en_negociacion' | 'visita_agendada' | 'cerrado_exito' | 'seguimiento';
  montoCOP?: number;
  requerimientoPintura?: string;
  assignedAdvisorId?: string;
}

const STORAGE_KEY = 'colorlink_advisor_conversations_v1';

export function getStoredAdvisorConversations(): Record<string, any[]> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('[ADVISOR SERVICE] Error leyendo de localStorage:', err);
  }
  return {};
}

export function saveAdvisorLead(lead: AdvisorLeadData): { success: boolean; leadId: string; advisorName: string } {
  const currentStore = getStoredAdvisorConversations();
  
  // Asignar asesor según ciudad
  let assignedAdvisorId = lead.assignedAdvisorId || 'sofia_martinez';
  let advisorName = 'Arq. Sofía Martínez';

  const cityLower = (lead.ciudad || '').toLowerCase();
  if (cityLower.includes('bogot') || cityLower.includes('cundinamarca') || cityLower.includes('chia')) {
    assignedAdvisorId = 'camila_morales';
    advisorName = 'Camila Morales';
  } else if (cityLower.includes('cali') || cityLower.includes('barranquilla') || cityLower.includes('costa') || cityLower.includes('valle')) {
    assignedAdvisorId = 'juan_pablo_arango';
    advisorName = 'Ing. Juan Pablo Arango';
  }

  const leadId = lead.id || `LEAD-${Date.now().toString().slice(-6)}`;
  const now = new Date();
  const timeFormatted = `Hoy, ${now.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}`;

  const newEntry = {
    id: leadId,
    cliente: lead.cliente || lead.responsable || 'Cliente Particular',
    nit: lead.nit || 'NIT No Especificado',
    responsable: lead.responsable || lead.cliente || 'Responsable',
    telefono: lead.telefono || '+57 321 246 0658',
    email: lead.email || 'contacto@cliente.com',
    ciudad: lead.ciudad || 'Medellín',
    obra: lead.obra || 'Obra / Proyecto Residencial',
    fechaHora: timeFormatted,
    canal: lead.canal || 'correo',
    temaConversacion: lead.consulta || 'Consulta de asesoría técnica para cotización y despacho de pinturas.',
    acuerdoAlcanzado: lead.acuerdoAlcanzado || 'Contacto iniciado en vivo. Asesor técnico asignado para seguimiento inmediato y validación de flete.',
    estado: lead.estado || 'en_negociacion',
    montoCOP: lead.montoCOP || 1850000,
    requerimientoPintura: lead.requerimientoPintura || 'Pintura Tipo 1 Exterior NTC 1335'
  };

  const advisorList = currentStore[assignedAdvisorId] || [];
  // Insertar al inicio para que aparezca primero
  currentStore[assignedAdvisorId] = [newEntry, ...advisorList];

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentStore));
    window.dispatchEvent(new CustomEvent('colorlink_advisor_lead_added', { detail: newEntry }));
  } catch (err) {
    console.warn('[ADVISOR SERVICE] Error guardando lead en localStorage:', err);
  }

  return {
    success: true,
    leadId,
    advisorName
  };
}
