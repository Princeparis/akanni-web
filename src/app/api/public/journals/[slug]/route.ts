/**
 * Individual journal entry API route
 * Based on requirements 3.3, 3.4, 3.5
 */

import { NextRequest } from 'next/server'
import { getPayload } from 'payload'
import config from '../../../../../payload.config'
import {
  withErrorHandling,
  validateRequestMethod,
  createSuccessResponse,
} from '../../../../../utils/error-handler'
import { APIError, ErrorCodes } from '../../../../../types/errors'
import { Journal } from '../../../../../payload-types'
import { HTTP_STATUS, CACHE_DURATION } from '../../../../../utils/constants'

interface RouteParams {
  params: {
    slug: string
  }
}

/**
 * GET /api/journals/[slug] - Retrieve a single journal entry by slug
 */
export const GET = withErrorHandling(async (req: NextRequest, { params }: RouteParams) => {
  validateRequestMethod(req, ['GET'])

  const { slug } = params

  if (!slug || typeof slug !== 'string') {
    throw new APIError(
      ErrorCodes.VALIDATION_ERROR,
      'Invalid or missing slug parameter',
      HTTP_STATUS.BAD_REQUEST,
    )
  }

  // Get Payload instance
  const payload = await getPayload({ config })

  try {
    // Find journal entry by slug with populated relationships
    const result = await payload.find({
      collection: 'journals',
      where: {
        slug: {
          equals: slug,
        },
      },
      limit: 1,
      depth: 2,
    })

    // Check if journal entry exists
    if (!result.docs || result.docs.length === 0) {
      throw new APIError(
        ErrorCodes.NOT_FOUND,
        `Journal entry with slug '${slug}' not found`,
        HTTP_STATUS.NOT_FOUND,
      )
    }

    const journalEntry = result.docs[0] as Journal

    // Check if entry is published (unless user is authenticated)
    // For now, we'll allow access to all entries, but this can be modified based on auth requirements
    if (journalEntry.status === 'draft') {
      // In a real application, you would check if the user is authenticated here
      // For now, we'll return draft entries as well
      console.warn(`Returning draft entry: ${slug}`)
    }

    // Create response with caching headers
    const successResponse = createSuccessResponse(journalEntry)

    // Add cache headers for performance optimization
    // Use longer cache for published entries, shorter for drafts
    const cacheMaxAge =
      journalEntry.status === 'published' ? CACHE_DURATION.LONG : CACHE_DURATION.SHORT

    successResponse.headers.set(
      'Cache-Control',
      `public, max-age=${cacheMaxAge}, stale-while-revalidate=${CACHE_DURATION.SHORT}`,
    )
    successResponse.headers.set('ETag', generateETag(journalEntry))

    // Add Last-Modified header
    const lastModified = journalEntry.updatedAt || journalEntry.createdAt
    successResponse.headers.set('Last-Modified', new Date(lastModified).toUTCString())

    return successResponse
  } catch (error) {
    // Re-throw APIErrors as they are already properly formatted
    if (error instanceof APIError) {
      throw error
    }

    console.error('Error fetching journal entry:', error)
    throw new APIError(
      ErrorCodes.INTERNAL_ERROR,
      'Failed to fetch journal entry',
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      error,
    )
  }
})

/**
 * Generate ETag for caching
 */
function generateETag(data: any): string {
  const hash = require('crypto')
    .createHash('md5')
    .update(
      JSON.stringify({
        id: data.id,
        updatedAt: data.updatedAt,
        status: data.status,
      }),
    )
    .digest('hex')
  return `"${hash}"`
}
