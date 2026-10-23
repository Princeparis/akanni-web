'use client'

import { useEffect, useRef, type RefObject } from 'react'
import { createPageScene } from './glass/page-scene'
import { createOptics, drawSoftFallback, type LensFrame } from './glass/optics'
import './header-glass.css'

export default function HeaderGlass({
  target,
  route,
  paused,
}: {
  target: RefObject<HTMLElement | null>
  route: string
  paused: boolean
}) {
  const surface = useRef<HTMLSpanElement>(null)
  const gpu = useRef<HTMLCanvasElement>(null)
  const fallback = useRef<HTMLCanvasElement>(null)
  const pause = useRef(paused)
  useEffect(() => {
    pause.current = paused
  }, [paused])

  useEffect(() => {
    const header = target.current,
      layer = surface.current
    const canvas = gpu.current,
      softCanvas = fallback.current
    if (!header || !layer || !canvas || !softCanvas) return
    let disposed = false,
      dirty = true,
      moving = false
    let raf = 0,
      last = 0,
      frames = 0
    let optics = createOptics(canvas)
    let lost = false
    const light: [number, number] = [0, 0]
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    const contrast = window.matchMedia('(prefers-contrast: more), (forced-colors: active)')
    const small = document.createElement('canvas')
    const scene = createPageScene(() => {
      dirty = true
    })
    const mode = () => {
      layer.dataset.glassMode = optics && !lost ? 'webgl' : 'canvas'
    }
    mode()
    const mark = () => {
      dirty = true
    }
    const resize = new ResizeObserver(mark)
    resize.observe(header)
    const headerStyle = new MutationObserver(mark)
    headerStyle.observe(header, { attributes: true, attributeFilter: ['style', 'class'] })
    const pointer = (event: PointerEvent) => {
      if (reduced.matches || event.pointerType === 'touch') return
      const rect = header.getBoundingClientRect()
      light[0] = ((event.clientX - rect.left) / rect.width) * 2 - 1
      light[1] = ((event.clientY - rect.top) / rect.height) * 2 - 1
      dirty = true
    }
    const leave = () => {
      light[0] = 0
      light[1] = 0
      dirty = true
    }
    const contextLost = (event: Event) => {
      event.preventDefault()
      lost = true
      mode()
      mark()
    }
    const contextRestored = () => {
      optics?.dispose()
      optics = createOptics(canvas)
      lost = false
      mode()
      mark()
    }
    const tick = (now: number) => {
      if (disposed || document.hidden) return
      raf = requestAnimationFrame(tick)
      if (pause.current || contrast.matches || now - last < 1000 / 30 || (!dirty && !moving)) return
      last = now
      const style = getComputedStyle(header)
      const progress = Number(style.getPropertyValue('--glass-progress')) || 0
      if (progress < 0.005) {
        dirty = false
        moving = false
        return
      }
      const rect = header.getBoundingClientRect()
      const padding = 40
      const frame: LensFrame = {
        width: rect.width,
        height: rect.height,
        density: Math.min(devicePixelRatio || 1, 1.75),
        padding,
        radius: parseFloat(style.borderTopLeftRadius) || 0,
        strength: progress,
        light,
      }
      const captured = scene.capture(
        {
          left: rect.left - padding,
          top: rect.top - padding,
          width: rect.width + padding * 2,
          height: rect.height + padding * 2,
        },
        1,
      )
      moving = captured.moving
      if (!optics || lost || !optics.draw(scene.canvas, frame))
        drawSoftFallback(softCanvas, scene.canvas, frame, small)
      frames++
      layer.dataset.glassFrames = String(frames)
      layer.dataset.glassMedia = String(captured.media)
      dirty = false
    }
    const visibility = () => {
      cancelAnimationFrame(raf)
      dirty = true
      if (!document.hidden) raf = requestAnimationFrame(tick)
    }
    window.addEventListener('scroll', mark, { passive: true })
    window.addEventListener('resize', mark, { passive: true })
    header.addEventListener('pointermove', pointer)
    header.addEventListener('pointerleave', leave)
    document.addEventListener('visibilitychange', visibility)
    document.addEventListener('load', mark, true)
    for (const event of ['loadeddata', 'playing', 'pause', 'seeked'])
      document.addEventListener(event, mark, true)
    contrast.addEventListener('change', mark)
    reduced.addEventListener('change', leave)
    canvas.addEventListener('webglcontextlost', contextLost)
    canvas.addEventListener('webglcontextrestored', contextRestored)
    document.fonts.ready.then(() => {
      if (!disposed) mark()
    })
    raf = requestAnimationFrame(tick)
    return () => {
      disposed = true
      cancelAnimationFrame(raf)
      resize.disconnect()
      headerStyle.disconnect()
      scene.dispose()
      optics?.dispose()
      window.removeEventListener('scroll', mark)
      window.removeEventListener('resize', mark)
      header.removeEventListener('pointermove', pointer)
      header.removeEventListener('pointerleave', leave)
      document.removeEventListener('visibilitychange', visibility)
      document.removeEventListener('load', mark, true)
      for (const event of ['loadeddata', 'playing', 'pause', 'seeked'])
        document.removeEventListener(event, mark, true)
      contrast.removeEventListener('change', mark)
      reduced.removeEventListener('change', leave)
      canvas.removeEventListener('webglcontextlost', contextLost)
      canvas.removeEventListener('webglcontextrestored', contextRestored)
    }
  }, [target, route])

  return (
    <span className="header-glass" ref={surface} aria-hidden="true">
      <canvas className="header-glass-gpu" ref={gpu} />
      <canvas className="header-glass-soft" ref={fallback} />
    </span>
  )
}
