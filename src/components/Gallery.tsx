'use client'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { useLenis } from 'lenis/react'
const images = Array.from({ length: 15 }, (_, index) => `/assets/img${index + 1}.jpeg`)
export default function Gallery() {
  const [selected, setSelected] = useState<number | null>(null)
  const dialog = useRef<HTMLDialogElement>(null)
  const opener = useRef<HTMLButtonElement | null>(null)
  const lenis = useLenis()
  useEffect(() => {
    if (selected !== null) {
      dialog.current?.showModal()
      lenis?.stop()
    } else {
      dialog.current?.close()
      lenis?.start()
    }
    return () => {
      lenis?.start()
    }
  }, [selected, lenis])
  useGSAP(
    () => {
      if (selected === null || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
      gsap.fromTo(
        '.gallery-full-image',
        { opacity: 0, scale: 0.97 },
        { opacity: 1, scale: 1, duration: 0.45, ease: 'power3.out' },
      )
    },
    { scope: dialog, dependencies: [selected], revertOnUpdate: true },
  )
  const step = (direction: number) =>
    setSelected((current) =>
      current === null ? null : (current + direction + images.length) % images.length,
    )
  return (
    <>
      <div className="gallery-grid">
        {images.map((image, index) => (
          <button
            key={image}
            className="gallery-item"
            aria-label={`Open visual diary image ${index + 1}`}
            onClick={(event) => {
              opener.current = event.currentTarget
              setSelected(index)
            }}
          >
            <Image
              src={image}
              alt={`Visual study ${String(index + 1).padStart(2, '0')} from Akanni’s photography collection`}
              width={750}
              height={1000}
              sizes="(max-width: 760px) 50vw, 33vw"
              style={{ height: 'auto' }}
            />
            <span aria-hidden="true">↗</span>
          </button>
        ))}
      </div>
      <dialog
        className="gallery-dialog"
        ref={dialog}
        aria-label="Visual diary image viewer"
        onCancel={() => setSelected(null)}
        onClose={() => {
          setSelected(null)
          opener.current?.focus()
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) setSelected(null)
        }}
        onKeyDown={(event) => {
          if (event.key === 'ArrowRight') {
            event.preventDefault()
            step(1)
          }
          if (event.key === 'ArrowLeft') {
            event.preventDefault()
            step(-1)
          }
        }}
      >
        <div className="gallery-dialog-top">
          <span className="eyebrow">A frame from my world</span>
          <button
            className="round-button"
            aria-label="Close image viewer"
            onClick={() => setSelected(null)}
          >
            ×
          </button>
        </div>
        {selected !== null && (
          <Image
            width={1600}
            height={1200}
            sizes="95vw"
            className="gallery-full-image"
            src={images[selected]}
            alt={`Visual study ${selected + 1}`}
          />
        )}
        <div className="gallery-controls">
          <button className="round-button" aria-label="Previous image" onClick={() => step(-1)}>
            ←
          </button>
          <span aria-live="polite">
            {selected === null ? '01' : String(selected + 1).padStart(2, '0')} / 15
          </span>
          <button className="round-button" aria-label="Next image" onClick={() => step(1)}>
            →
          </button>
        </div>
      </dialog>
    </>
  )
}
