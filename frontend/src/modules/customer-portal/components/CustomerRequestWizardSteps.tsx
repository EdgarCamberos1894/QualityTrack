import { Card } from '@/shared/components/ui/Card'

const steps = ['Detalles', 'Requisitos y documentos', 'Revisar y enviar']

interface CustomerRequestWizardStepsProps {
  currentStep: number
}

export function CustomerRequestWizardSteps({
  currentStep,
}: CustomerRequestWizardStepsProps) {
  return (
    <Card className="relative mb-3 overflow-hidden border-blue-100 bg-white p-0 shadow-[0_10px_28px_-24px_rgba(15,23,42,0.3)]">
      <div className="grid grid-cols-3 divide-x divide-slate-100">
        {steps.map((label, index) => {
          const completed = index < currentStep
          const active = index === currentStep

          return (
            <div
              key={label}
              className={
                active
                  ? 'relative flex min-w-0 items-center gap-2.5 bg-blue-50/65 px-3 py-2.5'
                  : 'relative flex min-w-0 items-center gap-2.5 bg-white px-3 py-2.5'
              }
            >
              {active ? (
                <div className="absolute inset-x-0 bottom-0 h-[2px] bg-blue-600" />
              ) : completed ? (
                <div className="absolute inset-x-0 bottom-0 h-[2px] bg-emerald-500" />
              ) : null}

              <span
                className={
                  completed
                    ? 'flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100'
                    : active
                      ? 'flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm shadow-blue-200'
                      : 'flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 ring-1 ring-slate-200'
                }
              >
                {completed ? (
                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    className="h-3.5 w-3.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m7 12 3 3 7-7" />
                  </svg>
                ) : (
                  <span className="text-[8px] font-bold">{index + 1}</span>
                )}
              </span>

              <div className="min-w-0">
                <p
                  className={
                    active
                      ? 'text-[7px] font-bold uppercase tracking-[0.1em] text-blue-500'
                      : completed
                        ? 'text-[7px] font-bold uppercase tracking-[0.1em] text-emerald-600'
                        : 'text-[7px] font-bold uppercase tracking-[0.1em] text-slate-400'
                  }
                >
                  Paso {index + 1}
                </p>
                <p
                  className={
                    active
                      ? 'mt-0.5 truncate text-[9px] font-semibold text-blue-800'
                      : completed
                        ? 'mt-0.5 truncate text-[9px] font-semibold text-slate-700'
                        : 'mt-0.5 truncate text-[9px] font-medium text-slate-500'
                  }
                >
                  {label}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
