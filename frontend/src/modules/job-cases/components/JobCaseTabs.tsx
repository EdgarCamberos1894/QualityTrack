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
    <div className="flex overflow-x-auto rounded-xl border border-slate-200 bg-white p-1 shadow-[0_8px_24px_-24px_rgba(15,23,42,0.28)]">
      {tabs.map((tab) => {
        const active = tab.id === activeTab
        const count = getCount(tab.id)

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
