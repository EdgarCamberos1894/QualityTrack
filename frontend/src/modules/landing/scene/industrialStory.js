function makeCanvasTexture(THREE, eyebrow, title, rows, accent) {
  const canvas = document.createElement('canvas')
  canvas.width = 920
  canvas.height = 580
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('No se pudo crear la textura de la escena 3D.')

  const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = '#07111f'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = accent
    ctx.fillRect(0, 0, 18, canvas.height)
    ctx.fillStyle = '#7f94aa'
    ctx.font = '700 27px system-ui'
    ctx.fillText(eyebrow.toUpperCase(), 62, 72)
    ctx.fillStyle = '#f4f8ff'
    ctx.font = '800 50px system-ui'
    ctx.fillText(title, 62, 140)
    rows.forEach((row, index) => {
      const y = 230 + index * 78
      ctx.fillStyle = '#17314d'
      ctx.fillRect(62, y - 34, 790, 54)
      ctx.fillStyle = index === rows.length - 1 ? accent : '#b6c5d4'
      ctx.font = index === rows.length - 1 ? '800 30px system-ui' : '600 27px system-ui'
      ctx.fillText(row, 84, y + 2)
    })
  }
  draw()
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

function card(THREE, eyebrow, title, rows, accent) {
  const group = new THREE.Group()
  const texture = makeCanvasTexture(THREE, eyebrow, title, rows, accent)
  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(1.78, 1.12),
    new THREE.MeshBasicMaterial({ map: texture, transparent: true, toneMapped: false }),
  )
  const frame = new THREE.Mesh(
    new THREE.BoxGeometry(1.9, 1.24, 0.08),
    new THREE.MeshStandardMaterial({ color: 0x142338, metalness: 0.7, roughness: 0.32, transparent: true }),
  )
  screen.position.z = 0.05
  group.add(frame, screen)
  return group
}

function setFade(group, opacity) {
  group.visible = opacity > 0.01
  group.traverse((object) => {
    if (!object.material) return
    object.material.transparent = true
    object.material.opacity = opacity
  })
}

export function buildIndustrialStory(THREE, root) {
  const request = card(
    THREE,
    'Solicitud',
    'SOL-2026-014',
    ['Eje de transmisión', 'AISI 4140 · 12 pzas', 'Documentos 03'],
    '#26c6f4',
  )
  request.position.set(-3.4, 0.9, 0.4)
  request.rotation.y = 0.22
  root.add(request)

  const expediente = new THREE.Group()
  const expedienteCards = [
    card(THREE, 'Expediente 360', 'Plano técnico', ['REV B', 'Tolerancias', 'PDF · 2.4 MB'], '#4d8fff'),
    card(THREE, 'Expediente 360', 'Revisión interna', ['Material validado', 'Ruta definida', 'Contexto completo'], '#54d6ff'),
    card(THREE, 'Expediente 360', 'Trazabilidad', ['Solicitud recibida', 'Aclaración cerrada', 'Listo para cotizar'], '#40d69b'),
  ]
  expedienteCards.forEach((item) => expediente.add(item))
  root.add(expediente)

  const quotation = card(
    THREE,
    'Cotización',
    'QT-2026-014',
    ['Mecanizado CNC', 'Entrega · 20 días', '$ 38,450 MXN · APROBADA'],
    '#ffad35',
  )
  quotation.position.set(-1.7, 0.95, 0.25)
  quotation.rotation.y = 0.18
  root.add(quotation)

  const workOrder = card(
    THREE,
    'Orden de trabajo',
    'OT-2026-041',
    ['Corte → Torneado', 'Fresado → Inspección', 'RUTA LIBERADA'],
    '#9875ff',
  )
  workOrder.position.set(1.75, 1.05, -0.55)
  workOrder.rotation.y = -0.28
  root.add(workOrder)

  const measure = card(
    THREE,
    'Control dimensional',
    'Inspección conforme',
    ['Ø 24.98 mm ✓', 'Tolerancia ±0.05 ✓', 'RESULTADO · PASS'],
    '#45e29a',
  )
  measure.position.set(5.05, 1.05, -0.55)
  measure.rotation.y = -0.25
  root.add(measure)

  const stageLabels = [
    ['Solicitud', -2.5, '#25c8f7'],
    ['Cotización', -0.9, '#ffad35'],
    ['Producción', 1.1, '#4b8fff'],
    ['Calidad', 4.45, '#45e29a'],
    ['Entrega', 7.2, '#25c8f7'],
  ].map(([label, x, accent]) => {
    const labelCard = card(THREE, 'QualityTrack', label, ['FLUJO CONECTADO'], accent)
    labelCard.scale.setScalar(0.42)
    labelCard.position.set(x, 2.35, -0.25)
    root.add(labelCard)
    setFade(labelCard, 0)
    return labelCard
  })

  return { request, expediente, expedienteCards, quotation, workOrder, measure, stageLabels }
}

export function updateIndustrialStory(THREE, story, progress, time) {
  const requestIn = THREE.MathUtils.smoothstep(progress, 0.06, 0.13)
  const requestOut = THREE.MathUtils.smoothstep(progress, 0.21, 0.28)
  const requestAlpha = requestIn * (1 - requestOut)
  story.request.position.x = THREE.MathUtils.lerp(-3.6, -1.8, requestIn)
  story.request.position.y = 0.85 + Math.sin(time * 0.8) * 0.04
  setFade(story.request, requestAlpha)

  const fileIn = THREE.MathUtils.smoothstep(progress, 0.17, 0.24)
  const fileOut = THREE.MathUtils.smoothstep(progress, 0.34, 0.42)
  const fileAlpha = fileIn * (1 - fileOut)
  const spread = THREE.MathUtils.smoothstep(progress, 0.19, 0.29)
  const targets = [
    [-2.15, 1.22, -0.55, -0.22],
    [-0.65, 1.36, -0.78, 0.18],
    [-1.28, 0.15, 0.62, 0.05],
  ]
  story.expedienteCards.forEach((item, index) => {
    const target = targets[index]
    item.position.set(
      THREE.MathUtils.lerp(-1.25, target[0], spread),
      THREE.MathUtils.lerp(0.8, target[1], spread) + Math.sin(time * 0.7 + index) * 0.03,
      THREE.MathUtils.lerp(0.05, target[2], spread),
    )
    item.rotation.y = target[3] * spread
    item.scale.setScalar(0.68)
    setFade(item, fileAlpha)
  })

  const quoteIn = THREE.MathUtils.smoothstep(progress, 0.30, 0.37)
  const quoteOut = THREE.MathUtils.smoothstep(progress, 0.45, 0.53)
  setFade(story.quotation, quoteIn * (1 - quoteOut))
  story.quotation.position.y = 0.95 + Math.sin(time * 0.75) * 0.035

  const woIn = THREE.MathUtils.smoothstep(progress, 0.42, 0.49)
  const woOut = THREE.MathUtils.smoothstep(progress, 0.58, 0.66)
  setFade(story.workOrder, woIn * (1 - woOut))

  const measureIn = THREE.MathUtils.smoothstep(progress, 0.72, 0.79)
  const measureOut = THREE.MathUtils.smoothstep(progress, 0.89, 0.96)
  setFade(story.measure, measureIn * (1 - measureOut))

  const overview = THREE.MathUtils.smoothstep(progress, 0.94, 0.995)
  story.stageLabels.forEach((label, index) => {
    setFade(label, overview * (0.62 + index * 0.07))
  })
}
