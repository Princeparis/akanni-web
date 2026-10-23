'use client'
import { useRef, useState, type PointerEvent } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { CustomEase } from 'gsap/CustomEase'
import { CopyButton, reducedMotion } from './shared'
gsap.registerPlugin(CustomEase)
const presets = [
  { name: 'Smooth', points: [0.25, 0.1, 0.25, 1] },
  { name: 'Crisp', points: [0.76, 0, 0.24, 1] },
  { name: 'Gentle', points: [0.16, 1, 0.3, 1] },
  { name: 'Overshoot', points: [0.34, 1.5, 0.64, 1] },
  { name: 'Linear', points: [0, 0, 1, 1] },
]
export default function MotionStudio() {
  const root = useRef<HTMLDivElement>(null),
    track = useRef<HTMLDivElement>(null),
    ball = useRef<HTMLDivElement>(null),
    plot = useRef<SVGSVGElement>(null),
    preview = useRef<gsap.core.Tween | null>(null)
  const [points, setPoints] = useState([0.25, 0.1, 0.25, 1]),
    [duration, setDuration] = useState(1.4),
    [playing, setPlaying] = useState(false)
  const curve = points.map((value) => value.toFixed(2)).join(', '),
    css = `transition: transform ${duration}s cubic-bezier(${curve});`
  const code = `import { CustomEase } from 'gsap/CustomEase'\n\ngsap.registerPlugin(CustomEase)\ngsap.to(element, {\n  x: 300,\n  duration: ${duration},\n  ease: CustomEase.create('', '${curve}')\n})`
  const { contextSafe } = useGSAP(
    () => () => {
      preview.current?.kill()
    },
    { scope: root },
  )
  const play = contextSafe(() => {
    preview.current?.kill()
    setPlaying(true)
    preview.current = gsap.fromTo(
      ball.current,
      { x: 0, rotation: 0 },
      {
        x: Math.max(0, (track.current?.clientWidth ?? 400) - 84),
        rotation: 180,
        duration: reducedMotion() ? 0 : duration,
        ease: CustomEase.create('', curve),
        onComplete: () => setPlaying(false),
      },
    )
  })
  function update(index: number, value: number) {
    preview.current?.kill()
    setPlaying(false)
    setPoints((values) =>
      values.map((previous, position) => (position === index ? value : previous)),
    )
  }
  function drag(event: PointerEvent<SVGCircleElement>, index: number) {
    if (!event.currentTarget.hasPointerCapture(event.pointerId) || !plot.current) return
    const matrix = plot.current.getScreenCTM()
    if (!matrix) return
    const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse())
    const x = Math.max(0, Math.min(1, (point.x - 60) / 300)),
      y = Math.max(-0.5, Math.min(1.5, 1 - (point.y - 110) / 200))
    preview.current?.kill()
    setPlaying(false)
    setPoints((values) =>
      values.map((value, position) =>
        position === index
          ? Number(x.toFixed(2))
          : position === index + 1
            ? Number(y.toFixed(2))
            : value,
      ),
    )
  }
  const x1 = 60 + points[0] * 300,
    y1 = 310 - points[1] * 200,
    x2 = 60 + points[2] * 300,
    y2 = 310 - points[3] * 200
  return (
    <div className="motion-studio" ref={root}>
      <div className="motion-workbench">
        <section className="motion-plot" aria-label="Cubic Bézier curve">
          <div className="tool-panel-heading">
            <span>Shape the in-between</span>
            <span>Progress ↑ / Time →</span>
          </div>
          <svg ref={plot} viewBox="0 0 420 420" role="img" aria-label={`Easing curve ${curve}`}>
            {[0, 1, 2, 3, 4].map((index) => (
              <g key={index} stroke="#25252518" strokeWidth="1">
                <path d={`M60 ${110 + index * 50}H360 M${60 + index * 75} 110V310`} />
              </g>
            ))}
            <path
              d={`M60 310L${x1} ${y1} M360 110L${x2} ${y2}`}
              stroke="#25252555"
              fill="none"
              strokeWidth="1.5"
            />
            <path
              d={`M60 310 C${x1} ${y1} ${x2} ${y2} 360 110`}
              stroke="#252525"
              strokeWidth="3"
              fill="none"
            />
            <circle cx="60" cy="310" r="4" fill="#252525" />
            <circle cx="360" cy="110" r="4" fill="#252525" />
            {[
              { x: x1, y: y1, index: 0 },
              { x: x2, y: y2, index: 2 },
            ].map((point) => (
              <g key={point.index}>
                <circle
                  className="motion-handle"
                  cx={point.x}
                  cy={point.y}
                  r="22"
                  fill="transparent"
                  onPointerDown={(event) => event.currentTarget.setPointerCapture(event.pointerId)}
                  onPointerMove={(event) => drag(event, point.index)}
                />
                <circle
                  cx={point.x}
                  cy={point.y}
                  r="8"
                  fill={point.index === 0 ? '#bd623b' : '#5e7380'}
                  pointerEvents="none"
                />
              </g>
            ))}
            <text x="60" y="340" fontSize="10" fill="#777">
              0
            </text>
            <text x="354" y="340" fontSize="10" fill="#777">
              1
            </text>
          </svg>
          <p className="tool-small">
            Drag the colored handles, or use the sliders for precise values.
          </p>
        </section>
        <aside className="tool-settings">
          <span className="tool-eyebrow">Find a feeling</span>
          <div className="motion-presets">
            {presets.map((preset) => (
              <button
                key={preset.name}
                aria-pressed={preset.points.every((value, index) => value === points[index])}
                onClick={() => {
                  preview.current?.kill()
                  setPlaying(false)
                  setPoints([...preset.points])
                }}
              >
                {preset.name}
              </button>
            ))}
          </div>
          {['First handle X', 'First handle Y', 'Second handle X', 'Second handle Y'].map(
            (label, index) => (
              <label key={label}>
                {label}
                <output aria-hidden="true">{points[index].toFixed(2)}</output>
                <input
                  aria-label={label}
                  type="range"
                  min={index % 2 ? -0.5 : 0}
                  max={index % 2 ? 1.5 : 1}
                  step={0.01}
                  value={points[index]}
                  onChange={(event) => update(index, Number(event.target.value))}
                />
              </label>
            ),
          )}
          <label>
            Duration <output aria-hidden="true">{duration.toFixed(1)}s</output>
            <input
              aria-label="Animation duration"
              type="range"
              min={0.3}
              max={3}
              step={0.1}
              value={duration}
              onChange={(event) => setDuration(Number(event.target.value))}
            />
          </label>
          <button className="tool-button tool-button-dark" onClick={play}>
            {playing ? 'Restart preview' : 'Play movement'} ↗
          </button>
        </aside>
      </div>
      <div className="motion-preview" ref={track}>
        <div className="motion-ball" ref={ball}>
          <span>→</span>
        </div>
        <span className="motion-preview-label">Your curve, in motion.</span>
      </div>
      <div className="motion-exports">
        <div>
          <CopyButton value={css} />
          <pre tabIndex={0}>
            <code>{css}</code>
          </pre>
        </div>
        <div>
          <CopyButton value={code} label="Copy GSAP" />
          <pre tabIndex={0}>
            <code>{code}</code>
          </pre>
        </div>
      </div>
    </div>
  )
}
