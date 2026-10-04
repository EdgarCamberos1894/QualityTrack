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
  const activeStage = landingStory[activeIndex] ?? landingStory[0]
  const sceneOnLeft = activeStage.side === 'right'

  return (
    <section
      ref={containerRef}
      id="flujo"
      className="qt-story relative isolate bg-[#020617]"
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        <div className="absolute inset-0 qt-story-backdrop" />

        <div
          className={`pointer-events-none absolute inset-x-0 top-0 z-[1] h-[48vh] overflow-hidden lg:inset-y-0 lg:top-auto lg:h-auto lg:w-1/2 ${
            sceneOnLeft
              ? 'lg:left-0 lg:right-auto'
              : 'lg:left-auto lg:right-0'
          }`}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_48%,rgba(37,99,235,0.16),transparent_44%)]" />
          <QualityTrackScene
            progressRef={progressRef}
            scrollingRef={scrollingRef}
            reducedMotion={reducedMotion}
          />
        </div>

        <div
          className={`pointer-events-none absolute inset-y-0 z-[2] hidden w-[51%] lg:block ${
            sceneOnLeft
              ? 'right-0 bg-[linear-gradient(270deg,#020617_0%,rgba(2,6,23,0.98)_72%,rgba(2,6,23,0.72)_100%)]'
              : 'left-0 bg-[linear-gradient(90deg,#020617_0%,rgba(2,6,23,0.98)_72%,rgba(2,6,23,0.72)_100%)]'
          }`}
        />
        <div className="pointer-events-none absolute inset-y-[9vh] left-1/2 z-[3] hidden w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-blue-400/15 to-transparent lg:block" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-28 bg-gradient-to-t from-[#020617] via-[#020617]/50 to-transparent" />

        <div
          className={`absolute bottom-6 z-[5] hidden items-center gap-2 rounded-full border border-white/8 bg-slate-950/45 px-3 py-1.5 backdrop-blur sm:flex ${
            sceneOnLeft
              ? 'left-7 lg:left-10'
              : 'right-7 lg:right-10'
          }`}
        >
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.75)]" />
          <span className="text-[8px] font-bold uppercase tracking-[0.12em] text-slate-400">
            Escena {activeStage.step} · {activeStage.eyebrow}
          </span>
        </div>
      </div>

      <div className="relative z-10 -mt-[100vh]">
        {landingStory.map((stage, index) => {
          const textOnLeft = stage.side === 'left'

          return (
            <div
              id={stage.id}
              key={stage.id}
              className="grid min-h-screen grid-cols-1 items-end px-5 pb-14 pt-[50vh] sm:px-8 lg:grid-cols-2 lg:items-center lg:gap-12 lg:px-12 lg:pb-16 lg:pt-28 xl:px-16 2xl:px-24"
            >
              <div
                className={`w-full ${
                  textOnLeft
                    ? 'lg:col-start-1 lg:justify-self-start lg:pr-8'
                    : 'lg:col-start-2 lg:justify-self-end lg:pl-8'
                }`}
              >
                <StoryStage stage={stage} active={index === activeIndex} />
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
