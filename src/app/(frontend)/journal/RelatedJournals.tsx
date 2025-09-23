'use client'

import React, { useEffect, useMemo, useState } from 'react'
import JournalCard from '@/components/JournalCard'
import { JournalEntry } from '@/types/journal'

import './RelatedStyle.css'

interface RelatedJournalsProps {
  currentId: string
  categoryId?: string
  tags?: { id: string; name: string }[]
}

export default function RelatedJournals({
  currentId,
  categoryId,
  tags = [],
}: RelatedJournalsProps) {
  const [related, setRelated] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const params = useMemo(() => {
    const p = new URLSearchParams()
    p.set('status', 'published')
    // Request a few more than we need so we can filter out the current entry
    p.set('limit', '6')
    p.set('sortBy', 'publishedAt')
    p.set('sortOrder', 'desc')
    if (categoryId) p.set('category', categoryId)
    if (tags && tags.length) tags.forEach((t) => p.append('tags', t.id))
    return p.toString()
  }, [categoryId, tags])

  useEffect(() => {
    let mounted = true
    const controller = new AbortController()

    async function fetchRelated() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/journals?${params}`, { signal: controller.signal })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const body = await res.json()
        if (!body.success) throw new Error(body.error?.message || 'API error')
        const docs: JournalEntry[] = body.data.docs || []
        // Filter out current entry and take up to 3
        const filtered = docs.filter((d) => d.id !== currentId).slice(0, 3)
        if (mounted) setRelated(filtered)
      } catch (err: any) {
        if (err.name === 'AbortError') return
        console.warn('RelatedJournals fetch error', err)
        if (mounted) setError(err.message || 'Failed to fetch related journals')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    // Only fetch when we have a currentId
    if (currentId) fetchRelated()

    return () => {
      mounted = false
      controller.abort()
    }
  }, [params, currentId])

  if (!currentId) return null

  return (
    <aside className="related-journals">
      <div className="related-head">
        <h3>Related Articles</h3>
      </div>
      {loading && <div>Loading related posts…</div>}
      {error && <div className="error">{error}</div>}
      <div className="related-list">
        {related.map((entry) => (
          <JournalCard key={entry.id} entry={entry} />
        ))}
        {!loading && related.length === 0 && <div>No related posts found</div>}
      </div>
    </aside>
  )
}
