export const tracks = ['Kick', 'Snare', 'Hat', 'Tone'] as const
export type Track = (typeof tracks)[number]
export type Pattern = boolean[][]
export const rhythmPresets = {
  'After hours': [
    [0, 4, 8, 10, 12],
    [4, 12],
    [0, 2, 4, 6, 8, 10, 12, 14, 15],
    [0, 3, 6, 10, 14],
  ],
  'Broken orbit': [
    [0, 3, 7, 10, 14],
    [4, 11, 12],
    [0, 2, 3, 6, 8, 10, 11, 14],
    [0, 5, 7, 12, 15],
  ],
  'Slow glass': [
    [0, 8],
    [4, 12],
    [2, 6, 10, 14],
    [0, 4, 8, 12, 15],
  ],
  'Blank canvas': [[], [], [], []],
} as const
export type RhythmPreset = keyof typeof rhythmPresets
export function makePattern(preset: RhythmPreset): Pattern {
  return rhythmPresets[preset].map((steps) =>
    Array.from({ length: 16 }, (_, index) => (steps as readonly number[]).includes(index)),
  )
}

function noise(context: BaseAudioContext, duration: number) {
  const buffer = context.createBuffer(
    1,
    Math.ceil(context.sampleRate * duration),
    context.sampleRate,
  )
  const channel = buffer.getChannelData(0)
  let seed = 92457
  for (let i = 0; i < channel.length; i++) {
    seed = (Math.imul(seed, 1664525) + 1013904223) | 0
    channel[i] = (seed >>> 0) / 2147483648 - 1
  }
  return buffer
}

// The live instrument and offline WAV share the exact same synthesis graph.
function voice(
  context: BaseAudioContext,
  output: AudioNode,
  track: number,
  when: number,
  step: number,
  noiseBuffer: AudioBuffer,
) {
  const sources: AudioScheduledSourceNode[] = []
  const envelope = context.createGain()
  envelope.connect(output)
  const osc = (type: OscillatorType, frequency: number, length: number, gain: number) => {
    const source = context.createOscillator()
    source.type = type
    source.frequency.setValueAtTime(frequency, when)
    source.connect(envelope)
    envelope.gain.setValueAtTime(gain, when)
    envelope.gain.exponentialRampToValueAtTime(0.0001, when + length)
    source.start(when)
    source.stop(when + length + 0.015)
    sources.push(source)
    return source
  }
  if (track === 0) {
    const source = osc('sine', 155, 0.38, 0.85)
    source.frequency.exponentialRampToValueAtTime(44, when + 0.15)
  } else if (track === 1 || track === 2) {
    const source = context.createBufferSource()
    source.buffer = noiseBuffer
    const filter = context.createBiquadFilter()
    filter.type = 'highpass'
    filter.frequency.value = track === 1 ? 1200 : 7200
    source.connect(filter)
    filter.connect(envelope)
    const duration = track === 1 ? 0.16 : step % 4 === 2 ? 0.095 : 0.045
    envelope.gain.setValueAtTime(track === 1 ? 0.36 : 0.16, when)
    envelope.gain.exponentialRampToValueAtTime(0.0001, when + duration)
    source.start(when)
    source.stop(when + duration + 0.015)
    sources.push(source)
    source.addEventListener('ended', () => filter.disconnect(), { once: true })
  } else {
    const notes = [146.832, 220, 261.626, 174.614]
    const frequency = notes[Math.floor(step / 4) % notes.length] * (step % 3 === 0 ? 2 : 1)
    const source = osc('sine', frequency, 0.34, 0.33)
    source.frequency.exponentialRampToValueAtTime(frequency * 0.997, when + 0.25)
  }
  let remaining = sources.length
  sources.forEach((source) =>
    source.addEventListener(
      'ended',
      () => {
        source.disconnect()
        remaining--
        if (!remaining) envelope.disconnect()
      },
      { once: true },
    ),
  )
  return sources
}

function graph(context: BaseAudioContext, volume: number) {
  const master = context.createGain()
  const compressor = context.createDynamicsCompressor()
  master.gain.value = volume * 0.7
  compressor.threshold.value = -10
  compressor.knee.value = 12
  compressor.ratio.value = 4
  compressor.attack.value = 0.003
  compressor.release.value = 0.15
  master.connect(compressor)
  compressor.connect(context.destination)
  return { master, compressor }
}

export class PulseAudio {
  private context: AudioContext | null = null
  private master: GainNode | null = null
  private compressor: DynamicsCompressorNode | null = null
  private noiseBuffer: AudioBuffer | null = null
  private timer: ReturnType<typeof setInterval> | null = null
  private active = new Set<AudioScheduledSourceNode>()
  private scheduled: { time: number; step: number; hits: boolean[] }[] = []
  private nextTime = 0
  private step = 0
  private generation = 0
  pattern = makePattern('After hours')
  muted = [false, false, false, false]
  bpm = 110
  volume = 0.65
  playing = false

