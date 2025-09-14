'use client'

import React from 'react'
import { JournalProvider } from '../../../contexts/JournalContext'
import JournalErrorBoundary from '../../../components/JournalErrorBoundary'
import JournalList from '../../../components/JournalList'
import './Journal.css'

interface JournalPageProps {
  // Add any props that might be passed from the router or parent components
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}

function JournalContent() {
  return (
    <section className="journal">
      <div className="journal-header">
        <h5>
          Explore thoughts, insights, and stories from my creative journey. A collection of
          experiences, learnings, and reflections on design, technology, and life.
        </h5>
      </div>
      <JournalList />
    </section>
  )
}

function Journal({ searchParams }: JournalPageProps) {
  return (
    <JournalErrorBoundary>
      <JournalProvider>
        <JournalContent />
      </JournalProvider>
    </JournalErrorBoundary>
  )
}

export default Journal
