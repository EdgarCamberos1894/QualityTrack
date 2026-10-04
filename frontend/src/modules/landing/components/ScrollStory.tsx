import { useRef } from 'react'
import { useScrollStory } from '../hooks/useScrollStory'
import { landingStory } from '../model/landingStory'
import { QualityTrackScene } from '../scene/QualityTrackScene'
import { StoryProgress } from './StoryProgress'
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
        <div className="absolute inset-0 z-[1]">
          <QualityTrackScene
            progressRef={progressRef}
            scrollingRef={scrollingRef}
            reducedMotion={reducedMotion}
          />
        </div>
        <div className="pointer-events-none absolute inset-0 z-[2] bg-[linear-gradient(90deg,rgba(2,6,23,0.92)_0%,rgba(2,6,23,0.48)_30%,rgba(2,6,23,0.02)_54%,rgba(2,6,23,0.04)_100%)]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-32 bg-gradient-to-t from-[#020617] via-[#020617]/50 to-transparent" />

        <div className="absolute bottom-6 left-5 z-[5] hidden items-center gap-2 rounded-full border border-white/8 bg-slate-950/45 px-3 py-1.5 backdrop-blur sm:flex lg:left-8">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.75)]" />
          <span className="text-[8px] font-bold uppercase tracking-[0.12em] text-slate-400">
            La celda sigue trabajando cuando te detienes
          </span>
        </div>

        <StoryProgress stages={landingStory} activeIndex={activeIndex} />
      </div>

      <div className="relative z-10 -mt-[100vh]">
        {landingStory.map((stage, index) => (
          <div
            id={stage.id}
            key={stage.id}
            className="flex min-h-screen items-center px-5 pb-16 pt-28 sm:px-8 lg:px-12 xl:px-[max(4rem,calc((100vw-80rem)/2))]"
          >
            <StoryStage stage={stage} active={index === activeIndex} />
          </div>
        ))}
      </div>
    </section>
  )
}
