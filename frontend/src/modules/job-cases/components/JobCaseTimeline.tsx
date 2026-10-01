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
      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <EmptyState
          title="Sin eventos"
          description="Todavía no hay eventos de trazabilidad para este expediente."
        />
      </section>
    )
  }

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_12px_35px_-30px_rgba(15,23,42,0.3)]">
      <div className="border-b border-blue-100 bg-gradient-to-r from-white via-white to-blue-50/45 px-4 py-2.5">
        <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">
          Expediente 360
        </p>
        <div className="mt-0.5 flex items-center justify-between gap-3">
          <h2 className="text-[12px] font-semibold text-slate-950">
            Historial del expediente
          </h2>
          <span className="text-[8px] text-slate-400">{events.length} eventos</span>
        </div>
      </div>

      <div className="relative space-y-2.5 px-4 py-3.5 pl-9 before:absolute before:bottom-5 before:left-[21px] before:top-5 before:w-px before:bg-slate-200">
        {events.map((event) => (
          <article
            key={event.id}
            className="relative rounded-lg border border-slate-200 bg-white px-3 py-2.5"
          >
            <span className="absolute -left-[23px] top-3.5 h-2.5 w-2.5 rounded-full bg-blue-500 ring-4 ring-white" />
            <div className="flex flex-col gap-1.5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="text-[10px] font-semibold text-slate-950">
                  {formatEventLabel(event.eventType)}
                </h3>
                <p className="mt-0.5 text-[8px] text-slate-400">
                  {event.performedByName ?? 'Sistema'}
                </p>
                {event.fromStatus || event.toStatus ? (
                  <p className="mt-1.5 text-[8px] font-medium text-slate-500">
                    {event.fromStatus ?? '—'} → {event.toStatus ?? '—'}
                  </p>
                ) : null}
              </div>
              <time className="text-[8px] text-slate-400">
                {formatDate(event.occurredAt)}
              </time>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
