import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  X,
  Camera,
  Image as ImageIcon,
  UserCheck,
  CheckCircle2,
  Phone,
  MessageSquare,
  Building2,
  Paperclip,
  Check,
  ArrowRight,
  ShieldCheck,
  HelpCircle,
  Clock,
  Loader2
} from 'lucide-react';
import { ProjectFormData } from '../types/form';
import { saveAdvisorLead } from '../utils/advisorService';
import { validatePhotoWithAI } from '../utils/photoAiValidator';

interface Message {
  id: string;
  sender: 'pincelito' | 'user' | 'asesor';
  text: string;
  timestamp: string;
  imagePreview?: string;
  actionPayload?: Partial<ProjectFormData>;
  actionLabel?: string;
  options?: string[];
  isAdvisorConnected?: boolean;
}

interface ClientAIAssistantProps {
  currentFormData: ProjectFormData;
  onApplyData: (dataToApply: Partial<ProjectFormData>) => void;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Limpia cualquier expresión LaTeX accidental conservando signos de moneda colombiana ($250.000 COP)
 * y renderiza el texto con formato legible y fluido.
 */
function sanitizeChatMessageText(raw: string): string {
  if (!raw) return '';
  return raw
    // Limpiar bloques $$ ... $$ de ecuaciones LaTeX
    .replace(/\$\$([\s\S]*?)\$\$/g, '$1')
    // Limpiar $inline$ de LaTeX matemático sin borrar signos de peso ($250.000)
    .replace(/\$([a-zA-Z\\][^$]*?)\$/g, '$1')
    // Reemplazos de comandos LaTeX
    .replace(/\\text\{([^}]*)\}/g, '$1')
    .replace(/\\textbf\{([^}]*)\}/g, '$1')
    .replace(/\\mathrm\{([^}]*)\}/g, '$1')
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
    // Eliminar separadores y cabeceras Markdown crudas
    .replace(/^---+$/gm, '')
    .replace(/^#{1,6}\s*/gm, '')
    // Estandarizar viñetas con punto limpio
    .replace(/^\s*[\*\-]\s+/gm, '• ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function renderFormattedChatText(rawText: string) {
  if (!rawText) return null;
  const cleaned = sanitizeChatMessageText(rawText);
  // Dividir por bloques **texto en negrita**
  const parts = cleaned.split(/(\*\*[^*]+\*\*)/g);

  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      const content = part.slice(2, -2);
      return (
        <strong key={idx} className="font-bold">
          {content}
        </strong>
      );
    }
    return <React.Fragment key={idx}>{part}</React.Fragment>;
  });
}

