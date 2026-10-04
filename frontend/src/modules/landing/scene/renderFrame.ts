import { lerp, segment, type Vec3 } from './math'
import { ScenePainter } from './webgl'

interface FrameState {
  progress: number
  time: number
  idleBlend: number
  ambientSpin: number
}

const navy: [number, number, number] = [0.055, 0.105, 0.19]
const slate: [number, number, number] = [0.24, 0.34, 0.46]
const steel: [number, number, number] = [0.46, 0.59, 0.72]
const blue: [number, number, number] = [0.08, 0.37, 0.93]
const cyan: [number, number, number] = [0.07, 0.73, 0.86]
const emerald: [number, number, number] = [0.04, 0.72, 0.49]
const amber: [number, number, number] = [0.96, 0.58, 0.11]
const white: [number, number, number] = [0.86, 0.93, 1]

function drawFloor(painter: ScenePainter, progress: number, time: number) {
  painter.draw({ position: [1.7, -0.79, 0], scale: [5.4, 0.025, 0.035], color: blue, emissive: 0.6 })

  for (let index = -5; index <= 8; index += 1) {
    const pulse = 0.12 + Math.max(0, Math.sin(time * 1.2 - index * 0.6)) * 0.06
    painter.draw({
      position: [index * 0.72, -0.81, 0.03],
      scale: [0.015, 0.012, 1.85],
      color: [0.12, 0.23, 0.38],
      emissive: pulse,
      alpha: 0.34,
    })
  }

  const nodes = [-2.5, -1.2, 0.2, 1.6, 3.2, 4.55, 5.8]
  nodes.forEach((x, index) => {
    const active = progress * (nodes.length - 1) - index
    const glow = active >= -0.35 ? 0.55 : 0.08
    painter.draw({
      position: [x, -0.73, 0],
      scale: [0.09, 0.045, 0.09],
      color: active >= -0.35 ? blue : slate,
      emissive: glow,
    })
  })
}

function drawDocument(
  painter: ScenePainter,
  position: Vec3,
  rotation: Vec3,
  color: [number, number, number],
  alpha: number,
  time: number,
  index: number,
) {
  const floatY = Math.sin(time * 0.9 + index * 1.7) * 0.045
  const cardPosition: Vec3 = [position[0], position[1] + floatY, position[2]]
  painter.draw({ position: cardPosition, rotation, scale: [0.52, 0.7, 0.018], color, alpha })
  painter.draw({
    position: [cardPosition[0] - 0.12, cardPosition[1] + 0.23, cardPosition[2] + 0.042],
    rotation,
    scale: [0.27, 0.025, 0.008],
    color: blue,
    emissive: 0.5,
    alpha,
  })
  ;[0.08, -0.08, -0.24].forEach((offset, lineIndex) => {
    painter.draw({
      position: [cardPosition[0], cardPosition[1] + offset, cardPosition[2] + 0.043],
      rotation,
      scale: [0.34 - lineIndex * 0.04, 0.012, 0.007],
      color: [0.45, 0.58, 0.72],
      alpha: alpha * 0.82,
    })
  })
}

function drawDocuments(painter: ScenePainter, state: FrameState) {
  const { progress, time } = state
  const requestVisibility = 1 - segment(progress, 0.24, 0.34)
  const fileVisibility = segment(progress, 0.08, 0.16) * (1 - segment(progress, 0.44, 0.52))
  const quoteVisibility = segment(progress, 0.28, 0.34) * (1 - segment(progress, 0.52, 0.59))

  drawDocument(painter, [-2.55, 0.65, 0.35], [0, -0.18, -0.08], white, requestVisibility, time, 0)
  drawDocument(painter, [-1.55, 1.12, -0.62], [0.06, 0.18, 0.12], [0.72, 0.83, 0.98], fileVisibility, time, 1)
  drawDocument(painter, [-3.34, 1.25, -0.7], [-0.05, -0.25, -0.1], [0.7, 0.9, 0.98], fileVisibility * 0.92, time, 2)
  drawDocument(painter, [-1.75, 0.82, 0.92], [0.04, 0.28, 0.04], [1, 0.82, 0.5], quoteVisibility, time, 3)
}

function partPosition(progress: number): Vec3 {
  const intoMachine = segment(progress, 0.45, 0.58)
  const toQuality = segment(progress, 0.68, 0.79)
  const toDelivery = segment(progress, 0.84, 0.96)
  let x = lerp(-2.35, 0.1, intoMachine)
  x = lerp(x, 3.2, toQuality)
  x = lerp(x, 5.7, toDelivery)
  const y = progress < 0.44 ? 0.18 : -0.05
  return [x, y, 0]
}

function drawPart(painter: ScenePainter, state: FrameState) {
  const { progress, time, idleBlend, ambientSpin } = state
  const [x, baseY, z] = partPosition(progress)
  const heroFloat = (1 - segment(progress, 0.42, 0.5)) * Math.sin(time * 0.85) * 0.08
  const spin = progress * 20 + ambientSpin
  const y = baseY + heroFloat

  painter.draw({
    position: [x, y, z],
    rotation: [0, spin * 0.18, Math.PI / 2],
    scale: [0.26, 0.7, 0.26],
    color: steel,
    emissive: 0.08,
    shape: 'cylinder',
  })
  ;[-0.58, 0.58].forEach((offset) => {
    painter.draw({
      position: [x + offset, y, z],
      rotation: [0, spin * 0.18, Math.PI / 2],
      scale: [0.34, 0.12, 0.34],
      color: [0.34, 0.46, 0.6],
      shape: 'cylinder',
    })
  })

  const markerAngle = spin + idleBlend * time * 0.15
  painter.draw({
    position: [x, y + Math.cos(markerAngle) * 0.29, z + Math.sin(markerAngle) * 0.29],
    scale: [0.18, 0.035, 0.035],
    color: cyan,
    emissive: 0.75,
  })
}

