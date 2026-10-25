import * as THREE from 'three'

/** Sample triangle area, not vertex count: dense topology must not distort a face. */
export function sampleModelSurface(root: THREE.Object3D, count: number, seed = 1829) {
  const surfaces: {
    geometry: THREE.BufferGeometry
    matrix: THREE.Matrix4
    normalMatrix: THREE.Matrix3
    distribution: Float64Array
    total: number
    end: number
    color: THREE.Color
  }[] = []
  root.updateMatrixWorld(true)
  const a = new THREE.Vector3(),
    b = new THREE.Vector3(),
    c = new THREE.Vector3()
  const ab = new THREE.Vector3(),
    ac = new THREE.Vector3()
  let total = 0
  root.traverse((node) => {
    if (!(node instanceof THREE.Mesh) || node.userData.presentation) return
    const geometry = node.geometry as THREE.BufferGeometry
    const position = geometry.getAttribute('position')
    if (!position) return
    if (!geometry.getAttribute('normal')) geometry.computeVertexNormals()
    const index = geometry.index
    const triangles = Math.floor((index ? index.count : position.count) / 3)
    const distribution = new Float64Array(triangles)
    let area = 0
    for (let i = 0; i < triangles; i++) {
      a.fromBufferAttribute(position, index ? index.getX(i * 3) : i * 3).applyMatrix4(
        node.matrixWorld,
      )
      b.fromBufferAttribute(position, index ? index.getX(i * 3 + 1) : i * 3 + 1).applyMatrix4(
        node.matrixWorld,
      )
      c.fromBufferAttribute(position, index ? index.getX(i * 3 + 2) : i * 3 + 2).applyMatrix4(
        node.matrixWorld,
      )
      area += ab.subVectors(b, a).cross(ac.subVectors(c, a)).length() * 0.5
      distribution[i] = area
    }
    if (!area) return
    // Facial topology receives a larger share without flattening its actual shape.
    const weight = node.userData.portrait ? 2.4 : 1
    total += area * weight
    const material = (
      Array.isArray(node.material) ? node.material[0] : node.material
    ) as THREE.MeshStandardMaterial
    const color = new THREE.Color(
      node.userData.portrait ? '#eee0c4' : material.userData.particleColor || '#c4b593',
    )
    surfaces.push({
      geometry,
      matrix: node.matrixWorld.clone(),
      normalMatrix: new THREE.Matrix3().getNormalMatrix(node.matrixWorld),
      distribution,
      total: area,
      end: total,
      color,
    })
  })
  if (!surfaces.length) throw new Error('The model contains no sampleable surface')
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0
    return seed / 4294967296
  }
  const search = (values: ArrayLike<number>, target: number) => {
    let low = 0,
      high = values.length - 1
    while (low < high) {
      const mid = (low + high) >>> 1
      if (target < values[mid]) high = mid
      else low = mid + 1
    }
    return low
  }
  const ends = surfaces.map((surface) => surface.end)
  const positions = new Float32Array(count * 3),
    normals = new Float32Array(count * 3),
    colors = new Float32Array(count * 3),
    sizes = new Float32Array(count)
  const na = new THREE.Vector3(),
    nb = new THREE.Vector3(),
    nc = new THREE.Vector3(),
    p = new THREE.Vector3(),
    n = new THREE.Vector3()
  for (let i = 0; i < count; i++) {
    const surface = surfaces[search(ends, random() * total)]
    const triangle = search(surface.distribution, random() * surface.total)
    const geometry = surface.geometry,
      index = geometry.index,
      position = geometry.getAttribute('position'),
      normal = geometry.getAttribute('normal')
    const ia = index ? index.getX(triangle * 3) : triangle * 3,
      ib = index ? index.getX(triangle * 3 + 1) : triangle * 3 + 1,
      ic = index ? index.getX(triangle * 3 + 2) : triangle * 3 + 2
    const r = Math.sqrt(random()),
      u = 1 - r,
      v = random() * r,
      w = r - v
    a.fromBufferAttribute(position, ia)
    b.fromBufferAttribute(position, ib)
    c.fromBufferAttribute(position, ic)
    p.copy(a)
      .multiplyScalar(u)
      .addScaledVector(b, v)
      .addScaledVector(c, w)
      .applyMatrix4(surface.matrix)
    na.fromBufferAttribute(normal, ia)
    nb.fromBufferAttribute(normal, ib)
    nc.fromBufferAttribute(normal, ic)
    n.copy(na)
      .multiplyScalar(u)
      .addScaledVector(nb, v)
      .addScaledVector(nc, w)
      .applyMatrix3(surface.normalMatrix)
      .normalize()
    p.toArray(positions, i * 3)
    n.toArray(normals, i * 3)
    const variation = 0.85 + random() * 0.25
    colors[i * 3] = surface.color.r * variation
    colors[i * 3 + 1] = surface.color.g * variation
    colors[i * 3 + 2] = surface.color.b * variation
    sizes[i] = 0.8 + random() * 0.5
  }
  return { positions, normals, colors, sizes }
}

