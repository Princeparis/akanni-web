import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { ibadanChapters, type IbadanFocus } from '@/data/ibadan'
import { ibadanGallery, type IbadanSculpture } from '@/data/ibadan-gallery'
import { createGalleryLibrary } from './gallery-models'
import { createParticleCloud } from './particle-surface'

/** Detailed local models rendered entirely as surface particles. */
export async function createIbadanScene(host: HTMLElement, onLost: () => void) {
  const loader = new GLTFLoader()
  const models = await Promise.all([
    loader.loadAsync('/ibadan/models/iyalode-study.glb'),
    loader.loadAsync('/ibadan/models/commander-study.glb'),
  ])
  const head = (root: THREE.Object3D) => {
    let geometry: THREE.BufferGeometry | undefined
    root.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        geometry = child.geometry
        const materials = Array.isArray(child.material) ? child.material : [child.material]
        materials.forEach((material) => material.dispose())
      }
    })
    if (!geometry) throw new Error('Portrait model has no geometry')
    return geometry
  }
  const sources = createGalleryLibrary({ woman: head(models[0].scene), man: head(models[1].scene) })
  const mobile = host.clientWidth < 760
  const particleCount = mobile ? 65000 : 120000
  const clouds = new Map<IbadanSculpture, ReturnType<typeof createParticleCloud>>()
  const library = {
    get(type: IbadanSculpture) {
      let cloud = clouds.get(type)
      if (!cloud) {
        // Keep only four point buffers; active transition layers retain their data.
        if (clouds.size >= 4) {
          for (const [key, previous] of clouds) {
            if (previous.group.parent) continue
            previous.geometry.dispose()
            previous.material.dispose()
            previous.depthMaterial.dispose()
            clouds.delete(key)
            break
          }
        }
        cloud = createParticleCloud(
          sources.get(type),
          particleCount,
          1829,
          host.clientHeight,
          Math.min(devicePixelRatio, mobile ? 1.35 : 1.75),
        )
        clouds.set(type, cloud)
      } else {
        clouds.delete(type)
        clouds.set(type, cloud)
      }
      return cloud.group
    },
    opacity(group: THREE.Group, value: number) {
      clouds.get(group.name as IbadanSculpture)!.material.uniforms.uOpacity.value = value
    },
    resize() {
      for (const cloud of clouds.values()) cloud.material.uniforms.uHeight.value = host.clientHeight
    },
    dispose() {
      for (const cloud of clouds.values()) {
        cloud.geometry.dispose()
        cloud.material.dispose()
        cloud.depthMaterial.dispose()
      }
      clouds.clear()
      sources.dispose()
    },
  }
  let renderer: THREE.WebGLRenderer
  try {
    renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: false,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: false,
    })
  } catch (error) {
    library.dispose()
    throw error
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio, mobile ? 1.35 : 1.75))
  renderer.setClearColor(0x10110e, 0)
  renderer.toneMapping = THREE.NoToneMapping
  const canvas = renderer.domElement
  canvas.className = 'ibadan-canvas'
  canvas.setAttribute('role', 'img')
  canvas.setAttribute(
    'aria-label',
    'Detailed 3D particle model. Particles follow the surfaces of facial features, clothing and historical objects. Drag to turn or inspect the model. Portraits are artistic interpretations.',
  )
  host.appendChild(canvas)
  host.dataset.renderer = 'particles'
  host.dataset.particleCount = String(particleCount)
  host.dataset.scene = 'origins'
  host.dataset.view = 'place'
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 70)

  let chapter = 0,
    entered = false,
    reduced = false,
    paused = false,
    visible = true,
    lost = false,
    disposed = false,
    inspection = false,
    frame = 0,
    previous = 0,
    progress = 1,
    focus: IbadanFocus = 'place',
    direction = 1,
    turn = -0.2,
    targetTurn = -0.2,
    cameraTravel = 1
  let current = library.get('iyalode'),
    outgoing: THREE.Group | null = null
  scene.add(current)
  let dragging: { x: number; y: number } | null = null
  const cameraPosition = new THREE.Vector3(0, 2.6, 11)
  const cameraTarget = new THREE.Vector3(0, 1.75, 0)
  let fromPosition = cameraPosition.clone(),
    fromTarget = cameraTarget.clone()
  const toPosition = cameraPosition.clone(),
    toTarget = cameraTarget.clone()
  const narrow = () => host.clientWidth < 760 || host.clientHeight > host.clientWidth
  const pose = () => {
    const portrait = narrow()
    const shortPhone = portrait && host.clientHeight < 700
    const bounds = new THREE.Box3().setFromObject(current)
    const size = bounds.getSize(new THREE.Vector3())
    const center = bounds.getCenter(new THREE.Vector3())
    const heightFraction = entered
      ? portrait
        ? shortPhone
          ? 0.29
          : 0.36
        : 0.57
      : portrait
        ? 0.43
        : 0.55
    const widthFraction = portrait ? 0.84 : entered ? 0.4 : 0.65
    const halfFov = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))
    const distance =
      Math.max(
        size.y / (2 * halfFov * heightFraction),
        size.x / (2 * halfFov * camera.aspect * widthFraction),
      ) +
      size.z * 0.12
    const zoom = inspection ? (portrait ? 0.78 : 0.88) : focus === 'people' ? 0.93 : 1
    const targetY = center.y - current.position.y
    toPosition.set(0, entered ? 2.9 : 2.5, distance * zoom)
    toTarget.set(0, targetY, 0)
    camera.clearViewOffset()
    camera.setViewOffset(
      host.clientWidth,
      host.clientHeight,
      inspection
        ? portrait
          ? 0
          : host.clientWidth * 0.12
        : entered && !portrait
          ? -host.clientWidth * 0.225
          : 0,
      portrait
        ? host.clientHeight * (entered ? (inspection ? 0.13 : 0.18) : 0.13)
        : host.clientHeight * (inspection ? 0.02 : entered ? 0.1 : 0.025),
      host.clientWidth,
      host.clientHeight,
    )
    camera.updateProjectionMatrix()
  }
  const reframe = () => {
    fromPosition = cameraPosition.clone()
    fromTarget = cameraTarget.clone()
    pose()
    cameraTravel = reduced ? 1 : 0
  }
  const finish = () => {
    if (outgoing) scene.remove(outgoing)
    outgoing = null
    current.position.set(0, 0, 0)
  }
  const draw = (now: number) => {
    frame = 0
    if (disposed || lost || !visible || document.hidden) return
    const dt = previous ? Math.min((now - previous) / 1000, 1.5) : 0
    previous = now
    progress = reduced || paused ? 1 : Math.min(1, progress + dt / 1.15)
    cameraTravel = reduced || paused ? 1 : Math.min(1, cameraTravel + dt / 1.45)
    const ease = 1 - Math.pow(1 - progress, 4)
    const t = 1 - Math.pow(1 - cameraTravel, 3)
    cameraPosition.lerpVectors(fromPosition, toPosition, t)
    cameraTarget.lerpVectors(fromTarget, toTarget, t)
    camera.position.copy(cameraPosition)
    camera.lookAt(cameraTarget)
    turn = reduced ? targetTurn : THREE.MathUtils.damp(turn, targetTurn, 9, dt)
    current.rotation.y = turn + (reduced ? 0 : (1 - ease) * direction * 0.48)
    current.position.x = reduced ? 0 : (1 - ease) * direction * 4.5
    current.position.y = reduced ? 0 : -(1 - ease) * 0.28
    if (outgoing) {
      outgoing.position.x = -ease * direction * 5
      outgoing.position.z = -ease * 2
      outgoing.rotation.y = turn - ease * direction * 0.3
    }
    if (progress === 1 && outgoing) finish()
    host.dataset.moving = String(
      progress < 1 || cameraTravel < 1 || Math.abs(turn - targetTurn) > 0.001,
    )
    library.opacity(current, reduced ? 1 : 0.25 + 0.75 * ease)
    if (outgoing) library.opacity(outgoing, 1 - ease)
    renderer.render(scene, camera)
    // Render on demand. No endless orbit or particle churn when a visitor reads.
    if (progress < 1 || cameraTravel < 1 || (!reduced && Math.abs(turn - targetTurn) > 0.001))
      frame = requestAnimationFrame(draw)
  }
  const wake = () => {
    cancelAnimationFrame(frame)
    previous = 0
    if (!disposed && !lost && visible && !document.hidden) frame = requestAnimationFrame(draw)
  }
  const show = () => {
    const next = library.get(
      entered ? ibadanGallery[ibadanChapters[chapter].id].sculpture : 'iyalode',
    )
    if (current !== next) {
      finish()
      outgoing = current
      current = next
      current.position.set(0, 0, 0)
      current.rotation.set(0, targetTurn, 0)
      scene.add(current)
      progress = reduced ? 1 : 0
      if (reduced) finish()
    }
    reframe()
    wake()
  }
  const resize = () => {
    if (!host.clientWidth || !host.clientHeight) return
    renderer.setSize(host.clientWidth, host.clientHeight)
    library.resize()
    camera.aspect = host.clientWidth / host.clientHeight
    pose()
    cameraPosition.copy(toPosition)
    cameraTarget.copy(toTarget)
    fromPosition.copy(toPosition)
    fromTarget.copy(toTarget)
    cameraTravel = 1
    wake()
  }
  const observer = new ResizeObserver(resize)
  observer.observe(host)
  const down = (event: PointerEvent) => {
    if (event.button !== 0) return
    dragging = { x: event.clientX, y: event.clientY }
    canvas.setPointerCapture(event.pointerId)
  }
  const move = (event: PointerEvent) => {
    if (!dragging) return
    targetTurn += (event.clientX - dragging.x) * 0.009
    dragging = { x: event.clientX, y: event.clientY }
    host.dataset.turned = String(targetTurn.toFixed(2))
    wake()
  }
  const up = () => {
    dragging = null
  }
  const visibility = () => {
    cancelAnimationFrame(frame)
    if (!document.hidden) wake()
  }
  const contextLost = (event: Event) => {
    event.preventDefault()
    lost = true
    cancelAnimationFrame(frame)
    onLost()
  }
  canvas.addEventListener('pointerdown', down)
  canvas.addEventListener('pointermove', move)
  canvas.addEventListener('pointerup', up)
  canvas.addEventListener('pointercancel', up)
  canvas.addEventListener('lostpointercapture', up)
  canvas.addEventListener('webglcontextlost', contextLost)
  document.addEventListener('visibilitychange', visibility)
  resize()
  return {
    setEntered(value: boolean) {
      if (entered === value) return
      entered = value
      show()
    },
    setChapter(index: number) {
      if (chapter === index) return
      direction = index > chapter ? 1 : -1
      chapter = index
      focus = 'place'
      targetTurn = -0.2
      inspection = false
      host.dataset.scene = ibadanChapters[index].id
      host.dataset.view = focus
      show()
    },
    setView(value: IbadanFocus) {
      if (focus === value) return
      focus = value
      host.dataset.view = value
      targetTurn = value === 'routes' ? -0.65 : value === 'people' ? 0.08 : -0.2
      reframe()
      wake()
    },
    setInspection(value: boolean) {
      inspection = value
      reframe()
      wake()
    },
    rotate(delta: number) {
      targetTurn += delta
      host.dataset.turned = String(targetTurn.toFixed(2))
      wake()
    },
    reset() {
      targetTurn = -0.2
      wake()
    },
    setReduced(value: boolean) {
      reduced = value
      if (value) {
        progress = cameraTravel = 1
        finish()
        turn = targetTurn
      }
      wake()
    },
    setPaused(value: boolean) {
      paused = value
      if (paused) {
        progress = cameraTravel = 1
        finish()
        turn = targetTurn
      }
      host.dataset.paused = String(paused)
      wake()
    },
    setVisible(value: boolean) {
      visible = value
      if (!value) cancelAnimationFrame(frame)
      else wake()
    },
    destroy() {
      disposed = true
      cancelAnimationFrame(frame)
      observer.disconnect()
      document.removeEventListener('visibilitychange', visibility)
      canvas.removeEventListener('pointerdown', down)
      canvas.removeEventListener('pointermove', move)
      canvas.removeEventListener('pointerup', up)
      canvas.removeEventListener('pointercancel', up)
      canvas.removeEventListener('lostpointercapture', up)
      canvas.removeEventListener('webglcontextlost', contextLost)
      scene.clear()
      library.dispose()
      renderer.dispose()
      renderer.forceContextLoss()
      canvas.remove()
    },
  }
}
export type IbadanScene = Awaited<ReturnType<typeof createIbadanScene>>
