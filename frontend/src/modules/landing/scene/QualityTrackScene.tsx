import { useEffect, useRef, useState, type MutableRefObject } from 'react'
import { QualityTrackRenderer } from './QualityTrackRenderer'

interface QualityTrackSceneProps {
  progressRef: MutableRefObject<number>
  scrollingRef: MutableRefObject<boolean>
  reducedMotion: boolean
}

export function QualityTrackScene({
  progressRef,
  scrollingRef,
  reducedMotion,
}: QualityTrackSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [unavailable, setUnavailable] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    try {
      const renderer = new QualityTrackRenderer(canvas, {
        progressRef,
        scrollingRef,
        reducedMotion,
      })
      return () => renderer.dispose()
    } catch {
      setUnavailable(true)
    }
  }, [progressRef, reducedMotion, scrollingRef])

  if (unavailable) {
    return (
      <div className="qt-scene-fallback" aria-hidden="true">
        <div className="qt-scene-fallback-orbit qt-scene-fallback-orbit-a" />
        <div className="qt-scene-fallback-orbit qt-scene-fallback-orbit-b" />
        <div className="qt-scene-fallback-core">QT</div>
      </div>
    )
  }

  return (
    <canvas
      ref={canvasRef}
      className="h-full w-full"
      aria-label="Visualización 3D del flujo operativo de QualityTrack"
    />
  )
}
