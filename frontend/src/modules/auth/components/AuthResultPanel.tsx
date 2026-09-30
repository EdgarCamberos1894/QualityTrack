import type { ReactNode } from 'react'

interface AuthResultPanelProps {
  title: string
  description: string
  tone?: 'success' | 'error' | 'info'
  children?: ReactNode
}

const classes = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-950',
  error: 'border-red-200 bg-red-50 text-red-950',
  info: 'border-blue-200 bg-blue-50 text-blue-950',
} as const

export function AuthResultPanel({
  title,
  description,
  tone = 'info',
  children,
}: AuthResultPanelProps) {
  return (
    <section className={`rounded-xl border p-4 ${classes[tone]}`}>
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-1 text-xs leading-5 opacity-80">{description}</p>
      {children ? <div className="mt-4">{children}</div> : null}
    </section>
  )
}
