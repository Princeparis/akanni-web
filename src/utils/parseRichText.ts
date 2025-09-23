/**
 * Utilities to parse Payload richText content into a simple array of blocks
 * that are easy to render in React components.
 *
 * The parser is defensive and supports a few common shapes produced by
 * different rich text editors (Lexical-like with `root.children`, Slate-like
 * arrays with `type`/`children`, or plain HTML/text). It also attempts to
 * extract uploaded media objects (uploads/relations) and image URLs.
 */

export type ParsedBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'heading'; level?: number; text: string }
  | { type: 'upload'; url: string; alt?: string; uploadId?: string }
  | { type: 'raw'; raw: any }

function isObject(x: any): x is Record<string, any> {
  return x !== null && typeof x === 'object'
}

function extractTextFromNode(node: any): string {
  if (!node) return ''
  if (typeof node === 'string') return node
  if (typeof node.text === 'string') return node.text
  if (Array.isArray(node)) return node.map(extractTextFromNode).join(' ')
  if (isObject(node) && Array.isArray(node.children)) {
    return node.children.map(extractTextFromNode).join(' ')
  }
  // fallback: try values
  if (isObject(node)) {
    const maybe = Object.values(node).find((v) => typeof v === 'string')
    return typeof maybe === 'string' ? maybe : ''
  }
  return ''
}

function findImageInfo(node: any): { url?: string; alt?: string; uploadId?: string } | null {
  if (!node || !isObject(node)) return null

  // common direct properties
  const url = node.url || node.src || node.value?.src || node.attrs?.src || node.data?.src
  const alt = node.alt || node.value?.alt || node.attrs?.alt || node.data?.alt
  const uploadId = node.upload?.id || node.upload?.value || node.id || node.value?.id

  if (typeof url === 'string' && url.length > 0) return { url, alt, uploadId }

  // payload upload relation (media) might be nested under 'value' or 'upload'
  if (node.upload && isObject(node.upload)) {
    const u = node.upload
    if (u.url || u.value || u.filename) {
      return { url: u.url || u.value || u.filename, alt: u.alt || undefined, uploadId: u.id }
    }
  }

  // try scanning children
  if (Array.isArray(node.children)) {
    for (const child of node.children) {
      const found = findImageInfo(child)
      if (found) return found
    }
  }

  // no image info discovered
  return null
}

export default function parseRichText(content: any): ParsedBlock[] {
  if (!content) return []

  // If given a plain string (HTML or text), split into paragraphs
  if (typeof content === 'string') {
    // naive split on double newline
    const parts = content
      .split(/\n{2,}/)
      .map((s) => s.trim())
      .filter(Boolean)
    return parts.map((p) => ({ type: 'paragraph', text: p }))
  }

  const blocks: ParsedBlock[] = []

  // Lexical-like structure: { root: { children: [...] } }
  if (isObject(content) && Array.isArray(content.root?.children)) {
    for (const node of content.root.children) {
      // image nodes
      const image = findImageInfo(node)
      if (image?.url) {
        blocks.push({ type: 'upload', url: image.url, alt: image.alt, uploadId: image.uploadId })
        continue
      }

      // paragraph/heading/text
      const text = extractTextFromNode(node)
      if (text) blocks.push({ type: 'paragraph', text: text.trim() })
      else blocks.push({ type: 'raw', raw: node })
    }

    return blocks
  }

  // Slate-like array of blocks: [{ type: 'p', children: [{ text: '...' }] }, ...]
  if (Array.isArray(content)) {
    for (const node of content) {
      const type = typeof node.type === 'string' ? node.type.toLowerCase() : ''
      if (type.includes('heading')) {
        const text = extractTextFromNode(node)
        blocks.push({ type: 'heading', level: node.level || undefined, text: text.trim() })
        continue
      }

      // image block
      const image = findImageInfo(node)
      if (image?.url) {
        blocks.push({ type: 'upload', url: image.url, alt: image.alt, uploadId: image.uploadId })
        continue
      }

      // paragraph/default
      const text = extractTextFromNode(node)
      if (text) blocks.push({ type: 'paragraph', text: text.trim() })
      else blocks.push({ type: 'raw', raw: node })
    }

    return blocks
  }

  // Fallback: attempt to find any children array on the object
  const maybeArr = Object.values(content).find((v) => Array.isArray(v))
  if (Array.isArray(maybeArr)) {
    return parseRichText(maybeArr)
  }

  // Unknown shape: return raw
  return [{ type: 'raw', raw: content }]
}
