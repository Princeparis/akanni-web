'use client'
import Menu from '@/components/menu/Menu'
import React, { useState, useEffect } from 'react'
import { PortfolioItem } from '@/utils/fetchPortfolios'
import Image from 'next/image'
import parseRichText from '@/utils/parseRichText'

// @ts-ignore: allow side-effect CSS import without type declarations
import './PortDetails.css'
import Footer from '@/components/footer/Footer'
import Copy from '@/components/NewCopy'

type Props = { params: any }

async function fetchPortfolioById(id: string): Promise<PortfolioItem | null> {
  try {
    const res = await fetch(`/api/portfolios/${id}`)
    if (!res.ok) {
      console.error('fetchPortfolioById: non-OK response', res.status)
      return null
    }
    const data = await res.json()
    // payload may return the item directly or wrap in { doc } / { data }
    if (!data) return null
    if (Array.isArray(data)) return data[0] ?? null
    if (data?.doc) return data.doc
    if (data?.data) return data.data
    if (data?.item) return data.item
    return data as PortfolioItem
  } catch (err) {
    console.error('fetchPortfolioById error', err)
    return null
  }
}

const PortfolioDetails = ({ params }: Props) => {
  // Next.js may pass `params` as a Promise in newer versions. Use React.use() to
  // unwrap it when available. Fallback to direct access for older runtimes.
  // `React.use` is intentionally accessed via `any` to avoid TS errors in older
  // React types where `use` may not yet be declared.
  const resolvedParams = (React as any).use ? (React as any).use(params) : params
  const { id } = resolvedParams as { id: string }
  const [portfolio, setPortfolio] = useState<PortfolioItem | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    setError(null)

    fetchPortfolioById(id)
      .then((p) => {
        if (!mounted) return
        if (!p) setError('Portfolio not found')
        setPortfolio(p)
      })
      .catch((err) => {
        if (!mounted) return
        setError(String(err))
      })
      .finally(() => {
        if (!mounted) return
        setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [id])

  return (
    <>
      <Menu />
      <main className="portfolio-details">
        {loading && <p>Loading portfolio…</p>}
        {!loading && error && <p className="error">{error}</p>}
        {!loading && !error && !portfolio && <p>Portfolio not found.</p>}
        {!loading && portfolio && (
          <>
            <section className="portfolio-head">
              <div className="top">
                <div className="top-left">
                  <h1>{portfolio.title}</h1>
                  {portfolio.categories && portfolio.categories.length > 0 && (
                    <div className="categories">
                      <h5>Services</h5>
                      <div className="cat-stripe">
                        {portfolio.categories.map((cat: string) => (
                          <span key={cat} className="portfolio-category">
                            {cat}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="top-right">
                  <div className="project-year">
                    {portfolio.year && <span className="year">{portfolio.year}</span>}
                  </div>
                  {portfolio.description && (
                    <Copy delay={0.6}>
                      <p className="port-desc">{portfolio.description}</p>
                    </Copy>
                  )}
                </div>
              </div>
              <div className="bottom">
                {portfolio.coverImage && (
                  <div className="cover">
                    <img
                      src={
                        typeof portfolio.coverImage === 'string'
                          ? portfolio.coverImage
                          : portfolio.coverImage?.url
                      }
                      alt={portfolio.coverImage?.alt || portfolio.title}
                      className="cover-img"
                    />
                  </div>
                )}
              </div>
            </section>
            <section className="portfolio-content">
              <div className="first-track track">
                <div className="left-track">
                  {portfolio.intro && (
                    <Copy>
                      <p className="rt-p">{portfolio.intro}</p>
                    </Copy>
                  )}
                  {portfolio.image1 && (
                    <div className="image1">
                      <img
                        src={portfolio.image1.url}
                        alt={portfolio.image1.alt || portfolio.title}
                      />
                    </div>
                  )}
                </div>
                <div className="right-track">
                  {portfolio.image2 && (
                    <div className="image2">
                      <img
                        src={portfolio.image2.url}
                        alt={portfolio.image2.alt || portfolio.title}
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className="full-image-track">
                <img src={portfolio.image3.url} alt={portfolio.image3.alt || portfolio.title} />
              </div>
              <div className="second-track track">
                <div className="left-track">
                  {portfolio.implementation && (
                    <Copy>
                      <p className="rt-p">{portfolio.implementation}</p>
                    </Copy>
                  )}
                  {portfolio.image5 && (
                    <div className="image1">
                      <img
                        src={portfolio.image5.url}
                        alt={portfolio.image5.alt || portfolio.title}
                      />
                    </div>
                  )}
                </div>
                <div className="right-track">
                  {portfolio.image4 && (
                    <div className="image2">
                      <img
                        src={portfolio.image4.url}
                        alt={portfolio.image4.alt || portfolio.title}
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className="full-image-track">
                <img src={portfolio.image6.url} alt={portfolio.image6.alt || portfolio.title} />
              </div>
              {portfolio.image7 && (
                <div className="full-image-track">
                  <img src={portfolio.image7.url} alt={portfolio.image7.alt || portfolio.title} />
                </div>
              )}
              {portfolio.image8 && (
                <div className="full-image-track">
                  <img src={portfolio.image8.url} alt={portfolio.image8.alt || portfolio.title} />
                </div>
              )}
            </section>
          </>
        )}
      </main>
      <Footer />
    </>
  )
}

export default PortfolioDetails
