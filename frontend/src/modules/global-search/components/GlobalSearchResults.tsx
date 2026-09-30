import { Badge } from '@/shared/components/ui/Badge'
import { getErrorMessage } from '@/shared/lib/getErrorMessage'
import {
  formatGlobalSearchStatus,
  getGlobalSearchTypeLabel,
  getGlobalSearchTypeTone,
} from '../model/globalSearchPresenter'
import type { GlobalSearchResultDto } from '../types/globalSearch.types'

interface GlobalSearchResultsProps {
  query: string
  results: GlobalSearchResultDto[]
  pending: boolean
  error: unknown
  onSelect: (result: GlobalSearchResultDto) => void
}

export function GlobalSearchResults({
  query,
  results,
  pending,
  error,
  onSelect,
}: GlobalSearchResultsProps) {
  const normalized = query.trim()

  if (normalized.length < 2) {
    return (
      <div className="px-4 py-5 text-center">
        <p className="text-xs font-semibold text-slate-700">
          Busca en toda la operación
        </p>
        <p className="mt-1 text-[10px] leading-5 text-slate-500">
          Escribe al menos 2 caracteres. Puedes usar folios, empresa, material,
          lote o nombre de documento.
        </p>
      </div>
    )
  }

  if (pending) {
    return (
      <div className="px-4 py-5 text-center text-xs text-slate-500">
        Buscando…
      </div>
    )
  }

  if (error) {
    return (
      <div className="px-4 py-4">
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {getErrorMessage(error)}
        </p>
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <div className="px-4 py-5 text-center">
        <p className="text-xs font-semibold text-slate-700">
          Sin coincidencias
        </p>
        <p className="mt-1 text-[10px] text-slate-500">
          Prueba con otro folio, nombre o referencia.
        </p>
      </div>
    )
  }

  return (
    <div className="max-h-[min(62vh,520px)] overflow-y-auto py-2">
      {results.map((result) => {
        const status = formatGlobalSearchStatus(result.status)

        return (
          <button
            key={`${result.type}-${result.resourceId}`}
            type="button"
            onClick={() => onSelect(result)}
            className="flex w-full gap-3 px-4 py-3 text-left transition hover:bg-slate-50 focus:bg-blue-50 focus:outline-none"
          >
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={getGlobalSearchTypeTone(result.type)}>
                  {getGlobalSearchTypeLabel(result.type)}
                </Badge>
                {status ? (
                  <span className="text-[9px] font-medium text-slate-400">
                    {status}
                  </span>
                ) : null}
              </div>

              <p className="mt-1.5 truncate text-xs font-semibold text-slate-950">
                {result.title}
              </p>

              {result.subtitle ? (
                <p className="mt-1 truncate text-[10px] text-slate-600">
                  {result.subtitle}
                </p>
              ) : null}

              {result.context ? (
                <p className="mt-1 truncate text-[9px] text-slate-400">
                  {result.context}
                </p>
              ) : null}
            </div>

            <span
              aria-hidden="true"
              className="mt-5 shrink-0 text-sm font-semibold text-slate-300"
            >
              →
            </span>
          </button>
        )
      })}
    </div>
  )
}
