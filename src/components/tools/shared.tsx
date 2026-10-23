'use client'
import { useState } from 'react'
export function CopyButton({ value, label = 'Copy CSS' }: { value: string; label?: string }) {
  const [status, setStatus] = useState('')
  return (
    <div className="tool-copy">
      <button
        className="tool-button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(value)
            setStatus('Copied to clipboard.')
          } catch {
            setStatus('Copy is unavailable here. Select the code below instead.')
          }
        }}
      >
        {label} ↗
      </button>
      <span role="status">{status}</span>
    </div>
  )
}
export function downloadText(value: string, filename: string, type = 'text/plain') {
  const url = URL.createObjectURL(new Blob([value], { type }))
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
export function reducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
