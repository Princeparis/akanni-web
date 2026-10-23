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
          Useful tools. Unexpected interactions. From a precise little calculator to a sculpture you
          can shape, light you can bend, and words you can pull into the wind. Ten independent
          projects, made to be used.
        </p>
      </div>
      <Playground />
    </main>
  )
}
