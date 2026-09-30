import { cn } from '@/shared/lib/cn'

export type ResourceTab = 'machines' | 'materials'

interface ResourceTabsProps {
  value: ResourceTab
  onChange: (value: ResourceTab) => void
}

const tabs: Array<{ value: ResourceTab; label: string; description: string }> = [
  {
    value: 'machines',
    label: 'Máquinas',
    description: 'Disponibilidad y estado operativo',
  },
  {
    value: 'materials',
    label: 'Materiales y lotes',
    description: 'Existencias trazables por lote',
  },
]

export function ResourceTabs({ value, onChange }: ResourceTabsProps) {
  return (
    <div className="mb-5 grid gap-3 sm:grid-cols-2">
      {tabs.map((tab) => {
        const active = tab.value === value

        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => onChange(tab.value)}
            className={cn(
              'rounded-xl border p-4 text-left transition',
              active
                ? 'border-blue-300 bg-blue-50 shadow-sm'
                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50',
            )}
          >
            <p
              className={cn(
                'text-sm font-semibold',
                active ? 'text-blue-800' : 'text-slate-950',
              )}
            >
              {tab.label}
            </p>
            <p className="mt-1 text-[10px] leading-5 text-slate-500">
              {tab.description}
            </p>
          </button>
        )
      })}
    </div>
  )
}
