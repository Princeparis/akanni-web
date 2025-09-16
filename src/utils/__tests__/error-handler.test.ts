/**
 * Unit tests for error handling utilities
 * Tests error response creation, middleware, and validation
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'
import {
  createErrorResponse,
  createSuccessResponse,
  withErrorHandling,
  validateRequestMethod,
  parseQueryParams,
  validatePaginationParams,
} from '../error-handler'
import { APIError, ErrorCodes } from '../../types/errors'
import { HTTP_STATUS } from '../constants'

describe('Error Handler Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createErrorResponse', () => {
    it('should create standardized error response', () => {
      const response = createErrorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'Test error message',
        HTTP_STATUS.BAD_REQUEST,
      )

      expect(response).toBeInstanceOf(NextResponse)
    })

    it('should include field in error response when provided', () => {
      const response = createErrorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'Field validation failed',
        HTTP_STATUS.BAD_REQUEST,
        undefined,
        'email',
      )

      expect(response).toBeInstanceOf(NextResponse)
    })

    it('should include details in error response when provided', () => {
      const details = { validationErrors: ['Field is required'] }
      const response = createErrorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'Validation failed',
        HTTP_STATUS.BAD_REQUEST,
        details,
      )

      expect(response).toBeInstanceOf(NextResponse)
    })

    it('should use default status code when not provided', () => {
      const response = createErrorResponse(ErrorCodes.VALIDATION_ERROR, 'Test error')

      expect(response).toBeInstanceOf(NextResponse)
    })
  })

  describe('createSuccessResponse', () => {
    it('should create standardized success response', () => {
      const data = { id: 1, name: 'Test' }
      const response = createSuccessResponse(data)

      expect(response).toBeInstanceOf(NextResponse)
    })

    it('should use custom status code when provided', () => {
      const data = { created: true }
      const response = createSuccessResponse(data, 201)

      expect(response).toBeInstanceOf(NextResponse)
    })

    it('should include timestamp in response', () => {
      const data = { test: true }
      const response = createSuccessResponse(data)

      expect(response).toBeInstanceOf(NextResponse)
    })
  })

  describe('withErrorHandling', () => {
    it('should wrap handler and return success response', async () => {
      const mockHandler = vi.fn().mockResolvedValue({ data: 'test' })
      const wrappedHandler = withErrorHandling(mockHandler)

      const mockRequest = new NextRequest('http://localhost:3000/test')
      const mockContext = {}

      const response = await wrappedHandler(mockRequest, mockContext)

      expect(mockHandler).toHaveBeenCalledWith(mockRequest, mockContext)
      expect(response).toBeInstanceOf(NextResponse)
    })

    it('should handle APIError correctly', async () => {
      const apiError = new APIError(
        ErrorCodes.NOT_FOUND,
        'Resource not found',
        HTTP_STATUS.NOT_FOUND,
      )
      const mockHandler = vi.fn().mockRejectedValue(apiError)
      const wrappedHandler = withErrorHandling(mockHandler)

      const mockRequest = new NextRequest('http://localhost:3000/test')
      const response = await wrappedHandler(mockRequest, {})

      expect(response).toBeInstanceOf(NextResponse)
    })

    it('should handle Payload validation errors', async () => {
      const payloadError = {
        data: [
          { field: 'email', message: 'Email is required' },
          { field: 'name', message: 'Name is too short' },
        ],
      }
      const mockHandler = vi.fn().mockRejectedValue(payloadError)
      const wrappedHandler = withErrorHandling(mockHandler)

      const mockRequest = new NextRequest('http://localhost:3000/test')
      const response = await wrappedHandler(mockRequest, {})

      expect(response).toBeInstanceOf(NextResponse)
    })

    it('should handle generic Error objects', async () => {
      const genericError = new Error('Something went wrong')
      const mockHandler = vi.fn().mockRejectedValue(genericError)
      const wrappedHandler = withErrorHandling(mockHandler)

      const mockRequest = new NextRequest('http://localhost:3000/test')
      const response = await wrappedHandler(mockRequest, {})

      expect(response).toBeInstanceOf(NextResponse)
    })

    it('should handle unknown error types', async () => {
      const unknownError = 'String error'
      const mockHandler = vi.fn().mockRejectedValue(unknownError)
      const wrappedHandler = withErrorHandling(mockHandler)

      const mockRequest = new NextRequest('http://localhost:3000/test')
      const response = await wrappedHandler(mockRequest, {})

      expect(response).toBeInstanceOf(NextResponse)
    })

    it('should log errors to console', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const error = new Error('Test error')
      const mockHandler = vi.fn().mockRejectedValue(error)
      const wrappedHandler = withErrorHandling(mockHandler)

      const mockRequest = new NextRequest('http://localhost:3000/test')
      await wrappedHandler(mockRequest, {})

      expect(consoleSpy).toHaveBeenCalledWith('API Error:', error)
      consoleSpy.mockRestore()
    })
  })

  describe('validateRequestMethod', () => {
    it('should pass validation for allowed methods', () => {
      const request = new NextRequest('http://localhost:3000/test', { method: 'GET' })

      expect(() => {
        validateRequestMethod(request, ['GET', 'POST'])
      }).not.toThrow()
    })

    it('should throw APIError for disallowed methods', () => {
      const request = new NextRequest('http://localhost:3000/test', { method: 'DELETE' })

      expect(() => {
        validateRequestMethod(request, ['GET', 'POST'])
      }).toThrow(APIError)
    })

    it('should include allowed methods in error message', () => {
      const request = new NextRequest('http://localhost:3000/test', { method: 'PUT' })

      expect(() => {
        validateRequestMethod(request, ['GET', 'POST'])
      }).toThrow('Method PUT not allowed. Allowed methods: GET, POST')
    })
  })

  describe('parseQueryParams', () => {
    it('should parse simple query parameters', () => {
      const searchParams = new URLSearchParams('name=test&age=25')
      const result = parseQueryParams(searchParams)

      expect(result).toEqual({
        name: 'test',
        age: '25',
      })
    })

    it('should handle array parameters', () => {
      const searchParams = new URLSearchParams('tags[]=react&tags[]=javascript&tags[]=nodejs')
      const result = parseQueryParams(searchParams)

      expect(result).toEqual({
        tags: ['react', 'javascript', 'nodejs'],
      })
    })

    it('should handle mixed parameters', () => {
      const searchParams = new URLSearchParams('category=tech&tags[]=react&tags[]=js&limit=10')
      const result = parseQueryParams(searchParams)

      expect(result).toEqual({
        category: 'tech',
        tags: ['react', 'js'],
        limit: '10',
      })
    })

    it('should handle empty parameters', () => {
      const searchParams = new URLSearchParams('')
      const result = parseQueryParams(searchParams)

      expect(result).toEqual({})
    })

    it('should handle duplicate non-array parameters', () => {
      const searchParams = new URLSearchParams('name=first&name=second')
      const result = parseQueryParams(searchParams)

      expect(result.name).toBe('second') // Last value wins
    })
  })

  describe('validatePaginationParams', () => {
    it('should return default values for empty params', () => {
      const result = validatePaginationParams({})

      expect(result).toEqual({
        page: 1,
        limit: 10,
      })
    })

    it('should parse valid pagination parameters', () => {
      const params = { page: '2', limit: '20' }
      const result = validatePaginationParams(params)

      expect(result).toEqual({
        page: 2,
        limit: 20,
      })
    })

    it('should throw error for invalid page number', () => {
      const params = { page: 'invalid' }

      expect(() => {
        validatePaginationParams(params)
      }).toThrow(APIError)
    })

    it('should throw error for negative page number', () => {
      const params = { page: '-1' }

      expect(() => {
        validatePaginationParams(params)
      }).toThrow('Page must be a positive integer')
    })

    it('should throw error for zero page number', () => {
      const params = { page: '0' }

      expect(() => {
        validatePaginationParams(params)
      }).toThrow('Page must be a positive integer')
    })

    it('should throw error for invalid limit', () => {
      const params = { limit: 'invalid' }

      expect(() => {
        validatePaginationParams(params)
      }).toThrow(APIError)
    })

    it('should throw error for negative limit', () => {
      const params = { limit: '-5' }

      expect(() => {
        validatePaginationParams(params)
      }).toThrow('Limit must be between 1 and 100')
    })

    it('should throw error for zero limit', () => {
      const params = { limit: '0' }

      expect(() => {
        validatePaginationParams(params)
      }).toThrow('Limit must be between 1 and 100')
    })

    it('should throw error for limit exceeding maximum', () => {
      const params = { limit: '101' }

      expect(() => {
        validatePaginationParams(params)
      }).toThrow('Limit must be between 1 and 100')
    })

    it('should handle string numbers correctly', () => {
      const params = { page: '3', limit: '50' }
      const result = validatePaginationParams(params)

      expect(result).toEqual({
        page: 3,
        limit: 50,
      })
    })
  })
})
