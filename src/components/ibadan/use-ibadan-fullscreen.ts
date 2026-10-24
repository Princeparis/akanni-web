'use client'

import { useCallback, useEffect, useState, type RefObject } from 'react'

type FullscreenElement = HTMLElement & { webkitRequestFullscreen?: () => void | Promise<void> }
type FullscreenDocument = Document & {
  webkitFullscreenElement?: Element | null
  webkitExitFullscreen?: () => void | Promise<void>
}

const currentElement = () => {
  const documentWithPrefix = document as FullscreenDocument
  return document.fullscreenElement || documentWithPrefix.webkitFullscreenElement
}

async function leaveFullscreen() {
  const documentWithPrefix = document as FullscreenDocument
  if (document.exitFullscreen) await document.exitFullscreen()
  else await documentWithPrefix.webkitExitFullscreen?.()
}

export function useIbadanFullscreen(root: RefObject<HTMLElement | null>) {
  const [supported, setSupported] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const [notice, setNotice] = useState('')

  useEffect(() => {
    const element = root.current as FullscreenElement | null
    setSupported(Boolean(element?.requestFullscreen || element?.webkitRequestFullscreen))
    const update = () => setFullscreen(currentElement() === element)
    update()
    document.addEventListener('fullscreenchange', update)
    document.addEventListener('webkitfullscreenchange', update)
    return () => {
      document.removeEventListener('fullscreenchange', update)
      document.removeEventListener('webkitfullscreenchange', update)
      if (element && currentElement() === element) void leaveFullscreen().catch(() => {})
    }
  }, [root])

  const enter = useCallback(async () => {
    const element = root.current as FullscreenElement | null
    if (!element || currentElement() === element) return
    setNotice('')
    try {
      if (element.requestFullscreen) await element.requestFullscreen()
      else if (element.webkitRequestFullscreen) await element.webkitRequestFullscreen()
      // Browsers without an element fullscreen API retain the full-viewport layout.
    } catch {
      setNotice(
        'Your browser could not enter fullscreen. The journey still fills this window; use the fullscreen control to try again.',
      )
    }
  }, [root])

  const toggle = useCallback(async () => {
    if (currentElement() !== root.current) return enter()
    setNotice('')
    try {
      await leaveFullscreen()
    } catch {
      setNotice(
        'Fullscreen could not close. Press Esc or use your browser’s exit fullscreen control.',
      )
    }
  }, [enter, root])

  return { supported, fullscreen, enter, toggle, notice, dismiss: () => setNotice('') }
}
