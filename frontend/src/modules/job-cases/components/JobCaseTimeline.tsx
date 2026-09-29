import { EmptyState } from '@/shared/components/feedback/EmptyState'
import type { JobCaseTimelineEventDto } from '../types/jobCase.types'

interface JobCaseTimelineProps {
  events: JobCaseTimelineEventDto[]
}

function formatEventLabel(eventType: string): string {
  return eventType
    .toLocaleLowerCase('es-MX')
    .replaceAll('_', ' ')
    .replace(/^./, (character) => character.toLocaleUpperCase('es-MX'))
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('es-MX', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

export function JobCaseTimeline({ events }: JobCaseTimelineProps) {
  if (events.length === 0) {
    return (
      <EmptyState
        title="Sin eventos"
        description="Todavía no hay eventos de trazabilidad para este expediente."
      />
    )
  }

  return (
    <section className="rounded-xl border border-[#d9e2ee] bg-white p-4">
      <h2 className="text-sm font-semibold text-slate-950">
        Historial del expediente
      </h2>

      <div className="relative mt-4 space-y-3 pl-7 before:absolute before:bottom-2 before:left-[6px] before:top-2 before:w-px before:bg-slate-200">
        {events.map((event) => (
          <article
            key={event.id}
            className="relative rounded-lg border border-slate-200 p-3"
          >
            <span className="absolute -left-[28px] top-4 h-3 w-3 rounded-full bg-amber-500 ring-4 ring-white" />
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="text-[11px] font-semibold text-slate-950">
                  {formatEventLabel(event.eventType)}
                </h3>
                <p className="mt-1 text-[10px] text-slate-500">
                  {event.performedByName ?? 'Sistema'}
                </p>
                {event.fromStatus || event.toStatus ? (
                  <p className="mt-2 text-[10px] text-slate-600">
                    {event.fromStatus ?? '—'} → {event.toStatus ?? '—'}
                  </p>
                ) : null}
              </div>
              <time className="text-[9px] text-slate-500">
                {formatDate(event.occurredAt)}
              </time>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
