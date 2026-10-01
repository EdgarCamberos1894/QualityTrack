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
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_12px_35px_-30px_rgba(15,23,42,0.3)]">
      <div className="flex flex-col gap-3 border-b border-blue-100 bg-gradient-to-r from-white via-white to-blue-50/50 px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">
            Expediente 360
          </p>
          <h2 className="mt-0.5 text-[11px] font-semibold text-slate-950">
            Historial completo
          </h2>
          <p className="mt-0.5 text-[8px] leading-4 text-slate-400">
            Eventos auditables y accesos a sus registros de origen.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {filters.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              className={cn(
                'rounded-full px-2.5 py-1 text-[8px] font-semibold',
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
        <div className="p-4">
          <EmptyState
            title="Sin eventos en esta etapa"
            description="No hay registros de trazabilidad que coincidan con el filtro seleccionado."
          />
        </div>
      ) : (
        <div className="relative space-y-2.5 px-4 py-3.5 pl-9 before:absolute before:bottom-5 before:left-[21px] before:top-5 before:w-px before:bg-slate-200">
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
                  'relative rounded-lg border border-slate-200 bg-white px-3 py-2.5 transition',
                  primaryHref &&
                    'cursor-pointer hover:border-blue-200 hover:bg-blue-50/30 focus:outline-none focus:ring-2 focus:ring-blue-200',
                )}
              >
                <span
                  className={cn(
                    'absolute -left-[23px] top-3.5 h-2.5 w-2.5 rounded-full ring-4 ring-white',
                    presentation.dotClassName,
                  )}
                />

                <div className="grid gap-2.5 lg:grid-cols-[110px_minmax(150px,0.72fr)_minmax(140px,0.65fr)_minmax(0,1.5fr)] lg:items-start">
                  <time className="text-[8px] font-medium text-slate-500">
                    {formatTimelineDate(event.occurredAt)}
                  </time>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={cn(
                          'rounded-full px-2.5 py-1 text-[8px] font-semibold',
                          presentation.badgeClassName,
                        )}
                      >
                        {presentation.label}
                      </span>
                    </div>
                    <h3 className="mt-2 text-[8px] font-semibold text-slate-950">
                      {getTimelineEventLabel(event.eventType)}
                    </h3>
                  </div>

                  <div>
                    <p className="text-[8px] font-medium text-slate-700">
                      {event.performedByName ?? 'Sistema'}
                    </p>
                    <p className="mt-1 text-[8px] text-slate-500">
                      {event.aggregateType} #{event.aggregateId}
                    </p>
                  </div>

                  <div>
                    <p className="text-[8px] leading-5 text-slate-600">
                      {getTimelineEventSummary(event)}
                    </p>

                    {primaryHref ? (
                      <p className="mt-2 text-[8px] font-semibold text-blue-600">
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
                            className="text-[8px] font-semibold text-blue-600 hover:text-blue-800 hover:underline"
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

      <p className="border-t border-slate-100 bg-slate-50/60 px-4 py-2 text-[7px] leading-3 text-slate-400">
        Fuente: traceability_events + registros originales. La línea de tiempo
        conserva snapshots históricos y no reescribe eventos anteriores.
      </p>
    </section>
  )
}
