import React, { useState } from 'react';
import {
  Camera,
  Upload,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Droplets,
  Layers,
  FileImage,
  RefreshCw,
  Eye,
  Check,
  X
} from 'lucide-react';
import { ProjectFormData } from '../types/form';
import { validatePhotoWithAI } from '../utils/photoAiValidator';

export interface ImageDiagnosisResult {
  imageName: string;
  previewUrl?: string;
  esSuperficieValida: boolean; // Valida si la imagen corresponde a una pared, fachada o superficie a pintar
  sustratoDetectado: 'Concreto / Revoque' | 'Drywall / Yeso' | 'Metal Ferroso' | 'Pintura Existente';
  ambienteDetectado: 'Exterior Intemperie' | 'Interior Seco' | 'Interior Húmedo (Baños/Cocinas)';
  condicionDetectada: 'Fisuras leves y humedad' | 'Descascaramiento severo' | 'Nueva sin pintar' | 'Pintada en buen estado';
  tipoPinturaRecomendado: 'Tipo 1' | 'Tipo 2' | 'Tipo 3';
  patologias: string[];
  nivelSeveridad: 'Baja' | 'Media' | 'Alta (Crítica)';
  resumenDiagnostico: string;
  pasosPreparacion: string[];
  productoRecomendado: string;
  mensajeNoSuperficie?: string;
}

