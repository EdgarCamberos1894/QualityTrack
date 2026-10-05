import { useEffect, useState } from 'react'
import { landingStory } from '../model/landingStory'
import { CaseSection } from './CaseSection'

export function CaseChapter() {
  const [reducedMotion, setReducedMotion] = useState(false)
  const stage = landingStory[2]

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReducedMotion(media.matches)

    sync()
    media.addEventListener('change', sync)
    return () => media.removeEventListener('change', sync)
  }, [])

  if (!stage) return null

  return <CaseSection stage={stage} reducedMotion={reducedMotion} />
}