function drawMachine(painter: ScenePainter, state: FrameState) {
  const { progress, time, idleBlend } = state
  const visibility = segment(progress, 0.4, 0.5) * (1 - segment(progress, 0.78, 0.85))
  if (visibility <= 0.01) return

  painter.draw({ position: [0.05, -0.61, 0], scale: [1.45, 0.16, 1.15], color: navy, alpha: visibility })
  ;[-1.16, 1.16].forEach((x) => {
    painter.draw({ position: [x, 0.55, 0.48], scale: [0.16, 1.0, 0.18], color: slate, alpha: visibility })
  })
  painter.draw({ position: [0, 1.48, 0.46], scale: [1.32, 0.15, 0.2], color: [0.1, 0.2, 0.34], alpha: visibility })

  const production = segment(progress, 0.56, 0.67)
  const idlePulse = Math.sin(time * 2.2) * 0.045 * idleBlend
  const toolY = 1.06 - production * 0.62 + idlePulse
  painter.draw({ position: [0.08, toolY + 0.4, 0], scale: [0.18, 0.42, 0.18], color: [0.26, 0.34, 0.43], shape: 'cylinder', alpha: visibility })
  painter.draw({ position: [0.08, toolY, 0], scale: [0.075, 0.3, 0.075], color: steel, shape: 'cylinder', alpha: visibility })

  const running = segment(progress, 0.54, 0.61) * (1 - segment(progress, 0.74, 0.79))
  painter.draw({
    position: [1.02, 1.37, 0.24],
    scale: [0.075, 0.075, 0.045],
    color: running > 0.1 ? emerald : blue,
    emissive: running > 0.1 ? 1.0 + Math.sin(time * 3) * 0.2 : 0.5,
    alpha: visibility,
  })

  if (running > 0.05) {
    for (let index = 0; index < 7; index += 1) {
      const phase = time * (1.2 + index * 0.08) + index * 1.8
      const spread = 0.16 + index * 0.035
      painter.draw({
        position: [
          0.1 + Math.cos(phase) * spread,
          0.23 + Math.abs(Math.sin(phase * 1.3)) * 0.34,
          Math.sin(phase) * spread,
        ],
        scale: [0.012, 0.035, 0.012],
        color: amber,
        emissive: 1.3,
        alpha: running * 0.75,
      })
    }
  }
}

function drawScanner(painter: ScenePainter, state: FrameState) {
  const { progress, time, idleBlend } = state
  const visibility = segment(progress, 0.7, 0.78) * (1 - segment(progress, 0.94, 0.99))
  if (visibility <= 0.01) return

  ;[-0.74, 0.74].forEach((z) => {
    painter.draw({ position: [3.2, 0.55, z], scale: [0.11, 1.05, 0.11], color: [0.12, 0.3, 0.3], alpha: visibility })
  })
  painter.draw({ position: [3.2, 1.52, 0], scale: [0.12, 0.12, 0.84], color: [0.12, 0.3, 0.3], alpha: visibility })

  const scrollScan = lerp(-0.62, 0.62, segment(progress, 0.75, 0.86))
  const idleScan = Math.sin(time * 1.45) * 0.62
  const scanZ = lerp(scrollScan, idleScan, idleBlend * 0.82)
  painter.draw({
    position: [3.2, 0.35, scanZ],
    scale: [0.48, 0.72, 0.018],
    color: emerald,
    emissive: 1.15,
    alpha: visibility * 0.3,
  })
  painter.draw({
    position: [3.2, 1.45, scanZ],
    scale: [0.15, 0.05, 0.05],
    color: emerald,
    emissive: 1.4,
    alpha: visibility,
  })
}

function drawDelivery(painter: ScenePainter, state: FrameState) {
  const { progress, time } = state
  const visibility = segment(progress, 0.82, 0.9)
  if (visibility <= 0.01) return

  painter.draw({ position: [5.72, -0.48, 0], scale: [1.45, 0.12, 0.82], color: navy, alpha: visibility })
  for (let index = -4; index <= 4; index += 1) {
    painter.draw({
      position: [5.72 + index * 0.29, -0.28, 0],
      rotation: [Math.PI / 2, 0, 0],
      scale: [0.08, 0.76, 0.08],
      color: [0.32, 0.43, 0.55],
      shape: 'cylinder',
      alpha: visibility,
    })
  }

  const packageProgress = segment(progress, 0.93, 0.99)
  const packageY = lerp(-0.2, 0.36, packageProgress)
  painter.draw({
    position: [5.72, packageY, 0],
    scale: [0.82, 0.58, 0.62],
    color: [0.08, 0.23, 0.43],
    alpha: packageProgress * 0.88,
  })
  painter.draw({
    position: [5.72, packageY + 0.61, 0],
    scale: [0.84, 0.025, 0.64],
    color: cyan,
    emissive: 0.8,
    alpha: packageProgress,
  })
  painter.draw({
    position: [6.82, 0.8, -0.56],
    scale: [0.07, 0.07, 0.07],
    color: cyan,
    emissive: 1.15 + Math.sin(time * 2.8) * 0.22,
    alpha: visibility,
  })
}

export function renderQualityTrackFrame(
  painter: ScenePainter,
  state: FrameState,
) {
  drawFloor(painter, state.progress, state.time)
  drawDocuments(painter, state)
  drawMachine(painter, state)
  drawScanner(painter, state)
  drawDelivery(painter, state)
  drawPart(painter, state)
}
