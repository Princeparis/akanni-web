/**
 * Tags API route with usage statistics
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
import { Tag } from '../../../../payload-types'
import { HTTP_STATUS, CACHE_DURATION } from '../../../../utils/constants'
import {
  generateCacheKey,
  generateETag,
  addCacheHeaders,
  checkCacheHeaders,
  createNotModifiedResponse,
  CACHE_CONFIGS,
  CacheMetrics,
} from '../../../../utils/cache'

/**
 * GET /api/tags - Retrieve tags with usage statistics and sorting options
 */
export const GET = withErrorHandling(async (req: NextRequest) => {
  validateRequestMethod(req, ['GET'])

  const { searchParams } = new URL(req.url)
  const queryParams = parseQueryParams(searchParams)

  // Parse sorting options
  const sortOptions = parseTagSortOptions(queryParams)

  // Get Payload instance
  const payload = await getPayload({ config })

  try {
    // Generate cache key for this request
    const cacheKey = generateCacheKey({
      collection: 'tags',
      operation: 'list',
      params: { ...sortOptions, hideEmpty: queryParams.hideEmpty },
    })

    // Fetch all tags
    const tagsResult = await payload.find({
      collection: 'tags',
      limit: 1000, // Tags should be reasonable in number
      sort: sortOptions.field === 'journalCount' ? 'name' : sortOptions.field, // We'll sort by count manually
    })

    // Get journal counts for each tag
    const tagsWithCounts = await Promise.all(
      tagsResult.docs.map(async (tag: any) => {
        const journalCount = await payload.count({
          collection: 'journals',
          where: {
            'tags.id': {
              equals: tag.id,
            },
            status: {
              equals: 'published', // Only count published journals
            },
          },
        })

        return {
          ...tag,
          journalCount: journalCount.totalDocs,
        }
      }),
    )

    // Sort by journal count if requested
    let sortedTags = tagsWithCounts
    if (sortOptions.field === 'journalCount') {
      sortedTags = tagsWithCounts.sort((a, b) => {
        const aCount = a.journalCount || 0
        const bCount = b.journalCount || 0
        return sortOptions.order === 'asc' ? aCount - bCount : bCount - aCount
      })
    } else if (sortOptions.field === 'name') {
      sortedTags = tagsWithCounts.sort((a, b) => {
        const comparison = a.name.localeCompare(b.name)
        return sortOptions.order === 'asc' ? comparison : -comparison
      })
    }

    // Filter out tags with zero journal count if requested
    if (queryParams.hideEmpty === 'true') {
      sortedTags = sortedTags.filter((tag) => (tag.journalCount || 0) > 0)
    }

    // Determine last modified date from the most recent tag
    const lastModified =
      tagsResult.docs.length > 0
        ? new Date(
            Math.max(
              ...tagsResult.docs.map((doc) => new Date(doc.updatedAt || doc.createdAt).getTime()),
            ),
          )
        : new Date()

    // Generate ETag for cache validation
    const etag = generateETag(sortedTags, lastModified)

    // Check if client has cached version
    if (checkCacheHeaders(req, etag, lastModified)) {
      CacheMetrics.recordHit(cacheKey)
      return createNotModifiedResponse()
    }

    // Record cache miss
    CacheMetrics.recordMiss(cacheKey)

    // Create response with enhanced caching headers
    const successResponse = createSuccessResponse(sortedTags)

    // Add comprehensive cache headers
    addCacheHeaders(successResponse, CACHE_CONFIGS.TAGS, etag, lastModified)

    return successResponse
  } catch (error) {
    console.error('Error fetching tags:', error)
    throw new APIError(
      ErrorCodes.INTERNAL_ERROR,
      'Failed to fetch tags',
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      error,
    )
  }
})

/**
 * Parse and validate tag sort options
 */
function parseTagSortOptions(params: any): { field: string; order: string } {
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
