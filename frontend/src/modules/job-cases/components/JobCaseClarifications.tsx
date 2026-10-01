import { EmptyState } from '@/shared/components/feedback/EmptyState'
import { Badge } from '@/shared/components/ui/Badge'
import type { CaseInformationRequestDto } from '../types/jobCase.types'

interface JobCaseClarificationsProps {
  requests: CaseInformationRequestDto[]
}

export function JobCaseClarifications({
  requests,
}: JobCaseClarificationsProps) {
  if (requests.length === 0) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <EmptyState
          title="Sin aclaraciones"
          description="No se han solicitado aclaraciones al cliente para este expediente."
        />
      </section>
    )
  }

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_12px_35px_-30px_rgba(15,23,42,0.3)]">
      <div className="border-b border-blue-100 bg-gradient-to-r from-white via-white to-blue-50/45 px-4 py-2.5">
        <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">
          Comunicación con cliente
        </p>
        <h2 className="mt-0.5 text-[12px] font-semibold text-slate-950">
          Aclaraciones del expediente
        </h2>
      </div>

      <div className="divide-y divide-slate-100">
        {requests.map((request) => (
          <article key={request.id} className="px-4 py-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[8px] font-semibold uppercase tracking-wide text-slate-400">
                  Aclaración #{request.id}
                </p>
                <h3 className="mt-0.5 text-[11px] font-semibold text-slate-950">
                  {request.question}
                </h3>
                <p className="mt-1 text-[8px] text-slate-400">
                  Solicitada por {request.requestedByName ?? 'Sistema'}
                </p>
              </div>
              <Badge
                tone={request.open ? 'warning' : 'success'}
                className="px-2 py-0.5 text-[8px]"
              >
                {request.open ? 'Pendiente' : 'Respondida'}
              </Badge>
            </div>

            {request.response ? (
              <div className="mt-2.5 rounded-lg border border-slate-100 bg-slate-50/70 px-3 py-2.5">
                <p className="text-[8px] font-semibold uppercase tracking-wide text-slate-400">
                  Respuesta
                </p>
                <p className="mt-1 text-[10px] leading-4 text-slate-700">
                  {request.response}
                </p>
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  )
}
