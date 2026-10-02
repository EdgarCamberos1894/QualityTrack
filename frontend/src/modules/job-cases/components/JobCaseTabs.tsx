import { cn } from '@/shared/lib/cn'
import type { JobCaseDetailTab } from '../types/jobCase.types'

interface JobCaseTabsProps {
  activeTab: JobCaseDetailTab
  documentCount: number
  onChange: (tab: JobCaseDetailTab) => void
}

const tabs: Array<{ id: JobCaseDetailTab; label: string }> = [
  { id: 'summary', label: 'Resumen' },
  { id: 'documents', label: 'Documentos' },
  { id: 'specification', label: 'Especificación' },
  { id: 'activity', label: 'Actividad' },
]

export function JobCaseTabs({
  activeTab,
  documentCount,
  onChange,
}: JobCaseTabsProps) {
  return (
    <div className="flex overflow-x-auto rounded-xl border border-slate-200 bg-white p-1 shadow-[0_8px_24px_-24px_rgba(15,23,42,0.28)]">
      {tabs.map((tab) => {
        const active = tab.id === activeTab

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              'inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg px-3 text-[9px] font-semibold transition',
              active
                ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-100'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700',
            )}
          >
            {tab.label}
            {tab.id === 'documents' ? (
              <span
                className={cn(
                  'rounded-full px-1.5 py-0.5 text-[7px]',
                  active
                    ? 'bg-white text-blue-700 ring-1 ring-blue-100'
                    : 'bg-slate-100 text-slate-400',
                )}
              >
                {documentCount}
              </span>
            ) : null}
          </button>
        )
      })}
    </div>
  )
}
