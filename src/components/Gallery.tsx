'use client'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { useLenis } from 'lenis/react'
import { galleryImages as images } from '@/data/gallery'
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
            key={image.src}
            className="gallery-item"
            aria-label={`Open visual diary image ${index + 1}`}
            onClick={(event) => {
              opener.current = event.currentTarget
              setSelected(index)
            }}
          >
            <Image
              src={image.src}
              alt={image.alt}
              width={image.width}
              height={image.height}
              sizes="(max-width: 760px) 50vw, 33vw"
              style={{ height: 'auto' }}
            />
            <span className="gallery-open" aria-hidden="true">
              ↗
            </span>
            {image.generated && (
              <small className="gallery-generated-label">
                {image.title.split(' /')[0]} / Generated study
              </small>
            )}
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
          <span className="eyebrow">
            {selected === null ? 'A frame from my world' : images[selected].title}
          </span>
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
            width={images[selected].width}
            height={images[selected].height}
            sizes="95vw"
            className="gallery-full-image"
            src={images[selected].src}
            alt={images[selected].alt}
          />
        )}
        <div className="gallery-controls">
          <button className="round-button" aria-label="Previous image" onClick={() => step(-1)}>
            ←
          </button>
          <span aria-live="polite">
            {selected === null ? '01' : String(selected + 1).padStart(2, '0')} / {images.length}
          </span>
          <button className="round-button" aria-label="Next image" onClick={() => step(1)}>
            →
          </button>
        </div>
      </dialog>
    </>
  )
}
