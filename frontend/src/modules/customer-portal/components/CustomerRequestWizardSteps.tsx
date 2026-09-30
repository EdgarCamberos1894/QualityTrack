import { Card } from '@/shared/components/ui/Card'

const steps = ['Detalles', 'Requisitos y documentos', 'Revisar y enviar']

interface CustomerRequestWizardStepsProps {
  currentStep: number
}

export function CustomerRequestWizardSteps({
  currentStep,
}: CustomerRequestWizardStepsProps) {
  return (
    <Card className="mb-5 px-5 py-4">
      <div className="grid gap-3 md:grid-cols-3">
        {steps.map((label, index) => (
          <div key={label} className="flex items-center gap-3">
            <span
              className={
                index < currentStep
                  ? 'flex h-8 w-8 items-center justify-center rounded-full bg-emerald-700 text-[10px] font-semibold text-white'
                  : index === currentStep
                    ? 'flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-[10px] font-semibold text-white'
                    : 'flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-[10px] font-semibold text-slate-500'
              }
            >
              {index < currentStep ? '✓' : index + 1}
            </span>
            <span
              className={
                index === currentStep
                  ? 'text-[11px] font-semibold text-blue-700'
                  : 'text-[11px] font-medium text-slate-600'
              }
            >
              {label}
            </span>
          </div>
        ))}
      </div>
    </Card>
  )
}
