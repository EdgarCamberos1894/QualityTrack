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
  { id: 'traceability', label: 'Trazabilidad' },
  { id: 'documents', label: 'Documentos' },
  { id: 'quality', label: 'Calidad' },
  { id: 'delivery', label: 'Entrega' },
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
    <div className="flex overflow-x-auto rounded-[10px] border border-[#d9e2ee] bg-white px-2">
      {tabs.map((tab) => {
        const active = tab.id === activeTab
        const count = countFor(tab.id)

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              'relative h-11 shrink-0 px-4 text-[11px] font-medium text-slate-700',
              active && 'font-semibold text-blue-600',
            )}
          >
            {tab.label}
            {count !== null ? (
              <span className="ml-1 text-[9px] text-slate-400">{count}</span>
            ) : null}
            {active ? (
              <span className="absolute inset-x-3 bottom-0 h-[3px] rounded-t bg-blue-600" />
            ) : null}
          </button>
        )
      })}
    </div>
  )
}
