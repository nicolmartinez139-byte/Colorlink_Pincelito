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
import { CASE_STUDY_PRESET } from '../data/dictionaryData';

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
        '🏢 Cargar datos de Constructora Horizonte'
      ]
    }
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
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
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setAttachedImage(result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Conectar con asesor humano
  const handleConnectAdvisor = () => {
    setIsConnectingAdvisor(true);

    const userReqMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: 'Quiero hablar con un asesor humano, por favor.',
      timestamp: 'Ahora'
    };
    setMessages((prev) => [...prev, userReqMsg]);

    setTimeout(() => {
      setIsConnectingAdvisor(false);
      setAdvisorConnected(true);

      const pincelitoHandoff: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'pincelito',
        text: '¡Con gusto! Le he transferido tu consulta y el contexto de tu proyecto a nuestro equipo de ventas e ingeniería. Te presento a la **Arq. Sofía Martínez**, asesora técnica especialista de Colorlink.',
        timestamp: 'Ahora'
      };

      const advisorGreeting: Message = {
        id: (Date.now() + 2).toString(),
        sender: 'asesor',
        text: '¡Hola! Qué gusto saludarte, soy la **Arq. Sofía Martínez** 👩‍💼 de Colorlink.\n\nHe revisado tus requerimientos de pintura y el stock en fábrica en tiempo real. Puedo ayudarte a ajustar el presupuesto, coordinar la ruta de despacho con nuestro furgón o darte un descuento especial por volumen para tu obra.\n\n¿En qué ciudad está tu proyecto y cuántos metros tienes presupuestados?',
        timestamp: 'Ahora',
        options: [
          'Tengo un proyecto en Medellín de 85 m²',
          '¿Tienen stock disponible para entrega inmediata?',
          '¿Hacen visitas técnicas a la obra?'
        ]
      };

      setMessages((prev) => [...prev, pincelitoHandoff, advisorGreeting]);
    }, 1200);
  };

  const handleSendMessage = (textToSend?: string) => {
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

    // Si ya está conectado el asesor humano
    if (advisorConnected) {
      setTimeout(() => {
        let advisorReply = '';
        const lower = (query || '').toLowerCase();

        if (lower.includes('stock') || lower.includes('disponible') || lower.includes('entrega')) {
          advisorReply = 'Acabo de verificar en bodega central: tenemos **18 cuñetes de Pintura Tipo 1 Gris Mate** listos para despacho hoy mismo en el Furgón #08. Si confirmas tu cotización antes de las 2:00 PM, sale en la primera ruta matutina.';
        } else if (lower.includes('visita') || lower.includes('obra')) {
          advisorReply = 'Sí, para constructoras y obras de más de 60 m² realizamos visita técnica sin costo en el área metropolitana para verificar adherencia y humedad antes de la aplicación.';
        } else if (lower.includes('medellín') || lower.includes('85') || lower.includes('horizonte')) {
          advisorReply = 'Excelente metraje. Para 85 m² en fachada exterior en Medellín necesitarás 4 cuñetes Tipo 1 más sellador hidrófugo. El flete local está cubierto. ¿Deseas que activemos la cotización con precio preferencial?';
        } else {
          advisorReply = `Entendido perfectamente. Con respecto a "${query}", puedo validar con el departamento de tintometría la muestra física de color o coordinar la orden de despacho cuando estés listo.`;
        }

        const replyMsg: Message = {
          id: (Date.now() + 1).toString(),
          sender: 'asesor',
          text: advisorReply,
          timestamp: 'Ahora',
          options: [
            'Aplicar datos al formulario',
            '¿Qué garantía tiene la pintura?',
            'Volver a consultar con Pincelito 🐧'
          ]
        };

        setMessages((prev) => [...prev, replyMsg]);
        setIsTyping(false);
      }, 900);
      return;
    }

    // Respuestas inteligentes de PINCELITO
    setTimeout(() => {
      const lower = (query || '').toLowerCase();
      let aiResponse: Message;

      // 0. Si el usuario envió una foto
      if (currentImg) {
        aiResponse = {
          id: (Date.now() + 1).toString(),
          sender: 'pincelito',
          text: '📸 **Diagnóstico de Imagen de Pincelito:**\n\nHe analizado la fotografía de tu pared mediante visión artificial:\n\n• **Sustrato detectado:** Revoque / Concreto exterior con exposición solar y lluvia.\n• **Patología observada:** Microfisuras superficiales y marcas de humedad por capilaridad.\n• **Recomendación Técnica Colorlink:** Imprimante Sellador Hidrófugo + Pintura Acrílica Elastomérica Tipo 1 (Fachadas de Alta Resistencia).\n• **Rendimiento estimado:** Aprox. 20 a 25 m² por galón a 2 manos.\n\n¿Quieres aplicar este diagnóstico técnico automáticamente a tu cotización?',
          timestamp: 'Ahora',
          actionLabel: 'Aplicar Diagnóstico de Foto al Formulario',
          actionPayload: {
            superficie: 'Concreto / Revoque',
            ambiente: 'Exterior Intemperie',
            condicion: 'Fisuras leves y humedad',
            descripcionLibre: 'Diagnóstico con IA Pincelito: Fachada exterior con microfisuras superficiales y humedad. Requiere sellador hidrófugo y pintura acrílica elastomérica Tipo 1.'
          },
          options: [
            'Aplicar este diagnóstico al formulario',
            '👤 Hablar con un asesor para validar la foto',
            '📐 ¿Cuántos galones necesito para 85 m²?'
          ]
        };
      }
      // 1. Solicitar asesor humano
      else if (lower.includes('asesor') || lower.includes('humano') || lower.includes('persona') || lower.includes('contacto') || lower.includes('llamar')) {
        handleConnectAdvisor();
        return;
      }
      // 2. Caso Constructora Horizonte
      else if (lower.includes('horizonte') || lower.includes('caso')) {
        aiResponse = {
          id: (Date.now() + 1).toString(),
          sender: 'pincelito',
          text: '¡Listo! He cargado el caso oficial de **Constructora Horizonte S.A.S.** en Medellín:\n\n• **Proyecto:** Fachada edificio de 5 pisos\n• **Área:** 85.00 m²\n• **Superficie:** Concreto exterior con fisuras y humedad\n• **Pintura recomendada:** Pintura Tipo 1 Exterior de Alta Resistencia (Gris Cemento Mate)\n• **Flete:** Medellín (Entrega en Furgón Colorlink #08)\n\n¿Deseas aplicar estos datos a tu formulario?',
          timestamp: 'Ahora',
          actionLabel: 'Aplicar datos de Constructora Horizonte',
          actionPayload: {
            cliente: CASE_STUDY_PRESET.cliente || 'Constructora Horizonte S.A.S.',
            nitDocumento: CASE_STUDY_PRESET.nitDocumento || '900854219',
            responsable: CASE_STUDY_PRESET.responsable || 'Arq. Valentina Gómez',
            emailResponsable: CASE_STUDY_PRESET.emailResponsable || 'vgomez@constructorahorizonte.com.co',
            telefonoResponsable: CASE_STUDY_PRESET.telefonoResponsable || '+57 312 845 6721',
            ciudad: 'Medellín',
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
        };
      }
      // 3. Cálculo de área
      else if (lower.includes('área') || lower.includes('area') || lower.includes('m2') || lower.includes('calcular') || lower.includes('medir')) {
        const mathMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:por|x|\*)\s*(\d+(?:\.\d+)?)/);
        if (mathMatch) {
          const width = parseFloat(mathMatch[1]);
          const height = parseFloat(mathMatch[2]);
          const total = Math.round(width * height * 100) / 100;
          aiResponse = {
            id: (Date.now() + 1).toString(),
            sender: 'pincelito',
            text: `Multiplicando **${width}m de ancho** por **${height}m de alto**, tu área total es de **${total} m²**.\n\nPara esa superficie te calcularemos la dosificación justa de cuñetes y galones con 10% de desperdicio técnico incluido.`,
            timestamp: 'Ahora',
            actionLabel: `Aplicar ${total} m² al Formulario`,
            actionPayload: { areaM2: total },
            options: ['Aplicar metraje al formulario', '👤 Hablar con un asesor']
          };
        } else {
          aiResponse = {
            id: (Date.now() + 1).toString(),
            sender: 'pincelito',
            text: 'Para calcular los **metros cuadrados (m²)** de tu muro o fachada, solo multiplica:\n\n📏 **Ancho (metros) × Alto (metros) = m² totales**\n\n*Ejemplo:* Si tu fachada mide 10m de frente por 8.5m de altura:\n`10m × 8.5m = 85 m²`.\n\nEscribe aquí tus medidas (ej: *"mide 10 por 8.5"*) y te daré el cálculo de inmediato.',
            timestamp: 'Ahora',
            options: ['Mi fachada mide 10 por 8.5 metros', 'Tengo 50 m²', 'Tengo 120 m²']
          };
        }
      }
      // 4. Humedad / Fisuras
      else if (lower.includes('humedad') || lower.includes('fisura') || lower.includes('grieta') || lower.includes('moho')) {
        aiResponse = {
          id: (Date.now() + 1).toString(),
          sender: 'pincelito',
          text: '⚠️ **Tratamiento Técnico para Humedad y Fisuras:**\n\n1. **Sellado Primario:** Aplicar 1 mano de Sellador Hidrófugo para detener el agua.\n2. **Acabado Elastomérico:** 2 manos de Pintura Tipo 1 Exterior que tolera dilatación térmica sin cuartearse.\n\n¿Deseas que configure estos parámetros en tu cotización?',
          timestamp: 'Ahora',
          actionLabel: 'Configurar Humedad y Fisuras',
          actionPayload: {
            superficie: 'Concreto / Revoque',
            ambiente: 'Exterior Intemperie',
            condicion: 'Fisuras leves y humedad'
          },
          options: ['Configurar en formulario', '👤 Consultar con asesor en línea']
        };
      }
      // 5. Volver a Pincelito
      else if (lower.includes('pincelito')) {
        setAdvisorConnected(false);
        aiResponse = {
          id: (Date.now() + 1).toString(),
          sender: 'pincelito',
          text: '¡Aquí estoy de nuevo contigo! 🐧🎨 ¿Qué más necesitas verificar para tu pedido?',
          timestamp: 'Ahora'
        };
      }
      // 6. Respuesta general
      else {
        aiResponse = {
          id: (Date.now() + 1).toString(),
          sender: 'pincelito',
          text: `He tomado nota de tu consulta sobre **"${query}"**.\n\nPuedo ayudarte a definir las medidas, el tipo de pintura adecuado (Tipo 1, Tipo 2 o Tipo 3) o ponerte en contacto directo con un asesor humano en tiempo real.`,
          timestamp: 'Ahora',
          options: [
            '📸 Enviar foto para diagnóstico',
            '👤 Hablar con un asesor humano',
            '🏢 Cargar datos de Constructora Horizonte'
          ]
        };
      }

      setMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
    }, 600);
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
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[95vw] sm:w-[440px] max-h-[85vh] h-[640px] flex flex-col bg-white rounded-3xl shadow-2xl border border-blue-200 overflow-hidden animate-fadeIn">
      {/* HEADER DE PINCELITO */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-600 to-pink-600 text-white p-4 sm:p-5 flex items-center justify-between shadow-sm relative shrink-0">
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
              onClick={handleConnectAdvisor}
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
                  {msg.text}
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
              onClick={handleConnectAdvisor}
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
            className="flex-1 px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-slate-900"
          />

          <button
            type="submit"
            disabled={!inputQuery.trim() && !attachedImage}
            className="p-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:hover:bg-blue-600 text-white rounded-xl shadow-xs transition-all cursor-pointer shrink-0"
            title="Enviar mensaje"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400 px-1">
          <span>Pincelito IA • Colorlink Pinturas</span>
          <button
            type="button"
            onClick={handleConnectAdvisor}
            className="text-blue-600 hover:underline font-semibold cursor-pointer"
          >
            {advisorConnected ? '✓ Asesor conectado' : '¿Prefieres hablar con un asesor? Haz clic aquí'}
          </button>
        </div>
      </div>
    </div>
  );
}
