import { Link } from 'react-router-dom'
import { EmptyState } from '@/shared/components/feedback/EmptyState'
import { Card } from '@/shared/components/ui/Card'
import {
  formatDashboardDateTime,
  getDashboardEventLabel,
} from '../model/dashboardPresenter'
import type { DashboardRecentActivityDto } from '../types/dashboard.types'

interface DashboardRecentActivityProps {
  activity: DashboardRecentActivityDto[]
}

export function DashboardRecentActivity({
  activity,
}: DashboardRecentActivityProps) {
  return (
    <Card className="overflow-hidden">
      <div className="border-b border-slate-200 px-5 py-4">
        <p className="text-[9px] font-semibold uppercase tracking-wide text-teal-700">
          Trazabilidad
        </p>
        <h2 className="mt-1 text-sm font-semibold text-slate-950">
          Actividad reciente
        </h2>
      </div>

      {activity.length === 0 ? (
        <div className="p-5">
          <EmptyState
            title="Sin actividad todavía"
            description="Los eventos relevantes aparecerán aquí conforme avance la operación."
          />
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {activity.map((event) => (
            <Link
              key={event.eventId}
              to={`/job-cases/${event.caseId}?tab=traceability`}
              className="block px-5 py-3.5 transition hover:bg-slate-50"
            >
              <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-900">
                    {getDashboardEventLabel(event.eventType)}
                  </p>
                  <p className="mt-1 text-[10px] text-slate-500">
                    {event.caseNumber}
                    {event.performedByName
                      ? ` · ${event.performedByName}`
                      : ' · Sistema'}
                  </p>
                </div>
                <time className="shrink-0 text-[9px] text-slate-400">
                  {formatDashboardDateTime(event.occurredAt)}
                </time>
              </div>
            </Link>
          ))}
        </div>
      )}
    </Card>
  )
}
