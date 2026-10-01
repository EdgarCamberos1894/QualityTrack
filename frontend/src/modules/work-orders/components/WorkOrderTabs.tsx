import { cn } from '@/shared/lib/cn'
import type { WorkOrderDetailTab } from '../types/workOrder.types'

interface WorkOrderTabsProps {
  activeTab: WorkOrderDetailTab
  counts: {
    documents: number
    quality: number
    delivery: number
  }
  onChange: (tab: WorkOrderDetailTab) => void
}

const tabs: Array<{
  id: WorkOrderDetailTab
  label: string
}> = [
  { id: 'summary', label: 'Resumen' },
  { id: 'preparation', label: 'Preparación' },
  { id: 'production', label: 'Producción' },
  { id: 'quality', label: 'Calidad' },
  { id: 'delivery', label: 'Entrega' },
  { id: 'documents', label: 'Documentos' },
  { id: 'traceability', label: 'Trazabilidad' },
]

export function WorkOrderTabs({
  activeTab,
  counts,
  onChange,
}: WorkOrderTabsProps) {
  const countFor = (tab: WorkOrderDetailTab) => {
    if (tab === 'documents') return counts.documents
    if (tab === 'quality') return counts.quality
    if (tab === 'delivery') return counts.delivery
    return null
  }

  return (
    <div className="flex overflow-x-auto rounded-xl border border-slate-200 bg-white p-1 shadow-[0_8px_24px_-24px_rgba(15,23,42,0.28)]">
      {tabs.map((tab) => {
        const active = tab.id === activeTab
        const count = countFor(tab.id)

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              'inline-flex h-7 shrink-0 items-center gap-1 rounded-lg px-2.5 text-[8px] font-semibold transition',
              active
                ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-100'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700',
            )}
          >
            {tab.label}
            {count !== null ? (
              <span
                className={cn(
                  'rounded-full px-1.5 py-0.5 text-[7px]',
                  active
                    ? 'bg-white text-blue-700 ring-1 ring-blue-100'
                    : 'bg-slate-100 text-slate-400',
                )}
              >
                {count}
              </span>
            ) : null}
          </button>
        )
      })}
    </div>
  )
}
