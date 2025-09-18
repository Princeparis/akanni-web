import axios from 'axios'

export interface PortfolioItem {
  id: string
  title: string
  slug?: string
  description?: string
  content?: any
  year?: number
  coverImage?: any
  publishedAt?: string
  [key: string]: any
}

/**
 * Fetch portfolios (or other collection route) from the public API.
 * - route: the API route (for example, `/api/portfolios`)
 * - limit: optional maximum number of items to return (enforced client-side)
 *
 * The function performs defensive normalization of different API shapes and
 * always returns an array suitable for mapping in components.
 */
export default async function fetchPortfolios(
  route = '/api/portfolios',
  limit?: number,
): Promise<PortfolioItem[]> {
  try {
    const url = route
    const res = await axios.get(url, { timeout: 10000 })
    const payload = res.data

    let data: any[] = []

    if (!payload) {
      data = []
    } else if (Array.isArray(payload)) {
      data = payload
    } else if (payload && typeof payload === 'object') {
      if (Array.isArray((payload as any).docs)) {
        data = (payload as any).docs
      } else if (Array.isArray((payload as any).data)) {
        data = (payload as any).data
      } else if (Array.isArray((payload as any).results)) {
        data = (payload as any).results
      } else if (Array.isArray((payload as any).items)) {
        data = (payload as any).items
      } else {
        const maybeArray = Object.values(payload).find((v) => Array.isArray(v))
        data = Array.isArray(maybeArray) ? (maybeArray as any[]) : []
      }
    } else {
      data = []
    }

    if (typeof limit === 'number') return data.slice(0, limit)
    return data
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    throw new Error(`Failed to fetch portfolios from ${route}: ${message}`)
  }
}
