import { Link } from 'react-router-dom'
import { Badge } from '@/shared/components/ui/Badge'
import { Card } from '@/shared/components/ui/Card'
import type { DashboardAttentionItemDto } from '../types/dashboard.types'

interface DashboardAttentionProps {
  items: DashboardAttentionItemDto[]
}

export function DashboardAttention({ items }: DashboardAttentionProps) {
  const pending = items.filter((item) => item.count > 0)

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-slate-200 px-5 py-4">
        <p className="text-[9px] font-semibold uppercase tracking-wide text-amber-700">
          Atención requerida
        </p>
        <h2 className="mt-1 text-sm font-semibold text-slate-950">
          Lo que merece una mirada
        </h2>
      </div>

      {pending.length === 0 ? (
        <div className="px-5 py-8 text-center">
          <p className="text-sm font-semibold text-slate-800">
            Sin pendientes operativos destacados
          </p>
          <p className="mt-1 text-[10px] text-slate-500">
            Los indicadores críticos están en cero.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {pending.map((item) => (
            <Link
              key={item.key}
              to={item.href}
              className="flex gap-3 px-5 py-4 transition hover:bg-slate-50"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-xs font-semibold text-slate-900">
                    {item.label}
                  </p>
                  <Badge tone={item.tone}>{item.count}</Badge>
                </div>
                <p className="mt-1 text-[10px] leading-5 text-slate-500">
                  {item.description}
                </p>
              </div>
              <span
                aria-hidden="true"
                className="mt-1 text-sm font-semibold text-slate-400"
              >
                →
              </span>
            </Link>
          ))}
        </div>
      )}
    </Card>
  )
}
