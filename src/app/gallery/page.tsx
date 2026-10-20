import type { Metadata } from 'next'
import Gallery from '@/components/Gallery'
export const metadata: Metadata = {
  title: 'Visual diary',
  description: 'Photography, visual experiments, and creative detours by Akanni.',
}
export default function GalleryPage() {
  return (
    <main id="main">
      <div className="page-intro">
        <span className="eyebrow">A visual diary / 15 frames</span>
        <h1>
          The way
          <br />
          <em>I see things.</em>
        </h1>
        <p>
          Photography, experiments, and creative detours. A collection of moments that caught my
          eye.
        </p>
      </div>
      <Gallery />
    </main>
  )
}
