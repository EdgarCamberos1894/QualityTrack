import type { InputHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

interface PortalSearchFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string
}

export function PortalSearchField({
  label,
  className,
  ...props
}: PortalSearchFieldProps) {
  return (
    <label className={cn('relative block w-full lg:w-[360px]', className)}>
      <span className="sr-only">{label}</span>
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>
      <input
        type="search"
        className="h-8 w-full rounded-lg border border-slate-300 bg-white pl-8 pr-3 text-[9px] text-slate-900 shadow-[0_1px_2px_rgba(15,23,42,0.03)] outline-none transition placeholder:text-[9px] placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
        {...props}
      />
    </label>
  )
}

interface PortalFilterChipProps {
  active: boolean
  label: string
  count?: ReactNode
  countTone?: 'neutral' | 'amber'
  onClick: () => void
}

export function PortalFilterChip({
  active,
  label,
  count,
  countTone = 'neutral',
  onClick,
}: PortalFilterChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex h-7 shrink-0 items-center justify-center gap-1.5 rounded-full border px-2.5 text-[8px] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-100',
        active
          ? 'border-blue-300 bg-white text-blue-700 shadow-[0_1px_4px_rgba(37,99,235,0.12)] ring-1 ring-blue-100'
          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50',
      )}
    >
      {label}
      {count !== undefined ? (
        <span
          className={cn(
            'rounded-full px-1.5 py-0.5 text-[7px] font-semibold',
            active
              ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-100'
              : countTone === 'amber'
                ? 'bg-amber-50 text-amber-700'
                : 'bg-slate-100 text-slate-500',
          )}
        >
          {count}
        </span>
      ) : null}
    </button>
  )
}

interface PortalVisibleCountBarProps {
  count: number
  singular: string
  plural: string
  action?: ReactNode
}

export function PortalVisibleCountBar({
  count,
  singular,
  plural,
  action,
}: PortalVisibleCountBarProps) {
  return (
    <div className="flex min-h-9 items-center justify-between gap-4 border-b border-slate-200 bg-slate-50/55 px-4 py-2 sm:px-5">
      <div className="flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
        <p className="text-[8px] font-semibold text-slate-600">
          {count} {count === 1 ? singular : plural}
        </p>
      </div>
      {action}
    </div>
  )
}
