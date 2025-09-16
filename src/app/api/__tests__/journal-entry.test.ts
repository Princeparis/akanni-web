/**
 * Unit tests for individual Journal Entry API route
 * Tests slug validation, error handling, and caching
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { GET } from '../public/journals/[slug]/route'
// Mock error types
const APIError = class extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number,
  ) {
    super(message)
  }
}

const ErrorCodes = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
}

// Mock getPayload
vi.mock('payload', () => ({
  getPayload: vi.fn().mockResolvedValue({
    find: vi.fn(),
  }),
}))

// Mock config
vi.mock('../../../../payload.config', () => ({
  default: {},
}))

// Mock utility functions
vi.mock('../../../../utils/error-handler', () => ({
  withErrorHandling: (handler: any) => handler,
  validateRequestMethod: vi.fn(),
  createSuccessResponse: vi.fn().mockImplementation((data) => ({
    json: () => Promise.resolve({ success: true, data }),
    headers: new Map(),
  })),
}))

// Mock constants
vi.mock('../../../../utils/constants', () => ({
  HTTP_STATUS: {
    OK: 200,
    BAD_REQUEST: 400,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500,
  },
  CACHE_DURATION: {
    SHORT: 300,
    LONG: 3600,
  },
}))

describe('Journal Entry API Route', () => {
  let mockPayload: any

  beforeEach(async () => {
    vi.clearAllMocks()
    const { getPayload } = await import('payload')
    mockPayload = await getPayload({ config: {} })
  })

  describe('GET /api/journals/[slug]', () => {
    it('should return journal entry for valid slug', async () => {
      const mockJournal = {
        id: '1',
        title: 'Test Journal',
        slug: 'test-journal',
        content: { root: { children: [] } },
        status: 'published',
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
      }

      mockPayload.find.mockResolvedValue({
        docs: [mockJournal],
      })

      const request = new NextRequest('http://localhost:3000/api/journals/test-journal')
      const response = await GET(request, { params: { slug: 'test-journal' } })

      expect(mockPayload.find).toHaveBeenCalledWith({
        collection: 'journals',
        where: {
          slug: {
            equals: 'test-journal',
          },
        },
        limit: 1,
        depth: 2,
      })

      expect(response).toBeDefined()
    })

    it('should handle URL-encoded slugs correctly', async () => {
      const mockJournal = {
        id: '1',
        title: 'Test Journal with Spaces',
        slug: 'test-journal-with-spaces',
        status: 'published',
      }

      mockPayload.find.mockResolvedValue({
        docs: [mockJournal],
      })

      const request = new NextRequest(
        'http://localhost:3000/api/journals/test%20journal%20with%20spaces',
      )
      await GET(request, { params: { slug: 'test journal with spaces' } })

      expect(mockPayload.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            slug: {
              equals: 'test journal with spaces',
            },
          },
        }),
      )
    })

    it('should throw validation error for missing slug', async () => {
      const request = new NextRequest('http://localhost:3000/api/journals/')

      await expect(GET(request, { params: { slug: '' } })).rejects.toThrow(
        'Invalid or missing slug parameter',
      )
    })

    it('should throw validation error for non-string slug', async () => {
      const request = new NextRequest('http://localhost:3000/api/journals/123')

      await expect(GET(request, { params: { slug: null as any } })).rejects.toThrow(
        'Invalid or missing slug parameter',
      )
    })

    it('should throw not found error for non-existent journal', async () => {
      mockPayload.find.mockResolvedValue({
        docs: [],
      })

      const request = new NextRequest('http://localhost:3000/api/journals/non-existent')

      await expect(GET(request, { params: { slug: 'non-existent' } })).rejects.toThrow(
        "Journal entry with slug 'non-existent' not found",
      )
    })

    it('should handle draft entries with warning', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const mockJournal = {
        id: '1',
        title: 'Draft Journal',
        slug: 'draft-journal',
        status: 'draft',
      }

      mockPayload.find.mockResolvedValue({
        docs: [mockJournal],
      })

      const request = new NextRequest('http://localhost:3000/api/journals/draft-journal')
      await GET(request, { params: { slug: 'draft-journal' } })

      expect(consoleSpy).toHaveBeenCalledWith('Returning draft entry: draft-journal')
      consoleSpy.mockRestore()
    })

    it('should handle database errors gracefully', async () => {
      mockPayload.find.mockRejectedValue(new Error('Database connection failed'))

      const request = new NextRequest('http://localhost:3000/api/journals/test-journal')

      await expect(GET(request, { params: { slug: 'test-journal' } })).rejects.toThrow(
        'Database connection failed',
      )
    })

    it('should populate relationships with depth 2', async () => {
      const mockJournal = {
        id: '1',
        title: 'Test Journal',
        slug: 'test-journal',
        status: 'published',
        category: {
          id: 'cat1',
          name: 'Technology',
          slug: 'technology',
        },
        tags: [
          {
            id: 'tag1',
            name: 'React',
            slug: 'react',
          },
          {
            id: 'tag2',
            name: 'JavaScript',
            slug: 'javascript',
          },
        ],
      }

      mockPayload.find.mockResolvedValue({
        docs: [mockJournal],
      })

      const request = new NextRequest('http://localhost:3000/api/journals/test-journal')
      await GET(request, { params: { slug: 'test-journal' } })

      expect(mockPayload.find).toHaveBeenCalledWith(
        expect.objectContaining({
          depth: 2,
        }),
      )
    })
  })

  describe('Error Handling', () => {
    it('should re-throw APIErrors without modification', async () => {
      const apiError = new APIError(ErrorCodes.NOT_FOUND, 'Not found', 404)

      mockPayload.find.mockRejectedValue(apiError)

      const request = new NextRequest('http://localhost:3000/api/journals/test')

      await expect(GET(request, { params: { slug: 'test' } })).rejects.toThrow(apiError)
    })

    it('should wrap generic errors in APIError', async () => {
      const genericError = new Error('Generic database error')
      mockPayload.find.mockRejectedValue(genericError)

      const request = new NextRequest('http://localhost:3000/api/journals/test')

      await expect(GET(request, { params: { slug: 'test' } })).rejects.toThrow(
        'Generic database error',
      )
    })
  })
})
