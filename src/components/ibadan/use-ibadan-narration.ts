'use client'

import { useEffect, useRef, useState } from 'react'

function voiceRank(voice: SpeechSynthesisVoice) {
  if (/en[-_]NG/i.test(voice.lang)) return 100
  if (/en[-_](ZA|KE|GH)/i.test(voice.lang)) return 80
  if (/en[-_]GB/i.test(voice.lang)) return 40
  return /^en/i.test(voice.lang) ? 20 : 0
}

export function useIbadanNarration(text: string, onSpeaking: (speaking: boolean) => void) {
  const [supported, setSupported] = useState(false)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [voiceName, setVoiceName] = useState('')
  const [enabled, setEnabled] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const [notice, setNotice] = useState('')
  const generation = useRef({ value: 0 })
  const [replay, setReplay] = useState(0)
  const speakingCallback = useRef(onSpeaking)
  speakingCallback.current = onSpeaking

  useEffect(() => {
    const run = generation.current
    if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) return
    setSupported(true)
    const refresh = () =>
      setVoices(
        speechSynthesis
          .getVoices()
          .filter((voice) => /^en/i.test(voice.lang))
          .sort((a, b) => voiceRank(b) - voiceRank(a)),
      )
    refresh()
    speechSynthesis.addEventListener('voiceschanged', refresh)
    const hide = () => {
      if (document.hidden) {
        setEnabled(false)
        speechSynthesis.cancel()
      }
    }
    document.addEventListener('visibilitychange', hide)
    return () => {
      run.value++
      speechSynthesis.removeEventListener('voiceschanged', refresh)
      document.removeEventListener('visibilitychange', hide)
      speechSynthesis.cancel()
      speakingCallback.current(false)
    }
  }, [])

  useEffect(() => {
    const run = generation.current
    if (!supported || !enabled) {
      if (supported) speechSynthesis.cancel()
      setSpeaking(false)
      speakingCallback.current(false)
      return
    }
    const token = ++run.value
    speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    const voice = voices.find((candidate) => candidate.name === voiceName) || voices[0]
    if (voice) {
      utterance.voice = voice
      utterance.lang = voice.lang
    } else utterance.lang = 'en-GB'
    utterance.rate = 0.91
    utterance.volume = 0.9
    utterance.onstart = () => {
      if (token === run.value) {
        setSpeaking(true)
        speakingCallback.current(true)
      }
    }
    utterance.onend = () => {
      if (token === run.value) {
        setSpeaking(false)
        speakingCallback.current(false)
      }
    }
    utterance.onerror = (event) => {
      if (token !== run.value || event.error === 'canceled' || event.error === 'interrupted') return
      setSpeaking(false)
      setEnabled(false)
      speakingCallback.current(false)
      setNotice(
        'This device could not provide a narration voice. The full transcript is available in Read mode.',
      )
    }
    speechSynthesis.speak(utterance)
    return () => {
      run.value++
      speechSynthesis.cancel()
      speakingCallback.current(false)
    }
  }, [text, enabled, supported, voiceName, voices, replay])

  return {
    supported,
    voices,
    voiceName,
    enabled,
    speaking,
    notice,
    selectVoice: setVoiceName,
    dismiss: () => setNotice(''),
    play: () => {
      setNotice('')
      setEnabled(true)
      setReplay((value) => value + 1)
    },
    stop: () => setEnabled(false),
  }
}
