import React, { useState, useMemo } from 'react';
import { ProjectFormData } from '../types/form';
import { CASE_STUDY_PRESET } from '../data/dictionaryData';
import { calculateTechnicalRequirements, formatCOP } from '../utils/calculator';
import { ColorFinishSelector } from './ColorFinishSelector';
import {
  UserCheck,
  Building2,
  FlaskConical,
  Camera,
  CheckCircle,
  AlertTriangle,
  Upload,
  Trash2,
  Calculator,
  Send,
  RotateCcw,
  Sparkles,
  Layers,
  FileCheck,
  Zap,
  Info,
  Truck,
  Receipt,
  Tag
} from 'lucide-react';

interface FormCaptureProps {
  onSuccessSubmit?: (data: ProjectFormData) => void;
}

export function FormCapture({ onSuccessSubmit }: FormCaptureProps) {
  const [formData, setFormData] = useState<ProjectFormData>({
    cliente: '',
    nitDocumento: '',
    responsable: '',
    emailResponsable: '',
    telefonoResponsable: '',
    canalEntrada: 'App Web',
    ciudad: '',
    tipoObra: '' as any,
    areaM2: 0,
    fechaRequerida: '',
    superficie: '' as any,
    ambiente: '' as any,
    condicion: '' as any,
    tipoPintura: '' as any,
    colorAcabado: '',
    descripcionLibre: '',
    fotos: [],
    observaciones: '',
    consentimiento: false
  });

  const [activeStep, setActiveStep] = useState<number>(1);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Cálculo técnico instantáneo determinista
  const technicalCalc = useMemo(() => {
    return calculateTechnicalRequirements(formData);
  }, [formData.areaM2, formData.superficie, formData.ambiente, formData.condicion]);

  const handleInputChange = (field: keyof ProjectFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Limpiar error del campo
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleLoadCaseStudy = () => {
    setFormData({
      cliente: CASE_STUDY_PRESET.cliente || '',
      nitDocumento: CASE_STUDY_PRESET.nitDocumento || '',
      responsable: CASE_STUDY_PRESET.responsable || '',
      emailResponsable: CASE_STUDY_PRESET.emailResponsable || '',
      telefonoResponsable: CASE_STUDY_PRESET.telefonoResponsable || '',
      canalEntrada: (CASE_STUDY_PRESET.canalEntrada as any) || 'App Web',
      ciudad: CASE_STUDY_PRESET.ciudad || 'Medellín',
      tipoObra: (CASE_STUDY_PRESET.tipoObra as any) || 'Fachada Edificio',
      areaM2: CASE_STUDY_PRESET.areaM2 || 85,
      fechaRequerida: CASE_STUDY_PRESET.fechaRequerida || '2026-09-10',
      superficie: (CASE_STUDY_PRESET.superficie as any) || 'Concreto / Revoque',
      ambiente: (CASE_STUDY_PRESET.ambiente as any) || 'Exterior Intemperie',
      condicion: (CASE_STUDY_PRESET.condicion as any) || 'Fisuras leves y humedad',
      colorAcabado: CASE_STUDY_PRESET.colorAcabado || 'Gris Cemento Mate',
      descripcionLibre: CASE_STUDY_PRESET.descripcionLibre || '',
      fotos: CASE_STUDY_PRESET.fotos || [{ name: 'evidencia_fachada_fisuras_1.jpg', size: '2.4 MB' }],
      observaciones: CASE_STUDY_PRESET.observaciones || '',
      consentimiento: true
    });
    setErrors({});
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.cliente.trim()) newErrors.cliente = 'El nombre del cliente es obligatorio';
    if (!formData.nitDocumento.trim()) newErrors.nitDocumento = 'El NIT o documento es obligatorio';
    if (!formData.responsable.trim()) newErrors.responsable = 'El nombre del responsable es obligatorio';
    if (!formData.areaM2 || formData.areaM2 <= 0) newErrors.areaM2 = 'El área debe ser mayor a 0 m²';
    if (!formData.fechaRequerida) newErrors.fechaRequerida = 'La fecha requerida es obligatoria';
    if (!formData.colorAcabado.trim()) newErrors.colorAcabado = 'Indique el color o acabado deseado';
    if (!formData.descripcionLibre.trim() || formData.descripcionLibre.length < 15) {
      newErrors.descripcionLibre = 'La descripción debe contener al menos 15 caracteres';
    }
    if (formData.fotos.length === 0) {
      newErrors.fotos = 'Debe adjuntar al menos una fotografía de evidencia';
    }
    if (!formData.consentimiento) {
      newErrors.consentimiento = 'Debe aceptar la política de tratamiento de datos';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setSubmitted(true);
      if (onSuccessSubmit) {
        onSuccessSubmit(formData);
      }
    }
  };

  const handleAddMockPhoto = () => {
    const sampleNames = ['foto_angulo_norte.jpg', 'detalle_sustrato_grieta.png', 'registro_fachada_alta.jpg'];
    const randomName = sampleNames[Math.floor(Math.random() * sampleNames.length)];
    setFormData(prev => ({
      ...prev,
      fotos: [...prev.fotos, { name: randomName, size: '2.1 MB' }]
    }));
    if (errors.fotos) {
      setErrors(prev => {
        const next = { ...prev };
        delete next.fotos;
        return next;
      });
    }
  };

  const handleRemovePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      fotos: prev.fotos.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Columna Izquierda: Formulario Interactivo */}
      <div className="lg:col-span-8 space-y-6">
        {/* Banner de Acción Rápida */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-5 rounded-2xl shadow-sm border border-blue-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/30 text-blue-200 text-xs font-semibold uppercase mb-1">
              <Zap className="w-3.5 h-3.5" /> Caso Práctico Real
            </div>
            <h3 className="font-bold text-base">Formulario de Captura de Solicitudes (MVP)</h3>
            <p className="text-xs text-blue-200">
              Datos mínimos estandarizados para activar cotizaciones y especificación técnica automática.
            </p>
          </div>
          <button
            id="load-case-study-btn"
            type="button"
            onClick={handleLoadCaseStudy}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-medium text-xs rounded-xl shadow transition-all flex items-center gap-1.5 shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Cargar Caso de Clase (Constructora Horizonte)
          </button>
        </div>

        {/* Formulario Principal */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-8">
          {/* MÓDULO 1: IDENTIFICACIÓN */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-700 border border-blue-200">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">1. Identificación del Solicitante</h4>
                  <p className="text-xs text-slate-500">Datos fiscales y canal de origen para enrutamiento comercial</p>
                </div>
              </div>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                Dato Estructurado
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Cliente / Razón Social <span className="text-rose-500">*</span>
                </label>
                <input
                  id="input-cliente"
                  type="text"
                  placeholder="Ej. Constructora Horizonte S.A.S."
                  value={formData.cliente}
                  onChange={(e) => handleInputChange('cliente', e.target.value)}
                  className={`w-full px-3 py-2 text-sm bg-slate-50 border ${
                    errors.cliente ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-200 focus:ring-blue-500'
                  } rounded-xl focus:bg-white focus:outline-none focus:ring-2 transition-all`}
                />
                {errors.cliente && <p className="text-[11px] text-rose-600 mt-1">{errors.cliente}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  NIT / Documento Identidad <span className="text-rose-500">*</span>
                </label>
                <input
                  id="input-nit"
                  type="text"
                  placeholder="Ej. 900.854.219-3"
                  value={formData.nitDocumento}
                  onChange={(e) => handleInputChange('nitDocumento', e.target.value)}
                  className={`w-full px-3 py-2 text-sm bg-slate-50 border ${
                    errors.nitDocumento ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-200 focus:ring-blue-500'
                  } rounded-xl focus:bg-white focus:outline-none focus:ring-2 transition-all`}
                />
                {errors.nitDocumento && <p className="text-[11px] text-rose-600 mt-1">{errors.nitDocumento}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Responsable / Contacto <span className="text-rose-500">*</span>
                </label>
                <input
                  id="input-responsable"
                  type="text"
                  placeholder="Ej. Arq. Valentina Gómez"
                  value={formData.responsable}
                  onChange={(e) => handleInputChange('responsable', e.target.value)}
                  className={`w-full px-3 py-2 text-sm bg-slate-50 border ${
                    errors.responsable ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-200 focus:ring-blue-500'
                  } rounded-xl focus:bg-white focus:outline-none focus:ring-2 transition-all`}
                />
                {errors.responsable && <p className="text-[11px] text-rose-600 mt-1">{errors.responsable}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Teléfono / WhatsApp de Contacto <span className="text-rose-500">*</span>
                </label>
                <input
                  id="input-telefono"
                  type="tel"
                  placeholder="+57 312 456 7890"
                  value={formData.telefonoResponsable}
                  onChange={(e) => handleInputChange('telefonoResponsable', e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Correo Electrónico Corporativo
                </label>
                <input
                  id="input-email"
                  type="email"
                  placeholder="proyectos@empresa.com"
                  value={formData.emailResponsable}
                  onChange={(e) => handleInputChange('emailResponsable', e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>
          </div>

          {/* MÓDULO 2: PROYECTO */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-50 text-purple-700 border border-purple-200">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">2. Parámetros del Proyecto</h4>
                  <p className="text-xs text-slate-500">Ubicación, tipología constructiva, dimensión y fecha requerida</p>
                </div>
              </div>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                Dato Estructurado
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ciudad / Municipio <span className="text-rose-500">*</span>
                </label>
                <select
                  id="select-ciudad"
                  value={formData.ciudad}
                  onChange={(e) => handleInputChange('ciudad', e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                >
                  <option value="">-- Seleccionar Ciudad --</option>
                  <option value="Medellín">Medellín</option>
                  <option value="Bogotá D.C.">Bogotá D.C.</option>
                  <option value="Cali">Cali</option>
                  <option value="Barranquilla">Barranquilla</option>
                  <option value="Cartagena">Cartagena</option>
                  <option value="Bucaramanga">Bucaramanga</option>
                  <option value="Pereira">Pereira</option>
                  <option value="Otra Ciudad">Otra Ciudad</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tipo de Obra <span className="text-rose-500">*</span>
                </label>
                <select
                  id="select-tipo-obra"
                  value={formData.tipoObra}
                  onChange={(e) => handleInputChange('tipoObra', e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                >
                  <option value="">-- Seleccionar Tipo de Obra --</option>
                  <option value="Fachada Edificio">Fachada Edificio Residencial/Comercial</option>
                  <option value="Muros Interiores">Muros Interiores y Vivienda</option>
                  <option value="Pisos Industriales">Pisos Industriales y Parqueaderos</option>
                  <option value="Estructura Metálica">Estructura Metálica / Puentes</option>
                  <option value="Cielorrasos">Cielorrasos y Placas</option>
                  <option value="Institucional / Hospitalario">Institucional / Clínicas</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Área Total a Intervenir (m²) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="input-area"
                    type="number"
                    min="1"
                    step="0.1"
                    placeholder="85.00"
                    value={formData.areaM2 || ''}
                    onChange={(e) => handleInputChange('areaM2', parseFloat(e.target.value) || 0)}
                    className={`w-full px-3 py-2 pr-10 text-sm bg-slate-50 border ${
                      errors.areaM2 ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-200 focus:ring-blue-500'
                    } rounded-xl focus:bg-white focus:outline-none focus:ring-2 transition-all font-mono`}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">m²</span>
                </div>
                {errors.areaM2 && <p className="text-[11px] text-rose-600 mt-1">{errors.areaM2}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Fecha Requerida <span className="text-rose-500">*</span>
                </label>
                <input
                  id="input-fecha"
                  type="date"
                  value={formData.fechaRequerida}
                  onChange={(e) => handleInputChange('fechaRequerida', e.target.value)}
                  className={`w-full px-3 py-2 text-sm bg-slate-50 border ${
                    errors.fechaRequerida ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-200 focus:ring-blue-500'
                  } rounded-xl focus:bg-white focus:outline-none focus:ring-2 transition-all`}
                />
                {errors.fechaRequerida && <p className="text-[11px] text-rose-600 mt-1">{errors.fechaRequerida}</p>}
              </div>
            </div>
          </div>

          {/* MÓDULO 3: TÉCNICO */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
                  <FlaskConical className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">3. Especificación Técnica</h4>
                  <p className="text-xs text-slate-500">Variables críticas de sustrato, exposición, patología y acabado</p>
                </div>
              </div>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                Dato Estructurado
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Superficie / Sustrato <span className="text-rose-500">*</span>
                </label>
                <select
                  id="select-superficie"
                  value={formData.superficie}
                  onChange={(e) => handleInputChange('superficie', e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                >
                  <option value="">-- Seleccionar Superficie --</option>
                  <option value="Concreto / Revoque">Concreto / Revoque / Mampostería</option>
                  <option value="Drywall / Yeso">Drywall / Yeso / Paneles</option>
                  <option value="Metal Ferroso">Metal Ferroso (Hierro, Acero)</option>
                  <option value="Metal Galvanizado / Aluminio">Metal Galvanizado / Aluminio</option>
                  <option value="Madera">Madera natural o procesada</option>
                  <option value="Pintura Existente">Pintura Existente en Sustrato</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ambiente / Nivel de Exposición <span className="text-rose-500">*</span>
                </label>
                <select
                  id="select-ambiente"
                  value={formData.ambiente}
                  onChange={(e) => handleInputChange('ambiente', e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                >
                  <option value="">-- Seleccionar Ambiente --</option>
                  <option value="Exterior Intemperie">Exterior Intemperie (Sol directo, Lluvia)</option>
                  <option value="Interior Seco">Interior Seco (Habitaciones, Oficinas)</option>
                  <option value="Interior Húmedo (Baños/Cocinas)">Interior Húmedo (Baños, Cocinas)</option>
                  <option value="Industrial Severo / Químico">Industrial Severo / Exposición Química</option>
                  <option value="Tráfico Peatonal / Vehicular">Tráfico Peatonal / Vehicular</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Condición del Sustrato <span className="text-rose-500">*</span>
                </label>
                <select
                  id="select-condicion"
                  value={formData.condicion}
                  onChange={(e) => handleInputChange('condicion', e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                >
                  <option value="">-- Seleccionar Condición Actual --</option>
                  <option value="Nueva sin pintar">Nueva sin pintar (Obra blanca)</option>
                  <option value="Pintada en buen estado">Pintada en buen estado (Repinte simple)</option>
                  <option value="Fisuras leves y humedad">Fisuras leves y humedad / filtración</option>
                  <option value="Descascaramiento severo">Descascaramiento severo / Ampollas</option>
                  <option value="Oxidación superficial">Oxidación superficial / Corrosión</option>
                  <option value="Contaminación / Grasa">Contaminación / Grasa / Polvillo</option>
                </select>
              </div>

              {/* Selector Visual de Color & Acabado Normalizado */}
              <div className="col-span-1 md:col-span-2 pt-2 border-t border-slate-100">
                <ColorFinishSelector
                  value={formData.colorAcabado}
                  onChange={(val) => handleInputChange('colorAcabado', val)}
                  error={errors.colorAcabado}
                />
              </div>
            </div>
          </div>

          {/* MÓDULO 4: EVIDENCIA */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">4. Evidencia y Alcance</h4>
                  <p className="text-xs text-slate-500">Descripción cualitativa, registro fotográfico y consentimiento</p>
                </div>
              </div>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                Evidencia & Legal
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Descripción Libre del Requerimiento <span className="text-rose-500">*</span>
              </label>
              <textarea
                id="textarea-descripcion"
                rows={3}
                placeholder="Describa síntomas visibles, accesibilidad o detalles particulares del proyecto..."
                value={formData.descripcionLibre}
                onChange={(e) => handleInputChange('descripcionLibre', e.target.value)}
                className={`w-full px-3 py-2 text-sm bg-slate-50 border ${
                  errors.descripcionLibre ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-200 focus:ring-blue-500'
                } rounded-xl focus:bg-white focus:outline-none focus:ring-2 transition-all resize-none`}
              />
              <div className="flex justify-between text-[11px] text-slate-400 mt-0.5">
                <span>Mínimo 15 caracteres para análisis cualitativo IA</span>
                <span>{formData.descripcionLibre.length}/1000</span>
              </div>
              {errors.descripcionLibre && <p className="text-[11px] text-rose-600">{errors.descripcionLibre}</p>}
            </div>

            {/* Fotografías */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Fotografías de Evidencia <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleAddMockPhoto}
                  className="text-xs text-blue-600 hover:text-blue-800 font-semibold inline-flex items-center gap-1"
                >
                  <Upload className="w-3.5 h-3.5" />
                  + Simular Subir Foto
                </button>
              </div>

              {formData.fotos.length === 0 ? (
                <div
                  onClick={handleAddMockPhoto}
                  className="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-xl p-4 text-center cursor-pointer bg-slate-50 transition-colors"
                >
                  <Camera className="w-8 h-8 text-slate-400 mx-auto mb-1" />
                  <p className="text-xs font-medium text-slate-600">Haga clic o arrastre fotos del estado actual de la superficie</p>
                  <p className="text-[10px] text-slate-400">JPG, PNG o WEBP (Máximo 5 archivos)</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {formData.fotos.map((photo, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                      <div className="flex items-center gap-2 truncate">
                        <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="font-mono text-slate-800 truncate">{photo.name}</span>
                        <span className="text-[10px] text-slate-400 shrink-0">({photo.size})</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(idx)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {errors.fotos && <p className="text-[11px] text-rose-600 mt-1">{errors.fotos}</p>}
            </div>

            {/* Observaciones */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Observaciones / Restricciones Operativas <span className="text-slate-400 font-normal">(Opcional)</span>
              </label>
              <input
                id="input-observaciones"
                type="text"
                placeholder="Ej. Requiere andamios certificados, trabajo nocturno o permisos de copropiedad"
                value={formData.observaciones}
                onChange={(e) => handleInputChange('observaciones', e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>

            {/* Consentimiento */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  id="checkbox-consentimiento"
                  type="checkbox"
                  checked={formData.consentimiento}
                  onChange={(e) => handleInputChange('consentimiento', e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <span className="text-xs text-slate-600 leading-relaxed">
                  Autorizo el tratamiento de mis datos personales conforme a la política de privacidad para la generación de la propuesta técnica y contacto comercial. <span className="text-rose-500">*</span>
                </span>
              </label>
              {errors.consentimiento && <p className="text-[11px] text-rose-600 mt-1 ml-6">{errors.consentimiento}</p>}
            </div>
          </div>

          {/* Botones de Envío */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setFormData({
                  cliente: '',
                  nitDocumento: '',
                  responsable: '',
                  emailResponsable: '',
                  telefonoResponsable: '',
                  canalEntrada: 'App Web',
                  ciudad: 'Medellín',
                  tipoObra: 'Fachada Edificio',
                  areaM2: 0,
                  fechaRequerida: '',
                  superficie: 'Concreto / Revoque',
                  ambiente: 'Exterior Intemperie',
                  condicion: 'Nueva sin pintar',
                  colorAcabado: '',
                  descripcionLibre: '',
                  fotos: [],
                  observaciones: '',
                  consentimiento: false
                });
                setErrors({});
                setSubmitted(false);
              }}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all flex items-center gap-1.5 w-full sm:w-auto justify-center"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Limpiar Formulario
            </button>

            <button
              id="submit-form-btn"
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:brightness-110 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 w-full sm:w-auto cursor-pointer"
            >
              <Send className="w-4 h-4" />
              Validar y Enviar a Automatización
            </button>
          </div>
        </form>
      </div>

      {/* Columna Derecha: Motor Técnico & Validación en Tiempo Real */}
      <div className="lg:col-span-4 space-y-6">
        {/* Card de Estado / Éxito */}
        {submitted ? (
          <div className="bg-emerald-50 border-2 border-emerald-400 p-5 rounded-2xl shadow-sm text-emerald-950">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              <h4 className="font-bold text-sm">Solicitud Validada con Éxito</h4>
            </div>
            <p className="text-xs text-emerald-800 leading-relaxed mb-3">
              Todos los 4 bloques estructurados cumplen las reglas de calidad de datos. Se generó el payload relacional para el backend.
            </p>
            <div className="bg-white/80 p-3 rounded-xl border border-emerald-200 text-[11px] font-mono space-y-1">
              <div><span className="text-slate-500">ID Solicitud:</span> SOL-2026-0889</div>
              <div><span className="text-slate-500">Hash Validación:</span> 9f8a2c1e7d</div>
              <div><span className="text-slate-500">Estado:</span> ENRUTADO_MOTOR_TECNICO</div>
            </div>
          </div>
        ) : null}

        {/* Simulador de Decisión & Motor Técnico */}
        <div className="bg-white text-slate-800 p-5 rounded-3xl shadow-sm border border-slate-200/90 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-sky-50 text-sky-700 rounded-lg">
                <Calculator className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Motor Técnico (Cálculo sin IA)</h4>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200 font-semibold">
              Determinista
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <span className="text-slate-500 block text-[11px] font-medium">Producto Recomendado por Matriz:</span>
              <span className="font-bold text-slate-900 text-sm block mt-0.5">{technicalCalc.productoRecomendado}</span>
              <span className="text-sky-700 text-[11px] block mt-0.5 font-medium">{technicalCalc.tipoSolucion}</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-200 text-center">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Galones Estimados</span>
                <span className="text-lg font-black text-emerald-600">{technicalCalc.galonesRequeridos}</span>
                <span className="text-[10px] text-slate-500 block font-medium">({technicalCalc.manosSugeridas} manos)</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-200 text-center">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Cuñetes (5 Gal)</span>
                <span className="text-lg font-black text-sky-700">{technicalCalc.cuñetesRequeridos}</span>
                <span className="text-[10px] text-slate-500 block font-medium">+ {technicalCalc.galonesRequeridos % 5} gal sueltos</span>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <span className="text-slate-500 block text-[10px] font-bold">Preparación / Imprimante Necesario:</span>
              <span className="text-amber-800 text-xs font-semibold block mt-0.5">
                {technicalCalc.selladorImprimanteRequerido}
              </span>
            </div>

            {technicalCalc.alertaPatologia && (
              <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-2xl text-amber-800 text-[11px] flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>{technicalCalc.alertaPatologia}</span>
              </div>
            )}

            {/* Liquidación Financiera en Tiempo Real - Se revela tras Validar / Emitir */}
            {submitted ? (
              <div className="pt-3 border-t border-slate-200 space-y-2 animate-fadeIn">
                <div className="flex items-center justify-between text-slate-700 font-bold text-[11px]">
                  <span className="flex items-center gap-1"><Receipt className="w-3.5 h-3.5 text-emerald-600" /> Presupuesto Oficial Liquidado:</span>
                  <span className="font-mono text-emerald-600 text-sm font-black">{formatCOP(technicalCalc.presupuesto.totalPresupuesto)}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-200 space-y-1 text-[10px] text-slate-600">
                  <div className="flex justify-between">
                    <span>Subtotal Materiales:</span>
                    <span className="font-mono text-slate-900 font-semibold">{formatCOP(technicalCalc.presupuesto.subtotalMateriales)}</span>
                  </div>
                  {technicalCalc.presupuesto.descuentoPorcentaje > 0 && (
                    <div className="flex justify-between text-emerald-600 font-semibold">
                      <span>Desc. Constructora (-{technicalCalc.presupuesto.descuentoPorcentaje}%):</span>
                      <span className="font-mono">-{formatCOP(technicalCalc.presupuesto.descuentoValor)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Envío / Flete ({formData.ciudad}):</span>
                    <span className="font-mono text-slate-900">{formatCOP(technicalCalc.presupuesto.fleteEnvio)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>IVA (19%):</span>
                    <span className="font-mono text-slate-900">{formatCOP(technicalCalc.presupuesto.ivaValor)}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="pt-2 border-t border-slate-200 text-[10px] text-slate-500 flex items-center gap-1.5 font-medium">
                <Receipt className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                <span>Precios oficiales y liquidación total se mostrarán al emitir cotización.</span>
              </div>
            )}

            {technicalCalc.requiereVisitaEspecialista ? (
              <div className="bg-purple-500/20 border border-purple-500/40 p-2.5 rounded-xl text-purple-200 text-[11px] flex items-center gap-2">
                <Info className="w-4 h-4 text-purple-400 shrink-0" />
                <span>Caso de alta complejidad. Dispara flujo <strong>Human-in-the-loop</strong> (Visita técnica presencial).</span>
              </div>
            ) : (
              <div className="bg-emerald-500/20 border border-emerald-500/40 p-2 rounded-xl text-emerald-300 text-[11px] flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Cotización directa elegible para despacho inmediato.</span>
              </div>
            )}
          </div>
        </div>

        {/* Resumen de los 4 Módulos Capturados */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Estructura Relacional Capturada</h4>
          
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2 rounded-lg bg-sky-50 border border-sky-100">
              <span className="font-semibold text-sky-950">1. Identificación</span>
              <span className="text-sky-700 font-mono text-[11px] truncate max-w-[140px]">
                {formData.cliente || 'Sin asignar'}
              </span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-purple-50 border border-purple-100">
              <span className="font-semibold text-purple-900">2. Proyecto</span>
              <span className="text-purple-700 font-mono text-[11px]">
                {formData.ciudad} • {formData.areaM2} m²
              </span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-amber-50 border border-amber-100">
              <span className="font-semibold text-amber-900">3. Técnico</span>
              <span className="text-amber-700 font-mono text-[11px] truncate max-w-[140px]">
                {formData.superficie.split('/')[0]}
              </span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 border border-emerald-100">
              <span className="font-semibold text-emerald-900">4. Evidencia</span>
              <span className="text-emerald-700 font-mono text-[11px]">
                {formData.fotos.length} foto(s) adjunta(s)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
