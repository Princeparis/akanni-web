import type { SVGProps } from 'react'

export function Arrow({ className = '', ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M5 19 19 5M5 5h14v14"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function Asterisk({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" aria-hidden="true">
      <path
        d="M50 0v100M0 50h100M14.65 14.65l70.7 70.7m0-70.7-70.7 70.7"
        stroke="currentColor"
        strokeWidth="9"
      />
    </svg>
  )
}
