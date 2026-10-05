import { useEffect, useState } from 'react'
import { landingStory } from '../model/landingStory'
import { DeliverySection } from './DeliverySection'

export function DeliveryChapter() {
  const [reducedMotion, setReducedMotion] = useState(false)
  const stage = landingStory[7]

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReducedMotion(media.matches)

    sync()
    media.addEventListener('change', sync)
    return () => media.removeEventListener('change', sync)
  }, [])

  if (!stage) return null

  return <DeliverySection stage={stage} reducedMotion={reducedMotion} />
}
