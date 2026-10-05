import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import type { LandingStoryStage } from '../model/landingStory'
import '../qualitySection.css'

interface QualitySectionProps {
  stage: LandingStoryStage
  reducedMotion: boolean
}

function clamp(value: number) {
  return Math.min(1, Math.max(0, value))
}

function rangeProgress(progress: number, start: number, end: number) {
  if (end <= start) return progress >= end ? 1 : 0
  return clamp((progress - start) / (end - start))
}

export function QualitySection({ stage, reducedMotion }: QualitySectionProps) {
  const sectionRef = useRef<HTMLElement | null>(null)
  const [scrollProgress, setScrollProgress] = useState(reducedMotion ? 1 : 0)

  useEffect(() => {
    if (reducedMotion) {
      const reducedMotionFrame = window.requestAnimationFrame(() =>
        setScrollProgress(1),
      )
      return () => window.cancelAnimationFrame(reducedMotionFrame)
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
      if (
        event.deltaY >= 0 ||
        event.ctrlKey ||
        Math.abs(event.deltaX) > Math.abs(event.deltaY)
      ) {
        return
      }

      const section = sectionRef.current
      if (!section) return

      const rect = section.getBoundingClientRect()
      const travel = Math.max(section.offsetHeight - window.innerHeight, 1)
      const progress = clamp(-rect.top / travel)

      if (
        progress <= 0.015 ||
        progress >= 0.995 ||
        rect.top > 0 ||
        rect.bottom <= window.innerHeight
      ) {
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

  const entryProgress = reducedMotion
    ? 1
    : rangeProgress(scrollProgress, 0.025, 0.13)
  const scanProgress = reducedMotion
    ? 1
    : rangeProgress(scrollProgress, 0.12, 0.3)
  const dimensionProgress = reducedMotion
    ? 1
    : rangeProgress(scrollProgress, 0.28, 0.46)
  const surfaceProgress = reducedMotion
    ? 1
    : rangeProgress(scrollProgress, 0.44, 0.6)
  const evidenceProgress = reducedMotion
    ? 1
    : rangeProgress(scrollProgress, 0.58, 0.72)
  const conformProgress = reducedMotion
    ? 1
    : rangeProgress(scrollProgress, 0.72, 0.88)
  const exitProgress = reducedMotion
    ? 1
    : rangeProgress(scrollProgress, 0.88, 0.98)

  const phase =
    exitProgress > 0
      ? 'Liberando entrega'
      : conformProgress > 0
        ? 'Cerrando inspección'
        : evidenceProgress > 0
          ? 'Validando evidencia'
          : surfaceProgress > 0
            ? 'Verificando acabado'
            : dimensionProgress > 0
              ? 'Midiendo geometría'
              : scanProgress > 0
                ? 'Escaneando pieza'
                : 'Recibiendo producción'

  const entryPath =
    'M 666 0 C 666 74, 690 105, 686 154 C 682 205, 648 225, 650 262'
  const exitPath =
    'M 688 735 C 730 786, 760 826, 748 880 C 738 925, 756 964, 760 1000'

  const inspectionOpacity = 1 - conformProgress * 0.62
  const inspectionScale = 1 - conformProgress * 0.035
  const scanX = 13 + scanProgress * 74
  const ringStroke = 1 - conformProgress

  return (
    <section
      ref={sectionRef}
      id={stage.id}
      className="qt-quality-section relative isolate bg-[#02100d]"
    >
      <div className="sticky qt-quality-pinned overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_69%_48%,rgba(16,185,129,0.12),transparent_27%),radial-gradient(circle_at_62%_54%,rgba(34,211,238,0.06),transparent_30%),linear-gradient(180deg,#020817_0%,#03130f_50%,#020b0b_100%)]" />
        <div className="absolute inset-0 opacity-[0.17] [background-image:linear-gradient(rgba(110,231,183,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(110,231,183,0.04)_1px,transparent_1px)] [background-size:68px_68px] [mask-image:radial-gradient(circle_at_67%_52%,black,transparent_68%)]" />

        <div
          className="pointer-events-none absolute inset-0 z-[3] hidden lg:block"
          aria-hidden="true"
        >
          <svg
            viewBox="0 0 1000 1000"
            className="absolute inset-0 h-full w-full"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient
                id="qtQualityEntry"
                x1="0.666"
                y1="0"
                x2="0.65"
                y2="0.27"
              >
                <stop offset="0%" stopColor="#34d399" stopOpacity="0.38" />
                <stop offset="48%" stopColor="#22d3ee" stopOpacity="0.62" />
                <stop offset="100%" stopColor="#6ee7b7" stopOpacity="0.7" />
              </linearGradient>
              <linearGradient
                id="qtQualityExit"
                x1="0.688"
                y1="0.73"
                x2="0.76"
                y2="1"
              >
                <stop offset="0%" stopColor="#34d399" stopOpacity="0.75" />
                <stop offset="58%" stopColor="#22d3ee" stopOpacity="0.58" />
                <stop offset="100%" stopColor="#67e8f9" stopOpacity="0.34" />
              </linearGradient>
              <filter
                id="qtQualityGlow"
                x="-80%"
                y="-50%"
                width="260%"
                height="200%"
              >
                <feGaussianBlur stdDeviation="8" />
              </filter>
            </defs>

            <path
              d={entryPath}
              fill="none"
              stroke="url(#qtQualityEntry)"
              strokeWidth="14"
              opacity={entryProgress * 0.11}
              filter="url(#qtQualityGlow)"
            />
            <path
              d={entryPath}
              fill="none"
              pathLength="1"
              stroke="url(#qtQualityEntry)"
              strokeWidth="1.85"
              strokeLinecap="round"
              strokeDasharray="1"
              strokeDashoffset={1 - entryProgress}
            />
            <circle
              cx="666"
              cy="0"
              r="3.4"
              fill="#6ee7b7"
              opacity={entryProgress}
            />
            <circle
              cx="650"
              cy="262"
              r="3.6"
              fill="#a7f3d0"
              opacity={rangeProgress(entryProgress, 0.68, 1)}
            />

            <path
              d={exitPath}
              fill="none"
              stroke="url(#qtQualityExit)"
              strokeWidth="14"
              opacity={exitProgress * 0.11}
              filter="url(#qtQualityGlow)"
            />
            <path
              d={exitPath}
              fill="none"
              pathLength="1"
              stroke="url(#qtQualityExit)"
              strokeWidth="1.9"
              strokeLinecap="round"
              strokeDasharray="1"
              strokeDashoffset={1 - exitProgress}
            />
            <circle
              cx="760"
              cy="1000"
              r="3.4"
              fill="#67e8f9"
              opacity={rangeProgress(exitProgress, 0.72, 1)}
            />
          </svg>

          <div
            className="absolute left-[75.8%] top-[84%] flex items-center gap-2.5"
            style={{ opacity: rangeProgress(exitProgress, 0.24, 0.72) }}
          >
            <span className="h-px w-9 bg-gradient-to-r from-emerald-300/60 via-cyan-300/48 to-cyan-200/28" />
            <div>
              <p className="font-mono text-[7px] uppercase tracking-[0.15em] text-slate-600">
                Siguiente
              </p>
              <p className="mt-1 text-[9px] font-semibold text-cyan-100/85">
                Entrega
              </p>
            </div>
          </div>
        </div>

        <div className="relative z-10 mx-auto grid h-full w-full max-w-[1440px] grid-rows-[auto_1fr] gap-3 px-5 pb-4 pt-4 sm:px-8 sm:pt-5 lg:grid-cols-[0.72fr_1.28fr] lg:grid-rows-1 lg:items-center lg:gap-10 lg:px-12 lg:pb-8 lg:pt-8 xl:px-16">
          <div className="order-1 lg:pr-4">
            <div className="flex items-center gap-2.5">
              <span className="rounded-full border border-emerald-400/20 bg-emerald-400/[0.08] px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.13em] text-emerald-200">
                {stage.eyebrow}
              </span>
              <span className="text-[9px] font-semibold tracking-[0.18em] text-slate-600">
                {stage.step}
              </span>
            </div>

            <h2 className="mt-3 max-w-[590px] text-[clamp(2rem,8.7vw,3.15rem)] font-semibold leading-[0.96] tracking-[-0.052em] text-white lg:mt-4 lg:text-[clamp(2.15rem,3.9vw,3.9rem)]">
              {stage.title}
            </h2>

            <p className="mt-3 max-w-lg text-[11px] leading-5 text-slate-300/90 sm:text-[12px] lg:mt-5 lg:text-[13px] lg:leading-6">
              {stage.description}
            </p>

            <div className="mt-6 hidden flex-wrap gap-2 lg:flex">
              {['Dimensional', 'Acabado', 'Evidencia'].map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-white/[0.07] bg-white/[0.025] px-3 py-1.5 text-[8px] font-bold uppercase tracking-[0.11em] text-slate-400"
                >
                  {item}
                </span>
              ))}
            </div>

            <div
              className="mt-7 hidden max-w-[470px] items-center gap-3 lg:flex"
              style={reveal(0.08, 0.18, 8)}
            >
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-20" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-300" />
              </span>
              <div>
                <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-emerald-200/80">
                  OT-2026-014 · LOT-4140-202
                </p>
                <p className="mt-1 text-[8px] text-slate-500">
                  La pieza fabricada entra a inspección sin perder su historia.
                </p>
              </div>
            </div>

            {!reducedMotion ? (
              <div className="mt-3 flex items-center gap-2 lg:mt-7">
                <div className="h-px flex-1 overflow-hidden bg-white/[0.055]">
                  <div
                    className="h-full bg-gradient-to-r from-sky-300/20 via-emerald-300/80 to-cyan-200/28 shadow-[0_0_12px_rgba(52,211,153,0.4)]"
                    style={{ width: `${Math.max(3, scrollProgress * 100)}%` }}
                  />
                </div>
                <span className="font-mono text-[7px] text-slate-600">
                  {phase}
                </span>
              </div>
            ) : null}
          </div>

          <div className="order-2 min-h-0">
            <div className="relative h-full min-h-[410px] lg:min-h-[620px]">
              <div className="pointer-events-none absolute left-[10%] top-[15%] h-[68%] w-[82%] rounded-[50%] bg-emerald-400/[0.045] blur-[95px]" />

              <div
                className="absolute inset-0 hidden lg:block"
                style={{
                  opacity: inspectionOpacity,
                  transform: `scale(${inspectionScale})`,
                  transformOrigin: '56% 50%',
                }}
              >
                <div className="absolute left-[55%] top-[48%] h-[330px] w-[520px] -translate-x-1/2 -translate-y-1/2">
                  <div className="absolute left-1/2 top-1/2 h-[190px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border border-emerald-200/[0.055]" />
                  <div className="absolute left-1/2 top-1/2 h-[246px] w-[440px] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border border-dashed border-cyan-200/[0.045]" />

                  <div className="absolute left-1/2 top-1/2 z-[8] -translate-x-1/2 -translate-y-1/2">
                    <div className="qt-quality-piece relative h-[58px] w-[280px] rounded-[29px] border border-emerald-100/20 bg-[linear-gradient(180deg,#c7d6dc_0%,#738d99_24%,#1b3840_52%,#8aa5ad_76%,#c5d7db_100%)] shadow-[0_0_55px_rgba(16,185,129,0.14)]">
                      <span className="absolute left-[13%] top-[-4px] h-[66px] w-px bg-white/14" />
                      <span className="absolute left-[37%] top-[-4px] h-[66px] w-px bg-white/10" />
                      <span className="absolute right-[18%] top-[-4px] h-[66px] w-px bg-slate-950/25" />
                      <span className="absolute left-1/2 top-1/2 h-[7px] w-[174px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/[0.14] blur-[1px]" />
                    </div>
                    <div className="mt-3 text-center">
                      <p className="font-mono text-[7px] font-semibold text-emerald-100/75">
                        LOT-4140-202
                      </p>
                      <p className="mt-1 font-mono text-[6px] text-slate-600">
                        EJE · AISI 4140
                      </p>
                    </div>
                  </div>

                  <div
                    className="pointer-events-none absolute inset-y-[16%] z-[12] w-px bg-gradient-to-b from-transparent via-emerald-100 to-transparent shadow-[0_0_18px_rgba(110,231,183,0.72)]"
                    style={{
                      left: `${scanX}%`,
                      opacity: scanProgress * (1 - conformProgress),
                    }}
                  />
                  <div
                    className="pointer-events-none absolute inset-y-[30%] z-[11] w-[58px] -translate-x-1/2 bg-gradient-to-r from-transparent via-emerald-200/[0.06] to-transparent blur-sm"
                    style={{
                      left: `${scanX}%`,
                      opacity: scanProgress * (1 - conformProgress * 0.7),
                    }}
                  />

                  <div
                    className="absolute left-[8%] top-[12%]"
                    style={reveal(0.28, 0.42, 8)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-[6px] font-bold uppercase tracking-[0.12em] text-slate-600">
                          Dimensional
                        </p>
                        <p className="mt-1 font-mono text-[12px] font-semibold text-emerald-100">
                          Ø48.00 mm
                        </p>
                        <p className="mt-0.5 font-mono text-[6px] text-emerald-300/70">
                          ±0.02 · CONFORME
                        </p>
                      </div>
                      <span className="h-px w-16 bg-gradient-to-r from-emerald-300/45 to-emerald-300/5" />
                    </div>
                  </div>

                  <div
                    className="absolute right-[3%] top-[22%]"
                    style={reveal(0.44, 0.56, 8)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="h-px w-14 bg-gradient-to-r from-cyan-300/5 to-cyan-300/45" />
                      <div>
                        <p className="text-[6px] font-bold uppercase tracking-[0.12em] text-slate-600">
                          Acabado superficial
                        </p>
                        <p className="mt-1 font-mono text-[12px] font-semibold text-cyan-100">
                          Ra 1.6
                        </p>
                        <p className="mt-0.5 font-mono text-[6px] text-emerald-300/70">
                          CONFORME
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    className="absolute bottom-[8%] left-[17%]"
                    style={reveal(0.58, 0.7, 8)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-[6px] font-bold uppercase tracking-[0.12em] text-slate-600">
                          Evidencia
                        </p>
                        <p className="mt-1 text-[8px] font-semibold text-slate-200">
                          Plano REV C · lote vinculado
                        </p>
                        <p className="mt-0.5 font-mono text-[6px] text-emerald-300/70">
                          TRAZABILIDAD OK
                        </p>
                      </div>
                      <span className="h-px w-12 bg-gradient-to-r from-emerald-300/45 to-emerald-300/5" />
                    </div>
                  </div>

                  <svg
                    viewBox="0 0 520 330"
                    className="pointer-events-none absolute inset-0 h-full w-full"
                    aria-hidden="true"
                  >
                    <path
                      d="M 118 112 L 190 140"
                      fill="none"
                      stroke="rgba(110,231,183,0.16)"
                      strokeWidth="1"
                      pathLength="1"
                      strokeDasharray="1"
                      strokeDashoffset={1 - dimensionProgress}
                    />
                    <path
                      d="M 406 135 L 338 152"
                      fill="none"
                      stroke="rgba(103,232,249,0.14)"
                      strokeWidth="1"
                      pathLength="1"
                      strokeDasharray="1"
                      strokeDashoffset={1 - surfaceProgress}
                    />
                    <path
                      d="M 162 266 L 222 205"
                      fill="none"
                      stroke="rgba(110,231,183,0.14)"
                      strokeWidth="1"
                      pathLength="1"
                      strokeDasharray="1"
                      strokeDashoffset={1 - evidenceProgress}
                    />
                  </svg>
                </div>
              </div>

              <div
                className="absolute inset-0 hidden lg:grid place-items-center"
                style={{ opacity: conformProgress }}
              >
                <div
                  className="relative h-[430px] w-[430px]"
                  style={{
                    transform: `scale(${0.82 + conformProgress * 0.18})`,
                  }}
                >
                  <svg
                    viewBox="0 0 430 430"
                    className="absolute inset-0 h-full w-full"
                    aria-hidden="true"
                  >
                    <defs>
                      <linearGradient
                        id="qtQualityRing"
                        x1="0"
                        y1="0"
                        x2="1"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#34d399"
                          stopOpacity="0.82"
                        />
                        <stop
                          offset="48%"
                          stopColor="#6ee7b7"
                          stopOpacity="0.65"
                        />
                        <stop
                          offset="100%"
                          stopColor="#22d3ee"
                          stopOpacity="0.42"
                        />
                      </linearGradient>
                      <filter
                        id="qtQualityRingGlow"
                        x="-60%"
                        y="-60%"
                        width="220%"
                        height="220%"
                      >
                        <feGaussianBlur stdDeviation="8" />
                      </filter>
                    </defs>
                    <circle
                      cx="215"
                      cy="215"
                      r="172"
                      fill="none"
                      stroke="url(#qtQualityRing)"
                      strokeWidth="16"
                      opacity={conformProgress * 0.1}
                      filter="url(#qtQualityRingGlow)"
                    />
                    <circle
                      cx="215"
                      cy="215"
                      r="172"
                      fill="none"
                      pathLength="1"
                      stroke="url(#qtQualityRing)"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeDasharray="1"
                      strokeDashoffset={ringStroke}
                      transform="rotate(-90 215 215)"
                    />
                    <circle
                      cx="215"
                      cy="215"
                      r="139"
                      fill="none"
                      stroke="rgba(110,231,183,0.08)"
                      strokeWidth="1"
                      strokeDasharray="3 8"
                    />
                  </svg>

                  <div className="absolute inset-[86px] grid place-items-center rounded-full border border-emerald-200/12 bg-[#03110e]/92 text-center shadow-[0_0_80px_rgba(16,185,129,0.14)] backdrop-blur-xl">
                    <div>
                      <p className="text-[7px] font-bold uppercase tracking-[0.16em] text-emerald-200/70">
                        Inspección conforme
                      </p>
                      <p className="mt-2 font-mono text-[27px] font-semibold tracking-[-0.05em] text-white">
                        3 / 3
                      </p>
                      <p className="mt-1 text-[7px] text-slate-500">
                        verificaciones aprobadas
                      </p>
                      <div className="mx-auto mt-4 h-px w-28 bg-gradient-to-r from-transparent via-emerald-300/45 to-transparent" />
                      <p className="mt-3 font-mono text-[8px] font-semibold text-emerald-300">
                        CONFORME ✓
                      </p>
                    </div>
                  </div>

                  <div className="absolute left-1/2 top-[9px] -translate-x-1/2 text-center">
                    <p className="font-mono text-[7px] font-semibold text-emerald-100">
                      Ø48.00
                    </p>
                    <p className="mt-0.5 text-[5px] uppercase tracking-[0.11em] text-slate-600">
                      dimensional
                    </p>
                  </div>
                  <div className="absolute right-[0px] top-1/2 -translate-y-1/2 text-center">
                    <p className="font-mono text-[7px] font-semibold text-cyan-100">
                      Ra 1.6
                    </p>
                    <p className="mt-0.5 text-[5px] uppercase tracking-[0.11em] text-slate-600">
                      acabado
                    </p>
                  </div>
                  <div className="absolute bottom-[8px] left-1/2 -translate-x-1/2 text-center">
                    <p className="font-mono text-[7px] font-semibold text-emerald-100">
                      REV C
                    </p>
                    <p className="mt-0.5 text-[5px] uppercase tracking-[0.11em] text-slate-600">
                      evidencia
                    </p>
                  </div>
                  <div className="absolute left-[-4px] top-1/2 -translate-y-1/2 text-center">
                    <p className="font-mono text-[7px] font-semibold text-slate-300">
                      LOT-4140-202
                    </p>
                    <p className="mt-0.5 text-[5px] uppercase tracking-[0.11em] text-slate-600">
                      trazable
                    </p>
                  </div>
                </div>

                <div
                  className="absolute bottom-[11%] left-[56%] -translate-x-1/2 text-center"
                  style={{ opacity: rangeProgress(conformProgress, 0.5, 1) }}
                >
                  <p className="text-[7px] font-bold uppercase tracking-[0.14em] text-emerald-300/75">
                    Liberada para entrega
                  </p>
                  <p className="mt-1 font-mono text-[8px] text-slate-500">
                    OT-2026-014 · LOT-4140-202
                  </p>
                </div>
              </div>

              <div className="relative mx-auto mt-2 h-[370px] w-full max-w-[540px] lg:hidden">
                <div className="absolute left-1/2 top-[88px] h-[34px] w-[190px] -translate-x-1/2 rounded-[18px] border border-emerald-100/20 bg-[linear-gradient(180deg,#c7d6dc_0%,#738d99_28%,#1b3840_55%,#a6bcc1_100%)] shadow-[0_0_35px_rgba(16,185,129,0.12)]" />
                <div
                  className="absolute left-1/2 top-[66px] h-[84px] w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-emerald-200 to-transparent shadow-[0_0_12px_rgba(110,231,183,0.6)]"
                  style={{ opacity: scanProgress * (1 - conformProgress) }}
                />

                <div
                  className="space-y-2 pt-[155px]"
                  style={{ opacity: inspectionOpacity }}
                >
                  {[
                    ['Dimensional', 'Ø48.00 mm · ±0.02', dimensionProgress],
                    ['Acabado', 'Ra 1.6', surfaceProgress],
                    ['Evidencia', 'REV C · lote vinculado', evidenceProgress],
                  ].map(([label, value, progress]) => (
                    <div
                      key={String(label)}
                      className="flex items-center justify-between rounded-xl border border-white/[0.055] bg-white/[0.018] px-3 py-2.5"
                      style={{ opacity: Number(progress) }}
                    >
                      <div>
                        <p className="text-[7px] font-bold uppercase tracking-[0.11em] text-slate-500">
                          {label}
                        </p>
                        <p className="mt-1 font-mono text-[8px] text-slate-200">
                          {value}
                        </p>
                      </div>
                      <span className="font-mono text-[6px] font-semibold text-emerald-300">
                        CONFORME ✓
                      </span>
                    </div>
                  ))}
                </div>

                <div
                  className="absolute inset-0 grid place-items-center"
                  style={{ opacity: conformProgress }}
                >
                  <div className="grid h-[210px] w-[210px] place-items-center rounded-full border border-emerald-300/18 bg-[#03110e]/92 text-center shadow-[0_0_55px_rgba(16,185,129,0.13)] backdrop-blur-xl">
                    <div>
                      <p className="text-[6px] font-bold uppercase tracking-[0.14em] text-emerald-200/70">
                        Inspección conforme
                      </p>
                      <p className="mt-2 font-mono text-[22px] font-semibold text-white">
                        3 / 3
                      </p>
                      <p className="mt-1 text-[7px] text-slate-500">
                        verificaciones aprobadas
                      </p>
                      <p className="mt-3 font-mono text-[7px] font-semibold text-emerald-300">
                        LIBERADA ✓
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  className="pointer-events-none absolute left-1/2 top-0 h-9 w-px -translate-x-1/2 bg-gradient-to-b from-emerald-300/45 to-transparent"
                  style={{ opacity: entryProgress }}
                />
                <div
                  className="pointer-events-none absolute bottom-0 left-1/2 h-10 w-px -translate-x-1/2 origin-top bg-gradient-to-b from-emerald-300/45 to-cyan-300/32"
                  style={{
                    opacity: exitProgress,
                    transform: `translateX(-50%) scaleY(${exitProgress})`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
