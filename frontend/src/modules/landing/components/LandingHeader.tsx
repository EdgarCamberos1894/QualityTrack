import { Link } from 'react-router-dom'

export function LandingHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-6 lg:px-8">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between rounded-2xl border border-white/10 bg-slate-950/72 px-3.5 shadow-[0_18px_60px_-28px_rgba(2,6,23,0.9)] backdrop-blur-xl sm:px-4">
        <a href="#inicio" className="flex items-center gap-2.5 rounded-xl px-1 py-1">
          <img
            src="/brand/qualitytrack-mark-inverse.svg"
            alt=""
            className="h-8 w-8"
          />
          <div className="leading-none">
            <p className="text-[14px] font-semibold tracking-[-0.02em] text-white">
              Quality<span className="text-blue-400">Track</span>
            </p>
            <p className="mt-1 hidden text-[8px] font-medium uppercase tracking-[0.16em] text-slate-500 sm:block">
              Industrial workflow
            </p>
          </div>
        </a>

        <Link
          to="/login"
          className="inline-flex h-8 items-center justify-center rounded-lg border border-blue-400/30 bg-blue-500 px-3.5 text-[9px] font-bold text-white shadow-[0_8px_30px_-14px_rgba(59,130,246,0.9)] transition hover:bg-blue-400"
        >
          Iniciar sesión
        </Link>
      </div>
    </header>
  )
}
