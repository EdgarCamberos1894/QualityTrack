const benefits = [
  'Trazabilidad de punta a punta',
  'Control de calidad verificable',
  'Operación conectada por expediente',
]

export function AuthBrandPanel() {
  return (
    <aside className="relative hidden min-h-screen overflow-hidden bg-slate-950 px-12 py-10 text-white lg:flex lg:flex-col lg:justify-between">
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
            className="h-12 w-12"
          />
          <span className="text-xl font-bold tracking-tight">
            Quality<span className="text-blue-500">Track</span>
          </span>
        </div>
      </div>

      <div className="relative max-w-lg">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-300">
          Del proceso al resultado
        </p>
        <h1 className="max-w-md text-4xl font-bold leading-tight tracking-tight">
          Cada etapa deja una huella clara.
        </h1>
        <p className="mt-5 max-w-md text-sm leading-6 text-slate-300">
          QualityTrack conecta solicitudes, cotizaciones, producción, calidad y
          entrega en un mismo recorrido operativo.
        </p>

        <ul className="mt-8 space-y-3">
          {benefits.map((benefit) => (
            <li
              key={benefit}
              className="flex items-center gap-3 text-sm text-slate-200"
            >
              <span
                aria-hidden="true"
                className="h-2 w-2 rounded-full bg-emerald-400"
              />
              {benefit}
            </li>
          ))}
        </ul>
      </div>

      <p className="relative text-xs text-slate-500">
        Control industrial · Expediente 360 · Calidad
      </p>
    </aside>
  )
}
