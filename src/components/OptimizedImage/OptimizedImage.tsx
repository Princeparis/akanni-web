/**
 * Optimized Image component with lazy loading and performance features
 * Based on requirements 5.3, 5.6
 */

'use client'

import React, { useState, useRef, useEffect } from 'react'
import { createImageLazyLoader } from '../../utils/dynamic-imports'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
  sizes?: string
  quality?: number
  onLoad?: () => void
  onError?: () => void
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  placeholder = 'empty',
  blurDataURL,
  sizes,
  quality = 75,
  onLoad,
  onError,
}) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [isInView, setIsInView] = useState(priority)
  const imgRef = useRef<HTMLImageElement>(null)
  const lazyLoaderRef = useRef<ReturnType<typeof createImageLazyLoader> | null>(null)

  // Initialize lazy loader for non-priority images
  useEffect(() => {
    if (!priority && imgRef.current) {
      lazyLoaderRef.current = createImageLazyLoader()
      lazyLoaderRef.current.observe(imgRef.current)
    }

    return () => {
      lazyLoaderRef.current?.disconnect()
    }
  }, [priority])

  // Handle intersection for lazy loading
  useEffect(() => {
    if (!priority && imgRef.current) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setIsInView(true)
              observer.unobserve(entry.target)
            }
          })
        },
        {
          rootMargin: '50px',
          threshold: 0.1,
        },
      )

      observer.observe(imgRef.current)

      return () => {
        observer.disconnect()
      }
    }
  }, [priority])

  const handleLoad = () => {
    setIsLoaded(true)
    onLoad?.()
  }

  const handleError = () => {
    setHasError(true)
    onError?.()
  }

  // Generate optimized src with quality parameter
  const getOptimizedSrc = (originalSrc: string, targetWidth?: number) => {
    // For external URLs, return as-is
    if (originalSrc.startsWith('http')) {
      return originalSrc
    }

    // For internal images, add optimization parameters
    const url = new URL(originalSrc, window.location.origin)

    if (quality !== 75) {
      url.searchParams.set('q', quality.toString())
    }

    if (targetWidth) {
      url.searchParams.set('w', targetWidth.toString())
    }

    return url.toString()
  }

  // Generate srcSet for responsive images
  const generateSrcSet = () => {
    if (!width || src.startsWith('http')) {
      return undefined
    }

    const breakpoints = [480, 768, 1024, 1280, 1920]
    const srcSet = breakpoints
      .filter((bp) => bp <= width * 2) // Don't generate larger than 2x original
      .map((bp) => `${getOptimizedSrc(src, bp)} ${bp}w`)
      .join(', ')

    return srcSet || undefined
  }

  const shouldShowImage = priority || isInView
  const imageSrc = shouldShowImage ? getOptimizedSrc(src, width) : undefined

  return (
    <div
      className={`optimized-image-container ${className}`}
      style={{
        width: width ? `${width}px` : 'auto',
        height: height ? `${height}px` : 'auto',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Placeholder */}
      {!isLoaded && !hasError && (
        <div
          className="image-placeholder"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: '#f3f4f6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundImage:
              placeholder === 'blur' && blurDataURL ? `url(${blurDataURL})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: placeholder === 'blur' ? 'blur(10px)' : undefined,
          }}
        >
          {placeholder === 'empty' && (
            <div
              style={{
                width: '40px',
                height: '40px',
                backgroundColor: '#d1d5db',
                borderRadius: '4px',
              }}
            />
          )}
        </div>
      )}

      {/* Error state */}
      {hasError && (
        <div
          className="image-error"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: '#fee2e2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#dc2626',
            fontSize: '14px',
          }}
        >
          Failed to load image
        </div>
      )}

      {/* Actual image */}
      {shouldShowImage && (
        <img
          ref={imgRef}
          src={imageSrc}
          srcSet={generateSrcSet()}
          sizes={sizes}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={handleLoad}
          onError={handleError}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'opacity 0.3s ease',
            opacity: isLoaded ? 1 : 0,
          }}
        />
      )}
    </div>
  )
}

export default OptimizedImage
