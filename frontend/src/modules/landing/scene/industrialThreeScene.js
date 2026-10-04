import { buildIndustrialStory, updateIndustrialStory } from './industrialStory.js'
import { buildIndustrialWorld, updateIndustrialWorld } from './industrialWorld.js'
import {
  sampleStageVector,
  stageIndex,
  stageLocalProgress,
  stageSceneMotion,
} from './storyTimeline.js'

const THREE_URL = 'https://cdn.jsdelivr.net/npm/three@0.186.1/build/three.module.js'

function applyStageWorldState(THREE, world, progress, time) {
  const currentStage = stageIndex(progress)
  const local = stageLocalProgress(progress, currentStage)
  const motion = stageSceneMotion(progress, currentStage)
  const introActive = currentStage === 0
  const workOrderActive = currentStage === 4
  const productionActive = currentStage === 5
  const qualityActive = currentStage === 6
  const deliveryActive = currentStage === 7

  world.root.position.x = 0.2 + motion.offset

  world.machine.visible = introActive || workOrderActive || productionActive
  world.floor.visible =
    introActive || workOrderActive || productionActive || qualityActive || deliveryActive
  world.grid.visible = world.floor.visible

  const physicalPartVisible =
    introActive || productionActive || qualityActive || deliveryActive
  world.workpieceGroup.visible = physicalPartVisible

  if (introActive) {
    const settle = THREE.MathUtils.smoothstep(local, 0.08, 0.7)
    world.workpieceGroup.position.set(
      THREE.MathUtils.lerp(-0.52, -0.2, settle),
      0.18 + Math.sin(time * 0.85) * 0.05,
      0.1,
    )
    world.workpieceGroup.rotation.x = time * 0.28 + local * 0.35
  } else if (productionActive) {
    world.workpieceGroup.position.set(0.55, 0.18, 0.1)
    world.workpieceGroup.rotation.x = time * 6.2 + local * 1.8
  } else if (qualityActive) {
    world.workpieceGroup.position.set(4.45, 0.18, 0.1)
    world.workpieceGroup.rotation.x = local * 0.42
  } else if (deliveryActive) {
    const travel = THREE.MathUtils.smoothstep(local, 0.12, 0.82)
    world.workpieceGroup.position.set(
      THREE.MathUtils.lerp(6.55, 7.65, travel),
      -0.42 + Math.sin(time * 1.2) * 0.018,
      0.1,
    )
    world.workpieceGroup.rotation.x = local * 1.1
  }
}

export async function createIndustrialThreeScene(canvas, options) {
  const THREE = await import(/* @vite-ignore */ THREE_URL)
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance',
  })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6))
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.16
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.setClearColor(0x020617, 0)

  const scene = new THREE.Scene()
  scene.fog = new THREE.FogExp2(0x020617, 0.035)
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 80)

  const hemi = new THREE.HemisphereLight(0xcfe7ff, 0x07111f, 1.35)
  scene.add(hemi)
  const key = new THREE.DirectionalLight(0xffffff, 3.5)
  key.position.set(5, 8, 6)
  key.castShadow = true
  key.shadow.mapSize.set(1024, 1024)
  key.shadow.camera.near = 0.5
  key.shadow.camera.far = 24
  key.shadow.camera.left = -9
  key.shadow.camera.right = 9
  key.shadow.camera.top = 7
  key.shadow.camera.bottom = -7
  scene.add(key)

  const blueLight = new THREE.PointLight(0x2587ff, 16, 13, 2)
  blueLight.position.set(2.4, 2.0, 3.8)
  scene.add(blueLight)
  const cyanLight = new THREE.PointLight(0x20d9ff, 11, 9, 2)
  cyanLight.position.set(-2.2, 1.4, 2.5)
  scene.add(cyanLight)
  const greenLight = new THREE.PointLight(0x35e39a, 9, 8, 2)
  greenLight.position.set(5.4, 1.5, 2.2)
  scene.add(greenLight)

  const world = buildIndustrialWorld(THREE, scene)
  const story = buildIndustrialStory(THREE, world.root)

  const cameraPositions = [
    [4.6, 2.55, 7.15],
    [3.35, 1.95, 5.3],
    [2.95, 2.08, 4.95],
    [2.85, 2.0, 4.8],
    [3.65, 1.82, 4.65],
    [3.35, 1.48, 4.05],
    [7.15, 1.82, 4.75],
    [10.5, 3.45, 7.55],
  ]
  const cameraTargets = [
    [0.7, 0.35, 0.05],
    [-0.82, 0.62, 0.04],
    [-0.52, 0.7, 0],
    [-0.72, 0.72, 0],
    [1.0, 0.48, 0],
    [0.75, 0.16, 0],
    [4.45, 0.25, 0],
    [5.15, 0.14, 0],
  ]

  let disposed = false
  let animationFrame = 0
  let lastTime = performance.now()
  let idleBlend = 1
  let resizeObserver = null
  let cameraStage = 0

  const resize = () => {
    const rect = canvas.getBoundingClientRect()
    const width = Math.max(1, rect.width)
    const height = Math.max(1, rect.height)
    renderer.setSize(width, height, false)
    camera.aspect = width / height
    camera.updateProjectionMatrix()
  }

  const render = (now) => {
    if (disposed) return
    const delta = Math.min((now - lastTime) / 1000, 0.05)
    lastTime = now
    const progress = options.progressRef.current
    const currentStage = stageIndex(progress)
    const idleTarget = options.reducedMotion ? 0 : options.scrollingRef.current ? 0.12 : 1
    idleBlend += (idleTarget - idleBlend) * (1 - Math.exp(-delta * 4.6))
    const time = now / 1000

    updateIndustrialWorld(THREE, world, progress, idleBlend, time)
    applyStageWorldState(THREE, world, progress, time)
    updateIndustrialStory(THREE, story, progress, time)

    const desiredCamera = sampleStageVector(THREE, cameraPositions, progress)
    const desiredTarget = sampleStageVector(THREE, cameraTargets, progress)
    if (!options.reducedMotion) {
      desiredCamera.x += Math.sin(time * 0.28) * 0.045 * idleBlend
      desiredCamera.y += Math.cos(time * 0.23) * 0.032 * idleBlend
    }

    if (currentStage !== cameraStage) {
      cameraStage = currentStage
      camera.position.copy(desiredCamera)
    } else {
      camera.position.lerp(desiredCamera, 1 - Math.exp(-delta * 7.5))
    }
    camera.lookAt(desiredTarget)

    renderer.render(scene, camera)
    animationFrame = requestAnimationFrame(render)
  }

  resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(canvas)
  resize()
  camera.position.set(...cameraPositions[0])
  animationFrame = requestAnimationFrame(render)

  return {
    dispose() {
      if (disposed) return
      disposed = true
      cancelAnimationFrame(animationFrame)
      resizeObserver?.disconnect()
      scene.traverse((object) => {
        object.geometry?.dispose?.()
        if (Array.isArray(object.material)) {
          object.material.forEach((material) => material.dispose?.())
        } else {
          object.material?.dispose?.()
        }
      })
      renderer.dispose()
    },
  }
}
