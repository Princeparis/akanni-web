export type ContactCue = 'success' | 'error'

// Soft mallet tones: a major-triad rise for delivery, a shorter descent for failure.
// Shared with offline rendering so the actual sound can be checked without a speaker.
export function scheduleContactCue(
  context: BaseAudioContext,
  output: AudioNode,
  cue: ContactCue,
  when: number,
) {
  const notes =
    cue === 'success'
      ? [
          [261.626, 0, 0.64],
          [329.628, 0.15, 0.7],
          [391.995, 0.32, 0.94],
        ]
      : [
          [293.665, 0, 0.3],
          [220, 0.18, 0.42],
        ]
  const voices: OscillatorNode[] = []
  for (const [frequency, offset, duration] of notes) {
    const start = when + offset
    for (const [ratio, level, decay] of [
      [1, 0.15, 1],
      [2.002, 0.027, 0.55],
      [3.003, 0.006, 0.3],
    ]) {
      const oscillator = context.createOscillator()
      const envelope = context.createGain()
      const end = start + duration * decay
      oscillator.type = 'sine'
      oscillator.frequency.value = frequency * ratio
      envelope.gain.setValueAtTime(0, start)
      envelope.gain.linearRampToValueAtTime(level, start + 0.014)
      envelope.gain.exponentialRampToValueAtTime(0.0001, end)
      envelope.gain.linearRampToValueAtTime(0, end + 0.035)
      oscillator.connect(envelope)
      envelope.connect(output)
      oscillator.onended = () => {
        oscillator.disconnect()
        envelope.disconnect()
      }
      oscillator.start(start)
      oscillator.stop(end + 0.04)
      voices.push(oscillator)
    }
  }
  return voices
}

export class ContactAudio {
  private context: AudioContext | null = null
  private voices: OscillatorNode[] = []
  private enabled = true
  private disposed = false

  // Called synchronously from Send, before the network wait. Mobile browsers need
  // the user's gesture here, rather than an attempted unlock after fetch resolves.
  arm() {
    if (!this.enabled || this.disposed) return
    try {
      if (!this.context) {
        const Audio =
          window.AudioContext ||
          (window as typeof window & { webkitAudioContext?: typeof AudioContext })
            .webkitAudioContext
        if (!Audio) return
        this.context = new Audio({ latencyHint: 'interactive' })
      }
      if (this.context.state !== 'running') void this.context.resume().catch(() => {})
    } catch {
      // Audio is optional: device policy must never prevent a message from sending.
    }
  }

  play(cue: ContactCue) {
    const context = this.context
    if (!this.enabled || this.disposed || document.hidden || context?.state !== 'running') return
    this.stop()
    try {
      this.voices = scheduleContactCue(
        context,
        context.destination,
        cue,
        context.currentTime + 0.02,
      )
      const last = this.voices[cue === 'success' ? 6 : 3]
      last.addEventListener(
        'ended',
        () => {
          if (this.voices.includes(last)) {
            this.voices = []
            void context.suspend().catch(() => {})
          }
        },
        { once: true },
      )
    } catch {
      this.stop()
    }
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled
    if (!enabled) this.pause()
  }

  private stop() {
    const voices = this.voices
    this.voices = []
    for (const voice of voices) {
      try {
        voice.stop()
      } catch {
        /* Already ended. */
      }
    }
  }

  pause() {
    this.stop()
    if (this.context?.state === 'running') void this.context.suspend().catch(() => {})
  }

  dispose() {
    this.disposed = true
    this.stop()
    if (this.context && this.context.state !== 'closed') void this.context.close().catch(() => {})
    this.context = null
  }
}
