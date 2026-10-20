import MagneticLink from '@/components/MagneticLink'
export default function NotFound() {
  return (
    <main id="main" className="not-found">
      <span className="eyebrow">404 / A creative detour</span>
      <h1>
        A little
        <br />
        <em>off the canvas.</em>
      </h1>
      <p>This page isn’t here. There’s plenty to explore back at the studio.</p>
      <MagneticLink href="/">Back to the homepage</MagneticLink>
    </main>
  )
}
