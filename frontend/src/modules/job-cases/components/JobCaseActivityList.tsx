import {
  formatJobCaseDateTime,
  getJobCaseTimelineEventLabel,
} from '../model/jobCasePresenter'
import type { JobCaseTimelineEventDto } from '../types/jobCase.types'

interface JobCaseActivityListProps {
  events: JobCaseTimelineEventDto[]
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
}: JobCaseActivityListProps) {
  return (
    <div className="relative space-y-2.5 pl-5 before:absolute before:bottom-3 before:left-[5px] before:top-3 before:w-px before:bg-slate-200">
      {events.map((event) => (
        <article
          key={event.id}
          className="relative rounded-lg border border-slate-200 bg-white px-3 py-2.5"
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
            </div>

            <time className="shrink-0 text-[8px] text-slate-400">
              {formatJobCaseDateTime(event.occurredAt)}
            </time>
          </div>
        </article>
      ))}
    </div>
  )
}
