'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { sliderData, SliderDataItem } from './sliderData'

import './Slider.css'
import AnimatedLink from '../AnimatedLink'
import ShuffleText from '../ShuffleText/ShuffleText'

interface SliderState {
  currentX: number
  targetX: number
  slideWidth: number
  slides: HTMLDivElement[]
  isDragging: boolean
  startX: number
  lastX: number
  lastMouseX: number
  lastScrollTime: number
  isMoving: boolean
  velocity: number
  lastCurrentX: number
  dragDistance: number
  hasActuallyDragged: boolean
  isMobile: boolean
  isHovered: boolean
  marqueeSpeed: number
  lastUserInteraction: number
  marqueeEnabled: boolean
}

const Slider = (): React.JSX.Element => {
  const sliderRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    const config = {
      SCROLL_SPEED: 1.75,
      LERP_FACTOR: 0.05,
      MAX_VELOCITY: 150,
    }

    const totalSlideCount = sliderData.length

    const state: SliderState = {
      currentX: 0,
      targetX: 0,
      slideWidth: 390,
      slides: [],
      isDragging: false,
      startX: 0,
      lastX: 0,
      lastMouseX: 0,
      lastScrollTime: Date.now(),
      isMoving: false,
      velocity: 0,
      lastCurrentX: 0,
      dragDistance: 0,
      hasActuallyDragged: false,
      isMobile: false,
      // Marquee state
      isHovered: false,
      marqueeSpeed: 1.5,
      lastUserInteraction: Date.now(),
      marqueeEnabled: true,
    }

    function checkMobile(): void {
      state.isMobile = window.innerWidth < 1000
    }

    function createSlideElement(index: number): HTMLDivElement {
      const slide = document.createElement('div')
      slide.className = 'slide'

      if (state.isMobile) {
        slide.style.width = '300px'
        slide.style.height = '200px'
      }

      const imageContainer = document.createElement('div')
      imageContainer.className = 'slide-image'

      const img = document.createElement('img')
      const dataIndex = index % totalSlideCount
      img.src = sliderData[dataIndex].img
      img.alt = sliderData[dataIndex].title

      const overlay = document.createElement('div')
      overlay.className = 'slide-overlay'

      const title = document.createElement('p')
      title.className = 'project-title'
      title.textContent = sliderData[dataIndex].title

      const arrow = document.createElement('div')
      arrow.className = 'project-arrow'
      arrow.innerHTML = `
        <svg viewBox="0 0 24 24">
          <path d="M7 17L17 7M17 7H7M17 7V17"/>
        </svg>
      `

      slide.addEventListener('click', (e) => {
        e.preventDefault()
        if (state.dragDistance < 10 && !state.hasActuallyDragged) {
          router.push(sliderData[dataIndex].url)
        }
      })

      // Add hover listeners for marquee control
      slide.addEventListener('mouseenter', () => {
        state.isHovered = true
      })

      slide.addEventListener('mouseleave', () => {
        state.isHovered = false
      })

      overlay.appendChild(title)
      overlay.appendChild(arrow)
      imageContainer.appendChild(img)
      slide.appendChild(imageContainer)
      slide.appendChild(overlay)

      return slide
    }

    function initializeSlides(): void {
      const track = sliderRef.current?.querySelector('.slide-track')
      if (!track) return

      track.innerHTML = ''
      state.slides = []

      checkMobile()
      state.slideWidth = state.isMobile ? 215 : 390

      const copies = 6
      const totalSlides = totalSlideCount * copies

      for (let i = 0; i < totalSlides; i++) {
        const slide = createSlideElement(i)
        track.appendChild(slide)
        state.slides.push(slide)
      }

      const startOffset = -(totalSlideCount * state.slideWidth * 2)
      state.currentX = startOffset
      state.targetX = startOffset
    }

    // Apply a CSS class to the root slider element when touch-capable / mobile
    function updateTouchClass(): void {
      const el = sliderRef.current
      if (!el) return
      const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
      if (isTouch) {
        el.classList.add('touch-device')
      } else {
        el.classList.remove('touch-device')
      }
    }

    function updateSlidePositions(): void {
      const track = sliderRef.current?.querySelector('.slide-track')
      if (!track) return

      const sequenceWidth = state.slideWidth * totalSlideCount

      if (state.currentX > -sequenceWidth * 1) {
        state.currentX -= sequenceWidth
        state.targetX -= sequenceWidth
      } else if (state.currentX < -sequenceWidth * 4) {
        state.currentX += sequenceWidth
        state.targetX += sequenceWidth
      }

      if (track) (track as HTMLElement).style.transform = `translate3d(${state.currentX}px, 0, 0)`
    }

    function updateParallax(): void {
      const viewportCenter = window.innerWidth / 2

      state.slides.forEach((slide) => {
        const img = slide.querySelector('img')
        if (!img) return

        const slideRect = slide.getBoundingClientRect()

        if (slideRect.right < -500 || slideRect.left > window.innerWidth + 500) {
          return
        }

        const slideCenter = slideRect.left + slideRect.width / 2
        const distanceFromCenter = slideCenter - viewportCenter
        const parallaxOffset = distanceFromCenter * -0.25

        img.style.transform = `translateX(${parallaxOffset}px) scale(2.25)`
      })
    }

    function updateMovingState(): void {
      state.velocity = Math.abs(state.currentX - state.lastCurrentX)
      state.lastCurrentX = state.currentX

      const isSlowEnough = state.velocity < 0.1
      const hasBeenStillLongEnough = Date.now() - state.lastScrollTime > 200
      state.isMoving = state.hasActuallyDragged || !isSlowEnough || !hasBeenStillLongEnough

      document.documentElement.style.setProperty('--slider-moving', state.isMoving ? '1' : '0')
    }

    function updateMarquee(): void {
      // Only apply marquee if:
      // 1. User hasn't interacted recently (3 seconds)
      // 2. No slide is being hovered
      // 3. User isn't dragging
      // 4. Slider isn't currently moving from user interaction
      const timeSinceInteraction = Date.now() - state.lastUserInteraction
      const shouldMarquee =
        timeSinceInteraction > 3000 &&
        !state.isHovered &&
        !state.isDragging &&
        !state.isMoving &&
        state.marqueeEnabled

      if (shouldMarquee) {
        // Apply marquee directly to currentX for smooth continuous movement
        // This bypasses the LERP interpolation that was causing jumpiness
        state.currentX -= state.marqueeSpeed
        state.targetX -= state.marqueeSpeed
      }
    }

    function animate(): void {
      // Apply LERP interpolation first
      state.currentX += (state.targetX - state.currentX) * config.LERP_FACTOR

      // Then apply marquee for smooth continuous movement
      updateMarquee()

      updateMovingState()
      updateSlidePositions()
      updateParallax()

      requestAnimationFrame(animate)
    }

    function handleWheel(e: WheelEvent): void {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        return
      }

      e.preventDefault()
      state.lastScrollTime = Date.now()
      state.lastUserInteraction = Date.now() // Reset marquee timer

      const scrollDelta = e.deltaY * config.SCROLL_SPEED
      state.targetX -= Math.max(Math.min(scrollDelta, config.MAX_VELOCITY), -config.MAX_VELOCITY)
    }

    function handleTouchStart(e: TouchEvent): void {
      state.isDragging = true
      state.startX = e.touches[0].clientX
      state.lastX = state.targetX
      state.dragDistance = 0
      state.hasActuallyDragged = false
      state.lastScrollTime = Date.now()
      state.lastUserInteraction = Date.now() // Reset marquee timer
    }

    function handleTouchMove(e: TouchEvent): void {
      if (!state.isDragging) return

      const deltaX = (e.touches[0].clientX - state.startX) * 1.5
      state.targetX = state.lastX + deltaX
      state.dragDistance = Math.abs(deltaX)

      if (state.dragDistance > 5) {
        state.hasActuallyDragged = true
      }

      state.lastScrollTime = Date.now()
      state.lastUserInteraction = Date.now() // Reset marquee timer
    }

    function handleTouchEnd(): void {
      state.isDragging = false
      setTimeout(() => {
        state.hasActuallyDragged = false
      }, 100)
    }

    function handleMouseDown(e: MouseEvent): void {
      e.preventDefault()
      state.isDragging = true
      state.startX = e.clientX
      state.lastMouseX = e.clientX
      state.lastX = state.targetX
      state.dragDistance = 0
      state.hasActuallyDragged = false
      state.lastScrollTime = Date.now()
      state.lastUserInteraction = Date.now() // Reset marquee timer
    }

    function handleMouseMove(e: MouseEvent): void {
      if (!state.isDragging) return

      e.preventDefault()
      const deltaX = (e.clientX - state.lastMouseX) * 2
      state.targetX += deltaX
      state.lastMouseX = e.clientX
      state.dragDistance += Math.abs(deltaX)

      if (state.dragDistance > 5) {
        state.hasActuallyDragged = true
      }

      state.lastScrollTime = Date.now()
      state.lastUserInteraction = Date.now() // Reset marquee timer
    }

    function handleMouseUp(): void {
      state.isDragging = false
      setTimeout(() => {
        state.hasActuallyDragged = false
      }, 100)
    }

    function handleResize(): void {
      initializeSlides()
      updateTouchClass()
    }

    function initializeEventListeners(): (() => void) | undefined {
      const slider = sliderRef.current
      if (!slider) return

      slider.addEventListener('wheel', handleWheel, { passive: false })
      slider.addEventListener('touchstart', handleTouchStart)
      slider.addEventListener('touchmove', handleTouchMove)
      slider.addEventListener('touchend', handleTouchEnd)
      slider.addEventListener('mousedown', handleMouseDown)
      slider.addEventListener('mouseleave', handleMouseUp)
      slider.addEventListener('dragstart', (e) => e.preventDefault())

      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      window.addEventListener('resize', handleResize)

      return () => {
        slider.removeEventListener('wheel', handleWheel)
        slider.removeEventListener('touchstart', handleTouchStart)
        slider.removeEventListener('touchmove', handleTouchMove)
        slider.removeEventListener('touchend', handleTouchEnd)
        slider.removeEventListener('mousedown', handleMouseDown)
        slider.removeEventListener('mouseleave', handleMouseUp)
        slider.removeEventListener('dragstart', (e) => e.preventDefault())

        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
        window.removeEventListener('resize', handleResize)
      }
    }

    function initializeSlider(): (() => void) | undefined {
      initializeSlides()
      updateTouchClass()
      const cleanup = initializeEventListeners()
      animate()
      return cleanup
    }

    const cleanup = initializeSlider()

    return cleanup
  }, [router])

  return (
    <div className="slider" ref={sliderRef}>
      <div className="text-bar">
        <div className="text-head">
          <ShuffleText as="h5" text="Projects" triggerOnScroll={true} />
          <div className="number">
            <p>{sliderData.length}</p>
          </div>
        </div>

        <AnimatedLink
          lastColor="#ffffff"
          textColor="#ffffff"
          strokeColor="#ffffff"
          href="/portfolio"
          text="View all projects"
        />
      </div>
      <div className="slide-track"></div>
    </div>
  )
}

export default Slider
