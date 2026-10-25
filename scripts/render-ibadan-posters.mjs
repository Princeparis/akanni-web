/** Run against a local Next server; previews use the same models as the experience. */
import { mkdtemp, readFile, writeFile, copyFile, rm, mkdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'
import sharp from 'sharp'
import { chromium } from '@playwright/test'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const directory = await mkdtemp(path.join(root, 'public', 'ibadan-poster-preview-'))
let browser
try {
  for (const name of ['three.module.js', 'three.core.js'])
    await copyFile(path.join(root, 'node_modules/three/build', name), path.join(directory, name))
  await copyFile(
    path.join(root, 'node_modules/three/examples/jsm/environments/RoomEnvironment.js'),
    path.join(directory, 'RoomEnvironment.js'),
  )
  const source = await readFile(path.join(root, 'src/components/ibadan/gallery-models.ts'), 'utf8')
  await writeFile(
    path.join(directory, 'models.js'),
    ts.transpileModule(source, {
      compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
    }).outputText,
  )
  await copyFile(path.join(root, 'scripts/ibadan-poster.html'), path.join(directory, 'index.html'))
  browser = await chromium.launch({
    executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || undefined,
    args: ['--no-sandbox'],
  })
  const page = await browser.newPage({ viewport: { width: 900, height: 900 } })
  const origin = process.env.IBADAN_PREVIEW_ORIGIN || 'http://127.0.0.1:3000'
  await page.goto(new URL(`/${path.basename(directory)}/index.html`, origin).href)
  await page.locator('body[data-ready="true"]').waitFor({ timeout: 60_000 })
  const destination = path.join(root, 'public/ibadan/posters')
  await mkdir(destination, { recursive: true })
  for (const name of [
    'iyalode',
    'commander',
    'drum',
    'vessel',
    'sword',
    'book',
    'document',
    'locomotive',
    'mapo',
    'television',
    'writer',
    'cocoa',
    'city',
    'water',
  ]) {
    await page.evaluate((name) => window.show(name), name)
    await sharp(await page.screenshot())
      .resize(600, 600)
      .webp({ quality: 88 })
      .toFile(path.join(destination, `${name}.webp`))
    console.log(`Rendered ${name}.webp`)
  }
} finally {
  await browser?.close()
  await rm(directory, { recursive: true, force: true })
}
