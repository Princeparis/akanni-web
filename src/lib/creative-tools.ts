export type AngleMode = 'DEG' | 'RAD'

/** A closed arithmetic parser: input is never evaluated as JavaScript. */
export function calculate(source: string, mode: AngleMode = 'DEG'): number {
  const text = source
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/−/g, '-')
    .replace(/π/g, 'pi')
    .trim()
  if (!text) throw new Error('Enter an expression first.')
  const pattern = /(?:\d*\.?\d+(?:e[+-]?\d+)?|[a-z]+|[()+\-*/^!%])/iy
  const raw: string[] = []
  let position = 0
  while (position < text.length) {
    if (/\s/.test(text[position])) {
      position++
      continue
    }
    pattern.lastIndex = position
    const match = pattern.exec(text)
    if (!match) throw new Error('Use numbers, operators, and the supported functions.')
    raw.push(match[0].toLowerCase())
    position = pattern.lastIndex
  }
  if (raw.length > 400) throw new Error('Try a shorter expression.')
  const constants: Record<string, number> = { pi: Math.PI, e: Math.E },
    tokens: string[] = []
  raw.forEach((token, index) => {
    const previous = raw[index - 1]
    if (
      index &&
      (/^(?:\d|\.)/.test(previous) ||
        Object.hasOwn(constants, previous) ||
        [')', '!', '%'].includes(previous)) &&
      (token === '(' || /^[a-z]/.test(token))
    )
      tokens.push('*')
    tokens.push(token)
  })
  let cursor = 0,
    depth = 0
  const rad = (value: number) => (mode === 'DEG' ? (value * Math.PI) / 180 : value)
  const deg = (value: number) => (mode === 'DEG' ? (value * 180) / Math.PI : value)
  const functions: Record<string, (value: number) => number> = {
    sin: (value) => Math.sin(rad(value)),
    cos: (value) => Math.cos(rad(value)),
    tan: (value) => {
      if (Math.abs(Math.cos(rad(value))) < 1e-12)
        throw new Error('Tangent is undefined at this angle.')
      return Math.tan(rad(value))
    },
    asin: (value) => deg(Math.asin(value)),
    acos: (value) => deg(Math.acos(value)),
    atan: (value) => deg(Math.atan(value)),
    sqrt: Math.sqrt,
    ln: Math.log,
    log: Math.log10,
    abs: Math.abs,
    exp: Math.exp,
    round: Math.round,
    floor: Math.floor,
    ceil: Math.ceil,
  }
  const peek = () => tokens[cursor]
  const take = (expected: string) => {
    if (tokens[cursor++] !== expected) throw new Error('Check your parentheses and operators.')
  }
  function primary(): number {
    if (++depth > 64) throw new Error('Expression is too deeply nested.')
    const token = tokens[cursor++]
    let result: number
    if (token === '(') {
      result = sum()
      take(')')
    } else if (Object.hasOwn(constants, token)) result = constants[token]
    else if (Object.hasOwn(functions, token)) {
      take('(')
      result = functions[token](sum())
      take(')')
    } else if (token && /^(?:\d|\.)/.test(token)) result = Number(token)
    else throw new Error('A number or function is missing.')
    depth--
    return result
  }
  function postfix(): number {
    let value = primary()
    while (peek() === '!' || peek() === '%') {
      if (tokens[cursor++] === '%') value /= 100
      else {
        if (!Number.isInteger(value) || value < 0 || value > 170)
          throw new Error('Factorial needs an integer from 0 to 170.')
        let product = 1
        for (let factor = 2; factor <= value; factor++) product *= factor
        value = product
      }
    }
    return value
  }
  function power(): number {
    const value = postfix()
    if (peek() === '^') {
      cursor++
      return value ** unary()
    }
    return value
  }
  function unary(): number {
    if (peek() === '+') {
      cursor++
      return unary()
    }
    if (peek() === '-') {
      cursor++
      return -unary()
    }
    return power()
  }
  function product(): number {
    let value = unary()
    while (peek() === '*' || peek() === '/') {
      const operator = tokens[cursor++],
        next = unary()
      if (operator === '/' && next === 0) throw new Error('Cannot divide by zero.')
      value = operator === '*' ? value * next : value / next
    }
    return value
  }
  function sum(): number {
    let value = product()
    while (peek() === '+' || peek() === '-') {
      const operator = tokens[cursor++],
        next = product()
      value = operator === '+' ? value + next : value - next
    }
    return value
  }
  const result = sum()
  if (cursor !== tokens.length) throw new Error('Check your parentheses and operators.')
  if (!Number.isFinite(result))
    throw new Error('No finite real result. Check the function’s domain.')
  return Object.is(result, -0) ? 0 : Number(result.toPrecision(14))
}
export function formatNumber(value: number) {
  if (value !== 0 && (Math.abs(value) < 1e-6 || Math.abs(value) >= 1e12))
    return value.toExponential(8).replace(/\.?0+e/, 'e')
  return new Intl.NumberFormat('en-US', { maximumSignificantDigits: 12 }).format(value)
}
export function normalizeHex(value: string): string | null {
  const input = value.trim().replace(/^#/, '')
  if (/^[\da-f]{3}$/i.test(input))
    return (
      '#' +
      [...input]
        .map((character) => character + character)
        .join('')
        .toLowerCase()
    )
  return /^[\da-f]{6}$/i.test(input) ? '#' + input.toLowerCase() : null
}
export function rgb(hex: string): number[] {
  return [1, 3, 5].map((offset) => parseInt(hex.slice(offset, offset + 2), 16))
}
export function luminance(hex: string) {
  const values = rgb(hex).map((value) => {
    const channel = value / 255
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
  })
  return values[0] * 0.2126 + values[1] * 0.7152 + values[2] * 0.0722
}
export function contrast(first: string, second: string) {
  const a = luminance(first),
    b = luminance(second)
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
}
export function hexToHsl(hex: string): [number, number, number] {
  const [r, g, b] = rgb(hex).map((value) => value / 255),
    max = Math.max(r, g, b),
    min = Math.min(r, g, b),
    delta = max - min,
    light = (max + min) / 2
  let hue = 0
  if (delta)
    hue = max === r ? ((g - b) / delta) % 6 : max === g ? (b - r) / delta + 2 : (r - g) / delta + 4
  return [
    (hue * 60 + 360) % 360,
    delta ? (delta / (1 - Math.abs(2 * light - 1))) * 100 : 0,
    light * 100,
  ]
}
export function hslToHex(hue: number, saturation: number, lightness: number) {
  const h = ((hue % 360) + 360) % 360,
    s = Math.max(0, Math.min(saturation, 100)) / 100,
    l = Math.max(0, Math.min(lightness, 100)) / 100
  const a = s * Math.min(l, 1 - l)
  const channel = (n: number) => {
    const k = (n + h / 30) % 12
    return Math.round((l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))) * 255)
      .toString(16)
      .padStart(2, '0')
  }
  return '#' + channel(0) + channel(8) + channel(4)
}
export function makePalette(hex: string, harmony: string) {
  const [h, s, l] = hexToHsl(hex)
  const offsets =
    harmony === 'Complementary'
      ? [0, 180, 0, 180, 0, 180]
      : harmony === 'Triadic'
        ? [0, 120, 240, 0, 120, 240]
        : harmony === 'Monochrome'
          ? [0, 0, 0, 0, 0, 0]
          : [-30, -15, 0, 15, 30, 45]
  return offsets.map((offset, index) =>
    index === 2
      ? hex
      : hslToHex(
          h + offset,
          s,
          harmony === 'Monochrome'
            ? 18 + index * 13
            : Math.max(15, Math.min(88, l + (index - 2) * 9)),
        ),
  )
}
export function typeStep(base: number, ratio: number, step: number, fluid: boolean) {
  const maximum = base * ratio ** step,
    minimum = step > 0 && fluid ? maximum * (0.8 - step * 0.025) : maximum
  const slope = ((maximum - minimum) / 1080) * 100,
    intercept = minimum - 3.6 * slope
  return {
    minimum,
    maximum,
    css:
      fluid && step > 0
        ? `clamp(${(minimum / 16).toFixed(4)}rem, ${(intercept / 16).toFixed(4)}rem + ${slope.toFixed(4)}vw, ${(maximum / 16).toFixed(4)}rem)`
        : `${(maximum / 16).toFixed(4)}rem`,
  }
}