export const SAMPLE_OBRA_IMAGES: Array<{
  id: string;
  name: string;
  title: string;
  description: string;
  thumbnail: string;
  esValida: boolean;
  diagnosis: ImageDiagnosisResult;
}> = [
  {
    id: 'sample-horizonte-fachada',
    name: 'fachada_norte_fisuras_horizonte.jpg',
    title: 'Fachada Exterior con Fisuras (Válida)',
    description: 'Concreto exterior expuesto a intemperie y lluvia torrencial.',
    thumbnail: 'https://images.unsplash.com/photo-1541888946425-d0fbb186156a?w=400&auto=format&fit=crop&q=80',
    esValida: true,
    diagnosis: {
      imageName: 'fachada_norte_fisuras_horizonte.jpg',
      previewUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186156a?w=400&auto=format&fit=crop&q=80',
      esSuperficieValida: true,
      sustratoDetectado: 'Concreto / Revoque',
      ambienteDetectado: 'Exterior Intemperie',
      condicionDetectada: 'Fisuras leves y humedad',
      tipoPinturaRecomendado: 'Tipo 1',
      patologias: [
        'Microfisuras de contracción por secado (ancho 0.2 - 0.4 mm)',
        'Humedad capilar y manchas de escorrentía pluvial',
        'Alcalinidad superficial activa en revoque'
      ],
      nivelSeveridad: 'Media',
      resumenDiagnostico: 'Superficie arquitectónica válida identificada: Fachada exterior con microfisuras superficiales y humedad por lluvia directa. Requiere sistema elastomérico impermeable Tipo 1 capaz de puentear fisuras dinámicas.',
      pasosPreparacion: [
        '1. Lavado a presión con agua y cepillado para eliminar polvo y sales.',
        '2. Aplicación de 1 mano de Sellador Antialcalino Hidrófugo (Sellomax).',
        '3. Sellado elástico de fisuras con Masilla Acrílica Elastomérica.',
        '4. Aplicación de 2 a 3 manos de Pintura Tipo 1 Fachadas 100% Acrílica.'
      ],
      productoRecomendado: 'Colorlink Koraza Pro Fachadas 100% Acrílica (Tipo 1)'
    }
  },
  {
    id: 'sample-muro-interior',
    name: 'muro_interior_descascaramiento.jpg',
    title: 'Muro Interior Descascarado (Válida)',
    description: 'Pared interior con pérdida de adherencia por pintura antigua caleada.',
    thumbnail: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=400&auto=format&fit=crop&q=80',
    esValida: true,
    diagnosis: {
      imageName: 'muro_interior_descascaramiento.jpg',
      previewUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=400&auto=format&fit=crop&q=80',
      esSuperficieValida: true,
      sustratoDetectado: 'Drywall / Yeso',
      ambienteDetectado: 'Interior Seco',
      condicionDetectada: 'Descascaramiento severo',
      tipoPinturaRecomendado: 'Tipo 2',
      patologias: [
        'Desprendimiento de película por mala imprimación previa',
        'Tizado / entizado superficial moderado',
        'Pared seca sin filtración activa'
      ],
      nivelSeveridad: 'Media',
      resumenDiagnostico: 'Superficie arquitectónica válida identificada: Pared interior sin humedad activa pero con desprendimiento de capas previas. Se recomienda raspar zonas sueltas y aplicar pintura lavable Tipo 2.',
      pasosPreparacion: [
        '1. Raspado mecánico con espátula de todas las áreas sueltas.',
        '2. Lijado suave con papel grano 120 para nivelar bordes.',
        '3. Imprimación con Sellador Acrílico de Fijación Viniltex.',
        '4. Aplicación de 2 manos de Viniltex Lavable Interior Tipo 2.'
      ],
      productoRecomendado: 'Colorlink Viniltex Muros Interiores Lavable (Tipo 2)'
    }
  },
  {
    id: 'sample-cielo-raso',
    name: 'cielorraso_manchas_vapor.jpg',
    title: 'Cielorraso con Manchas (Válida)',
    description: 'Cielo raso en panel yeso con pérdida de color y vapor condensado.',
    thumbnail: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&auto=format&fit=crop&q=80',
    esValida: true,
    diagnosis: {
      imageName: 'cielorraso_manchas_vapor.jpg',
      previewUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&auto=format&fit=crop&q=80',
      esSuperficieValida: true,
      sustratoDetectado: 'Drywall / Yeso',
      ambienteDetectado: 'Interior Húmedo (Baños/Cocinas)',
      condicionDetectada: 'Nueva sin pintar',
      tipoPinturaRecomendado: 'Tipo 3',
      patologias: [
        'Superficie de cielorraso no expuesta a fricción ni lavado',
        'Manchas ligeras por vapor de agua condensado',
        'Ausencia de fisuras estructurales'
      ],
      nivelSeveridad: 'Baja',
      resumenDiagnostico: 'Superficie arquitectónica válida identificada: Cielo raso en zona de bajo frote. Es la aplicación idónea para Pintura Tipo 3 Económica con máxima blancura mate antideslumbrante.',
      pasosPreparacion: [
        '1. Limpieza de polvo con paño seco y ventilación del espacio.',
        '2. Sellado de juntas y tornillos con masilla para drywall.',
        '3. Aplicación de 2 manos de Pintura Económica Cielorrasos Tipo 3.'
      ],
      productoRecomendado: 'Colorlink Económica Cielorrasos & Fondeo (Tipo 3)'
    }
  },
  {
    id: 'sample-no-superficie',
    name: 'objeto_no_arquitectonico.jpg',
    title: '⚠️ Foto No Válida (Mascota / Vehículo)',
    description: 'Prueba de rechazo: La IA detecta que la foto no contiene paredes ni superficies.',
    thumbnail: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400&auto=format&fit=crop&q=80',
    esValida: false,
    diagnosis: {
      imageName: 'objeto_no_arquitectonico.jpg',
      previewUrl: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400&auto=format&fit=crop&q=80',
      esSuperficieValida: false,
      sustratoDetectado: 'Concreto / Revoque',
      ambienteDetectado: 'Interior Seco',
      condicionDetectada: 'Pintada en buen estado',
      tipoPinturaRecomendado: 'Tipo 1',
      patologias: ['No se detectaron sustratos de construcción a pintar'],
      nivelSeveridad: 'Baja',
      resumenDiagnostico: 'La imagen analizada NO corresponde a una pared, fachada, cielo raso ni superficie arquitectónica.',
      pasosPreparacion: [],
      productoRecomendado: 'Ninguno aplicable',
      mensajeNoSuperficie: '⚠️ Imagen no válida para diagnóstico de pintura: La inteligencia artificial ha analizado los patrones visuales y determinó que la fotografía NO corresponde a una pared, fachada, cielo raso ni superficie arquitectónica. Se detectaron elementos cotidianos o seres vivos que no corresponden a un proyecto de recubrimientos. Por favor sube una fotografía nítida de la pared o fachada para poder calcular el Tipo de Pintura (Tipo 1, 2 o 3), el número de manos y el desperdicio.'
    }
  }
];

