import { test, expect } from '@playwright/test'
import { readFile, mkdir, writeFile } from 'node:fs/promises'
import ts from 'typescript'

test('the real notification synthesis produces short, distinct, unclipped tones with silent tails', async ({
  page,
}) => {
  const source = await readFile('src/lib/contact-audio.ts', 'utf8')
  const javascript = ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
  }).outputText
  const results = await page.evaluate(async (code) => {
    const url = URL.createObjectURL(new Blob([code], { type: 'text/javascript' }))
    try {
      const { scheduleContactCue } = await import(url)
      const results = []
      for (const cue of ['success', 'error']) {
        const rate = 48000
        const context = new OfflineAudioContext(1, rate * 1.6, rate)
        scheduleContactCue(context, context.destination, cue, 0.02)
        const samples = (await context.startRendering()).getChannelData(0)
        let peak = 0,
          energy = 0,
          lastAudible = 0
        const wav = new ArrayBuffer(44 + samples.length * 2)
        const view = new DataView(wav)
        const label = (at: number, text: string) =>
          [...text].forEach((char, i) => view.setUint8(at + i, char.charCodeAt(0)))
        label(0, 'RIFF')
        view.setUint32(4, wav.byteLength - 8, true)
        label(8, 'WAVE')
        label(12, 'fmt ')
        view.setUint32(16, 16, true)
        view.setUint16(20, 1, true)
        view.setUint16(22, 1, true)
        view.setUint32(24, rate, true)
        view.setUint32(28, rate * 2, true)
        view.setUint16(32, 2, true)
        view.setUint16(34, 16, true)
        label(36, 'data')
        view.setUint32(40, samples.length * 2, true)
        for (let i = 0; i < samples.length; i++) {
          peak = Math.max(peak, Math.abs(samples[i]))
          energy += samples[i] ** 2
          if (Math.abs(samples[i]) > 0.0001) lastAudible = i / rate
          view.setInt16(44 + i * 2, Math.round(Math.max(-1, Math.min(1, samples[i])) * 32767), true)
        }
        let binary = ''
        for (const byte of new Uint8Array(wav)) binary += String.fromCharCode(byte)
        results.push({
          cue,
          peak,
          rms: Math.sqrt(energy / samples.length),
          lastAudible,
          wav: btoa(binary),
        })
      }
      return results
    } finally {
      URL.revokeObjectURL(url)
    }
  }, javascript)
  await mkdir('artifacts/contact-audio', { recursive: true })
  for (const sound of results) {
    expect(sound.peak).toBeGreaterThan(0.1)
    expect(sound.peak).toBeLessThan(0.5)
    expect(sound.rms).toBeGreaterThan(0.015)
    expect(sound.lastAudible).toBeLessThan(1.4)
    expect(sound.lastAudible).toBeGreaterThan(sound.cue === 'success' ? 1 : 0.5)
    await writeFile(`artifacts/contact-audio/${sound.cue}.wav`, Buffer.from(sound.wav, 'base64'))
  }
  expect(results[0].lastAudible).toBeGreaterThan(results[1].lastAudible + 0.5)
  expect(results[0].wav).not.toBe(results[1].wav)
})
