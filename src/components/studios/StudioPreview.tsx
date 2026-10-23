import Image from 'next/image'
import type { StudioSlug } from '@/data/studios'
import './studio-preview.css'

export default function StudioPreview({ kind }: { kind: StudioSlug }) {
  return (
    <div className={`new-studio-preview new-preview-${kind}`} aria-hidden="true">
      <Image
        src={`/assets/playground/${kind}-preview.webp`}
        alt=""
        fill
        sizes="(max-width: 600px) 100vw, (max-width: 1000px) 50vw, 33vw"
      />
      <span>
        {kind === 'caustic'
          ? 'Nothing here is solid. Including the light.'
          : 'Give a word some weight.'}
      </span>
      <strong>
        {kind === 'caustic' ? 'Caustic' : 'Loom'}
        <i>↗</i>
      </strong>
      <small>
        {kind === 'caustic'
          ? 'Liquid light / Disturb. Refract. Capture.'
          : 'Typographic fabric / Grab. Pull. Let go.'}
      </small>
    </div>
  )
}
