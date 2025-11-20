'use client'
import React, { useState, useEffect, useRef } from 'react'

const MusicToggle = (): React.JSX.Element => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [lottie, setLottie] = useState<any>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const lottieRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    import('lottie-web').then((lottieModule) => {
      setLottie(lottieModule.default)
    })
  }, [])

  useEffect(() => {
    if (!lottie || !containerRef.current) return

    const animation = lottie.loadAnimation({
      container: containerRef.current,
      renderer: 'svg',
      loop: true,
      autoplay: false,
      path: 'https://assets5.lottiefiles.com/packages/lf20_jJJl6i.json',
    })

    lottieRef.current = animation

    let cleanupAudio: (() => void) | undefined

    if (typeof window !== 'undefined') {
      audioRef.current = new Audio('/akanni.mp3')
      // ensure the audio will loop continuously until the user stops it
      audioRef.current.loop = true
      audioRef.current.preload = 'auto'

      // create handler and expose a cleanup reference so we can remove it on unmount
      const onEnded = () => {
        // If the audio ever ends (fallback or browser behavior), make sure UI reflects stopped state
        try {
          lottieRef.current?.stop()
        } catch (_e) {
          // ignore
        }
        // update state safely
        setIsPlaying(false)
      }

      audioRef.current.addEventListener('ended', onEnded)
      cleanupAudio = () => {
        audioRef.current?.removeEventListener('ended', onEnded)
      }
    }

    return () => {
      animation.destroy()
      if (audioRef.current) {
        audioRef.current.pause()
        if (cleanupAudio) cleanupAudio()
        audioRef.current = null
      }
    }
  }, [lottie])

  const toggleMusic = () => {
    if (!audioRef.current || !lottieRef.current) return

    if (!isPlaying) {
      const p = audioRef.current.play()
      // play() returns a promise in some browsers; ignore errors from autoplay policies
      if (p && typeof p.catch === 'function') p.catch(() => {})

      // start the lottie animation (use play so it respects the `loop: true` setting)
      try {
        lottieRef.current.play()
      } catch (_e) {
        // fallback to playing a segment if needed
        try {
          lottieRef.current.playSegments([0, 120], true)
        } catch (_err) {
          // ignore
        }
      }
    } else {
      audioRef.current.pause()
      // pause audio and the lottie animation; keep the current frame
      lottieRef.current.pause()
    }
    setIsPlaying(!isPlaying)
  }

  return (
    <div className="music-toggle">
      <div className="music-toggle-btn" onClick={toggleMusic}>
        <div ref={containerRef} className="sound-bars" style={{ width: '20px', height: '20px' }} />
      </div>
    </div>
  )
}

// export default dynamic(() => Promise.resolve(MusicToggle), {
//   ssr: false,
// });

export default MusicToggle
