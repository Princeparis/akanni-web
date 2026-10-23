import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import gsap from 'gsap'

export type MatterForm = 'Knot' | 'Bloom' | 'Orbit'
export type MatterFinish = 'Chrome' | 'Terracotta' | 'Porcelain'
export const finishes = {
  Chrome: { color: '#bdc6cb', metalness: 1, roughness: 0.18 },
  Terracotta: { color: '#bc633e', metalness: 0.05, roughness: 0.65 },
  Porcelain: { color: '#eee8d9', metalness: 0.18, roughness: 0.24 },
} as const

function bloomGeometry() {
  const geometry = new THREE.SphereGeometry(1.55, 160, 100)
  const positions = geometry.attributes.position
  const vector = new THREE.Vector3()
  for (let i = 0; i < positions.count; i++) {
    vector.fromBufferAttribute(positions, i)
    const theta = Math.atan2(vector.z, vector.x)
    const phi = Math.acos(Math.max(-1, Math.min(1, vector.y / 1.55)))
    const radius = 1 + 0.2 * Math.cos(theta * 10 + phi * 3) * Math.pow(Math.sin(phi), 0.8)
    vector.multiplyScalar(radius)
    positions.setXYZ(i, vector.x, vector.y, vector.z)
  }
  geometry.computeVertexNormals()
  return geometry
}

