export function buildIndustrialWorld(THREE, scene) {
  const root = new THREE.Group()
  root.position.x = 0.8
  scene.add(root)

  const metal = new THREE.MeshStandardMaterial({ color: 0x8fa5b7, metalness: 0.94, roughness: 0.18 })
  const darkMetal = new THREE.MeshStandardMaterial({ color: 0x182332, metalness: 0.72, roughness: 0.32 })
  const frameMat = new THREE.MeshStandardMaterial({ color: 0x26384a, metalness: 0.55, roughness: 0.38 })
  const floorMat = new THREE.MeshStandardMaterial({ color: 0x07111f, metalness: 0.2, roughness: 0.68 })
  const glassMat = new THREE.MeshPhysicalMaterial({ color: 0x8bd9ff, transparent: true, opacity: 0.08, roughness: 0.08, metalness: 0.05, transmission: 0.2 })
  const cyanMat = new THREE.MeshStandardMaterial({ color: 0x16d9ff, emissive: 0x0d7ea0, emissiveIntensity: 1.2, metalness: 0.25, roughness: 0.25 })

  const box = (w, h, d, material, x, y, z) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material)
    mesh.position.set(x, y, z)
    mesh.castShadow = true
    mesh.receiveShadow = true
    root.add(mesh)
    return mesh
  }

  const cylinder = (rt, rb, h, material, x, y, z, rx = 0, rz = 0) => {
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, 32), material)
    mesh.position.set(x, y, z)
    mesh.rotation.x = rx
    mesh.rotation.z = rz
    mesh.castShadow = true
    mesh.receiveShadow = true
    root.add(mesh)
    return mesh
  }

  box(12.8, 0.18, 4.2, floorMat, 2.8, -1.2, 0)
  const grid = new THREE.GridHelper(13, 26, 0x17385f, 0x10243d)
  grid.position.set(2.8, -1.09, 0)
  grid.material.transparent = true
  grid.material.opacity = 0.42
  root.add(grid)

  const profile = [
    [0.20, -1.55], [0.24, -1.44], [0.24, -1.20], [0.34, -1.12], [0.34, -0.92],
    [0.49, -0.84], [0.49, -0.62], [0.31, -0.54], [0.31, -0.20], [0.40, -0.12],
    [0.40, 0.12], [0.31, 0.20], [0.31, 0.54], [0.49, 0.62], [0.49, 0.84],
    [0.34, 0.92], [0.34, 1.12], [0.24, 1.20], [0.24, 1.44], [0.20, 1.55],
  ].map(([radius, axis]) => new THREE.Vector2(radius, axis))
  const workpieceGroup = new THREE.Group()
  workpieceGroup.position.set(-0.2, 0.2, 0.1)
  root.add(workpieceGroup)
  const workpiece = new THREE.Mesh(new THREE.LatheGeometry(profile, 64), metal)
  workpiece.rotation.z = Math.PI / 2
  workpiece.castShadow = true
  workpiece.receiveShadow = true
  workpieceGroup.add(workpiece)

  const grooveMat = new THREE.MeshStandardMaterial({ color: 0x405366, metalness: 0.9, roughness: 0.23 })
  const grooves = [-0.78, -0.52, 0.52, 0.78].map((x) => {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.026, 12, 48), grooveMat)
    ring.position.x = x
    ring.rotation.y = Math.PI / 2
    workpieceGroup.add(ring)
    return ring
  })
  const keyway = new THREE.Mesh(
    new THREE.BoxGeometry(1.45, 0.055, 0.08),
    new THREE.MeshStandardMaterial({ color: 0x0f2638, metalness: 0.72, roughness: 0.22 }),
  )
  keyway.position.set(0, 0.405, 0)
  workpieceGroup.add(keyway)
  const inspectionMark = new THREE.Mesh(
    new THREE.BoxGeometry(0.22, 0.035, 0.1),
    new THREE.MeshBasicMaterial({ color: 0x20d8ff }),
  )
  inspectionMark.position.set(0.12, 0.445, 0)
  workpieceGroup.add(inspectionMark)

  const machine = new THREE.Group()
  machine.position.set(0.55, 0, 0)
  root.add(machine)
  const addMachineBox = (w, h, d, material, x, y, z) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material)
    mesh.position.set(x, y, z)
    mesh.castShadow = true
    mesh.receiveShadow = true
    machine.add(mesh)
    return mesh
  }
  addMachineBox(3.9, 0.35, 2.8, darkMetal, 0, -0.9, 0)
  addMachineBox(0.28, 3.0, 0.28, frameMat, -1.65, 0.55, 1.12)
  addMachineBox(0.28, 3.0, 0.28, frameMat, 1.65, 0.55, 1.12)
  addMachineBox(0.28, 3.0, 0.28, frameMat, -1.65, 0.55, -1.12)
  addMachineBox(0.28, 3.0, 0.28, frameMat, 1.65, 0.55, -1.12)
  addMachineBox(3.55, 0.28, 2.5, frameMat, 0, 1.9, 0)
  addMachineBox(3.2, 2.2, 0.08, glassMat, 0, 0.55, -1.16)
  addMachineBox(0.08, 2.2, 2.1, glassMat, -1.72, 0.55, 0)
  addMachineBox(0.08, 2.2, 2.1, glassMat, 1.72, 0.55, 0)

  const chuckMat = new THREE.MeshStandardMaterial({ color: 0x536779, metalness: 0.9, roughness: 0.24 })
  const chuckLeft = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.58, 0.24, 40), chuckMat)
  chuckLeft.rotation.z = Math.PI / 2
  chuckLeft.position.set(-0.92, 0.15, 0)
  machine.add(chuckLeft)
  const chuckRight = chuckLeft.clone()
  chuckRight.position.x = 0.92
  machine.add(chuckRight)

  const head = new THREE.Group()
  machine.add(head)
  const headBody = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.34, 0.72, 32), frameMat)
  headBody.position.y = 1.15
  head.add(headBody)
  const tool = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.09, 0.66, 24), metal)
  tool.position.y = 0.55
  head.add(tool)

  const makeLight = (color, y) => {
    const mat = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.3, roughness: 0.25 })
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.16, 24), mat)
    mesh.position.set(1.48, y, 0.82)
    machine.add(mesh)
    return mat
  }
  cylinder(0.035, 0.035, 0.55, darkMetal, 2.03, 1.98, 0.82)
  const tower = {
    green: makeLight(0x21d987, 2.15),
    amber: makeLight(0xffa928, 2.34),
    red: makeLight(0xff4d67, 2.53),
  }

  const monitorCanvas = document.createElement('canvas')
  monitorCanvas.width = 720
  monitorCanvas.height = 420
  const monitorContext = monitorCanvas.getContext('2d')
  const monitorTexture = new THREE.CanvasTexture(monitorCanvas)
  monitorTexture.colorSpace = THREE.SRGBColorSpace
  const monitorMaterial = new THREE.MeshBasicMaterial({ map: monitorTexture, toneMapped: false })
  const monitor = new THREE.Mesh(new THREE.PlaneGeometry(1.24, 0.72), monitorMaterial)
  monitor.position.set(1.75, 0.78, 1.18)
  monitor.rotation.y = -0.27
  machine.add(monitor)
  addMachineBox(1.38, 0.86, 0.08, darkMetal, 1.75, 0.78, 1.22)

  const processMaterial = new THREE.MeshBasicMaterial({ color: 0x168cff, transparent: true, opacity: 0.8 })
  const processLine = new THREE.Mesh(new THREE.BoxGeometry(10.2, 0.028, 0.028), processMaterial)
  processLine.position.set(2.8, -0.63, 1.5)
  root.add(processLine)
  const dataDots = Array.from({ length: 11 }, () => {
    const dot = new THREE.Mesh(new THREE.SphereGeometry(0.075, 18, 18), cyanMat)
    root.add(dot)
    return dot
  })

  const quality = new THREE.Group()
  quality.position.set(4.45, 0, 0)
  root.add(quality)
  const qualityMat = new THREE.MeshStandardMaterial({ color: 0x0f4f4a, metalness: 0.55, roughness: 0.32 })
  ;[-0.85, 0.85].forEach((z) => {
    const column = new THREE.Mesh(new THREE.BoxGeometry(0.22, 2.7, 0.22), qualityMat)
    column.position.set(0, 0.25, z)
    quality.add(column)
  })
  const qTop = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.22, 1.9), qualityMat)
  qTop.position.set(0, 1.58, 0)
  quality.add(qTop)
  const laserMaterial = new THREE.MeshBasicMaterial({ color: 0x31e69f, transparent: true, opacity: 0.28, side: THREE.DoubleSide, blending: THREE.AdditiveBlending })
  const laser = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.8), laserMaterial)
  laser.rotation.y = Math.PI / 2
  laser.position.set(0, 0.28, 0)
  quality.add(laser)

  const delivery = new THREE.Group()
  delivery.position.set(7.2, -0.72, 0)
  root.add(delivery)
  for (let i = -4; i <= 4; i += 1) {
    const roller = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 1.7, 24), chuckMat)
    roller.rotation.x = Math.PI / 2
    roller.position.set(i * 0.34, 0, 0)
    delivery.add(roller)
  }

  const sparksGeometry = new THREE.BufferGeometry()
  const sparkPositions = new Float32Array(36 * 3)
  sparksGeometry.setAttribute('position', new THREE.BufferAttribute(sparkPositions, 3))
  const sparksMaterial = new THREE.PointsMaterial({ color: 0xffb02e, size: 0.075, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })
  const sparks = new THREE.Points(sparksGeometry, sparksMaterial)
  root.add(sparks)

  return {
    root, workpieceGroup, workpiece, grooves, machine, head, chuckLeft, chuckRight, tower,
    monitorContext, monitorTexture, processMaterial, dataDots, quality, laser,
    delivery, sparks, sparkPositions, sparksMaterial,
  }
}

