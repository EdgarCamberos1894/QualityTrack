import { Link, useNavigate } from 'react-router-dom'
import {
  formatJobCaseDateTime,
  getJobCaseTimelineEventLabel,
} from '../model/jobCasePresenter'
import {
  getJobCaseTraceabilityActionHref,
  getPrimaryJobCaseTraceabilityHref,
} from '../model/jobCaseTraceabilityPresenter'
import type { JobCaseTimelineEventDto } from '../types/jobCase.types'

interface JobCaseActivityListProps {
  events: JobCaseTimelineEventDto[]
  caseId: number
}

function formatStatus(value: string | null): string {
  if (!value) return '—'

  return value
    .toLocaleLowerCase('es-MX')
    .replaceAll('_', ' ')
    .replace(/^./, (character) => character.toLocaleUpperCase('es-MX'))
}

export function JobCaseActivityList({
  events,
  caseId,
}: JobCaseActivityListProps) {
  const navigate = useNavigate()

  return (
    <div className="relative space-y-2.5 pl-5 before:absolute before:bottom-3 before:left-[5px] before:top-3 before:w-px before:bg-slate-200">
      {events.map((event) => {
        const primaryHref = getPrimaryJobCaseTraceabilityHref(event, caseId)
        const actions = (event.actions ?? [])
          .map((action) => ({
            action,
            href: getJobCaseTraceabilityActionHref(action, event, caseId),
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
            className={
              primaryHref
                ? 'relative cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-2.5 transition hover:border-blue-200 hover:bg-blue-50/30 focus:outline-none focus:ring-2 focus:ring-blue-200'
                : 'relative rounded-lg border border-slate-200 bg-white px-3 py-2.5'
            }
          >
            <span className="absolute -left-[19px] top-3.5 h-2.5 w-2.5 rounded-full bg-blue-500 ring-4 ring-white" />

            <div className="flex flex-col gap-1.5 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <h3 className="text-[10px] font-semibold text-slate-950">
                  {getJobCaseTimelineEventLabel(event.eventType)}
                </h3>
                <p className="mt-0.5 text-[8px] text-slate-400">
                  {event.performedByName ?? 'Sistema'}
                </p>

                {event.fromStatus || event.toStatus ? (
                  <p className="mt-1.5 text-[8px] font-medium text-slate-500">
                    {formatStatus(event.fromStatus)} →{' '}
                    {formatStatus(event.toStatus)}
                  </p>
                ) : null}

                {primaryHref ? (
                  <p className="mt-1.5 text-[8px] font-semibold text-blue-600">
                    Abrir registro relacionado →
                  </p>
                ) : null}

                {actions.length > 0 ? (
                  <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1">
                    {actions.map(({ action, href }) => (
                      <Link
                        key={`${action.type}-${action.resourceId}`}
                        to={href}
                        onClick={(clickEvent) => clickEvent.stopPropagation()}
                        className="text-[8px] font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {action.label}
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>

              <time className="shrink-0 text-[8px] text-slate-400">
                {formatJobCaseDateTime(event.occurredAt)}
              </time>
            </div>
          </article>
        )
      })}
    </div>
  )
}
