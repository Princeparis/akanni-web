// Rayab artwork supplied by the owner. Master SVG files are preserved in public/brand/rayab/.
// Tight viewboxes remove export padding without changing any paths or accent geometry.
// Foregrounds inherit the surface ink; the lime accent can become monochrome on light surfaces.
export function BrandMark({ className = '' }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      data-brand="rayab"
      data-variant="icon"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="160 64 288 384"
      fill="none"
    >
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M176 64h96v170c18-52 77-90 150-90h26v96h-86c-45 0-77 10-96 29-19 19-28 49-28 90v89h-62V360h-16V64Zm38 320h26v64h-26z"
      />
      <rect fill="var(--brand-accent, #dfff17)" x="240" y="384" width="34" height="34" />
    </svg>
  )
}
export function BrandWordmark({ className = '' }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      data-brand="rayab"
      data-variant="wordmark"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="80 120 1494 280"
      fill="none"
    >
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M80 120h240l40 40v110l-42 42 46 48v40H240v-88h38l14-14v-48l-14-14H148v164H80V120Zm66 66v48h106l12-12v-24l-12-12H146Z"
      />
      <rect fill="var(--brand-accent, #dfff17)" x="162" y="197" width="86" height="30" rx="1" />
      <path
        fill="currentColor"
        d="M410 400V322l180-202h130v280h-68V340H522v60h-112Zm112-126h130V188h-54L522 274Z"
      />
      <path fill="currentColor" d="M746 120h84l72 76 72-76h84L938 250v150h-72V250L746 120Z" />
      <path
        fill="currentColor"
        d="M1032 400V322l180-202h130v280h-68V340h-130v60h-112Zm112-126h130V188h-54l-76 86Z"
      />
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M1360 120h170l40 40v70l-20 20 24 24v86l-40 40h-174V120Zm68 66v46h84l10-10v-26l-10-10h-84Zm0 112v46h88l10-10v-26l-10-10h-88Z"
      />
    </svg>
  )
}
