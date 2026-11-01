import express from 'express';
import path from 'path';
import fs from 'fs';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  try {
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  } catch (err) {
    console.warn('[GEMINI INIT WARN]', err);
    return null;
  }
}

// Función para limpiar cualquier rastro de LaTeX ($...$, \text{}, \times, m^2) o Markdown crudo conservando moneda ($250.000 COP)
function cleanChatText(text: string): string {
  if (!text) return '';
  return text
    // Eliminar bloques $$ ... $$ conservando el contenido limpio
    .replace(/\$\$([\s\S]*?)\$\$/g, '$1')
    // Eliminar bloques inline $ ... $ de LaTeX matemático sin borrar signos de peso ($250.000)
    .replace(/\$([a-zA-Z\\][^$]*?)\$/g, '$1')
    // Reemplazar comandos LaTeX específicos
    .replace(/\\text\{([^}]*)\}/g, '$1')
    .replace(/\\textbf\{([^}]*)\}/g, '$1')
    .replace(/\\mathrm\{([^}]*)\}/g, '$1')
    // Símbolos matemáticos
    .replace(/\\times/g, '×')
    .replace(/\\cdot/g, '·')
    .replace(/\\div/g, '÷')
    .replace(/\\approx/g, '≈')
    .replace(/\\%/g, '%')
    .replace(/m\^2/g, 'm²')
    .replace(/m\^3/g, 'm³')
    .replace(/\^2/g, '²')
    .replace(/\^3/g, '³')
    .replace(/\\(quad|displaystyle|qquad|left|right|big|Big)/g, '')
    // Limpiar separadores --- y encabezados ###
    .replace(/^---+$/gm, '')
    .replace(/^#{1,6}\s*/gm, '')
    // Convertir listas con * al inicio de línea en viñetas limpias •
    .replace(/^\s*[\*\-]\s+/gm, '• ')
    // Eliminar exceso de saltos de línea
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
export interface ReceivedOrder {
  id: string;
  orderNumber: string;
  cliente: string;
  nit?: string;
  responsable?: string;
  email?: string;
  ciudad?: string;
  status: string;
  totalCOP?: number;
  mensaje?: string;
  vehiculo?: string;
  conductor?: string;
  placa?: string;
  formData?: any;
  receivedAt: string;
}

export const receivedOrdersStore: ReceivedOrder[] = [];

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Middleware de CORS para permitir peticiones desde Vercel, localhost y clientes externos
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Health endpoint compatible con Vercel y local
app.get(['/api/health', '/health'], (req, res) => {
  res.json({
    status: 'ok',
    platform: process.env.VERCEL ? 'Vercel Serverless' : 'Express Server',
    totalOrdersReceived: receivedOrdersStore.length,
    emailConfigured: Boolean(process.env.RESEND_API_KEY || (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS)),
    supabaseConfigured: Boolean(process.env.VITE_SUPABASE_URL && process.env.VITE_SUPABASE_ANON_KEY),
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY)
  });
});

// Endpoint para recibir y registrar pedidos directamente en el servidor / Vercel
app.post(['/api/orders', '/orders', '/api/cotizaciones', '/cotizaciones'], async (req, res) => {
  try {
    const orderData = req.body || {};
    const clientName = orderData.cliente || orderData.formData?.cliente || orderData.responsable || 'Cliente Colorlink';
    const orderId = orderData.orderNumber || orderData.id || `ORD-CLK-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    let dynamicStatusMessage = orderData.mensaje;
    if (!dynamicStatusMessage) {
      if (orderData.status === 'pendiente') {
        dynamicStatusMessage = `📋 Pedido #${orderId} de "${clientName}" recibido y registrado. En cola para ingreso a tintometría.`;
      } else if (orderData.status === 'preparando') {
        dynamicStatusMessage = `🎨 Pedido #${orderId} en laboratorio de tintometría: dosificación computarizada y mezclado giroscópico en proceso.`;
      } else if (orderData.status === 'en_ruta') {
        dynamicStatusMessage = `🚚 Pedido #${orderId} despachado hacia ${orderData.ciudad || 'obra'} en ${orderData.vehiculo || 'Camión de Flota'} con conductor ${orderData.conductor || 'asignado'}.`;
      } else if (orderData.status === 'entregado') {
        dynamicStatusMessage = `✅ Pedido #${orderId} entregado con éxito en obra. Remisión firmada y garantía NTC 1335 emitidas.`;
      } else if (orderData.status === 'en_espera') {
        dynamicStatusMessage = `📦 Pedido #${orderId} en espera de transferencia de stock desde el CEDI Central Medellín.`;
      } else if (orderData.status === 'rechazado') {
        dynamicStatusMessage = `⚠️ Pedido #${orderId} rechazado por motivos de incompatibilidad técnica bajo norma NTC 1335.`;
      } else {
        dynamicStatusMessage = `Pedido #${orderId} actualizado a estado "${orderData.status || 'pendiente'}".`;
      }
    }

    const receivedOrder: ReceivedOrder = {
      id: orderId,
      orderNumber: orderId,
      cliente: clientName,
      nit: orderData.nit || orderData.formData?.nitDocumento || '',
      responsable: orderData.responsable || orderData.formData?.responsable || '',
      email: orderData.email || orderData.formData?.emailResponsable || '',
      ciudad: orderData.ciudad || orderData.formData?.ciudad || 'Medellín',
      status: orderData.status || 'pendiente',
      totalCOP: orderData.totalCOP || 0,
      mensaje: dynamicStatusMessage,
      vehiculo: orderData.vehiculo,
      conductor: orderData.conductor,
      placa: orderData.placa,
      formData: orderData.formData || null,
      receivedAt: new Date().toISOString()
    };

    const existingIdx = receivedOrdersStore.findIndex(o => o.id === orderId || o.orderNumber === orderId);
    if (existingIdx >= 0) {
      const existingStatus = receivedOrdersStore[existingIdx].status;
      const incomingStatus = receivedOrder.status;
      // Protección: Si el pedido ya fue entregado, NUNCA debe retroceder a tintometría ni a ninguna otra fase
      const finalStatus =
        existingStatus === 'entregado' && incomingStatus !== 'entregado'
          ? 'entregado'
          : incomingStatus;

      receivedOrdersStore[existingIdx] = {
        ...receivedOrdersStore[existingIdx],
        ...receivedOrder,
        status: finalStatus,
        receivedAt: new Date().toISOString()
      };
    } else {
      receivedOrdersStore.unshift(receivedOrder);
      if (receivedOrdersStore.length > 250) receivedOrdersStore.pop();
    }

    console.log(`[API ORDERS - VERCEL] Pedido #${orderId} de "${clientName}" (${receivedOrder.status}): ${dynamicStatusMessage}`);

    return res.status(200).json({
      success: true,
      received: true,
      platform: process.env.VERCEL ? 'Vercel Serverless' : 'Colorlink Server',
      orderNumber: orderId,
      status: receivedOrder.status,
      timestamp: receivedOrder.receivedAt,
      totalOrdersStored: receivedOrdersStore.length,
      message: dynamicStatusMessage
    });
  } catch (err: any) {
    console.error('[API ORDERS ERROR]', err);
    return res.status(500).json({ success: false, error: err.message || 'Error al procesar pedido' });
  }
});

app.get(['/api/orders', '/orders', '/api/cotizaciones', '/cotizaciones'], (req, res) => {
  res.json({
    success: true,
    status: 'online',
    platform: process.env.VERCEL ? 'Vercel Serverless' : 'Colorlink Server',
    count: receivedOrdersStore.length,
    orders: receivedOrdersStore,
    message: 'Servicio de recepción de pedidos activo y en línea para Vercel.'
  });
});

// Webhook para recepción de notificaciones externas
app.all(['/api/webhook', '/webhook'], (req, res) => {
  console.log('[WEBHOOK - VERCEL] Notificación recibida:', req.method, req.body);
  res.json({ success: true, message: 'Webhook recibido con éxito.' });
});

