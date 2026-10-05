import { useEffect, useState } from 'react'
import { landingStory } from '../model/landingStory'
import { WorkOrderSection } from './WorkOrderSection'

export function WorkOrderChapter() {
  const [reducedMotion, setReducedMotion] = useState(false)
  const stage = landingStory[4]

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReducedMotion(media.matches)

    sync()
    media.addEventListener('change', sync)
    return () => media.removeEventListener('change', sync)
  }, [])

  if (!stage) return null

  return <WorkOrderSection stage={stage} reducedMotion={reducedMotion} />
}
