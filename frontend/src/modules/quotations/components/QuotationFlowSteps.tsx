interface Step {
  number: number
  label: string
  state: 'done' | 'current' | 'pending'
}

const steps: Step[] = [
  { number: 1, label: 'Solicitud', state: 'done' },
  { number: 2, label: 'Revisión', state: 'done' },
  { number: 3, label: 'Cotización', state: 'current' },
  { number: 4, label: 'Producción', state: 'pending' },
  { number: 5, label: 'Entrega', state: 'pending' },
]

export function QuotationFlowSteps() {
  return (
    <section className="overflow-x-auto rounded-xl border border-slate-200 bg-white px-5 py-4">
      <div className="flex min-w-[760px] items-center">
        {steps.map((step, index) => (
          <div
            key={step.label}
            className="flex min-w-0 flex-1 items-center last:flex-none"
          >
            <div className="flex items-center gap-3">
              <span
                className={
                  step.state === 'done'
                    ? 'flex h-7 w-7 items-center justify-center rounded-full bg-green-700 text-[10px] font-semibold text-white'
                    : step.state === 'current'
                      ? 'flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-[10px] font-semibold text-white'
                      : 'flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-[10px] font-semibold text-slate-500'
                }
              >
                {step.state === 'done' ? '✓' : step.number}
              </span>
              <span
                className={
                  step.state === 'current'
                    ? 'text-[11px] font-semibold text-blue-600'
                    : 'text-[11px] font-medium text-slate-700'
                }
              >
                {step.label}
              </span>
            </div>

            {index < steps.length - 1 ? (
              <span
                className={
                  step.state === 'done'
                    ? 'mx-4 h-0.5 flex-1 bg-green-700'
                    : 'mx-4 h-0.5 flex-1 bg-slate-200'
                }
              />
            ) : null}
          </div>
        ))}
      </div>
    </section>
  )
}