interface ImageDiagnosisWidgetProps {
  onApplyDiagnosis: (data: Partial<ProjectFormData>, diagnosis: ImageDiagnosisResult) => void;
  onClose?: () => void;
  compact?: boolean;
}

export function ImageDiagnosisWidget({
  onApplyDiagnosis,
  onClose,
  compact = false
}: ImageDiagnosisWidgetProps) {
  const [selectedSample, setSelectedSample] = useState<string>('sample-horizonte-fachada');
  const [customImageName, setCustomImageName] = useState<string | null>(null);
  const [customImagePreview, setCustomImagePreview] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [activeDiagnosis, setActiveDiagnosis] = useState<ImageDiagnosisResult | null>(SAMPLE_OBRA_IMAGES[0].diagnosis);
  const [applied, setApplied] = useState<boolean>(false);

  const handleSelectSample = (sampleId: string) => {
    setSelectedSample(sampleId);
    setCustomImageName(null);
    setCustomImagePreview(null);
    const sample = SAMPLE_OBRA_IMAGES.find((s) => s.id === sampleId);
    if (sample) {
      runDiagnosisSimulation(sample.diagnosis);
    }
  };

  const handleCustomFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    setApplied(false);
    setCustomImageName(file.name);
    setSelectedSample('');

    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataUrl = ev.target?.result as string;
      setCustomImagePreview(dataUrl);

      const aiRes = await validatePhotoWithAI({
        photoName: file.name,
        previewUrl: dataUrl,
        isOfficialSample: false
      });

      if (!aiRes.valid) {
        const rejectedDiag: ImageDiagnosisResult = {
          imageName: file.name,
          previewUrl: dataUrl,
          esSuperficieValida: false,
          sustratoDetectado: 'Concreto / Revoque',
          ambienteDetectado: 'Interior Seco',
          condicionDetectada: 'Pintada en buen estado',
          tipoPinturaRecomendado: 'Tipo 1',
          patologias: [`Objeto detectado: ${aiRes.detectedObject || 'No es superficie arquitectónica'}`],
          nivelSeveridad: 'Baja',
          resumenDiagnostico: `La imagen "${file.name}" (${aiRes.detectedObject}) fue RECHAZADA por la IA porque NO corresponde a una fachada, pared ni superficie para pintar.`,
          pasosPreparacion: [],
          productoRecomendado: 'No aplicable (Foto rechazada)',
          mensajeNoSuperficie: `⚠️ Imagen rechazada por Visión Artificial: La IA detectó "${aiRes.detectedObject}". ${
            aiRes.rejectionReason ||
            'Solo se aceptan fotografías de fachadas, paredes, muros, cielorrasos o cosas para pintar, no fotos de personas, mascotas, vehículos ni objetos aleatorios.'
          }`
        };
        setActiveDiagnosis(rejectedDiag);
        setIsScanning(false);
        return;
      }

      const validDiag: ImageDiagnosisResult = {
        imageName: file.name,
        previewUrl: dataUrl,
        esSuperficieValida: true,
        sustratoDetectado: (aiRes.sustrato as any) || 'Concreto / Revoque',
        ambienteDetectado: aiRes.ambienteDetectado || 'Exterior Intemperie',
        condicionDetectada: aiRes.condicionDetectada || 'Fisuras leves y humedad',
        tipoPinturaRecomendado: aiRes.tipoPinturaRecomendado || 'Tipo 1',
        patologias: [aiRes.condicion || 'Superficie arquitectónica verificada para recubrimiento'],
        nivelSeveridad: 'Media',
        resumenDiagnostico: `Superficie aprobada por IA (${aiRes.detectedObject}): ${aiRes.condicion}.`,
        pasosPreparacion: [
          '1. Limpieza de polvo, grasa y partículas sueltas de la superficie.',
          '2. Imprimación con sellador técnico según el sustrato detectado.',
          `3. Aplicación de 2 a 3 manos de Pintura ${aiRes.tipoPinturaRecomendado || 'Tipo 1'} según Norma NTC 1335.`
        ],
        productoRecomendado: aiRes.recomendacion || 'Colorlink Pro Fachadas & Muros NTC 1335'
      };
      setActiveDiagnosis(validDiag);
      setIsScanning(false);
    };
    reader.readAsDataURL(file);
  };

  const runDiagnosisSimulation = (targetDiagnosis: ImageDiagnosisResult) => {
    setIsScanning(true);
    setApplied(false);
    setTimeout(() => {
      setActiveDiagnosis(targetDiagnosis);
      setIsScanning(false);
    }, 850);
  };

  const handleApplyToForm = () => {
    if (!activeDiagnosis || !activeDiagnosis.esSuperficieValida) return;

    const dataToApply: Partial<ProjectFormData> = {
      superficie: activeDiagnosis.sustratoDetectado,
      ambiente: activeDiagnosis.ambienteDetectado,
      condicion: activeDiagnosis.condicionDetectada,
      tipoPintura: activeDiagnosis.tipoPinturaRecomendado,
      descripcionLibre: activeDiagnosis.resumenDiagnostico,
      fotos: [
        {
          name: activeDiagnosis.imageName,
          size: '2.4 MB',
          previewUrl: activeDiagnosis.previewUrl
        }
      ]
    };

    onApplyDiagnosis(dataToApply, activeDiagnosis);
    setApplied(true);
    setTimeout(() => setApplied(false), 3000);
  };

  return (
    <div className="bg-white rounded-3xl border border-sky-200 shadow-xl overflow-hidden animate-fadeIn">
      {/* HEADER DEL DIAGNÓSTICO IA CON COLORES CLAROS Y LUMINOSOS */}
      <div className="bg-gradient-to-r from-sky-50 via-white to-blue-50 border-b border-sky-100 p-4 sm:p-5 flex items-center justify-between text-slate-900">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold shadow-xs">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm sm:text-base tracking-tight text-slate-900">
                Diagnóstico de Imágenes con IA Colorlink®
              </h3>
              <span className="px-2 py-0.5 bg-sky-100 text-sky-800 border border-sky-200 text-[10px] font-black rounded-md uppercase">
                Visión Artificial
              </span>
            </div>
            <p className="text-xs text-slate-600">
              Analiza tu foto para detectar patologías, sustrato y el Tipo de Pintura requerido (Tipo 1, 2 o 3).
            </p>
          </div>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="p-4 sm:p-6 space-y-6">
        {/* SELECTOR DE IMÁGENES O SUBIR FOTO */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <FileImage className="w-4 h-4 text-sky-600" />
              Selecciona una fotografía de obra para escanear o sube tu propia imagen:
            </label>
            <label className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-bold rounded-xl cursor-pointer border border-sky-200 transition-all">
              <Upload className="w-3.5 h-3.5" />
              <span>Subir Foto de mi Obra</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleCustomFileUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Galería de Ejemplos Rápidos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {SAMPLE_OBRA_IMAGES.map((sample) => (
              <button
                key={sample.id}
                type="button"
                onClick={() => handleSelectSample(sample.id)}
                className={`p-2.5 rounded-2xl border text-left transition-all flex items-center gap-3 cursor-pointer ${
                  selectedSample === sample.id
                    ? sample.esValida
                      ? 'border-sky-500 bg-sky-50/70 ring-2 ring-sky-500/20 shadow-xs'
                      : 'border-rose-500 bg-rose-50/80 ring-2 ring-rose-500/20 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/70'
                }`}
              >
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-200 shrink-0 relative">
                  <img
                    src={sample.thumbnail}
                    alt={sample.title}
                    className="w-full h-full object-cover"
                  />
                  {selectedSample === sample.id && (
                    <div className={`absolute inset-0 flex items-center justify-center ${
                      sample.esValida ? 'bg-sky-500/30' : 'bg-rose-600/40'
                    }`}>
                      {sample.esValida ? (
                        <Check className="w-4 h-4 text-white drop-shadow" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-white drop-shadow" />
                      )}
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-slate-900 block truncate">
                      {sample.title}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 line-clamp-2 leading-snug">
                    {sample.description}
                  </span>
                </div>
              </button>
            ))}
          </div>

          {customImageName && (
            <div className="p-3 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-between text-xs text-indigo-900">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                <span>Foto personalizada cargada: <strong>{customImageName}</strong></span>
              </div>
              <span className="text-[10px] bg-indigo-200/60 px-2 py-0.5 rounded-full font-bold">
                Foto del Usuario
              </span>
            </div>
          )}
        </div>

        {/* PROCESADOR / SCANNER ANIMADO */}
        {isScanning ? (
          <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200 text-center space-y-3 animate-pulse">
            <Sparkles className="w-8 h-8 text-sky-600 mx-auto animate-spin" />
            <h4 className="text-sm font-bold text-slate-900">
              La IA está analizando la imagen de tu fachada...
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Extrayendo textura superficial, fisuras milimétricas, nivel de humedad y determinando si requiere pintura Tipo 1, 2 o 3.
            </p>
          </div>
        ) : activeDiagnosis ? (
          /* RESULTADO DEL DIAGNÓSTICO IA */
          <div className="space-y-4 animate-fadeIn">
            {!activeDiagnosis.esSuperficieValida ? (
              /* ESTADO CUANDO LA IA DETECTA QUE NO ES UNA SUPERFICIE */
              <div className="p-6 rounded-3xl bg-rose-50 border-2 border-rose-300 shadow-sm space-y-4 text-rose-950">
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-rose-100 border border-rose-200 text-rose-700 flex items-center justify-center shrink-0 shadow-xs">
                    <AlertTriangle className="w-6 h-6 text-rose-600" />
                  </div>
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 bg-rose-200 text-rose-900 text-[10px] font-black rounded-md uppercase tracking-wider">
                        Imagen No Válida para Pintura
                      </span>
                      <span className="text-xs text-rose-700 font-semibold">
                        Archivo: {activeDiagnosis.imageName}
                      </span>
                    </div>

                    <h4 className="text-base sm:text-lg font-black text-rose-950 leading-snug">
                      La IA detectó que esta fotografía no corresponde a una superficie arquitectónica
                    </h4>

                    <p className="text-xs text-rose-900 leading-relaxed">
                      {activeDiagnosis.mensajeNoSuperficie ||
                        'El modelo de visión artificial analizó los patrones texturales de la imagen y determinó que NO contiene paredes, fachadas, techos ni sustratos de construcción a recubrir. Se detectaron objetos o elementos ajenos al ámbito constructivo.'}
                    </p>

                    <div className="bg-white/90 p-3.5 rounded-2xl border border-rose-200 text-xs text-slate-700 space-y-1.5">
                      <span className="font-bold text-slate-900 flex items-center gap-1.5">
                        <Check className="w-4 h-4 text-emerald-600" /> ¿Qué fotografías sí son aceptadas por la IA Colorlink?
                      </span>
                      <ul className="text-[11px] text-slate-600 space-y-1 list-disc list-inside">
                        <li>Fachadas exteriores en concreto, ladrillo a la vista o revoque.</li>
                        <li>Paredes interiores de yeso, drywall, estuco o pintura previa.</li>
                        <li>Cielorrasos, placas de concreto, cornisas o techos.</li>
                        <li>Zonas con patologías: fisuras, humedad, descascaramiento o moho.</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Acciones para fotografía no válida */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-rose-200/80">
                  <span className="text-[11px] text-rose-700 font-medium">
                    No se puede asignar un Tipo de Pintura a imágenes que no sean superficies.
                  </span>

                  <button
                    type="button"
                    onClick={() => handleSelectSample('sample-horizonte-fachada')}
                    className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:brightness-110 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                    <span>Cargar Fachada Válida de Ejemplo</span>
                  </button>
                </div>
              </div>
            ) : (
              /* ESTADO CUANDO LA IA DETECTA UNA SUPERFICIE VÁLIDA */
              <>
                {/* Banner de Validación Exitosa */}
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs text-emerald-900">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      <strong>Superficie arquitectónica válida identificada:</strong> La IA reconoció sustrato constructivo apto para recubrimiento.
                    </span>
                  </div>
                  <span className="text-[10px] bg-emerald-200/70 text-emerald-950 font-bold px-2 py-0.5 rounded-full shrink-0">
                    Aprobado por IA
                  </span>
                </div>

                {/* Tarjeta Principal de Clasificación con Colores Claros y Límpidos */}
                <div className="p-5 rounded-3xl bg-gradient-to-br from-sky-50 via-white to-blue-50/70 border-2 border-sky-300 text-slate-900 shadow-xs relative overflow-hidden">
                  <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2.5 py-0.5 bg-sky-600 text-white text-[10px] font-black rounded-md shadow-2xs">
                          RECOMENDACIÓN QUÍMICA
                        </span>
                        <span className="text-xs text-slate-600 font-semibold">
                          Norma Técnica NTC 1335
                        </span>
                      </div>
                      <h4 className="text-xl font-black text-slate-950">
                        Pintura Requerida: <span className="text-sky-700">{activeDiagnosis.tipoPinturaRecomendado}</span>
                      </h4>
                      <p className="text-xs text-slate-700 font-medium mt-0.5">
                        {activeDiagnosis.productoRecomendado}
                      </p>
                    </div>

                    <div className="bg-white px-4 py-2 rounded-2xl border border-sky-200 text-right shrink-0 shadow-2xs">
                      <span className="text-[10px] text-slate-500 block uppercase tracking-wider font-bold">Severidad</span>
                      <span className={`text-xs font-black ${
                        activeDiagnosis.nivelSeveridad.includes('Alta') ? 'text-rose-600' : 'text-amber-700'
                      }`}>
                        {activeDiagnosis.nivelSeveridad}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-sky-100 grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                    <div className="bg-white p-2.5 rounded-xl border border-sky-100 shadow-2xs">
                      <span className="text-[10px] text-slate-500 block font-semibold">Sustrato Detectado:</span>
                      <strong className="text-slate-900 font-bold">{activeDiagnosis.sustratoDetectado}</strong>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-sky-100 shadow-2xs">
                      <span className="text-[10px] text-slate-500 block font-semibold">Exposición / Ambiente:</span>
                      <strong className="text-slate-900 font-bold">{activeDiagnosis.ambienteDetectado}</strong>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-sky-100 shadow-2xs">
                      <span className="text-[10px] text-slate-500 block font-semibold">Condición Principal:</span>
                      <strong className="text-slate-900 font-bold">{activeDiagnosis.condicionDetectada}</strong>
                    </div>
                  </div>
                </div>

                {/* Patologías Detectadas y Pasos Técnicos */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  {/* Patologías */}
                  <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-2">
                    <span className="font-bold text-amber-900 flex items-center gap-1.5 text-xs">
                      <AlertTriangle className="w-4 h-4 text-amber-600" /> Patologías Identificadas por la IA:
                    </span>
                    <ul className="space-y-1.5 text-slate-700">
                      {activeDiagnosis.patologias.map((pat, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                          <span>{pat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Protocolo de Aplicación */}
                  <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-200/80 space-y-2">
                    <span className="font-bold text-sky-950 flex items-center gap-1.5 text-xs">
                      <ShieldCheck className="w-4 h-4 text-sky-600" /> Protocolo de Aplicación Recomendado:
                    </span>
                    <ul className="space-y-1.5 text-slate-700">
                      {activeDiagnosis.pasosPreparacion.map((paso, idx) => (
                        <li key={idx} className="leading-snug">
                          {paso}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* BOTÓN DE ACCIÓN: APLICAR AL FORMULARIO */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <p className="text-[11px] text-slate-500">
                    Al aplicar, se configurarán automáticamente la superficie, el ambiente, la condición y el tipo de pintura correspondiente en tu cotización.
                  </p>

                  <button
                    type="button"
                    onClick={handleApplyToForm}
                    className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-sky-500 via-sky-600 to-blue-600 hover:brightness-110 text-white font-black text-xs rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 shrink-0"
                  >
                    {applied ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-300" />
                        <span>¡Diagnóstico Aplicado al Formulario!</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-amber-300" />
                        <span>Aplicar Diagnóstico Técnico al Formulario</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
