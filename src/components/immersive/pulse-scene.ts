import * as THREE from 'three'
import gsap from 'gsap'

export function createPulseScene(host: HTMLElement) {
  const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true })
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75))
  const canvas = renderer.domElement
  canvas.setAttribute('aria-hidden', 'true')
  host.appendChild(canvas)
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 30)
  camera.position.z = 7.7
  const count = innerWidth < 600 ? 11000 : 22000
  const positions = new Float32Array(count * 3)
  const spheres = new Float32Array(count * 3)
  const waves = new Float32Array(count * 3)
  const seeds = new Float32Array(count)
  const colors = new Float32Array(count * 3)
  const color = new THREE.Color()
  for (let i = 0; i < count; i++) {
    const u = (i / count) * Math.PI * 2 * 71
    const v = i * 2.399963229728653
    const thickness = 0.44 + 0.1 * Math.sin(i * 17.831)
    const orbit = 1.3 + 0.22 * Math.cos(u * 3)
    positions[i * 3] = (orbit + thickness * Math.cos(v)) * Math.cos(u)
    positions[i * 3 + 1] = (orbit + thickness * Math.cos(v)) * Math.sin(u)
    positions[i * 3 + 2] = thickness * Math.sin(v) + 0.38 * Math.sin(u * 3)
    const y = 1 - (2 * i) / count
    const r = Math.sqrt(1 - y * y)
    spheres.set([r * Math.cos(v) * 1.75, y * 1.75, r * Math.sin(v) * 1.75], i * 3)
    const x = ((i % 180) / 179) * 5.2 - 2.6
    const z = (Math.floor(i / 180) / Math.ceil(count / 180)) * 3.2 - 1.6
    waves.set([x, Math.sin(x * 2 + z * 2) * 0.6, z], i * 3)
    seeds[i] = ((i * 127.1) % 100) / 100
    color.set(i % 13 < 3 ? '#f1ffe2' : i % 11 === 0 ? '#e3a34d' : '#bff868')
    colors.set([color.r, color.g, color.b], i * 3)
  }
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('aSphere', new THREE.BufferAttribute(spheres, 3))
  geometry.setAttribute('aWave', new THREE.BufferAttribute(waves, 3))
  geometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1))
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  const uniforms = {
    uTime: { value: 0 },
    uMotion: { value: 0 },
    uShape: { value: 0 },
    uKick: { value: 0 },
    uSnare: { value: 0 },
    uHat: { value: 0 },
    uTone: { value: 0 },
    uScatter: { value: 0 },
    uDpr: { value: Math.min(devicePixelRatio, 1.75) },
    uPointer: { value: new THREE.Vector2(20, 20) },
  }
  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexColors: true,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: `
      attribute vec3 aSphere;
      attribute vec3 aWave;
      attribute float aSeed;
      uniform float uTime, uMotion, uShape, uKick, uSnare, uHat, uTone, uScatter, uDpr;
      uniform vec2 uPointer;
      varying vec3 vColor;
      varying float vAlpha;
      void main() {
        vec3 p = mix(position, aSphere, clamp(uShape, 0., 1.));
        p = mix(p, aWave, clamp(uShape - 1., 0., 1.));
        float time = uTime * .35;
        float wave = sin(p.x * 3. + time * 2.) * cos(p.y * 3. - time);
        p += normalize(p + vec3(.001)) * (wave * .1 * uMotion + uKick * .32);
        float twist = uTone * .5 + sin(time) * .12 * uMotion;
        mat2 turn = mat2(cos(twist * p.y), -sin(twist * p.y), sin(twist * p.y), cos(twist * p.y));
        p.xz = turn * p.xz;
        p += vec3(sin(aSeed * 80.), cos(aSeed * 91.), sin(aSeed * 72.)) * (uSnare * .24 + uScatter * 2.8);
        vec2 difference = p.xy - uPointer * vec2(3.5, 2.4);
        p.xy += normalize(difference + .001) * exp(-dot(difference, difference) * 2.) * .5;
        vec4 mv = modelViewMatrix * vec4(p, 1.);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = clamp((1.8 + aSeed * 1.4 + uHat * 1.8) * uDpr * (5. / -mv.z), 1., 9.);
        vColor = color * (1. + uHat * .7);
        vAlpha = .35 + .65 * smoothstep(-2., 2., p.z);
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      varying float vAlpha;
      void main() {
        float d = length(gl_PointCoord - .5);
        if (d > .5) discard;
        float alpha = smoothstep(.5, .1, d) * vAlpha;
        gl_FragColor = vec4(vColor, alpha);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `,
  })
  const points = new THREE.Points(geometry, material)
  points.rotation.set(0.6, 0.12, -0.18)
  scene.add(points)
  let frame = 0,
    previous = 0,
    elapsed = 0,
    reduced = true,
    visible = true,
    disposed = false
  const render = () => renderer.render(scene, camera)
  const draw = (now: number) => {
    frame = 0
    if (disposed) return
    const delta = previous ? Math.min((now - previous) / 1000, 0.05) : 0
    previous = now
    if (!reduced) {
      elapsed += delta
      uniforms.uTime.value = elapsed
      points.rotation.y += delta * 0.09
    }
    render()
    if (!reduced && visible && !document.hidden) frame = requestAnimationFrame(draw)
  }
  const wake = () => {
    cancelAnimationFrame(frame)
    previous = 0
    frame = 0
    if (!disposed && visible && !document.hidden) frame = requestAnimationFrame(draw)
  }
  const resize = () => {
    const { width, height } = host.getBoundingClientRect()
    if (!width || !height) return
    renderer.setSize(width, height)
    camera.aspect = width / height
    camera.position.z = width < 500 ? 8.7 : 7.7
    camera.updateProjectionMatrix()
    wake()
  }
  const resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(host)
  const intersection = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting
    wake()
  })
  intersection.observe(host)
  document.addEventListener('visibilitychange', wake)
  const move = (event: PointerEvent) => {
    if (reduced || event.pointerType === 'touch') return
    const rect = host.getBoundingClientRect()
    uniforms.uPointer.value.set(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      1 - ((event.clientY - rect.top) / rect.height) * 2,
    )
  }
  const leave = () => uniforms.uPointer.value.set(20, 20)
  const scatter = () => {
    if (reduced) return
    gsap.fromTo(
      uniforms.uScatter,
      { value: 1 },
      { value: 0, duration: 1.6, ease: 'power3.out', overwrite: true },
    )
  }
  host.addEventListener('pointermove', move)
  host.addEventListener('pointerleave', leave)
  host.addEventListener('click', scatter)
  resize()
  return {
    pulse(hits: boolean[]) {
      if (reduced) return
      const values = [uniforms.uKick, uniforms.uSnare, uniforms.uHat, uniforms.uTone]
      hits.forEach((hit, i) => {
        if (hit)
          gsap.fromTo(
            values[i],
            { value: 1 },
            {
              value: 0,
              duration: i === 3 ? 0.65 : i === 2 ? 0.1 : 0.3,
              ease: 'power2.out',
              overwrite: true,
            },
          )
      })
    },
    setShape(value: number) {
      gsap.to(uniforms.uShape, {
        value,
        duration: reduced ? 0 : 1.8,
        ease: 'power3.inOut',
        overwrite: true,
        onUpdate: reduced ? render : undefined,
      })
      wake()
    },
    setReduced(value: boolean) {
      reduced = value
      uniforms.uMotion.value = value ? 0 : 1
      if (value) {
        Object.values(uniforms).forEach((uniform) => gsap.killTweensOf(uniform))
        uniforms.uKick.value =
          uniforms.uSnare.value =
          uniforms.uHat.value =
          uniforms.uTone.value =
          uniforms.uScatter.value =
            0
        leave()
      }
      wake()
    },
    scatter,
    destroy() {
      disposed = true
      cancelAnimationFrame(frame)
      resizeObserver.disconnect()
      intersection.disconnect()
      document.removeEventListener('visibilitychange', wake)
      host.removeEventListener('pointermove', move)
      host.removeEventListener('pointerleave', leave)
      host.removeEventListener('click', scatter)
      Object.values(uniforms).forEach((uniform) => gsap.killTweensOf(uniform))
      geometry.dispose()
      material.dispose()
      renderer.dispose()
      canvas.remove()
    },
  }
}
export type PulseScene = ReturnType<typeof createPulseScene>
