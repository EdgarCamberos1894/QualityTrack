import { useMemo, useState } from 'react'
import { cn } from '@/shared/lib/cn'
import {
  formatTimelineDate,
  getTimelineEventLabel,
  getTimelinePhase,
  getTimelinePhasePresentation,
  type TimelinePhase,
} from '../model/workOrderTimelinePresenter'
import type { TraceabilityEventDto } from '../types/workOrder.types'

interface WorkOrderTimelineProps {
  events: TraceabilityEventDto[]
}

type TimelineFilter = TimelinePhase | 'all'

const filters: Array<{ id: TimelineFilter; label: string }> = [
  { id: 'all', label: 'Todos' },
  { id: 'commercial', label: 'Comercial' },
  { id: 'production', label: 'Producción' },
  { id: 'quality', label: 'Calidad' },
  { id: 'delivery', label: 'Entrega' },
]

export function WorkOrderTimeline({ events }: WorkOrderTimelineProps) {
  const [filter, setFilter] = useState<TimelineFilter>('all')

  const visibleEvents = useMemo(
    () =>
      filter === 'all'
        ? events
        : events.filter((event) => getTimelinePhase(event) === filter),
    [events, filter],
  )

  return (
    <section className="rounded-xl border border-[#d9e2ee] bg-white p-4">
      <div className="flex flex-col gap-4 border-b border-slate-100 pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-[15px] font-semibold text-slate-950">
            Historial completo
          </h2>
          <p className="mt-1 text-[10px] text-slate-500">
            Eventos reales del expediente con su snapshot histórico.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {filters.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              className={cn(
                'rounded-full px-3 py-1.5 text-[9px] font-semibold',
                filter === item.id
                  ? 'bg-blue-50 text-blue-700'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100',
              )}
            >
              {item.label}
              {item.id === 'all' ? ` · ${events.length}` : ''}
            </button>
          ))}
        </div>
      </div>

      <div className="relative mt-4 space-y-3 pl-7 before:absolute before:bottom-2 before:left-[6px] before:top-2 before:w-px before:bg-slate-200">
        {visibleEvents.map((event) => {
          const phase = getTimelinePhase(event)
          const presentation = getTimelinePhasePresentation(phase)

          return (
            <article
              key={event.id}
              className="relative rounded-[9px] border border-[#d9e2ee] bg-white p-3"
            >
              <span
                className={cn(
                  'absolute -left-[28px] top-4 h-3 w-3 rounded-full ring-4 ring-white',
                  presentation.dotClassName,
                )}
              />

              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={cn(
                        'rounded-full px-2.5 py-1 text-[9px] font-semibold',
                        presentation.badgeClassName,
                      )}
                    >
                      {presentation.label}
                    </span>
                    <h3 className="text-[11px] font-semibold text-slate-950">
                      {getTimelineEventLabel(event.eventType)}
                    </h3>
                  </div>
                  <p className="mt-2 text-[10px] text-slate-500">
                    {event.performedByName ?? 'Sistema'} · {event.aggregateType}{' '}
                    #{event.aggregateId}
                  </p>
                </div>

                <time className="shrink-0 text-[9px] text-slate-500">
                  {formatTimelineDate(event.occurredAt)}
                </time>
              </div>

              {event.snapshot.fromStatus || event.snapshot.toStatus ? (
                <p className="mt-3 text-[10px] text-slate-600">
                  {event.snapshot.fromStatus ?? '—'} →{' '}
                  {event.snapshot.toStatus ?? '—'}
                </p>
              ) : null}
            </article>
          )
        })}
      </div>
    </section>
  )
}
