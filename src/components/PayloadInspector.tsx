import { useState } from 'react';
import { ProjectFormData } from '../types/form';
import { calculateTechnicalRequirements } from '../utils/calculator';
import { Code2, Copy, Check, Terminal, ExternalLink } from 'lucide-react';

interface PayloadInspectorProps {
  formData?: ProjectFormData;
}

export function PayloadInspector({ formData }: PayloadInspectorProps) {
  const [copied, setCopied] = useState<boolean>(false);

  const defaultData: ProjectFormData = formData || {
    cliente: 'Constructora Horizonte S.A.S.',
    nitDocumento: '900.854.219-3',
    responsable: 'Arq. Valentina Gómez Restrepo',
    emailResponsable: 'vgomez@constructorahorizonte.com.co',
    telefonoResponsable: '3128456721',
    canalEntrada: 'App Web',
    ciudad: 'Medellín',
    tipoObra: 'Fachada Edificio',
    areaM2: 85,
    fechaRequerida: '2026-09-10',
    superficie: 'Concreto / Revoque',
    ambiente: 'Exterior Intemperie',
    condicion: 'Fisuras leves y humedad',
    colorAcabado: 'Gris Cemento Mate (Ref. Fachada 02)',
    descripcionLibre: 'Mantenimiento preventivo en fachada de 5 pisos con fisuras leves.',
    fotos: [{ name: 'evidencia_fachada_1.jpg', size: '2.4 MB' }],
    observaciones: 'Acceso con andamios colgantes certificados.',
    consentimiento: true
  };

  const technical = calculateTechnicalRequirements(defaultData);

  const payload = {
    metadata: {
      source: 'colorlink_mvp_capture_form',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      transaction_id: 'TRX-2026-8849-MED'
    },
    entidades: {
      cliente: {
        nombre_razon_social: defaultData.cliente,
        documento_nit: defaultData.nitDocumento,
        responsable_contacto: defaultData.responsable,
        canal_entrada: defaultData.canalEntrada
      },
      proyecto: {
        ciudad: defaultData.ciudad,
        tipo_proyecto: defaultData.tipoObra,
        area_m2: defaultData.areaM2,
        fecha_requerida: defaultData.fechaRequerida
      },
      especificacion_tecnica: {
        superficie: defaultData.superficie,
        ambiente: defaultData.ambiente,
        condicion: defaultData.condicion,
        color_acabado: defaultData.colorAcabado
      },
      evidencia: {
        descripcion_libre: defaultData.descripcionLibre,
        fotos: defaultData.fotos.map(f => f.name),
        observaciones: defaultData.observaciones,
        consentimiento_habeas_data: defaultData.consentimiento
      }
    },
    motor_calculo_determinista: {
      producto_recomendado: technical.productoRecomendado,
      tipo_solucion: technical.tipoSolucion,
      imprimante_preparacion: technical.selladorImprimanteRequerido,
      manos_requeridas: technical.manosSugeridas,
      rendimiento_m2_galon: technical.rendimientoTeoricoM2Galon,
      galones_totales_con_desperdicio: technical.galonesRequeridos,
      cuñetes_5gal: technical.cuñetesRequeridos,
      requiere_human_in_the_loop: technical.requiereVisitaEspecialista,
      alerta_patologia: technical.alertaPatologia
    }
  };

  const jsonString = JSON.stringify(payload, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="payload-inspector-view" className="space-y-6">
      <div className="bg-white text-slate-800 p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 text-sky-700 text-xs font-semibold uppercase mb-2 border border-sky-200">
              <Terminal className="w-3.5 h-3.5 text-sky-600" />
              Payload JSON Normalizado
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Estructura de Salida para Integración API</h2>
            <p className="text-slate-600 text-sm mt-1 max-w-2xl">
              Este payload JSON se transmite a FastAPI / Activepieces / n8n para alimentar la base de datos Supabase PostgreSQL y disparar el cálculo de cotización.
            </p>
          </div>
          <button
            onClick={handleCopy}
            className="px-4 py-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:brightness-110 active:scale-95 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center gap-2 shrink-0 cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
            {copied ? '¡Copiado al Portapapeles!' : 'Copiar Payload JSON'}
          </button>
        </div>
      </div>

      <div className="bg-zinc-900 rounded-2xl border border-zinc-700/80 p-4 font-mono text-xs text-zinc-200 overflow-x-auto shadow-inner">
        <pre>{jsonString}</pre>
      </div>
    </div>
  );
}
