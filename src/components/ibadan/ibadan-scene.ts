import * as THREE from 'three'
import { ibadanChapters, type IbadanFocus } from '@/data/ibadan'
import { buildIbadanWorld, type Point3 } from './world-geometry'

const vertex = `
attribute float aKind;
uniform float uPixelRatio;
uniform float uTime;
uniform float uFocus;
varying vec3 vColor;
varying float vAlpha;
void main(){
 vec4 mv=modelViewMatrix*vec4(position,1.);
 gl_Position=projectionMatrix*mv;
 gl_PointSize=clamp(uPixelRatio*(aKind==2.?2.3:2.35)*12./-mv.z,1.,5.5);
 vec3 earth=vec3(.67,.48,.30), cream=vec3(.95,.86,.69), blue=vec3(.39,.63,.68);
 vColor=aKind==2.?cream:(aKind==5.?blue:(aKind==4.?vec3(.88,.65,.35):earth));
 float focus=uFocus==0.?1.:(uFocus==1.?(aKind==2.?1.35:.30):(aKind>=4.?1.4:.36));
 float strength=aKind==0.?.20:(aKind==2.?.65:(aKind==4.?.65:.52));
 vAlpha=strength*focus*(.91+.09*sin(position.x*17.+position.z*11.+uTime*.4));
 vAlpha*=1.-smoothstep(18.,40.,-mv.z);
}`
const fragment = `
uniform float uOpacity;
varying vec3 vColor;
varying float vAlpha;
void main(){float d=length(gl_PointCoord-.5)*2.;if(d>1.)discard;gl_FragColor=vec4(vColor,exp(-d*d*4.)*vAlpha*uOpacity);}`

