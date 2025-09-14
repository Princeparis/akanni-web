// components/SmoothScrolling.tsx
'use client'
import { ReactLenis } from 'lenis/react'
import { ReactNode } from 'react'

interface SmoothScrollProps {
  children: ReactNode
}

function SmoothScroll({ children }: SmoothScrollProps): React.JSX.Element {
  return (
    <ReactLenis root options={{ lerp: 0.1, duration: 1.5 }}>
      {children}
    </ReactLenis>
  )
}

export default SmoothScroll
