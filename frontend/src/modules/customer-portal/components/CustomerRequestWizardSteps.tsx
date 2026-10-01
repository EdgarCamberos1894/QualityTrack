import { Fragment } from 'react'
import { Card } from '@/shared/components/ui/Card'

const steps = ['Detalles', 'Requisitos y documentos', 'Revisar y enviar']

interface CustomerRequestWizardStepsProps {
  currentStep: number
}

export function CustomerRequestWizardSteps({
  currentStep,
}: CustomerRequestWizardStepsProps) {
  return (
    <Card className="mb-4 px-5 py-3 shadow-[0_10px_28px_-24px_rgba(15,23,42,0.28)]">
      <div className="flex items-center">
        {steps.map((label, index) => {
          const completed = index < currentStep
          const active = index === currentStep

          return (
            <Fragment key={label}>
              <div className="flex min-w-0 items-center gap-2.5">
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

                <span
                  className={
                    active
                      ? 'truncate text-[10px] font-semibold text-blue-700'
                      : completed
                        ? 'truncate text-[10px] font-medium text-slate-700'
                        : 'truncate text-[10px] font-medium text-slate-500'
                  }
                >
                  {label}
                </span>
              </div>

              {index < steps.length - 1 ? (
                <div
                  className={
                    index < currentStep
                      ? 'mx-4 h-px min-w-8 flex-1 bg-emerald-600'
                      : 'mx-4 h-px min-w-8 flex-1 bg-slate-200'
                  }
                />
              ) : null}
            </Fragment>
          )
        })}
      </div>
    </Card>
  )
}
