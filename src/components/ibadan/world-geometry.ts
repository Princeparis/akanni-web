import type { IbadanForm } from '@/data/ibadan'

export type Point3 = [number, number, number]
export type WorldGeometry = { positions: Float32Array; kinds: Float32Array }

// All spaces are schematic compositions; anonymous figures are composites.
// No point sample claims a measured plan, costume reference or portrait likeness.
export function buildIbadanWorld(form: IbadanForm, count: number): WorldGeometry {
  const positions: number[] = [],
    kinds: number[] = []
  let seed = 1829
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) | 0
    return (seed >>> 0) / 4294967296
  }
  const point = (x: number, y: number, z: number, kind = 1) => {
    positions.push(x, y, z)
    kinds.push(kind)
  }
  const line = (a: Point3, b: Point3, n = 100, kind = 1, width = 0.015) => {
    for (let i = 0; i < n; i++) {
      const t = random()
      point(
        a[0] + (b[0] - a[0]) * t + (random() - 0.5) * width,
        a[1] + (b[1] - a[1]) * t + (random() - 0.5) * width,
        a[2] + (b[2] - a[2]) * t + (random() - 0.5) * width,
        kind,
      )
    }
  }
  const box = (
    x: number,
    y: number,
    z: number,
    w: number,
    h: number,
    d: number,
    kind = 1,
    n = 1100,
  ) => {
    for (let i = 0; i < n; i++) {
      let a = (random() - 0.5) * w,
        b = random() * h,
        c = (random() - 0.5) * d
      const face = i % 6
      if (face < 2) a = ((face ? 1 : -1) * w) / 2
      else if (face < 4) c = ((face === 2 ? 1 : -1) * d) / 2
      else b = face === 4 ? 0 : h
      point(x + a, y + b, z + c, kind)
    }
    for (const side of [-1, 1]) {
      line([x - w / 2, y + h, z + (side * d) / 2], [x + w / 2, y + h, z + (side * d) / 2], 90, kind)
      line([x + (side * w) / 2, y, z - d / 2], [x + (side * w) / 2, y + h, z - d / 2], 75, kind)
    }
  }
  const sphere = (
    x: number,
    y: number,
    z: number,
    rx: number,
    ry: number,
    rz: number,
    n: number,
    kind = 2,
  ) => {
    for (let i = 0; i < n; i++) {
      const a = random() * Math.PI * 2,
        b = Math.acos(random() * 2 - 1)
      point(
        x + Math.cos(a) * Math.sin(b) * rx,
        y + Math.cos(b) * ry,
        z + Math.sin(a) * Math.sin(b) * rz,
        kind,
      )
    }
  }
  const person = (
    x: number,
    z: number,
    pose: 'walk' | 'carry' | 'sit' | 'perform' = 'walk',
    scale = 1,
  ) => {
    const seated = pose === 'sit',
      lower = seated ? 0.37 : 0
    const bodyPoint = (
      px: number,
      py: number,
      pz: number,
      rx: number,
      ry: number,
      rz: number,
      n: number,
    ) =>
      sphere(
        x + px * scale,
        (py - lower) * scale,
        z + pz * scale,
        rx * scale,
        ry * scale,
        rz * scale,
        n,
        2,
      )
    const limb = (a: Point3, b: Point3, radius = 0.065) => {
      const dx = b[0] - a[0],
        dy = b[1] - a[1],
        dz = b[2] - a[2]
      const length = Math.hypot(dx, dy, dz),
        ux = dx / length,
        uy = dy / length,
        uz = dz / length
      const bx = Math.abs(uy) < 0.9 ? 0 : 1,
        by = Math.abs(uy) < 0.9 ? 1 : 0
      const nx = -uz * by,
        ny = uz * bx,
        nz = ux * by - uy * bx
      const nl = Math.hypot(nx, ny, nz),
        vx = nx / nl,
        vy = ny / nl,
        vz = nz / nl
      const wx = uy * vz - uz * vy,
        wy = uz * vx - ux * vz,
        wz = ux * vy - uy * vx
      for (let i = 0; i < 260; i++) {
        const t = random(),
          angle = random() * Math.PI * 2,
          r = radius * (0.87 + 0.13 * Math.sin(t * Math.PI))
        point(
          x + (a[0] + dx * t + (vx * Math.cos(angle) + wx * Math.sin(angle)) * r) * scale,
          (a[1] + dy * t - lower + (vy * Math.cos(angle) + wy * Math.sin(angle)) * r) * scale,
          z + (a[2] + dz * t + (vz * Math.cos(angle) + wz * Math.sin(angle)) * r) * scale,
          2,
        )
      }
    }
    bodyPoint(0, 1.12, 0, 0.245, 0.34, 0.145, 1000)
    bodyPoint(0, 0.81, 0, 0.205, 0.19, 0.15, 400)
    bodyPoint(0, 1.63, 0, 0.135, 0.17, 0.13, 500)
    limb([0, 1.42, 0], [0, 1.5, 0], 0.065)
    if (seated) {
      for (const side of [-1, 1]) {
        limb([side * 0.12, 0.81, 0], [side * 0.16, 0.81, 0.4], 0.09)
        limb([side * 0.16, 0.81, 0.4], [side * 0.16, 0.4, 0.4], 0.075)
        bodyPoint(side * 0.16, 0.41, 0.46, 0.09, 0.05, 0.15, 120)
      }
    } else {
      for (const side of [-1, 1]) {
        const stride = side * 0.12
        limb([side * 0.12, 0.81, 0], [side * 0.14, 0.43, stride], 0.09)
        limb([side * 0.14, 0.43, stride], [side * 0.14, 0.08, stride * 1.4], 0.065)
        bodyPoint(side * 0.14, 0.07, stride * 1.4 + 0.06, 0.09, 0.06, 0.16, 120)
      }
    }
    for (const side of [-1, 1]) {
      const elbow: Point3 =
        pose === 'perform'
          ? [side * 0.45, 1.49, 0.03]
          : [side * 0.3, 1.08, pose === 'carry' ? 0.18 : 0.04]
      const hand: Point3 =
        pose === 'perform'
          ? [side * 0.69, 1.63 + side * 0.12, 0.03]
          : pose === 'carry'
            ? [side * 0.25, 1.02, 0.43]
            : [side * 0.28, 0.87, 0.08]
      limb([side * 0.23, 1.34, 0], elbow, 0.07)
      limb(elbow, hand, 0.055)
      bodyPoint(hand[0], hand[1], hand[2], 0.06, 0.075, 0.05, 100)
    }
    if (pose === 'carry')
      sphere(
        x,
        (0.98 - lower) * scale,
        z + 0.43 * scale,
        0.34 * scale,
        0.2 * scale,
        0.28 * scale,
        600,
        3,
      )
  }
  const table = (x: number, z: number, w = 2, d = 1) => {
    box(x, 0.8, z, w, 0.1, d, 3, 650)
    for (const a of [-1, 1])
      for (const b of [-1, 1])
        line(
          [x + a * w * 0.4, 0, z + b * d * 0.4],
          [x + a * w * 0.4, 0.8, z + b * d * 0.4],
          100,
          3,
          0.045,
        )
  }
  const vessel = (x: number, y: number, z: number, r = 0.48) => {
    for (let i = 0; i < 900; i++) {
      const a = random() * Math.PI * 2,
        v = Math.sqrt(random())
      point(x + Math.cos(a) * v * r, y + v * v * r * 0.8, z + Math.sin(a) * v * r, 3)
    }
  }
  const courtyard = () => {
    box(-5, 0, -1, 0.3, 2.6, 8, 1, 1500)
    box(5, 0, -1, 0.3, 2.6, 8, 1, 1500)
    box(-2.8, 0, -5, 4.4, 2.7, 0.3, 1, 1500)
    box(2.8, 0, -5, 4.4, 2.7, 0.3, 1, 1500)
    for (const x of [-4.7, 4.7]) line([x, 2.6, 2.8], [x, 2.6, -5], 350, 1)
    line([-5, 2.7, -5], [5, 2.7, -5], 400, 1)
  }
  const path = (offset = 0, broken = false) => {
    for (let i = 0; i < 2200; i++) {
      const z = random() * 17 - 8
      if (broken && Math.abs(z) < 1) continue
      const x = Math.sin(z * 0.32) * 0.5 + offset + (random() - 0.5) * 0.65
      point(x, 0.035, z, 4)
    }
  }
  const ground = (terrain = false) => {
    for (let i = 0; i < 10000; i++) {
      const x = (random() - 0.5) * 32,
        z = (random() - 0.5) * 30
      let y = -0.08
      if (terrain) y += Math.sin(x * 0.42 + z * 0.24) * 0.3 + Math.cos(z * 0.54) * 0.45
      point(x, y, z, 0)
    }
    for (let k = -8; k <= 8; k++) line([-12, -0.05, k * 1.1], [12, -0.05, k * 1.1], 90, 0)
  }
  ground(['landscape', 'regional', 'water'].includes(form))
  if (form === 'landscape') {
    for (let ridge = 0; ridge < 28; ridge++)
      for (let j = 0; j < 230; j++) {
        const x = (j / 230) * 25 - 12.5,
          z = ridge * 0.42 - 15
        const y =
          Math.sin(x * 0.32 + z * 0.22) * 1.2 + Math.exp(-((x + 3) ** 2 + (z + 7) ** 2) / 17) * 2.5
        point(x, y, z, 1)
      }
    vessel(0.1, 0.02, 4.2, 0.7)
    person(-1.2, 1.5, 'carry')
    person(0.9, 0.5, 'walk')
    person(1.7, 1, 'walk', 0.63)
    path()
  } else if (
    ['arrival', 'compound', 'school', 'market', 'mbari', 'university', 'unrest'].includes(form)
  ) {
    courtyard()
    path(0, form === 'unrest')
    if (form === 'arrival') {
      person(-1.2, 2.2, 'carry')
      person(0.6, 1.3, 'walk')
      person(1.4, 2.7, 'walk', 0.63)
      vessel(-3, 0.05, -1, 0.8)
      box(3, 0, -2, 1.8, 0.6, 1.2, 3, 900)
      line([-1, 0, -5], [-1, 3.1, -5], 200)
      line([1, 0, -5], [1, 3.1, -5], 200)
    } else if (form === 'market') {
      for (const x of [-3.7, -2.8, 3.1, 4])
        for (const z of [-3, -1.8]) box(x, 0, z, 0.8, 0.65, 0.7, 3, 550)
      table(-1, 1.1)
      box(-1, 0.91, 1.1, 0.65, 0.035, 0.42, 3, 400)
      person(-2.1, 1.2, 'sit')
      person(2.3, 0.8, 'carry')
      person(0.4, -1.4)
      person(3.6, 2.4)
      for (const x of [-3, 2.5]) line([x, 0.05, -3], [0, 0.05, 3], 700, 4, 0.12)
    } else if (form === 'mbari') {
      box(0, 0, -2.4, 3.8, 0.24, 2.4, 3, 1300)
      person(0, -2.1, 'perform')
      table(3, 1.0, 2.5, 1.3)
      for (const p of [
        [-3, 2.5],
        [-1.3, 3.3],
        [1.0, 3.6],
        [3, 3],
      ])
        person(p[0], p[1], 'sit')
      person(3.1, 0.1, 'sit')
      box(2.6, 0.92, 1.0, 0.5, 0.08, 0.7, 3, 400)
      for (let k = 0; k < 3; k++) {
        box(-3.6 + k * 2.5, 1.0, -4.7, 1.5, 1.5, 0.03, 3, 700)
        for (let j = 0; j < 150; j++) {
          const t = (j / 150) * Math.PI * 2
          point(-3.6 + k * 2.5 + Math.cos(t) * 0.5, 1.7 + Math.sin(t * 2) * 0.5, -4.64, 4)
        }
      }
    } else if (form === 'school' || form === 'university') {
      table(0, -0.5, 3.8, 1.5)
      person(-2.5, -0.5)
      person(-1, 1.8, 'sit')
      person(1, 1.8, 'sit')
      person(3, -2)
      for (let i = 0; i < 8; i++) box(-1.5 + i * 0.4, 0.91, -0.5, 0.25, 0.07, 0.42, 3, 170)
      if (form === 'university') {
        for (const x of [-3.7, 3.7]) {
          box(x, 0, -1.6, 0.6, 2.5, 4.2, 1, 1600)
          for (let shelf = 0; shelf < 4; shelf++) {
            line([x - 0.35, 0.5 + shelf * 0.55, -3.7], [x - 0.35, 0.5 + shelf * 0.55, 0.5], 220, 3)
            for (let book = 0; book < 12; book++)
              box(x - 0.35, 0.5 + shelf * 0.55, -3.5 + book * 0.32, 0.18, 0.35, 0.13, 3, 40)
          }
        }
      }
    } else if (form === 'unrest') {
      box(0, 0, -2, 2.4, 2.8, 0.2, 1, 1700)
      person(-3, 2)
      person(3.2, 1, 'carry')
    } else {
      person(-2, 1)
      person(2, 0)
      person(0, -2)
      table(0, -1.6, 2.4, 1.2)
    }
  } else if (form === 'regional') {
    for (const [x, z] of [
      [-4, 3],
      [3.5, -2],
      [0.7, -6],
    ]) {
      for (let i = 0; i < 1500; i++) {
        const a = random() * Math.PI * 2,
          r = 1.15 + random() * 0.04
        point(x + Math.cos(a) * r, 0.15 + random() * 0.5, z + Math.sin(a) * r, 1)
      }
      box(x, 0.1, z, 0.8, 0.7, 0.7, 3, 700)
    }
    line([-4, 0.12, 3], [3.5, 0.12, -2], 1500, 4, 0.09)
    line([-4, 0.12, 3], [0.7, 0.12, -6], 1500, 4, 0.09)
    person(-4, 4.8)
    person(3.5, -0.2)
  } else if (form === 'treaty') {
    table(0, 0, 4, 2.4)
    box(0, 0.91, 0, 1.8, 0.02, 1.3, 3, 2100)
    for (const x of [-2.8, 2.8]) person(x, 0, 'sit')
    person(0, -3.2)
    line([-5, 0.02, 3], [5, 0.02, 3], 1000, 4)
  } else if (form === 'rail') {
    for (const x of [-0.8, 0.8]) line([x, 0.08, -10], [x, 0.08, 7], 1800, 3, 0.045)
    for (let z = -9; z < 7; z += 0.5) line([-1.2, 0, z], [1.2, 0, z], 100, 1, 0.09)
    box(0, 0.2, -3.7, 2, 1.5, 3, 1, 2400)
    box(3, 0, -1, 3.5, 0.2, 7, 1, 1500)
    for (let k = 0; k < 4; k++)
      box(2.4 + (k % 2) * 0.9, 0.2, -3 + Math.floor(k / 2), 0.7, 0.7, 0.7, 3, 500)
    person(3, 2, 'carry')
    person(-2.5, 1)
    person(4.5, -2)
  } else if (form === 'mapo') {
    box(0, 0, -3, 9, 0.4, 3.8, 1, 2200)
    box(0, 3, -4.7, 9, 0.3, 2, 1, 1700)
    for (let x = -3.6; x <= 3.6; x += 1.2) box(x, 0.4, -2.7, 0.22, 2.6, 0.24, 1, 450)
    line([-4.8, 3.3, -2.7], [0, 4.5, -2.7], 650)
    line([0, 4.5, -2.7], [4.8, 3.3, -2.7], 650)
    person(-2, 1)
    person(2.2, 2)
    path()
  } else if (form === 'broadcast') {
    table(-2, 0, 2.2, 1.1)
    box(-2, 0.9, 0, 1.35, 0.95, 0.6, 3, 1800)
    box(2.8, 0, -2, 0.7, 1.3, 0.7, 1, 1200)
    line([2.8, 1.3, -2], [2.8, 2.5, -2], 300, 3)
    person(1, -2)
    person(-2, -0.7, 'sit')
    person(2.8, 2.3, 'sit')
    person(4, 2.7, 'sit')
    path()
  } else {
    const tower = form === 'tower'
    if (tower) {
      box(0, 0, -3, 2.6, 7, 2, 1, 6500)
      for (let y = 0.3; y < 7; y += 0.25) line([-1.3, y, -1.98], [1.3, y, -1.98], 120)
      for (let k = 0; k < 4; k++) box(-4 + k * 0.8, 0, 2, 0.7, 0.65, 0.7, 3, 450)
      person(-3.5, 3, 'carry')
      person(2.7, 1)
      path(-2)
    } else {
      for (let k = 0; k < 18; k++) {
        const x = ((k % 6) - 2.5) * 2.1,
          z = -Math.floor(k / 6) * 2.4 - 2
        const h = 0.8 + random() * 1.3
        box(x, 0, z, 1.65, h, 1.8, 1, 900)
        line([x - 0.85, h, z + 0.9], [x, h + 0.65, z + 0.9], 130)
        line([x, h + 0.65, z + 0.9], [x + 0.85, h, z + 0.9], 130)
      }
      person(-2.4, 3)
      person(1.4, 2, 'carry')
      person(3.2, 4)
      path()
    }
    if (form === 'water')
      for (let i = 0; i < 5000; i++) {
        const z = random() * 25 - 15,
          x = Math.sin(z * 0.38) * 3 + (random() - 0.5) * 1.2
        point(x, 0.12 + Math.sin(z) * 0.03, z, 5)
      }
  }
  const result = new Float32Array(count * 3),
    labels = new Float32Array(count)
  for (let i = 0; i < count; i++) {
    const index = Math.floor((i / count) * kinds.length)
    result[i * 3] = positions[index * 3]
    result[i * 3 + 1] = positions[index * 3 + 1]
    result[i * 3 + 2] = positions[index * 3 + 2]
    labels[i] = kinds[index]
  }
  return { positions: result, kinds: labels }
}
