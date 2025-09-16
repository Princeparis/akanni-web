'use client'

import React from 'react'
import JournalEntry from '../../../../components/JournalEntry'

interface JournalEntryClientProps {
  slug: string
}

function JournalEntryClient({ slug }: JournalEntryClientProps) {
  if (!slug) {
    return (
      <div className="journal-error">
        <h1>Journal Entry Not Found</h1>
        <p>The requested journal entry could not be found.</p>
      </div>
    )
  }

  return (
    <section className="journal-entry-page">
      <JournalEntry slug={slug} />
    </section>
  )
}

export default JournalEntryClient
