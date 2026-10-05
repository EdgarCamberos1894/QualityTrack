import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

interface InternalListingPanelProps {
  children: ReactNode
  className?: string
}

interface InternalListingHeaderProps {
  eyebrow: string
  title: string
  description?: ReactNode
  aside?: ReactNode
  className?: string
}

interface InternalListingResultsBarProps {
  count: number
  singular: string
  plural: string
  onClear?: () => void
  clearLabel?: string
  className?: string
}

interface InternalListingBodyProps {
  children: ReactNode
  className?: string
}

interface InternalListingSearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder: string
  ariaLabel: string
  className?: string
}

interface InternalListingSelectProps {
  value: string
  onChange: (value: string) => void
  ariaLabel: string
  children: ReactNode
  className?: string
}

export function InternalListingPanel({
  children,
  className,
}: InternalListingPanelProps) {
  return (
    <section
      className={cn(
        'mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_14px_40px_-32px_rgba(15,23,42,0.34)]',
        className,
      )}
    >
      {children}
    </section>
  )
}

export function InternalListingHeader({
  eyebrow,
  title,
  description,
  aside,
  className,
}: InternalListingHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-2 border-b border-blue-100 bg-gradient-to-r from-white via-white to-blue-50/55 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5',
        className,
      )}
    >
      <div className="min-w-0">
        <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">
          {eyebrow}
        </p>
        <h2 className="mt-0.5 text-[13px] font-semibold text-slate-950">
          {title}
        </h2>
        {description ? (
          <div className="mt-0.5 text-[8px] leading-4 text-slate-500">
            {description}
          </div>
        ) : null}
      </div>
      {aside ? <div className="shrink-0">{aside}</div> : null}
    </div>
  )
}

export function InternalListingResultsBar({
  count,
  singular,
  plural,
  onClear,
  clearLabel = 'Limpiar filtros',
  className,
}: InternalListingResultsBarProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-4 border-b border-slate-200 bg-slate-50/65 px-4 py-2.5 sm:px-5',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
        <p className="text-[9px] font-semibold text-slate-700">
          {count} {count === 1 ? singular : plural}
        </p>
      </div>

      {onClear ? (
        <button
          type="button"
          onClick={onClear}
          className="text-[9px] font-semibold text-blue-600 transition hover:text-blue-700"
        >
          {clearLabel}
        </button>
      ) : null}
    </div>
  )
}

export function InternalListingBody({
  children,
  className,
}: InternalListingBodyProps) {
  return (
    <div className={cn('bg-slate-50/40 p-3.5 sm:p-4', className)}>
      {children}
    </div>
  )
}

export function InternalListingSearchInput({
  value,
  onChange,
  placeholder,
  ariaLabel,
  className,
}: InternalListingSearchInputProps) {
  return (
    <label className={cn('relative block', className)}>
      <span className="sr-only">{ariaLabel}</span>
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
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
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-9 w-full rounded-xl border border-slate-300 bg-white pl-9 pr-3 text-[10px] text-slate-900 shadow-[0_1px_2px_rgba(15,23,42,0.04)] outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
      />
    </label>
  )
}

export function InternalListingSelect({
  value,
  onChange,
  ariaLabel,
  children,
  className,
}: InternalListingSelectProps) {
  return (
    <label className={cn('block', className)}>
      <span className="sr-only">{ariaLabel}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 w-full rounded-xl border border-slate-300 bg-white px-3 text-[10px] font-medium text-slate-700 shadow-[0_1px_2px_rgba(15,23,42,0.04)] outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
      >
        {children}
      </select>
    </label>
  )
}
