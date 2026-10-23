import Link from 'next/link'
import Image from 'next/image'
import { tools } from '@/data/tools'
import { immersive } from '@/data/immersive'
import { experiments } from '@/data/experiments'
import { Arrow } from './Icons'

function Preview({ kind }: { kind: string }) {
  return (
    <svg viewBox="0 0 800 500" className={`experiment-preview preview-${kind}`} aria-hidden="true">
      {kind === 'flow-field' &&
        Array.from({ length: 68 }, (_, i) => (
          <path
            key={i}
            d={`M ${-150 + i * 15} 520 C ${600 - i * 7} ${280 - i * 2}, ${80 + i * 7} ${200 - i * 3}, ${850 - i * 11} -30`}
            fill="none"
            stroke="currentColor"
            strokeWidth={0.7 + (i % 3) * 0.25}
            opacity={0.25 + (i % 7) * 0.1}
          />
        ))}
      {kind === 'moire' &&
        [310, 490].map((x) => (
          <g key={x}>
            {Array.from({ length: 65 }, (_, i) => (
              <circle
                key={i}
                cx={x}
                cy={250}
                r={8 + i * 8}
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
              />
            ))}
          </g>
        ))}
      {kind === 'spring-grid' &&
        Array.from({ length: 15 * 10 }, (_, i) => {
          const x = 60 + (i % 15) * 48,
            y = 34 + Math.floor(i / 15) * 48
          const distance = Math.hypot(x - 400, y - 250),
            offset = Math.sin(distance / 55) * 22
          return (
            <circle
              key={i}
              cx={x + offset}
              cy={y + offset}
              r={3 + (1 - Math.min(distance / 500, 1)) * 7}
              fill="currentColor"
            />
          )
        })}
    </svg>
  )
}

function ToolPreview({ kind }: { kind: string }) {
  if (kind === 'flow-field' || kind === 'moire') return <Preview kind={kind} />
  if (kind === 'matter' || kind === 'pulse')
    return (
      <div className={`immersive-card-preview preview-${kind}`} aria-hidden="true">
        <Image
          src={`/assets/playground/${kind}-preview.webp`}
          alt=""
          fill
          sizes="(max-width: 600px) 100vw, (max-width: 1000px) 50vw, 33vw"
        />
        <span>
          {kind === 'matter'
            ? 'A study in light, form & feeling'
            : 'Four voices. Infinite detours.'}
        </span>
        <strong>
          {kind === 'matter' ? 'Matter' : 'Pulse'}
          <i>↗</i>
        </strong>
        <small>
          {kind === 'matter'
            ? 'Real-time 3D / Shape. Light. Capture.'
            : 'Audiovisual / Compose. Play. Export.'}
        </small>
      </div>
    )
  return (
    <div className={`tool-card-preview preview-${kind}`} aria-hidden="true">
      {kind === 'calculator' && (
        <div className="preview-calc-machine">
          <div>
            <small>sqrt(144) + 2³</small>
            <strong>
              20<span>↗</span>
            </strong>
          </div>
          <div className="preview-calc-keys">
            {[
              'sin',
              'cos',
              'tan',
              '÷',
              '7',
              '8',
              '9',
              '×',
              '4',
              '5',
              '6',
              '−',
              '1',
              '2',
              '3',
              '+',
              '0',
              '.',
              'π',
              '=',
            ].map((key, index) => (
              <i key={index}>{key}</i>
            ))}
          </div>
        </div>
      )}
      {kind === 'palette-studio' && (
        <div className="preview-palette">
          {['#4f5e50', '#9aab89', '#e2d8bd', '#c69a6c', '#8b4e3b', '#332a29'].map(
            (color, index) => (
              <span key={color} style={{ background: color }}>
                <small>0{index + 1}</small>
                <b>Aa</b>
              </span>
            ),
          )}
        </div>
      )}
      {kind === 'type-scale' && (
        <div className="preview-types">
          <small>A rhythm for your next idea.</small>
          <span>Aa</span>
          <b>Aa</b>
          <strong>Aa</strong>
          <em>1.250 / Major third</em>
        </div>
      )}
      {kind === 'focus-timer' && (
        <div className="preview-timer">
          <svg viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="80" fill="none" stroke="#25252528" />
            <circle
              cx="100"
              cy="100"
              r="80"
              fill="none"
              stroke="currentColor"
              strokeDasharray="400 103"
              transform="rotate(-90 100 100)"
            />
          </svg>
          <span>
            <small>A little room to focus</small>25:00<i>One thing at a time.</i>
          </span>
        </div>
      )}
      {kind === 'image-lab' && (
        <div className="preview-image">
          <span>FRAME / 1080 × 1350</span>
          <div>
            <i />
            <i />
            <i />
          </div>
          <small>Good things fit.</small>
        </div>
      )}
      {kind === 'motion-studio' && (
        <div className="preview-motion">
          <svg viewBox="0 0 400 300">
            <path d="M70 245H330 M70 245V45" stroke="#25252530" fill="none" />
            <path d="M70 245L125 230 M330 45L190 25" stroke="#25252555" fill="none" />
            <path d="M70 245C125 230 190 25 330 45" stroke="#252525" strokeWidth="3" fill="none" />
            <circle cx="125" cy="230" r="7" fill="#bd623b" />
            <circle cx="190" cy="25" r="7" fill="#5e7380" />
          </svg>
          <span>Find the in-between.</span>
        </div>
      )}
    </div>
  )
}

const featured = [...tools, ...immersive]

export default function Playground() {
  return (
    <section className="experiment-index" aria-label="Creative coding experiments">
      <div className="experiment-index-top">
        <span className="eyebrow">Useful curiosities / 001—008</span>
        <span className="eyebrow">Made to be played with</span>
      </div>
      <div className="experiment-cards">
        {featured.map((experiment, index) => (
          <Link
            className="experiment-card"
            key={experiment.slug}
            href={`/playground/${experiment.slug}`}
          >
            <div className="experiment-card-art">
              <ToolPreview kind={experiment.slug} />
              <span className="experiment-launch">
                Open experiment <Arrow />
              </span>
            </div>
            <div className="experiment-card-meta">
              <span className="eyebrow">
                {String(index + 1).padStart(2, '0')} / {experiment.medium}
              </span>
              <Arrow />
            </div>
            <h2>{experiment.title}</h2>
            <p>{experiment.description}</p>
          </Link>
        ))}
      </div>
      <p className="experiment-index-note">
        Eight independent instruments. Every experience runs in your browser, with nothing to sign
        up for. Bring a little curiosity. Take something useful away.
      </p>
      <nav className="experiment-archive" aria-label="Earlier visual studies">
        <span className="eyebrow">From the sketchbook</span>
        {experiments.map((experiment) => (
          <Link key={experiment.slug} href={`/playground/${experiment.slug}`}>
            {experiment.title}
            <span>↗</span>
          </Link>
        ))}
      </nav>
    </section>
  )
}
