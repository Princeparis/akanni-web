/**
 * Journals API route with pagination and filtering
 * Based on requirements 3.1, 3.2, 3.4, 3.5, 3.7
 */

import { NextRequest } from 'next/server'
import { getPayload } from 'payload'
import config from '../../../../payload.config'
import {
  withErrorHandling,
  validateRequestMethod,
  parseQueryParams,
  validatePaginationParams,
  createSuccessResponse,
} from '../../../../utils/error-handler'
import { APIError, ErrorCodes } from '../../../../types/errors'
import { JournalQueryParams } from '../../../../types/api'
import { Journal, Category, Tag } from '../../../../payload-types'
import {
  HTTP_STATUS,
  CACHE_DURATION,
  SORT_OPTIONS,
  SORT_ORDER,
  DEFAULTS,
} from '../../../../utils/constants'
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
 * GET /api/journals - Retrieve paginated journal entries with filtering
 */
export const GET = withErrorHandling(async (req: NextRequest) => {
  validateRequestMethod(req, ['GET'])

  const { searchParams } = new URL(req.url)
  const queryParams = parseQueryParams(searchParams)

  // Validate and parse pagination parameters
  const { page, limit } = validatePaginationParams(queryParams)

  // Parse and validate query parameters
  const filters = parseJournalFilters(queryParams)
  const sortOptions = parseSortOptions(queryParams)

  // Get Payload instance
  const payload = await getPayload({ config })

  // Build query conditions
  const where = buildWhereConditions(filters)

  try {
    // Generate cache key for this request
    const cacheKey = generateCacheKey({
      collection: 'journals',
      operation: 'list',
      params: { ...filters, page, limit, ...sortOptions },
    })

    // Fetch journals with pagination and filtering
    const journalsResult = await payload.find({
      collection: 'journals',
      where,
      limit,
      page,
      sort: `${sortOptions.order === 'asc' ? '' : '-'}${sortOptions.field}`,
      depth: 2,
    })

    // Fetch categories and tags for filter options
    const [categoriesResult, tagsResult] = await Promise.all([
      payload.find({
        collection: 'categories',
        limit: 100,
        sort: 'name',
      }),
      payload.find({
        collection: 'tags',
        limit: 100,
        sort: 'name',
      }),
    ])

    // Transform the response to match our interface
    const response = {
      docs: journalsResult.docs as Journal[],
      totalDocs: journalsResult.totalDocs,
      limit: journalsResult.limit,
      page: journalsResult.page || 1,
      totalPages: journalsResult.totalPages,
      hasNextPage: journalsResult.hasNextPage,
      hasPrevPage: journalsResult.hasPrevPage,
      nextPage: journalsResult.nextPage || undefined,
      prevPage: journalsResult.prevPage || undefined,
      categories: categoriesResult.docs as Category[],
      tags: tagsResult.docs as Tag[],
    }

    // Determine last modified date from the most recent journal entry
    const lastModified =
      journalsResult.docs.length > 0
        ? new Date(
            Math.max(
              ...journalsResult.docs.map((doc) =>
                new Date(doc.updatedAt || doc.createdAt).getTime(),
              ),
            ),
          )
        : new Date()

    // Generate ETag for cache validation
    const etag = generateETag(response, lastModified)

    // Check if client has cached version
    if (checkCacheHeaders(req, etag, lastModified)) {
      CacheMetrics.recordHit(cacheKey)
      return createNotModifiedResponse()
    }

    // Record cache miss
    CacheMetrics.recordMiss(cacheKey)

    // Create response with enhanced caching headers
    const successResponse = createSuccessResponse(response)

    // Determine cache config based on content type
    const cacheConfig = filters.search ? CACHE_CONFIGS.SEARCH_RESULTS : CACHE_CONFIGS.JOURNAL_LIST

    // Add comprehensive cache headers
    addCacheHeaders(successResponse, cacheConfig, etag, lastModified)

    return successResponse
  } catch (error) {
    console.error('Error fetching journals:', error)
    throw new APIError(
      ErrorCodes.INTERNAL_ERROR,
      'Failed to fetch journal entries',
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      error,
    )
  }
})

/**
 * Parse and validate journal filter parameters
 */
function parseJournalFilters(params: any): JournalQueryParams {
  const filters: JournalQueryParams = {}

  // Category filter
  if (params.category && typeof params.category === 'string') {
    filters.category = params.category.trim()
  }

  // Tags filter (can be array or single value)
  if (params.tags) {
    if (Array.isArray(params.tags)) {
      filters.tags = params.tags.filter((tag: any) => typeof tag === 'string' && tag.trim())
    } else if (typeof params.tags === 'string') {
      filters.tags = [params.tags.trim()].filter(Boolean)
    }
  }

  // Status filter
  if (params.status && ['draft', 'published'].includes(params.status)) {
    filters.status = params.status as 'draft' | 'published'
  }

  // Search filter
  if (params.search && typeof params.search === 'string') {
    filters.search = params.search.trim()
  }

  return filters
}

/**
 * Parse and validate sort options
 */
function parseSortOptions(params: any): { field: string; order: string } {
  let field = DEFAULTS.SORT_BY
  let order = DEFAULTS.SORT_ORDER

  // Validate sort field
  if (params.sortBy && Object.values(SORT_OPTIONS).includes(params.sortBy)) {
    field = params.sortBy
  }

  // Validate sort order
  if (params.sortOrder && Object.values(SORT_ORDER).includes(params.sortOrder)) {
    order = params.sortOrder
  }

  return { field, order }
}

/**
 * Build where conditions for Payload query
 */
function buildWhereConditions(filters: JournalQueryParams): any {
  const conditions: any = {}

  // Category filter
  if (filters.category) {
    conditions['category.slug'] = {
      equals: filters.category,
    }
  }

  // Tags filter
  if (filters.tags && filters.tags.length > 0) {
    conditions['tags.slug'] = {
      in: filters.tags,
    }
  }

  // Status filter
  if (filters.status) {
    conditions.status = {
      equals: filters.status,
    }
  }

  // Search filter (search in title and excerpt)
  if (filters.search) {
    conditions.or = [
      {
        title: {
          contains: filters.search,
        },
      },
      {
        excerpt: {
          contains: filters.search,
        },
      },
    ]
  }

  return conditions
}
