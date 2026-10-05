import { useEffect, useRef, useState } from 'react'
import type { LandingStoryStage } from '../model/landingStory'
import '../requestSection.css'

interface RequestSectionProps {
  stage: LandingStoryStage
  reducedMotion: boolean
}

const requestFields = [
  ['Cliente', 'AeroParts Manufacturing'],
  ['Requerimiento', 'Eje mecanizado AISI 4140'],
  ['Cantidad', '120 piezas'],
  ['Fecha requerida', '18 oct 2026'],
] as const

const requestDocuments = [
  ['Plano_eje_REV-C.pdf', '2.8 MB'],
  ['Especificacion_material.pdf', '1.4 MB'],
] as const

export function RequestSection({ stage, reducedMotion }: RequestSectionProps) {
  const sectionRef = useRef<HTMLElement | null>(null)
  const [active, setActive] = useState(false)

  useEffect(() => {
    const node = sectionRef.current
    if (!node) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setActive(true)
      },
      { threshold: 0.04 },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  const reveal = (delay: number) => ({
    opacity: active ? 1 : 0,
    transform: active ? 'translate3d(0,0,0)' : 'translate3d(0,18px,0)',
    transition: reducedMotion
      ? 'none'
      : `opacity 620ms ease ${delay}ms, transform 720ms cubic-bezier(.2,.75,.2,1) ${delay}ms`,
  })

  const requestTracePath =
    'M 343 0 C 326 27, 311 61, 329 96 C 352 137, 365 174, 328 206 C 294 236, 245 253, 202 284'

  return (
    <section
      ref={sectionRef}
      id={stage.id}
      className="relative isolate min-h-screen overflow-hidden bg-[#020817]"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_24%_47%,rgba(8,145,178,0.15),transparent_28%),radial-gradient(circle_at_48%_20%,rgba(37,99,235,0.09),transparent_34%),linear-gradient(180deg,#020617_0%,#041022_48%,#020817_100%)]" />
      <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(148,163,184,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.055)_1px,transparent_1px)] [background-size:68px_68px] [mask-image:radial-gradient(circle_at_30%_48%,black,transparent_68%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[2] h-20 bg-gradient-to-b from-[#020617] via-[#020617]/58 to-transparent lg:h-24" />

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
            opacity={active ? 0.16 : 0}
            filter="url(#qtRequestTraceGlow)"
          />
          <path
            d={requestTracePath}
            fill="none"
            stroke="url(#qtRequestTrace)"
            strokeWidth="1.5"
            strokeDasharray="8 10"
            opacity={active ? 0.92 : 0}
          >
            {!reducedMotion && active ? (
              <animate
                attributeName="stroke-dashoffset"
                from="0"
                to="180"
                dur="7s"
                repeatCount="indefinite"
              />
            ) : null}
          </path>

          {!reducedMotion && active ? (
            <>
              <circle
                r="10"
                fill="#67e8f9"
                opacity="0.16"
                filter="url(#qtRequestTravelerGlow)"
              >
                <animateMotion dur="5.2s" repeatCount="indefinite" path={requestTracePath} />
              </circle>
              <circle r="3.5" fill="#a5f3fc" opacity="0.95">
                <animateMotion dur="5.2s" repeatCount="indefinite" path={requestTracePath} />
              </circle>
            </>
          ) : null}

          <circle cx="343" cy="0" r="2.8" fill="#67e8f9" opacity={active ? 0.9 : 0} />
        </svg>
      </div>

      <div className="relative z-10 mx-auto grid w-full max-w-[1440px] items-start gap-7 px-5 pb-12 pt-6 sm:px-8 sm:pb-16 sm:pt-8 lg:min-h-screen lg:grid-cols-[1.08fr_0.92fr] lg:gap-14 lg:px-12 lg:pb-14 lg:pt-10 xl:px-16">
        <div className="order-1 pt-1 lg:order-2 lg:pl-4 lg:pt-5" style={reveal(160)}>
          <div className="flex items-center gap-2.5">
            <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.13em] text-cyan-300">
              {stage.eyebrow}
            </span>
            <span className="text-[9px] font-semibold tracking-[0.18em] text-slate-600">{stage.step}</span>
          </div>

          <h2 className="mt-4 max-w-[620px] text-[clamp(2.45rem,11vw,4.2rem)] font-semibold leading-[0.94] tracking-[-0.055em] text-white lg:text-[clamp(2.15rem,4.4vw,4.2rem)] lg:leading-[0.98]">
            {stage.title}
          </h2>

          <p className="mt-4 max-w-lg text-[13px] leading-6 text-slate-300/90 lg:mt-5">
            {stage.description}
          </p>

          <div className="mt-5 flex flex-wrap gap-2 lg:mt-6">
            {['Requerimientos', 'Documentos', 'Seguimiento'].map((item, index) => (
              <span
                key={item}
                className="rounded-full border border-white/[0.07] bg-white/[0.025] px-3 py-1.5 text-[8px] font-bold uppercase tracking-[0.11em] text-slate-400"
                style={reveal(620 + index * 100)}
              >
                {item}
              </span>
            ))}
          </div>

          <div
            className="mt-5 flex max-w-[500px] items-start gap-3 rounded-2xl border border-cyan-300/10 bg-slate-950/40 p-3.5 backdrop-blur-md lg:mt-7"
            style={reveal(920)}
          >
            <span className="mt-1 flex h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-400 shadow-[0_0_18px_rgba(52,211,153,0.7)]" />
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.11em] text-white">{stage.signal}</p>
              <p className="mt-1 text-[9px] leading-4 text-slate-400">{stage.detail}</p>
            </div>
          </div>
        </div>

        <div className="order-2 lg:order-1">
          <div className="relative lg:hidden" style={reveal(80)}>
            <div className="pointer-events-none absolute left-[-18%] top-[8%] h-48 w-48 rounded-full bg-cyan-400/[0.08] blur-[70px]" />
            <div className="pointer-events-none absolute right-[-22%] top-[32%] h-52 w-52 rounded-full bg-blue-500/[0.07] blur-[80px]" />

            <div className="qt-request-mobile-card relative overflow-hidden rounded-[24px] border border-cyan-200/[0.12] bg-[#07111f]/94 shadow-[0_28px_80px_-40px_rgba(14,165,233,0.85)] backdrop-blur-xl">
              <div className="relative border-b border-white/[0.06] px-4 pb-3.5 pt-4">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/45 to-transparent" />
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_14px_rgba(103,232,249,0.75)]" />
                      <span className="text-[8px] font-extrabold uppercase tracking-[0.15em] text-cyan-100/85">
                        Nueva solicitud
                      </span>
                    </div>
                    <p className="mt-1.5 text-[16px] font-semibold tracking-[-0.025em] text-white">
                      Requerimiento de fabricación
                    </p>
                  </div>
                  <span className="rounded-lg border border-white/[0.07] bg-white/[0.035] px-2 py-1 font-mono text-[7px] text-slate-500">
                    BORRADOR
                  </span>
                </div>

                <div className="mt-3 flex items-center gap-3 rounded-xl border border-cyan-300/[0.09] bg-cyan-300/[0.035] p-3">
                  <div className="relative grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-cyan-300/15 bg-[#061523]">
                    <span className="h-6 w-6 rounded-full border border-cyan-200/45" />
                    <span className="absolute h-px w-8 bg-cyan-300/20" />
                    <span className="absolute h-8 w-px bg-cyan-300/20" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-slate-500">Pieza objetivo</p>
                      <span className="font-mono text-[7px] text-cyan-300/70">REV C</span>
                    </div>
                    <p className="mt-1 text-[11px] font-semibold text-slate-200">SHAFT Ø48 · AISI 4140</p>
                    <p className="mt-0.5 font-mono text-[7px] text-slate-600">Plano técnico vinculado</p>
                  </div>
                </div>
              </div>

              <div className="divide-y divide-white/[0.055] px-4">
                {requestFields.map(([label, value], index) => (
                  <div
                    key={label}
                    className="flex items-center justify-between gap-5 py-3"
                    style={reveal(320 + index * 90)}
                  >
                    <p className="shrink-0 text-[7px] font-bold uppercase tracking-[0.12em] text-slate-600">{label}</p>
                    <p className="min-w-0 text-right text-[10px] font-semibold leading-4 text-slate-200">{value}</p>
                  </div>
                ))}
              </div>

              <div className="border-t border-white/[0.06] bg-slate-950/25 px-4 py-3.5" style={reveal(760)}>
                <div className="mb-2.5 flex items-center justify-between gap-3">
                  <span className="text-[7px] font-bold uppercase tracking-[0.12em] text-slate-500">Documentación</span>
                  <span className="text-[7px] font-semibold text-cyan-300/75">2 archivos vinculados</span>
                </div>
                <div className="space-y-2">
                  {requestDocuments.map(([name, size]) => (
                    <div key={name} className="flex items-center gap-2.5 rounded-xl border border-white/[0.055] bg-white/[0.025] px-2.5 py-2">
                      <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg border border-cyan-300/10 bg-cyan-300/[0.06] font-mono text-[7px] font-bold text-cyan-200">PDF</div>
                      <p className="min-w-0 flex-1 truncate text-[8px] font-semibold text-slate-300">{name}</p>
                      <span className="font-mono text-[7px] text-slate-600">{size}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-emerald-300/10 bg-emerald-400/[0.035] px-4 py-3.5" style={reveal(1040)}>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2.5">
                    <span className="grid h-8 w-8 place-items-center rounded-full border border-emerald-300/20 bg-emerald-400/10 text-[12px] font-black text-emerald-300">✓</span>
                    <div>
                      <p className="text-[8px] font-extrabold uppercase tracking-[0.12em] text-emerald-300">Solicitud registrada</p>
                      <p className="mt-0.5 font-mono text-[8px] text-slate-500">SOL-2026-014</p>
                    </div>
                  </div>
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-35" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                  </span>
                </div>
              </div>
            </div>

            <div className="mx-auto mt-4 flex w-fit items-center gap-2 rounded-full border border-white/[0.06] bg-slate-950/35 px-3 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(103,232,249,0.65)]" />
              <span className="text-[7px] font-bold uppercase tracking-[0.12em] text-slate-500">Contexto listo para continuar</span>
            </div>
          </div>

          <div className="relative hidden min-h-[610px] lg:block">
            <div className="absolute left-[8%] top-[4%] h-[74%] w-[74%] rounded-full bg-cyan-400/[0.08] blur-[85px]" />
            <div className="absolute left-[20%] top-[14%] h-[58%] w-[58%] rounded-full bg-blue-500/[0.08] blur-[68px]" />

            <div
              className="qt-request-document absolute left-[3%] top-[6%] z-[2] w-[214px] rounded-2xl border border-white/10 bg-slate-950/70 p-3.5 shadow-[0_28px_80px_-38px_rgba(14,165,233,0.85)] backdrop-blur-xl"
              style={reveal(260)}
            >
              <div className="flex items-center justify-between">
                <span className="text-[8px] font-extrabold uppercase tracking-[0.15em] text-slate-400">Documento técnico</span>
                <span className="rounded-md border border-cyan-300/15 bg-cyan-300/10 px-1.5 py-0.5 font-mono text-[7px] text-cyan-200">REV C</span>
              </div>
              <div className="relative mt-3 h-28 overflow-hidden rounded-xl border border-white/[0.06] bg-[#07111e]">
                <div className="absolute inset-0 opacity-45 [background-image:linear-gradient(rgba(56,189,248,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(56,189,248,0.08)_1px,transparent_1px)] [background-size:14px_14px]" />
                <div className="absolute left-5 top-7 h-12 w-28 rounded-full border border-cyan-300/50" />
                <div className="absolute left-8 top-10 h-6 w-22 border-x border-cyan-200/50" />
                <div className="absolute bottom-3 left-4 font-mono text-[7px] tracking-[0.12em] text-cyan-200/70">SHAFT Ø48 · AISI 4140</div>
              </div>
              <p className="mt-2 font-mono text-[8px] text-slate-500">Plano_eje_REV-C.pdf</p>
            </div>

            <div
              className="qt-request-card absolute left-[14%] top-[7%] z-[4] w-[80%] max-w-[570px] overflow-hidden rounded-[28px] border border-cyan-200/[0.13] bg-[#07111f]/90 shadow-[0_38px_110px_-46px_rgba(14,165,233,0.8)] backdrop-blur-2xl"
              style={reveal(80)}
            >
              <div className="border-b border-white/[0.06] bg-gradient-to-r from-cyan-300/[0.055] via-transparent to-blue-400/[0.04] px-6 py-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_14px_rgba(103,232,249,0.75)]" />
                      <span className="text-[8px] font-extrabold uppercase tracking-[0.16em] text-cyan-100/80">Nueva solicitud</span>
                    </div>
                    <p className="mt-1.5 text-[15px] font-semibold tracking-[-0.02em] text-white">Requerimiento de fabricación</p>
                  </div>
                  <span className="rounded-lg border border-white/[0.07] bg-white/[0.03] px-2.5 py-1.5 font-mono text-[8px] text-slate-500">BORRADOR</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-5 gap-y-3.5 px-6 py-5">
                {requestFields.map(([label, value], index) => (
                  <div
                    key={label}
                    className="rounded-xl border border-white/[0.055] bg-white/[0.025] px-3.5 py-3"
                    style={reveal(420 + index * 130)}
                  >
                    <p className="text-[7px] font-bold uppercase tracking-[0.13em] text-slate-600">{label}</p>
                    <p className="mt-1.5 text-[10px] font-semibold text-slate-200">{value}</p>
                  </div>
                ))}
              </div>

              <div className="border-t border-white/[0.06] px-6 py-4" style={reveal(920)}>
                <div className="flex items-center justify-between">
                  <span className="text-[8px] font-bold uppercase tracking-[0.13em] text-slate-500">Documentación</span>
                  <span className="text-[8px] font-semibold text-cyan-300/80">2 archivos vinculados</span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {requestDocuments.map(([name, size]) => (
                    <div key={name} className="flex items-center gap-2.5 rounded-xl border border-white/[0.055] bg-slate-950/45 p-2.5">
                      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-cyan-300/10 bg-cyan-300/[0.06] font-mono text-[8px] font-bold text-cyan-200">PDF</div>
                      <div className="min-w-0">
                        <p className="truncate text-[8px] font-semibold text-slate-300">{name}</p>
                        <p className="mt-0.5 font-mono text-[7px] text-slate-600">{size}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div
              className="qt-request-result absolute bottom-[8%] left-[8%] z-[7] w-[270px] rounded-2xl border border-emerald-300/15 bg-slate-950/88 p-4 shadow-[0_26px_80px_-36px_rgba(52,211,153,0.7)] backdrop-blur-xl"
              style={reveal(1280)}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2.5">
                  <span className="grid h-7 w-7 place-items-center rounded-full border border-emerald-300/20 bg-emerald-400/10 text-[11px] font-black text-emerald-300">✓</span>
                  <div>
                    <p className="text-[8px] font-extrabold uppercase tracking-[0.13em] text-emerald-300">Solicitud registrada</p>
                    <p className="mt-1 font-mono text-[8px] text-slate-500">SOL-2026-014</p>
                  </div>
                </div>
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.7)]" />
              </div>
              <div className="mt-3 flex gap-2 text-[7px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                <span>2 documentos</span>
                <span>·</span>
                <span>Seguimiento activo</span>
              </div>
            </div>

            <div className="pointer-events-none absolute bottom-[-4%] left-[25%] h-28 w-px bg-gradient-to-b from-cyan-300/50 via-blue-400/20 to-transparent">
              {!reducedMotion && active ? (
                <span className="qt-request-exit-pulse absolute left-[-2px] top-0 h-1 w-1 rounded-full bg-cyan-200 shadow-[0_0_12px_rgba(103,232,249,0.8)]" />
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
