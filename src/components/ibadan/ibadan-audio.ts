// Original synthetic ambience, not an archival or traditional performance.
export class IbadanAudio {
  private context: AudioContext | null = null
  private master: GainNode | null = null
  private tones: OscillatorNode[] = []
  private nodes: AudioNode[] = []
  private noise: AudioBufferSourceNode | null = null
  private timer: ReturnType<typeof setTimeout> | undefined
  private disposed = false
  private wanted = false
  private chapter = 0

  async start() {
    if (this.disposed) return false
    this.wanted = true
    clearTimeout(this.timer)
    try {
      if (!this.context) {
        const Audio =
          window.AudioContext ||
          (window as typeof window & { webkitAudioContext?: typeof AudioContext })
            .webkitAudioContext
        if (!Audio) return false
        const context = (this.context = new Audio({ latencyHint: 'playback' }))
        const master = (this.master = context.createGain())
        master.gain.value = 0
        master.connect(context.destination)
        for (let i = 0; i < 5; i++) {
          const tone = context.createOscillator()
          const gain = context.createGain()
          tone.type = 'sine'
          tone.frequency.value = 73.416 * [1, 1.5, 2.002, 3, 4.003][i]
          gain.gain.value = [0.06, 0.045, 0.023, 0.013, 0.009][i]
          tone.connect(gain)
          gain.connect(master)
          tone.start()
          this.tones.push(tone)
          this.nodes.push(gain)
        }
        const buffer = context.createBuffer(1, context.sampleRate * 6, context.sampleRate)
        const samples = buffer.getChannelData(0)
        let previous = 0,
          seed = 1829
        for (let i = 0; i < samples.length; i++) {
          seed = (Math.imul(seed, 1664525) + 1013904223) | 0
          previous = (previous + ((seed >>> 0) / 2147483648 - 1) * 0.015) / 1.015
          samples[i] = previous * 3
        }
        // Crossfade the loop seam so the atmosphere never clicks.
        const fade = context.sampleRate / 5
        for (let i = 0; i < fade; i++) {
          const mix = i / fade
          samples[i] = samples[i] * mix + samples[samples.length - fade + i] * (1 - mix)
        }
        const noise = (this.noise = context.createBufferSource())
        noise.buffer = buffer
        noise.loop = true
        // The overlapping end segment is already blended into the start.
        noise.loopEnd = (samples.length - fade) / context.sampleRate
        const filter = context.createBiquadFilter()
        filter.type = 'lowpass'
        filter.frequency.value = 520
        const wind = context.createGain()
        wind.gain.value = 0.055
        noise.connect(filter)
        filter.connect(wind)
        wind.connect(master)
        noise.start()
        this.nodes.push(filter, wind)
        this.setChapter(this.chapter)
      }
      await this.context.resume()
      if (this.disposed || !this.wanted || document.hidden) {
        this.pause()
        return false
      }
      const gain = this.master!.gain,
        now = this.context.currentTime
      gain.cancelScheduledValues(now)
      gain.setValueAtTime(gain.value, now)
      gain.linearRampToValueAtTime(0.65, now + 1.8)
      return this.context.state === 'running'
    } catch {
      return false
    }
  }

  setChapter(chapter: number) {
    this.chapter = chapter
    if (!this.context) return
    const base = [73.416, 82.407, 73.416, 65.406, 73.416, 82.407, 97.999, 87.307][chapter % 8]
    this.tones.forEach((tone, i) =>
      tone.frequency.setTargetAtTime(
        base * [1, 1.5, 2.002, 3, 4.003][i],
        this.context!.currentTime,
        1.8,
      ),
    )
  }

  pause() {
    clearTimeout(this.timer)
    if (!this.context || !this.master || this.context.state !== 'running') return
    const context = this.context,
      now = context.currentTime
    this.master.gain.cancelScheduledValues(now)
    this.master.gain.setValueAtTime(this.master.gain.value, now)
    this.master.gain.linearRampToValueAtTime(0, now + 0.35)
    this.timer = setTimeout(() => {
      void context.suspend().catch(() => {})
    }, 400)
  }

  stop() {
    this.wanted = false
    this.pause()
  }

  dispose() {
    this.disposed = true
    this.wanted = false
    clearTimeout(this.timer)
    this.tones.forEach((tone) => {
      try {
        tone.stop()
        tone.disconnect()
      } catch {
        /* Ended. */
      }
    })
    try {
      this.noise?.stop()
      this.noise?.disconnect()
    } catch {
      /* Ended. */
    }
    this.nodes.forEach((node) => node.disconnect())
    this.master?.disconnect()
    if (this.context && this.context.state !== 'closed') void this.context.close().catch(() => {})
    this.context = null
  }
}
