import { Link } from 'react-router-dom'
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
  workOrderId?: number | null
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
  workOrderId = null,
}: JobCaseActivityListProps) {
  return (
    <div className="relative space-y-2.5 pl-5 before:absolute before:bottom-3 before:left-[5px] before:top-3 before:w-px before:bg-slate-200">
      {events.map((event) => {
        const primaryHref = getPrimaryJobCaseTraceabilityHref(
          event,
          caseId,
          workOrderId,
        )
        const actions = (event.actions ?? [])
          .map((action) => ({
            action,
            href: getJobCaseTraceabilityActionHref(
              action,
              event,
              caseId,
              workOrderId,
            ),
          }))
          .filter(
            (
              item,
            ): item is {
              action: (typeof event.actions)[number]
              href: string
            } => item.href !== null,
          )

        const primaryAction =
          actions.find(({ href }) => href === primaryHref) ?? actions.at(0)
        const secondaryActions = primaryAction
          ? actions.filter(
              ({ action }) =>
                !(
                  action.type === primaryAction.action.type &&
                  action.resourceId === primaryAction.action.resourceId
                ),
            )
          : actions

        return (
          <article
            key={event.id}
            className="relative rounded-lg border border-slate-200 bg-white px-3 py-2.5 transition hover:border-slate-300"
          >
            <span className="absolute -left-[19px] top-3.5 h-2.5 w-2.5 rounded-full bg-blue-500 ring-4 ring-white" />

            <div className="flex flex-col gap-1.5 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1">
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

                {primaryAction ? (
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <Link
                      to={primaryAction.href}
                      className="inline-flex h-7 items-center justify-center rounded-lg bg-blue-600 px-2.5 text-[8px] font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    >
                      {primaryAction.action.label}
                      <span aria-hidden="true" className="ml-1">
                        →
                      </span>
                    </Link>

                    {secondaryActions.map(({ action, href }) => (
                      <Link
                        key={`${action.type}-${action.resourceId}`}
                        to={href}
                        className="inline-flex h-7 items-center justify-center rounded-lg border border-slate-200 bg-white px-2.5 text-[8px] font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
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
