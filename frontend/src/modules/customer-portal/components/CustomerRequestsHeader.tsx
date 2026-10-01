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
    <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-white to-blue-50/55 shadow-[0_16px_42px_-34px_rgba(15,23,42,0.4)]">
      <div className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-blue-100/60 blur-3xl" />

      <div className="relative px-5 py-5 lg:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-start gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-200/60">
              <SidebarNavIcon name="requests" className="h-[18px] w-[18px]" />
            </div>

            <div className="min-w-0">
              <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-blue-600">
                Gestión de trabajos
              </p>
              <h1 className="mt-1 text-xl font-bold tracking-tight text-slate-950">
                Solicitudes
              </h1>
              <p className="mt-1.5 max-w-2xl text-[12px] leading-5 text-slate-600">
                Consulta el avance de los trabajos solicitados por{' '}
                {customerName} y responde cuando el equipo necesite
                información.
              </p>
            </div>
          </div>

          {canCreate ? (
            <Link
              to={`/portal/${customerId}/requests/new`}
              className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-xs font-semibold text-white shadow-sm shadow-blue-200 transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-white/15 text-sm leading-none">
                +
              </span>
              Nueva solicitud
            </Link>
          ) : null}
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          <div className="flex min-w-0 items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white/85 px-3.5 py-2.5">
            <div className="min-w-0">
              <p className="text-[9px] font-bold uppercase tracking-[0.08em] text-slate-400">
                Solicitudes
              </p>
              <p className="mt-0.5 text-[9px] leading-4 text-slate-500">
                Registradas
              </p>
            </div>
            <p className="shrink-0 text-lg font-bold tracking-tight text-slate-950">
              {total}
            </p>
          </div>

          <div className="flex min-w-0 items-center justify-between gap-3 rounded-xl border border-amber-100 bg-amber-50/65 px-3.5 py-2.5">
            <div className="min-w-0">
              <p className="text-[9px] font-bold uppercase tracking-[0.08em] text-amber-700">
                Por responder
              </p>
              <p className="mt-0.5 text-[9px] leading-4 text-amber-700/75">
                Requieren atención
              </p>
            </div>
            <p className="shrink-0 text-lg font-bold tracking-tight text-amber-700">
              {waitingResponse}
            </p>
          </div>

          <div className="flex min-w-0 items-center justify-between gap-3 rounded-xl border border-indigo-100 bg-indigo-50/65 px-3.5 py-2.5">
            <div className="min-w-0">
              <p className="text-[9px] font-bold uppercase tracking-[0.08em] text-indigo-700">
                Producción
              </p>
              <p className="mt-0.5 text-[9px] leading-4 text-indigo-700/75">
                En fabricación
              </p>
            </div>
            <p className="shrink-0 text-lg font-bold tracking-tight text-indigo-700">
              {inProduction}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
