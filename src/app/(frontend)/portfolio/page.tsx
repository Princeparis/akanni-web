'use client'

import Footer from '@/components/footer/Footer'
import Menu from '@/components/menu/Menu'
import React, { useState, useEffect, useRef } from 'react'
import fetchPortfolios, { PortfolioItem } from '@/utils/fetchPortfolios'

import './Portfolio.css'
import PortfolioCard from '@/components/PortfolioCard/PortfolioCard'

function Portfolio() {
  const [portfolios, setPorfolios] = useState<PortfolioItem[] | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const portfolioRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let mounted = true

    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const items = await fetchPortfolios('/api/portfolios')
        if (!mounted) return
        setPorfolios(items)
      } catch (err: any) {
        if (!mounted) return
        setError(err?.message || String(err))
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()

    return () => {
      mounted = false
    }
  }, [])

  return (
    <>
      <Menu />
      <main className="portfolio">
        <div className="portfolio-header">
          <h2>Portfolio</h2>
          <div className="projects-count">
            {portfolios && !loading && !error && <span>{portfolios.length}</span>}
          </div>
        </div>
        <div className="portfolio-cont" ref={containerRef}>
          {loading && <div className="portfolio-loading">Loading portfolios…</div>}
          {error && <div className="portfolio-error">Error: {error}</div>}
          {!loading && !error && portfolios && portfolios.length === 0 && (
            <div className="portfolio-empty">No portfolios found.</div>
          )}

          {!loading && !error && portfolios && (
            <div className="portfolio-grid">
              {portfolios.map((p) => (
                <PortfolioCard
                  key={p.id || p.slug || p.title}
                  portfolio={p}
                  className="port-card"
                />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}

export default Portfolio
