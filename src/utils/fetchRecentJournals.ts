export interface RecentJournal {
  id: string
  title: string
  slug?: string
  excerpt?: string
  publishedAt?: string
  [key: string]: any
}

/**
 * Fetch recent journals from the public API, sorted by publishedAt desc.
 * Returns at most `limit` items.
 */
import axios from 'axios'

export default async function fetchRecentJournals(limit?: number): Promise<RecentJournal[]> {
  try {
    // Request the journals endpoint without any query parameters.
    // If a `limit` is provided, we'll enforce it client-side by slicing the
    // returned array. This avoids sending any query string.
    const url = `/api/journals`

    const res = await axios.get(url, { timeout: 10000 })
    const payload = res.data

    // Defensive normalization: the API might return the array directly or an object
    // Common shapes: [], { docs: [...] }, { data: [...] }, { results: [...] }, { items: [...] }
    let data: any[] = []

    if (!payload) {
      data = []
    } else if (Array.isArray(payload)) {
      data = payload
    } else if (payload && typeof payload === 'object') {
      // prefer commonly-used keys
      if (Array.isArray((payload as any).docs)) {
        data = (payload as any).docs
      } else if (Array.isArray((payload as any).data)) {
        data = (payload as any).data
      } else if (Array.isArray((payload as any).results)) {
        data = (payload as any).results
      } else if (Array.isArray((payload as any).items)) {
        data = (payload as any).items
      } else {
        // last-ditch: sometimes the API nests the array under other keys
        const maybeArray = Object.values(payload).find((v) => Array.isArray(v))
        data = Array.isArray(maybeArray) ? (maybeArray as any[]) : []
      }
    } else {
      data = []
    }

    // If limit was provided but the server returned more, enforce it client-side
    if (typeof limit === 'number') return data.slice(0, limit)
    return data
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    throw new Error(`Failed to fetch journals: ${message}`)
  }
}
