'use client'

import Footer from '@/components/footer/Footer'
import Menu from '@/components/menu/Menu'
import React, { useState, useEffect } from 'react'
import fetchPortfolios, { PortfolioItem } from '@/utils/fetchPortfolios'

import './Portfolio.css'

function Portfolio() {
  const [portfolios, setPorfolios] = useState<PortfolioItem[] | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

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
        <div className="portfolio-header"></div>
        <div className="portfolio-cont">
          {loading && <div className="portfolio-loading">Loading portfolios…</div>}
          {error && <div className="portfolio-error">Error: {error}</div>}
          {!loading && !error && portfolios && portfolios.length === 0 && (
            <div className="portfolio-empty">No portfolios found.</div>
          )}

          {!loading && !error && portfolios && (
            <div className="portfolio-grid">
              {portfolios.map((p) => (
                <article key={p.id} className="portfolio-card">
                  {p.coverImage ? (
                    // coverImage could be a relation object; try to read common fields
                    <img
                      src={
                        typeof p.coverImage === 'string'
                          ? p.coverImage
                          : p.coverImage?.url || p.coverImage?.thumbnail || ''
                      }
                      alt={p.title || 'cover'}
                    />
                  ) : null}
                  <h3 className="portfolio-title">{p.title}</h3>
                  {p.description && <p className="portfolio-description">{p.description}</p>}
                </article>
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