type Pose = { position: Point3; target: Point3 }
export function createIbadanScene(host: HTMLElement, onLost: () => void) {
  const mobile = host.clientWidth < 900,
    count = mobile ? 30000 : 68000
  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: false,
    powerPreference: 'high-performance',
  })
  renderer.setPixelRatio(Math.min(devicePixelRatio, mobile ? 1.5 : 1.75))
  renderer.setClearColor(0x090b0a, 0)
  const canvas = renderer.domElement
  canvas.className = 'ibadan-canvas'
  canvas.setAttribute('role', 'img')
  canvas.setAttribute(
    'aria-label',
    'Interpretive particle environment with composite human figures. Choose a viewpoint to explore people, places and consequences. Drag gently to look around.',
  )
  host.appendChild(canvas)
  host.dataset.scene = 'origins'
  host.dataset.view = 'place'
  const scene = new THREE.Scene(),
    camera = new THREE.PerspectiveCamera(46, 1, 0.1, 80)
  const makeLayer = () => {
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3))
    geometry.setAttribute('aKind', new THREE.BufferAttribute(new Float32Array(count), 1))
    const material = new THREE.ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: fragment,
      uniforms: {
        uPixelRatio: { value: renderer.getPixelRatio() },
        uOpacity: { value: 0 },
        uFocus: { value: 0 },
        uTime: { value: 0 },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
    const points = new THREE.Points(geometry, material)
    points.frustumCulled = false
    scene.add(points)
    return { geometry, material }
  }
  const layers = [makeLayer(), makeLayer()]
  let active = 0,
    chapter = 0,
    focus: IbadanFocus = 'place',
    entered = false,
    reduced = false,
    paused = false,
    disposed = false,
    lost = false,
    visible = true
  let frame = 0,
    previous = 0,
    elapsed = 0,
    travel = 1,
    fade = 1,
    oldOpacity = 1
  let dragging: { x: number; y: number } | null = null
  let lookX = 0,
    lookY = 0
  let start: Pose = { position: [0, 1.1, 8.5], target: [0, 0.8, 1] },
    destination: Pose = { ...start }
  const currentPosition = new THREE.Vector3(...start.position),
    currentTarget = new THREE.Vector3(...start.target)
  const cache = new Map<string, ReturnType<typeof buildIbadanWorld>>()
  const load = (index: number, layer: number) => {
    const form = ibadanChapters[index].form
    let world = cache.get(form)
    if (!world) {
      world = buildIbadanWorld(form, count)
      if (cache.size > 4) cache.delete(cache.keys().next().value!)
      cache.set(form, world)
    }
    const target = layers[layer].geometry
    ;(target.attributes.position.array as Float32Array).set(world.positions)
    ;(target.attributes.aKind.array as Float32Array).set(world.kinds)
    target.attributes.position.needsUpdate = true
    target.attributes.aKind.needsUpdate = true
  }
  load(0, active)
  layers[active].material.uniforms.uOpacity.value = 1
  const pose = (): Pose => {
    const narrow = host.clientWidth < 760 || host.clientHeight > host.clientWidth
    if (!entered) return { position: narrow ? [0, 2.0, 15.5] : [0, 1.1, 8.5], target: [0, 0.8, 1] }
    const form = ibadanChapters[chapter].form
    if (form === 'mbari') {
      if (focus === 'people')
        return { position: narrow ? [2, 3.8, 16] : [2.2, 2.7, 9.6], target: [0, 1, -1.5] }
      if (focus === 'routes')
        return { position: narrow ? [-2, 5, 18] : [-6, 3.6, 11], target: [0, 0.8, -0.5] }
      return { position: narrow ? [3.2, 5.4, 18.5] : [6.8, 5, 12.5], target: [1, 0.8, -0.5] }
    }
    if (form === 'market') {
      if (focus === 'people')
        return { position: narrow ? [1.8, 4.2, 17] : [5.7, 3.3, 10.3], target: [0.1, 1, 0.7] }
      if (focus === 'routes')
        return { position: narrow ? [-2.5, 6, 19] : [-7, 6.1, 12], target: [0, 0.6, -0.3] }
    }
    if (form === 'regional')
      return { position: narrow ? [1, 10, 19] : [7, 11, 13], target: [0, 0, -1] }
    if (focus === 'people')
      return { position: narrow ? [1.5, 4, 16.5] : [4.8, 3, 9.8], target: [0, 1, 1] }
    if (focus === 'routes')
      return { position: narrow ? [-2, 7, 19] : [-7.5, 7.2, 12.5], target: [0, 0.2, -0.8] }
    return {
      position: narrow ? [2.5, 5.6, 19.5] : [7.8, 5.3, 13],
      target: [0, form === 'tower' ? 2 : 0.8, -1],
    }
  }
  const transition = () => {
    start = {
      position: currentPosition.toArray() as Point3,
      target: currentTarget.toArray() as Point3,
    }
    destination = pose()
    travel = reduced ? 1 : 0
    host.dataset.moving = String(!reduced)
  }
  const render = () => renderer.render(scene, camera)
  const draw = (now: number) => {
    frame = 0
    if (disposed || lost || !visible) return
    const delta = previous ? Math.min((now - previous) / 1000, 0.05) : 0
    previous = now
    if (!paused && !reduced) elapsed += delta
    travel = Math.min(1, travel + delta / 2.4)
    fade = Math.min(1, fade + delta / 1.45)
    const t = travel * travel * (3 - 2 * travel)
    for (let i = 0; i < 3; i++) {
      currentPosition.setComponent(
        i,
        THREE.MathUtils.lerp(start.position[i], destination.position[i], t),
      )
      currentTarget.setComponent(i, THREE.MathUtils.lerp(start.target[i], destination.target[i], t))
    }
    camera.position.copy(currentPosition)
    camera.position.x += lookX
    camera.position.y += lookY
    camera.lookAt(currentTarget)
    const blend = fade * fade * (3 - 2 * fade)
    layers[active].material.uniforms.uOpacity.value = blend
    layers[1 - active].material.uniforms.uOpacity.value = oldOpacity * (1 - blend)
    for (const layer of layers) {
      layer.material.uniforms.uTime.value = elapsed
      layer.material.uniforms.uFocus.value = focus === 'people' ? 1 : focus === 'routes' ? 2 : 0
    }
    host.dataset.moving = String(travel < 1 || fade < 1)
    render()
    if (!document.hidden && ((!paused && !reduced) || travel < 1 || fade < 1))
      frame = requestAnimationFrame(draw)
  }
  const wake = () => {
    cancelAnimationFrame(frame)
    previous = 0
    if (!disposed && !lost && visible && !document.hidden) frame = requestAnimationFrame(draw)
  }
  const resize = () => {
    const { width, height } = host.getBoundingClientRect()
    if (!width || !height) return
    renderer.setSize(width, height)
    camera.aspect = width / height
    camera.setViewOffset(width, height, 0, height * (height > width ? 0.17 : 0.11), width, height)
    camera.updateProjectionMatrix()
    destination = pose()
    if (reduced || !entered) {
      currentPosition.set(...destination.position)
      currentTarget.set(...destination.target)
      start = destination
      travel = 1
    }
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
    lookX = THREE.MathUtils.clamp(lookX - (event.clientX - dragging.x) * 0.006, -1.4, 1.4)
    lookY = THREE.MathUtils.clamp(lookY + (event.clientY - dragging.y) * 0.004, -0.5, 0.7)
    dragging = { x: event.clientX, y: event.clientY }
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
      transition()
      wake()
    },
    setChapter(index: number) {
      if (index === chapter) {
        wake()
        return
      }
      chapter = index
      focus = 'place'
      lookX = 0
      lookY = 0
      oldOpacity = layers[active].material.uniforms.uOpacity.value
      active = 1 - active
      load(index, active)
      fade = reduced ? 1 : 0
      host.dataset.scene = ibadanChapters[index].id
      transition()
      wake()
    },
    setView(value: IbadanFocus) {
      if (focus === value && lookX === 0 && lookY === 0) return
      focus = value
      lookX = 0
      lookY = 0
      host.dataset.view = value
      transition()
      wake()
    },
    setReduced(value: boolean) {
      reduced = value
      if (value) {
        travel = 1
        fade = 1
        destination = pose()
        start = destination
      }
      wake()
    },
    setPaused(value: boolean) {
      paused = value
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
      for (const layer of layers) {
        layer.geometry.dispose()
        layer.material.dispose()
      }
      cache.clear()
      renderer.dispose()
      renderer.forceContextLoss()
      canvas.remove()
    },
  }
}
export type IbadanScene = ReturnType<typeof createIbadanScene>
