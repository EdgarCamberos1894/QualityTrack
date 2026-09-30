import { cn } from '@/shared/lib/cn'
import type { CustomerRequestStatus } from '../types/customerRequest.types'

interface CustomerRequestFlowStepsProps {
  status: CustomerRequestStatus
}

const steps = ['Solicitud', 'Revisión', 'Cotización', 'Producción', 'Entrega']

function activeStep(status: CustomerRequestStatus): number {
  switch (status) {
    case 'SUBMITTED':
    case 'UNDER_REVIEW':
    case 'WAITING_CUSTOMER_INFO':
      return 1
    case 'READY_FOR_QUOTATION':
      return 2
    case 'IN_PRODUCTION':
      return 3
    case 'CANCELLED':
      return 0
  }
}

export function CustomerRequestFlowSteps({
  status,
}: CustomerRequestFlowStepsProps) {
  const current = activeStep(status)
  const cancelled = status === 'CANCELLED'

  return (
    <section className="rounded-xl border border-slate-200 bg-white px-5 py-4">
      <div className="grid gap-3 sm:grid-cols-5">
        {steps.map((step, index) => {
          const complete = !cancelled && index < current
          const active = !cancelled && index === current

          return (
            <div key={step} className="flex items-center gap-3 sm:block">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[10px] font-semibold',
                    complete && 'border-emerald-700 bg-emerald-700 text-white',
                    active && 'border-blue-600 bg-blue-600 text-white',
                    !complete &&
                      !active &&
                      'border-slate-200 bg-slate-50 text-slate-500',
                    cancelled &&
                      index === 0 &&
                      'border-red-600 bg-red-600 text-white',
                  )}
                >
                  {complete ? '✓' : index + 1}
                </span>
                <span
                  className={cn(
                    'text-[10px] font-medium',
                    active ? 'text-blue-700' : 'text-slate-600',
                  )}
                >
                  {step}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {cancelled ? (
        <p className="mt-3 text-[10px] font-medium text-red-700">
          La solicitud fue cancelada antes de continuar el flujo.
        </p>
      ) : null}
    </section>
  )
}
