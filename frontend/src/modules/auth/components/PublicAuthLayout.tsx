import type { ReactNode } from 'react'
import { AuthBrandPanel } from './AuthBrandPanel'

interface PublicAuthLayoutProps {
  eyebrow: string
  title: string
  description: string
  children: ReactNode
  footer?: ReactNode
  wide?: boolean
}

export function PublicAuthLayout({
  eyebrow,
  title,
  description,
  children,
  footer,
  wide = false,
}: PublicAuthLayoutProps) {
  return (
    <main className="min-h-screen bg-[#f5f7fb] lg:grid lg:grid-cols-[minmax(380px,0.9fr)_minmax(520px,1.1fr)]">
      <AuthBrandPanel />

      <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8">
        <div className={wide ? 'w-full max-w-[560px]' : 'w-full max-w-[440px]'}>
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <img
              src="/brand/qualitytrack-mark.svg"
              alt=""
              className="h-11 w-11"
            />
            <span className="text-xl font-bold tracking-tight text-slate-950">
              Quality<span className="text-blue-600">Track</span>
            </span>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-7">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
                {eyebrow}
              </p>
              <h1 className="text-2xl font-bold tracking-tight text-slate-950">
                {title}
              </h1>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {description}
              </p>
            </div>

            {children}
          </div>

          {footer ? (
            <div className="mt-6 text-center text-xs text-slate-500">
              {footer}
            </div>
          ) : null}
        </div>
      </section>
    </main>
  )
}
