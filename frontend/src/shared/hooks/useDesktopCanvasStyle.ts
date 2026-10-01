import { useEffect, useState, type CSSProperties } from 'react'

const DESIGN_WIDTH = 1440
const MIN_SCALED_DESKTOP_WIDTH = 1224

function getCanvasScale(): number {
  const viewportWidth = window.innerWidth

  if (
    viewportWidth < MIN_SCALED_DESKTOP_WIDTH ||
    viewportWidth >= DESIGN_WIDTH
  ) {
    return 1
  }

  return viewportWidth / DESIGN_WIDTH
}

export function useDesktopCanvasStyle(): CSSProperties | undefined {
  const [scale, setScale] = useState(getCanvasScale)

  useEffect(() => {
    const updateScale = () => setScale(getCanvasScale())

    window.addEventListener('resize', updateScale)

    return () => window.removeEventListener('resize', updateScale)
  }, [])

  if (scale === 1) return undefined

  const inverseScale = 1 / scale

  return {
    zoom: scale,
    width: `${inverseScale * 100}%`,
    minHeight: `${inverseScale * 100}vh`,
  }
}
