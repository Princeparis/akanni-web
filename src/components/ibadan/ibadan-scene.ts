import * as THREE from 'three'
import { ibadanChapters } from '@/data/ibadan'
import { particleForm } from './particle-forms'

const vertex = `
attribute vec3 aTarget;
attribute vec3 aSeed;
uniform float uMorph;
uniform float uTime;
uniform float uScatter;
uniform float uImpulse;
uniform float uPixelRatio;
varying float vLight;
varying float vHeight;
void main() {
  float t = smoothstep(0., 1., uMorph);
  vec3 p = mix(position, aTarget, t);
  float wave = sin(t * 3.14159265);
  vec3 drift = vec3(sin(aSeed.x*18.), cos(aSeed.y*19.), sin(aSeed.z*23.));
  p += drift * (wave * 2.3 + uScatter * (2. + aSeed.y*3.));
  p += drift * sin(uTime*.65 + aSeed.x*6.) * .026;
  p += normalize(p + .01) * uImpulse * sin(length(p)*2. - uTime*4.) * .2;
  vec4 mv = modelViewMatrix * vec4(p, 1.);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = clamp((1.8 + aSeed.z*2.8) * uPixelRatio * 11. / -mv.z, 1., 7.);
  vLight = .4 + aSeed.x*.6;
  vHeight = clamp((p.y+3.)/6., 0., 1.);
}`
const fragment = `
uniform vec3 uColor;
varying float vLight;
varying float vHeight;
void main() {
  float d = length(gl_PointCoord - .5)*2.;
  if (d > 1.) discard;
  float core = exp(-d*d*5.);
  vec3 color = mix(uColor*.65, vec3(1.,.94,.82), vHeight*.55);
  gl_FragColor = vec4(color, core * vLight * .86);
}`

