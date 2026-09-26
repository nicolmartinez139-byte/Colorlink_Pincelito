import { supabase } from '../lib/supabase';
import { ProjectFormData, TechnicalCalculationResult } from '../types/form';

// ============================================================================
// Tipos de salida (misma forma que el "submittedProjects" que ya usa App.tsx)
// ============================================================================
export interface SubmittedProject {
  id: string;
  submittedAt: string;
  formData: ProjectFormData;
  status: 'Validado' | 'Pendiente' | 'Rechazado';
  totalCOP: number;
  currentPipelineStep: number;
}

function limpiarNit(nit?: string): string {
  return (nit || '').replace(/[.\-\s]/g, '');
}

// ============================================================================
// 1. Enviar una cotización completa (lo que hoy hace handleClientSubmit)
// ============================================================================
export async function submitProjectToSupabase(
  formData: ProjectFormData,
  calc: TechnicalCalculationResult
): Promise<{ proyectoId: string; orderNumber: string }> {
  const nitLimpio = limpiarNit(formData.nitDocumento);

  // 1a. Busca si el cliente ya existe por NIT (evita duplicados)
  const { data: existingClient, error: findError } = await supabase
    .from('clientes')
    .select('id')
    .eq('nit_documento', nitLimpio)
    .maybeSingle();

  if (findError) throw findError;

  let clienteId = existingClient?.id as string | undefined;

  // 1b. Si no existe, lo crea
  if (!clienteId) {
    const { data: newClient, error: clientError } = await supabase
      .from('clientes')
      .insert({
        nombre_razon_social: formData.cliente || 'Cliente Solicitante',
        nit_documento: nitLimpio || `NIT-${Date.now().toString().slice(-6)}`,
        responsable: formData.responsable || 'Responsable',
        email_responsable: formData.emailResponsable || `${nitLimpio || 'cliente'}@colorlink.co`,
        telefono_responsable: formData.telefonoResponsable || null,
        canal_entrada: formData.canalEntrada || 'Portal Clientes'
      })
      .select('id')
      .single();

    if (clientError) throw clientError;
    clienteId = newClient.id;
  }

  // 2. Crea el proyecto
  const orderNumber = `PROJ-${Date.now().toString().slice(-6)}`;

  const { data: proyecto, error: proyectoError } = await supabase
    .from('proyectos')
    .insert({
      cliente_id: clienteId,
      order_number: orderNumber,
      ciudad: formData.ciudad,
      tipo_obra: formData.tipoObra,
      area_m2: formData.areaM2,
      fecha_requerida: formData.fechaRequerida ? formData.fechaRequerida : null,
      estado: 'validado',
      pipeline_step: 8
    })
    .select('id')
    .single();

  if (proyectoError) throw proyectoError;
  const proyectoId = proyecto.id as string;

  // 3. Especificación técnica
  const { error: especError } = await supabase.from('especificaciones_tecnicas').insert({
    proyecto_id: proyectoId,
    superficie: formData.superficie,
    ambiente: formData.ambiente,
    condicion: formData.condicion,
    color_acabado: formData.colorAcabado,
    tipo_pintura: formData.tipoPintura ?? calc.tipoPintura
  });
  if (especError) throw especError;

  // 4. Evidencia + fotos
  const { data: evidencia, error: evidError } = await supabase
    .from('evidencias')
    .insert({
      proyecto_id: proyectoId,
      descripcion_libre: formData.descripcionLibre,
      observaciones: formData.observaciones,
      consentimiento: formData.consentimiento
    })
    .select('id')
    .single();
  if (evidError) throw evidError;

  if (formData.fotos.length > 0) {
    const fotosRows = formData.fotos.map((f) => ({
      evidencia_id: evidencia.id,
      nombre_archivo: f.name,
      tamano: f.size
    }));
    const { error: fotosError } = await supabase.from('evidencia_fotos').insert(fotosRows);
    if (fotosError) throw fotosError;
  }

  // 5. Cotización + items del presupuesto
  const p = calc.presupuesto;
  const { data: cotizacion, error: cotError } = await supabase
    .from('cotizaciones')
    .insert({
      proyecto_id: proyectoId,
      producto_recomendado: calc.productoRecomendado,
      tipo_solucion: calc.tipoSolucion,
      tipo_pintura: calc.tipoPintura,
      sellador_imprimante_requerido: calc.selladorImprimanteRequerido,
      manos_sugeridas: calc.manosSugeridas,
      explicacion_manos: calc.explicacionManos,
      factor_desperdicio_porcentaje: calc.factorDesperdicioPorcentaje,
      galones_netos_sin_desperdicio: calc.galonesNetosSinDesperdicio,
      galones_desperdicio: calc.galonesDesperdicio,
      rendimiento_teorico_m2_galon: calc.rendimientoTeoricoM2Galon,
      galones_requeridos: calc.galonesRequeridos,
      cunetes_requeridos: calc.cuñetesRequeridos,
      galones_sueltos_requeridos: calc.galonesSueltosRequeridos,
      tiempo_estimado_secado: calc.tiempoEstimadoSecado,
      requiere_visita_especialista: calc.requiereVisitaEspecialista,
      alerta_patologia: calc.alertaPatologia,
      subtotal_materiales: p.subtotalMateriales,
      descuento_porcentaje: p.descuentoPorcentaje,
      descuento_valor: p.descuentoValor,
      subtotal_con_descuento: p.subtotalConDescuento,
      flete_envio: p.fleteEnvio,
      iva_porcentaje: p.ivaPorcentaje,
      iva_valor: p.ivaValor,
      total_presupuesto: p.totalPresupuesto,
      ciudad_destino: p.ciudadDestino,
      tiempo_entrega_dias: p.tiempoEntregaDias
    })
    .select('id')
    .single();
  if (cotError) throw cotError;

  if (p.items.length > 0) {
    const itemsRows = p.items.map((it) => ({
      cotizacion_id: cotizacion.id,
      nombre: it.name,
      presentacion: it.presentation,
      cantidad: it.quantity,
      precio_unitario: it.unitPrice,
      precio_total: it.totalPrice,
      descripcion: it.description
    }));
    const { error: itemsError } = await supabase.from('cotizacion_items').insert(itemsRows);
    if (itemsError) throw itemsError;
  }

  return { proyectoId, orderNumber };
}

