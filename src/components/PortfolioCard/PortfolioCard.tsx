import React, { forwardRef, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { useGSAP } from '@gsap/react'
import './PortfolioCard.css'
import OptimizedImage from '../OptimizedImage'
import { PortfolioItem } from '@/utils/fetchPortfolios'
import Link from 'next/link'

gsap.registerPlugin(ScrollTrigger, SplitText)
interface PortfolioCardProps {
  portfolio: PortfolioItem
  className?: string
  showExcerpt?: boolean
}

function PortfolioCard({ portfolio, className = '', showExcerpt }: PortfolioCardProps) {
  const contRef = useRef<HTMLDivElement | null>(null)
  const titleRef = useRef<null>(null)
  const iconRef = useRef<SVGSVGElement | null>(null)
  const hoverTlRef = useRef<null | gsap.core.Timeline>(null)
  const wordsRef = useRef<any[]>([])
  const cover = portfolio?.coverImage
  const title = portfolio?.title || 'Untitled Project'

  const { contextSafe } = useGSAP(
    () => {
      wordsRef.current = []
      let split = new SplitText(titleRef.current, {
        type: 'words lines',
        mask: 'lines',
        linesClass: 'line++',
      })
      wordsRef.current.push(...split.words)

      if (contRef.current) {
        hoverTlRef.current = gsap
          .timeline({ paused: true })
          .to('.anime', {
            clipPath: 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)',
            duration: 0.4,
            ease: 'expo4.out',
          })
          .to(
            iconRef.current,
            {
              rotate: 45,
              duration: 0.4,
              ease: 'power4.out',
            },
            '-=0.2',
          )
          .from(
            wordsRef.current,
            {
              y: '100%',
              opacity: 0,
              duration: 0.4,
              stagger: 0.1,
              ease: 'power4.out',
            },
            '-=0.2',
          )
      } else {
        console.warn('GSAP: menuContainerRef.current is not available for menuAnimTl setup.')
      }

      return () => {
        hoverTlRef.current?.kill()
      }
    },
    {
      scope: contRef,
      dependencies: [portfolio],
    },
  )

  //   useGSAP(
  //     () => {
  //       const animationProps = {
  //         duration: 1.2,
  //         stagger: 0.1,
  //         ease: 'expo.out',
  //       }
  //       gsap.fromTo(
  //         contRef.current,
  //         {
  //           y: 50,
  //           opacity: 0,
  //         },
  //         {
  //           ...animationProps,
  //           y: 0,
  //           opacity: 1,
  //           scrollTrigger: {
  //             trigger: contRef.current,
  //             start: 'top 2%',
  //             end: `+=${contRef.current?.offsetHeight ? contRef.current.offsetHeight + 50 : 0}`,
  //             toggleActions: 'play reset play none',
  //             markers: false,
  //           },
  //         },
  //       )
  //     },
  //     {
  //       scope: contRef,
  //       dependencies: [],
  //     },
  //   )

  const handleMouseEnter = contextSafe(() => {
    if (hoverTlRef.current) {
      hoverTlRef.current.play()
    }
  })

  const handleMouseLeave = contextSafe(() => {
    if (hoverTlRef.current) {
      hoverTlRef.current.reverse()
    }
  })

  return (
    <div
      className={`portfolio-card ${className}`}
      ref={contRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link href={`/portfolio/${portfolio.slug}`} className="portfolio-card-link">
        <div className="portfolio-img">
          <div className="categories">
            {portfolio.categories &&
              portfolio.categories.map((category: string) => (
                <span key={category} className="category">
                  {category}
                </span>
              ))}
          </div>
          {cover ? (
            <img src={cover.url} alt={cover.alt || title} />
          ) : (
            <div className="portfolio-card-placeholder-image">
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
          <h3 className="portfolio-title" ref={titleRef}>
            {title}
          </h3>
          <div className="info-left">
            {portfolio.year && <span className="year">{portfolio.year}</span>}
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              ref={iconRef}
            >
              <path
                d="M13 6C13 5.44772 12.5523 5 12 5C11.4477 5 11 5.44772 11 6V11H6C5.44771 11 5 11.4477 5 12C5 12.5523 5.44771 13 6 13H11V18C11 18.5523 11.4477 19 12 19C12.5523 19 13 18.5523 13 18V13H18C18.5523 13 19 12.5523 19 12C19 11.4477 18.5523 11 18 11H13V6Z"
                fill="#ffffff"
              />
            </svg>
          </div>
        </div>
      </Link>
    </div>
  )
}

export default PortfolioCard
