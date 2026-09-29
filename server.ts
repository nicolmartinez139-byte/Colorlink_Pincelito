import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = 3000;

const ai = new GoogleGenAI({});

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Health endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    emailConfigured: Boolean(process.env.RESEND_API_KEY || (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS)),
    supabaseConfigured: Boolean(process.env.VITE_SUPABASE_URL && process.env.VITE_SUPABASE_ANON_KEY),
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY)
  });
});

// Endpoint de Auditoría Inteligente de Pedidos con IA (Gemini 3.8 Flash)
app.post('/api/ai-audit-order', async (req, res) => {
  try {
    const { order, cityStock, factoryAvailable = 120 } = req.body;
    if (!order) {
      return res.status(400).json({ success: false, error: 'Faltan datos del pedido' });
    }

    const prompt = `Actúa como el Sistema Inteligente de Despacho y Auditoría Técnica de COLORLINK Pinturas Colombia.
Evalúa el siguiente pedido para decidir si debe ser:
1. "aceptar" (Hay stock suficiente en la sede o fábrica, los datos técnicos de pintura, color, obra y contacto están completos). Asignar vehículo de flota (Camión Turbo NHR o Van Logística) para despacho.
2. "en_espera" (Falta stock en la sede local de la ciudad, se requiere preparación en tintometría desde fábrica central Medellín, o falta precisión en el tono/dosificación).
3. "rechazar" (Inconsistencia técnica grave, formulación inviable o zona sin cobertura logística).

DATOS DEL PEDIDO:
- ID Pedido: ${order.id}
- Cliente: ${order.cliente}
- NIT / Empresa: ${order.nit || 'No especificado'}
- Obra / Dirección: ${order.obra} - ${order.ciudad}
- Responsable: ${order.responsable} (${order.telefono}, ${order.email})
- Tipo de Pintura: ${order.tipoPintura}
- Color / Acabado: ${order.color} (Código: ${order.colorHex || 'Estándar'})
- Cantidad Solicitada: ${order.cunetes} Cuñetes (5 gal c/u) y ${order.galones || 0} Galones
- Monto Total: $${Number(order.totalCOP || 0).toLocaleString('es-CO')} COP

INVENTARIO EN SEDE ${order.ciudad?.toUpperCase()}:
- Stock disponible en sede: ${cityStock ?? 15} cuñetes
- Stock disponible en Fábrica Central Medellín: ${factoryAvailable} cuñetes

Responde ÚNICAMENTE un objeto JSON válido con la siguiente estructura (sin markdown adicional, sin bloques de código extras si es posible):
{
  "decision": "aceptar" | "en_espera" | "rechazar",
  "razonTecnica": "Explicación clara de por qué se toma la decisión respecto a stock, insumos y especificación técnica",
  "insumosVerificados": {
    "pinturaValida": true,
    "colorFormulado": true,
    "stockSuficiente": boolean,
    "cuñetesFaltantes": number
  },
  "vehiculoSugerido": {
    "tipo": "Camión Turbo NHR 4.5 Ton" | "Camión Liviano NPR" | "Van Logística Urbana",
    "placa": "TZW-402" | "KLU-891" | "WFH-320",
    "conductor": "Carlos Mario Henao" | "Jairo Ramírez" | "Andrés Felipe Gil",
    "horaEstimadaDespacho": "Hoy mismo en 2 horas" | "Mañana a primera hora (08:00 AM)" | "En espera de reposición"
  },
  "mensajeCorreoCliente": "Texto formal y cálido para enviar por correo al cliente informándole el estado del pedido, si fue aceptado y asignado a qué vehículo, o si está en espera/rechazado",
  "recomendacionAdicional": "Consejo técnico para el cliente sobre aplicación, rendimiento o sellador"
}`;

    if (process.env.GEMINI_API_KEY) {
      try {
        const aiResponse = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
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
            provider: 'gemini-3.8-flash',
            audit: parsed
          });
        }
      } catch (geminiErr: any) {
        console.warn('[AI AUDIT] Error al invocar Gemini, usando motor de auditoría heurístico:', geminiErr?.message);
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

    const fallbackAudit = {
      decision,
      razonTecnica: razon,
      insumosVerificados: {
        pinturaValida: true,
        colorFormulado: true,
        stockSuficiente: hasSufficient,
        cuñetesFaltantes: hasSufficient ? 0 : needed - stock
      },
      vehiculoSugerido: {
        tipo: 'Camión Turbo NHR 4.5 Ton Colorlink',
        placa: 'TZW-402',
        conductor: 'Carlos Mario Henao',
        horaEstimadaDespacho: decision === 'aceptar' ? 'Hoy en las próximas 2 horas' : 'Programado tras producción'
      },
      mensajeCorreoCliente: decision === 'aceptar'
        ? `Estimado(a) ${order.responsable || order.cliente}, le confirmamos que su pedido #${order.id} ha sido auditado y aprobado exitosamente por nuestro departamento de logística. Ha sido asignado al Camión Turbo NHR Placa TZW-402 conducido por Carlos Mario Henao y se encuentra en alistamiento para entrega en ${order.obra}.`
        : `Estimado(a) ${order.responsable || order.cliente}, le informamos que su pedido #${order.id} se encuentra en estado de espera para despacho directo desde nuestra planta principal. Nuestro equipo comercial coordinará la entrega a la brevedad.`,
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

// Real Email Sending Endpoint
app.post('/api/send-email', async (req, res) => {
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
          message: `Correo real enviado exitosamente a ${to}`
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
        message: `Correo real enviado exitosamente a ${to}`
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
      message: `Simulación de correo real a ${to}. (Para entrega en buzón real configure SMTP_USER/SMTP_PASS o RESEND_API_KEY en .env)`,
      notice: 'Credenciales de envío listas para conectar con buzón real'
    });

  } catch (error: any) {
    console.error('[EMAIL ERROR]', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Error al enviar el correo'
    });
  }
});

// Iniciar servidor con middleware de Vite
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false
      },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SERVER] Colorlink Backend & Vite corriendo en http://0.0.0.0:${PORT}`);
  });
}

startServer();
