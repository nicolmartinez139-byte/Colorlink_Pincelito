import { supabase } from '../lib/supabase';
import { ProjectFormData, TechnicalCalculationResult, ToolItemSelection } from '../types/form';
import { OFFICIAL_TOOLS_INVENTORY, PaintingTool } from '../data/toolsInventory';

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

  // 1a. Busca si ya existe exactamente el mismo cliente (mismo NIT y misma Empresa/Razón Social)
  const { data: existingClient, error: findError } = await supabase
    .from('clientes')
    .select('id, nombre_razon_social')
    .eq('nit_documento', nitLimpio)
    .maybeSingle();

  if (findError) throw findError;

  let clienteId: string | undefined;

  // Si existe exactamente con el mismo nombre de empresa, reutilizamos su ID;
  // si el nombre es diferente o es un nuevo registro, se INSERTA SIEMPRE un nuevo registro para conservar cada cliente.
  const nombreCoincide =
    existingClient &&
    formData.cliente &&
    existingClient.nombre_razon_social?.trim().toLowerCase() === formData.cliente.trim().toLowerCase();

  if (existingClient && nombreCoincide) {
    clienteId = existingClient.id;
  } else {
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

  // 4. Evidencia + fotos + datos de entrega
  const logisticaEntrega = [
    formData.direccionEntrega ? `[DIRECCIÓN DE ENTREGA]: ${formData.direccionEntrega}` : '',
    formData.puntoReferencia ? `[PUNTO DE REFERENCIA]: ${formData.puntoReferencia}` : '',
    formData.contactoObra ? `[RECIBE]: ${formData.contactoObra} (${formData.telefonoObra || 'Sin teléfono'})` : '',
    formData.indicacionesEntrega ? `[INDICACIONES]: ${formData.indicacionesEntrega}` : '',
    formData.observaciones ? `[OBS]: ${formData.observaciones}` : ''
  ].filter(Boolean).join(' | ');

  const { data: evidencia, error: evidError } = await supabase
    .from('evidencias')
    .insert({
      proyecto_id: proyectoId,
      descripcion_libre: formData.descripcionLibre || `Proyecto de pintura en ${formData.ciudad} (${formData.areaM2} m²)`,
      observaciones: logisticaEntrega || formData.observaciones || 'Despacho estándar en furgón',
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

  // 6. Descontar stock de herramientas compradas en el inventario de Supabase
  if (formData.herramientasSeleccionadas && formData.herramientasSeleccionadas.length > 0) {
    try {
      await deductToolsStockOnOrder(formData.herramientasSeleccionadas);
    } catch (stockErr) {
      console.warn('[Supabase] Advertencia al actualizar stock de herramientas:', stockErr);
    }
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

// ============================================================================
// 4. Historial de pedidos exclusivo del cliente autenticado (Requirement 6)
// ============================================================================
export interface ClientOrderItem {
  id: string;
  orderNumber: string;
  fecha: string;
  detalle: {
    obra: string;
    tipoObra: string;
    areaM2: number;
    tipoPintura: string;
    color: string;
    ciudad: string;
  };
  estado: 'pendiente' | 'preparando' | 'en_ruta' | 'entregado';
  total: number;
}

export async function fetchClientOrders(userNit?: string, userEmail?: string): Promise<ClientOrderItem[]> {
  const nitLimpio = (userNit || '').replace(/[.\-\s]/g, '');
  const emailLimpio = (userEmail || '').trim().toLowerCase();

  try {
    // 1. Buscar proyectos del cliente en Supabase filtrados exclusivamente por su NIT o Email
    let query = supabase
      .from('proyectos')
      .select(`
        id,
        order_number,
        ciudad,
        tipo_obra,
        area_m2,
        fecha_requerida,
        estado,
        created_at,
        cliente:clientes!inner ( nombre_razon_social, nit_documento, email_responsable ),
        especificaciones_tecnicas ( tipo_pintura, color_acabado ),
        cotizaciones ( total_presupuesto )
      `)
      .order('created_at', { ascending: false });

    if (nitLimpio && emailLimpio) {
      query = query.or(`cliente.nit_documento.eq.${nitLimpio},cliente.email_responsable.ilike.${emailLimpio}`);
    } else if (nitLimpio) {
      query = query.eq('cliente.nit_documento', nitLimpio);
    } else if (emailLimpio) {
      query = query.ilike('cliente.email_responsable', emailLimpio);
    }

    const { data, error } = await query;
    if (error) {
      console.warn('[Supabase] Aviso al consultar pedidos del cliente:', error.message);
      return [];
    }

    const estadoNormalizado = (st?: string): ClientOrderItem['estado'] => {
      const s = (st || '').toLowerCase();
      if (s === 'entregado') return 'entregado';
      if (s === 'en_ruta' || s === 'en camino') return 'en_ruta';
      if (s === 'preparando') return 'preparando';
      return 'pendiente';
    };

    return (data || []).map((row: any) => {
      const especif = row.especificaciones_tecnicas?.[0] || {};
      const cotiz = row.cotizaciones?.[0] || {};
      return {
        id: row.id,
        orderNumber: row.order_number || `ORD-${row.id.toString().slice(-4)}`,
        fecha: new Date(row.created_at).toLocaleDateString('es-CO', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }),
        detalle: {
          obra: row.tipo_obra || 'Fachada / Obra',
          tipoObra: row.tipo_obra || 'Residencial',
          areaM2: row.area_m2 || 0,
          tipoPintura: especif.tipo_pintura || 'Exterior Tipo 1',
          color: especif.color_acabado || 'Gris (Mate)',
          ciudad: row.ciudad || 'Medellín'
        },
        estado: estadoNormalizado(row.estado),
        total: cotiz.total_presupuesto || 0
      };
    });
  } catch (err: any) {
    console.warn('[fetchClientOrders Error]', err?.message || err);
    return [];
  }
}

// ============================================================================
// 7. GESTIÓN DE INVENTARIO DE HERRAMIENTAS Y BROCHAS EN SUPABASE
// ============================================================================

/**
 * Consulta el inventario de herramientas y brochas directamente desde Supabase.
 * Si la tabla no existe aún o está vacía, devuelve el inventario oficial e intenta sincronizar.
 */
export async function fetchToolsInventoryFromSupabase(): Promise<PaintingTool[]> {
  try {
    const { data, error } = await supabase
      .from('inventario_herramientas')
      .select('*')
      .eq('activo', true)
      .order('categoria', { ascending: true });

    if (error) {
      console.warn('[Supabase Inventario] Tabla no disponible o error al consultar:', error.message);
      return OFFICIAL_TOOLS_INVENTORY;
    }

    if (!data || data.length === 0) {
      // Intentar sembrar la tabla automáticamente con el inventario oficial
      console.log('[Supabase Inventario] Tabla vacía, sembrando inventario oficial...');
      seedToolsInventoryToSupabase().catch(e => console.warn('[Seed Error]', e));
      return OFFICIAL_TOOLS_INVENTORY;
    }

    // Mapear los registros de Supabase a PaintingTool
    return data.map((row: any) => ({
      id: row.id,
      nombre: row.nombre,
      categoria: row.categoria,
      categoriaLabel: row.categoria_label || row.categoria,
      descripcion: row.descripcion || '',
      precioCOP: Number(row.precio_cop || 0),
      stock: Number(row.stock ?? 0),
      stockMinimo: Number(row.stock_minimo ?? 10),
      unidad: row.unidad || 'Unidad',
      sku: row.sku,
      badge: row.badge || '',
      recomendadoPara: row.recomendado_para || '',
      icono: row.icono || '🖌️'
    }));
  } catch (err: any) {
    console.warn('[Supabase Inventario Exception]', err?.message || err);
    return OFFICIAL_TOOLS_INVENTORY;
  }
}

/**
 * Descuenta el stock en Supabase de las herramientas y brochas adquiridas en una orden.
 */
export async function deductToolsStockOnOrder(tools: ToolItemSelection[]): Promise<void> {
  if (!tools || tools.length === 0) return;

  for (const item of tools) {
    if (!item.id || item.cantidad <= 0) continue;

    try {
      // 1. Consultar el stock actual
      const { data, error } = await supabase
        .from('inventario_herramientas')
        .select('stock')
        .eq('id', item.id)
        .maybeSingle();

      if (error) {
        console.warn(`[Supabase Stock] No se pudo leer stock para ${item.id}:`, error.message);
        continue;
      }

      if (data && typeof data.stock === 'number') {
        const nuevoStock = Math.max(0, data.stock - item.cantidad);
        const { error: updateErr } = await supabase
          .from('inventario_herramientas')
          .update({
            stock: nuevoStock,
            updated_at: new Date().toISOString()
          })
          .eq('id', item.id);

        if (updateErr) {
          console.warn(`[Supabase Stock] Error al descontar ${item.cantidad} de ${item.id}:`, updateErr.message);
        } else {
          console.log(`[Supabase Stock] ✓ Stock descontado para ${item.id}: ${data.stock} -> ${nuevoStock}`);
        }
      }
    } catch (e: any) {
      console.warn(`[Supabase Stock] Error al actualizar ${item.id}:`, e?.message || e);
    }
  }
}

/**
 * Permite a la bodega o administración actualizar el stock de una brocha o herramienta en Supabase.
 */
export async function updateToolStockInSupabase(toolId: string, newStock: number): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('inventario_herramientas')
      .update({
        stock: Math.max(0, newStock),
        updated_at: new Date().toISOString()
      })
      .eq('id', toolId);

    if (error) {
      console.warn('[Supabase Update Stock]', error.message);
      return false;
    }
    return true;
  } catch (err: any) {
    console.warn('[Supabase Update Stock Exception]', err?.message || err);
    return false;
  }
}

/**
 * Siembra el inventario inicial en la base de datos Supabase si la tabla está vacía.
 */
export async function seedToolsInventoryToSupabase(): Promise<boolean> {
  try {
    const rows = OFFICIAL_TOOLS_INVENTORY.map(t => ({
      id: t.id,
      nombre: t.nombre,
      categoria: t.categoria,
      categoria_label: t.categoriaLabel,
      descripcion: t.descripcion,
      precio_cop: t.precioCOP,
      stock: t.stock,
      stock_minimo: t.stockMinimo,
      unidad: t.unidad,
      sku: t.sku,
      badge: t.badge,
      recomendado_para: t.recomendadoPara,
      icono: t.icono,
      activo: true
    }));

    const { error } = await supabase
      .from('inventario_herramientas')
      .upsert(rows, { onConflict: 'id' });

    if (error) {
      console.warn('[Supabase Seed Tools Error]', error.message);
      return false;
    }
    console.log('[Supabase Seed Tools] ✓ 13 herramientas sembradas con éxito en inventario_herramientas');
    return true;
  } catch (err: any) {
    console.warn('[Supabase Seed Tools Exception]', err?.message || err);
    return false;
  }
}

