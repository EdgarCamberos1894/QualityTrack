import { cn } from '@/shared/lib/cn'
import type { CustomerRequestStatus } from '../types/customerRequest.types'

interface CustomerRequestFlowStepsProps {
  status: CustomerRequestStatus
  deliveryProgress?: 'IN_TRANSIT' | 'PARTIAL' | 'DELIVERED'
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
    case 'COMPLETED':
      return 4
    case 'CANCELLED':
      return 0
  }
}

export function CustomerRequestFlowSteps({
  status,
  deliveryProgress,
}: CustomerRequestFlowStepsProps) {
  const current = deliveryProgress ? 4 : activeStep(status)
  const cancelled = status === 'CANCELLED'
  const currentLabel = cancelled ? 'Cancelada' : steps[current]

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_12px_34px_-30px_rgba(15,23,42,0.35)]">
      <div className="flex flex-col gap-2 border-b border-slate-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">
            Progreso del trabajo
          </p>
          <p className="mt-0.5 text-[11px] font-semibold text-slate-950">
            Seguimiento de la solicitud
          </p>
        </div>

        <div className="inline-flex w-fit items-center gap-1.5 rounded-full bg-slate-50 px-2.5 py-1 text-[8px] font-semibold text-slate-600 ring-1 ring-slate-200">
          <span
            className={cn(
              'h-1.5 w-1.5 rounded-full',
              cancelled ? 'bg-red-500' : 'bg-blue-500',
            )}
          />
          Etapa actual · {currentLabel}
        </div>
      </div>

      <div className="overflow-x-auto px-4 py-3.5">
        <div className="flex min-w-[560px] items-start">
          {steps.map((step, index) => {
            const deliveryComplete =
              index === 4 && deliveryProgress === 'DELIVERED'
            const complete = !cancelled && (index < current || deliveryComplete)
            const active = !cancelled && index === current && !deliveryComplete
            const cancelledStep = cancelled && index === 0

            return (
              <div key={step} className="flex min-w-0 flex-1 items-start">
                <div className="min-w-0 shrink-0">
                  <span
                    className={cn(
                      'flex h-6 w-6 items-center justify-center rounded-full border text-[8px] font-bold',
                      complete &&
                        'border-emerald-600 bg-emerald-600 text-white',
                      active && 'border-blue-600 bg-blue-600 text-white',
                      !complete &&
                        !active &&
                        !cancelledStep &&
                        'border-slate-200 bg-slate-50 text-slate-500',
                      cancelledStep &&
                        'border-red-600 bg-red-600 text-white',
                    )}
                  >
                    {complete ? '✓' : index + 1}
                  </span>

                  <p
                    className={cn(
                      'mt-1.5 whitespace-nowrap text-[8px] font-medium',
                      active
                        ? 'font-semibold text-blue-700'
                        : complete
                          ? 'text-slate-700'
                          : cancelledStep
                            ? 'font-semibold text-red-700'
                            : 'text-slate-400',
                    )}
                  >
                    {step}
                  </p>
                </div>

                {index < steps.length - 1 ? (
                  <div
                    className={cn(
                      'mx-2 mt-3 h-px flex-1',
                      !cancelled && index < current
                        ? 'bg-emerald-400'
                        : 'bg-slate-200',
                    )}
                  />
                ) : null}
              </div>
            )
          })}
        </div>

        {cancelled ? (
          <p className="mt-2.5 text-[9px] font-medium text-red-700">
            La solicitud fue cancelada antes de continuar el flujo.
          </p>
        ) : null}
      </div>
    </section>
  )
}
