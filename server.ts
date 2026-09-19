import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Health endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    emailConfigured: Boolean(process.env.RESEND_API_KEY || (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS)),
    supabaseConfigured: Boolean(process.env.VITE_SUPABASE_URL && process.env.VITE_SUPABASE_ANON_KEY)
  });
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
      server: { middlewareMode: true },
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
