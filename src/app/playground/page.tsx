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
          Independent creative coding studies. Explore a vector field, get lost in optical
          interference, or disturb a spring system. Open an experiment and make it your own.
        </p>
      </div>
      <Playground />
    </main>
  )
}
