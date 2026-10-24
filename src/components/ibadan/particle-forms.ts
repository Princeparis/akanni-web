import type { IbadanForm } from '@/data/ibadan'

function random(seed: number) {
  let value = seed
  return () => {
    value = (Math.imul(1664525, value) + 1013904223) | 0
    return (value >>> 0) / 4294967296
  }
}

export function particleForm(form: IbadanForm, count: number) {
  const points = new Float32Array(count * 3)
  const rand = random(1829)
  const tau = Math.PI * 2
  for (let i = 0; i < count; i++) {
    const u = rand(),
      v = rand(),
      w = rand(),
      angle = u * tau
    let x = 0,
      y = 0,
      z = 0
    if (form === 'hills') {
      x = (u - 0.5) * 8.8
      z = (Math.floor(v * 100) / 100 - 0.5) * 6.4
      y =
        Math.sin(x * 0.8 + z * 0.35) * 0.5 +
        Math.cos(z * 1.2) * 0.45 +
        1.8 * Math.exp(-((x + 1.7) ** 2 + (z + 0.4) ** 2) / 2.6) +
        1.6 * Math.exp(-((x - 2.1) ** 2 + (z - 0.7) ** 2) / 1.7) -
        0.8
    } else if (form === 'gathering') {
      const ring = Math.floor(v * 14)
      const radius = 0.35 + ring * 0.235 + (w - 0.5) * 0.04
      x = Math.cos(angle) * radius
      z = Math.sin(angle) * radius
      y = Math.sin(angle * 3 + ring * 0.4) * 0.18 + (14 - ring) * 0.12 - 0.6
      if (i % 7 === 0) {
        y = v * 3.2 - 1
        const twist = angle + y * 1.2
        x = Math.cos(twist) * (1 - v) * 0.65
        z = Math.sin(twist) * (1 - v) * 0.65
      }
    } else if (form === 'drum') {
      y = (v - 0.5) * 5.4
      let radius = 0.47 + 1.04 * Math.pow(Math.abs(y / 2.7), 1.6)
      let theta = angle
      if (i % 10 < 3) {
        theta = (Math.floor(u * 24) / 24) * tau + Math.sin(v * Math.PI) * 0.07
        radius += 0.045
      } else if (i % 10 > 6) {
        y = i % 2 ? 2.7 : -2.7
        radius = i % 10 === 9 ? 1.53 : Math.sqrt(w) * 1.5
      }
      x = Math.cos(theta) * radius
      z = Math.sin(theta) * radius
      const tilt = -0.28
      const xx = x * Math.cos(tilt) - y * Math.sin(tilt)
      y = x * Math.sin(tilt) + y * Math.cos(tilt)
      x = xx
    } else if (form === 'hoe') {
      if (i % 10 < 5) {
        x = -1.8 + v * 2.7 + Math.cos(angle) * 0.12
        y = 2.8 - v * 4.5
        z = Math.sin(angle) * 0.12
      } else {
        x = 0.9 + (u - 0.5) * (1.2 + v * 1.25)
        y = -1.55 - v * 1.25
        z = 0.1 + v * 1.15 + Math.sin(u * Math.PI) * 0.15
      }
    } else if (form === 'shuttle') {
      if (i % 10 < 7) {
        x = (v - 0.5) * 7.5
        const width = Math.pow(Math.max(0, 1 - (x / 3.75) ** 2), 0.75)
        y = Math.cos(angle) * width * 0.56
        z = Math.sin(angle) * width * 0.85
        if (Math.abs(x) < 1.6 && i % 3 === 0) {
          y *= 0.5
          z *= 0.55
        }
      } else {
        x = (u - 0.5) * 8
        y = (Math.floor(v * 18) / 18) * 3.5 - 1.75
        z = Math.sin(x * 0.8 + y * 2) * 0.18 - 0.8
      }
    } else if (form === 'calabash') {
      const radius = i % 8 === 0 ? 2.7 : Math.sqrt(v) * 2.7
      x = Math.cos(angle) * radius
      z = Math.sin(angle) * radius
      y = -1.8 + radius * radius * 0.4 + (w - 0.5) * 0.06
      if (i % 8 === 0) y += Math.sin(angle * 36) * 0.045
    } else if (form === 'book') {
      const side = i % 2 ? 1 : -1
      x = side * u * 3.3
      z = (v - 0.5) * 4.3
      y = Math.sin(u * Math.PI) * 0.45 + u * 0.5 - Math.floor(w * 16) * 0.022
      if (i % 9 === 0) z = i % 3 ? 2.15 : -2.15
    } else if (form === 'wheel') {
      if (i % 10 < 7) {
        const radius = 2.7 + (v - 0.5) * 0.24
        x = Math.cos(angle) * radius
        y = Math.sin(angle) * radius
        z = (w - 0.5) * 0.48
      } else {
        const theta = (Math.floor(u * 16) / 16) * tau
        const radius = v * 2.6
        x = Math.cos(theta) * radius
        y = Math.sin(theta) * radius
        z = (w - 0.5) * 0.12
        if (i % 5 === 0) {
          x = Math.cos(angle) * 0.44
          y = Math.sin(angle) * 0.44
          z = (w - 0.5) * 0.65
        }
      }
    } else if (form === 'television') {
      if (i % 10 < 8) {
        x = (u - 0.5) * 5.6
        y = (v - 0.5) * 3.8 - 0.3
        z = 0.65 + Math.cos(u * Math.PI - Math.PI / 2) * Math.cos(v * Math.PI - Math.PI / 2) * 0.18
        if (i % 3 === 0) {
          z = (w - 0.5) * 1.6
          if (i % 2) x = i % 4 ? -2.8 : 2.8
          else y = i % 4 ? -2.2 : 1.6
        }
      } else {
        const side = i % 2 ? 1 : -1
        x = side * v * 1.7
        y = 1.6 + v * 1.6
        z = 0
      }
    } else if (form === 'tower') {
      const floor = Math.floor(v * 26)
      y = (floor / 26) * 6.3 - 3.1
      x = (u - 0.5) * 2.4
      z = (w - 0.5) * 1.8
      if (i % 2) x = i % 4 ? -1.2 : 1.2
      else z = i % 4 ? -0.9 : 0.9
      if (i % 11 === 0) {
        x *= 1.12
        z *= 1.12
      }
    } else {
      const cell = Math.floor(u * 81)
      const row = Math.floor(cell / 9),
        col = cell % 9
      const height = 0.35 + (((cell * 17) % 13) / 13) * 1.25
      const ground = Math.sin(row * 0.7) * 0.55 + Math.cos(col * 0.6) * 0.5 - 1.1
      x = (col - 4) * 0.82 + (v - 0.5) * 0.74
      z = (row - 4) * 0.82 + (w - 0.5) * 0.74
      y = ground + height + (1 - Math.abs(v - 0.5) * 2) * 0.32
      if (i % 4 === 0) {
        x = (col - 4) * 0.82 + (i % 8 ? -0.37 : 0.37)
        y = ground + w * height
      }
    }
    points[i * 3] = x
    points[i * 3 + 1] = y
    points[i * 3 + 2] = z
  }
  return points
}
