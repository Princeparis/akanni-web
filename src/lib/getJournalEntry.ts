/**
 * Helper to fetch a single journal entry by id/slug.
 * Tries multiple endpoints for resilience (legacy /api/journals/:id and /api/public/journals/:id).
 */
export async function getJournalEntry(id: string) {
  if (!id) return null

  // Prefer relative fetch so it works in server and client where base is same origin.
  const tryPaths = [
    `/api/journals/${encodeURIComponent(id)}`,
    `/api/public/journals/${encodeURIComponent(id)}`,
  ]

  for (const path of tryPaths) {
    try {
      const res = await fetch(path, { cache: 'no-store' })
      if (!res.ok) {
        // try next
        continue
      }

      const payload = await res.json()

      // Some endpoints return { success, data } and some return raw object.
      if (payload && typeof payload === 'object') {
        if (payload.success && payload.data) return payload.data
        return payload
      }

      return null
    } catch (err) {
      // network error, try next
      // eslint-disable-next-line no-console
      console.warn(`getJournalEntry: failed to fetch ${path}:`, err)
    }
  }

  return null
}