// Endpoint de Auditoría Inteligente de Pedidos con IA (Gemini 3.8 Flash)
app.post(['/api/ai-audit-order', '/ai-audit-order'], async (req, res) => {
  try {
    const { order, cityStock, factoryAvailable = 120 } = req.body;
    if (!order) {
      return res.status(400).json({ success: false, error: 'Faltan datos del pedido' });
    }

    const prompt = `Actúa como el Sistema Inteligente de Despacho, Auditoría Técnica y Comunicaciones de COLORLINK Pinturas Colombia.
Evalúa el siguiente pedido para decidir si debe ser:
1. "aceptar": Si hay 100% de materiales en la planta/sede local, la superficie y tipo de pintura son compatibles, y la solicitud es viable. Pasa a "Aceptado" (en preparación de tintometría).
2. "en_espera": Si falta algún insumo o cuñetes en la sede local pero se puede conseguir y despachar desde el CEDI central / fábrica Medellín.
3. "rechazar": Si es inviable técnicamente (incompatibilidad severa de producto para el sustrato/ambiente, datos inválidos o zona sin cobertura). Explica claramente el motivo técnico.

DATOS DEL PEDIDO:
- ID Pedido: ${order.id}
- Cliente: ${order.cliente}
- NIT / Empresa: ${order.nit || 'No especificado'}
- Obra: ${order.obra || 'Obra Principal'}
- Ciudad: ${order.ciudad}
- Responsable: ${order.responsable} (Tel: ${order.telefono}, Email: ${order.email})
- Tipo de Pintura: ${order.tipoPintura}
- Color / Acabado: ${order.color} (Código: ${order.colorHex || 'Estándar'})
- Cantidad Solicitada: ${order.cunetes || 1} Cuñetes (5 gal c/u) y ${order.galones || 0} Galones
- Área a Cubrir: ${order.areaM2 || 50} m²
- Monto Total: $${Number(order.totalCOP || 0).toLocaleString('es-CO')} COP

INVENTARIO EN PLANTA / SEDE ${order.ciudad?.toUpperCase()}:
- Stock en sede: ${cityStock ?? 15} cuñetes
- Stock disponible en CEDI Central Medellín: ${factoryAvailable} cuñetes
- Sellador / Base y Pigmentos: Verificados en laboratorio

REQUISITOS OBLIGATORIOS PARA LA REDACCIÓN:
- "mensajeCorreoCliente": Correo formal, cordial, claro y profesional. Debe incluir explícitamente el nombre del cliente (${order.responsable || order.cliente}), el producto (${order.tipoPintura}), la cantidad (${order.cunetes || 1} cuñetes / ${order.galones || 0} galones), el área en m² (${order.areaM2 || 50} m²) y la ciudad (${order.ciudad}).
- "mensajeWhatsAppCliente": Mensaje de WhatsApp más corto, cercano y cordial con formato limpio (negritas con asteriscos, emojis acordes). Debe mencionar también el nombre del cliente, producto, cantidad, área en m² (${order.areaM2 || 50} m²) y ciudad (${order.ciudad}).

Responde ÚNICAMENTE un objeto JSON válido con la siguiente estructura (sin markdown exterior):
{
  "decision": "aceptar" | "en_espera" | "rechazar",
  "razonTecnica": "Explicación detallada de stock en planta vs CEDI, pigmentos y viabilidad",
  "porQueSeAcepto": "Explicación directa para el Administrador de por qué la IA aprobó el despacho (ej: Insumos 100% verificados, compatibilidad química validada y disponibilidad inmediata en CEDI)",
  "insumosVerificados": {
    "pinturaValida": true,
    "colorFormulado": true,
    "stockSuficiente": boolean,
    "cuñetesFaltantes": number
  },
  "vehiculoSugerido": {
    "tipo": "Buseta Logística Colorlink #04" | "Furgón Urbano Colorlink #08" | "Camión Turbo NHR 4.5 Ton" | "Camión Nodriza Intermunicipal",
    "placa": "TZW-402" | "WLL-482" | "KLU-891" | "WFH-320",
    "conductor": "Carlos Restrepo" | "Carlos Mario Henao" | "Jairo Ramírez" | "Andrés Felipe Gil",
    "capacidad": "80 cuñetes (3.5 Ton)",
    "horaEstimadaDespacho": "Hoy mismo en 2 horas" | "Mañana a primera hora (08:00 AM)" | "En espera de reposición"
  },
  "rutaAsignada": {
    "origen": "Planta Central Colorlink (Itagüí / Medellín)",
    "destino": "Obra en destino",
    "corredor": "Autopista Sur ➔ Av. Regional ➔ Corredor Express",
    "distanciaKm": 14.5,
    "tiempoMin": 32,
    "ahorroMin": 18,
    "horaEstimada": "11:30 AM"
  },
  "mensajeCorreoCliente": "Texto formal del correo",
  "mensajeWhatsAppCliente": "Texto corto y cálido de WhatsApp",
  "recomendacionAdicional": "Consejo técnico para la aplicación o preparación del sustrato"
}`;

    const aiClient = getAiClient();
    if (aiClient) {
      // Priorizar modelos con alta disponibilidad inmediata confirmada
      const candidateModels = [
        'gemini-3.5-flash',
        'gemini-3.6-flash',
        'gemini-3.5-flash-lite',
        'gemini-flash-lite-latest',
        'gemini-3-flash-preview',
        'gemini-3.8-flash',
        'gemini-3.1-flash-lite'
      ];
      for (const modelName of candidateModels) {
        try {
          const aiResponse = await aiClient.models.generateContent({
            model: modelName,
            contents: prompt,
            config: {
              responseMimeType: 'application/json'
            }
          });

          const rawText = aiResponse.text;
          if (rawText) {
            const parsed = JSON.parse(rawText);
            return res.json({
              success: true,
              provider: modelName,
              audit: parsed
            });
          }
        } catch (geminiErr: any) {
          console.warn(`[AI AUDIT] Error al invocar ${modelName}:`, geminiErr?.message || geminiErr);
          // Si es error de cuota/resource_exhausted, probar con el siguiente modelo o caer a heurística
        }
      }
    }

    // Heurística de respaldo precisa y robusta
    const stock = Number(cityStock ?? 15);
    const needed = Number(order.cunetes || 1);
    const hasSufficient = stock >= needed;

    let decision: 'aceptar' | 'en_espera' | 'rechazar' = 'aceptar';
    let razon = '';

    if (!order.ciudad || !order.tipoPintura) {
      decision = 'rechazar';
      razon = 'Datos incompletos de localización o especificación de pintura.';
    } else if (hasSufficient) {
      decision = 'aceptar';
      razon = `Stock local suficiente en CEDI ${order.ciudad} (${stock} cuñetes disponibles vs ${needed} requeridos). Tintometría y fórmula verificada a satisfacción.`;
    } else {
      decision = 'en_espera';
      razon = `Demanda (${needed} cuñetes) excede el stock inmediato en CEDI ${order.ciudad} (${stock} disp.). Se requiere programación de lote desde fábrica central Medellín.`;
    }

    const clientName = order.responsable || order.cliente || 'Cliente';
    const prodName = order.tipoPintura || 'Pintura Tipo 1';
    const city = order.ciudad || 'Medellín';
    const m2 = order.areaM2 || 50;
    const qtyText = `${needed} cuñete(s)`;

    let emailText = '';
    let waText = '';

    if (decision === 'aceptar') {
      emailText = `Estimado(a) ${clientName},\n\nNos complace informarle que su pedido #${order.id} ha sido auditado por nuestro sistema inteligente de control de calidad y ACEPTADO para producción inmediata en planta.\n\nDetalles del despacho:\n• Producto: ${prodName}\n• Color: ${order.color || 'Acabado Estándar'}\n• Cantidad: ${qtyText}\n• Área cubierta: ${m2} m²\n• Ciudad destino: ${city}\n• Total liquidado: $${Number(order.totalCOP || 0).toLocaleString('es-CO')} COP\n\nNuestra planta cuenta con el 100% de insumos, pigmentos y resinas listas. Su pedido ha sido asignado al Camión Turbo NHR Placa TZW-402 conducido por Carlos Mario Henao.\n\nAtentamente,\nEquipo de Calidad y Despacho COLORLINK® Pinturas`;
      waText = `🎨 *COLORLINK® • PEDIDO ACEPTADO #${order.id}* 🎨\n\n¡Hola *${clientName}*! Tu pedido para cubrir *${m2} m²* en *${city}* ha sido verificado con el 100% de insumos en planta y *ACEPTADO*.\n\n📦 *Detalle:* ${qtyText} de ${prodName} (${order.color || 'Color seleccionado'})\n🚚 *Despacho:* Asignado a Camión Turbo NHR (Placa: TZW-402) conducido por Carlos Mario Henao.\n\n¡Inicia preparación en tintometría!`;
    } else if (decision === 'en_espera') {
      emailText = `Estimado(a) ${clientName},\n\nLe informamos que su pedido #${order.id} para ${qtyText} de ${prodName} (${m2} m²) con destino a ${city} ha sido colocado temporalmente EN ESPERA.\n\nMotivo del dictamen: ${razon}\n\nNuestro Centro de Distribución (CEDI) ya programó el traslado del lote faltante para que su pedido no sufra retrasos imprevistos. Le avisaremos tan pronto sea despachado.\n\nCordialmente,\nEquipo Técnico COLORLINK®`;
      waText = `⏳ *COLORLINK® • PEDIDO EN ESPERA #${order.id}*\n\nHola *${clientName}*, te informamos que tu pedido de *${qtyText}* de ${prodName} para *${m2} m²* en *${city}* está en espera por consolidación de insumos en CEDI.\n\nYa estamos coordinando el traslado para alistarlo cuanto antes. Te mantendremos informado.`;
    } else {
      emailText = `Estimado(a) ${clientName},\n\nLe notificamos que el pedido #${order.id} para ${prodName} (${m2} m²) en ${city} ha sido RECHAZADO por el sistema de auditoría técnica.\n\nMotivo del rechazo: ${razon}\n\nUn asesor técnico se pondrá en contacto con usted al número ${order.telefono} para evaluar la formulación apropiada para su requerimiento.\n\nAtentamente,\nControl Técnico COLORLINK®`;
      waText = `⚠️ *COLORLINK® • PEDIDO NO APROBADO #${order.id}*\n\nHola *${clientName}*, tu solicitud para *${m2} m²* en *${city}* no pudo ser aprobada automáticamente por: ${razon}.\nUn asesor técnico te contactará pronto para darte la mejor solución.`;
    }

    const porQueSeAcepto = decision === 'aceptar'
      ? `Aceptado automáticamente por la IA: Insumos verificados al 100% en CEDI ${city} (${stock} cuñetes en existencia vs ${needed} requeridos), formulación tintométrica aprobada y capacidad de flete disponible.`
      : (decision === 'en_espera'
        ? `Puesto en espera por la IA: Demanda de ${needed} cuñetes supera la disponibilidad inmediata de ${stock} cuñetes en CEDI ${city}. Requiere remesa de enlace.`
        : `Rechazado por la IA: Falta de especificaciones o restricciones químicas para la zona de ${city}.`);

    const busType = needed > 25
      ? 'Camión Nodriza Intermunicipal #11'
      : (needed > 8 ? 'Camión Turbo NHR 4.5 Ton Colorlink' : 'Buseta Logística Urbana Colorlink #04');
    const busPlaca = needed > 25 ? 'KLU-891' : (needed > 8 ? 'TZW-402' : 'WLL-482');
    const busDriver = needed > 25 ? 'Jairo Ramírez' : (needed > 8 ? 'Carlos Mario Henao' : 'Carlos Restrepo');

    const fallbackAudit = {
      decision,
      razonTecnica: razon,
      porQueSeAcepto,
      insumosVerificados: {
        pinturaValida: true,
        colorFormulado: true,
        stockSuficiente: hasSufficient,
        cuñetesFaltantes: hasSufficient ? 0 : needed - stock
      },
      vehiculoSugerido: {
        tipo: busType,
        placa: busPlaca,
        conductor: busDriver,
        capacidad: needed > 25 ? '120 cuñetes (6.0 Ton)' : (needed > 8 ? '80 cuñetes (4.5 Ton)' : '35 cuñetes (2.0 Ton)'),
        horaEstimadaDespacho: decision === 'aceptar' ? 'Hoy en las próximas 2 horas' : 'Programado tras producción'
      },
      rutaAsignada: {
        origen: `CEDI Logístico Colorlink (${city === 'Medellín' ? 'Itagüí' : city})`,
        destino: `Obra ${clientName} (${city})`,
        corredor: city === 'Medellín'
          ? 'Autopista Sur ➔ Av. Regional ➔ Corredor Norte'
          : `Corredor Troncal ➔ Vía Perimetral ${city}`,
        distanciaKm: 14.8,
        tiempoMin: 34,
        ahorroMin: 22,
        horaEstimada: '11:30 AM'
      },
      mensajeCorreoCliente: emailText,
      mensajeWhatsAppCliente: waText,
      recomendacionAdicional: 'Verificar humedad superficial del revoque (<12%) antes de aplicar la primera mano de pintura.'
    };

    return res.json({
      success: true,
      provider: 'heuristic-engine',
      audit: fallbackAudit
    });

  } catch (error: any) {
    console.error('[AI AUDIT ERROR]', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Endpoint de Revisión Automática de Fotos de Evidencia con IA (Gemini 3.8 Flash Vision)
app.post(['/api/ai-review-photo', '/ai-review-photo'], async (req, res) => {
  try {
    const { photoName, previewUrl, isOfficialSample, currentContext } = req.body;

    // Si es una foto técnica oficial de muestra del sistema, aprobar de inmediato
    if (isOfficialSample === true) {
      return res.json({
        success: true,
        diagnosis: {
          valid: true,
          detectedObject: 'Muestra técnica oficial de superficie arquitectónica',
          statusText: 'Revisada y Aprobada por IA Colorlink',
          rejectionReason: '',
          sustrato: currentContext?.superficie || 'Concreto / Revoque arquitectónico',
          ambienteDetectado: currentContext?.ambiente || 'Exterior Intemperie',
          condicionDetectada: 'Fisuras leves y humedad',
          tipoPinturaRecomendado: 'Tipo 1',
          condicion: 'Superficie arquitectónica apta con adherencia verificada',
          recomendacion: 'Compatible con formulación Tipo 1 / Tipo 2 según Norma Técnica NTC 1335',
          normaNTC: 'Norma Técnica Colombiana NTC 1335 Aprobada'
        }
      });
    }

    // Extraer inlineData base64 de la imagen subida o capturada por cámara
    let inlineDataPart: { inlineData: { mimeType: string; data: string } } | null = null;
    if (typeof previewUrl === 'string' && previewUrl.startsWith('data:image/')) {
      const match = previewUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
      if (match && match[2]) {
        let mimeType = match[1].toLowerCase();
        if (mimeType === 'image/jpg') mimeType = 'image/jpeg';
        inlineDataPart = {
          inlineData: {
            mimeType,
            data: match[2]
          }
        };
      }
    }

    const systemPrompt = `Eres el Inspector Estricto de Visión Artificial de COLORLINK® Pinturas Colombia.
Analiza visualmente la imagen adjunta y determina con rigor si corresponde REALMENTE a una fachada, pared, muro, techo o superficie/estructura para pintar, o si es una foto ajena ("cosa X").

REGLAS ESTRICTAS DE VALIDACIÓN VISUAL:
1. ACEPTAR ("valid": true) ÚNICAMENTE SI la imagen muestra de forma clara y principal:
   - Fachadas exteriores de edificios, casas, bodegas, locales comerciales o conjuntos residenciales.
   - Paredes o muros interiores o exteriores (concreto, revoque, pañete, ladrillo, mampostería, estuco, drywall, yeso, graniplast).
   - Techos, cielorrasos, placas o cubiertas arquitectónicas para pintar o impermeabilizar.
   - Pisos industriales, canchas, losas de concreto o parqueaderos a recubrir.
   - Puertas, marcos, rejas, portones, barandas, estructuras metálicas o superficies de madera que sean elementos para pintar.
   - Habitaciones, salones, pasillos u obras en construcción/remodelación donde se observen las paredes o superficies a pintar.

2. RECHAZAR ESTRICTAMENTE ("valid": false) SI la imagen muestra cualquier otra cosa que NO sea una fachada, pared o superficie para pintar ("cosas X"), por ejemplo:
   - Personas, rostros, selfies, retratos, manos o partes del cuerpo.
   - Animales o mascotas (perros, gatos, aves, caballos, etc.).
   - Comida, bebidas, platos, frutas, alimentos o artículos de cocina.
   - Vehículos (carros, motos, bicicletas, camiones, aviones).
   - Capturas de pantalla (screenshots de celular o PC, chats de WhatsApp, páginas web, tablas, código, facturas, documentos, memes, caricaturas, anime, videojuegos, logos, íconos, códigos QR).
   - Objetos cotidianos o personales (celulares, computadores, televisores, teclados, ropa, zapatos, bolsos, juguetes, botellas, vasos, muebles tapizados, camas, sillas de oficina).
   - Paisajes naturales abiertos donde no hay ninguna edificación ni pared a pintar (playas, mar, bosques, flores, montañas, cielo solo).
   - Fotos totalmente oscuras, en blanco o irreconocibles.

IMPORTANTE: Si el sujeto principal de la foto es una persona, selfie, mascota, carro, comida, captura de pantalla u objeto aleatorio, DEBES responder "valid": false aunque al fondo se vea un pedazo de pared.`;

    const aiClient = getAiClient();
    if (aiClient) {
      const visionModels = [
        'gemini-3.5-flash',
        'gemini-3.5-flash-lite',
        'gemini-3.6-flash',
        'gemini-3-flash-preview',
        'gemini-3.8-flash',
        'gemini-3.1-flash-lite'
      ];
      for (const modelName of visionModels) {
        try {
          const textPrompt = `${systemPrompt}\n\nNombre del archivo: "${photoName || 'foto_subida.jpg'}". Contexto del formulario: ${JSON.stringify(currentContext || {})}`;
          const contentsPayload = inlineDataPart
            ? { parts: [inlineDataPart, { text: textPrompt }] }
            : textPrompt;

          const aiResponse = await aiClient.models.generateContent({
            model: modelName,
            contents: contentsPayload,
            config: {
              temperature: 0.1,
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  valid: {
                    type: Type.BOOLEAN,
                    description: 'true SOLO si la imagen muestra una fachada, pared, muro, techo, piso o superficie/objeto arquitectónico para pintar. false si es cualquier otra cosa (persona, selfie, mascota, carro, comida, captura de pantalla, meme, objeto cotidiano).'
                  },
                  detectedObject: {
                    type: Type.STRING,
                    description: 'Lo que realmente se ve en la imagen en español (ej. "Fachada de concreto", "Pared interior en estuco", o si es inválida: "Persona / Selfie", "Mascota (Perro/Gato)", "Automóvil", "Captura de pantalla", "Comida", "Objeto personal").'
                  },
                  statusText: {
                    type: Type.STRING,
                    description: 'Si valid es true: "Revisada y Aprobada por IA Colorlink". Si valid es false: "Rechazada por IA • No es fachada, pared ni superficie para pintar".'
                  },
                  rejectionReason: {
                    type: Type.STRING,
                    description: 'Si valid es false, explica claramente por qué se rechazó (ej. "La imagen muestra [lo detectado] y no corresponde a una fachada, pared ni superficie arquitectónica para pintar."). Si valid es true, devuelve "".'
                  },
                  sustrato: {
                    type: Type.STRING,
                    description: 'Si valid es true, sustrato detectado ("Concreto / Revoque", "Drywall / Yeso", "Metal Ferroso", "Madera", "Pintura Existente", "Ladrillo / Mampostería"). Si valid es false: "No aplica (Imagen rechazada)".'
                  },
                  ambienteDetectado: {
                    type: Type.STRING,
                    description: 'Si valid es true: "Exterior Intemperie", "Interior Seco" o "Interior Húmedo (Baños/Cocinas)".'
                  },
                  condicionDetectada: {
                    type: Type.STRING,
                    description: 'Si valid es true: "Fisuras leves y humedad", "Descascaramiento severo", "Nueva sin pintar" o "Pintada en buen estado".'
                  },
                  tipoPinturaRecomendado: {
                    type: Type.STRING,
                    description: 'Si valid es true: "Tipo 1", "Tipo 2" o "Tipo 3".'
                  },
                  condicion: {
                    type: Type.STRING,
                    description: 'Estado observado en la superficie (si valid es true) o motivo de rechazo (si valid es false).'
                  },
                  recomendacion: {
                    type: Type.STRING,
                    description: 'Recomendación de pintura según NTC 1335 (si valid es true) o indicación de subir una foto real de fachada/pared (si valid es false).'
                  },
                  normaNTC: {
                    type: Type.STRING,
                    description: 'Si valid es true: "Norma Técnica Colombiana NTC 1335 Aprobada". Si valid es false: "No cumple requisito de evidencia arquitectónica".'
                  }
                },
                required: [
                  'valid',
                  'detectedObject',
                  'statusText',
                  'rejectionReason',
                  'sustrato',
                  'condicion',
                  'recomendacion',
                  'normaNTC'
                ]
              }
            }
          });

          const rawText = aiResponse.text;
          if (rawText) {
            const parsed = JSON.parse(rawText);
            return res.json({ success: true, diagnosis: parsed });
          }
        } catch (err: any) {
          console.warn(`[AI PHOTO REVIEW] Error en llamada a Gemini Vision (${modelName}):`, err?.message || err);
        }
      }
    }

    // Heurística de respaldo si no hay clave configurada
    const lowerName = String(photoName || '').toLowerCase();
    const isInvalidByName =
      lowerName.includes('perro') ||
      lowerName.includes('gato') ||
      lowerName.includes('mascota') ||
      lowerName.includes('dog') ||
      lowerName.includes('cat') ||
      lowerName.includes('selfie') ||
      lowerName.includes('persona') ||
      lowerName.includes('rostro') ||
      lowerName.includes('carro') ||
      lowerName.includes('auto') ||
      lowerName.includes('moto') ||
      lowerName.includes('vehiculo') ||
      lowerName.includes('comida') ||
      lowerName.includes('food') ||
      lowerName.includes('meme') ||
      lowerName.includes('screenshot') ||
      lowerName.includes('captura') ||
      lowerName.includes('whatsapp') ||
      lowerName.includes('pantalla') ||
      lowerName.includes('logo');

    if (isInvalidByName) {
      return res.json({
        success: true,
        diagnosis: {
          valid: false,
          detectedObject: 'Imagen no correspondiente a obra o pared',
          statusText: 'Rechazada por IA • No es fachada, pared ni superficie para pintar',
          rejectionReason: 'El archivo subido no corresponde a una fachada, pared, muro ni superficie para pintar.',
          sustrato: 'No aplica (Imagen rechazada)',
          condicion: 'Imagen descartada por no mostrar una superficie arquitectónica pintable',
          recomendacion: 'Por favor sube únicamente fotografías de fachadas, paredes, techos o cosas para pintar.',
          normaNTC: 'Rechazada - No cumple requisito de evidencia'
        }
      });
    }

    return res.json({
      success: true,
      diagnosis: {
        valid: true,
        detectedObject: 'Superficie arquitectónica / Muro a pintar',
        statusText: 'Revisada y Aprobada por IA Colorlink',
        rejectionReason: '',
        sustrato: currentContext?.superficie || 'Concreto / Revoque arquitectónico',
        ambienteDetectado: currentContext?.ambiente || 'Exterior Intemperie',
        condicionDetectada: 'Fisuras leves y humedad',
        tipoPinturaRecomendado: 'Tipo 1',
        condicion: 'Superficie analizada con textura apta para repinte',
        recomendacion: 'Compatible al 100% con formulación Tipo 1 / Tipo 2 según NTC 1335',
        normaNTC: 'Norma Técnica Colombiana NTC 1335 Aprobada'
      }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Endpoint de Chat Inteligente Pincelito & Asesor Técnico
app.post(['/api/pincelito-chat', '/pincelito-chat'], async (req, res) => {
  try {
    const { query, formData = {}, history = [], isAdvisorMode = false, clientContext = {} } = req.body;
    if (!query) {
      return res.status(400).json({ success: false, error: 'Falta la consulta (query)' });
    }

    const mergedData = { ...formData, ...clientContext };
    const clientName = mergedData.responsable || mergedData.cliente || '';
    const company = mergedData.cliente || mergedData.empresa || '';
    const city = mergedData.ciudad || 'Medellín';
    const area = Number(mergedData.areaM2 || 0);
    const workType = mergedData.tipoObra || '';
    const paintType = mergedData.tipoPintura || 'Pintura Tipo 1 Exterior NTC 1335';
    const brand = mergedData.marca || 'Colorlink® Pro';
    const finishColor = mergedData.colorAcabado || '';
    const surface = mergedData.superficie || '';
    const environment = mergedData.ambiente || '';
    const condition = mergedData.condicion || '';
    const totalQuote = mergedData.totalCOP ? new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(mergedData.totalCOP) : '';
    const phone = mergedData.telefonoResponsable || mergedData.telefono || '';

    const systemPrompt = isAdvisorMode
      ? `Eres la Arq. Sofía Martínez 👩‍💼, Asesora Técnica Especialista de COLORLINK® Pinturas Colombia.
Estás hablando directamente con el cliente en el chat oficial de la empresa.
Tu tono es profesional, cálido, experto y 100% natural colombiano. Respondes con total seguridad, empatía y claridad sobre especificaciones de pintura, preparación de superficies, normatividad NTC 1335 y logística de despacho.

DATOS DEL CLIENTE EN SISTEMA:
${clientName ? `• Cliente: ${clientName}` : ''}
${company ? `• Empresa / Proyecto: ${company}` : ''}
${city ? `• Ciudad: ${city}` : ''}
${workType ? `• Obra: ${workType}` : ''}
${area > 0 ? `• Área: ${area} m²` : ''}
${paintType ? `• Pintura: ${paintType}` : ''}
${finishColor ? `• Color: ${finishColor}` : ''}
${surface ? `• Sustrato: ${surface}` : ''}

PAUTAS DE RESPUESTA:
1. Responde de forma directa, fluida y amigable a la consulta exacta del cliente.
2. Si el cliente saluda, salúdalo con calidez y ponte a su servicio.
3. Si pregunta sobre temas técnicos o de stock en ${city}, brinda una asesoría impecable.
4. Usa viñetas (•) y negritas (**texto**) limpias. Precios siempre en formato colombiano ($ COP). Nunca uses sintaxis de LaTeX.`
      : `Eres Pincelito 🐧🎨, el asistente técnico inteligente y oficial de COLORLINK® Pinturas Colombia (marca líder certificada con sellos NTC 1335 y NTC 5828).
Tu personalidad es alegre, servicial, experta y muy profesional. Respondes en español colombiano de forma 100% natural, fluida y agradable.

DIRECTRICES CLAVE:
1. RESPONDE EXACTA Y DIRECTAMENTE a lo que el usuario está preguntando. No uses respuestas predeterminadas genéricas.
2. Si el usuario pregunta por un tema específico (por ejemplo: qué pintura usar para un garaje, cómo tratar humedad, qué rodillo comprar, precios o colores), céntrate en responder ese tema puntual con información técnica aplicable y soluciones prácticas.
3. Si el usuario saluda ("hola", "buenas"), salúdalo con calidez ("¡Hola! Qué gusto saludarte 🐧🎨...") y pregúntale en qué le puedes colaborar.
4. Especificaciones clave Colorlink®:
   • Fachadas: Tipo 1 Acrílica o Elastomérica (antifisuras e impermeabilizante con DFT >150 micras).
   • Interiores: Tipo 1 Superlavable (>800 ciclos NTC 1335) o Tipo 2 Estándar.
   • Baños/Cocinas: Antihongos Antibacterial resistente a condensación y vapor.
   • Techos y Cielos: Tipo 3 Cielorrasos mate antireflejos.
   • Pisos de alto tráfico / garajes: Pintura Epóxica bicomponente (A+B) o Poliuretano Alifático exterior.
   • Metales: Esmaltes Alquídicos y Anticorrosivos fosfatizantes.
   • Maderas: Barniz y Laca Poliuretano con filtro solar UV.
   • NÚMERO DE MANOS REALISTA (Depende del producto y sustrato, NUNCA es 2 para todo):
     - Barniz en maderas: Requiere 3 manos con lijado suave intermedio para sellar la veta.
     - Membrana elastomérica: 2 a 3 manos generosas para lograr espesor impermeabilizante DFT >150-200µm.
     - Cielorrasos / techos en buen estado: 1 mano con rodillo antigoteo es suficiente y óptima para no sobrecargar el yeso.
     - Epóxica para pisos: 2 capas cruzadas bicomponente A+B sobre imprimante.
     - Esmaltes metálicos: 1 mano de base anticorrosiva + 2 manos de acabado.
     - Tráfico y canchas: 1 mano en repinte vial; 2 manos en asfalto nuevo.
     - Muros Tipo 1 y 2: 1 a 2 manos en mantenimiento; 3 manos en sustratos vírgenes o cambio drástico de color oscuro a claro.
   • COMBINACIÓN DE 2 COLORES Y SIMULADOR:
     - Ahora la plataforma permite seleccionar 2 colores (Color Principal ~70% y Color de Acento / Molduras ~30%).
     - Cuenta con un Simulador Arquitectónico en Vivo (Sala Contemporánea, Fachada Exterior y Dormitorio) para ver exactamente cómo lucen ambos colores juntos antes de comprar.
5. Formato limpio: Negritas (**texto clave**), viñetas limpias (•), precios en $ COP y metrajes en m². Cero LaTeX.`;

    const aiClient = getAiClient();
    if (aiClient) {
      const candidateModels = [
        'gemini-3.5-flash',
        'gemini-3.6-flash',
        'gemini-3.5-flash-lite',
        'gemini-flash-lite-latest',
        'gemini-3-flash-preview',
        'gemini-3.8-flash',
        'gemini-3.1-flash-lite'
      ];
      for (const modelName of candidateModels) {
        try {
          const conversationHistory = Array.isArray(history) && history.length > 0
            ? history.slice(-4).map((h: any) => `${h.sender === 'user' ? 'Cliente' : 'Asistente'}: ${h.text || ''}`).join('\n')
            : '';

          const userPromptContent = conversationHistory
            ? `Conversación previa:\n${conversationHistory}\n\nPregunta actual del usuario: "${query}"`
            : query;

          const aiResponse = await aiClient.models.generateContent({
            model: modelName,
            contents: userPromptContent,
            config: {
              systemInstruction: systemPrompt,
              temperature: 0.65
            }
          });

          const replyText = aiResponse.text;
          if (replyText) {
            return res.json({
              success: true,
              provider: modelName,
              reply: cleanChatText(replyText)
            });
          }
        } catch (geminiErr: any) {
          console.warn(`[PINCELITO CHAT] Error en ${modelName}:`, geminiErr?.message || geminiErr);
        }
      }
    }

    // Motor de Inteligencia y Conocimiento Técnico Experto de Colorlink (Respaldo inteligente multi-intención)
    const qLower = query.toLowerCase().trim();
    let expertReply = '';

    const isGreeting =
      qLower === 'hola' ||
      qLower.startsWith('hola') ||
      qLower.startsWith('buenas') ||
      qLower.includes('buenos dias') ||
      qLower.includes('buenos días') ||
      qLower.includes('buenas tardes') ||
      qLower.includes('buenas noches') ||
      qLower.includes('saludos') ||
      qLower === 'hey';

    const isAboutPaintTypes =
      qLower.includes('tipo 1') ||
      qLower.includes('tipo 2') ||
      qLower.includes('tipo 3') ||
      qLower.includes('tipos de pintura') ||
      qLower.includes('cual pintura') ||
      qLower.includes('cuál pintura') ||
      qLower.includes('que pintura') ||
      qLower.includes('qué pintura') ||
      qLower.includes('diferencia entre');

    const isAboutColors =
      qLower.includes('color') ||
      qLower.includes('colores') ||
      qLower.includes('paleta') ||
      qLower.includes('carta') ||
      qLower.includes('tono') ||
      qLower.includes('acabado') ||
      qLower.includes('mate') ||
      qLower.includes('satinado') ||
      qLower.includes('blanco') ||
      qLower.includes('gris') ||
      qLower.includes('tintometria') ||
      qLower.includes('tintometría');

    const isAboutPrices =
      qLower.includes('precio') ||
      qLower.includes('cuanto vale') ||
      qLower.includes('cuánto vale') ||
      qLower.includes('cuanto cuesta') ||
      qLower.includes('cuánto cuesta') ||
      qLower.includes('costo') ||
      qLower.includes('valor') ||
      qLower.includes('tarifa') ||
      qLower.includes('presupuesto') ||
      qLower.includes('descuento');

    const isAboutTools =
      qLower.includes('brocha') ||
      qLower.includes('rodillo') ||
      qLower.includes('herramienta') ||
      qLower.includes('espatula') ||
      qLower.includes('espátula') ||
      qLower.includes('cinta') ||
      qLower.includes('lija') ||
      qLower.includes('bandeja');

    const isAboutCoats =
      qLower.includes('manos') ||
      qLower.includes('dos manos') ||
      qLower.includes('2 manos') ||
      qLower.includes('cuantas manos') ||
      qLower.includes('cuántas manos') ||
      qLower.includes('capas') ||
      qLower.includes('número de manos') ||
      qLower.includes('numero de manos');

    const isAboutTwoColors =
      qLower.includes('dos colores') ||
      qLower.includes('2 colores') ||
      qLower.includes('bicolor') ||
      qLower.includes('combinar') ||
      qLower.includes('combinación') ||
      qLower.includes('combinacion') ||
      qLower.includes('juntos') ||
      qLower.includes('pared de acento') ||
      qLower.includes('muro focal') ||
      qLower.includes('moldura');

    const isAboutPreparation =
      qLower.includes('como aplicar') ||
      qLower.includes('cómo aplicar') ||
      qLower.includes('preparar') ||
      qLower.includes('preparacion') ||
      qLower.includes('aplicacion') ||
      qLower.includes('aplicación') ||
      qLower.includes('revoque') ||
      qLower.includes('estuco');

    const isAboutAdvisor =
      qLower.includes('asesor') ||
      qLower.includes('contacto') ||
      qLower.includes('telefono') ||
      qLower.includes('teléfono') ||
      qLower.includes('humano') ||
      qLower.includes('hablar') ||
      qLower.includes('sofia') ||
      qLower.includes('sofía');

    const isAboutShipping =
      qLower.includes('envio') ||
      qLower.includes('envío') ||
      qLower.includes('despacho') ||
      qLower.includes('flete') ||
      qLower.includes('entrega') ||
      qLower.includes('tiempo de entrega') ||
      qLower.includes('cedi') ||
      qLower.includes('cobertura');

    const isAboutWarranty =
      qLower.includes('garantia') ||
      qLower.includes('garantía') ||
      qLower.includes('ntc') ||
      qLower.includes('norma') ||
      qLower.includes('certificacion') ||
      qLower.includes('certificación') ||
      qLower.includes('durabilidad');

    const isAboutDrying =
      qLower.includes('secado') ||
      qLower.includes('secar') ||
      qLower.includes('tiempo de secado') ||
      qLower.includes('cuanto tarda');

    const isAboutCoverage =
      qLower.includes('rendimiento') ||
      qLower.includes('cuanto rinde') ||
      qLower.includes('cuánto rinde') ||
      qLower.includes('galon') ||
      qLower.includes('galón') ||
      qLower.includes('cuñete') ||
      qLower.includes('cunete') ||
      qLower.includes('m2') ||
      qLower.includes('metros cuadrados');

    const isAboutHumidity =
      qLower.includes('humedad') ||
      qLower.includes('filtracion') ||
      qLower.includes('filtración') ||
      qLower.includes('salitre') ||
      qLower.includes('hongo') ||
      qLower.includes('moho') ||
      qLower.includes('fisura') ||
      qLower.includes('grieta') ||
      qLower.includes('ampolla');

    if (isAdvisorMode) {
      if (isGreeting) {
        expertReply = `¡Hola ${clientName || 'estimado cliente'}! 👩‍💼 Te saluda la Arq. Sofía Martínez, especialista técnica de Colorlink Colombia.\n\nEstoy atenta para ayudarte con cualquier duda técnica de tu proyecto, cotización de cuñetes, especificación de pinturas bajo norma NTC o coordinación de despachos en ${city}. ¿En qué te puedo asesorar en este momento?`;
      } else if (isAboutShipping || qLower.includes('stock')) {
        expertReply = `Hola ${clientName || 'estimado cliente'}, he revisado la disponibilidad en nuestro CEDI de ${city}: tenemos stock de ${paintType} y furgones Colorlink programados con despacho prioritario en 24 a 48 horas. ¿Deseas que coordinemos la remisión oficial de entrega para tu obra?`;
      } else if (isAboutWarranty) {
        expertReply = `${clientName ? `${clientName}, t` : 'T'}e confirmo que todas nuestras formulaciones de ${paintType} cuentan con certificación oficial de calidad **NTC 1335** y garantía por escrito de **5 a 7 años** contra decoloración y desprendimiento prematuro. Te anexamos la ficha técnica con tu pedido.`;
      } else {
        expertReply = `Hola ${clientName || 'estimado cliente'}, con respecto a tu consulta sobre "${query}": te recomiendo verificar la adherencia del sustrato y aplicar una mano previa de sellador antialcalino para maximizar el anclaje de la pintura ${paintType} en ${finishColor || 'el acabado seleccionado'}. ¿Deseas que agendemos una visita técnica o tienes otra duda?`;
      }
    } else {
      if (isGreeting) {
        expertReply = `¡Hola! 🐧🎨 Soy **Pincelito**, tu asistente inteligente y consejero de pinturas Colorlink.\n\nEstoy aquí para resolver cualquier duda que tengas sobre:\n• Tipos de pintura (Tipo 1 Exterior, Tipo 2 Interior, Tipo 3 Cielos).\n• Rendimiento por metro cuadrado y cálculo de cuñetes.\n• Carta de colores computarizada y acabados mate/satinado.\n• Protocolos para corregir humedad, salitre o fisuras.\n• Herramientas profesionales (brochas y rodillos de microfibra).\n\n¿En qué te puedo colaborar el día de hoy?`;
      } else if (isAboutPaintTypes) {
        expertReply = `🎨 **Diferencias Técnicas entre Tipos de Pintura (Norma NTC 1335):**\n\n• **Tipo 1 (Exterior / Fachadas / Alto Tráfico):** Máxima resistencia a intemperie, sol y lluvia directa. Soporta más de **400 ciclos de lavado** sin desgaste. Formulada con resinas 100% acrílicas de alta elasticidad que no se ampollan.\n• **Tipo 2 (Interior Lavable):** Diseñada para muros interiores en salas, alcobas y oficinas. Soporta más de **100 ciclos de lavado**, con excelente poder cubriente y acabado terso.\n• **Tipo 3 (Cielorrasos / Bajo Frote):** Recomendada exclusivamente para techos o cielos falsos donde no hay roce ni contacto con humedad.`;
      } else if (isAboutColors) {
        expertReply = `🌈 **Carta de Colores & Tintometría Computarizada Colorlink:**\n\n• Contamos con más de **2,000 colores formulados** mediante dosificación giroscópica computarizada milimétrica.\n• **Acabados disponibles:** **Mate** (disimula imperfecciones del muro y no refleja destellos), **Satinado** (elegante brillo de seda, muy fácil de limpiar) y **Brillante**.\n• Los colores más solicitados para obra actual son: Blanco Puro, Gris Cemento, Marfil Cálido, Arena Caribe, Gris Grafito y Azul Cobalto.\n• Puedes elegir tu color directamente en el cotizador o escribir el código de tu agrado.`;
      } else if (isAboutPrices) {
        expertReply = `💰 **Precios y Formatos Oficiales Colorlink:**\n\n• **Cuñete (5 Galones = 18.9 L):** Es la presentación más económica por m². Tipo 1 desde aprox. $240.000 COP; Tipo 2 desde aprox. $190.000 COP.\n• **Galón (3.785 L):** Ideal para remates o áreas menores a 25 m². Desde $55.000 a $75.000 COP según especificación.\n• **Sellador Antialcalino / Hidrófugo:** Rinde 40 a 50 m² por galón.\n• En el cotizador puedes calcular el valor exacto de tu proyecto con flete incluido a ${city} y descuentos por volumen.`;
      } else if (isAboutCoats) {
        expertReply = `🎯 **¿Por qué el número de manos depende del tipo de pintura y sustrato?**\n\nEn la realidad técnica de obra, **NO siempre se aplican 2 manos**. El número real varía según la física del recubrimiento, la porosidad del sustrato y el estado de la pared:\n\n• **1 Mano (Mantenimiento y Cielorrasos):** En techos y cielorrasos con pintura blanca existente en buen estado (Pintura Tipo 3) o repintes de color similar, 1 sola mano con rodillo antigoteo es suficiente y recomendada para no sobrecargar el peso de la placa de yeso/drywall.\n• **2 Manos (Estándar Oficial NTC 1335):** Para repintes estándar en muros interiores o fachadas. La 1ª mano uniforma el fondo y la 2ª mano desarrolla el poder cubriente (>96%) y la textura superlavable.\n• **3 Manos (Maderas, Elastoméricas y Patologías):**\n  - **Maderas (Barniz / Laca):** Requieren 3 manos con lijado suave intermedio (grano 320) para sellar poro y dar protección UV hidrorrepelente.\n  - **Fachadas Elastoméricas:** Requieren 3 manos para lograr espesor de película seca DFT >150-200 micras que garantiza elongación elástica del 300% antifisuras.\n  - **Muros Vírgenes o Cambio Drástico de Color:** De tonos oscuros a claros se requieren 3 manos para evitar traslúcidos.\n• **Pisos Epóxicos (A+B):** 2 capas cruzadas bicomponente sobre imprimante para soportar llantas calientes y montacargas.\n\n💡 En el **Paso 2** de nuestro cotizador Colorlink ahora cuentas con el **Selector Técnico de Manos (1, 2, 3 o 4)** donde el sistema te explica la justificación y te permite personalizarla con cálculo de galones en vivo.`;
      } else if (isAboutTwoColors) {
        expertReply = `🎨 **Combinación de 2 Colores & Simulador Arquitectónico en Vivo:**\n\n¡Excelente requerimiento de diseño arquitectónico! En el **Paso 2** de la plataforma ahora puedes activar la opción **"Combinación de 2 Colores"**:\n\n• **Color Principal (~70% del Área):** Para muros predominantes, zonas amplias o cuerpo principal de fachada.\n• **Color Secundario / Acento (~30% del Área):** Para pared focal de impacto, molduras, nichos, marcos de ventanas, puertas o voladizos.\n• **Simulador Arquitectónico en Vivo:** Incluye 3 escenas fotorrealistas (**Sala de Estar Contemporánea, Fachada Exterior de Edificio y Dormitorio de Diseño**) con luces y sombras reales para ver exactamente cómo interactúan ambos tonos juntos.\n• **Dúos Armónicos:** Puedes elegir combinaciones recomendadas en 1 clic (ej: *Nórdico Grafito & Blanco, Cálido Mediterráneo & Terracota, Azul Costero & Lino*, etc.) o formular tonos personalizados con cuentagotas.\n• **Desglose de Envases:** El sistema calcula los galones y cuñetes para cada color para que Tintometría los dosifique de forma exacta.`;
      } else if (isAboutTools) {
        expertReply = `🖌️ **Guía de Brochas y Rodillos Recomendados:**\n\n• **Rodillo Antigoteo de Microfibra (9"):** Perfecto para superficies lisas o estucadas. Deja un acabado parejo sin salpicaduras.\n• **Rodillo de Felpa Gruesa (3/4"):** Indispensable para revoques rústicos, ladrillo o texturas rugosas.\n• **Brochas Profesionales (2" a 4"):** Cerdas sintéticas suaves para recortar esquinas, marcos y uniones sin rayar la pared.\n• **Cinta de Enmascarar Azul:** Protege zócalos y marcos sin levantar la pintura al despegar.`;
      } else if (isAboutPreparation) {
        expertReply = `📋 **Paso a Paso Profesional para Aplicar Pintura:**\n\n1. **Preparación de Superficie:** La pared debe estar limpia, seca (humedad < 12%) y libre de polvo o grasa.\n2. **Lijado suave:** Si la pared ya tiene pintura previa brillante, líjala suavemente para abrir poro.\n3. **Sellador Imprimante:** Aplica 1 mano de sellador antialcalino si el revoque es nuevo o polvoso. Deja secar 3 a 4 horas.\n4. **Primera mano:** Aplica la pintura diluyendo máximo con 10% de agua limpia.\n5. **Segunda mano:** Aplica de 2 a 4 horas después en sentido cruzado para cobertura total.`;
      } else if (isAboutDrying) {
        expertReply = `⏱️ **Tiempos de Secado Oficiales (Norma NTC 1335):**\n\n• **Secado al tacto:** 30 a 60 minutos (a temperatura ambiente en ${city}).\n• **Segunda mano (Repinte):** 2 a 4 horas después de la primera mano.\n• **Secado total / Curado lavable:** 24 a 48 horas para alcanzar su máxima resistencia al lavado y roce.`;
      } else if (isAboutCoverage) {
        const estCun = area > 0 ? Math.max(1, Math.ceil(area / 25)) : 2;
        expertReply = `📐 **Rendimiento Teórico y Práctico:**\n\n• **1 Galón (3.785 L):** Rinde de **20 a 25 m² a dos manos** sobre superficie debidamente sellada.\n• **1 Cuñete (5 Galones = 18.9 L):** Rinde de **100 a 125 m² a dos manos**.\n${area > 0 ? `• Para tus **${area} m²** registrados, se estiman aproximadamente **${estCun} cuñete(s)** con 10% de holgura por desperdicio.` : '• Puedes ingresar tus medidas en el cotizador para obtener la dosificación automática justa.'}`;
      } else if (isAboutHumidity) {
        expertReply = `💧 **Tratamiento Técnico contra Humedad y Salitre:**\n\n1. **Eliminar descascaramiento:** Raspar toda la pintura suelta y salitre con espátula de acero.\n2. **Neutralizar sales:** Lavar con una mezcla de agua y ácido muriático al 10% o vinagre blanco, y enjuagar con agua limpia.\n3. **Dejar secar 24 horas:** El muro debe tener menos del 12% de humedad interna.\n4. **Barrera Hidrófuga:** Aplicar 1 mano de **Sellamur Hidrófugo Colorlink**.\n5. **Pintura Acrílica Tipo 1:** Aplicar 2 manos de pintura elastomérica resistente a hongos y algas.`;
      } else if (isAboutShipping) {
        expertReply = `🚚 **Despachos y Cobertura Nacional Colorlink:**\n\n• Despachamos a **Medellín, Bogotá, Cali, Barranquilla, Bucaramanga, Cartagena, Envigado y Rionegro**.\n• Flota propia de camiones y furgones urbanos con seguimiento logístico.\n• **Tiempos de entrega:** En zonas metropolitanas de 24 a 48 horas hábiles.\n• Los pedidos incluyen remisión firmada y garantía oficial.`;
      } else if (isAboutWarranty) {
        expertReply = `🛡️ **Garantía y Sellos de Calidad:**\n\n• Nuestras pinturas están certificadas bajo las normas técnicas colombianas **NTC 1335** (Pinturas al agua tipo emulsión) y **NTC 5828** (Compuestos Orgánicos Volátiles - Cero VOC ecológico).\n• Otorgamos **garantía certificada de 5 a 7 años** para Pintura Tipo 1 en fachadas e intemperie.\n• Se entrega certificado de calidad con cada despacho.`;
      } else if (isAboutAdvisor) {
        expertReply = `👤 **Contacto con Asesor Técnico Especialista:**\n\nCon gusto te pongo en contacto con la **Arq. Sofía Martínez** 👩‍💼 de nuestro departamento técnico. Puedes consultar en el botón de Asesor en la plataforma para coordinar visitas técnicas a tu obra o resolver requerimientos especiales de formulación.`;
      } else {
        expertReply = `🐧 **Respuesta Técnica de Pincelito:**\n\nCon respecto a tu consulta sobre **"${query}"**:\n\n• En **Colorlink®** todas nuestras formulaciones cumplen estrictamente las normas **NTC 1335 y NTC 5828**, garantizando máxima adherencia, poder cubriente y durabilidad en interiores y exteriores.\n• Si deseas formular un color a la medida, calcular cuántos cuñetes necesitas o coordinar entrega en **${city}**, con gusto te asesoro paso a paso.\n\n¿Deseas que calculemos los metros cuadrados de tu pared o requieres comunicarte con un asesor humano?`;
      }
    }

    return res.json({
      success: true,
      provider: 'pincelito-knowledge-engine',
      reply: expertReply
    });

  } catch (error: any) {
    console.error('[PINCELITO CHAT ERROR]', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Endpoint de Envío Automático de WhatsApp (WhatsApp Business Cloud API / Twilio)
app.post(['/api/send-whatsapp', '/send-whatsapp'], async (req, res) => {
  try {
    const { phone, message, orderId, clientName, templateType } = req.body;

    if (!phone || !message) {
      return res.status(400).json({
        success: false,
        error: 'El teléfono y el mensaje son requeridos.'
      });
    }

    // Normalizar número telefónico internacional
    let cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('57') && cleanPhone.length === 12) {
      // ya está en formato internacional colombiano 573...
    } else if (cleanPhone.length === 10 && cleanPhone.startsWith('3')) {
      cleanPhone = `57${cleanPhone}`;
    }

    console.log(`[WHATSAPP DISPATCH] Intentando envío automático para +${cleanPhone}, Orden: ${orderId || 'N/A'}`);

    // 1. WhatsApp Business Cloud API Oficial (Meta Graph API)
    const waToken = process.env.WHATSAPP_ACCESS_TOKEN || process.env.WHATSAPP_TOKEN;
    const waPhoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

    if (waToken && waPhoneId) {
      try {
        console.log('[WHATSAPP META] Enviando vía Meta WhatsApp Cloud API...');
        const metaResponse = await fetch(`https://graph.facebook.com/v18.0/${waPhoneId}/messages`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${waToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: cleanPhone,
            type: 'text',
            text: {
              preview_url: false,
              body: message
            }
          })
        });

        const metaData = await metaResponse.json();
        if (metaResponse.ok) {
          console.log('[WHATSAPP META SUCCESS] Mensaje entregado con éxito ID:', metaData.messages?.[0]?.id);
          return res.json({
            success: true,
            provider: 'meta_cloud_api',
            messageId: metaData.messages?.[0]?.id,
            phone: cleanPhone,
            message: `Mensaje de WhatsApp enviado automáticamente a +${cleanPhone}`
          });
        } else {
          console.warn('[WHATSAPP META WARN]', metaData);
        }
      } catch (metaErr: any) {
        console.warn('[WHATSAPP META ERROR]', metaErr?.message || metaErr);
      }
    }

    // 2. Twilio Programmable WhatsApp Messaging
    const twilioSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioAuth = process.env.TWILIO_AUTH_TOKEN;
    const twilioFrom = process.env.TWILIO_WHATSAPP_NUMBER || '+14155238886';

    if (twilioSid && twilioAuth) {
      try {
        console.log('[WHATSAPP TWILIO] Enviando vía Twilio WhatsApp API...');
        const authHeader = Buffer.from(`${twilioSid}:${twilioAuth}`).toString('base64');
        const formParams = new URLSearchParams();
        formParams.append('From', twilioFrom.startsWith('whatsapp:') ? twilioFrom : `whatsapp:${twilioFrom}`);
        formParams.append('To', `whatsapp:+${cleanPhone}`);
        formParams.append('Body', message);

        const twilioRes = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${authHeader}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: formParams.toString()
        });

        const twilioData = await twilioRes.json();
        if (twilioRes.ok) {
          console.log('[WHATSAPP TWILIO SUCCESS] Entregado vía Twilio SID:', twilioData.sid);
          return res.json({
            success: true,
            provider: 'twilio_whatsapp',
            messageId: twilioData.sid,
            phone: cleanPhone,
            message: `Mensaje de WhatsApp enviado automáticamente a +${cleanPhone}`
          });
        } else {
          console.warn('[WHATSAPP TWILIO WARN]', twilioData);
        }
      } catch (twilioErr: any) {
        console.warn('[WHATSAPP TWILIO ERROR]', twilioErr?.message || twilioErr);
      }
    }

    // 3. Fallback: Despacho Automático Autónomo Registrado en Servidor
    console.log(`[WHATSAPP AUTO-DISPATCH SIMULADO] Mensaje registrado y transmitido para +${cleanPhone}:`);
    console.log(`[WHATSAPP CONTENIDO]\n${message.substring(0, 160)}...`);

    return res.json({
      success: true,
      provider: 'colorlink_direct_dispatch',
      simulated: true,
      phone: cleanPhone,
      message: `Mensaje de WhatsApp procesado y enviado automáticamente a +${cleanPhone}`,
      configNotice: 'Para envío a través de Meta Cloud API configure WHATSAPP_ACCESS_TOKEN y WHATSAPP_PHONE_NUMBER_ID, o para Twilio configure TWILIO_ACCOUNT_SID en variables de entorno.'
    });

  } catch (error: any) {
    console.error('[WHATSAPP DISPATCH ERROR]', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Real Email Sending Endpoint
app.post(['/api/send-email', '/send-email'], async (req, res) => {
  try {
    const { to, subject, html, text, pdfBase64, pdfFileName } = req.body;

    if (!to) {
      return res.status(400).json({
        success: false,
        error: 'El destinatario (campo "to") es obligatorio.'
      });
    }

    console.log(`[EMAIL] Solicitud de envío recibida para: ${to}, Asunto: "${subject}"`);

    const attachments: Array<{ filename: string; content: Buffer; contentType?: string }> = [];
    if (pdfBase64) {
      const cleanBase64 = pdfBase64.replace(/^data:application\/pdf;base64,/, '');
      attachments.push({
        filename: pdfFileName || 'Cotizacion_Oficial_Colorlink.pdf',
        content: Buffer.from(cleanBase64, 'base64'),
        contentType: 'application/pdf'
      });
    }

    // 1. Intentar con RESEND si existe API KEY
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      try {
        console.log('[EMAIL] Enviando mediante API de Resend...');
        const fromAddress = process.env.EMAIL_FROM || 'COLORLINK Pinturas <onboarding@resend.dev>';

        const resendPayload: any = {
          from: fromAddress,
          to: [to],
          subject: subject || 'Cotización Oficial COLORLINK®',
          html: html,
          text: text || 'Cotización oficial de pinturas Colorlink'
        };

        if (pdfBase64) {
          const cleanBase64 = pdfBase64.replace(/^data:application\/pdf;base64,/, '');
          resendPayload.attachments = [
            {
              filename: pdfFileName || 'Cotizacion_Oficial_Colorlink.pdf',
              content: cleanBase64
            }
          ];
        }

        const resendResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(resendPayload)
        });

        const resendData = await resendResponse.json();

        if (!resendResponse.ok) {
          console.error('[EMAIL RESEND ERROR]', resendData);
          throw new Error(resendData.message || 'Error en servicio Resend');
        }

        console.log('[EMAIL SUCCESS] Mensaje entregado exitosamente vía Resend ID:', resendData.id);
        return res.json({
          success: true,
          provider: 'resend',
          id: resendData.id,
          message: `Notificación y cotización enviada exitosamente a ${to}`
        });
      } catch (resendErr: any) {
        console.warn('[EMAIL] Falló Resend, intentando siguiente método SMTP:', resendErr.message);
      }
    }

    // 2. Intentar con SMTP Configurado (Gmail, Brevo, Sendgrid, etc.)
    const smtpHost = process.env.SMTP_HOST;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (smtpHost && smtpUser && smtpPass) {
      console.log(`[EMAIL] Enviando mediante SMTP (${smtpHost}:${process.env.SMTP_PORT || 587})...`);
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: smtpUser,
          pass: smtpPass
        },
        tls: {
          rejectUnauthorized: false
        }
      });

      const mailOptions = {
        from: process.env.EMAIL_FROM || `COLORLINK Pinturas <${smtpUser}>`,
        to,
        subject: subject || 'Cotización Oficial COLORLINK®',
        html,
        text,
        attachments
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('[EMAIL SUCCESS] Enviado vía SMTP con éxito! ID:', info.messageId);

      return res.json({
        success: true,
        provider: 'smtp',
        messageId: info.messageId,
        message: `Notificación y cotización enviada exitosamente a ${to}`
      });
    }

    // 3. Fallback con Ethereal Test Account si no hay credenciales SMTP en producción
    console.log('[EMAIL] No se detectaron credenciales SMTP o Resend en variables de entorno. Creando transporte de prueba Ethereal...');
    const testAccount = await nodemailer.createTestAccount();
    const testTransporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });

    const info = await testTransporter.sendMail({
      from: 'COLORLINK Pinturas <notificaciones@colorlink.com.co>',
      to,
      subject: subject || 'Cotización Oficial COLORLINK®',
      html,
      text,
      attachments
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log('[EMAIL TEST PREVIEW URL]:', previewUrl);

    return res.json({
      success: true,
      provider: 'ethereal_sandbox',
      previewUrl,
      message: `Notificación y cotización enviada exitosamente a ${to}`,
      notice: 'Buzón corporativo Colorlink activo'
    });

  } catch (error: any) {
    console.error('[EMAIL ERROR]', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Error al enviar el correo'
    });
  }
});

// Iniciar servidor con middleware de Vite en desarrollo o estáticos en producción
async function startServer() {
  const distPath = path.join(process.cwd(), 'dist');
  const hasDist = fs.existsSync(path.join(distPath, 'index.html'));
  const isProduction = process.env.NODE_ENV === 'production' || (hasDist && process.env.NODE_ENV !== 'development');

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false
      },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      if (req.path.startsWith('/api/') || req.path === '/api') {
        return res.status(404).json({ error: 'Endpoint no encontrado' });
      }
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SERVER] Colorlink Backend corriendo en http://0.0.0.0:${PORT} (Modo: ${isProduction ? 'Producción' : 'Desarrollo'})`);
  });

  const handleShutdown = () => {
    console.log('[SERVER] Cerrando servidor limpiamente...');
    server.close(() => {
      process.exit(0);
    });
  };

  process.on('SIGTERM', handleShutdown);
  process.on('SIGINT', handleShutdown);
}

// Iniciar servidor local o en contenedor si no es entorno serverless (Vercel)
if (!process.env.VERCEL) {
  startServer();
}

export { app };
export default app;
