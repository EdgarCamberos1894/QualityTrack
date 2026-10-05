import { useEffect, useState } from 'react'
import { landingStory } from '../model/landingStory'
import { ProductionSection } from './ProductionSection'

export function ProductionChapter() {
  const [reducedMotion, setReducedMotion] = useState(false)
  const stage = landingStory[5]

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReducedMotion(media.matches)

    sync()
    media.addEventListener('change', sync)
    return () => media.removeEventListener('change', sync)
  }, [])

  if (!stage) return null

  return <ProductionSection stage={stage} reducedMotion={reducedMotion} />
}
