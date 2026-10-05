import { useEffect, useState } from 'react'
import { landingStory } from '../model/landingStory'
import { QualitySection } from './QualitySection'

export function QualityChapter() {
  const [reducedMotion, setReducedMotion] = useState(false)
  const stage = landingStory[6]

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReducedMotion(media.matches)

    sync()
    media.addEventListener('change', sync)
    return () => media.removeEventListener('change', sync)
  }, [])

  if (!stage) return null

  return <QualitySection stage={stage} reducedMotion={reducedMotion} />
}
