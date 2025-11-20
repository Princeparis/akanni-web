/**
 * Fetch a single journal entry by slug.
 *
 * Contract:
 * - Input: slug (string)
 * - Output: Promise<JournalEntry | null>
 * - Error modes: returns null on not-found or network errors; logs warnings for debugging
 *
 * Notes:
 * - Uses relative fetch so it works in server and server-side rendering contexts where
 *   the origin is the same (dev/prod). If you call this from a client on a different
 *   origin, switch to an absolute URL.
 * - Tries multiple likely routes for backward-compatibility.
 */
import type { JournalEntry } from '@/types/journal'

export async function getJournalBySlug(slug: string): Promise<JournalEntry | null> {
  if (!slug) return null

  const encoded = encodeURIComponent(slug)

  // Common endpoints used in this codebase. Order matters: prefer public-friendly
  // endpoints first so unauthenticated requests work.
  const tryPaths = [
    `/api/public/journals/slug/${encoded}`,
    `/api/journals/slug/${encoded}`,
    // Fallbacks that some older routes might expose (id-based endpoints sometimes
    // accept slugs).
    `/api/public/journals/${encoded}`,
    `/api/journals/${encoded}`,
  ]

  for (const path of tryPaths) {
    try {
      const res = await fetch(path, { cache: 'no-store' })
      if (!res.ok) {
        // 404 or other non-ok -> try next
        continue
      }

      const payload = await res.json()

      // Support varying response shapes: { success, data } or raw object
      if (payload && typeof payload === 'object') {
        if (payload.success && payload.data) return payload.data as JournalEntry
        return payload as JournalEntry
      }

      return null
    } catch (err) {
      // Network or parse error -> try next
      // eslint-disable-next-line no-console
      console.warn(`getJournalBySlug: failed to fetch ${path}:`, err)
    }
  }

  return null
}

export default getJournalBySlug