function setOpacity(group, opacity) {
  group.visible = opacity > 0.01
  group.traverse((object) => {
    if (object.material && 'opacity' in object.material) {
      object.material.transparent = opacity < 0.999 || object.material.transparent
      object.material.opacity = opacity
    }
  })
}

export function updateIndustrialWorld(THREE, world, progress, idleBlend, time) {
  const prodStart = THREE.MathUtils.smoothstep(progress, 0.53, 0.62)
  const prodEnd = THREE.MathUtils.smoothstep(progress, 0.70, 0.78)
  const production = prodStart * (1 - prodEnd)
  const quality = THREE.MathUtils.smoothstep(progress, 0.70, 0.80) * (1 - THREE.MathUtils.smoothstep(progress, 0.91, 0.98))
  const delivery = THREE.MathUtils.smoothstep(progress, 0.84, 0.96)

  let x = THREE.MathUtils.lerp(-0.2, 0.55, THREE.MathUtils.smoothstep(progress, 0.46, 0.58))
  x = THREE.MathUtils.lerp(x, 4.45, THREE.MathUtils.smoothstep(progress, 0.69, 0.80))
  x = THREE.MathUtils.lerp(x, 7.2, THREE.MathUtils.smoothstep(progress, 0.86, 0.96))
  const floating = 1 - THREE.MathUtils.smoothstep(progress, 0.43, 0.52)
  world.workpieceGroup.position.set(
    x,
    0.18 + Math.sin(time * 0.85) * 0.08 * floating * idleBlend,
    0.1,
  )
  world.workpieceGroup.rotation.x += 0.004 + production * 0.18

  const toolBase = THREE.MathUtils.lerp(0.95, 0.05, prodStart)
  world.head.position.y = toolBase + Math.sin(time * 3) * 0.025 * production * idleBlend
  world.chuckLeft.rotation.y += 0.005 + production * 0.22
  world.chuckRight.rotation.y -= 0.005 + production * 0.22

  world.tower.green.emissiveIntensity = 0.8 + Math.sin(time * 2.2) * 0.25
  world.tower.amber.emissiveIntensity = 0.12 + (Math.sin(time * 1.1) + 1) * 0.12
  world.tower.red.emissiveIntensity = 0.05 + (Math.sin(time * 0.7) + 1) * 0.03

  world.dataDots.forEach((dot, index) => {
    const t = (time * (0.06 + idleBlend * 0.035) + index / world.dataDots.length + progress * 0.28) % 1
    dot.position.set(-2.25 + t * 10.1, -0.58 + Math.sin(time * 1.4 + index) * 0.02, 1.5)
    dot.scale.setScalar(0.75 + Math.sin(time * 2.2 + index) * 0.15)
  })

  world.laser.position.z = THREE.MathUtils.lerp(
    THREE.MathUtils.lerp(-0.65, 0.65, THREE.MathUtils.smoothstep(progress, 0.76, 0.87)),
    Math.sin(time * 1.35) * 0.68,
    idleBlend * quality,
  )
  world.laser.material.opacity = 0.08 + quality * 0.34
  world.quality.visible = progress > 0.62
  world.delivery.visible = progress > 0.79

  const sparkOpacity = production * (0.55 + idleBlend * 0.4)
  world.sparksMaterial.opacity = sparkOpacity
  const positions = world.sparkPositions
  for (let i = 0; i < positions.length / 3; i += 1) {
    const phase = time * (2.1 + i * 0.015) + i * 0.71
    const radius = 0.09 + (i % 7) * 0.045
    positions[i * 3] = 0.55 + Math.cos(phase) * radius
    positions[i * 3 + 1] = 0.18 + Math.abs(Math.sin(phase * 1.4)) * (0.15 + (i % 5) * 0.07)
    positions[i * 3 + 2] = 0.1 + Math.sin(phase) * radius
  }
  world.sparks.geometry.attributes.position.needsUpdate = true

  if (world.monitorContext && Math.floor(time * 3) !== world.lastMonitorTick) {
    world.lastMonitorTick = Math.floor(time * 3)
    const ctx = world.monitorContext
    const status = production > 0.15 ? 'RUNNING' : quality > 0.15 ? 'QC CHECK' : delivery > 0.15 ? 'DELIVERY' : 'READY'
    const rpm = Math.round(620 + production * 1280 + Math.sin(time) * 35)
    const load = Math.round(24 + production * 58 + (Math.sin(time * 1.7) + 1) * 4)
    ctx.fillStyle = '#03111f'
    ctx.fillRect(0, 0, 720, 420)
    ctx.fillStyle = '#4fd5ff'
    ctx.font = '700 34px system-ui'
    ctx.fillText('QUALITYTRACK · CNC-01', 38, 58)
    ctx.fillStyle = status === 'RUNNING' ? '#45e29a' : '#8ab4ff'
    ctx.font = '800 54px system-ui'
    ctx.fillText(status, 38, 130)
    ctx.fillStyle = '#9db0c5'
    ctx.font = '600 28px ui-monospace, monospace'
    ctx.fillText(`RPM ${rpm}`, 40, 205)
    ctx.fillText(`LOAD ${load}%`, 40, 254)
    ctx.fillText(`PART AISI 4140`, 40, 303)
    ctx.fillStyle = '#15324e'
    ctx.fillRect(40, 334, 620, 24)
    ctx.fillStyle = '#2385ff'
    ctx.fillRect(40, 334, 620 * Math.min(1, progress + 0.08), 24)
    world.monitorTexture.needsUpdate = true
  }
}
