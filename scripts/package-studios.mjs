// Deterministic standard ZIP files using only Node built-ins. No build dependency.
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { deflateRawSync } from 'node:zlib'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = fileURLToPath(new URL('../', import.meta.url))
const table = Uint32Array.from({ length: 256 }, (_, value) => {
  for (let bit = 0; bit < 8; bit++) value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1
  return value >>> 0
})
function crc32(bytes) {
  let crc = 0xffffffff
  for (const byte of bytes) crc = table[(crc ^ byte) & 255] ^ (crc >>> 8)
  return (crc ^ 0xffffffff) >>> 0
}
function archive(files) {
  const chunks = [],
    directory = []
  let offset = 0
  for (const [filename, bytes] of files) {
    const name = Buffer.from(filename),
      data = deflateRawSync(bytes, { level: 9 }),
      crc = crc32(bytes)
    const local = Buffer.alloc(30)
    local.writeUInt32LE(0x04034b50, 0)
    local.writeUInt16LE(20, 4)
    local.writeUInt16LE(0x0800, 6)
    local.writeUInt16LE(8, 8)
    local.writeUInt16LE(0x5c21, 12)
    local.writeUInt32LE(crc, 14)
    local.writeUInt32LE(data.length, 18)
    local.writeUInt32LE(bytes.length, 22)
    local.writeUInt16LE(name.length, 26)
    chunks.push(local, name, data)
    const entry = Buffer.alloc(46)
    entry.writeUInt32LE(0x02014b50, 0)
    entry.writeUInt16LE(20, 4)
    entry.writeUInt16LE(20, 6)
    entry.writeUInt16LE(0x0800, 8)
    entry.writeUInt16LE(8, 10)
    entry.writeUInt16LE(0x5c21, 14)
    entry.writeUInt32LE(crc, 16)
    entry.writeUInt32LE(data.length, 20)
    entry.writeUInt32LE(bytes.length, 24)
    entry.writeUInt16LE(name.length, 28)
    entry.writeUInt32LE(offset, 42)
    directory.push(entry, name)
    offset += local.length + name.length + data.length
  }
  const central = Buffer.concat(directory),
    end = Buffer.alloc(22)
  end.writeUInt32LE(0x06054b50, 0)
  end.writeUInt16LE(files.length, 8)
  end.writeUInt16LE(files.length, 10)
  end.writeUInt32LE(central.length, 12)
  end.writeUInt32LE(offset, 16)
  return Buffer.concat([...chunks, central, end])
}
await mkdir(path.join(root, 'public/downloads'), { recursive: true })
for (const slug of ['caustic', 'loom']) {
  const entries = []
  for (const name of ['index.html', 'style.css', 'scene.js', 'README.md'])
    entries.push([
      `${slug}/${name}`,
      await readFile(path.join(root, `public/experiments/${slug}/${name}`)),
    ])
  for (const name of ['runtime.js', 'studio.css'])
    entries.push([
      `shared/${name}`,
      await readFile(path.join(root, `public/experiments/shared/${name}`)),
    ])
  entries.push([
    'LICENSE.txt',
    await readFile(path.join(root, 'public/experiments/shared/LICENSE.txt')),
  ])
  const bytes = archive(entries)
  await writeFile(path.join(root, `public/downloads/${slug}-source.zip`), bytes)
  console.log(`${slug}-source.zip: ${entries.length} files, ${bytes.length} bytes`)
}
