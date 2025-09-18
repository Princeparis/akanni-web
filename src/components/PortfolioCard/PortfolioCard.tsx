import React from 'react'
import './PortfolioCard.css'
import OptimizedImage from '../OptimizedImage'
import { PortfolioItem } from '@/utils/fetchPortfolios'
import Link from 'next/link'

interface PortfolioCardProps {
  portfolio: PortfolioItem
  className?: string
  showExcerpt?: boolean
}

function PortfolioCard({ portfolio, className = '', showExcerpt }: PortfolioCardProps) {
  const cover = portfolio?.coverImage
  const title = portfolio?.title || 'Untitled Project'

  return (
    <div className={`portfolio-card ${className}`}>
      <Link href={`/journal/${portfolio.slug}`} className="portfolio-card-link">
        <div className="portfolio-img">
          {cover ? (
            <OptimizedImage
              src={typeof cover === 'string' ? cover : cover.url || ''}
              alt={title}
              width={400}
              height={240}
              className="journal-card-img"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              placeholder="blur"
            />
          ) : (
            <div className="journal-card-placeholder-image">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21,15 16,10 5,21" />
              </svg>
            </div>
          )}
        </div>
        <div className="portfolio-info">
          <h3 className="portfolio-title">{title}</h3>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M13 6C13 5.44772 12.5523 5 12 5C11.4477 5 11 5.44772 11 6V11H6C5.44771 11 5 11.4477 5 12C5 12.5523 5.44771 13 6 13H11V18C11 18.5523 11.4477 19 12 19C12.5523 19 13 18.5523 13 18V13H18C18.5523 13 19 12.5523 19 12C19 11.4477 18.5523 11 18 11H13V6Z"
              fill="#ffffff"
            />
          </svg>
        </div>
      </Link>
    </div>
  )
}

export default PortfolioCard