// ============================================================================
// 2. Leer todos los proyectos para el panel Admin (reemplaza el array mock)
// Requiere estar autenticado como admin (RLS lo exige vía is_admin()).
// ============================================================================
export async function fetchSubmittedProjects(): Promise<SubmittedProject[]> {
  const { data, error } = await supabase
    .from('proyectos')
    .select(
      `
      id,
      order_number,
      ciudad,
      tipo_obra,
      area_m2,
      fecha_requerida,
      estado,
      pipeline_step,
      created_at,
      cliente:clientes ( nombre_razon_social, nit_documento, responsable, email_responsable, telefono_responsable, canal_entrada ),
      especificaciones_tecnicas ( superficie, ambiente, condicion, color_acabado, tipo_pintura ),
      evidencias ( descripcion_libre, observaciones, consentimiento, evidencia_fotos ( nombre_archivo, tamano ) ),
      cotizaciones ( total_presupuesto )
    `
    )
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row: any) => {
    const especif = row.especificaciones_tecnicas?.[0];
    const evidencia = row.evidencias?.[0];
    const cotizacion = row.cotizaciones?.[0];
    const cliente = Array.isArray(row.cliente) ? row.cliente[0] : row.cliente;

    const formData: ProjectFormData = {
      cliente: cliente?.nombre_razon_social ?? '',
      nitDocumento: cliente?.nit_documento ?? '',
      responsable: cliente?.responsable ?? '',
      emailResponsable: cliente?.email_responsable ?? '',
      telefonoResponsable: cliente?.telefono_responsable ?? '',
      canalEntrada: cliente?.canal_entrada ?? 'Portal Clientes',
      ciudad: row.ciudad,
      tipoObra: row.tipo_obra,
      areaM2: row.area_m2,
      fechaRequerida: row.fecha_requerida,
      superficie: especif?.superficie ?? 'Concreto / Revoque',
      ambiente: especif?.ambiente ?? 'Exterior Intemperie',
      condicion: especif?.condicion ?? 'Nueva sin pintar',
      colorAcabado: especif?.color_acabado ?? '',
      tipoPintura: especif?.tipo_pintura,
      descripcionLibre: evidencia?.descripcion_libre ?? '',
      fotos: (evidencia?.evidencia_fotos ?? []).map((f: any) => ({ name: f.nombre_archivo, size: String(f.tamano ?? '1 MB') })),
      observaciones: evidencia?.observaciones ?? '',
      consentimiento: evidencia?.consentimiento ?? false
    };

    const statusMap: Record<string, SubmittedProject['status']> = {
      validado: 'Validado',
      rechazado: 'Rechazado',
      pendiente: 'Pendiente'
    };

    return {
      id: row.order_number ?? row.id,
      submittedAt: new Date(row.created_at).toLocaleString('es-CO'),
      formData,
      status: statusMap[row.estado] ?? 'Pendiente',
      totalCOP: cotizacion?.total_presupuesto ?? 0,
      currentPipelineStep: row.pipeline_step
    };
  });
}

// ============================================================================
// 3. Login / logout de administrador con Supabase Auth
// (reemplaza el usuario/contraseña hardcodeados en App.tsx)
// ============================================================================
export async function adminSignIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error('Credenciales incorrectas. Verifica tu correo y contraseña.');

  const { data: adminRow, error: adminError } = await supabase
    .from('admin_usuarios')
    .select('auth_user_id')
    .eq('auth_user_id', data.user.id)
    .maybeSingle();

  if (adminError) throw adminError;

  if (!adminRow) {
    await supabase.auth.signOut();
    throw new Error('Este usuario existe pero no tiene permisos de administrador.');
  }

  return data.user;
}

export async function adminSignOut() {
  await supabase.auth.signOut();
}

export async function getCurrentAdminSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}
