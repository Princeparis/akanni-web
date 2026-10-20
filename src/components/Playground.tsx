import Link from 'next/link'
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

export default function Playground() {
  return (
    <section className="experiment-index" aria-label="Creative coding experiments">
      <div className="experiment-index-top">
        <span className="eyebrow">Open experiments / 001—003</span>
        <span className="eyebrow">Made to be played with</span>
      </div>
      <div className="experiment-cards">
        {experiments.map((experiment) => (
          <Link
            className="experiment-card"
            key={experiment.slug}
            href={`/playground/${experiment.slug}`}
          >
            <div className="experiment-card-art">
              <Preview kind={experiment.slug} />
              <span className="experiment-launch">
                Open experiment <Arrow />
              </span>
            </div>
            <div className="experiment-card-meta">
              <span className="eyebrow">
                {experiment.number} / {experiment.medium}
              </span>
              <Arrow />
            </div>
            <h2>{experiment.title}</h2>
            <p>{experiment.description}</p>
          </Link>
        ))}
      </div>
      <p className="experiment-index-note">
        Independent studies in code, perception, and playful systems. Every experiment runs in your
        browser. No account, no uploads, just curiosity.
      </p>
    </section>
  )
}
