import { useEffect, useRef, useState, type MutableRefObject } from 'react'
import { QualityTrackFallbackScene } from './QualityTrackFallbackScene'
import { QualityTrackRenderer } from './QualityTrackRenderer'

interface QualityTrackSceneProps {
  progressRef: MutableRefObject<number>
  scrollingRef: MutableRefObject<boolean>
  reducedMotion: boolean
}

type SceneStatus = 'loading' | 'ready' | 'fallback'

export function QualityTrackScene({
  progressRef,
  scrollingRef,
  reducedMotion,
}: QualityTrackSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [status, setStatus] = useState<SceneStatus>('loading')

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    let mounted = true
    let renderer: QualityTrackRenderer | null = null

    try {
      renderer = new QualityTrackRenderer(canvas, {
        progressRef,
        scrollingRef,
        reducedMotion,
        onReady: () => {
          if (mounted) setStatus('ready')
        },
        onRenderFailure: () => {
          if (mounted) setStatus('fallback')
        },
      })
    } catch {
      setStatus('fallback')
    }

    return () => {
      mounted = false
      renderer?.dispose()
    }
  }, [progressRef, reducedMotion, scrollingRef])

  return (
    <div className="relative h-full w-full">
      <canvas
        ref={canvasRef}
        className={`block h-full w-full transition-opacity duration-300 ${status === 'fallback' ? 'opacity-0' : 'opacity-100'}`}
        aria-label="Visualización 3D del flujo operativo de QualityTrack"
      />

      {status === 'fallback' ? (
        <QualityTrackFallbackScene progressRef={progressRef} />
      ) : null}
    </div>
  )
}
