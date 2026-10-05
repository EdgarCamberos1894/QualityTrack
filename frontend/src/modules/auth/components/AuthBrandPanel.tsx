interface AuthBrandPanelProps {
  immersive?: boolean
}

const traceStages = [
  ['01', 'Solicitud', 'El contexto entra al flujo.'],
  ['04', 'Producción', 'La ruta se convierte en ejecución.'],
  ['05', 'Calidad', 'La evidencia confirma el resultado.'],
  ['06', 'Entrega', 'La historia termina completa.'],
] as const

export function AuthBrandPanel({ immersive = false }: AuthBrandPanelProps) {
  return (
    <aside className="qt-auth-brand-panel hidden min-h-screen px-9 py-8 text-white lg:flex lg:flex-col lg:justify-between xl:px-12 xl:py-10">
      <div className="relative z-10 flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-xl border border-white/[0.09] bg-white/[0.035] shadow-[0_14px_40px_-24px_rgba(56,189,248,0.8)] backdrop-blur-xl">
          <img
            src="/brand/qualitytrack-mark-inverse.svg"
            alt=""
            className="h-8 w-8"
          />
        </span>
        <div>
          <p className="text-[17px] font-semibold tracking-[-0.03em]">
            Quality<span className="text-blue-400">Track</span>
          </p>
          <p className="mt-1 text-[7px] font-bold uppercase tracking-[0.16em] text-slate-600">
            Operación conectada
          </p>
        </div>
      </div>

      <div className="relative z-10 max-w-[520px]">
        <p className="text-[8px] font-bold uppercase tracking-[0.16em] text-cyan-200/70">
          Del recorrido al trabajo diario
        </p>
        <h1
          className={`${
            immersive ? 'max-w-[500px] text-[34px] xl:text-[40px]' : 'max-w-[420px] text-[30px] xl:text-[34px]'
          } mt-3 font-semibold leading-[1.05] tracking-[-0.045em] text-white`}
        >
          La trazabilidad sigue cuando inicia tu sesión.
        </h1>
        <p className="mt-4 max-w-[500px] text-[11px] leading-5 text-slate-400 xl:text-[12px]">
          Entra al mismo hilo que viste en la landing, ahora convertido en
          solicitudes, expedientes, órdenes, calidad y seguimiento operativo.
        </p>

        <div className="mt-7 space-y-4">
          {traceStages.map(([step, title, detail]) => (
            <div key={title} className="qt-auth-trace-step">
              <div className="flex items-baseline gap-3">
                <span className="font-mono text-[7px] text-cyan-300/55">
                  {step}
                </span>
                <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-slate-200">
                  {title}
                </span>
              </div>
              <p className="mt-1 text-[8px] leading-4 text-slate-500">
                {detail}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-10 flex items-center justify-between gap-5 border-t border-white/[0.055] pt-4">
        <div>
          <p className="text-[7px] font-bold uppercase tracking-[0.13em] text-slate-600">
            Estado del hilo
          </p>
          <p className="mt-1 text-[9px] font-semibold text-emerald-300">
            Trazabilidad conectada
          </p>
        </div>
        <span className="h-px flex-1 bg-gradient-to-r from-cyan-300/30 via-blue-400/16 to-transparent" />
        <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_16px_rgba(110,231,183,0.55)]" />
      </div>
    </aside>
  )
}
