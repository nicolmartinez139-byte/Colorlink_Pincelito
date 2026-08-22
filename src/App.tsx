import { StandaloneClientForm } from './components/StandaloneClientForm';

export default function App() {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Main Client Experience */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <StandaloneClientForm />
      </main>

      {/* Footer Corporativo para Clientes */}
      <footer className="bg-slate-900 border-t border-slate-800 py-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 space-y-1.5">
          <p className="font-semibold text-slate-300">
            Portal Oficial de Especificación Técnica & Cotizaciones
          </p>
          <p className="text-[11px] text-slate-500">
            Soluciones Arquitectónicas e Industriales • Garantía de Fábrica Pintuco
          </p>
        </div>
      </footer>
    </div>
  );
}
