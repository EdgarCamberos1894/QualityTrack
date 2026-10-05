import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import type { LandingStoryStage } from '../model/landingStory'
import '../caseSection.css'

interface CaseSectionProps {
  stage: LandingStoryStage
  reducedMotion: boolean
}

const caseEvents = [
  {
    title: 'Solicitud recibida',
    detail: 'SOL-2026-014 entra al flujo',
    time: '09:12',
  },
  {
    title: 'Revisión interna',
    detail: 'Contexto técnico validado',
    time: '09:28',
  },
  {
    title: 'Documento vinculado',
    detail: 'Plano_eje_REV-C.pdf',
    time: '09:41',
  },
  {
    title: 'Aclaración solicitada',
    detail: 'Confirmar tolerancia Ø48',
    time: '10:05',
  },
  {
    title: 'Cliente responde',
    detail: 'Tolerancia confirmada ±0.02 mm',
    time: '10:32',
  },
] as const

function clamp(value: number) {
  return Math.min(1, Math.max(0, value))
}

function rangeProgress(progress: number, start: number, end: number) {
  if (end <= start) return progress >= end ? 1 : 0
  return clamp((progress - start) / (end - start))
}

export function CaseSection({ stage, reducedMotion }: CaseSectionProps) {
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

  const reveal = (start: number, end: number, distance = 14): CSSProperties => {
    const value = reducedMotion ? 1 : rangeProgress(scrollProgress, start, end)

    return {
      opacity: value,
      transform: `translate3d(0, ${(1 - value) * distance}px, 0)`,
    }
  }

  const entryProgress = reducedMotion ? 1 : rangeProgress(scrollProgress, 0.03, 0.14)
  const eventsProgress = reducedMotion ? 1 : rangeProgress(scrollProgress, 0.16, 0.46)
  const documentProgress = reducedMotion ? 1 : rangeProgress(scrollProgress, 0.48, 0.62)
  const consolidationProgress = reducedMotion ? 1 : rangeProgress(scrollProgress, 0.66, 0.84)
  const exitProgress = reducedMotion ? 1 : rangeProgress(scrollProgress, 0.88, 0.97)

  const phase =
    exitProgress > 0
      ? 'Preparando cotización'
      : consolidationProgress > 0
        ? 'Consolidando'
        : documentProgress > 0
          ? 'Vinculando evidencia'
          : eventsProgress > 0
            ? 'Registrando eventos'
            : 'Abriendo expediente'

  const timelineOpacity = 1 - consolidationProgress * 0.68
  const summaryScale = 0.94 + consolidationProgress * 0.06

  return (
    <section ref={sectionRef} id={stage.id} className="qt-case-section relative isolate bg-[#020817]">
      <div className="sticky qt-case-pinned overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_43%,rgba(37,99,235,0.14),transparent_28%),radial-gradient(circle_at_76%_58%,rgba(34,211,238,0.08),transparent_24%),linear-gradient(180deg,#020817_0%,#06101e_46%,#020817_100%)]" />
        <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(148,163,184,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.05)_1px,transparent_1px)] [background-size:72px_72px] [mask-image:radial-gradient(circle_at_72%_48%,black,transparent_64%)]" />

        <div className="pointer-events-none absolute inset-0 z-[2] hidden lg:block" aria-hidden="true">
          <svg viewBox="0 0 1000 250" className="absolute left-0 top-0 h-[31%] w-full overflow-visible" preserveAspectRatio="none">
            <defs>
              <linearGradient id="qtCaseEntry" x1="0.24" y1="0" x2="0.72" y2="1">
                <stop offset="0%" stopColor="#67e8f9" stopOpacity="0.18" />
                <stop offset="45%" stopColor="#22d3ee" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.35" />
              </linearGradient>
              <filter id="qtCaseGlow" x="-80%" y="-80%" width="260%" height="260%">
                <feGaussianBlur stdDeviation="7" />
              </filter>
            </defs>
            <path
              d="M 250 0 C 270 58, 430 54, 492 108 C 548 157, 594 180, 718 208"
              fill="none"
              stroke="url(#qtCaseEntry)"
              strokeWidth="12"
              opacity={0.04 + entryProgress * 0.14}
              filter="url(#qtCaseGlow)"
            />
            <path
              d="M 250 0 C 270 58, 430 54, 492 108 C 548 157, 594 180, 718 208"
              fill="none"
              stroke="url(#qtCaseEntry)"
              strokeWidth="1.5"
              pathLength="1"
              strokeDasharray={`${entryProgress} ${Math.max(0.001, 1 - entryProgress)}`}
              opacity={0.2 + entryProgress * 0.78}
            />
            <circle cx="718" cy="208" r={2.5 + entryProgress * 1.5} fill="#67e8f9" opacity={entryProgress} />
          </svg>
        </div>

        <div className="relative z-10 mx-auto grid h-full w-full max-w-[1440px] grid-rows-[auto_1fr] gap-3 px-5 pb-4 pt-4 sm:px-8 sm:pt-5 lg:grid-cols-[0.82fr_1.18fr] lg:grid-rows-1 lg:items-center lg:gap-14 lg:px-12 lg:pb-8 lg:pt-8 xl:px-16">
          <div className="order-1 lg:pr-4">
            <div className="flex items-center gap-2.5">
              <span className="rounded-full border border-blue-400/20 bg-blue-400/10 px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.13em] text-blue-200">
                {stage.eyebrow}
              </span>
              <span className="text-[9px] font-semibold tracking-[0.18em] text-slate-600">{stage.step}</span>
            </div>

            <h2 className="mt-3 max-w-[590px] text-[clamp(2rem,8.7vw,3.1rem)] font-semibold leading-[0.96] tracking-[-0.05em] text-white lg:mt-4 lg:text-[clamp(2.15rem,4vw,3.9rem)]">
              {stage.title}
            </h2>

            <p className="mt-3 max-w-lg text-[11px] leading-5 text-slate-300/90 sm:text-[12px] lg:mt-5 lg:text-[13px] lg:leading-6">
              {stage.description}
            </p>

            <div className="mt-6 hidden flex-wrap gap-2 lg:flex">
              {['Historial', 'Documentos', 'Decisiones'].map((item) => (
                <span key={item} className="rounded-full border border-white/[0.07] bg-white/[0.025] px-3 py-1.5 text-[8px] font-bold uppercase tracking-[0.11em] text-slate-400">
                  {item}
                </span>
              ))}
            </div>

            {!reducedMotion ? (
              <div className="mt-3 flex items-center gap-2 lg:mt-7">
                <div className="h-px flex-1 overflow-hidden bg-white/[0.055]">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500/30 via-cyan-300/75 to-blue-200/20 shadow-[0_0_12px_rgba(59,130,246,0.4)]"
                    style={{ width: `${Math.max(3, scrollProgress * 100)}%` }}
                  />
                </div>
                <span className="font-mono text-[7px] text-slate-600">{phase}</span>
              </div>
            ) : null}
          </div>

          <div className="order-2 min-h-0 lg:order-2">
            <div className="relative flex h-full min-h-0 items-start justify-center lg:min-h-[610px] lg:items-center">
              <div className="pointer-events-none absolute left-[12%] top-[10%] h-[70%] w-[72%] rounded-full bg-blue-500/[0.075] blur-[90px]" />
              <div className="pointer-events-none absolute right-[3%] top-[30%] h-[46%] w-[46%] rounded-full bg-cyan-400/[0.055] blur-[80px]" />

              <div className="qt-case-frame relative mt-1 w-full max-w-[650px] overflow-hidden rounded-[24px] border border-blue-200/[0.12] bg-[#07111f]/94 shadow-[0_42px_120px_-50px_rgba(37,99,235,0.85)] backdrop-blur-2xl lg:mt-0 lg:rounded-[30px]">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-300/50 to-transparent" />
                <div className="border-b border-white/[0.06] px-4 py-3 sm:px-5 lg:px-6 lg:py-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-blue-300 shadow-[0_0_14px_rgba(96,165,250,0.7)]" />
                        <span className="text-[8px] font-extrabold uppercase tracking-[0.15em] text-blue-100/85">Expediente 360</span>
                      </div>
                      <div className="mt-1.5 flex items-baseline gap-2.5">
                        <p className="font-mono text-[12px] font-semibold text-white lg:text-[14px]">EXP-2026-014</p>
                        <span className="font-mono text-[7px] text-slate-600">desde SOL-2026-014</span>
                      </div>
                    </div>
                    <span className="rounded-lg border border-emerald-300/12 bg-emerald-400/[0.055] px-2 py-1 font-mono text-[7px] text-emerald-300 lg:px-2.5 lg:py-1.5">ACTIVO</span>
                  </div>
                </div>

                <div className="relative px-4 py-3 sm:px-5 lg:px-6 lg:py-5">
                  <div className="absolute bottom-4 left-[27px] top-4 w-px bg-white/[0.055] sm:left-[31px] lg:left-[39px]" />
                  <div
                    className="absolute left-[27px] top-4 w-px origin-top bg-gradient-to-b from-blue-300 via-cyan-300/80 to-cyan-300/20 shadow-[0_0_10px_rgba(59,130,246,0.38)] sm:left-[31px] lg:left-[39px]"
                    style={{ height: 'calc(100% - 2rem)', transform: `scaleY(${eventsProgress})` }}
                  />

                  <div style={{ opacity: timelineOpacity }}>
                    <div className="space-y-1.5 lg:space-y-2">
                      {caseEvents.map((event, index) => {
                        const start = 0.16 + index * 0.052
                        const end = start + 0.055
                        const nextStart = index < caseEvents.length - 1 ? 0.16 + (index + 1) * 0.052 : 0.48
                        const eventProgress = reducedMotion ? 1 : rangeProgress(scrollProgress, start, end)
                        const activeEvent = eventProgress > 0.82 && scrollProgress < nextStart && consolidationProgress < 0.5

                        return (
                          <div
                            key={event.title}
                            className="relative flex items-center gap-3 rounded-xl border border-transparent px-1.5 py-1.5 transition-colors lg:gap-4 lg:px-2 lg:py-2"
                            style={{
                              ...reveal(start, end, 10),
                              background: activeEvent ? 'rgba(59,130,246,0.045)' : 'transparent',
                              borderColor: activeEvent ? 'rgba(147,197,253,0.08)' : 'transparent',
                            }}
                          >
                            <div className="relative z-[2] grid h-4 w-4 shrink-0 place-items-center rounded-full border border-blue-300/25 bg-[#07111f] lg:h-5 lg:w-5">
                              <span className="h-1.5 w-1.5 rounded-full bg-blue-300 shadow-[0_0_8px_rgba(96,165,250,0.8)]" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-3">
                                <p className="text-[8px] font-bold text-slate-200 lg:text-[9px]">{event.title}</p>
                                <span className="font-mono text-[6px] text-slate-700 lg:text-[7px]">{event.time}</span>
                              </div>
                              <p className="mt-0.5 truncate text-[7px] text-slate-500 lg:text-[8px]">{event.detail}</p>
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    <div
                      className="qt-case-document relative ml-7 mt-2 overflow-hidden rounded-xl border border-cyan-300/10 bg-cyan-300/[0.035] p-3 sm:ml-8 lg:ml-10 lg:mt-3 lg:p-3.5"
                      style={{
                        opacity: documentProgress * (1 - consolidationProgress),
                        transform: `translate3d(${(1 - documentProgress) * 12}px, ${(1 - documentProgress) * 8}px, 0) scale(${0.97 + documentProgress * 0.03})`,
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative grid h-10 w-12 shrink-0 place-items-center rounded-lg border border-cyan-300/12 bg-[#061523] lg:h-12 lg:w-14">
                          <span className="h-4 w-7 rounded-[50%] border border-cyan-200/45 lg:h-5 lg:w-8" />
                          <span className="absolute h-px w-8 bg-cyan-300/18 lg:w-10" />
                          <span className="absolute h-7 w-px bg-cyan-300/18 lg:h-8" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-[7px] font-bold uppercase tracking-[0.11em] text-cyan-200/70">Evidencia vinculada</span>
                            <span className="font-mono text-[6px] text-cyan-300/60">REV C</span>
                          </div>
                          <p className="mt-1 truncate text-[9px] font-semibold text-slate-200">Plano_eje_REV-C.pdf</p>
                          <p className="mt-0.5 text-[7px] text-slate-600">Abre el documento desde el evento que lo originó</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    className="pointer-events-none absolute inset-x-4 top-1/2 z-[5] sm:inset-x-5 lg:inset-x-6"
                    style={{
                      opacity: consolidationProgress,
                      transform: `translateY(calc(-50% + ${(1 - consolidationProgress) * 18}px)) scale(${summaryScale})`,
                    }}
                  >
                    <div className="rounded-2xl border border-blue-200/[0.14] bg-[#07111f]/98 p-4 shadow-[0_28px_80px_-34px_rgba(37,99,235,0.82)] lg:p-5">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-[8px] font-extrabold uppercase tracking-[0.14em] text-blue-200">Historia consolidada</p>
                          <p className="mt-1.5 font-mono text-[13px] font-semibold text-white">EXP-2026-014</p>
                        </div>
                        <span className="grid h-9 w-9 place-items-center rounded-full border border-blue-300/18 bg-blue-400/[0.07] text-[12px] text-blue-200">360°</span>
                      </div>

                      <div className="mt-4 grid grid-cols-3 gap-2">
                        {[
                          ['Eventos', '5'],
                          ['Documentos', '3'],
                          ['Trazabilidad', 'Activa'],
                        ].map(([label, value]) => (
                          <div key={label} className="rounded-xl border border-white/[0.055] bg-white/[0.025] px-2.5 py-2.5">
                            <p className="text-[6px] font-bold uppercase tracking-[0.1em] text-slate-600">{label}</p>
                            <p className="mt-1 text-[9px] font-semibold text-slate-200">{value}</p>
                          </div>
                        ))}
                      </div>

                      <div className="mt-3 flex items-center justify-between rounded-xl border border-amber-300/10 bg-amber-400/[0.035] px-3 py-2.5">
                        <div>
                          <p className="text-[7px] font-bold uppercase tracking-[0.11em] text-amber-200/75">Siguiente movimiento</p>
                          <p className="mt-0.5 text-[9px] font-semibold text-slate-200">Preparar cotización</p>
                        </div>
                        <span className="text-[14px] text-amber-200/60">→</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div
                className="pointer-events-none absolute bottom-[-4%] right-[25%] hidden h-28 w-px origin-top bg-gradient-to-b from-blue-300/55 via-amber-300/22 to-transparent lg:block"
                style={{ opacity: exitProgress, transform: `scaleY(${exitProgress})` }}
              />
              <div
                className="pointer-events-none absolute bottom-0 left-1/2 h-12 w-px origin-top bg-gradient-to-b from-blue-300/50 via-cyan-300/24 to-transparent lg:hidden"
                style={{ opacity: exitProgress, transform: `scaleY(${exitProgress})` }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