export function createMatterScene(host: HTMLElement, onLost: () => void) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true })
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75))
  renderer.setClearColor('#e9e7e1')
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.05
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  const canvas = renderer.domElement
  canvas.className = 'matter-canvas'
  canvas.setAttribute(
    'aria-label',
    'Interactive 3D sculpture. Drag to rotate. Arrow keys rotate, plus and minus zoom, zero resets.',
  )
  canvas.setAttribute('role', 'img')
  canvas.tabIndex = 0
  host.appendChild(canvas)

  const scene = new THREE.Scene()
  scene.fog = new THREE.Fog('#e9e7e1', 16, 28)
  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 50)
  const initial = new THREE.Vector3(5.5, 2.6, 7.4)
  camera.position.copy(initial)
  const controls = new OrbitControls(camera, canvas)
  controls.enableDamping = true
  controls.dampingFactor = 0.09
  controls.minDistance = 5.2
  controls.maxDistance = 15
  controls.maxPolarAngle = Math.PI * 0.82
  controls.enablePan = false
  controls.target.set(0, 0.15, 0)

  const pmrem = new THREE.PMREMGenerator(renderer)
  const room = new RoomEnvironment()
  const environment = pmrem.fromScene(room, 0.04)
  scene.environment = environment.texture
  room.dispose()
  pmrem.dispose()

  const lights = new THREE.Group()
  const key = new THREE.DirectionalLight('#fff6ea', 4)
  key.position.set(4, 7, 5)
  key.castShadow = true
  key.shadow.mapSize.set(1024, 1024)
  key.shadow.camera.left = -5
  key.shadow.camera.right = 5
  key.shadow.camera.top = 5
  key.shadow.camera.bottom = -5
  key.shadow.normalBias = 0.03
  key.shadow.bias = -0.0001
  key.shadow.radius = 5
  lights.add(key)
  const rim = new THREE.DirectionalLight('#c9d7ff', 2)
  rim.position.set(-4, 2, -3)
  lights.add(rim)
  scene.add(lights, new THREE.AmbientLight('#ffffff', 0.3))

  const groundGeometry = new THREE.PlaneGeometry(200, 200)
  const groundMaterial = new THREE.ShadowMaterial({ opacity: 0.13 })
  const ground = new THREE.Mesh(groundGeometry, groundMaterial)
  ground.rotation.x = -Math.PI / 2
  ground.position.y = -2.3
  ground.receiveShadow = true
  scene.add(ground)

  const material = new THREE.MeshPhysicalMaterial({
    ...finishes.Chrome,
    clearcoat: 0.8,
    clearcoatRoughness: 0.15,
    envMapIntensity: 1.8,
  })
  const pivot = new THREE.Group()
  const sculpture = new THREE.Group()
  pivot.add(sculpture)
  scene.add(pivot)
  pivot.rotation.set(0.12, -0.2, -0.18)

  let form: MatterForm = 'Knot'
  let reduced = true
  let spinning = true
  let visible = true
  let disposed = false
  let frame = 0
  let previous = 0
  const geometries: THREE.BufferGeometry[] = []
  const add = (geometry: THREE.BufferGeometry) => {
    geometries.push(geometry)
    const mesh = new THREE.Mesh(geometry, material)
    mesh.castShadow = true
    sculpture.add(mesh)
    return mesh
  }
  const build = () => {
    sculpture.clear()
    geometries.splice(0).forEach((geometry) => geometry.dispose())
    if (form === 'Knot') add(new THREE.TorusKnotGeometry(1.25, 0.43, 240, 40, 2, 3))
    if (form === 'Bloom') add(bloomGeometry())
    if (form === 'Orbit') {
      for (let i = 0; i < 6; i++) {
        const ring = add(new THREE.TorusGeometry(1.5, 0.105, 16, 160))
        ring.rotation.set(Math.PI / 2 + i * 0.32, (i * Math.PI) / 6, 0)
      }
      add(new THREE.SphereGeometry(0.55, 48, 32))
    }
  }
  build()

  const render = () => renderer.render(scene, camera)
  const draw = (now: number) => {
    frame = 0
    if (disposed) return
    const delta = previous ? Math.min((now - previous) / 1000, 0.05) : 0
    previous = now
    if (!reduced && spinning) pivot.rotation.y += delta * 0.18
    controls.update()
    render()
    if (!reduced && visible && !document.hidden) frame = requestAnimationFrame(draw)
  }
  const wake = () => {
    cancelAnimationFrame(frame)
    frame = 0
    previous = 0
    if (visible && !document.hidden && !disposed) frame = requestAnimationFrame(draw)
  }
  const resize = () => {
    const { width, height } = host.getBoundingClientRect()
    if (!width || !height) return
    renderer.setSize(width, height)
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    wake()
  }
  const observer = new ResizeObserver(resize)
  observer.observe(host)
  const intersection = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting
    wake()
  })
  intersection.observe(host)
  const keydown = (event: KeyboardEvent) => {
    if (
      !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', '+', '=', '-', '0'].includes(event.key)
    )
      return
    event.preventDefault()
    if (event.key === 'ArrowLeft') pivot.rotation.y -= 0.18
    if (event.key === 'ArrowRight') pivot.rotation.y += 0.18
    if (event.key === 'ArrowUp') pivot.rotation.x -= 0.18
    if (event.key === 'ArrowDown') pivot.rotation.x += 0.18
    if (event.key === '+' || event.key === '=') camera.position.multiplyScalar(0.93)
    if (event.key === '-') camera.position.multiplyScalar(1.07)
    if (event.key === '0') resetView()
    controls.update()
    wake()
  }
  const resetView = () => {
    gsap.killTweensOf(camera.position)
    gsap.to(camera.position, { ...initial, duration: reduced ? 0 : 1.2, ease: 'power3.inOut' })
    gsap.to(pivot.rotation, {
      x: 0.12,
      y: -0.2,
      z: -0.18,
      duration: reduced ? 0 : 1,
      overwrite: true,
    })
    wake()
  }
  const lost = (event: Event) => {
    event.preventDefault()
    onLost()
  }
  canvas.addEventListener('keydown', keydown)
  canvas.addEventListener('webglcontextlost', lost)
  controls.addEventListener('start', () => gsap.killTweensOf(camera.position))
  controls.addEventListener('change', () => {
    if (reduced) render()
  })
  document.addEventListener('visibilitychange', wake)
  resize()

  return {
    setForm(value: MatterForm) {
      if (value === form) return
      form = value
      gsap.killTweensOf(sculpture.scale)
      if (reduced) {
        build()
        sculpture.scale.setScalar(1)
        wake()
        return
      }
      gsap.to(sculpture.scale, {
        x: 0.04,
        y: 0.04,
        z: 0.04,
        duration: 0.24,
        ease: 'power2.in',
        onComplete: () => {
          build()
          gsap.to(sculpture.scale, {
            x: 1,
            y: 1,
            z: 1,
            duration: 1.1,
            ease: 'elastic.out(1, 0.65)',
          })
        },
      })
    },
    setFinish(value: MatterFinish) {
      const next = finishes[value]
      const color = new THREE.Color(next.color)
      gsap.to(material.color, {
        r: color.r,
        g: color.g,
        b: color.b,
        duration: reduced ? 0 : 0.8,
        overwrite: true,
      })
      gsap.to(material, {
        metalness: next.metalness,
        clearcoat: value === 'Terracotta' ? 0.1 : 0.8,
        duration: reduced ? 0 : 0.8,
        overwrite: 'auto',
      })
      wake()
    },
    setRoughness(value: number) {
      gsap.to(material, { roughness: value, duration: reduced ? 0 : 0.3, overwrite: 'auto' })
      wake()
    },
    setLight(value: number) {
      gsap.to(lights.rotation, {
        y: (value * Math.PI) / 180,
        duration: reduced ? 0 : 0.45,
        overwrite: true,
      })
      // Rotating the studio reflections makes a polished surface respond as well as the lights.
      scene.environmentRotation.y = (value * Math.PI) / 180
      wake()
    },
    setSpinning(value: boolean) {
      spinning = value
    },
    setReduced(value: boolean) {
      reduced = value
      controls.enableDamping = !value
      if (value) {
        gsap.killTweensOf(sculpture.scale)
        sculpture.scale.setScalar(1)
        build()
        ;[camera.position, pivot.rotation, material, material.color, lights.rotation].forEach(
          (target) =>
            gsap.getTweensOf(target).forEach((tween) => {
              tween.progress(1)
              tween.kill()
            }),
        )
      }
      wake()
    },
    view(value: 'Perspective' | 'Front' | 'Above') {
      const position =
        value === 'Front'
          ? { x: 0, y: 0.4, z: 9.3 }
          : value === 'Above'
            ? { x: 0.1, y: 9.3, z: 0.6 }
            : { ...initial }
      gsap.to(camera.position, {
        ...position,
        duration: reduced ? 0 : 1.3,
        ease: 'power3.inOut',
        overwrite: true,
      })
      wake()
    },
    zoom(direction: number) {
      camera.position.multiplyScalar(direction > 0 ? 0.9 : 1.1)
      controls.update()
      wake()
    },
    resetView,
    async capture() {
      // Render explicitly so the download is the current view, even in a paused tab.
      render()
      return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'))
    },
    destroy() {
      disposed = true
      cancelAnimationFrame(frame)
      observer.disconnect()
      intersection.disconnect()
      document.removeEventListener('visibilitychange', wake)
      canvas.removeEventListener('keydown', keydown)
      canvas.removeEventListener('webglcontextlost', lost)
      controls.dispose()
      ;[
        sculpture.scale,
        pivot.rotation,
        camera.position,
        material,
        material.color,
        lights.rotation,
      ].forEach((target) => gsap.killTweensOf(target))
      geometries.forEach((geometry) => geometry.dispose())
      material.dispose()
      groundGeometry.dispose()
      groundMaterial.dispose()
      environment.dispose()
      key.shadow.dispose()
      renderer.dispose()
      canvas.remove()
    },
  }
}
export type MatterScene = ReturnType<typeof createMatterScene>
