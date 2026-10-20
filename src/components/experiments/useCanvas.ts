'use client'
import { useEffect, useRef } from 'react'

export type Paint = (
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  delta: number,
) => void

// Pause outside the viewport and hidden tabs; one frame when controls change while paused.
export function useCanvas(paint: Paint, playing: boolean, revision: string) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const elapsed = useRef(0)
  useEffect(() => {
    const element = canvas.current
    const context = element?.getContext('2d')
    if (!element || !context) return
    let frame = 0,
      previous = 0,
      visible = true,
      width = 0,
      height = 0
    const draw = (now: number) => {
      frame = 0
      const delta = previous ? Math.min((now - previous) / 1000, 0.033) : 0
      previous = now
      elapsed.current += delta
      paint(context, width, height, elapsed.current, delta)
      if (playing && visible && !document.hidden) frame = requestAnimationFrame(draw)
    }
    const refresh = () => {
      cancelAnimationFrame(frame)
      previous = 0
      frame = 0
      if (visible && !document.hidden) frame = requestAnimationFrame(draw)
    }
    const resize = () => {
      const box = element.getBoundingClientRect()
      width = box.width
      height = box.height
      const ratio = Math.min(devicePixelRatio || 1, 2)
      if (
        element.width !== Math.round(width * ratio) ||
        element.height !== Math.round(height * ratio)
      ) {
        element.width = Math.round(width * ratio)
        element.height = Math.round(height * ratio)
      }
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
      refresh()
    }
    const observer = new ResizeObserver(resize)
    observer.observe(element)
    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      refresh()
    })
    intersection.observe(element)
    document.addEventListener('visibilitychange', refresh)
    resize()
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      intersection.disconnect()
      document.removeEventListener('visibilitychange', refresh)
    }
  }, [paint, playing, revision])
  return canvas
}

export function randomSequence(seed: number) {
  let value = seed | 0
  return () => {
    value = Math.imul(value ^ (value >>> 15), 1 | value)
    value ^= value + Math.imul(value ^ (value >>> 7), 61 | value)
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}
