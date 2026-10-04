import { useRef } from 'react'
import { useScrollStory } from '../hooks/useScrollStory'
import { landingStory } from '../model/landingStory'
import { QualityTrackScene } from '../scene/QualityTrackScene'
import { StoryStage } from './StoryStage'

export function ScrollStory() {
  const containerRef = useRef<HTMLElement>(null)
  const { progressRef, scrollingRef, activeIndex, reducedMotion } = useScrollStory(
    containerRef,
    landingStory.length,
  )

  return (
    <section
      ref={containerRef}
      id="flujo"
      className="qt-story relative isolate bg-[#020617]"
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        <div className="absolute inset-0 qt-story-backdrop" />

        <div className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-[48vh] overflow-hidden lg:inset-y-0 lg:left-auto lg:right-0 lg:h-auto lg:w-[54%]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_48%_48%,rgba(37,99,235,0.16),transparent_44%)]" />
          <QualityTrackScene
            progressRef={progressRef}
            scrollingRef={scrollingRef}
            reducedMotion={reducedMotion}
          />
        </div>

        <div className="pointer-events-none absolute inset-y-0 left-0 z-[2] hidden w-[49%] bg-[linear-gradient(90deg,#020617_0%,rgba(2,6,23,0.98)_72%,rgba(2,6,23,0.72)_100%)] lg:block" />
        <div className="pointer-events-none absolute inset-y-[9vh] left-[46%] z-[3] hidden w-px bg-gradient-to-b from-transparent via-blue-400/15 to-transparent lg:block" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-28 bg-gradient-to-t from-[#020617] via-[#020617]/50 to-transparent" />

        <div className="absolute bottom-6 right-7 z-[5] hidden items-center gap-2 rounded-full border border-white/8 bg-slate-950/45 px-3 py-1.5 backdrop-blur sm:flex lg:right-10">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.75)]" />
          <span className="text-[8px] font-bold uppercase tracking-[0.12em] text-slate-400">
            La escena sigue viva cuando te detienes
          </span>
        </div>
      </div>

      <div className="relative z-10 -mt-[100vh]">
        {landingStory.map((stage, index) => (
          <div
            id={stage.id}
            key={stage.id}
            className="flex min-h-screen items-end px-5 pb-14 pt-[50vh] sm:px-8 lg:items-center lg:px-12 lg:pb-16 lg:pr-[57%] lg:pt-28 xl:pl-[max(4rem,calc((100vw-80rem)/2))] xl:pr-[58%]"
          >
            <StoryStage stage={stage} active={index === activeIndex} />
          </div>
        ))}
      </div>
    </section>
  )
}