const vertexShader = `
attribute vec3 aNormal;
attribute float aSize;
uniform float uPixelRatio;
uniform float uHeight;
varying vec3 vColor;
varying float vAlpha;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vec3 n = normalize(normalMatrix * aNormal);
  float facing = dot(n, normalize(-mv.xyz));
  vec3 key = normalize(vec3(-.9, .6, .55));
  float light = max(dot(n, key), 0.);
  float specular = pow(max(dot(n, normalize(key + normalize(-mv.xyz))), 0.), 12.) * .22;
  float rim = pow(1. - abs(facing), 2.) * .10;
  vColor = color * (.075 + 1.12 * pow(light, 1.3) + specular + rim);
  vAlpha = smoothstep(-.10, .35, facing) * .88;
  gl_Position = projectionMatrix * mv;
  gl_PointSize = clamp(aSize * uPixelRatio * uHeight * .016 / -mv.z, .85 * uPixelRatio, 2.8 * uPixelRatio);
}`
const fragmentShader = `
uniform float uOpacity;
varying vec3 vColor;
varying float vAlpha;
void main() {
  float d = length(gl_PointCoord - .5) * 2.;
  if (d > 1.) discard;
  float alpha = (1. - smoothstep(.20, 1., d)) * vAlpha * uOpacity;
  if (alpha < .015) discard;
  gl_FragColor = vec4(vColor, alpha);
  #include <colorspace_fragment>
}`

export function createParticleCloud(
  source: THREE.Object3D,
  count: number,
  seed = 1829,
  height = 1000,
  ratio = 1,
) {
  const sampled = sampleModelSurface(source, count, seed)
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(sampled.positions, 3))
  geometry.setAttribute('aNormal', new THREE.BufferAttribute(sampled.normals, 3))
  geometry.setAttribute('color', new THREE.BufferAttribute(sampled.colors, 3))
  geometry.setAttribute('aSize', new THREE.BufferAttribute(sampled.sizes, 1))
  geometry.computeBoundingBox()
  geometry.computeBoundingSphere()
  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: { uOpacity: { value: 1 }, uPixelRatio: { value: ratio }, uHeight: { value: height } },
    vertexColors: true,
    transparent: true,
    depthWrite: false,
    toneMapped: false,
  })
  const points = new THREE.Points(geometry, material)
  const group = new THREE.Group()
  // Invisible depth surfaces stop particles on the far side of a face showing
  // through its nose/eyes. Only the point sprites write visible colour.
  const depthMaterial = new THREE.MeshBasicMaterial({
    colorWrite: false,
    depthWrite: true,
    polygonOffset: true,
    polygonOffsetFactor: 1,
    polygonOffsetUnits: 1,
  })
  const depthRoot = source.clone(true)
  const bases: THREE.Object3D[] = []
  depthRoot.traverse((node) => {
    if (node.userData.presentation) bases.push(node)
    if (node instanceof THREE.Mesh) {
      node.material = depthMaterial
      node.renderOrder = -1
    }
  })
  for (const base of bases) base.removeFromParent()
  group.add(depthRoot)
  points.renderOrder = 1
  group.add(points)
  group.name = source.name
  return { group, geometry, material, depthMaterial }
}
