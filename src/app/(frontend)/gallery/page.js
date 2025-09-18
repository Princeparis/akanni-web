'use client'

import { useEffect, useRef, useState } from 'react'
import Menu from '@/components/menu/Menu'
import './Gallery.css'

export default function Gallery() {
  const containerRef = useRef(null)
  const itemsRef = useRef(null)
  const indicatorRef = useRef(null)
  const previewImageRef = useRef(null)
  const itemRefs = useRef([])
  const animationFrameRef = useRef(null)

  const translateRef = useRef({
    current: 0,
    target: 0,
    max: 0,
  })

  const [isHorizontal, setIsHorizontal] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const dimensionsRef = useRef({
    itemSize: 0,
    containerSize: 0,
    indicatorSize: 0,
  })

  const activeItemOpacity = 0.3
  const images = Array.from({ length: 15 }, (_, i) => `/assets/img${i + 1}.jpeg`)
  const isClickMoveRef = useRef(false)

  const lerp = (start, end, factor) => {
    return start + (end - start) * factor
  }

  const updateDimensions = () => {
    const newIsHorizontal = window.innerWidth <= 900
    const firstItem = itemRefs.current[0]

    if (!firstItem) return

    const newDimensions = {
      itemSize: newIsHorizontal
        ? firstItem.getBoundingClientRect().width
        : firstItem.getBoundingClientRect().height,
      containerSize: newIsHorizontal
        ? itemsRef.current.scrollWidth
        : itemsRef.current.getBoundingClientRect().height,
      indicatorSize: newIsHorizontal
        ? indicatorRef.current.getBoundingClientRect().width
        : indicatorRef.current.getBoundingClientRect().height,
    }

    dimensionsRef.current = newDimensions
    translateRef.current.max = newDimensions.containerSize - newDimensions.indicatorSize

    if (isHorizontal !== newIsHorizontal) {
      setIsHorizontal(newIsHorizontal)
    }
  }

  const getItemInIndicator = () => {
    itemRefs.current.forEach((item) => {
      if (item?.querySelector('img')) {
        item.querySelector('img').style.opacity = '1'
      }
    })

    const indicatorStart = -translateRef.current.current
    const indicatorEnd = indicatorStart + dimensionsRef.current.indicatorSize

    let maxOverlap = 0
    let selectedIndex = 0

    itemRefs.current.forEach((item, index) => {
      const itemStart = index * dimensionsRef.current.itemSize
      const itemEnd = itemStart + dimensionsRef.current.itemSize

      const overlapStart = Math.max(indicatorStart, itemStart)
      const overlapEnd = Math.min(indicatorEnd, itemEnd)
      const overlap = Math.max(0, overlapEnd - overlapStart)

      if (overlap > maxOverlap) {
        maxOverlap = overlap
        selectedIndex = index
      }
    })

    if (itemRefs.current[selectedIndex]?.querySelector('img')) {
      itemRefs.current[selectedIndex].querySelector('img').style.opacity = activeItemOpacity
    }
    return selectedIndex
  }

  const updatePreviewImage = (index) => {
    if (currentImageIndex !== index) {
      setCurrentImageIndex(index)
      if (previewImageRef.current) {
        previewImageRef.current.src = images[index]
      }
    }
  }

  const animate = () => {
    const lerpFactor = isClickMoveRef.current ? 0.05 : 0.075
    translateRef.current.current = lerp(
      translateRef.current.current,
      translateRef.current.target,
      lerpFactor,
    )

    if (Math.abs(translateRef.current.current - translateRef.current.target) > 0.01) {
      const transform = isHorizontal
        ? `translateX(${translateRef.current.current}px)`
        : `translateY(${translateRef.current.current}px)`

      if (itemsRef.current) {
        itemsRef.current.style.transform = transform
      }

      const activeIndex = getItemInIndicator()
      updatePreviewImage(activeIndex)
    } else {
      isClickMoveRef.current = false
    }

    animationFrameRef.current = requestAnimationFrame(animate)
  }

  useEffect(() => {
    const handleWheel = (e) => {
      e.preventDefault()
      isClickMoveRef.current = false

      const delta = e.deltaY
      const scrollVelocity = Math.min(Math.max(delta * 0.5, -20), 20)

      translateRef.current.target = Math.min(
        Math.max(translateRef.current.target - scrollVelocity, -translateRef.current.max),
        0,
      )
    }

    let touchStartY = 0
    const handleTouchStart = (e) => {
      if (isHorizontal) {
        touchStartY = e.touches[0].clientY
      }
    }

    const handleTouchMove = (e) => {
      if (isHorizontal) {
        const touchY = e.touches[0].clientY
        const deltaY = touchStartY - touchY

        const scrollVelocity = Math.min(Math.max(deltaY * 0.5, -20), 20)

        translateRef.current.target = Math.min(
          Math.max(translateRef.current.target - scrollVelocity, -translateRef.current.max),
          0,
        )

        touchStartY = touchY
        e.preventDefault()
      }
    }

    const handleResize = () => {
      updateDimensions()

      translateRef.current.target = Math.min(
        Math.max(translateRef.current.target, -translateRef.current.max),
        0,
      )
      translateRef.current.current = translateRef.current.target

      const transform = isHorizontal
        ? `translateX(${translateRef.current.current}px)`
        : `translateY(${translateRef.current.current}px)`

      if (itemsRef.current) {
        itemsRef.current.style.transform = transform
      }
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false })
      container.addEventListener('touchstart', handleTouchStart)
      container.addEventListener('touchmove', handleTouchMove, {
        passive: false,
      })
    }

    window.addEventListener('resize', handleResize)

    updateDimensions()
    if (itemRefs.current[0]?.querySelector('img')) {
      itemRefs.current[0].querySelector('img').style.opacity = activeItemOpacity
    }
    updatePreviewImage(0)
    animationFrameRef.current = requestAnimationFrame(animate)

    return () => {
      if (container) {
        container.removeEventListener('wheel', handleWheel)
        container.removeEventListener('touchstart', handleTouchStart)
        container.removeEventListener('touchmove', handleTouchMove)
      }
      window.removeEventListener('resize', handleResize)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isHorizontal])

  const handleItemClick = (index) => {
    isClickMoveRef.current = true
    const newTranslate =
      -index * dimensionsRef.current.itemSize +
      (dimensionsRef.current.indicatorSize - dimensionsRef.current.itemSize) / 2

    translateRef.current.target = Math.max(Math.min(newTranslate, 0), -translateRef.current.max)
  }

  return (
    <div className="container" ref={containerRef}>
      <Menu />
      <div className="img-preview">
        <img ref={previewImageRef} src={images[0]} alt="" />
      </div>

      <div className="minimap">
        <div className="indicator" ref={indicatorRef}></div>
        <div className="items" ref={itemsRef}>
          {images.map((src, index) => (
            <div
              key={src}
              className="item"
              ref={(el) => (itemRefs.current[index] = el)}
              onClick={() => handleItemClick(index)}
            >
              <img src={src} alt="" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
