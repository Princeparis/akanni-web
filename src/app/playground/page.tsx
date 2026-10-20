import type { Metadata } from 'next'
import Playground from '@/components/Playground'
export const metadata: Metadata = {
  title: 'Playground',
  description: 'A space for interaction, curiosity, and creative experiments.',
}
export default function PlaygroundPage() {
  return (
    <main id="main">
      <div className="page-intro">
        <span className="eyebrow">A little room for curiosity</span>
        <h1>
          Serious about
          <br />
          <em>play.</em>
        </h1>
        <p>
          I believe in continuous learning and exploring new technologies. Here’s a little space to
          try things, turn things, and see what happens.
        </p>
      </div>
      <Playground />
    </main>
  )
}
