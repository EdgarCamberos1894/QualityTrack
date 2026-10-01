import { Link } from 'react-router-dom'
import { SidebarNavIcon } from '@/shared/components/navigation/SidebarNavIcon'

interface CustomerRequestsHeaderProps {
  customerId: number
  customerName: string
  total: number
  waitingResponse: number
  inProduction: number
  canCreate: boolean
}

export function CustomerRequestsHeader({
  customerId,
  customerName,
  total,
  waitingResponse,
  inProduction,
  canCreate,
}: CustomerRequestsHeaderProps) {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-white to-blue-50/60 shadow-[0_18px_50px_-34px_rgba(15,23,42,0.45)]">
      <div className="pointer-events-none absolute -right-16 -top-20 h-52 w-52 rounded-full bg-blue-100/70 blur-3xl" />
      <div className="relative flex flex-col gap-5 px-6 py-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-200/70">
            <SidebarNavIcon name="requests" className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-blue-600">
              Gestión de trabajos
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
              Solicitudes
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Consulta el avance de los trabajos solicitados por {customerName}
              y responde cuando el equipo necesite información.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-xl border border-slate-200 bg-white/85 px-3 py-2.5 text-center">
              <p className="text-base font-bold text-slate-950">{total}</p>
              <p className="mt-0.5 text-[9px] font-medium text-slate-500">
                Totales
              </p>
            </div>
            <div className="rounded-xl border border-amber-100 bg-amber-50/70 px-3 py-2.5 text-center">
              <p className="text-base font-bold text-amber-700">
                {waitingResponse}
              </p>
              <p className="mt-0.5 text-[9px] font-medium text-amber-700">
                Por responder
              </p>
            </div>
            <div className="rounded-xl border border-indigo-100 bg-indigo-50/70 px-3 py-2.5 text-center">
              <p className="text-base font-bold text-indigo-700">
                {inProduction}
              </p>
              <p className="mt-0.5 text-[9px] font-medium text-indigo-700">
                Producción
              </p>
            </div>
          </div>

          {canCreate ? (
            <Link
              to={`/portal/${customerId}/requests/new`}
              className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-xs font-semibold text-white shadow-sm shadow-blue-200 transition hover:bg-blue-700"
            >
              <span className="text-base leading-none">+</span>
              Nueva solicitud
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  )
}
