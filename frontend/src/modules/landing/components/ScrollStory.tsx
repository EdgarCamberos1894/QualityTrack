import { useEffect, useRef, useState } from 'react'
import { landingStory } from '../model/landingStory'
import { QualityTrackScene } from '../scene/QualityTrackScene'
import { StoryStage } from './StoryStage'

function useReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReducedMotion(media.matches)

    sync()
    media.addEventListener('change', sync)
    return () => media.removeEventListener('change', sync)
  }, [])

  return reducedMotion
}

export function ScrollStory() {
  const introProgressRef = useRef(0.02)
  const introScrollingRef = useRef(false)
  const reducedMotion = useReducedMotion()
  const [intro, ...remainingStages] = landingStory

  return (
    <section id="flujo" className="qt-story relative isolate bg-[#020617]">
      <section
        id={intro.id}
        className="relative isolate min-h-screen overflow-hidden"
      >
        <div className="absolute inset-0 qt-story-backdrop" />

        <div className="pointer-events-none absolute inset-0 z-[1] overflow-hidden">
          <div className="absolute -right-[22%] top-[12%] h-[46vh] w-[112%] opacity-80 sm:-right-[12%] sm:w-[92%] lg:inset-y-0 lg:right-[-7%] lg:top-0 lg:h-auto lg:w-[68%] lg:opacity-100">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_58%_48%,rgba(37,99,235,0.2),transparent_48%)]" />
            <QualityTrackScene
              progressRef={introProgressRef}
              scrollingRef={introScrollingRef}
              reducedMotion={reducedMotion}
            />
          </div>

          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.1)_0%,rgba(2,6,23,0.26)_45%,#020617_72%)] lg:bg-[linear-gradient(90deg,#020617_0%,rgba(2,6,23,0.98)_31%,rgba(2,6,23,0.78)_46%,rgba(2,6,23,0.18)_64%,rgba(2,6,23,0)_82%)]" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#020617] via-[#020617]/70 to-transparent" />
        </div>

        <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1440px] items-end px-5 pb-12 pt-[46vh] sm:px-8 sm:pb-16 lg:items-center lg:px-12 lg:pb-12 lg:pt-24 xl:px-16">
          <div className="w-full lg:max-w-[52%] xl:max-w-[49%]">
            <StoryStage stage={intro} active />
          </div>
        </div>

        <div className="pointer-events-none absolute bottom-6 right-7 z-[5] hidden items-center gap-2 rounded-full border border-white/8 bg-slate-950/35 px-3 py-1.5 backdrop-blur-md sm:flex lg:right-10">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.75)]" />
          <span className="text-[8px] font-bold uppercase tracking-[0.12em] text-slate-400">
            Operación industrial conectada
          </span>
        </div>
      </section>

      <div className="relative z-10 bg-[#020617]">
        {remainingStages.map((stage, index) => (
          <section
            id={stage.id}
            key={stage.id}
            className="relative flex min-h-screen items-center overflow-hidden border-t border-white/[0.04] px-5 py-24 sm:px-8 lg:px-12 xl:px-16"
          >
            <div
              className={`pointer-events-none absolute inset-0 ${
                index % 2 === 0
                  ? 'bg-[radial-gradient(circle_at_82%_45%,rgba(37,99,235,0.08),transparent_30%)]'
                  : 'bg-[radial-gradient(circle_at_18%_45%,rgba(14,165,233,0.07),transparent_30%)]'
              }`}
            />
            <div className="relative mx-auto w-full max-w-[1440px]">
              <div className="max-w-[680px]">
                <StoryStage stage={stage} active />
              </div>
            </div>
          </section>
        ))}
      </div>
    </section>
  )
}
