/**
 * Error handling utilities and middleware
 * Based on requirements 4.2 and 7.1
 */

import { NextRequest, NextResponse } from 'next/server'
import { APIError, ErrorCodes, ErrorResponse } from '../types/errors'
import { HTTP_STATUS } from './constants'

/**
 * Creates a standardized error response
 */
export function createErrorResponse(
  code: ErrorCodes,
  message: string,
  statusCode: number = HTTP_STATUS.BAD_REQUEST,
  details?: any,
  field?: string,
): NextResponse<ErrorResponse> {
  const errorResponse: ErrorResponse = {
    success: false,
    error: {
      code,
      message,
      ...(field && { field }),
      ...(details && { details }),
    },
    timestamp: new Date().toISOString(),
  }

  return NextResponse.json(errorResponse, { status: statusCode })
}

/**
 * Creates a standardized success response
 */
export function createSuccessResponse<T>(
  data: T,
  statusCode: number = HTTP_STATUS.OK,
): NextResponse {
  return NextResponse.json(
    {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    },
    { status: statusCode },
  )
}

/**
 * Error handling middleware for API routes
 */
export function withErrorHandling<T>(handler: (req: NextRequest, context: any) => Promise<T>) {
  return async (req: NextRequest, context: any) => {
    try {
      const result = await handler(req, context)
      return createSuccessResponse(result)
    } catch (error) {
      console.error('API Error:', error)

      if (error instanceof APIError) {
        return createErrorResponse(error.code, error.message, error.statusCode, error.details)
      }

      // Handle Payload CMS validation errors
      if (error && typeof error === 'object' && 'data' in error) {
        const payloadError = error as any
        if (payloadError.data && Array.isArray(payloadError.data)) {
          const validationErrors = payloadError.data.map((err: any) => ({
            field: err.field,
            message: err.message,
          }))

          return createErrorResponse(
            ErrorCodes.VALIDATION_ERROR,
            'Validation failed',
            HTTP_STATUS.UNPROCESSABLE_ENTITY,
            validationErrors,
          )
        }
      }

      // Handle generic errors
      if (error instanceof Error) {
        return createErrorResponse(
          ErrorCodes.INTERNAL_ERROR,
          'An unexpected error occurred',
          HTTP_STATUS.INTERNAL_SERVER_ERROR,
          process.env.NODE_ENV === 'development' ? error.message : undefined,
        )
      }

      // Fallback for unknown errors
      return createErrorResponse(
        ErrorCodes.INTERNAL_ERROR,
        'An unexpected error occurred',
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      )
    }
  }
}

/**
 * Validates request method
 */
export function validateRequestMethod(req: NextRequest, allowedMethods: string[]): void {
  if (!allowedMethods.includes(req.method)) {
    throw new APIError(
      ErrorCodes.VALIDATION_ERROR,
      `Method ${req.method} not allowed. Allowed methods: ${allowedMethods.join(', ')}`,
      405,
    )
  }
}

/**
 * Parses and validates query parameters
 */
export function parseQueryParams(searchParams: URLSearchParams) {
  const params: Record<string, any> = {}

  for (const [key, value] of searchParams.entries()) {
    // Handle array parameters (e.g., tags[]=tag1&tags[]=tag2)
    if (key.endsWith('[]')) {
      const arrayKey = key.slice(0, -2)
      if (!params[arrayKey]) {
        params[arrayKey] = []
      }
      params[arrayKey].push(value)
    } else {
      params[key] = value
    }
  }

  return params
}

/**
 * Validates pagination parameters
 */
export function validatePaginationParams(params: any): {
  page: number
  limit: number
} {
  let page = 1
  let limit = 10

  if (params.page) {
    const parsedPage = parseInt(params.page, 10)
    if (isNaN(parsedPage) || parsedPage < 1) {
      throw new APIError(
        ErrorCodes.VALIDATION_ERROR,
        'Page must be a positive integer',
        HTTP_STATUS.BAD_REQUEST,
      )
    }
    page = parsedPage
  }

  if (params.limit) {
    const parsedLimit = parseInt(params.limit, 10)
    if (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 100) {
      throw new APIError(
        ErrorCodes.VALIDATION_ERROR,
        'Limit must be between 1 and 100',
        HTTP_STATUS.BAD_REQUEST,
      )
    }
    limit = parsedLimit
  }

  return { page, limit }
}