export function createIbadanScene(host: HTMLElement, onLost: () => void) {
  const mobile = host.clientWidth < 1000
  const count = mobile ? 15000 : 34000
  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: false,
    powerPreference: 'high-performance',
  })
  const pixelRatio = Math.min(devicePixelRatio, mobile ? 1.5 : 1.75)
  renderer.setPixelRatio(pixelRatio)
  renderer.setClearColor(0x090b0c, 0)
  const canvas = renderer.domElement
  canvas.className = 'ibadan-canvas'
  canvas.setAttribute(
    'aria-label',
    'Particle sculpture. Drag to rotate; hold still to disperse; release to reform. Use the inspect and release controls for keyboard interaction.',
  )
  canvas.setAttribute('role', 'img')
  host.appendChild(canvas)
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(43, 1, 0.1, 100)
  const group = new THREE.Group()
  scene.add(group)
  const forms = ibadanChapters.map((chapter) => particleForm(chapter.form, count))
  const from = forms[2].slice()
  const target = forms[2].slice()
  const seeds = new Float32Array(count * 3)
  for (let i = 0; i < seeds.length; i++) seeds[i] = ((i * 16807 + 97) % 65521) / 65521
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(from, 3))
  geometry.setAttribute('aTarget', new THREE.BufferAttribute(target, 3))
  geometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 3))
  const uniforms = {
    uMorph: { value: 1 },
    uTime: { value: 0 },
    uScatter: { value: 0 },
    uImpulse: { value: 0 },
    uPixelRatio: { value: pixelRatio },
    uColor: { value: new THREE.Color('#e7bc87') },
  }
  const material = new THREE.ShaderMaterial({
    vertexShader: vertex,
    fragmentShader: fragment,
    uniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  })
  const sculpture = new THREE.Points(geometry, material)
  sculpture.frustumCulled = false
  group.add(sculpture)
  const orbitGeometry = new THREE.BufferGeometry().setFromPoints(
    Array.from({ length: 240 }, (_, i) => {
      const angle = (i / 240) * Math.PI * 2
      return new THREE.Vector3(Math.cos(angle) * 4.4, 0, Math.sin(angle) * 4.4)
    }),
  )
  const orbitMaterial = new THREE.LineBasicMaterial({
    color: '#c7a97f',
    transparent: true,
    opacity: 0.16,
  })
  const orbit = new THREE.LineLoop(orbitGeometry, orbitMaterial)
  orbit.rotation.set(0.4, 0, 0.2)
  group.add(orbit)

  const starsGeometry = new THREE.BufferGeometry()
  const stars = new Float32Array(900 * 3)
  for (let i = 0; i < stars.length; i++) stars[i] = Math.sin(i * 127.1) * (i % 3 === 2 ? 10 : 20)
  starsGeometry.setAttribute('position', new THREE.BufferAttribute(stars, 3))
  const starsMaterial = new THREE.PointsMaterial({
    color: '#b0a48f',
    size: 0.018,
    transparent: true,
    opacity: 0.36,
    depthWrite: false,
  })
  scene.add(new THREE.Points(starsGeometry, starsMaterial))

  let frame = 0,
    disposed = false,
    reduced = false,
    paused = false,
    previous = 0
  let scatter = false,
    inspect = false,
    chapter = 2,
    intro = true
  let yaw = -0.24,
    pitch = 0.08,
    targetYaw = yaw,
    targetPitch = pitch
  let elapsed = 0,
    impulse = 0
  let contextLost = false
  let drag: { x: number; y: number; moved: boolean } | null = null
  let hold: ReturnType<typeof setTimeout> | undefined
  const color = new THREE.Color('#e7bc87')
  const render = () => renderer.render(scene, camera)
  const position = () => {
    const narrow =
      host.clientWidth < 760 || (host.clientWidth < 1000 && host.clientHeight > host.clientWidth)
    camera.position.set(0, 0, narrow ? 24 : 12.4)
    group.position.x = narrow || inspect ? 0 : 2.15
    group.position.y = narrow && !inspect ? (host.clientHeight < 650 ? 5 : 3.5) : 0.1
    group.scale.setScalar(inspect ? (narrow ? 1.12 : 1.15) : 1)
  }
  const draw = (now: number) => {
    frame = 0
    if (disposed || contextLost) return
    const delta = previous ? Math.min((now - previous) / 1000, 0.05) : 0
    previous = now
    const moving = !reduced && !paused
    if (moving) elapsed += delta
    if (uniforms.uMorph.value < 1)
      uniforms.uMorph.value = Math.min(1, uniforms.uMorph.value + delta / 1.65)
    const blend = reduced ? 1 : 1 - Math.exp(-delta * 5)
    uniforms.uScatter.value += ((scatter ? 1 : 0) - uniforms.uScatter.value) * blend
    impulse *= Math.exp(-delta * 2.8)
    uniforms.uImpulse.value = reduced ? 0 : impulse
    uniforms.uTime.value = elapsed
    uniforms.uColor.value.lerp(color, blend)
    yaw += (targetYaw - yaw) * blend
    pitch += (targetPitch - pitch) * blend
    group.rotation.y = yaw + (moving ? Math.sin(elapsed * 0.1) * 0.14 : 0)
    group.rotation.x = pitch
    orbit.rotation.y = elapsed * 0.025
    position()
    render()
    if (
      !document.hidden &&
      ((!reduced && !paused) ||
        uniforms.uMorph.value < 1 ||
        Math.abs(uniforms.uScatter.value - Number(scatter)) > 0.001)
    )
      frame = requestAnimationFrame(draw)
  }
  const wake = () => {
    cancelAnimationFrame(frame)
    previous = 0
    if (!disposed && !contextLost && !document.hidden) frame = requestAnimationFrame(draw)
  }
  const resize = () => {
    const { width, height } = host.getBoundingClientRect()
    if (!width || !height) return
    renderer.setSize(width, height)
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    position()
    wake()
  }
  const observer = new ResizeObserver(resize)
  observer.observe(host)
  const down = (event: PointerEvent) => {
    if (event.button !== 0) return
    canvas.setPointerCapture(event.pointerId)
    drag = { x: event.clientX, y: event.clientY, moved: false }
    impulse = 1
    if (!reduced)
      hold = setTimeout(() => {
        scatter = true
        wake()
      }, 320)
    wake()
  }
  const move = (event: PointerEvent) => {
    if (!drag) return
    const dx = event.clientX - drag.x,
      dy = event.clientY - drag.y
    if (Math.abs(dx) + Math.abs(dy) > 3) {
      drag.moved = true
      clearTimeout(hold)
      targetYaw += dx * 0.007
      targetPitch = THREE.MathUtils.clamp(targetPitch + dy * 0.004, -0.8, 0.8)
      if (reduced || paused) {
        yaw = targetYaw
        pitch = targetPitch
      }
      drag.x = event.clientX
      drag.y = event.clientY
      wake()
    }
  }
  const up = () => {
    clearTimeout(hold)
    drag = null
    scatter = false
    wake()
  }
  const lost = (event: Event) => {
    event.preventDefault()
    contextLost = true
    cancelAnimationFrame(frame)
    onLost()
  }
  const visibility = () => {
    if (document.hidden) {
      up()
      cancelAnimationFrame(frame)
    } else wake()
  }
  canvas.addEventListener('pointerdown', down)
  canvas.addEventListener('pointermove', move)
  canvas.addEventListener('pointerup', up)
  canvas.addEventListener('pointercancel', up)
  canvas.addEventListener('lostpointercapture', up)
  canvas.addEventListener('webglcontextlost', lost)
  document.addEventListener('visibilitychange', visibility)
  resize()

  return {
    setChapter(index: number) {
      chapter = index
      intro = false
      const t = THREE.MathUtils.smoothstep(uniforms.uMorph.value, 0, 1)
      const wave = Math.sin(t * Math.PI) * 2.3
      for (let i = 0; i < from.length; i++) {
        const axis = i % 3
        const drift =
          axis === 1 ? Math.cos(seeds[i] * 19) : Math.sin(seeds[i] * (axis === 0 ? 18 : 23))
        from[i] = from[i] * (1 - t) + target[i] * t + drift * wave
      }
      target.set(forms[index])
      geometry.attributes.position.needsUpdate = true
      geometry.attributes.aTarget.needsUpdate = true
      uniforms.uMorph.value = reduced ? 1 : 0
      color.set(ibadanChapters[index].accent)
      targetPitch = ['hills', 'gathering', 'city', 'book', 'calabash'].includes(
        ibadanChapters[index].form,
      )
        ? 0.37
        : 0.08
      targetYaw = -0.24
      wake()
    },
    setReduced(value: boolean) {
      reduced = value
      if (value) {
        uniforms.uMorph.value = 1
        scatter = false
        uniforms.uScatter.value = 0
      }
      wake()
    },
    setPaused(value: boolean) {
      paused = value
      wake()
    },
    setInspect(value: boolean) {
      inspect = value
      wake()
    },
    release(value: boolean) {
      scatter = value
      if (reduced) uniforms.uScatter.value = value ? 0.5 : 0
      wake()
    },
    rotate(direction: number) {
      targetYaw += direction * 0.35
      yaw = targetYaw
      wake()
    },
    reset() {
      targetYaw = -0.24
      targetPitch = intro || chapter === 2 ? 0.08 : 0.37
      yaw = targetYaw
      pitch = targetPitch
      wake()
    },
    destroy() {
      disposed = true
      cancelAnimationFrame(frame)
      clearTimeout(hold)
      observer.disconnect()
      canvas.removeEventListener('pointerdown', down)
      canvas.removeEventListener('pointermove', move)
      canvas.removeEventListener('pointerup', up)
      canvas.removeEventListener('pointercancel', up)
      canvas.removeEventListener('lostpointercapture', up)
      canvas.removeEventListener('webglcontextlost', lost)
      document.removeEventListener('visibilitychange', visibility)
      geometry.dispose()
      material.dispose()
      orbitGeometry.dispose()
      orbitMaterial.dispose()
      starsGeometry.dispose()
      starsMaterial.dispose()
      renderer.dispose()
      renderer.forceContextLoss()
      canvas.remove()
    },
  }
}
export type IbadanScene = ReturnType<typeof createIbadanScene>
