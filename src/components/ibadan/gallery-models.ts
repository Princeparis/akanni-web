import * as THREE from 'three'
import type { IbadanSculpture } from '@/data/ibadan-gallery'

type Material = THREE.MeshStandardMaterial
export type GalleryLibrary = ReturnType<typeof createGalleryLibrary>

// Detailed source surfaces for particle sampling. These meshes are never displayed
// as solid sculptures. Portrait data is CC0-derived; other modelling is original.
export function createGalleryLibrary(heads: {
  woman: THREE.BufferGeometry
  man: THREE.BufferGeometry
}) {
  const textures: THREE.Texture[] = []
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 256
  const context = canvas.getContext('2d')!
  const pixels = context.createImageData(256, 256)
  let seed = 1829
  for (let i = 0; i < pixels.data.length; i += 4) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0
    const n = 110 + (seed >>> 25)
    pixels.data.set([n, n, n, 255], i)
  }
  context.putImageData(pixels, 0, 0)
  const grain = new THREE.CanvasTexture(canvas)
  grain.wrapS = grain.wrapT = THREE.RepeatWrapping
  grain.repeat.set(4, 4)
  textures.push(grain)
  const bronze = new THREE.MeshStandardMaterial({
    color: '#805335',
    metalness: 0.78,
    roughness: 0.43,
    bumpMap: grain,
    bumpScale: 0.014,
  })
  const dark = new THREE.MeshStandardMaterial({
    color: '#314137',
    metalness: 0.72,
    roughness: 0.55,
    bumpMap: grain,
    bumpScale: 0.018,
  })
  const gold = new THREE.MeshStandardMaterial({
    color: '#c5a36b',
    metalness: 0.82,
    roughness: 0.35,
  })
  const ebony = new THREE.MeshStandardMaterial({
    color: '#36251d',
    metalness: 0.18,
    roughness: 0.5,
    bumpMap: grain,
    bumpScale: 0.025,
  })
  const paper = new THREE.MeshStandardMaterial({
    color: '#c8b18a',
    metalness: 0.13,
    roughness: 0.8,
    bumpMap: grain,
    bumpScale: 0.006,
    side: THREE.DoubleSide,
  })
  const stone = new THREE.MeshStandardMaterial({
    color: '#242b23',
    metalness: 0.13,
    roughness: 0.9,
    bumpMap: grain,
    bumpScale: 0.04,
  })
  const glass = new THREE.MeshPhysicalMaterial({
    color: '#283d34',
    metalness: 0.2,
    roughness: 0.15,
    clearcoat: 1,
    clearcoatRoughness: 0.12,
  })
  const materials = [bronze, dark, gold, ebony, paper, stone, glass]
  for (const [material, color] of [
    [bronze, '#c8b899'],
    [dark, '#9cb8a5'],
    [gold, '#e6cfa3'],
    [ebony, '#b7a583'],
    [paper, '#e8ddc4'],
    [stone, '#7b8978'],
    [glass, '#a7c6ba'],
  ] as const)
    material.userData.particleColor = color
  const geometries = new Set<THREE.BufferGeometry>([heads.woman, heads.man])
  const mesh = (
    group: THREE.Group,
    geo: THREE.BufferGeometry,
    material: Material,
    x = 0,
    y = 0,
    z = 0,
  ) => {
    geometries.add(geo)
    const result = new THREE.Mesh(geo, material)
    result.position.set(x, y, z)
    result.castShadow = result.receiveShadow = true
    group.add(result)
    return result
  }
  const box = (g: THREE.Group, w: number, h: number, d: number, m: Material, x = 0, y = 0, z = 0) =>
    mesh(g, new THREE.BoxGeometry(w, h, d), m, x, y, z)
  const cylinder = (
    g: THREE.Group,
    rt: number,
    rb: number,
    h: number,
    m: Material,
    x = 0,
    y = 0,
    z = 0,
    segments = 64,
  ) => mesh(g, new THREE.CylinderGeometry(rt, rb, h, segments), m, x, y, z)
  const sphere = (g: THREE.Group, r: number, m: Material, x: number, y: number, z: number) =>
    mesh(g, new THREE.SphereGeometry(r, 28, 20), m, x, y, z)
  const tube = (
    g: THREE.Group,
    points: THREE.Vector3[],
    radius: number,
    m: Material,
    closed = false,
  ) =>
    mesh(
      g,
      new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3(points, closed),
        Math.max(24, points.length * 6),
        radius,
        6,
        closed,
      ),
      m,
    )
  const ring = (
    g: THREE.Group,
    radius: number,
    y: number,
    thick: number,
    m: Material,
    x = 0,
    z = 0,
  ) => {
    const r = mesh(g, new THREE.TorusGeometry(radius, thick, 8, 80), m, x, y, z)
    r.rotation.x = Math.PI / 2
    return r
  }
  const lathe = (g: THREE.Group, points: number[][], m: Material) =>
    mesh(
      g,
      new THREE.LatheGeometry(
        points.map(([r, y]) => new THREE.Vector2(r, y)),
        80,
      ),
      m,
    )
  const plinth = (g: THREE.Group, radius = 1.35) => {
    cylinder(g, radius, radius * 0.98, 0.18, stone, 0, -0.08).userData.presentation = true
    cylinder(g, radius * 1.015, radius * 1.015, 0.035, bronze, 0, 0.025).userData.presentation =
      true
  }
  const cloth = (g: THREE.Group, feminine: boolean) => {
    const positions: number[] = [],
      indices: number[] = []
    const levels = 48,
      segments = 112
    for (let j = 0; j <= levels; j++) {
      const t = j / levels,
        y = 0.1 + t * 1.64
      const shoulder = Math.exp(-Math.pow((t - 0.76) / 0.2, 2))
      const neck = THREE.MathUtils.smoothstep(t, 0.81, 1)
      const rx = (0.62 + 0.43 * shoulder) * (1 - neck) + 0.245 * neck
      const rz = (0.34 + 0.1 * shoulder) * (1 - neck) + 0.23 * neck
      for (let i = 0; i <= segments; i++) {
        const a = (i / segments) * Math.PI * 2
        const fold = 0.025 * Math.sin(a * 23 + t * 2) + 0.016 * Math.sin(a * 37 - t * 4)
        const drape = 0.07 * Math.cos(a * 2) * Math.sin(t * Math.PI)
        positions.push(Math.sin(a) * (rx + fold), y + drape, Math.cos(a) * (rz + fold))
      }
    }
    for (let j = 0; j < levels; j++)
      for (let i = 0; i < segments; i++) {
        const a = j * (segments + 1) + i,
          b = a + segments + 1
        indices.push(a, a + 1, b, a + 1, b + 1, b)
      }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    geo.setIndex(indices)
    geo.computeVertexNormals()
    mesh(g, geo, feminine ? dark : bronze)
    const collar = ring(g, 0.25, 1.71, 0.018, gold)
    collar.scale.z = 0.92
  }

  const headWrap = (g: THREE.Group) => {
    // A tied cloth study. This is not reconstructed period regalia.
    const positions: number[] = [],
      indices: number[] = []
    const rows = 24,
      columns = 96
    for (let j = 0; j <= rows; j++)
      for (let i = 0; i <= columns; i++) {
        const a = (i / columns) * Math.PI * 2,
          p = 0.025 + (j / rows) * 1.48
        const fold = 0.012 * Math.sin(a * 25 + p * 8)
        positions.push(
          Math.sin(p) * Math.cos(a) * (0.55 + fold),
          2.79 + Math.cos(p) * 0.49,
          0.27 + Math.sin(p) * Math.sin(a) * (0.62 + fold),
        )
      }
    for (let j = 0; j < rows; j++)
      for (let i = 0; i < columns; i++) {
        const a = j * (columns + 1) + i,
          b = a + columns + 1
        indices.push(a, a + 1, b, b, a + 1, b + 1)
      }
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    geometry.setIndex(indices)
    geometry.computeVertexNormals()
    mesh(g, geometry, dark)
    for (let row = 0; row < 3; row++)
      tube(
        g,
        Array.from({ length: 96 }, (_, i) => {
          const a = (i / 96) * Math.PI * 2
          return new THREE.Vector3(
            Math.cos(a) * (0.55 - row * 0.025),
            2.85 + row * 0.1 + Math.sin(a + 0.5) * 0.06,
            0.27 + Math.sin(a) * (0.61 - row * 0.025),
          )
        }),
        0.043,
        row === 1 ? bronze : dark,
        true,
      )
    const knot = sphere(g, 0.16, dark, 0.51, 3.02, 0.0)
    knot.scale.set(1.25, 0.7, 0.85)
    // Two folded cloth ends, connected to the side knot.
    for (let side = 0; side < 2; side++) {
      const points: number[] = [],
        triangles: number[] = []
      for (let j = 0; j <= 22; j++)
        for (let i = 0; i <= 12; i++) {
          const t = j / 22,
            w = (i / 12 - 0.5) * (0.24 - t * 0.1)
          points.push(
            0.52 + t * (0.3 + side * 0.1) + w,
            3.03 + Math.sin(t * 2.1) * (0.33 + side * 0.12) + Math.sin(w * 70) * 0.012,
            -0.02 - t * 0.3 + w * 0.6,
          )
        }
      for (let j = 0; j < 22; j++)
        for (let i = 0; i < 12; i++) {
          const a = j * 13 + i,
            b = a + 13
          triangles.push(a, b, a + 1, b, b + 1, a + 1)
        }
      const geo = new THREE.BufferGeometry()
      geo.setAttribute('position', new THREE.Float32BufferAttribute(points, 3))
      geo.setIndex(triangles)
      geo.computeVertexNormals()
      const material = dark.clone()
      material.side = THREE.DoubleSide
      materials.push(material)
      mesh(g, geo, material)
    }
  }
  const bust = (feminine: boolean, artist = false) => {
    const g = new THREE.Group()
    plinth(g, 1.12)
    cloth(g, feminine)
    mesh(g, feminine ? heads.woman : heads.man, bronze).userData.portrait = true
    // Inset metallic eyes retain the anatomical eyelids of the source mesh.
    for (const side of [-1, 1]) {
      const eye = sphere(
        g,
        0.087,
        bronze,
        side * (feminine ? 0.188 : 0.191),
        feminine ? 2.435 : 2.407,
        feminine ? 0.813 : 0.826,
      )
      eye.scale.set(1, 0.77, 0.8)
    }
    if (feminine) {
      headWrap(g)
      for (const side of [-1, 1]) {
        const earring = mesh(
          g,
          new THREE.TorusGeometry(0.075, 0.018, 8, 32),
          gold,
          side * 0.49,
          2.18,
          0.26,
        )
        earring.rotation.y = 0.2 * side
      }
    } else if (!artist) {
      const cap = lathe(
        g,
        [
          [0, 3.65],
          [0.22, 3.62],
          [0.48, 3.47],
          [0.64, 3.18],
          [0.66, 3.02],
        ],
        dark,
      )
      cap.scale.z = 0.82
      for (let i = 0; i < 6; i++) {
        const r = ring(g, 0.65 - i * 0.018, 3.03 + i * 0.04, 0.016, gold)
        r.scale.z = 0.82
      }
    } else {
      // Original composite artist: close curls and a textured beard, no named likeness.
      for (let j = 0; j < 9; j++)
        for (let i = 0; i < 24; i++) {
          const a = (i / 24) * Math.PI * 2,
            p = (j / 9) * 1.25
          sphere(
            g,
            0.07 + 0.014 * Math.sin(i * 7 + j),
            dark,
            Math.sin(p) * Math.cos(a) * 0.5,
            2.62 + Math.cos(p) * 0.56,
            0.28 + Math.sin(p) * Math.sin(a) * 0.56,
          )
        }
      const collar = ring(g, 0.33, 1.62, 0.055, paper)
      collar.scale.z = 0.8
    }
    return g
  }
  const drum = () => {
    const g = new THREE.Group()
    plinth(g, 1.28)
    const body = new THREE.Group()
    body.rotation.z = -0.17
    body.position.y = 0.3
    g.add(body)
    lathe(
      body,
      [
        [0, 0.12],
        [0.7, 0.12],
        [0.7, 0.22],
        [0.56, 0.48],
        [0.33, 0.92],
        [0.27, 1.27],
        [0.34, 1.61],
        [0.58, 2.09],
        [0.7, 2.25],
        [0.7, 2.36],
        [0, 2.36],
      ],
      ebony,
    )
    for (const y of [0.17, 2.32]) {
      cylinder(body, 0.72, 0.72, 0.055, paper, 0, y)
      ring(body, 0.72, y, 0.042, bronze)
    }
    for (let i = 0; i < 32; i++) {
      const a = (i / 32) * Math.PI * 2,
        b = ((i + 1) / 32) * Math.PI * 2
      tube(
        body,
        [
          new THREE.Vector3(0.71 * Math.cos(a), 0.2, 0.71 * Math.sin(a)),
          new THREE.Vector3(0.4 * Math.cos(a), 1.25, 0.4 * Math.sin(a)),
          new THREE.Vector3(0.71 * Math.cos(b), 2.3, 0.71 * Math.sin(b)),
        ],
        0.012,
        gold,
      )
    }
    for (let i = 0; i < 5; i++) ring(body, 0.28 + i * 0.014, 1.18 + i * 0.045, 0.018, bronze)
    tube(
      g,
      [
        new THREE.Vector3(0.9, 0.2, 0.4),
        new THREE.Vector3(1.08, 0.9, 0.33),
        new THREE.Vector3(1.25, 1.6, 0.24),
        new THREE.Vector3(1.1, 1.93, 0.22),
        new THREE.Vector3(0.91, 1.92, 0.2),
      ],
      0.045,
      ebony,
    )
    return g
  }
  const vessel = (water = false) => {
    const g = new THREE.Group()
    plinth(g, 1.35)
    lathe(
      g,
      [
        [0.28, 0.08],
        [0.5, 0.12],
        [0.83, 0.5],
        [0.92, 0.95],
        [0.8, 1.38],
        [0.48, 1.73],
        [0.38, 1.88],
        [0.39, 2.02],
        [0.46, 2.06],
        [0.47, 2.14],
        [0.35, 2.14],
        [0.31, 1.96],
      ],
      bronze,
    )
    for (const y of [0.55, 0.62, 0.69, 1.3, 1.37])
      ring(g, y < 1 ? 0.85 + (y - 0.55) * 0.25 : 0.82 - (y - 1.3) * 0.5, y, 0.012, gold)
    tube(
      g,
      [
        new THREE.Vector3(0.59, 1.6, 0),
        new THREE.Vector3(1.05, 1.65, 0),
        new THREE.Vector3(1.12, 1.1, 0),
        new THREE.Vector3(0.86, 0.9, 0),
      ],
      0.07,
      bronze,
    )
    if (water) {
      for (let i = 0; i < 5; i++) {
        const r = ring(g, 1.45 + i * 0.22, -0.01 + i * 0.015, 0.018, dark)
        r.scale.z = 0.65
      }
    }
    return g
  }
  const book = () => {
    const g = new THREE.Group()
    plinth(g, 1.65)
    const pages = new THREE.Group()
    pages.rotation.x = 0.32
    pages.position.y = 0.7
    g.add(pages)
    cylinder(g, 0.055, 0.075, 0.68, bronze, 0, 0.37)
    box(g, 0.18, 0.04, 1.5, bronze, 0, 0.68)
    for (const side of [-1, 1]) {
      const cover = box(pages, 1.2, 0.1, 1.8, dark, side * 0.62, 0)
      cover.rotation.z = side * 0.18
      const block = box(pages, 1.12, 0.23, 1.7, paper, side * 0.61, 0.15)
      block.rotation.z = side * 0.18
      for (let i = 0; i < 10; i++) {
        const line = box(pages, 1.11, 0.008, 1.69, bronze, side * 0.61, 0.04 + i * 0.021)
        line.rotation.z = side * 0.18
      }
      const surface = new THREE.PlaneGeometry(1.13, 1.7, 30, 8)
      const p = surface.attributes.position
      for (let i = 0; i < p.count; i++) {
        const x = p.getX(i)
        p.setZ(i, Math.sin(((x + 0.57) / 1.14) * Math.PI) * 0.11)
      }
      surface.computeVertexNormals()
      const sheet = mesh(pages, surface, paper, side * 0.61, 0.29)
      sheet.rotation.set(-Math.PI / 2, 0, side * 0.18)
    }
    box(pages, 0.055, 0.016, 2, bronze, 0.12, 0.31, 0.12)
    return g
  }
  const sword = () => {
    const g = new THREE.Group()
    plinth(g, 1.18)
    const blade = new THREE.Shape()
    blade.moveTo(-0.12, 0.8)
    blade.lineTo(-0.18, 2.6)
    blade.quadraticCurveTo(-0.1, 3.05, 0.1, 3.3)
    blade.lineTo(0.19, 1)
    blade.closePath()
    mesh(
      g,
      new THREE.ExtrudeGeometry(blade, {
        depth: 0.055,
        bevelEnabled: true,
        bevelSize: 0.025,
        bevelThickness: 0.02,
        bevelSegments: 3,
        steps: 1,
      }),
      bronze,
    )
    cylinder(g, 0.1, 0.11, 0.57, ebony, 0, 0.54)
    for (let i = 0; i < 8; i++) ring(g, 0.105, 0.32 + i * 0.06, 0.013, gold)
    const guard = box(g, 0.74, 0.09, 0.19, gold, 0, 0.89)
    guard.rotation.z = -0.08
    sphere(g, 0.15, gold, 0, 0.19, 0)
    return g
  }
  const agreement = () => {
    const g = new THREE.Group()
    plinth(g, 1.5)
    const paperGroup = new THREE.Group()
    paperGroup.rotation.set(0.48, 0, -0.08)
    g.add(paperGroup)
    box(paperGroup, 2.0, 0.06, 2.6, dark, 0, 0.68)
    box(paperGroup, 1.83, 0.025, 2.4, paper, 0, 0.73)
    // Deliberately blank: never fabricate a treaty's wording or signatures.
    const seal = cylinder(paperGroup, 0.19, 0.19, 0.035, bronze, 0.52, 0.76, 0.78)
    seal.rotation.y = 0.2
    box(paperGroup, 0.13, 0.025, 0.7, dark, 0.52, 0.75, 1)
    tube(
      g,
      [
        new THREE.Vector3(-0.8, 0.3, 0.4),
        new THREE.Vector3(-0.5, 1.1, 0.2),
        new THREE.Vector3(0.05, 1.7, 0.1),
      ],
      0.024,
      gold,
    )
    return g
  }
  const mapo = () => {
    const g = new THREE.Group()
    plinth(g, 2.3)
    for (let i = 0; i < 4; i++)
      box(g, 4.15 - i * 0.17, 0.09, 1.75 - i * 0.12, stone, 0, 0.08 + i * 0.09)
    box(g, 3.8, 1.36, 0.7, paper, 0, 1.06, -0.4)
    for (const x of [-1.6, -1.05, -0.5, 0.5, 1.05, 1.6]) {
      cylinder(g, 0.095, 0.12, 1.3, paper, x, 1.04, 0.34)
      cylinder(g, 0.15, 0.15, 0.075, gold, x, 0.42, 0.34)
      cylinder(g, 0.16, 0.16, 0.075, paper, x, 1.68, 0.34)
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * Math.PI * 2
        cylinder(
          g,
          0.008,
          0.008,
          1.18,
          stone,
          x + Math.sin(a) * 0.108,
          1.04,
          0.34 + Math.cos(a) * 0.108,
          6,
        )
      }
    }
    box(g, 4.05, 0.17, 1.3, paper, 0, 1.79)
    box(g, 4.18, 0.065, 1.4, gold, 0, 1.9)
    const roof = new THREE.Shape()
    roof.moveTo(-1.25, 0)
    roof.lineTo(0, 0.68)
    roof.lineTo(1.25, 0)
    roof.closePath()
    const pediment = mesh(
      g,
      new THREE.ExtrudeGeometry(roof, {
        depth: 0.17,
        bevelEnabled: true,
        bevelSize: 0.025,
        bevelThickness: 0.025,
        bevelSegments: 2,
      }),
      paper,
      0,
      1.92,
      0.43,
    )
    pediment.rotation.x = 0
    for (const x of [-1.46, -0.86, 0.86, 1.46]) box(g, 0.26, 0.73, 0.025, dark, x, 1.07, -0.03)
    box(g, 0.45, 1, 0.03, ebony, 0, 0.94, -0.025)
    return g
  }
  const locomotive = () => {
    const g = new THREE.Group()
    plinth(g, 2.0)
    for (const z of [-0.5, 0.5]) box(g, 3.6, 0.08, 0.09, gold, 0, 0.16, z)
    for (let i = 0; i < 12; i++) box(g, 0.12, 0.07, 1.4, ebony, -1.65 + i * 0.3, 0.09)
    box(g, 2.85, 0.18, 1.05, dark, 0, 0.54)
    const boiler = cylinder(g, 0.42, 0.42, 1.7, bronze, -0.4, 1.04)
    boiler.rotation.z = Math.PI / 2
    const front = cylinder(g, 0.37, 0.37, 0.055, dark, -1.28, 1.04)
    front.rotation.z = Math.PI / 2
    cylinder(g, 0.16, 0.11, 0.61, ebony, -0.94, 1.65)
    cylinder(g, 0.13, 0.21, 0.1, gold, -0.94, 1.97)
    box(g, 0.8, 1, 0.95, dark, 0.86, 1.09)
    box(g, 1, 0.09, 1.2, bronze, 0.86, 1.63)
    for (const z of [-0.49, 0.49]) {
      box(g, 0.4, 0.36, 0.03, glass, 0.85, 1.26, z)
      for (const x of [-0.92, -0.28, 0.53]) {
        const wheel = cylinder(g, 0.29, 0.29, 0.09, ebony, x, 0.46, z * 1.21)
        wheel.rotation.x = Math.PI / 2
        const rim = mesh(g, new THREE.TorusGeometry(0.25, 0.026, 8, 32), gold, x, 0.46, z * 1.33)
        for (let i = 0; i < 8; i++) {
          const spoke = box(g, 0.022, 0.44, 0.018, bronze, x, 0.46, z * 1.34)
          spoke.rotation.z = (i * Math.PI) / 4
        }
        void rim
      }
      box(g, 1.5, 0.04, 0.055, bronze, -0.25, 0.41, z * 1.4)
    }
    return g
  }
  const television = () => {
    const g = new THREE.Group()
    plinth(g, 1.6)
    box(g, 2.25, 1.6, 0.8, ebony, 0, 1.45)
    box(g, 1.75, 1.22, 0.08, bronze, -0.12, 1.47, 0.45)
    const screen = sphere(g, 1, glass, -0.15, 1.47, 0.47)
    screen.scale.set(0.77, 0.53, 0.12)
    for (const y of [1.77, 1.35]) {
      const knob = cylinder(g, 0.11, 0.11, 0.08, gold, 0.92, y, 0.46)
      knob.rotation.x = Math.PI / 2
    }
    for (let i = 0; i < 9; i++) box(g, 0.2, 0.022, 0.025, dark, 0.92, 0.83 + i * 0.035, 0.42)
    for (const side of [-1, 1]) {
      const foot = box(g, 0.09, 0.52, 0.11, bronze, side * 0.77, 0.4)
      foot.rotation.z = side * -0.16
      tube(g, [new THREE.Vector3(0, 2.28, 0), new THREE.Vector3(side * 0.8, 3, -0.1)], 0.016, gold)
    }
    return g
  }
  const cocoa = () => {
    const g = new THREE.Group()
    plinth(g, 1.5)
    box(g, 1.2, 3.3, 0.8, dark, 0.15, 1.7)
    for (let j = 0; j < 26; j++) {
      box(g, 1.27, 0.027, 0.86, bronze, 0.15, 0.23 + j * 0.12)
      for (const x of [-0.41, -0.19, 0.03, 0.25, 0.47, 0.69])
        box(g, 0.025, 0.085, 0.025, gold, x, 0.28 + j * 0.12, 0.412)
    }
    for (const x of [-0.46, -0.25, -0.04, 0.17, 0.38, 0.59, 0.76])
      box(g, 0.033, 3.31, 0.027, paper, x, 1.7, 0.44)
    box(g, 1.28, 0.13, 0.88, paper, 0.15, 3.42)
    const pod = new THREE.Group()
    pod.position.set(-0.75, 0.68, 0.64)
    pod.rotation.z = -0.5
    g.add(pod)
    const fruit = sphere(pod, 0.4, bronze, 0, 0.3, 0)
    fruit.scale.set(0.7, 1.7, 0.7)
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2
      tube(
        pod,
        Array.from({ length: 20 }, (_, j) => {
          const t = (j / 19) * Math.PI
          const r = Math.sin(t) * 0.285
          return new THREE.Vector3(Math.cos(a) * r, 0.3 + Math.cos(t) * 0.68, Math.sin(a) * r)
        }),
        0.018,
        gold,
      )
    }
    return g
  }
  const cache = new Map<IbadanSculpture, THREE.Group>()
  return {
    get(type: IbadanSculpture) {
      if (cache.has(type)) return cache.get(type)!
      const builders = {
        drum,
        vessel,
        commander: () => bust(false),
        sword,
        book,
        iyalode: () => bust(true),
        document: agreement,
        locomotive,
        mapo,
        television,
        writer: () => bust(false, true),
        cocoa,
        city: () => {
          const g = mapo()
          g.scale.setScalar(0.75)
          const tower = cocoa()
          tower.position.set(1.8, 0.1, -0.9)
          tower.scale.setScalar(0.7)
          g.add(tower)
          return g
        },
        water: () => vessel(true),
      }
      const model = builders[type]()
      model.name = type
      cache.set(type, model)
      return model
    },
    dispose() {
      geometries.forEach((g) => g.dispose())
      materials.forEach((m) => m.dispose())
      textures.forEach((t) => t.dispose())
      cache.clear()
    },
  }
}
