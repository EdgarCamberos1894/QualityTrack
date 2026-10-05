import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import type { LandingStoryStage } from '../model/landingStory'
import '../requestSection.css'

interface RequestSectionProps {
  stage: LandingStoryStage
  reducedMotion: boolean
}

const requestFields = [
  ['Cliente / empresa', 'AeroParts Manufacturing'],
  ['Requerimiento', 'Eje mecanizado AISI 4140'],
  ['Cantidad', '120 piezas'],
  ['Fecha requerida', '18 oct 2026'],
  ['Prioridad', 'Alta'],
  ['Especificaciones', 'Rectificado Ra 1.6 · ±0.02 mm'],
] as const

const requestDocuments = [
  ['Plano_eje_REV-C.pdf', '2.8 MB'],
  ['Especificacion_material.pdf', '1.4 MB'],
  ['Tolerancias_y_acabados.pdf', '920 KB'],
] as const

function clamp(value: number) {
  return Math.min(1, Math.max(0, value))
}

function rangeProgress(progress: number, start: number, end: number) {
  if (end <= start) return progress >= end ? 1 : 0
  return clamp((progress - start) / (end - start))
}

export function RequestSection({ stage, reducedMotion }: RequestSectionProps) {
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

  const scrollReveal = (start: number, end: number, distance = 14): CSSProperties => {
    const value = reducedMotion ? 1 : rangeProgress(scrollProgress, start, end)

    return {
      opacity: value,
      transform: `translate3d(0, ${(1 - value) * distance}px, 0)`,
    }
  }

  const linkProgress = reducedMotion ? 1 : rangeProgress(scrollProgress, 0.025, 0.13)
  const fieldProgress = reducedMotion ? 1 : rangeProgress(scrollProgress, 0.15, 0.4)
  const documentProgress = reducedMotion ? 1 : rangeProgress(scrollProgress, 0.42, 0.58)
  const consolidationProgress = reducedMotion ? 1 : rangeProgress(scrollProgress, 0.61, 0.78)
  const exitProgress = reducedMotion ? 1 : rangeProgress(scrollProgress, 0.83, 0.96)

  const phase =
    exitProgress > 0
      ? 5
      : consolidationProgress > 0
        ? 4
        : documentProgress > 0
          ? 3
          : fieldProgress > 0
            ? 2
            : linkProgress > 0
              ? 1
              : 0

  const requestTracePath =
    'M 343 0 C 326 27, 311 61, 329 96 C 352 137, 365 174, 328 206 C 294 236, 245 253, 202 284'
  const requestHandoffPath =
    'M 286 505 C 281 588, 190 635, 205 720 C 219 800, 278 858, 250 1000'

  const formOpacity = 1 - consolidationProgress
  const documentOpacity = documentProgress * (1 - consolidationProgress)
  const handoffLabelProgress = reducedMotion ? 1 : rangeProgress(exitProgress, 0.34, 0.72)
  const sectionClassName = reducedMotion
    ? 'relative isolate min-h-screen bg-[#020817]'
    : 'relative isolate h-[260svh] bg-[#020817] lg:h-[280svh]'
  const pinnedClassName = reducedMotion
    ? 'relative min-h-screen overflow-hidden'
    : 'sticky top-0 h-[100svh] overflow-hidden'

  return (
    <section ref={sectionRef} id={stage.id} className={sectionClassName}>
      <div className={pinnedClassName}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_24%_47%,rgba(8,145,178,0.15),transparent_28%),radial-gradient(circle_at_48%_20%,rgba(37,99,235,0.09),transparent_34%),linear-gradient(180deg,#020617_0%,#041022_48%,#020817_100%)]" />
        <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(148,163,184,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.055)_1px,transparent_1px)] [background-size:68px_68px] [mask-image:radial-gradient(circle_at_30%_48%,black,transparent_68%)]" />
        <div className="pointer-events-none absolute left-[4%] top-[28%] h-[46%] w-[46%] rounded-full bg-cyan-400/[0.055] blur-[110px]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 z-[2] h-16 bg-gradient-to-b from-[#020617] via-[#020617]/58 to-transparent lg:h-24" />

        <div className="pointer-events-none absolute inset-0 z-[3] hidden lg:block" aria-hidden="true">
          <svg
            viewBox="0 0 1000 430"
            className="absolute left-0 top-0 h-[48%] w-full overflow-visible"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="qtRequestTrace" x1="0.343" y1="0" x2="0.2" y2="0.7">
                <stop offset="0%" stopColor="#67e8f9" stopOpacity="0.22" />
                <stop offset="22%" stopColor="#22d3ee" stopOpacity="0.62" />
                <stop offset="70%" stopColor="#60a5fa" stopOpacity="0.48" />
                <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.05" />
              </linearGradient>
              <filter id="qtRequestTraceGlow" x="-60%" y="-60%" width="220%" height="220%">
                <feGaussianBlur stdDeviation="7" />
              </filter>
              <filter id="qtRequestTravelerGlow" x="-200%" y="-200%" width="500%" height="500%">
                <feGaussianBlur stdDeviation="5" />
              </filter>
            </defs>

            <path
              d={requestTracePath}
              fill="none"
              stroke="url(#qtRequestTrace)"
              strokeWidth="12"
              opacity={0.04 + linkProgress * 0.13}
              filter="url(#qtRequestTraceGlow)"
            />
            <path
              d={requestTracePath}
              fill="none"
              stroke="url(#qtRequestTrace)"
              strokeWidth="1.5"
              strokeDasharray="8 10"
              opacity={0.15 + linkProgress * 0.8}
            >
              {!reducedMotion && scrollProgress < 0.99 ? (
                <animate
                  attributeName="stroke-dashoffset"
                  from="0"
                  to="180"
                  dur="7s"
                  repeatCount="indefinite"
                />
              ) : null}
            </path>

            {!reducedMotion && linkProgress > 0 && scrollProgress < 0.81 ? (
              <>
                <circle
                  r="10"
                  fill="#67e8f9"
                  opacity={0.16 * linkProgress}
                  filter="url(#qtRequestTravelerGlow)"
                >
                  <animateMotion dur="5.2s" repeatCount="indefinite" path={requestTracePath} />
                </circle>
                <circle r="3.5" fill="#a5f3fc" opacity={0.95 * linkProgress}>
                  <animateMotion dur="5.2s" repeatCount="indefinite" path={requestTracePath} />
                </circle>
              </>
            ) : null}
          </svg>
        </div>

        <div className="pointer-events-none absolute inset-0 z-[7] hidden lg:block" aria-hidden="true">
          <svg viewBox="0 0 1000 1000" className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
            <defs>
              <linearGradient id="qtRequestHandoff" x1="0.28" y1="0.5" x2="0.25" y2="1">
                <stop offset="0%" stopColor="#34d399" stopOpacity="0.52" />
                <stop offset="24%" stopColor="#22d3ee" stopOpacity="0.76" />
                <stop offset="68%" stopColor="#60a5fa" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.22" />
              </linearGradient>
              <filter id="qtRequestHandoffGlow" x="-80%" y="-30%" width="260%" height="180%">
                <feGaussianBlur stdDeviation="8" />
              </filter>
            </defs>

            <path
              d={requestHandoffPath}
              fill="none"
              stroke="url(#qtRequestHandoff)"
              strokeWidth="13"
              opacity={exitProgress * 0.11}
              filter="url(#qtRequestHandoffGlow)"
            />
            <path
              d={requestHandoffPath}
              fill="none"
              pathLength="1"
              stroke="url(#qtRequestHandoff)"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeDasharray={`${Math.max(0.001, exitProgress)} 1`}
              opacity={0.25 + exitProgress * 0.75}
            />
            <circle cx="286" cy="505" r="3.5" fill="#6ee7b7" opacity={exitProgress} />
            <circle cx="250" cy="1000" r="3.4" fill="#93c5fd" opacity={rangeProgress(exitProgress, 0.72, 1)} />
          </svg>

          <div
            className="absolute left-[15.5%] top-[76%] flex items-center gap-2.5"
            style={{
              opacity: handoffLabelProgress,
              transform: `translate3d(0, ${(1 - handoffLabelProgress) * 10}px, 0)`,
            }}
          >
            <span className="h-px w-9 bg-gradient-to-r from-transparent to-cyan-300/50" />
            <div>
              <p className="font-mono text-[7px] uppercase tracking-[0.16em] text-slate-600">Siguiente</p>
              <p className="mt-1 text-[9px] font-semibold tracking-[0.03em] text-blue-200/80">Expediente 360</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 mx-auto grid h-full w-full max-w-[1440px] grid-rows-[auto_1fr] items-start gap-3 px-5 pb-4 pt-4 sm:px-8 sm:pb-6 sm:pt-5 lg:grid-cols-[1.08fr_0.92fr] lg:grid-rows-1 lg:items-center lg:gap-14 lg:px-12 lg:pb-8 lg:pt-8 xl:px-16">
          <div className="order-1 lg:order-2 lg:pl-4">
            <div className="flex items-center gap-2.5">
              <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.13em] text-cyan-300">
                {stage.eyebrow}
              </span>
              <span className="text-[9px] font-semibold tracking-[0.18em] text-slate-600">{stage.step}</span>
            </div>

            <h2 className="mt-3 max-w-[620px] text-[clamp(2rem,9vw,3.2rem)] font-semibold leading-[0.95] tracking-[-0.055em] text-white lg:mt-4 lg:text-[clamp(2.15rem,4.4vw,4.2rem)] lg:leading-[0.98]">
              {stage.title}
            </h2>

            <p className="mt-3 max-w-lg text-[11px] leading-5 text-slate-300/90 sm:text-[12px] lg:mt-5 lg:text-[13px] lg:leading-6">
              {stage.description}
            </p>

            <div className="mt-6 hidden flex-wrap gap-2 lg:flex">
              {['Requerimientos', 'Documentos', 'Seguimiento'].map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-white/[0.07] bg-white/[0.025] px-3 py-1.5 text-[8px] font-bold uppercase tracking-[0.11em] text-slate-400"
                >
                  {item}
                </span>
              ))}
            </div>

            <div className="mt-7 hidden max-w-[500px] items-start gap-3 rounded-2xl border border-cyan-300/10 bg-slate-950/40 p-3.5 backdrop-blur-md lg:flex">
              <span className="mt-1 flex h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-400 shadow-[0_0_18px_rgba(52,211,153,0.7)]" />
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.11em] text-white">{stage.signal}</p>
                <p className="mt-1 text-[9px] leading-4 text-slate-400">{stage.detail}</p>
              </div>
            </div>

            {!reducedMotion ? (
              <div className="mt-3 flex items-center gap-2 lg:mt-7">
                <div className="h-px flex-1 overflow-hidden bg-white/[0.055]">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500/25 via-cyan-300/80 to-cyan-100/20 shadow-[0_0_12px_rgba(34,211,238,0.45)]"
                    style={{ width: `${Math.max(3, scrollProgress * 100)}%` }}
                  />
                </div>
                <span className="font-mono text-[7px] text-slate-600">
                  {phase === 0
                    ? 'Conectando'
                    : phase === 1
                      ? 'Contexto'
                      : phase === 2
                        ? 'Estructurando'
                        : phase === 3
                          ? 'Documentando'
                          : phase === 4
                            ? 'Consolidando'
                            : 'Continuando'}
                </span>
              </div>
            ) : null}
          </div>

          <div className="order-2 min-h-0 lg:order-1">
            <div className="relative flex h-full min-h-0 items-start justify-center lg:min-h-[610px] lg:items-center">
              <div className="pointer-events-none absolute left-[-14%] top-[8%] h-56 w-56 rounded-full bg-cyan-400/[0.08] blur-[80px] lg:left-[8%] lg:top-[4%] lg:h-[74%] lg:w-[74%] lg:blur-[85px]" />
              <div className="pointer-events-none absolute right-[-20%] top-[30%] h-52 w-52 rounded-full bg-blue-500/[0.07] blur-[80px] lg:left-[20%] lg:right-auto lg:top-[14%] lg:h-[58%] lg:w-[58%] lg:blur-[68px]" />
              <div className="qt-request-workbench pointer-events-none absolute inset-x-0 top-[2%] bottom-[4%] hidden rounded-[34px] border border-white/[0.055] bg-[linear-gradient(145deg,rgba(8,22,38,0.32),rgba(2,8,23,0.05))] shadow-[inset_0_1px_0_rgba(255,255,255,0.025)] lg:block" />

              <div
                className="qt-request-document pointer-events-none absolute left-[2%] top-[9%] z-[2] hidden w-[226px] rounded-2xl border border-white/10 bg-slate-950/72 p-3.5 shadow-[0_30px_90px_-42px_rgba(14,165,233,0.9)] backdrop-blur-xl lg:block"
                style={{
                  opacity: documentOpacity,
                  transform: `perspective(900px) rotateY(7deg) rotateZ(-2.5deg) translate3d(${(1 - documentProgress) * -12}px, ${(1 - documentProgress) * 18}px, 0) scale(${0.95 + documentProgress * 0.05})`,
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[8px] font-extrabold uppercase tracking-[0.15em] text-slate-400">Documento técnico</span>
                  <span className="rounded-md border border-cyan-300/15 bg-cyan-300/10 px-1.5 py-0.5 font-mono text-[7px] text-cyan-200">REV C</span>
                </div>
                <div className="relative mt-3 h-36 overflow-hidden rounded-xl border border-white/[0.06] bg-[#06111d] shadow-[inset_0_0_26px_rgba(14,165,233,0.04)]">
                  <div className="absolute inset-0 opacity-55 [background-image:linear-gradient(rgba(56,189,248,0.085)_1px,transparent_1px),linear-gradient(90deg,rgba(56,189,248,0.085)_1px,transparent_1px)] [background-size:14px_14px]" />
                  <div className="absolute left-5 top-11 h-12 w-32 rounded-[50%] border border-cyan-300/55" />
                  <div className="absolute left-8 top-[54px] h-6 w-26 border-x border-cyan-200/45" />
                  <div className="absolute left-[84px] top-6 h-24 w-px bg-cyan-300/15" />
                  <div className="absolute left-4 top-[70px] h-px w-[164px] bg-cyan-300/15" />
                  <div className="absolute left-3 top-3 font-mono text-[6px] tracking-[0.12em] text-cyan-300/45">Ø48.00 ±0.02</div>
                  <div className="absolute right-3 top-3 font-mono text-[6px] text-slate-600">SCALE 1:2</div>
                  <div className="absolute bottom-3 left-4 font-mono text-[7px] tracking-[0.12em] text-cyan-200/70">SHAFT Ø48 · AISI 4140</div>
                </div>
                <p className="mt-2 font-mono text-[8px] text-slate-500">Plano_eje_REV-C.pdf</p>
              </div>

              <div
                className="qt-request-card relative z-[4] w-full max-w-[570px] overflow-hidden rounded-[24px] border bg-[#07111f]/94 backdrop-blur-2xl lg:absolute lg:left-[14%] lg:top-[10%] lg:w-[78%] lg:rounded-[28px]"
                style={{
                  borderColor: `rgba(165,243,252,${0.07 + linkProgress * 0.13})`,
                  boxShadow: `0 40px 110px -46px rgba(14,165,233,${0.28 + linkProgress * 0.5})`,
                }}
              >
                <div className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-cyan-300/45 to-transparent" />
                {phase >= 1 && phase < 4 ? (
                  <div
                    className="pointer-events-none absolute inset-y-0 left-0 z-[8] w-24 bg-gradient-to-r from-transparent via-cyan-200/[0.045] to-transparent"
                    style={{ transform: `translate3d(${fieldProgress * 520 - 110}%,0,0)` }}
                  />
                ) : null}

                <div className="relative border-b border-white/[0.06] bg-gradient-to-r from-cyan-300/[0.06] via-transparent to-blue-400/[0.04] px-4 py-3 sm:px-5 lg:px-6 lg:py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`h-2 w-2 rounded-full ${consolidationProgress > 0.55 ? 'bg-emerald-400 shadow-[0_0_14px_rgba(52,211,153,0.7)]' : linkProgress > 0.3 ? 'bg-cyan-300 shadow-[0_0_14px_rgba(103,232,249,0.75)]' : 'bg-slate-700'}`}
                        />
                        <span className="text-[8px] font-extrabold uppercase tracking-[0.15em] text-cyan-100/85">
                          {consolidationProgress > 0.55 ? 'Solicitud consolidada' : 'Nueva solicitud'}
                        </span>
                      </div>
                      <p className="mt-1 text-[14px] font-semibold tracking-[-0.025em] text-white lg:mt-1.5 lg:text-[16px]">
                        {consolidationProgress > 0.55 ? 'Contexto listo para continuar' : 'Requerimiento de fabricación'}
                      </p>
                    </div>
                    <span
                      className={`rounded-lg border px-2 py-1 font-mono text-[7px] lg:px-2.5 lg:py-1.5 lg:text-[8px] ${consolidationProgress > 0.55 ? 'border-emerald-300/15 bg-emerald-400/[0.06] text-emerald-300' : 'border-white/[0.07] bg-white/[0.03] text-slate-500'}`}
                    >
                      {consolidationProgress > 0.55 ? 'RECIBIDA' : 'BORRADOR'}
                    </span>
                  </div>

                  <div
                    className="mt-3 overflow-hidden rounded-xl border border-white/[0.05] bg-slate-950/25 px-3 font-mono text-[8px] text-slate-600"
                    style={{
                      maxHeight: `${Math.round(38 * (1 - fieldProgress))}px`,
                      paddingTop: `${Math.round(10 * (1 - fieldProgress))}px`,
                      paddingBottom: `${Math.round(10 * (1 - fieldProgress))}px`,
                      opacity: linkProgress * (1 - fieldProgress),
                    }}
                  >
                    Esperando contexto del cliente…
                  </div>
                </div>

                <div
                  className="overflow-hidden"
                  style={{
                    maxHeight: `${Math.round(520 * formOpacity)}px`,
                    opacity: formOpacity,
                    transform: `scale(${0.985 + formOpacity * 0.015}) translateY(${-8 * consolidationProgress}px)`,
                  }}
                >
                  <div className="grid grid-cols-2 gap-2 px-3 py-3 sm:gap-2.5 sm:px-4 lg:gap-x-5 lg:gap-y-3.5 lg:px-6 lg:py-5">
                    {requestFields.map(([label, value], index) => {
                      const start = 0.15 + index * 0.038
                      const end = start + 0.045

                      return (
                        <div
                          key={label}
                          className="rounded-xl border border-white/[0.055] bg-white/[0.025] px-2.5 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] lg:px-3.5 lg:py-3"
                          style={scrollReveal(start, end, 12)}
                        >
                          <p className="text-[6px] font-bold uppercase tracking-[0.11em] text-slate-600 lg:text-[7px] lg:tracking-[0.13em]">{label}</p>
                          <p className="mt-1 text-[9px] font-semibold leading-3.5 text-slate-200 lg:mt-1.5 lg:text-[10px] lg:leading-4">{value}</p>
                        </div>
                      )
                    })}
                  </div>

                  <div
                    className="border-t border-white/[0.06] bg-slate-950/20 px-3 py-3 sm:px-4 lg:px-6 lg:py-4"
                    style={scrollReveal(0.42, 0.49, 10)}
                  >
                    <div className="mb-2 flex items-center justify-between gap-3 lg:mb-3">
                      <span className="text-[7px] font-bold uppercase tracking-[0.12em] text-slate-500 lg:text-[8px] lg:tracking-[0.13em]">Documentación adjunta</span>
                      <span className="text-[7px] font-semibold text-cyan-300/80 lg:text-[8px]">3 archivos</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5 lg:gap-2">
                      {requestDocuments.map(([name, size], index) => (
                        <div
                          key={name}
                          className="min-w-0 rounded-xl border border-white/[0.055] bg-slate-950/45 p-2 lg:flex lg:items-center lg:gap-2.5 lg:p-2.5"
                          style={scrollReveal(0.44 + index * 0.028, 0.5 + index * 0.02, 8)}
                        >
                          <div className="grid h-6 w-6 shrink-0 place-items-center rounded-lg border border-cyan-300/10 bg-cyan-300/[0.06] font-mono text-[6px] font-bold text-cyan-200 lg:h-8 lg:w-8 lg:text-[8px]">PDF</div>
                          <div className="mt-1 min-w-0 lg:mt-0">
                            <p className="truncate text-[7px] font-semibold text-slate-300 lg:text-[8px]">{name}</p>
                            <p className="mt-0.5 font-mono text-[6px] text-slate-600 lg:text-[7px]">{size}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div
                  className="overflow-hidden"
                  style={{
                    maxHeight: `${Math.round(205 * consolidationProgress)}px`,
                    opacity: consolidationProgress,
                    transform: `translateY(${(1 - consolidationProgress) * 14}px)`,
                  }}
                >
                  <div className="relative px-4 py-4 lg:px-6 lg:py-5">
                    <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-emerald-300/45 to-transparent" />
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span className="grid h-9 w-9 place-items-center rounded-full border border-emerald-300/20 bg-emerald-400/10 text-[14px] font-black text-emerald-300 shadow-[0_0_22px_rgba(52,211,153,0.12)] lg:h-10 lg:w-10 lg:text-[15px]">✓</span>
                        <div>
                          <p className="text-[8px] font-extrabold uppercase tracking-[0.12em] text-emerald-300 lg:text-[9px] lg:tracking-[0.13em]">Solicitud registrada</p>
                          <p className="mt-1 font-mono text-[9px] text-white lg:text-[10px]">SOL-2026-014</p>
                        </div>
                      </div>
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-35" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-1.5 lg:mt-5 lg:gap-2">
                      {[
                        ['Documentos', '3'],
                        ['Estado', 'Recibida'],
                        ['Seguimiento', 'Activo'],
                      ].map(([label, value]) => (
                        <div key={label} className="rounded-xl border border-white/[0.055] bg-white/[0.025] px-2.5 py-2 lg:px-3 lg:py-2.5">
                          <p className="text-[6px] font-bold uppercase tracking-[0.1em] text-slate-600 lg:tracking-[0.11em]">{label}</p>
                          <p className="mt-1 text-[8px] font-semibold text-slate-200 lg:text-[9px]">{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div
                className="pointer-events-none absolute bottom-0 left-1/2 h-24 w-px origin-top bg-gradient-to-b from-cyan-300/50 via-blue-400/24 to-transparent lg:hidden"
                style={{
                  opacity: exitProgress,
                  transform: `scaleY(${exitProgress})`,
                }}
              >
                {!reducedMotion && exitProgress > 0.55 ? (
                  <span className="qt-request-exit-pulse absolute left-[-2px] top-0 h-1 w-1 rounded-full bg-cyan-200 shadow-[0_0_12px_rgba(103,232,249,0.8)]" />
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
