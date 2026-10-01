const benefits = [
  'Trazabilidad de punta a punta',
  'Control de calidad verificable',
  'Operación conectada por expediente',
]

export function AuthBrandPanel() {
  return (
    <aside className="relative hidden min-h-screen overflow-hidden bg-slate-950 px-9 py-8 text-white lg:flex lg:flex-col lg:justify-between xl:px-11">
      <div
        aria-hidden="true"
        className="absolute -right-28 -top-28 h-80 w-80 rounded-full bg-blue-600/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl"
      />

      <div className="relative">
        <div className="flex items-center gap-3">
          <img
            src="/brand/qualitytrack-mark-inverse.svg"
            alt=""
            className="h-9 w-9"
          />
          <span className="text-lg font-bold tracking-tight">
            Quality<span className="text-blue-500">Track</span>
          </span>
        </div>
      </div>

      <div className="relative max-w-md">
        <p className="mb-3 text-[9px] font-bold uppercase tracking-[0.16em] text-blue-300">
          Del proceso al resultado
        </p>
        <h1 className="max-w-sm text-[30px] font-bold leading-[1.15] tracking-tight">
          Cada etapa deja una huella clara.
        </h1>
        <p className="mt-4 max-w-sm text-[11px] leading-5 text-slate-300">
          QualityTrack conecta solicitudes, cotizaciones, producción, calidad y
          entrega en un mismo recorrido operativo.
        </p>

        <ul className="mt-6 space-y-2.5">
          {benefits.map((benefit) => (
            <li
              key={benefit}
              className="flex items-center gap-2.5 text-[10px] text-slate-200"
            >
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rounded-full bg-blue-400"
              />
              {benefit}
            </li>
          ))}
        </ul>
      </div>

      <p className="relative text-[9px] text-slate-500">
        Control industrial · Expediente 360 · Calidad
      </p>
    </aside>
  )
}
