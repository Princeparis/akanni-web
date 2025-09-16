/**
 * Cache metrics API endpoint for performance monitoring
 * Based on requirements 5.2, 5.6
 */

import { NextRequest, NextResponse } from 'next/server'
import { CacheMetrics } from '../../../../utils/cache'
import { withErrorHandling, validateRequestMethod } from '../../../../utils/error-handler'

/**
 * GET /api/cache/metrics - Get cache performance metrics
 */
export const GET = withErrorHandling(async (req: NextRequest) => {
  validateRequestMethod(req, ['GET'])

  // Get cache metrics
  const metrics = CacheMetrics.getMetrics()

  // Calculate overall statistics
  const overallStats = Object.values(metrics).reduce(
    (acc: any, metric: any) => {
      acc.totalHits += metric.hits
      acc.totalMisses += metric.misses
      acc.totalRequests += metric.total
      return acc
    },
    { totalHits: 0, totalMisses: 0, totalRequests: 0 },
  )

  const overallHitRate =
    overallStats.totalRequests > 0
      ? ((overallStats.totalHits / overallStats.totalRequests) * 100).toFixed(2) + '%'
      : '0%'

  const response = {
    overall: {
      ...overallStats,
      hitRate: overallHitRate,
    },
    byEndpoint: metrics,
    timestamp: new Date().toISOString(),
  }

  return NextResponse.json({
    success: true,
    data: response,
    timestamp: new Date().toISOString(),
  })
})

/**
 * DELETE /api/cache/metrics - Clear old cache metrics
 */
export const DELETE = withErrorHandling(async (req: NextRequest) => {
  validateRequestMethod(req, ['DELETE'])

  const { searchParams } = new URL(req.url)
  const hoursParam = searchParams.get('hours')
  const hours = hoursParam ? parseInt(hoursParam, 10) : 24

  if (isNaN(hours) || hours < 1) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid hours parameter. Must be a positive integer.',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 400 },
    )
  }

  // Clear old metrics
  CacheMetrics.clearOldMetrics(hours)

  return NextResponse.json({
    success: true,
    data: {
      message: `Cleared metrics older than ${hours} hours`,
      clearedAt: new Date().toISOString(),
    },
    timestamp: new Date().toISOString(),
  })
})
