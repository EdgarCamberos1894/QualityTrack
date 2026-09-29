import { Badge } from '@/shared/components/ui/Badge'
import { EmptyState } from '@/shared/components/feedback/EmptyState'
import type { CaseInformationRequestDto } from '../types/jobCase.types'

interface JobCaseClarificationsProps {
  requests: CaseInformationRequestDto[]
}

export function JobCaseClarifications({
  requests,
}: JobCaseClarificationsProps) {
  if (requests.length === 0) {
    return (
      <EmptyState
        title="Sin aclaraciones"
        description="No se han solicitado aclaraciones al cliente para este expediente."
      />
    )
  }

  return (
    <div className="grid gap-3">
      {requests.map((request) => (
        <article
          key={request.id}
          className="rounded-xl border border-[#d9e2ee] bg-white p-4"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
                Aclaración #{request.id}
              </p>
              <h2 className="mt-1 text-sm font-semibold text-slate-950">
                {request.question}
              </h2>
              <p className="mt-2 text-[10px] text-slate-500">
                Solicitada por {request.requestedByName ?? 'Sistema'}
              </p>
            </div>
            <Badge tone={request.open ? 'warning' : 'success'}>
              {request.open ? 'Pendiente' : 'Respondida'}
            </Badge>
          </div>

          {request.response ? (
            <div className="mt-4 rounded-lg bg-slate-50 p-3">
              <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
                Respuesta
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-700">
                {request.response}
              </p>
            </div>
          ) : null}
        </article>
      ))}
    </div>
  )
}
