/**
 * Cache warming API endpoint
 * Based on requirements 5.2, 5.6
 */

import { NextRequest, NextResponse } from 'next/server'
import { CacheWarmer } from '../../../../utils/cache'
import { withErrorHandling, validateRequestMethod } from '../../../../utils/error-handler'

/**
 * POST /api/cache/warm - Warm cache for popular content
 */
export const POST = withErrorHandling(async (req: NextRequest) => {
  validateRequestMethod(req, ['POST'])

  const cacheWarmer = CacheWarmer.getInstance()

  try {
    // Get the base URL from the request
    const baseUrl = `${req.nextUrl.protocol}//${req.nextUrl.host}`

    // Add popular content URLs to warming queue
    const popularUrls = cacheWarmer.getPopularContent().map((path: string) => `${baseUrl}${path}`)

    // Add custom URLs from request body if provided
    const body = await req.json().catch(() => ({}))
    const customUrls: string[] = body.urls || []

    // Add all URLs to warming queue
    const allUrls = [...popularUrls, ...customUrls]
    allUrls.forEach((url: string) => {
      cacheWarmer.addToWarmingQueue(url)
    })

    // Start cache warming process
    await cacheWarmer.warmCache()

    return NextResponse.json({
      success: true,
      data: {
        message: 'Cache warming completed',
        warmedUrls: allUrls,
        timestamp: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Cache warming failed:', error)

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'CACHE_WARMING_FAILED',
          message: 'Failed to warm cache',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
})

/**
 * GET /api/cache/warm - Get cache warming status and popular URLs
 */
export const GET = withErrorHandling(async (req: NextRequest) => {
  validateRequestMethod(req, ['GET'])

  const cacheWarmer = CacheWarmer.getInstance()
  const popularUrls = cacheWarmer.getPopularContent()

  return NextResponse.json({
    success: true,
    data: {
      popularUrls,
      description: 'These URLs are automatically warmed when cache warming is triggered',
      timestamp: new Date().toISOString(),
    },
    timestamp: new Date().toISOString(),
  })
})
