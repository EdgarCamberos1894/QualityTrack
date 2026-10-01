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

      <div className="relative grid gap-5 px-6 py-6 lg:grid-cols-[minmax(0,1fr)_270px]">
        <div className="min-w-0">
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
                Consulta el avance de los trabajos solicitados por{' '}
                {customerName} y responde cuando el equipo necesite
                información.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-2 sm:grid-cols-3">
            <div className="flex min-w-0 items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white/85 px-4 py-3">
              <div className="min-w-0">
                <p className="text-[9px] font-bold uppercase tracking-[0.08em] text-slate-400">
                  Solicitudes
                </p>
                <p className="mt-1 text-[10px] leading-4 text-slate-500">
                  Registradas
                </p>
              </div>
              <p className="shrink-0 text-xl font-bold tracking-tight text-slate-950">
                {total}
              </p>
            </div>

            <div className="flex min-w-0 items-center justify-between gap-3 rounded-xl border border-amber-100 bg-amber-50/70 px-4 py-3">
              <div className="min-w-0">
                <p className="text-[9px] font-bold uppercase tracking-[0.08em] text-amber-700">
                  Por responder
                </p>
                <p className="mt-1 text-[10px] leading-4 text-amber-700/75">
                  Requieren tu atención
                </p>
              </div>
              <p className="shrink-0 text-xl font-bold tracking-tight text-amber-700">
                {waitingResponse}
              </p>
            </div>

            <div className="flex min-w-0 items-center justify-between gap-3 rounded-xl border border-indigo-100 bg-indigo-50/70 px-4 py-3">
              <div className="min-w-0">
                <p className="text-[9px] font-bold uppercase tracking-[0.08em] text-indigo-700">
                  Producción
                </p>
                <p className="mt-1 text-[10px] leading-4 text-indigo-700/75">
                  En fabricación
                </p>
              </div>
              <p className="shrink-0 text-xl font-bold tracking-tight text-indigo-700">
                {inProduction}
              </p>
            </div>
          </div>
        </div>

        {canCreate ? (
          <Link
            to={`/portal/${customerId}/requests/new`}
            className="group relative overflow-hidden rounded-2xl bg-blue-600 p-5 text-white shadow-lg shadow-blue-200/70 transition duration-200 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-xl"
          >
            <div className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />

            <div className="relative flex h-full min-h-[150px] flex-col justify-between">
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 ring-1 ring-inset ring-white/15">
                  <SidebarNavIcon name="requests" className="h-5 w-5" />
                </div>
                <span className="text-xl font-light text-blue-100 transition group-hover:translate-x-0.5">
                  →
                </span>
              </div>

              <div className="mt-6">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-blue-100">
                  Nuevo trabajo
                </p>
                <h2 className="mt-1 text-base font-semibold text-white">
                  Crear solicitud
                </h2>
                <p className="mt-2 text-[10px] leading-5 text-blue-100">
                  Registra un nuevo requerimiento y adjunta la información
                  necesaria desde el inicio.
                </p>
              </div>
            </div>
          </Link>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white/70 p-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
              Acceso de consulta
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-900">
              Seguimiento de solicitudes
            </p>
            <p className="mt-2 text-[10px] leading-5 text-slate-500">
              Tu rol permite consultar el avance, pero no registrar nuevos
              trabajos.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
