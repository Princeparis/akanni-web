import React, { useEffect, useRef } from 'react'

// @ts-ignore: allow side-effect CSS import without type declarations
import './Video.css'

function Video(): React.JSX.Element {
  const ref = useRef<HTMLVideoElement | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Ensure inline play attributes are present for iOS Safari and other browsers
    // that prefer lowercase attributes.
    try {
      el.setAttribute('playsinline', '')
      el.setAttribute('webkit-playsinline', '')
    } catch (e) {
      // ignore
    }

    // Some mobile browsers require a short user interaction to allow autoplay
    // with sound; we keep muted so autoplay is allowed. Do not call play()
    // here to avoid stealing focus or triggering fullscreen.
  }, [])

  return (
    <div className="vid-cont">
      <video
        ref={ref}
        loop
        preload="auto"
        autoPlay
        muted
        playsInline
        className="vid"
        aria-hidden="true"
        tabIndex={-1}
      >
        <source src="/bg.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  )
}

export default Video
