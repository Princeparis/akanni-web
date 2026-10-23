'use client'
import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { reducedMotion } from './shared'
export default function ImageLab() {
  const root = useRef<HTMLDivElement>(null),
    canvas = useRef<HTMLCanvasElement>(null),
    fileInput = useRef<HTMLInputElement>(null)
  const [source, setSource] = useState({ url: '/assets/img1.jpeg', name: 'visual-study' })
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const [width, setWidth] = useState('1080'),
    [height, setHeight] = useState('1350'),
    [locked, setLocked] = useState(false)
  const [fit, setFit] = useState('cover'),
    [format, setFormat] = useState('image/webp'),
    [quality, setQuality] = useState(85)
  const [background, setBackground] = useState('#eeece6'),
    [transparent, setTransparent] = useState(false),
    [error, setError] = useState(''),
    [status, setStatus] = useState('')
  const w = Number(width),
    h = Number(height),
    valid =
      Number.isInteger(w) && Number.isInteger(h) && w >= 32 && w <= 4096 && h >= 32 && h <= 4096
  useEffect(() => {
    let active = true
    setImage(null)
    const picture = new Image()
    picture.onload = () => {
      if (!active) return
      if (picture.naturalWidth * picture.naturalHeight > 50_000_000) {
        setError('Choose an image under 50 megapixels.')
        return
      }
      setImage(picture)
      setError('')
      setStatus('')
    }
    picture.onerror = () => {
      if (active) setError('This image could not be decoded. Try PNG, JPEG, WebP, or AVIF.')
    }
    picture.src = source.url
    return () => {
      active = false
      if (source.url.startsWith('blob:')) URL.revokeObjectURL(source.url)
    }
  }, [source])
  useEffect(() => {
    const context = canvas.current?.getContext('2d')
    if (!context || !image || !valid || !canvas.current) return
    canvas.current.width = w
    canvas.current.height = h
    context.imageSmoothingEnabled = true
    context.imageSmoothingQuality = 'high'
    if (!transparent || format === 'image/jpeg') {
      context.fillStyle = background
      context.fillRect(0, 0, w, h)
    }
    const scale =
      fit === 'cover'
        ? Math.max(w / image.naturalWidth, h / image.naturalHeight)
        : Math.min(w / image.naturalWidth, h / image.naturalHeight)
    const dw = image.naturalWidth * scale,
      dh = image.naturalHeight * scale
    context.drawImage(image, (w - dw) / 2, (h - dh) / 2, dw, dh)
  }, [image, w, h, fit, format, background, transparent, valid])
  useGSAP(
    () => {
      if (image && !reducedMotion())
        gsap.fromTo(
          canvas.current,
          { opacity: 0, scale: 0.98 },
          { opacity: 1, scale: 1, duration: 0.6, ease: 'power3.out' },
        )
    },
    { scope: root, dependencies: [image], revertOnUpdate: true },
  )
  function load(file?: File) {
    if (!file) return
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/avif'].includes(file.type)) {
      setError('Choose a PNG, JPEG, WebP, or AVIF image.')
      return
    }
    if (file.size > 20 * 1024 * 1024) {
      setError('Choose an image smaller than 20 MB.')
      return
    }
    setSource({ url: URL.createObjectURL(file), name: file.name.replace(/\.[^.]+$/, '') })
    setLocked(false)
  }
  function dimension(event: ChangeEvent<HTMLInputElement>, axis: 'width' | 'height') {
    const value = event.target.value
    if (axis === 'width') setWidth(value)
    else setHeight(value)
    if (locked && image && Number(value) > 0) {
      if (axis === 'width')
        setHeight(String(Math.round((Number(value) * image.naturalHeight) / image.naturalWidth)))
      else setWidth(String(Math.round((Number(value) * image.naturalWidth) / image.naturalHeight)))
    }
  }
  function exportImage() {
    if (!canvas.current || !valid || !image) return
    canvas.current.toBlob(
      (blob) => {
        if (!blob || blob.type !== format) {
          setError('That export format is unavailable. Please choose PNG.')
          return
        }
        const extension = format === 'image/jpeg' ? 'jpg' : format.split('/')[1]
        const url = URL.createObjectURL(blob),
          anchor = document.createElement('a')
        anchor.href = url
        anchor.download = `${source.name}-${w}x${h}.${extension}`
        anchor.click()
        setTimeout(() => URL.revokeObjectURL(url), 1000)
        setStatus(
          `Exported ${w} × ${h} ${extension.toUpperCase()} · ${(blob.size / 1024).toFixed(0)} KB`,
        )
      },
      format,
      quality / 100,
    )
  }
  return (
    <div className="image-lab-layout" ref={root}>
      <section
        className="image-stage"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault()
          load(event.dataTransfer.files[0])
        }}
      >
        <div className="image-stage-top">
          <span>
            {image ? `${image.naturalWidth} × ${image.naturalHeight} source` : 'Opening image…'}
          </span>
          <span>Drop an image here ↙</span>
        </div>
        <div className="image-preview">
          <canvas ref={canvas} aria-label="Output image preview" />
        </div>
        <div className="image-stage-bottom">
          <span>{valid ? `${w} × ${h}` : 'Check dimensions'}</span>
          <span>
            {fit === 'cover' ? 'Fill & crop' : 'Whole image'} / {format.split('/')[1].toUpperCase()}
          </span>
        </div>
      </section>
      <aside className="tool-settings image-settings">
        <span className="tool-eyebrow">Make it fit</span>
        <input
          ref={fileInput}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/avif"
          className="sr-only"
          aria-label="Upload image"
          onChange={(event) => {
            load(event.target.files?.[0])
            event.target.value = ''
          }}
        />
        <button className="tool-button" onClick={() => fileInput.current?.click()}>
          Choose your image ↗
        </button>
        <div className="image-presets">
          {[
            [1080, 1080, 'Square'],
            [1080, 1350, 'Portrait'],
            [1600, 900, 'Wide'],
          ].map(([pw, ph, label]) => (
            <button
              key={label}
              onClick={() => {
                setWidth(String(pw))
                setHeight(String(ph))
                setLocked(false)
              }}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="tool-two-fields">
          <label>
            Width, px
            <input
              type="number"
              min={32}
              max={4096}
              value={width}
              onChange={(event) => dimension(event, 'width')}
            />
          </label>
          <label>
            Height, px
            <input
              type="number"
              min={32}
              max={4096}
              value={height}
              onChange={(event) => dimension(event, 'height')}
            />
          </label>
        </div>
        <label className="tool-check">
          <input
            type="checkbox"
            checked={locked}
            onChange={(event) => {
              setLocked(event.target.checked)
              if (event.target.checked && image)
                setHeight(String(Math.round((w * image.naturalHeight) / image.naturalWidth)))
            }}
          />
          Lock source proportions
        </label>
        <div className="tool-two-fields">
          <label>
            Fit
            <select value={fit} onChange={(event) => setFit(event.target.value)}>
              <option value="cover">Cover / crop</option>
              <option value="contain">Contain / whole</option>
            </select>
          </label>
          <label>
            Format
            <select value={format} onChange={(event) => setFormat(event.target.value)}>
              <option value="image/webp">WebP</option>
              <option value="image/jpeg">JPEG</option>
              <option value="image/png">PNG</option>
            </select>
          </label>
        </div>
        <label>
          Quality <output aria-hidden="true">{quality}%</output>
          <input
            aria-label="Export quality"
            type="range"
            min={40}
            max={100}
            value={quality}
            disabled={format === 'image/png'}
            onChange={(event) => setQuality(Number(event.target.value))}
          />
        </label>
        <label className="image-background">
          Matte color
          <input
            type="color"
            value={background}
            onChange={(event) => setBackground(event.target.value)}
          />
        </label>
        {format !== 'image/jpeg' && (
          <label className="tool-check">
            <input
              type="checkbox"
              checked={transparent}
              onChange={(event) => setTransparent(event.target.checked)}
            />
            Transparent padding
          </label>
        )}
        <button
          className="tool-button tool-button-dark"
          disabled={!valid || !image}
          onClick={exportImage}
        >
          Export image ↓
        </button>
        <p className="tool-error" role="alert">
          {error || (!valid ? 'Use whole-number dimensions from 32 to 4096px.' : '')}
        </p>
        <p className="tool-status" role="status">
          {status}
        </p>
        <p className="tool-small">
          PNG, JPEG, WebP, AVIF · Up to 20 MB.
          <br />
          Your image stays on this device.
        </p>
      </aside>
    </div>
  )
}
