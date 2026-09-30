import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { EmptyState } from '@/shared/components/feedback/EmptyState'
import { cn } from '@/shared/lib/cn'
import {
  formatTimelineDate,
  getTimelineEventLabel,
  getTimelinePhase,
  getTimelinePhasePresentation,
  type TimelinePhase,
} from '../model/workOrderTimelinePresenter'
import {
  getPrimaryTraceabilityActionHref,
  getTimelineEventSummary,
  getTraceabilityActionHref,
} from '../model/workOrder360Presenter'
import type { WorkOrder360Dto } from '../types/workOrder360.types'

interface WorkOrderTimelineProps {
  data: WorkOrder360Dto
}

type TimelineFilter = TimelinePhase | 'all'

const filters: Array<{ id: TimelineFilter; label: string }> = [
  { id: 'all', label: 'Todos' },
  { id: 'commercial', label: 'Comercial' },
  { id: 'production', label: 'Producción' },
  { id: 'quality', label: 'Calidad' },
  { id: 'delivery', label: 'Entrega' },
]

export function WorkOrderTimeline({ data }: WorkOrderTimelineProps) {
  const navigate = useNavigate()
  const [filter, setFilter] = useState<TimelineFilter>('all')

  const visibleEvents = useMemo(
    () =>
      filter === 'all'
        ? data.timeline
        : data.timeline.filter((event) => getTimelinePhase(event) === filter),
    [data.timeline, filter],
  )

  return (
    <section className="rounded-xl border border-[#d9e2ee] bg-white p-4">
      <div className="flex flex-col gap-4 border-b border-slate-100 pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-[15px] font-semibold text-slate-950">
            Historial completo
          </h2>
          <p className="mt-1 text-[10px] leading-5 text-slate-500">
            Eventos ordenados por occurred_at, actor y entidad afectada. Las
            acciones Ver abren el registro real dentro de QualityTrack.
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
              {item.id === 'all' ? ` · ${data.timeline.length}` : ''}
            </button>
          ))}
        </div>
      </div>

      {visibleEvents.length === 0 ? (
        <div className="mt-4">
          <EmptyState
            title="Sin eventos en esta etapa"
            description="No hay registros de trazabilidad que coincidan con el filtro seleccionado."
          />
        </div>
      ) : (
        <div className="relative mt-4 space-y-3 pl-7 before:absolute before:bottom-2 before:left-[6px] before:top-2 before:w-px before:bg-slate-200">
          {visibleEvents.map((event) => {
            const phase = getTimelinePhase(event)
            const presentation = getTimelinePhasePresentation(phase)
            const primaryHref = getPrimaryTraceabilityActionHref(event, data)
            const actions = event.actions
              .map((action) => ({
                action,
                href: getTraceabilityActionHref(action, data),
              }))
              .filter(
                (
                  item,
                ): item is {
                  action: (typeof event.actions)[number]
                  href: string
                } => item.href !== null,
              )

            return (
              <article
                key={event.id}
                role={primaryHref ? 'link' : undefined}
                tabIndex={primaryHref ? 0 : undefined}
                aria-label={
                  primaryHref
                    ? `Abrir origen de ${getTimelineEventLabel(event.eventType)}`
                    : undefined
                }
                onClick={() => {
                  if (primaryHref) navigate(primaryHref)
                }}
                onKeyDown={(keyboardEvent) => {
                  if (
                    !primaryHref ||
                    keyboardEvent.currentTarget !== keyboardEvent.target
                  ) {
                    return
                  }

                  if (
                    keyboardEvent.key === 'Enter' ||
                    keyboardEvent.key === ' '
                  ) {
                    keyboardEvent.preventDefault()
                    navigate(primaryHref)
                  }
                }}
                className={cn(
                  'relative rounded-[9px] border border-[#d9e2ee] bg-white p-3 transition',
                  primaryHref &&
                    'cursor-pointer hover:border-blue-200 hover:bg-blue-50/30 focus:outline-none focus:ring-2 focus:ring-blue-200',
                )}
              >
                <span
                  className={cn(
                    'absolute -left-[28px] top-4 h-3 w-3 rounded-full ring-4 ring-white',
                    presentation.dotClassName,
                  )}
                />

                <div className="grid gap-3 lg:grid-cols-[126px_minmax(180px,0.8fr)_minmax(160px,0.7fr)_minmax(0,1.5fr)] lg:items-start">
                  <time className="text-[9px] font-medium text-slate-500">
                    {formatTimelineDate(event.occurredAt)}
                  </time>

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
                    </div>
                    <h3 className="mt-2 text-[10px] font-semibold text-slate-950">
                      {getTimelineEventLabel(event.eventType)}
                    </h3>
                  </div>

                  <div>
                    <p className="text-[10px] font-medium text-slate-700">
                      {event.performedByName ?? 'Sistema'}
                    </p>
                    <p className="mt-1 text-[9px] text-slate-500">
                      {event.aggregateType} #{event.aggregateId}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] leading-5 text-slate-600">
                      {getTimelineEventSummary(event)}
                    </p>

                    {primaryHref ? (
                      <p className="mt-2 text-[9px] font-semibold text-blue-600">
                        Abrir registro de origen →
                      </p>
                    ) : null}

                    {actions.length > 0 ? (
                      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                        {actions.map(({ action, href }) => (
                          <Link
                            key={`${action.type}-${action.resourceId}`}
                            to={href}
                            onClick={(clickEvent) =>
                              clickEvent.stopPropagation()
                            }
                            className="text-[9px] font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            {action.label}
                          </Link>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}

      <p className="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[9px] leading-5 text-slate-500">
        Fuente: traceability_events + registros originales. La línea de tiempo
        conserva snapshots históricos y no reescribe eventos anteriores.
      </p>
    </section>
  )
}