  constructor(
    private onStep: (step: number, hits: boolean[]) => void,
    private onInterrupted: () => void,
  ) {}

  async start() {
    if (this.playing) return
    const generation = ++this.generation
    if (!this.context) {
      if (!window.AudioContext) throw new Error('Web Audio is unavailable in this browser.')
      this.context = new AudioContext()
      const { master, compressor } = graph(this.context, this.volume)
      this.master = master
      this.compressor = compressor
      this.noiseBuffer = noise(this.context, 0.25)
      this.context.onstatechange = () => {
        if (this.playing && this.context?.state !== 'running') {
          this.stop()
          this.onInterrupted()
        }
      }
    }
    await this.context.resume()
    if (generation !== this.generation || this.context.state !== 'running' || document.hidden)
      return false
    this.playing = true
    this.step = 0
    this.nextTime = this.context.currentTime + 0.06
    this.tick()
    this.timer = setInterval(() => this.tick(), 20)
    return true
  }

  private tick() {
    if (!this.context || !this.master || !this.noiseBuffer || !this.playing) return
    const now = this.context.currentTime
    // If the machine stalls, resume at the current time rather than firing a backlog.
    if (this.nextTime < now - 0.1) this.nextTime = now + 0.025
    while (this.nextTime < now + 0.085) {
      const hits = this.pattern.map((row, track) => row[this.step] && !this.muted[track])
      hits.forEach((hit, track) => {
        if (!hit) return
        for (const source of voice(
          this.context!,
          this.master!,
          track,
          this.nextTime,
          this.step,
          this.noiseBuffer!,
        )) {
          this.active.add(source)
          source.addEventListener('ended', () => this.active.delete(source), { once: true })
        }
      })
      this.scheduled.push({ time: this.nextTime, step: this.step, hits })
      this.nextTime += 60 / this.bpm / 4
      this.step = (this.step + 1) % 16
    }
    while (this.scheduled.length && this.scheduled[0].time <= now) {
      const next = this.scheduled.shift()!
      this.onStep(next.step, next.hits)
    }
  }

  setVolume(value: number) {
    this.volume = value
    if (this.master && this.context)
      this.master.gain.setTargetAtTime(value * 0.7, this.context.currentTime, 0.025)
  }

  stop() {
    this.generation++
    this.playing = false
    if (this.timer) clearInterval(this.timer)
    this.timer = null
    this.scheduled = []
    for (const source of this.active) {
      try {
        source.stop()
      } catch {
        /* Already ended. */
      }
    }
    this.active.clear()
  }

  async destroy() {
    this.stop()
    if (this.context) {
      this.context.onstatechange = null
      await this.context.close()
    }
    this.master?.disconnect()
    this.compressor?.disconnect()
    this.context = null
  }
}

export async function renderLoop(pattern: Pattern, muted: boolean[], bpm: number, volume: number) {
  const rate = 44100
  const barDuration = (60 / bpm) * 4
  const frames = Math.round(barDuration * rate)
  // Render two bars, then take the second: release tails from the preceding bar survive the seam.
  const context = new OfflineAudioContext(2, frames * 2 + rate, rate)
  const { master } = graph(context, volume)
  const buffer = noise(context, 0.25)
  for (let bar = 0; bar < 2; bar++)
    for (let step = 0; step < 16; step++) {
      pattern.forEach((row, track) => {
        if (row[step] && !muted[track])
          voice(context, master, track, ((bar * 16 + step) * 60) / bpm / 4, step, buffer)
      })
    }
  const rendered = await context.startRendering()
  const channels = [
    rendered.getChannelData(0).slice(frames, frames * 2),
    rendered.getChannelData(1).slice(frames, frames * 2),
  ]
  return encodeWav(channels, rate)
}

export function encodeWav(channels: Float32Array[], sampleRate: number) {
  const frames = channels[0].length
  const bytes = new ArrayBuffer(44 + frames * channels.length * 2)
  const view = new DataView(bytes)
  const text = (offset: number, value: string) =>
    [...value].forEach((character, i) => view.setUint8(offset + i, character.charCodeAt(0)))
  text(0, 'RIFF')
  view.setUint32(4, bytes.byteLength - 8, true)
  text(8, 'WAVE')
  text(12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, channels.length, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * channels.length * 2, true)
  view.setUint16(32, channels.length * 2, true)
  view.setUint16(34, 16, true)
  text(36, 'data')
  view.setUint32(40, bytes.byteLength - 44, true)
  for (let frame = 0; frame < frames; frame++)
    for (let channel = 0; channel < channels.length; channel++) {
      const value = Math.max(-1, Math.min(1, channels[channel][frame]))
      view.setInt16(
        44 + (frame * channels.length + channel) * 2,
        value < 0 ? value * 32768 : value * 32767,
        true,
      )
    }
  return new Blob([bytes], { type: 'audio/wav' })
}
