import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import type { LandingStoryStage } from '../model/landingStory'
import '../quoteSection.css'

interface QuoteSectionProps {
  stage: LandingStoryStage
  reducedMotion: boolean
}

const quoteItems = [
  ['Eje mecanizado AISI 4140', '120 pzas', '$1,350', '$162,000'],
  ['Rectificado y acabado', '120 pzas', '$145', '$17,400'],
  ['Inspección dimensional', '1 lote', '$5,100', '$5,100'],
] as const

function clamp(value: number) {
  return Math.min(1, Math.max(0, value))
}

function rangeProgress(progress: number, start: number, end: number) {
  if (end <= start) return progress >= end ? 1 : 0
  return clamp((progress - start) / (end - start))
}

export function QuoteSection({ stage, reducedMotion }: QuoteSectionProps) {
  const sectionRef = useRef<HTMLElement | null>(null)
  const [scrollProgress, setScrollProgress] = useState(reducedMotion ? 1 : 0)

  useEffect(() => {
    if (reducedMotion) {
      setScrollProgress(1)
      return
    }

    let frame = 0

    const sync = () => {
      frame = 0
      const section = sectionRef.current
      if (!section) return

      const rect = section.getBoundingClientRect()
      const travel = Math.max(section.offsetHeight - window.innerHeight, 1)
      const next = clamp(-rect.top / travel)

      setScrollProgress((previous) =>
        Math.abs(previous - next) > 0.002 ? next : previous,
      )
    }

    const requestSync = () => {
      if (frame) return
      frame = window.requestAnimationFrame(sync)
    }

    sync()
    window.addEventListener('scroll', requestSync, { passive: true })
    window.addEventListener('resize', requestSync)

    return () => {
      window.removeEventListener('scroll', requestSync)
      window.removeEventListener('resize', requestSync)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [reducedMotion])

  useEffect(() => {
    if (reducedMotion) return

    const accelerateReverse = (event: WheelEvent) => {
      if (event.deltaY >= 0 || event.ctrlKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)) {
        return
      }

      const section = sectionRef.current
      if (!section) return

      const rect = section.getBoundingClientRect()
      const travel = Math.max(section.offsetHeight - window.innerHeight, 1)
      const progress = clamp(-rect.top / travel)

      if (progress <= 0.015 || progress >= 0.995 || rect.top > 0 || rect.bottom <= window.innerHeight) {
        return
      }

      event.preventDefault()

      const deltaPixels =
        event.deltaMode === WheelEvent.DOM_DELTA_LINE
          ? event.deltaY * 16
          : event.deltaMode === WheelEvent.DOM_DELTA_PAGE
            ? event.deltaY * window.innerHeight
            : event.deltaY

      window.scrollBy({ top: deltaPixels * 2, behavior: 'auto' })
    }

    window.addEventListener('wheel', accelerateReverse, { passive: false })
    return () => window.removeEventListener('wheel', accelerateReverse)
  }, [reducedMotion])

  const reveal = (start: number, end: number, distance = 12): CSSProperties => {
    const value = reducedMotion ? 1 : rangeProgress(scrollProgress, start, end)

    return {
      opacity: value,
      transform: `translate3d(0, ${(1 - value) * distance}px, 0)`,
    }
  }

  const entryProgress = reducedMotion ? 1 : rangeProgress(scrollProgress, 0.03, 0.14)
  const composeProgress = reducedMotion ? 1 : rangeProgress(scrollProgress, 0.13, 0.42)
  const reviewProgress = reducedMotion ? 1 : rangeProgress(scrollProgress, 0.43, 0.57)
  const approvalProgress = reducedMotion ? 1 : rangeProgress(scrollProgress, 0.6, 0.8)
  const exitProgress = reducedMotion ? 1 : rangeProgress(scrollProgress, 0.83, 0.97)

  const phase =
    exitProgress > 0
      ? 'Liberando ejecución'
      : approvalProgress > 0
        ? 'Aprobando propuesta'
        : reviewProgress > 0
          ? 'Revisión comercial'
          : composeProgress > 0
            ? 'Construyendo propuesta'
            : 'Conectando expediente'

  const quoteEntryPath =
    'M 880 0 C 876 74, 786 82, 708 128 C 633 173, 590 203, 458 232'
  const quoteExitPath =
    'M 360 715 C 365 805, 306 866, 340 1000'
  const approved = approvalProgress > 0.52
  const sheetOpacity = 0.28 + entryProgress * 0.72
  const sheetRotation = -1.7 + approvalProgress * 1.7
  const reviewBandX = -115 + reviewProgress * 230

  return (
    <section ref={sectionRef} id={stage.id} className="qt-quote-section relative isolate bg-[#030712]">
      <div className="sticky qt-quote-pinned overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_28%_46%,rgba(245,158,11,0.105),transparent_28%),radial-gradient(circle_at_42%_58%,rgba(59,130,246,0.055),transparent_30%),linear-gradient(180deg,#020817_0%,#080d17_48%,#030712_100%)]" />
        <div className="absolute inset-0 opacity-[0.15] [background-image:linear-gradient(rgba(148,163,184,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.04)_1px,transparent_1px)] [background-size:76px_76px] [mask-image:radial-gradient(circle_at_31%_50%,black,transparent_66%)]" />

        <div className="pointer-events-none absolute inset-0 z-[3] hidden lg:block" aria-hidden="true">
          <svg viewBox="0 0 1000 1000" className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
            <defs>
              <linearGradient id="qtQuoteEntry" x1="0.88" y1="0" x2="0.46" y2="0.24">
                <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.42" />
                <stop offset="42%" stopColor="#22d3ee" stopOpacity="0.66" />
                <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.64" />
              </linearGradient>
              <linearGradient id="qtQuoteExit" x1="0.36" y1="0.71" x2="0.34" y2="1">
                <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.72" />
                <stop offset="55%" stopColor="#a78bfa" stopOpacity="0.54" />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.28" />
              </linearGradient>
              <filter id="qtQuoteTraceGlow" x="-80%" y="-50%" width="260%" height="200%">
                <feGaussianBlur stdDeviation="8" />
              </filter>
            </defs>

            <path
              d={quoteEntryPath}
              fill="none"
              stroke="url(#qtQuoteEntry)"
              strokeWidth="13"
              opacity={entryProgress * 0.1}
              filter="url(#qtQuoteTraceGlow)"
            />
            <path
              d={quoteEntryPath}
              fill="none"
              pathLength="1"
              stroke="url(#qtQuoteEntry)"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeDasharray="1"
              strokeDashoffset={1 - entryProgress}
            />
            <circle cx="880" cy="0" r="3.1" fill="#93c5fd" opacity={entryProgress} />
            <circle cx="458" cy="232" r="3.5" fill="#fcd34d" opacity={rangeProgress(entryProgress, 0.7, 1)} />

            <path
              d={quoteExitPath}
              fill="none"
              stroke="url(#qtQuoteExit)"
              strokeWidth="13"
              opacity={exitProgress * 0.1}
              filter="url(#qtQuoteTraceGlow)"
            />
            <path
              d={quoteExitPath}
              fill="none"
              pathLength="1"
              stroke="url(#qtQuoteExit)"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeDasharray="1"
              strokeDashoffset={1 - exitProgress}
            />
            <circle cx="340" cy="1000" r="3.2" fill="#a78bfa" opacity={rangeProgress(exitProgress, 0.74, 1)} />
          </svg>

          <div
            className="absolute left-[36%] top-[82%] flex items-center gap-2.5"
            style={{
              opacity: rangeProgress(exitProgress, 0.28, 0.74),
              transform: `translate3d(0, ${(1 - exitProgress) * 9}px, 0)`,
            }}
          >
            <span className="h-px w-8 bg-gradient-to-r from-amber-300/55 to-violet-300/25" />
            <div>
              <p className="font-mono text-[7px] uppercase tracking-[0.15em] text-slate-600">Siguiente</p>
              <p className="mt-1 text-[9px] font-semibold text-violet-200/80">Orden de trabajo</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 mx-auto grid h-full w-full max-w-[1440px] grid-rows-[auto_1fr] gap-3 px-5 pb-4 pt-4 sm:px-8 sm:pt-5 lg:grid-cols-[1.12fr_0.88fr] lg:grid-rows-1 lg:items-center lg:gap-14 lg:px-12 lg:pb-8 lg:pt-8 xl:px-16">
          <div className="order-2 min-h-0 lg:order-1">
            <div className="relative flex h-full min-h-[390px] items-start justify-center lg:min-h-[610px] lg:items-center">
              <div className="pointer-events-none absolute left-[3%] top-[12%] h-[66%] w-[74%] rounded-full bg-amber-400/[0.065] blur-[95px]" />
              <div className="pointer-events-none absolute right-[2%] top-[26%] h-[44%] w-[44%] rounded-full bg-blue-500/[0.045] blur-[75px]" />

              <div
                className="qt-quote-sheet relative mt-2 w-full max-w-[610px] overflow-hidden rounded-[22px] border bg-[#0a111c]/96 shadow-[0_42px_130px_-52px_rgba(245,158,11,0.72)] backdrop-blur-xl lg:mt-0 lg:rounded-[28px]"
                style={{
                  opacity: sheetOpacity,
                  borderColor: approved
                    ? `rgba(252,211,77,${0.14 + approvalProgress * 0.13})`
                    : `rgba(255,255,255,${0.055 + entryProgress * 0.055})`,
                  transform: `translate3d(0, ${(1 - entryProgress) * 14}px, 0) rotate(${sheetRotation}deg) scale(${0.985 + approvalProgress * 0.015})`,
                }}
              >
                <svg className="pointer-events-none absolute inset-0 z-[6] h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                  <rect
                    x="1"
                    y="1"
                    width="98"
                    height="98"
                    rx="4.5"
                    fill="none"
                    pathLength="1"
                    stroke="#fbbf24"
                    strokeWidth="0.35"
                    strokeDasharray="1"
                    strokeDashoffset={1 - approvalProgress}
                    opacity={approvalProgress * 0.65}
                  />
                </svg>

                <div className="absolute inset-0 bg-[linear-gradient(145deg,rgba(251,191,36,0.035),transparent_34%,rgba(59,130,246,0.022)_72%,transparent)]" />
                <div className="absolute right-[-7%] top-[-10%] h-36 w-36 rounded-full bg-amber-300/[0.055] blur-3xl" />

                <div className="relative border-b border-white/[0.06] px-4 py-3.5 sm:px-5 lg:px-6 lg:py-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${approved ? 'bg-emerald-400 shadow-[0_0_14px_rgba(52,211,153,0.65)]' : 'bg-amber-300 shadow-[0_0_14px_rgba(252,211,77,0.55)]'}`} />
                        <span className="text-[7px] font-extrabold uppercase tracking-[0.16em] text-amber-100/75 lg:text-[8px]">Propuesta comercial</span>
                      </div>
                      <div className="mt-1.5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                        <p className="font-mono text-[12px] font-semibold text-white lg:text-[14px]">COT-2026-014</p>
                        <span className="font-mono text-[7px] text-slate-600">EXP-2026-014</span>
                      </div>
                    </div>
                    <span
                      className={`rounded-lg border px-2 py-1 font-mono text-[7px] lg:px-2.5 lg:py-1.5 ${approved ? 'border-emerald-300/15 bg-emerald-400/[0.06] text-emerald-300' : reviewProgress > 0 ? 'border-amber-300/15 bg-amber-400/[0.055] text-amber-200' : 'border-white/[0.07] bg-white/[0.025] text-slate-500'}`}
                    >
                      {approved ? 'APROBADA' : reviewProgress > 0 ? 'REVISIÓN' : 'BORRADOR'}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-4 border-t border-white/[0.04] pt-3">
                    <div>
                      <p className="text-[6px] font-bold uppercase tracking-[0.11em] text-slate-600">Cliente</p>
                      <p className="mt-1 text-[9px] font-semibold text-slate-200 lg:text-[10px]">AeroParts Manufacturing</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[6px] font-bold uppercase tracking-[0.11em] text-slate-600">Referencia</p>
                      <p className="mt-1 font-mono text-[8px] text-slate-400">SHAFT-014</p>
                    </div>
                  </div>
                </div>

                <div className="relative px-3 py-3 sm:px-4 lg:px-6 lg:py-4">
                  <div className="grid grid-cols-[1fr_64px_68px_82px] gap-2 border-b border-white/[0.055] pb-2 text-[6px] font-bold uppercase tracking-[0.1em] text-slate-700 lg:grid-cols-[1fr_72px_82px_96px] lg:text-[7px]">
                    <span>Concepto</span>
                    <span className="text-right">Cantidad</span>
                    <span className="text-right">Unitario</span>
                    <span className="text-right">Importe</span>
                  </div>

                  <div className="divide-y divide-white/[0.045]">
                    {quoteItems.map(([concept, quantity, unitPrice, total], index) => {
                      const start = 0.17 + index * 0.062
                      const end = start + 0.05

                      return (
                        <div
                          key={concept}
                          className="grid grid-cols-[1fr_64px_68px_82px] gap-2 py-2.5 lg:grid-cols-[1fr_72px_82px_96px] lg:py-3"
                          style={reveal(start, end, 8)}
                        >
                          <div className="min-w-0">
                            <p className="truncate text-[8px] font-semibold text-slate-200 lg:text-[9px]">{concept}</p>
                            <p className="mt-0.5 font-mono text-[6px] text-slate-700">AISI 4140</p>
                          </div>
                          <span className="self-center text-right font-mono text-[7px] text-slate-500 lg:text-[8px]">{quantity}</span>
                          <span className="self-center text-right font-mono text-[7px] text-slate-500 lg:text-[8px]">{unitPrice}</span>
                          <span className="self-center text-right font-mono text-[8px] font-semibold text-slate-300 lg:text-[9px]">{total}</span>
                        </div>
                      )
                    })}
                  </div>

                  <div className="mt-2 grid grid-cols-[1fr_auto] items-end gap-4 border-t border-white/[0.06] pt-3" style={reveal(0.34, 0.42, 8)}>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        ['Entrega', '08 oct 2026'],
                        ['Validez', '7 días'],
                        ['Pago', '50 / 50'],
                      ].map(([label, value]) => (
                        <div
                          key={label}
                          className="relative overflow-hidden rounded-lg border border-white/[0.05] bg-white/[0.018] px-2 py-2"
                          style={{
                            borderColor: reviewProgress > 0
                              ? `rgba(251,191,36,${0.05 + reviewProgress * 0.13})`
                              : 'rgba(255,255,255,0.05)',
                          }}
                        >
                          <p className="text-[5px] font-bold uppercase tracking-[0.09em] text-slate-700 lg:text-[6px]">{label}</p>
                          <p className="mt-1 whitespace-nowrap text-[7px] font-semibold text-slate-300 lg:text-[8px]">{value}</p>
                        </div>
                      ))}
                    </div>

                    <div className="text-right">
                      <p className="text-[6px] font-bold uppercase tracking-[0.11em] text-slate-600">Total</p>
                      <p className="mt-1 font-mono text-[14px] font-semibold tracking-[-0.04em] text-amber-100 lg:text-[17px]">$184,500</p>
                      <p className="mt-0.5 font-mono text-[6px] text-slate-600">MXN + IVA</p>
                    </div>
                  </div>

                  <div
                    className="pointer-events-none absolute inset-y-0 z-[4] w-28 bg-gradient-to-r from-transparent via-amber-200/[0.045] to-transparent"
                    style={{
                      left: `${reviewBandX}%`,
                      opacity: reviewProgress * (1 - approvalProgress * 0.75),
                    }}
                  />
                </div>

                <div className="relative border-t border-white/[0.06] px-4 py-3 sm:px-5 lg:px-6 lg:py-4">
                  <div
                    className="flex items-center justify-between gap-4"
                    style={{ opacity: 0.35 + reviewProgress * 0.65 }}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="grid h-7 w-7 place-items-center rounded-full border border-amber-300/12 bg-amber-300/[0.04] font-mono text-[8px] text-amber-200/75">✓</span>
                      <div>
                        <p className="text-[6px] font-bold uppercase tracking-[0.11em] text-slate-600">Revisión final</p>
                        <p className="mt-0.5 text-[8px] text-slate-300">Plazo, importe y condiciones verificados</p>
                      </div>
                    </div>
                    <div className="hidden items-center gap-1.5 sm:flex">
                      {['PLAZO', 'TOTAL', 'COND.'].map((item) => (
                        <span key={item} className="rounded-full border border-amber-300/10 bg-amber-300/[0.035] px-2 py-1 font-mono text-[5px] text-amber-200/65">{item}</span>
                      ))}
                    </div>
                  </div>

                  <div
                    className="absolute inset-x-4 bottom-2 top-2 flex items-center justify-between rounded-xl border border-emerald-300/12 bg-[#07140f]/94 px-3 backdrop-blur-xl sm:inset-x-5 lg:inset-x-6 lg:px-4"
                    style={{
                      opacity: approvalProgress,
                      transform: `translate3d(0, ${(1 - approvalProgress) * 12}px, 0) scale(${0.97 + approvalProgress * 0.03})`,
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="grid h-8 w-8 place-items-center rounded-full border border-emerald-300/20 bg-emerald-400/[0.08] text-[12px] font-bold text-emerald-300 shadow-[0_0_24px_rgba(52,211,153,0.1)]">✓</span>
                      <div>
                        <p className="text-[7px] font-extrabold uppercase tracking-[0.13em] text-emerald-300">Cotización aprobada</p>
                        <p className="mt-0.5 font-mono text-[7px] text-slate-500">COT-2026-014 · lista para ejecutar</p>
                      </div>
                    </div>
                    <span className="font-mono text-[8px] font-semibold text-white">08 OCT</span>
                  </div>
                </div>
              </div>

              <div className="pointer-events-none absolute left-1/2 top-0 h-10 w-px -translate-x-1/2 bg-gradient-to-b from-blue-300/45 via-cyan-300/35 to-amber-300/25 lg:hidden" style={{ opacity: entryProgress }} />
              <div className="pointer-events-none absolute bottom-0 left-1/2 h-10 w-px -translate-x-1/2 origin-top bg-gradient-to-b from-amber-300/45 to-violet-300/28 lg:hidden" style={{ opacity: exitProgress, transform: `translateX(-50%) scaleY(${exitProgress})` }} />
            </div>
          </div>

          <div className="order-1 lg:order-2 lg:pl-2">
            <div className="flex items-center gap-2.5">
              <span className="rounded-full border border-amber-400/20 bg-amber-400/[0.08] px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.13em] text-amber-200">
                {stage.eyebrow}
              </span>
              <span className="text-[9px] font-semibold tracking-[0.18em] text-slate-600">{stage.step}</span>
            </div>

            <h2 className="mt-3 max-w-[600px] text-[clamp(2rem,8.7vw,3.15rem)] font-semibold leading-[0.96] tracking-[-0.052em] text-white lg:mt-4 lg:text-[clamp(2.15rem,4vw,3.95rem)]">
              {stage.title}
            </h2>

            <p className="mt-3 max-w-lg text-[11px] leading-5 text-slate-300/90 sm:text-[12px] lg:mt-5 lg:text-[13px] lg:leading-6">
              {stage.description}
            </p>

            <div className="mt-6 hidden flex-wrap gap-2 lg:flex">
              {['Conceptos', 'Condiciones', 'Aprobación'].map((item) => (
                <span key={item} className="rounded-full border border-white/[0.07] bg-white/[0.025] px-3 py-1.5 text-[8px] font-bold uppercase tracking-[0.11em] text-slate-400">
                  {item}
                </span>
              ))}
            </div>

            {!reducedMotion ? (
              <div className="mt-3 flex items-center gap-2 lg:mt-7">
                <div className="h-px flex-1 overflow-hidden bg-white/[0.055]">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-400/20 via-amber-300/78 to-violet-300/24 shadow-[0_0_12px_rgba(251,191,36,0.34)]"
                    style={{ width: `${Math.max(3, scrollProgress * 100)}%` }}
                  />
                </div>
                <span className="font-mono text-[7px] text-slate-600">{phase}</span>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}
