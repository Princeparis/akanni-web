import type { StudioSlug } from '@/data/studios'

// The live instrument and its downloadable source use the same vanilla files.
// An isolated document also keeps the eight existing instruments' styles intact.
export default function StudioExperiment({ slug, title }: { slug: StudioSlug; title: string }) {
  return (
    <main id="main" style={{ height: '100svh', overflow: 'hidden' }}>
      <h1
        style={{
          position: 'absolute',
          width: 1,
          height: 1,
          overflow: 'hidden',
          clipPath: 'inset(50%)',
        }}
      >
        {title}
      </h1>
      <iframe
        src={`/experiments/${slug}/index.html`}
        title={`${title} interactive studio`}
        allow="fullscreen"
        allowFullScreen
        style={{ display: 'block', border: 0, width: '100%', height: '100%' }}
      />
    </main>
  )
}
