'use client'

import React, { useEffect } from 'react'
import { useJournalEntry } from '../../../../hooks/useJournalEntry'
import Link from 'next/link'

// @ts-ignore: allow side-effect CSS import without type declarations
import './Journaldetails.css'
import Copy from '@/components/Copy'
import RelatedJournals from '../RelatedJournals'

interface JournalDetailClientProps {
  entryId: string
}

function JournalDetailClient({ entryId }: JournalDetailClientProps) {
  const { entry, loading, error, fetchEntry } = useJournalEntry({ autoFetch: false })

  // Prevent repeated fetches / infinite loops by tracking the last fetched id
  // and whether a fetch is currently in-flight. This is a defensive guard
  // in case upstream function identities change unexpectedly.
  const inFlightRef = React.useRef(false)
  const lastFetchedRef = React.useRef<string | null>(null)

  useEffect(() => {
    let cancelled = false
    if (!entryId) return

    // If we're already fetching this id or we've successfully fetched it before,
    // skip initiating another fetch.
    if (inFlightRef.current) return
    if (lastFetchedRef.current === entryId) return

    inFlightRef.current = true
    ;(async () => {
      try {
        await fetchEntry(entryId)
        if (!cancelled) lastFetchedRef.current = entryId
      } catch (e) {
        // Log but don't rethrow - the error boundary / hook state will handle it
        console.warn('Failed to fetch journal entry', e)
      } finally {
        inFlightRef.current = false
      }
    })()

    return () => {
      cancelled = true
    }
  }, [entryId, fetchEntry])

  if (loading) return <main className="journal-entry">Loading...</main>
  if (error) return <main className="journal-entry">Error: {error}</main>

  if (!entry) return <main className="journal-entry">Journal not found</main>

  const anyEntry: any = entry

  return (
    <main className="journal-detail">
      <div className="journal-detail-head">
        <Link href="/journal">
          <div className="go-back">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9.70711 8.70711C10.0976 8.31658 10.0976 7.68342 9.70711 7.29289C9.31658 6.90237 8.68342 6.90237 8.29289 7.29289L4.29289 11.2929C3.90237 11.6834 3.90237 12.3166 4.29289 12.7071L8.29289 16.7071C8.68342 17.0976 9.31658 17.0976 9.70711 16.7071C10.0976 16.3166 10.0976 15.6834 9.70711 15.2929L7.41421 13H19.0001C19.5524 13 20.0001 12.5523 20.0001 12C20.0001 11.4477 19.5524 11 19.0001 11H7.41421L9.70711 8.70711Z"
                fill="#ffffff"
              />
            </svg>
            <h4>Journal</h4>
          </div>
        </Link>
      </div>
      <section className="detail-cover">
        {anyEntry.coverImage && (
          <div className="detail-cover-wrap">
            <img
              className="detail-cover-img"
              src={anyEntry.coverImage.url}
              alt={anyEntry.coverImage.alt || anyEntry.title}
            />
          </div>
        )}
      </section>
      <section className="journal-detail-content">
        <h1>{anyEntry.title}</h1>
        <article>
          {anyEntry.paragraph1 && (
            <Copy>
              <p className="paragraph paragraph-1">{anyEntry.paragraph1}</p>
            </Copy>
          )}
          {anyEntry.paragraph2 && (
            <Copy>
              <p className="paragraph paragraph-2">{anyEntry.paragraph2}</p>
            </Copy>
          )}
          {anyEntry.image1 && (
            <div className="image-1">
              <img src={anyEntry.image1.url} alt={anyEntry.image1.alt || 'Image 1'} />
            </div>
          )}
          {anyEntry.image2 && (
            <div className="image-2">
              <img src={anyEntry.image2.url} alt={anyEntry.image2.alt || 'Image 2'} />
            </div>
          )}
          {anyEntry.paragraph3 && <p className="paragraph paragraph-3">{anyEntry.paragraph3}</p>}
          {anyEntry.paragraph4 && <p className="paragraph paragraph-4">{anyEntry.paragraph4}</p>}
          {anyEntry.image3 && (
            <div className="image-3">
              <img src={anyEntry.image3.url} alt={anyEntry.image3.alt || 'Image 3'} />
            </div>
          )}
          {anyEntry.image4 && (
            <div className="image-4">
              <img src={anyEntry.image4.url} alt={anyEntry.image4.alt || 'Image 4'} />
            </div>
          )}
          {anyEntry.paragraph5 && <p className="paragraph paragraph-5">{anyEntry.paragraph5}</p>}
        </article>
      </section>
      <RelatedJournals
        currentId={anyEntry.id}
        categoryId={anyEntry.category?.id}
        tags={anyEntry.tags}
      />
    </main>
  )
}

export default JournalDetailClient
