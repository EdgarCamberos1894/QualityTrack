const steps = ['Detalles', 'Requisitos y documentos', 'Revisar y enviar']

interface CustomerRequestWizardStepsProps {
  currentStep: number
}

export function CustomerRequestWizardSteps({
  currentStep,
}: CustomerRequestWizardStepsProps) {
  return (
    <div className="mb-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_10px_28px_-24px_rgba(15,23,42,0.28)]">
      <div className="grid md:grid-cols-3">
        {steps.map((label, index) => {
          const completed = index < currentStep
          const active = index === currentStep

          return (
            <div
              key={label}
              className={
                active
                  ? 'relative flex items-center gap-3 border-b-2 border-blue-600 bg-blue-50/65 px-4 py-3 md:border-b-0 md:border-r md:border-slate-200'
                  : 'relative flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0'
              }
            >
              <span
                className={
                  completed
                    ? 'flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[9px] font-bold text-white'
                    : active
                      ? 'flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-[9px] font-bold text-white shadow-sm shadow-blue-200'
                      : 'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-[9px] font-semibold text-slate-500'
                }
              >
                {completed ? '✓' : index + 1}
              </span>

              <div className="min-w-0">
                <p
                  className={
                    active
                      ? 'text-[9px] font-bold uppercase tracking-[0.1em] text-blue-600'
                      : completed
                        ? 'text-[9px] font-bold uppercase tracking-[0.1em] text-emerald-600'
                        : 'text-[9px] font-bold uppercase tracking-[0.1em] text-slate-400'
                  }
                >
                  Paso {index + 1}
                </p>
                <p
                  className={
                    active
                      ? 'mt-0.5 truncate text-[10px] font-semibold text-slate-950'
                      : 'mt-0.5 truncate text-[10px] font-medium text-slate-600'
                  }
                >
                  {label}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
