'use client'

import React, { useEffect, useState } from 'react'
import './Journal.css'
import Menu from '@/components/menu/Menu'
import JournalCard from '@/components/JournalCard'
import JournalErrorBoundary from '@/components/JournalErrorBoundary'
import fetchRecentJournals, { RecentJournal } from '../../../utils/fetchRecentJournals'
import { JournalEntry as FullJournalEntry } from '@/types/journal'
import Footer from '@/components/footer/Footer'

export default function JournalPage() {
  const [entries, setEntries] = useState<RecentJournal[] | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    fetchRecentJournals()
      .then((data: RecentJournal[]) => {
        if (!mounted) return
        setEntries(data)
      })
      .catch((err: unknown) => {
        if (!mounted) return
        const message = err instanceof Error ? err.message : String(err)
        setError(message)
      })
      .finally(() => {
        if (!mounted) return
        setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [])

  return (
    <>
      <Menu />
      <section className="journal-content">
        {loading && <p>Loading journals…</p>}

        {!loading && error && <p className="error">{error}</p>}

        {!loading && entries && entries.length === 0 && <p>No journal entries found.</p>}

        {!loading && entries && entries.length > 0 && (
          <div className="journal-list">
            {entries.map((entry) => (
              <JournalCard
                key={entry.id || entry.slug || entry.title}
                entry={entry as unknown as FullJournalEntry}
              />
            ))}
          </div>
        )}
      </section>
      <Footer />
    </>
  )
}
