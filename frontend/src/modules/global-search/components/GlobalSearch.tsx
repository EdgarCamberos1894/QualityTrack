import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGlobalSearch } from '../hooks/useGlobalSearch'
import type { GlobalSearchResultDto } from '../types/globalSearch.types'
import { GlobalSearchResults } from './GlobalSearchResults'

export function GlobalSearch() {
  const navigate = useNavigate()
  const containerRef = useRef<HTMLDivElement | null>(null)
  const desktopInputRef = useRef<HTMLInputElement | null>(null)
  const mobileInputRef = useRef<HTMLInputElement | null>(null)
  const [query, setQuery] = useState('')
  const [desktopOpen, setDesktopOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const search = useGlobalSearch(query)

  const results = search.data?.results ?? []

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setDesktopOpen(false)
      }
    }

    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const shortcut =
        (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k'

      if (shortcut) {
        event.preventDefault()

        if (window.matchMedia('(min-width: 768px)').matches) {
          setDesktopOpen(true)
          window.setTimeout(() => desktopInputRef.current?.focus(), 0)
        } else {
          setMobileOpen(true)
          window.setTimeout(() => mobileInputRef.current?.focus(), 0)
        }
      }

      if (event.key === 'Escape') {
        setDesktopOpen(false)
        setMobileOpen(false)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    if (mobileOpen) {
      window.setTimeout(() => mobileInputRef.current?.focus(), 0)
    }
  }, [mobileOpen])

  const select = (result: GlobalSearchResultDto) => {
    setQuery('')
    setDesktopOpen(false)
    setMobileOpen(false)
    navigate(result.href)
  }

  return (
    <>
      <div
        ref={containerRef}
        className="relative hidden w-full max-w-[360px] md:block"
      >
        <div className="relative">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400"
          >
            ⌕
          </span>
          <input
            ref={desktopInputRef}
            type="search"
            value={query}
            onFocus={() => setDesktopOpen(true)}
            onChange={(event) => {
              setQuery(event.target.value)
              setDesktopOpen(true)
            }}
            onKeyDown={(event) => {
              if (
                event.key === 'Enter' &&
                !search.isDebouncing &&
                !search.isFetching &&
                results[0]
              ) {
                event.preventDefault()
                select(results[0])
              }
            }}
            placeholder="Buscar folio, cliente, material…"
            aria-label="Búsqueda global"
            className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-14 text-xs text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
          />
          <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md border border-slate-200 bg-white px-1.5 py-1 text-[8px] font-semibold text-slate-400">
            Ctrl K
          </span>
        </div>

        {desktopOpen ? (
          <div className="absolute left-0 right-0 top-[46px] z-50 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <GlobalSearchResults
              query={query}
              results={results}
              pending={search.isFetching || search.isDebouncing}
              error={search.error}
              onSelect={select}
            />
          </div>
        ) : null}
      </div>

      <button
        type="button"
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 md:hidden"
        onClick={() => setMobileOpen(true)}
        aria-label="Abrir búsqueda global"
      >
        <span aria-hidden="true" className="text-base">
          ⌕
        </span>
      </button>

      {mobileOpen ? (
        <div className="fixed inset-0 z-[70] bg-slate-950/55 p-4 md:hidden">
          <div className="mx-auto mt-12 w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center gap-3 border-b border-slate-200 p-4">
              <input
                ref={mobileInputRef}
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (
                    event.key === 'Enter' &&
                    !search.isDebouncing &&
                    !search.isFetching &&
                    results[0]
                  ) {
                    event.preventDefault()
                    select(results[0])
                  }
                }}
                placeholder="Buscar en QualityTrack…"
                aria-label="Búsqueda global"
                className="h-11 min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="h-9 rounded-lg px-3 text-xs font-semibold text-slate-500 hover:bg-slate-100"
              >
                Cerrar
              </button>
            </div>

            <GlobalSearchResults
              query={query}
              results={results}
              pending={search.isFetching || search.isDebouncing}
              error={search.error}
              onSelect={select}
            />
          </div>
        </div>
      ) : null}
    </>
  )
}
