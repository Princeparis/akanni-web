/**
 * Categories API route with journal counts
 * Based on requirements 3.6, 3.4, 3.5
 */

import { NextRequest } from 'next/server'
import { getPayload } from 'payload'
import config from '../../../../payload.config'
import {
  withErrorHandling,
  validateRequestMethod,
  parseQueryParams,
  createSuccessResponse,
} from '../../../../utils/error-handler'
import { APIError, ErrorCodes } from '../../../../types/errors'
import { Category } from '../../../../payload-types'
import { HTTP_STATUS, CACHE_DURATION } from '../../../../utils/constants'

/**
 * GET /api/categories - Retrieve categories with journal counts and sorting options
 */
export const GET = withErrorHandling(async (req: NextRequest) => {
  validateRequestMethod(req, ['GET'])

  const { searchParams } = new URL(req.url)
  const queryParams = parseQueryParams(searchParams)

  // Parse sorting options
  const sortOptions = parseCategorySortOptions(queryParams)

  // Get Payload instance
  const payload = await getPayload({ config })

  try {
    // Fetch all categories
    const categoriesResult = await payload.find({
      collection: 'categories',
      limit: 1000, // Categories should be limited in number
      sort: sortOptions.field === 'journalCount' ? 'name' : sortOptions.field, // We'll sort by count manually
    })

    // Get journal counts for each category
    const categoriesWithCounts = await Promise.all(
      categoriesResult.docs.map(async (category: any) => {
        const journalCount = await payload.count({
          collection: 'journals',
          where: {
            'category.id': {
              equals: category.id,
            },
            status: {
              equals: 'published', // Only count published journals
            },
          },
        })

        return {
          ...category,
          journalCount: journalCount.totalDocs,
        }
      }),
    )

    // Sort by journal count if requested
    let sortedCategories = categoriesWithCounts
    if (sortOptions.field === 'journalCount') {
      sortedCategories = categoriesWithCounts.sort((a, b) => {
        const aCount = a.journalCount || 0
        const bCount = b.journalCount || 0
        return sortOptions.order === 'asc' ? aCount - bCount : bCount - aCount
      })
    } else if (sortOptions.field === 'name') {
      sortedCategories = categoriesWithCounts.sort((a, b) => {
        const comparison = a.name.localeCompare(b.name)
        return sortOptions.order === 'asc' ? comparison : -comparison
      })
    }

    // Create response with caching headers
    const successResponse = createSuccessResponse(sortedCategories)

    // Add cache headers for performance optimization
    successResponse.headers.set(
      'Cache-Control',
      `public, max-age=${CACHE_DURATION.LONG}, stale-while-revalidate=${CACHE_DURATION.MEDIUM}`,
    )
    successResponse.headers.set('ETag', generateETag(sortedCategories))

    return successResponse
  } catch (error) {
    console.error('Error fetching categories:', error)
    throw new APIError(
      ErrorCodes.INTERNAL_ERROR,
      'Failed to fetch categories',
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      error,
    )
  }
})

/**
 * Parse and validate category sort options
 */
function parseCategorySortOptions(params: any): { field: string; order: string } {
  let field = 'name' // Default sort by name
  let order = 'asc' // Default ascending order

  // Validate sort field
  if (params.sortBy && ['name', 'journalCount', 'createdAt'].includes(params.sortBy)) {
    field = params.sortBy
  }

  // Validate sort order
  if (params.sortOrder && ['asc', 'desc'].includes(params.sortOrder)) {
    order = params.sortOrder
  }

  return { field, order }
}

/**
 * Generate ETag for caching
 */
function generateETag(data: any): string {
  const hash = require('crypto').createHash('md5').update(JSON.stringify(data)).digest('hex')
  return `"${hash}"`
}
