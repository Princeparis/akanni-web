/**
 * Performance provider component for initializing performance monitoring
 * Based on requirements 5.3, 5.6
 */

'use client'

import { useEffect } from 'react'
import { initializePerformance } from '../app/performance-init'

interface PerformanceProviderProps {
  children: React.ReactNode
}

export default function PerformanceProvider({ children }: PerformanceProviderProps) {
  useEffect(() => {
    // Initialize performance monitoring on client side
    initializePerformance()
  }, [])

  return <>{children}</>
}
