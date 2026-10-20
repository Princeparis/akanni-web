import type { Metadata } from 'next'
import ProjectGrid from '@/components/ProjectGrid'
export const metadata: Metadata = {
  title: 'Selected work',
  description: 'Product design, brand identities, and websites by Yusuff Ridwan Akanni.',
}
export default function Portfolio() {
  return (
    <main id="main">
      <div className="page-intro">
        <span className="eyebrow">The work / 01—07</span>
        <h1>
          Ideas, out
          <br />
          <em>in the world.</em>
        </h1>
        <p>
          A selection of products, identities, and digital experiences. Independent thinking.
          Collaborative making.
        </p>
      </div>
      <section className="archive-section" aria-label="Project archive">
        <ProjectGrid archive />
      </section>
    </main>
  )
}