export function ClientAIAssistant({
  currentFormData,
  onApplyData,
  isOpen,
  onClose
}: ClientAIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'pincelito',
      text: '¡Hola! Soy **Pincelito** 🐧🎨, tu asistente y consejero de pinturas Colorlink.\n\nPuedes hacerme preguntas, **enviarme fotos de tus paredes** para diagnosticarlas con visión inteligente, calcular tus metros cuadrados, o pedirme que te comunique directamente con un **asesor humano**.\n\n¿En qué te puedo colaborar hoy?',
      timestamp: 'Ahora',
      options: [
        '📸 Diagnosticar pared enviando foto',
        '📐 ¿Cómo calculo los m² de mi fachada o pared?',
        '💧 Mi pared tiene humedad y pequeñas fisuras',
        '👤 Hablar con un asesor humano',
        '🏢 Cargar ejemplo técnico (Fachada 85 m²)'
      ]
    }
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [attachedImageName, setAttachedImageName] = useState<string>('foto_chat.jpg');
  const [appliedNotice, setAppliedNotice] = useState<string | null>(null);
  const [advisorConnected, setAdvisorConnected] = useState<boolean>(false);
  const [isConnectingAdvisor, setIsConnectingAdvisor] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (isOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isTyping]);

  // Manejar subida de foto
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachedImageName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setAttachedImage(result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Conectar con asesor humano y guardar datos en toda situación
  const handleConnectAdvisor = (userQueryText?: string) => {
    setIsConnectingAdvisor(true);

    const userReqMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: userQueryText || 'Quiero hablar con un asesor humano, por favor.',
      timestamp: 'Ahora'
    };
    setMessages((prev) => [...prev, userReqMsg]);

    const clientName = currentFormData.cliente || currentFormData.responsable || 'Cliente Particular';
    const clientPhone = currentFormData.telefonoResponsable || '+57 321 246 0658';
    const clientCity = currentFormData.ciudad || 'Medellín';
    const clientWork = currentFormData.tipoObra || 'Obra General';
    const clientPaint = currentFormData.tipoPintura || 'Pintura Tipo 1 Exterior NTC 1335';

    // Guardar los datos del lead en el servicio oficial de asesores
    const savedLead = saveAdvisorLead({
      cliente: clientName,
      nit: currentFormData.nitDocumento || 'NIT No Especificado',
      responsable: currentFormData.responsable || clientName,
      telefono: clientPhone,
      email: currentFormData.emailResponsable || 'contacto@cliente.com',
      ciudad: clientCity,
      obra: clientWork,
      consulta: userQueryText || 'Solicitud de atención y asesoría técnica especializada desde chat Pincelito.',
      canal: 'correo',
      estado: 'en_negociacion',
      montoCOP: currentFormData.areaM2 ? currentFormData.areaM2 * 28000 : 1850000,
      requerimientoPintura: clientPaint
    });

    setTimeout(() => {
      setIsConnectingAdvisor(false);
      setAdvisorConnected(true);

      const pincelitoHandoff: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'pincelito',
        text: `¡Con gusto! He guardado tus datos de contacto (**${clientName}** • Tel: **${clientPhone}** en **${clientCity}**) en nuestra base de datos oficial de asesoría técnica. Te comunico de inmediato con la **${savedLead.advisorName}**, especialista asignada a tu zona.`,
        timestamp: 'Ahora'
      };

      const advisorGreeting: Message = {
        id: (Date.now() + 2).toString(),
        sender: 'asesor',
        text: `¡Hola ${clientName}! Qué gusto saludarte, soy la **${savedLead.advisorName}** 👩‍💼 de Colorlink.\n\nHe recibido tus datos y requerimiento para **${clientWork}** en **${clientCity}**.\n\n• **Estado:** Ficha técnica registrada exitosamente (#${savedLead.leadId}).\n• **Siguiente paso:** Te puedo asesorar en este chat, o si lo prefieres, te marco a tu número **${clientPhone}** o coordinamos por correo formal.\n\n¿En qué te puedo asesorar ahora mismo?`,
        timestamp: 'Ahora',
        options: [
          '¿Cuál es el mejor tipo de pintura para mi obra?',
          '¿Tienen stock disponible para entrega inmediata?',
          '¿Hacen visitas técnicas a la obra en mi ciudad?',
          'Volver a consultar con Pincelito 🐧'
        ]
      };

      setMessages((prev) => [...prev, pincelitoHandoff, advisorGreeting]);
    }, 1000);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputQuery.trim();
    if (!query && !attachedImage) return;

    const currentImg = attachedImage;
    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: query || 'Te comparto esta fotografía de la pared para diagnóstico.',
      imagePreview: currentImg || undefined,
      timestamp: 'Ahora'
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setAttachedImage(null);
    setIsTyping(true);

    const lower = (query || '').toLowerCase();

    // Detección estricta: Solo transferir si el usuario solicita explícitamente hablar con un asesor humano
    const isExplicitAdvisorRequest =
      lower === 'asesor' ||
      lower === 'asesor humano' ||
      lower === '👤 hablar con un asesor humano' ||
      ((lower.includes('hablar') || lower.includes('comunicar') || lower.includes('conectar') || lower.includes('transferir')) &&
        (lower.includes('asesor') || lower.includes('humano') || lower.includes('persona')));

    if (isExplicitAdvisorRequest) {
      handleConnectAdvisor(query);
      return;
    }

    // Si ya está conectado el asesor humano
    if (advisorConnected) {
      if (lower.includes('pincelito')) {
        setAdvisorConnected(false);
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            sender: 'pincelito',
            text: '¡Aquí estoy de nuevo contigo! 🐧🎨 ¿Qué más necesitas verificar para tu pedido de pinturas?',
            timestamp: 'Ahora'
          }
        ]);
        setIsTyping(false);
        return;
      }

      // Guardar seguimiento en el lead del asesor
      saveAdvisorLead({
        cliente: currentFormData.cliente || currentFormData.responsable || 'Cliente Particular',
        responsable: currentFormData.responsable || 'Cliente',
        telefono: currentFormData.telefonoResponsable || '+57 321 246 0658',
        email: currentFormData.emailResponsable || 'contacto@cliente.com',
        ciudad: currentFormData.ciudad || 'Medellín',
        obra: currentFormData.tipoObra || 'Obra General',
        consulta: query,
        estado: 'en_negociacion'
      });

      // Consultar al Asesor con TODO el contexto del cliente (Requirement 10)
      const clientName = currentFormData.responsable || currentFormData.cliente || 'Cliente';
      const city = currentFormData.ciudad || 'Medellín';
      const paint = currentFormData.tipoPintura || 'Pintura Tipo 1 Exterior';
      const color = currentFormData.colorAcabado || 'Color Estándar';
      const area = currentFormData.areaM2 || 0;
      const historySummary = messages.slice(-5).map(m => `${m.sender}: ${m.text}`).join('\n');

      try {
        const res = await fetch('/api/pincelito-chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query,
            formData: currentFormData,
            isAdvisorMode: true,
            history: messages.slice(-6).map(m => ({ sender: m.sender, text: m.text })),
            clientContext: {
              nombre: clientName,
              cliente: currentFormData.cliente,
              ciudad: city,
              areaM2: area,
              tipoObra: currentFormData.tipoObra,
              tipoPintura: paint,
              colorAcabado: color,
              superficie: currentFormData.superficie,
              ambiente: currentFormData.ambiente,
              condicion: currentFormData.condicion,
              telefono: currentFormData.telefonoResponsable,
              email: currentFormData.emailResponsable,
              historial: historySummary
            }
          })
        });

        const data = await res.json();
        if (data.success && data.reply) {
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now().toString(),
              sender: 'asesor',
              text: data.reply,
              timestamp: 'Ahora',
              options: [
                'Aplicar datos al formulario',
                '¿Tienen stock disponible para entrega inmediata?',
                'Volver a consultar con Pincelito 🐧'
              ]
            }
          ]);
          setIsTyping(false);
          return;
        }
      } catch (err) {
        console.warn('[Advisor Chat API Fail, using personalized fallback]', err);
      }

      // Respuesta personalizada contextual del Asesor con datos del cliente
      setTimeout(() => {
        let advisorReply = `Hola ${clientName}, con respecto a tu consulta sobre "${query}" para tu proyecto en ${city}:`;

        if (lower.includes('stock') || lower.includes('disponible') || lower.includes('entrega')) {
          advisorReply = `Hola ${clientName}, acabo de verificar directamente en nuestro CEDI de ${city}: tenemos stock de ${paint} (${color}) disponible para cubrir tus ${area > 0 ? `${area} m²` : 'requerimientos'}. Tu pedido puede salir hoy mismo en furgón Colorlink si confirmamos los detalles.`;
        } else if (lower.includes('visita') || lower.includes('obra')) {
          advisorReply = `Estimado ${clientName}, para tu obra en ${city} (${currentFormData.tipoObra || 'proyecto arquitectónico'}), podemos programar una visita técnica a la obra sin costo adicional para evaluar la superficie (${currentFormData.superficie || 'concreto/revoque'}) y asegurar la adherencia de la pintura ${paint}.`;
        } else if (lower.includes('garantia') || lower.includes('años')) {
          advisorReply = `${clientName}, la especificación de ${paint} que seleccionaste cuenta con certificación técnica NTC 1335 y garantía por escrito de 5 a 7 años para ambientes de ${currentFormData.ambiente || 'intemperie'}. Te entregamos el certificado junto con tu remisión de flete.`;
        } else {
          advisorReply = `Hola ${clientName}, revisando los detalles de tu cotización en ${city} (${area > 0 ? `${area} m² de ` : ''}${paint} en tono ${color}): te aconsejo aplicar primero sellador antialcalino sobre la superficie de ${currentFormData.superficie || 'revoque'} para maximizar el rendimiento. ¿Deseas que coordinemos los cuñetes o te marco a tu número ${currentFormData.telefonoResponsable || 'registrado'}?`;
        }

        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            sender: 'asesor',
            text: advisorReply,
            timestamp: 'Ahora',
            options: [
              'Aplicar datos al formulario',
              '¿Tienen stock disponible?',
              'Volver a consultar con Pincelito 🐧'
            ]
          }
        ]);
        setIsTyping(false);
      }, 700);
      return;
    }

    // 0. Si el usuario adjuntó una imagen, validarla con Visión Artificial real (solo fachadas, paredes y cosas para pintar)
    if (currentImg) {
      const imgName = attachedImageName || 'foto_subida.jpg';
      const diagnosis = await validatePhotoWithAI({
        photoName: imgName,
        previewUrl: currentImg,
        isOfficialSample: false,
        currentContext: {
          superficie: currentFormData.superficie,
          ambiente: currentFormData.ambiente,
          tipoPintura: currentFormData.tipoPintura,
          tipoObra: currentFormData.tipoObra
        }
      });

      if (!diagnosis.valid) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            sender: 'pincelito',
            text: `🚫 **Fotografía Rechazada por Visión Artificial**\n\nHe analizado la imagen que enviaste y detecté: **${diagnosis.detectedObject || 'Objeto no arquitectónico'}**.\n\n• **Motivo de rechazo:** ${diagnosis.rejectionReason || 'La imagen no corresponde a una fachada, pared, muro, techo ni superficie arquitectónica para pintar.'}\n• **Regla del sistema:** Solo se aceptan fotos de **fachadas, paredes, muros, cielorrasos o estructuras para pintar**, no fotos de personas, mascotas, vehículos, capturas de pantalla ni objetos cotidianos.\n\nPor favor sube una fotografía real de la fachada o pared que vas a pintar para poder darte el diagnóstico técnico. 🐧🎨`,
            timestamp: 'Ahora',
            options: [
              '📐 ¿Cómo calculo los m² de mi fachada?',
              '🎨 ¿Qué diferencia hay entre Tipo 1, 2 y 3?',
              '👤 Hablar con un asesor humano'
            ]
          }
        ]);
        setIsTyping(false);
        return;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: 'pincelito',
          text: `📸 **Diagnóstico de Imagen Aprobada por Pincelito:**\n\nHe verificado tu fotografía mediante visión artificial y corresponde a una superficie apta para pintar:\n\n• **Elemento identificado:** ${diagnosis.detectedObject || 'Fachada / Pared arquitectónica'}\n• **Sustrato detectado:** ${diagnosis.sustrato || 'Concreto / Revoque arquitectónico'}\n• **Evaluación técnica:** ${diagnosis.condicion || 'Superficie apta con adherencia adecuada para repinte'}\n• **Recomendación Técnica Colorlink:** ${diagnosis.recomendacion || 'Imprimante Sellador Hidrófugo + Pintura Acrílica Tipo 1 / Tipo 2 (NTC 1335)'}\n\n¿Quieres aplicar este diagnóstico técnico y adjuntar esta foto aprobada a tu cotización?`,
          timestamp: 'Ahora',
          actionLabel: 'Aplicar Diagnóstico al Formulario',
          actionPayload: {
            superficie: diagnosis.sustrato || 'Concreto / Revoque',
            ambiente: diagnosis.ambienteDetectado || 'Exterior Intemperie',
            condicion: diagnosis.condicionDetectada || 'Fisuras leves y humedad',
            descripcionLibre: `Diagnóstico con IA Vision Pincelito (${diagnosis.detectedObject}): ${diagnosis.condicion}. ${diagnosis.recomendacion}`
          },
          options: [
            'Aplicar este diagnóstico al formulario',
            '👤 Hablar con un asesor para validar la foto',
            '📐 ¿Cuántos galones necesito?'
          ]
        }
      ]);
      setIsTyping(false);
      return;
    }

    // 1. Caso especial: Cargar ejemplo técnico únicamente si el usuario lo solicita explícitamente
    const isExplicitDemoRequest =
      lower.includes('constructora horizonte') ||
      lower.includes('ejemplo técnico') ||
      lower.includes('cargar ejemplo') ||
      lower === '🏢 cargar ejemplo técnico (fachada 85 m²)' ||
      lower === 'cargar datos de constructora horizonte';

    if (isExplicitDemoRequest) {
      setTimeout(() => {
        const hasExistingClient = Boolean(currentFormData.emailResponsable || currentFormData.nitDocumento);
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            sender: 'pincelito',
            text: '¡Listo! He preparado los parámetros técnicos sugeridos para tu obra (Fachada edificio 85 m², Pintura Tipo 1 Exterior Gris Mate). ¿Deseas aplicar estas especificaciones a tu formulario?',
            timestamp: 'Ahora',
            actionLabel: 'Aplicar especificaciones técnicas (85 m²)',
            actionPayload: {
              ciudad: currentFormData.ciudad || 'Medellín',
              tipoObra: 'Fachada Edificio',
              areaM2: 85,
              superficie: 'Concreto / Revoque',
              ambiente: 'Exterior Intemperie',
              condicion: 'Fisuras leves y humedad',
              colorAcabado: 'Gris (Mate)',
              descripcionLibre: 'Mantenimiento preventivo en fachada de edificio de 5 pisos con fisuras superficiales y humedad de lluvia directa.',
              observaciones: 'Acceso por andamios colgantes certificados de obra.',
              fechaRequerida: '2026-09-24',
              consentimiento: true
            }
          }
        ]);
        setIsTyping(false);
      }, 600);
      return;
    }

    // 3. Consulta al motor inteligente de Pincelito (Responde CUALQUIER pregunta)
    try {
      const res = await fetch('/api/pincelito-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          formData: currentFormData,
          isAdvisorMode: false,
          history: messages.slice(-5).map((m) => ({ sender: m.sender, text: m.text })),
          clientContext: {
            nombre: currentFormData.responsable || currentFormData.cliente,
            cliente: currentFormData.cliente,
            ciudad: currentFormData.ciudad,
            areaM2: currentFormData.areaM2,
            tipoObra: currentFormData.tipoObra,
            tipoPintura: currentFormData.tipoPintura,
            colorAcabado: currentFormData.colorAcabado,
            superficie: currentFormData.superficie,
            ambiente: currentFormData.ambiente,
            condicion: currentFormData.condicion,
            telefono: currentFormData.telefonoResponsable,
            email: currentFormData.emailResponsable
          }
        })
      });

      const data = await res.json();
      if (data.success && data.reply) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            sender: 'pincelito',
            text: data.reply,
            timestamp: 'Ahora',
            options: [
              '📐 ¿Cómo calculo los m² de mi fachada o pared?',
              '🎨 ¿Qué diferencia hay entre Tipo 1, 2 y 3?',
              '👤 Hablar con un asesor humano',
              '🏢 Cargar datos de Constructora Horizonte'
            ]
          }
        ]);
      } else {
        throw new Error('Sin respuesta');
      }
    } catch (err) {
      // Fallback inteligente multi-intención
      const qLower = (query || '').toLowerCase().trim();
      let fallbackText = '';

      if (
        qLower === 'hola' ||
        qLower.startsWith('hola') ||
        qLower.includes('buenos dias') ||
        qLower.includes('buenos días') ||
        qLower.includes('buenas tardes') ||
        qLower.includes('saludos')
      ) {
        fallbackText = `¡Hola! 🐧🎨 Soy **Pincelito**, tu asistente oficial de pinturas Colorlink.\n\nEstoy aquí para resolver cualquier duda que tengas sobre:\n• Tipos de pintura (Tipo 1 Exterior, Tipo 2 Interior, Tipo 3 Cielos).\n• Rendimiento por metro cuadrado y dosificación de cuñetes.\n• Carta de colores y tintometría computarizada.\n• Diagnóstico y corrección de humedades o fisuras.\n\n¿En qué te puedo colaborar hoy?`;
      } else if (qLower.includes('tipo 1') || qLower.includes('tipo 2') || qLower.includes('tipo 3') || qLower.includes('diferencia')) {
        fallbackText = `🎨 **Diferencias Técnicas según Norma NTC 1335:**\n\n• **Tipo 1:** Máxima resistencia a intemperie (+400 ciclos de lavado). Ideal para fachadas, exteriores y zonas de alto tráfico.\n• **Tipo 2:** Interior lavable (+100 ciclos de lavado). Excelente acabado mate o satinado para salas, alcobas y oficinas.\n• **Tipo 3:** Económica para cielorrasos o primeras manos (bajo frote).`;
      } else if (qLower.includes('precio') || qLower.includes('cuanto vale') || qLower.includes('costo') || qLower.includes('cuñete')) {
        fallbackText = `💰 **Precios y Presentaciones Oficiales:**\n\n• **Cuñete (5 Galones / 18.9 L):** Desde $240.000 COP para Tipo 1 y $190.000 COP para Tipo 2.\n• **Galón (3.785 L):** Desde $55.000 a $75.000 COP según formulación.\n• Puedes ingresar el área de tu pared en el cotizador para obtener el presupuesto exacto con flete incluido.`;
      } else if (qLower.includes('secado') || qLower.includes('secar') || qLower.includes('tiempo')) {
        fallbackText = `⏱️ **Tiempos de Secado Recomendados:**\n\n• **Al tacto:** 30 a 60 minutos.\n• **Repinte (segunda mano):** 2 a 4 horas.\n• **Curado total / Lavabilidad:** 24 a 48 horas.`;
      } else if (qLower.includes('color') || qLower.includes('colores') || qLower.includes('acabado') || qLower.includes('mate')) {
        fallbackText = `🌈 **Carta de Colores & Tintometría Computarizada:**\n\n• Disponemos de más de **2,000 tonos formulados** en acabados **Mate** y **Satinado**.\n• Colores populares: Blanco Puro, Gris Cemento, Marfil Cálido, Arena Caribe y Gris Grafito.`;
      } else if (qLower.includes('humedad') || qLower.includes('salitre') || qLower.includes('fisura')) {
        fallbackText = `💧 **Protocolo Técnico contra Humedad:**\n\n1. Raspar pintura suelta y limpiar sales.\n2. Dejar secar el muro (<12% de humedad).\n3. Aplicar 1 mano de **Sellamur Hidrófugo**.\n4. Aplicar 2 manos de **Pintura Acrílica Tipo 1**.`;
      } else {
        fallbackText = `🐧 **Respuesta Técnica de Pincelito:**\n\nCon respecto a tu consulta sobre **"${query}"**:\n\n• En **Colorlink®** todas nuestras pinturas cumplen con las normas técnicas **NTC 1335 y NTC 5828** con pigmentos resistentes a la intemperie y cero VOC ecológico.\n• Para despachos en **${currentFormData.ciudad || 'Colombia'}**, contamos con furgones urbanos con entrega en 24h a 48h hábiles.\n• ¿Deseas que te ayude a calcular los metros cuadrados o prefieres hablar con un asesor técnico?`;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: 'pincelito',
          text: fallbackText,
          timestamp: 'Ahora',
          options: [
            '📐 ¿Cómo calculo los m² de mi fachada o pared?',
            '🎨 ¿Qué diferencia hay entre Tipo 1, 2 y 3?',
            '👤 Hablar con un asesor humano'
          ]
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleApplyPayload = (payload: Partial<ProjectFormData>, label?: string) => {
    onApplyData(payload);
    setAppliedNotice(label || '¡Datos aplicados con éxito al formulario!');
    setTimeout(() => setAppliedNotice(null), 3500);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-x-2 bottom-2 sm:inset-x-auto sm:right-6 sm:bottom-6 z-50 w-auto sm:w-[440px] max-h-[92vh] sm:max-h-[85vh] h-[86vh] sm:h-[640px] flex flex-col bg-white rounded-3xl shadow-2xl border border-sky-200 overflow-hidden animate-fadeIn">
      {/* HEADER DE PINCELITO */}
      <div className="bg-gradient-to-r from-sky-500 via-sky-600 to-blue-700 text-white p-4 sm:p-5 flex items-center justify-between shadow-md relative shrink-0">
        <div className="flex items-center gap-3">
          {/* Avatar de Pincelito */}
          <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center p-1 shadow-inner relative">
            <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
              <ellipse cx="50" cy="58" rx="26" ry="28" fill="#0F172A" />
              <ellipse cx="50" cy="62" rx="17" ry="20" fill="#FFFFFF" />
              <circle cx="43" cy="36" r="3.5" fill="#FFFFFF" />
              <circle cx="57" cy="36" r="3.5" fill="#FFFFFF" />
              <circle cx="44" cy="36" r="2" fill="#0F172A" />
              <circle cx="58" cy="36" r="2" fill="#0F172A" />
              <polygon points="50,40 45,46 55,46" fill="#FB923C" />
              <path d="M32 30 C32 20, 68 18, 70 28 C72 32, 60 34, 48 34 C36 34, 30 33, 32 30 Z" fill="#E11D48" />
              <circle cx="52" cy="18" r="3" fill="#FACC15" />
            </svg>
            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-white" />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm tracking-tight text-white">
                {advisorConnected ? 'Arq. Sofía Martínez (Asesora)' : 'Pincelito 🐧🎨'}
              </span>
              <span className="px-1.5 py-0.2 bg-amber-300 text-slate-900 text-[10px] font-black rounded-md">
                {advisorConnected ? 'En Vivo' : 'IA Colorlink'}
              </span>
            </div>
            <p className="text-[11px] text-blue-100 flex items-center gap-1">
              {advisorConnected ? (
                <span>Asesora técnica de fábrica conectada</span>
              ) : (
                <span>Asistente inteligente & diagnóstico de fotos</span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Botón rápido para cambiar entre Pincelito y Asesor */}
          {!advisorConnected ? (
            <button
              type="button"
              onClick={() => handleConnectAdvisor()}
              disabled={isConnectingAdvisor}
              className="px-2.5 py-1 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
              title="Hablar con un asesor humano"
            >
              <UserCheck className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden sm:inline">Asesor</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setAdvisorConnected(false)}
              className="px-2.5 py-1 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
              title="Volver a Pincelito"
            >
              <span>🐧 Pincelito</span>
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-blue-100 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Cerrar asistente"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* NOTIFICACIÓN FLOTANTE DE APLICACIÓN AL FORMULARIO */}
      {appliedNotice && (
        <div className="bg-emerald-600 text-white text-xs px-4 py-2 font-bold flex items-center justify-between shadow-md shrink-0 animate-fadeIn">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>{appliedNotice}</span>
          </div>
        </div>
      )}

      {/* ÁREA DE MENSAJES */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/70 text-xs">
        {messages.map((msg) => {
          const isPincelito = msg.sender === 'pincelito';
          const isUser = msg.sender === 'user';
          const isAsesor = msg.sender === 'asesor';

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} animate-fadeIn`}
            >
              {/* Etiqueta de remitente */}
              <div className="flex items-center gap-1 mb-1 text-[10px] text-slate-400 font-medium px-1">
                {isPincelito && (
                  <>
                    <span className="text-blue-700 font-bold">Pincelito 🐧</span>
                    <span>• {msg.timestamp}</span>
                  </>
                )}
                {isAsesor && (
                  <>
                    <span className="text-emerald-700 font-bold">Arq. Sofía Martínez (Asesora) 👩‍💼</span>
                    <span>• {msg.timestamp}</span>
                  </>
                )}
                {isUser && (
                  <>
                    <span>Tú • {msg.timestamp}</span>
                  </>
                )}
              </div>

              {/* Burbuja de mensaje */}
              <div
                className={`max-w-[85%] sm:max-w-[80%] rounded-2xl p-3.5 space-y-2 shadow-2xs leading-relaxed ${
                  isUser
                    ? 'bg-blue-600 text-white rounded-br-xs'
                    : isAsesor
                    ? 'bg-emerald-50 text-slate-800 border border-emerald-200 rounded-bl-xs'
                    : 'bg-white text-slate-800 border border-slate-200/90 rounded-bl-xs'
                }`}
              >
                {/* Si incluye vista previa de foto */}
                {msg.imagePreview && (
                  <div className="rounded-xl overflow-hidden border border-white/30 max-h-48 mb-2">
                    <img
                      src={msg.imagePreview}
                      alt="Foto subida"
                      className="w-full h-auto object-cover"
                    />
                  </div>
                )}

                <div className="whitespace-pre-line text-xs font-normal">
                  {renderFormattedChatText(msg.text)}
                </div>

                {/* Botón de acción para aplicar al formulario */}
                {msg.actionPayload && (
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => handleApplyPayload(msg.actionPayload!, msg.actionLabel)}
                      className="w-full py-2 px-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>{msg.actionLabel || 'Aplicar al Formulario'}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Opciones de respuesta rápida sugeridas */}
              {msg.options && msg.options.length > 0 && (
                <div className="mt-2.5 flex flex-wrap gap-1.5 max-w-[90%]">
                  {msg.options.map((opt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        if (opt.includes('foto')) {
                          fileInputRef.current?.click();
                        } else if (opt.includes('asesor') || opt.includes('humano')) {
                          handleConnectAdvisor();
                        } else {
                          handleSendMessage(opt);
                        }
                      }}
                      className="text-[11px] font-semibold py-1.5 px-3 bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 rounded-full transition-all shadow-2xs hover:border-blue-300 cursor-pointer active:scale-95 text-left"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Indicador de escribiendo */}
        {isTyping && (
          <div className="flex items-center gap-2 text-slate-400 text-xs py-1 px-2 animate-fadeIn">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
            <span className="text-[11px] font-medium">
              {advisorConnected ? 'Arq. Sofía está escribiendo...' : 'Pincelito está preparando tu respuesta...'}
            </span>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* VISTA PREVIA DE IMAGEN ADJUNTA ANTES DE ENVIAR */}
      {attachedImage && (
        <div className="p-3 bg-blue-50/80 border-t border-blue-100 flex items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg overflow-hidden border border-blue-200 shrink-0">
              <img src={attachedImage} alt="Adjunto" className="w-full h-full object-cover" />
            </div>
            <div className="text-xs">
              <span className="font-bold text-slate-800 block">Fotografía lista</span>
              <span className="text-[10px] text-blue-600">Pincelito la diagnosticará al enviar</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setAttachedImage(null)}
            className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
            title="Eliminar foto"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* INPUT DEL CHAT CON BOTONES DE FOTO Y ASESOR */}
      <div className="p-3 bg-white border-t border-slate-200 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          {/* Input oculto para cargar fotos */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoSelect}
            className="hidden"
          />

          {/* Botón de cámara/foto */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all border border-slate-200 cursor-pointer shrink-0"
            title="Enviar foto para diagnóstico con IA"
          >
            <Camera className="w-4 h-4" />
          </button>

          {/* Botón de hablar con asesor */}
          {!advisorConnected && (
            <button
              type="button"
              onClick={() => handleConnectAdvisor()}
              className="p-2.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-all border border-slate-200 cursor-pointer shrink-0"
              title="Hablar con un asesor humano"
            >
              <UserCheck className="w-4 h-4" />
            </button>
          )}

          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder={
              advisorConnected
                ? 'Escribe tu mensaje para la Arq. Sofía...'
                : attachedImage
                ? 'Añade una nota o presiona enviar...'
                : 'Pregúntale a Pincelito o escribe tus m²...'
            }
            className="flex-1 px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all font-medium text-slate-900"
          />

          <button
            type="submit"
            disabled={!inputQuery.trim() && !attachedImage}
            className="p-2.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:brightness-110 disabled:opacity-40 text-white rounded-xl shadow-xs transition-all cursor-pointer shrink-0"
            title="Enviar mensaje"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400 px-1">
          <span>Pincelito IA • Colorlink Pinturas</span>
          <button
            type="button"
            onClick={() => handleConnectAdvisor()}
            className="text-sky-600 hover:underline font-semibold cursor-pointer"
          >
            {advisorConnected ? '✓ Asesor conectado' : '¿Prefieres hablar con un asesor? Haz clic aquí'}
          </button>
        </div>
      </div>
    </div>
  );
}
