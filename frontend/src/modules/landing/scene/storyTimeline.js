export const STORY_STAGE_COUNT = 8
export const STORY_LAST_STAGE = STORY_STAGE_COUNT - 1
export const STORY_TRANSITION = 0.012

function clamp01(value) {
  return Math.min(1, Math.max(0, value))
}

function smoothstep(value, start, end) {
  if (start === end) return value >= end ? 1 : 0
  const t = clamp01((value - start) / (end - start))
  return t * t * (3 - 2 * t)
}

export function stageBoundary(leftStage) {
  return (leftStage + 0.5) / STORY_LAST_STAGE
}

export function stageIndex(progress) {
  return Math.min(
    STORY_LAST_STAGE,
    Math.max(0, Math.round(clamp01(progress) * STORY_LAST_STAGE)),
  )
}

export function stageBounds(index) {
  return {
    start: index === 0 ? 0 : stageBoundary(index - 1),
    end: index === STORY_LAST_STAGE ? 1 : stageBoundary(index),
  }
}

export function stageOpacity(progress, index, transition = STORY_TRANSITION) {
  const { start, end } = stageBounds(index)
  const fadeIn =
    index === 0
      ? 1
      : smoothstep(progress, start - transition, start + transition)
  const fadeOut =
    index === STORY_LAST_STAGE
      ? 1
      : 1 - smoothstep(progress, end - transition, end + transition)
  return fadeIn * fadeOut
}

export function stageLocalProgress(progress, index) {
  const { start, end } = stageBounds(index)
  return clamp01((progress - start) / Math.max(end - start, 0.0001))
}

export function boundaryProgress(
  progress,
  leftStage,
  transition = STORY_TRANSITION,
) {
  const boundary = stageBoundary(leftStage)
  return smoothstep(
    progress,
    boundary - transition,
    boundary + transition,
  )
}

export function sampleStageVector(THREE, points, progress) {
  const currentStage = stageIndex(progress)

  for (let index = 0; index < STORY_LAST_STAGE; index += 1) {
    const boundary = stageBoundary(index)
    if (
      progress >= boundary - STORY_TRANSITION &&
      progress <= boundary + STORY_TRANSITION
    ) {
      const blend = smoothstep(
        progress,
        boundary - STORY_TRANSITION,
        boundary + STORY_TRANSITION,
      )
      return new THREE.Vector3(...points[index]).lerp(
        new THREE.Vector3(...points[index + 1]),
        blend,
      )
    }
  }

  return new THREE.Vector3(...points[currentStage])
}
