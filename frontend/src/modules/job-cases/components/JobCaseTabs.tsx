import { cn } from '@/shared/lib/cn'
import type { JobCaseDetailTab } from '../types/jobCase.types'

interface JobCaseTabsProps {
  activeTab: JobCaseDetailTab
  counts: {
    documents: number
    clarifications: number
    timeline: number
  }
  onChange: (tab: JobCaseDetailTab) => void
}

const tabs: Array<{ id: JobCaseDetailTab; label: string }> = [
  { id: 'summary', label: 'Resumen' },
  { id: 'documents', label: 'Documentos' },
  { id: 'clarifications', label: 'Aclaraciones' },
  { id: 'material', label: 'Material' },
  { id: 'traceability', label: 'Trazabilidad' },
]

export function JobCaseTabs({ activeTab, counts, onChange }: JobCaseTabsProps) {
  const getCount = (tab: JobCaseDetailTab) => {
    if (tab === 'documents') return counts.documents
    if (tab === 'clarifications') return counts.clarifications
    if (tab === 'traceability') return counts.timeline
    return null
  }

  return (
    <div className="flex overflow-x-auto rounded-[10px] border border-[#d9e2ee] bg-white px-2">
      {tabs.map((tab) => {
        const active = tab.id === activeTab
        const count = getCount(tab.id)

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              'relative h-11 shrink-0 px-4 text-[11px] font-medium text-slate-700',
              active && 'font-semibold text-amber-700',
            )}
          >
            {tab.label}
            {count !== null ? (
              <span className="ml-1 text-[9px] text-slate-400">{count}</span>
            ) : null}
            {active ? (
              <span className="absolute inset-x-3 bottom-0 h-[3px] rounded-t bg-amber-600" />
            ) : null}
          </button>
        )
      })}
    </div>
  )
}
