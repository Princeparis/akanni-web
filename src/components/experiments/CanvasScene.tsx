'use client'
import { useCallback, useEffect, useRef, type RefObject } from 'react'
import type { ExperimentSlug } from '@/data/experiments'
import { randomSequence, useCanvas, type Paint } from './useCanvas'

export type SceneSettings = { a: number; b: number; seed: number; inverted: boolean }
type Point = {
  x: number
  y: number
  vx: number
  vy: number
  homeX: number
  homeY: number
  tone: number
}
type Model = {
  width: number
  height: number
  seed: number
  configuration?: string
  points: Point[]
}

export default function CanvasScene({
  kind,
  settings,
  playing,
  canvasRef,
}: {
  kind: ExperimentSlug
  settings: SceneSettings
  playing: boolean
  canvasRef: RefObject<HTMLCanvasElement | null>
}) {
  const current = useRef(settings)
  useEffect(() => {
    current.current = settings
  }, [settings])
  const pointer = useRef<{ x: number; y: number } | null>(null)
  const model = useRef<Model>({ width: 0, height: 0, seed: -1, points: [] })
  const paint = useCallback<Paint>(
    (ctx, width, height, time, delta) => {
      if (!width || !height) return
      const { a, b, seed, inverted } = current.current
      const state = model.current
      const configuration = `${a}:${b}:${inverted}`
      const reset =
        state.width !== width ||
        state.height !== height ||
        state.seed !== seed ||
        (kind === 'flow-field' && state.configuration !== configuration)
      if (reset) {
        state.width = width
        state.height = height
        state.seed = seed
        state.configuration = configuration
        const random = randomSequence(seed + 4096)
        state.points =
          kind === 'spring-grid'
            ? Array.from({ length: 20 * 12 }, (_, i) => {
                const homeX = width * (0.07 + ((i % 20) / 19) * 0.86)
                const homeY = height * (0.08 + (Math.floor(i / 20) / 11) * 0.84)
                const distance = Math.hypot(homeX - width / 2, homeY - height / 2)
                const displacement = Math.sin(distance / 38 + seed) * 20
                return {
                  x: homeX + displacement,
                  y: homeY + displacement,
                  homeX,
                  homeY,
                  vx: displacement * 5,
                  vy: -displacement * 5,
                  tone: random(),
                }
              })
            : Array.from({ length: Math.min(1000, Math.round((width * height) / 550)) }, () => ({
                x: random() * width,
                y: random() * height,
                vx: 0,
                vy: 0,
                homeX: 0,
                homeY: 0,
                tone: random(),
              }))
        ctx.fillStyle = inverted ? '#ede9df' : '#10151a'
        ctx.fillRect(0, 0, width, height)
      }
      if (kind === 'flow-field') {
        // Warm a new composition so reduced-motion users also get a finished drawing.
        const passes = reset ? 85 : delta > 0 ? 1 : 0
        for (let pass = 0; pass < passes; pass++) {
          ctx.fillStyle = inverted ? 'rgba(237,233,223,0.035)' : 'rgba(16,21,26,0.035)'
          ctx.fillRect(0, 0, width, height)
          const scale = a / 1400
          for (const particle of state.points) {
            const angle =
              (Math.sin(particle.x * scale + time * 0.12 + seed) +
                Math.cos(particle.y * scale - time * 0.12)) *
              Math.PI
            let dx = Math.cos(angle) * b * 1.6,
              dy = Math.sin(angle) * b * 1.6
            if (pointer.current) {
              const px = particle.x - pointer.current.x,
                py = particle.y - pointer.current.y
              const distance = Math.hypot(px, py)
              if (distance < 110 && distance > 0) {
                dx += (px / distance) * (1 - distance / 110) * 6
                dy += (py / distance) * (1 - distance / 110) * 6
              }
            }
            ctx.strokeStyle = inverted
              ? `rgba(30,43,54,${0.2 + particle.tone * 0.35})`
              : `rgba(${particle.tone > 0.5 ? '226,186,146' : '169,191,201'},${0.2 + particle.tone * 0.35})`
            ctx.lineWidth = 0.7
            ctx.beginPath()
            ctx.moveTo(particle.x, particle.y)
            particle.x += dx
            particle.y += dy
            ctx.lineTo(particle.x, particle.y)
            ctx.stroke()
            if (particle.x < 0) particle.x = width
            if (particle.x > width) particle.x = 0
            if (particle.y < 0) particle.y = height
            if (particle.y > height) particle.y = 0
          }
        }
      } else if (kind === 'moire') {
        ctx.fillStyle = inverted ? '#151515' : '#eeeae1'
        ctx.fillRect(0, 0, width, height)
        ctx.strokeStyle = inverted ? '#e9e5dc' : '#242424'
        ctx.lineWidth = 0.85
        const diagonal = Math.hypot(width, height)
        const centerX = width / 2,
          centerY = height / 2
        const offset = Math.min(b, width * 0.4)
        const second = pointer.current ?? {
          x: centerX + Math.cos(time * 0.18 + seed * 0.5) * offset,
          y: centerY + Math.sin(time * 0.18 + seed * 0.5) * offset * 0.5,
        }
        for (const center of [{ x: centerX - offset * 0.25, y: centerY }, second]) {
          ctx.beginPath()
          for (let radius = a; radius < diagonal; radius += a) {
            ctx.moveTo(center.x + radius, center.y)
            ctx.arc(center.x, center.y, radius, 0, Math.PI * 2)
          }
          ctx.stroke()
        }
      } else {
        ctx.fillStyle = inverted ? '#17191c' : '#e9e9e4'
        ctx.fillRect(0, 0, width, height)
        for (const point of state.points) {
          const forceX = (point.homeX - point.x) * a,
            forceY = (point.homeY - point.y) * a
          point.vx += forceX * delta
          point.vy += forceY * delta
          if (pointer.current) {
            const dx = pointer.current.x - point.x,
              dy = pointer.current.y - point.y
            const distance = Math.hypot(dx, dy)
            if (distance < 150) {
              const force = (1 - distance / 150) * 14
              point.vx += dx * force * delta
              point.vy += dy * force * delta
            }
          }
          const friction = Math.exp(-b * delta)
          point.vx *= friction
          point.vy *= friction
          point.x += point.vx * delta
          point.y += point.vy * delta
          const displacement = Math.hypot(point.x - point.homeX, point.y - point.homeY)
          ctx.strokeStyle = inverted ? '#ffffff22' : '#15191d22'
          ctx.lineWidth = 0.65
          ctx.beginPath()
          ctx.moveTo(point.homeX, point.homeY)
          ctx.lineTo(point.x, point.y)
          ctx.stroke()
          ctx.fillStyle = inverted ? '#e4e7e9' : '#242c35'
          ctx.beginPath()
          ctx.arc(
            point.x,
            point.y,
            Math.min(width < 600 ? 5 : 8, Math.max(2, width / 210)) +
              Math.min(displacement / 18, 5),
            0,
            Math.PI * 2,
          )
          ctx.fill()
        }
      }
    },
    [kind],
  )
  const canvas = useCanvas(
    paint,
    playing,
    `${settings.a}:${settings.b}:${settings.seed}:${settings.inverted}`,
  )
  useEffect(() => {
    canvasRef.current = canvas.current
    return () => {
      canvasRef.current = null
    }
  }, [canvas, canvasRef])

  return (
    <canvas
      ref={canvas}
      className="experiment-canvas"
      aria-label={`${kind === 'flow-field' ? 'Generative flow field' : kind === 'moire' ? 'Moiré interference' : 'Spring physics'} interactive canvas. Controls and explanation follow.`}
      onPointerMove={(event) => {
        const box = event.currentTarget.getBoundingClientRect()
        pointer.current = { x: event.clientX - box.left, y: event.clientY - box.top }
      }}
      onPointerDown={(event) => {
        event.currentTarget.setPointerCapture(event.pointerId)
        const box = event.currentTarget.getBoundingClientRect()
        const x = event.clientX - box.left,
          y = event.clientY - box.top
        pointer.current = { x, y }
        if (kind === 'spring-grid')
          for (const point of model.current.points) {
            const dx = point.x - x,
              dy = point.y - y,
              distance = Math.max(1, Math.hypot(dx, dy))
            const force = Math.max(0, 1 - distance / 300) * 750
            point.vx += (dx / distance) * force
            point.vy += (dy / distance) * force
          }
      }}
      onPointerUp={(event) => {
        if (event.pointerType !== 'mouse') pointer.current = null
      }}
      onPointerLeave={() => {
        pointer.current = null
      }}
      onPointerCancel={() => {
        pointer.current = null
      }}
    >
      An interactive drawing. Use the labelled controls below to change the composition.
    </canvas>
  )
}
