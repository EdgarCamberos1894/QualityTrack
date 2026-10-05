import { useEffect, useState } from 'react'
import { landingStory } from '../model/landingStory'
import { QuoteSection } from './QuoteSection'

export function QuoteChapter() {
  const [reducedMotion, setReducedMotion] = useState(false)
  const stage = landingStory[3]

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReducedMotion(media.matches)

    sync()
    media.addEventListener('change', sync)
    return () => media.removeEventListener('change', sync)
  }, [])

  if (!stage) return null

  return <QuoteSection stage={stage} reducedMotion={reducedMotion} />
}
