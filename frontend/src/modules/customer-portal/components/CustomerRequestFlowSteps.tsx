import { cn } from '@/shared/lib/cn'
import type { CustomerRequestStatus } from '../types/customerRequest.types'

interface CustomerRequestFlowStepsProps {
  status: CustomerRequestStatus
  deliveryProgress?: 'IN_TRANSIT' | 'PARTIAL' | 'DELIVERED'
  variant?: 'light' | 'dark'
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
  variant = 'light',
}: CustomerRequestFlowStepsProps) {
  const current = deliveryProgress ? 4 : activeStep(status)
  const cancelled = status === 'CANCELLED'
  const currentLabel = cancelled ? 'Cancelada' : steps[current]
  const dark = variant === 'dark'

  return (
    <section
      className={cn(
        dark
          ? 'mt-5 border-t border-white/10 pt-4'
          : 'overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_12px_34px_-30px_rgba(15,23,42,0.35)]',
      )}
    >
      <div
        className={cn(
          'flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between',
          !dark && 'border-b border-slate-100 px-4 py-3',
        )}
      >
        <div>
          <p
            className={cn(
              'text-[8px] font-bold uppercase tracking-[0.12em]',
              dark ? 'text-blue-300' : 'text-blue-600',
            )}
          >
            Progreso del trabajo
          </p>
          <p
            className={cn(
              'mt-0.5 text-[10px] font-semibold',
              dark ? 'text-white' : 'text-slate-950',
            )}
          >
            Solicitud a entrega
          </p>
        </div>

        <div
          className={cn(
            'inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-[8px] font-semibold ring-1',
            dark
              ? 'bg-white/[0.055] text-slate-300 ring-white/10'
              : 'bg-slate-50 text-slate-600 ring-slate-200',
          )}
        >
          <span
            className={cn(
              'h-1.5 w-1.5 rounded-full',
              cancelled ? 'bg-red-400' : 'bg-blue-400',
            )}
          />
          Etapa actual · {currentLabel}
        </div>
      </div>

      <div className={cn('overflow-x-auto', dark ? 'pt-3' : 'px-4 py-3.5')}>
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
                        'border-emerald-500 bg-emerald-500 text-white',
                      active && 'border-blue-500 bg-blue-500 text-white',
                      !complete &&
                        !active &&
                        !cancelledStep &&
                        (dark
                          ? 'border-white/15 bg-white/[0.045] text-slate-500'
                          : 'border-slate-200 bg-slate-50 text-slate-500'),
                      cancelledStep &&
                        'border-red-500 bg-red-500 text-white',
                    )}
                  >
                    {complete ? '✓' : index + 1}
                  </span>

                  <p
                    className={cn(
                      'mt-1.5 whitespace-nowrap text-[8px] font-medium',
                      active
                        ? dark
                          ? 'font-semibold text-blue-200'
                          : 'font-semibold text-blue-700'
                        : complete
                          ? dark
                            ? 'text-slate-300'
                            : 'text-slate-700'
                          : cancelledStep
                            ? dark
                              ? 'font-semibold text-red-300'
                              : 'font-semibold text-red-700'
                            : dark
                              ? 'text-slate-500'
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
                        ? dark
                          ? 'bg-emerald-400/70'
                          : 'bg-emerald-400'
                        : dark
                          ? 'bg-white/10'
                          : 'bg-slate-200',
                    )}
                  />
                ) : null}
              </div>
            )
          })}
        </div>

        {cancelled ? (
          <p
            className={cn(
              'mt-2.5 text-[9px] font-medium',
              dark ? 'text-red-300' : 'text-red-700',
            )}
          >
            La solicitud fue cancelada antes de continuar el flujo.
          </p>
        ) : null}
      </div>
    </section>
  )
}
