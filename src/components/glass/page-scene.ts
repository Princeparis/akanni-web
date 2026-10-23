// A small, app-specific compositor. It reads the real media and layout behind the lens.
// It does not clone the page, capture the screen, or claim to rasterize arbitrary CSS.
type PaintNode = { element: Element; children: Array<PaintNode | Text> }
type Area = { left: number; top: number; width: number; height: number }
const transparent = (color: string) => color === 'transparent' || color === 'rgba(0, 0, 0, 0)'
const overlaps = (a: Area, b: Area) =>
  a.left < b.left + b.width &&
  a.left + a.width > b.left &&
  a.top < b.top + b.height &&
  a.top + a.height > b.top

function splitArguments(value: string) {
  let depth = 0
  let start = 0
  const parts: string[] = []
  for (let i = 0; i < value.length; i++) {
    if (value[i] === '(') depth++
    if (value[i] === ')') depth--
    if (value[i] === ',' && depth === 0) {
      parts.push(value.slice(start, i).trim())
      start = i + 1
    }
  }
  parts.push(value.slice(start).trim())
  return parts
}

function linearGradient(ctx: CanvasRenderingContext2D, css: string, rect: DOMRect) {
  if (!css.startsWith('linear-gradient(')) return null
  const parts = splitArguments(css.slice(16, -1))
  let angle = Math.PI
  if (/deg$|^to /.test(parts[0])) {
    const direction = parts.shift()!
    angle = direction.endsWith('deg')
      ? (parseFloat(direction) * Math.PI) / 180
      : direction.includes('top')
        ? 0
        : direction.includes('right')
          ? Math.PI / 2
          : direction.includes('left')
            ? -Math.PI / 2
            : Math.PI
  }
  const dx = Math.sin(angle),
    dy = -Math.cos(angle)
  const length = Math.abs(rect.width * dx) + Math.abs(rect.height * dy)
  const x = rect.left + rect.width / 2,
    y = rect.top + rect.height / 2
  const gradient = ctx.createLinearGradient(
    x - (dx * length) / 2,
    y - (dy * length) / 2,
    x + (dx * length) / 2,
    y + (dy * length) / 2,
  )
  for (let i = 0; i < parts.length; i++) {
    const stop = parts[i].match(/^(rgba?\([^)]+\)|#[0-9a-f]+|[a-z]+)\s*(.*)$/i)
    if (!stop || !CSS.supports('color', stop[1])) continue
    const at = stop[2].endsWith('%') ? parseFloat(stop[2]) / 100 : i / Math.max(1, parts.length - 1)
    gradient.addColorStop(Math.min(1, Math.max(0, at)), stop[1])
  }
  return gradient
}

export function createPageScene(invalidate: () => void) {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d', { alpha: false })!
  let roots: PaintNode[] = []
  let rebuild = true
  const visible = new WeakSet<Element>()
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) visible.add(entry.target)
        else visible.delete(entry.target)
      }
      invalidate()
    },
    { rootMargin: '100px 0px' },
  )
  const mutations = new MutationObserver((records) => {
    if (records.some((record) => record.type === 'childList')) rebuild = true
    invalidate()
  })
  for (const root of document.querySelectorAll('main, footer')) {
    mutations.observe(root, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['style', 'class', 'src', 'srcset'],
    })
  }

  const collect = () => {
    observer.disconnect()
    const visit = (element: Element): PaintNode => {
      observer.observe(element)
      const children = [...element.childNodes].filter(
        (node) => node instanceof Element || node instanceof Text,
      )
      // Positioned project sheets have explicit z-indices; preserve that painting order.
      children.sort((a, b) => {
        const z = (node: Node) =>
          node instanceof Element ? parseInt(getComputedStyle(node).zIndex) || 0 : 0
        return z(a) - z(b)
      })
      return {
        element,
        children: children.map((child) =>
          child instanceof Element ? visit(child) : (child as Text),
        ),
      }
    }
    roots = [...document.querySelectorAll('main, footer')].map(visit)
    rebuild = false
  }

  return {
    canvas,
    capture(area: Area, density: number) {
      if (rebuild) collect()
      const w = Math.round(area.width * density),
        h = Math.round(area.height * density)
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w
        canvas.height = h
      }
      ctx.setTransform(density, 0, 0, density, -area.left * density, -area.top * density)
      ctx.globalAlpha = 1
      ctx.fillStyle = getComputedStyle(document.body).backgroundColor || '#0b0b0b'
      ctx.fillRect(area.left, area.top, area.width, area.height)
      const styles = new Map<Element, CSSStyleDeclaration>()
      const styleOf = (element: Element) => {
        let style = styles.get(element)
        if (!style) {
          style = getComputedStyle(element)
          styles.set(element, style)
        }
        return style
      }
      const range = document.createRange()
      let moving = false
      let media = 0
      const drawText = (node: Text, style: CSSStyleDeclaration) => {
        const text = node.textContent || ''
        if (!text.trim()) return
        ctx.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`
        ctx.letterSpacing = style.letterSpacing === 'normal' ? '0px' : style.letterSpacing
        ctx.textBaseline = 'middle'
        ctx.fillStyle = style.color
        ctx.strokeStyle = style.webkitTextStrokeColor
        ctx.lineWidth = parseFloat(style.webkitTextStrokeWidth) || 0
        for (const match of text.matchAll(/\S+/g)) {
          range.setStart(node, match.index!)
          range.setEnd(node, match.index! + match[0].length)
          const rect = range.getBoundingClientRect()
          if (!rect.width || !overlaps(rect, area)) continue
          const word =
            style.textTransform === 'uppercase'
              ? match[0].toUpperCase()
              : style.textTransform === 'lowercase'
                ? match[0].toLowerCase()
                : match[0]
          const measured = ctx.measureText(word).width
          if (!measured) continue
          ctx.save()
          ctx.translate(rect.left, rect.top + rect.height / 2)
          ctx.scale(rect.width / measured, 1)
          if (ctx.lineWidth) ctx.strokeText(word, 0, 0)
          if (!transparent(style.color)) ctx.fillText(word, 0, 0)
          ctx.restore()
        }
      }
      const paint = (node: PaintNode) => {
        const { element, children } = node
        if (!visible.has(element)) return
        if (element.matches('script, style, svg, audio, dialog, .sr-only')) return
        const style = styleOf(element)
        if (
          style.display === 'none' ||
          style.visibility === 'hidden' ||
          Number(style.opacity) === 0
        )
          return
        const rect = element.getBoundingClientRect()
        const hit = overlaps(rect, area)
        const clip =
          ['hidden', 'clip', 'scroll', 'auto'].includes(style.overflowX) ||
          ['hidden', 'clip', 'scroll', 'auto'].includes(style.overflowY)
        if (clip && !hit) return
        ctx.save()
        ctx.globalAlpha *= Number(style.opacity)
        if (clip) {
          ctx.beginPath()
          ctx.roundRect(
            rect.left,
            rect.top,
            rect.width,
            rect.height,
            Math.min(parseFloat(style.borderTopLeftRadius) || 0, rect.width / 2, rect.height / 2),
          )
          ctx.clip()
        }
        if (hit) {
          if (!transparent(style.backgroundColor)) {
            ctx.fillStyle = style.backgroundColor
            ctx.fillRect(rect.left, rect.top, rect.width, rect.height)
          }
          const gradient = linearGradient(ctx, style.backgroundImage, rect)
          if (gradient) {
            ctx.fillStyle = gradient
            ctx.fillRect(rect.left, rect.top, rect.width, rect.height)
          }
          let source: CanvasImageSource | null = null
          let width = 0,
            height = 0
          if (element instanceof HTMLImageElement && element.complete && element.naturalWidth) {
            source = element
            width = element.naturalWidth
            height = element.naturalHeight
          } else if (element instanceof HTMLVideoElement && element.readyState >= 2) {
            source = element
            width = element.videoWidth
            height = element.videoHeight
            moving ||= !element.paused
          } else if (element instanceof HTMLCanvasElement && element.width && element.height) {
            source = element
            width = element.width
            height = element.height
            moving = true
          }
          if (source && width && height) {
            const url =
              element instanceof HTMLImageElement
                ? element.currentSrc
                : element instanceof HTMLVideoElement
                  ? element.currentSrc
                  : ''
            // Never taint the GPU input with an external, non-CORS media source.
            if (!url || new URL(url, location.href).origin === location.origin) {
              const fit = style.objectFit
              const scale =
                fit === 'contain'
                  ? Math.min(rect.width / width, rect.height / height)
                  : Math.max(rect.width / width, rect.height / height)
              const dw = fit === 'fill' ? rect.width : width * scale
              const dh = fit === 'fill' ? rect.height : height * scale
              const position = style.objectPosition
                .split(' ')
                .map((value) => parseFloat(value) / 100)
              ctx.save()
              ctx.beginPath()
              ctx.rect(rect.left, rect.top, rect.width, rect.height)
              ctx.clip()
              ctx.drawImage(
                source,
                rect.left + (rect.width - dw) * (position[0] ?? 0.5),
                rect.top + (rect.height - dh) * (position[1] ?? 0.5),
                dw,
                dh,
              )
              ctx.restore()
              media++
            }
          }
        }
        for (const child of children) {
          if (child instanceof Text) {
            if (hit) drawText(child, style)
          } else paint(child)
        }
        ctx.restore()
      }
      roots.forEach(paint)
      range.detach()
      return { moving, media }
    },
    dispose() {
      observer.disconnect()
      mutations.disconnect()
    },
  }
}
