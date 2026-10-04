import type { MutableRefObject } from 'react'
import { lookAt, perspective, sampleVec3, type Vec3 } from './math'
import { renderQualityTrackFrame } from './renderFrame'
import { ScenePainter } from './webgl'

interface QualityTrackRendererOptions {
  progressRef: MutableRefObject<number>
  scrollingRef: MutableRefObject<boolean>
  reducedMotion: boolean
}

const cameraPositions: Vec3[] = [
  [5.3, 3.1, 7.4],
  [4.4, 2.6, 6.6],
  [3.1, 2.5, 6.4],
  [3.5, 2.25, 5.8],
  [3.0, 2.15, 5.2],
  [2.7, 1.75, 4.4],
  [5.6, 2.0, 4.7],
  [8.3, 3.35, 6.8],
]

const cameraTargets: Vec3[] = [
  [-2.0, 0.25, 0],
  [-2.25, 0.35, 0],
  [-1.8, 0.35, 0],
  [-1.0, 0.25, 0],
  [0.0, 0.3, 0],
  [0.15, 0.2, 0],
  [3.2, 0.3, 0],
  [3.0, 0.15, 0],
]

export class QualityTrackRenderer {
  private readonly painter: ScenePainter
  private readonly canvas: HTMLCanvasElement
  private readonly progressRef: MutableRefObject<number>
  private readonly scrollingRef: MutableRefObject<boolean>
  private readonly reducedMotion: boolean
  private animationFrame = 0
  private resizeObserver: ResizeObserver | null = null
  private lastTime = performance.now()
  private idleBlend = 0
  private ambientSpin = 0
  private disposed = false

  constructor(canvas: HTMLCanvasElement, options: QualityTrackRendererOptions) {
    this.canvas = canvas
    this.progressRef = options.progressRef
    this.scrollingRef = options.scrollingRef
    this.reducedMotion = options.reducedMotion
    this.painter = new ScenePainter(canvas)
    this.resizeObserver = new ResizeObserver(() => this.resize())
    this.resizeObserver.observe(canvas)
    this.resize()
    this.animationFrame = window.requestAnimationFrame(this.render)
  }

  private resize() {
    const rect = this.canvas.getBoundingClientRect()
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
    this.painter.resize(rect.width, rect.height, dpr)
  }

  private render = (now: number) => {
    if (this.disposed) return

    const delta = Math.min((now - this.lastTime) / 1000, 0.05)
    this.lastTime = now
    const progress = this.reducedMotion ? 0.12 : this.progressRef.current
    const idleTarget = this.reducedMotion
      ? 0
      : this.scrollingRef.current
        ? 0.12
        : 1
    const blendSpeed = 1 - Math.exp(-delta * 4.5)
    this.idleBlend += (idleTarget - this.idleBlend) * blendSpeed
    this.ambientSpin += delta * (0.28 + this.idleBlend * 2.2)

    const camera = sampleVec3(cameraPositions, progress)
    const target = sampleVec3(cameraTargets, progress)
    if (!this.reducedMotion) {
      const drift = this.idleBlend * 0.06
      camera[0] += Math.sin(now * 0.00036) * drift
      camera[1] += Math.cos(now * 0.00028) * drift
    }

    const aspect = Math.max(this.canvas.width / Math.max(this.canvas.height, 1), 0.2)
    const projection = perspective(Math.PI / 4.2, aspect, 0.1, 60)
    const view = lookAt(camera, target)

    this.painter.begin(projection, view)
    renderQualityTrackFrame(this.painter, {
      progress,
      time: now / 1000,
      idleBlend: this.idleBlend,
      ambientSpin: this.ambientSpin,
    })

    this.animationFrame = window.requestAnimationFrame(this.render)
  }

  dispose() {
    this.disposed = true
    window.cancelAnimationFrame(this.animationFrame)
    this.resizeObserver?.disconnect()
  }
}
