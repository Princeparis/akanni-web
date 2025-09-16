/**
 * Integration tests for API endpoints
 * Tests API routes with real database operations
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { getPayload } from 'payload'
import config from '../../src/payload.config'

describe('API Integration Tests', () => {
  let payload: any
  let testData: {
    categories: any[]
    tags: any[]
    journals: any[]
  }

  beforeAll(async () => {
    payload = await getPayload({ config })
  })

  beforeEach(async () => {
    // Clean up and create test data
    await cleanup()
    testData = await createTestData()
  })

  afterAll(async () => {
    await cleanup()
  })

  async function cleanup() {
    try {
      // Delete test data in correct order (journals first due to relationships)
      const journals = await payload.find({
        collection: 'journals',
        where: {
          title: {
            like: 'API Test%',
          },
        },
      })

      for (const journal of journals.docs) {
        await payload.delete({
          collection: 'journals',
          id: journal.id,
        })
      }

      const categories = await payload.find({
        collection: 'categories',
        where: {
          name: {
            like: 'API Test%',
          },
        },
      })

      for (const category of categories.docs) {
        await payload.delete({
          collection: 'categories',
          id: category.id,
        })
      }

      const tags = await payload.find({
        collection: 'tags',
        where: {
          name: {
            like: 'API Test%',
          },
        },
      })

      for (const tag of tags.docs) {
        await payload.delete({
          collection: 'tags',
          id: tag.id,
        })
      }
    } catch (error) {
      // Ignore cleanup errors
    }
  }

  async function createTestData() {
    // Create test categories
    const categories = await Promise.all([
      payload.create({
        collection: 'categories',
        data: {
          name: 'API Test Technology',
          description: 'Technology category for API tests',
          color: '#FF5733',
        },
      }),
      payload.create({
        collection: 'categories',
        data: {
          name: 'API Test Design',
          description: 'Design category for API tests',
          color: '#33FF57',
        },
      }),
    ])

    // Create test tags
    const tags = await Promise.all([
      payload.create({
        collection: 'tags',
        data: {
          name: 'API Test React',
        },
      }),
      payload.create({
        collection: 'tags',
        data: {
          name: 'API Test JavaScript',
        },
      }),
      payload.create({
        collection: 'tags',
        data: {
          name: 'API Test CSS',
        },
      }),
    ])

    // Create test journals
    const journals = await Promise.all([
      payload.create({
        collection: 'journals',
        data: {
          title: 'API Test Published Journal 1',
          content: {
            root: {
              children: [
                {
                  children: [{ text: 'This is the first published test journal for API testing.' }],
                  type: 'paragraph',
                },
              ],
              type: 'root',
            },
          },
          excerpt: 'First published journal excerpt',
          status: 'published',
          category: categories[0].id,
          tags: [tags[0].id, tags[1].id],
          audioUrl: 'https://example.com/audio1.mp3',
        },
      }),
      payload.create({
        collection: 'journals',
        data: {
          title: 'API Test Published Journal 2',
          content: {
            root: {
              children: [
                {
                  children: [
                    { text: 'This is the second published test journal for API testing.' },
                  ],
                  type: 'paragraph',
                },
              ],
              type: 'root',
            },
          },
          excerpt: 'Second published journal excerpt',
          status: 'published',
          category: categories[1].id,
          tags: [tags[1].id, tags[2].id],
        },
      }),
      payload.create({
        collection: 'journals',
        data: {
          title: 'API Test Draft Journal',
          content: {
            root: {
              children: [
                {
                  children: [{ text: 'This is a draft test journal for API testing.' }],
                  type: 'paragraph',
                },
              ],
              type: 'root',
            },
          },
          excerpt: 'Draft journal excerpt',
          status: 'draft',
          category: categories[0].id,
          tags: [tags[0].id],
        },
      }),
    ])

    return { categories, tags, journals }
  }

  describe('Journals API Endpoint', () => {
    it('should fetch paginated journals with default parameters', async () => {
      const response = await fetch('http://localhost:3000/api/public/journals')
      expect(response.ok).toBe(true)

      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.data).toBeDefined()
      expect(data.data.docs).toBeInstanceOf(Array)
      expect(data.data.totalDocs).toBeGreaterThanOrEqual(2) // At least 2 published journals
      expect(data.data.page).toBe(1)
      expect(data.data.limit).toBe(10)
      expect(data.data.categories).toBeInstanceOf(Array)
      expect(data.data.tags).toBeInstanceOf(Array)
    })

    it('should filter journals by category', async () => {
      const categorySlug = testData.categories[0].slug
      const response = await fetch(
        `http://localhost:3000/api/public/journals?category=${categorySlug}`,
      )
      expect(response.ok).toBe(true)

      const data = await response.json()
      expect(data.success).toBe(true)

      // Should return journals from the specified category
      const journalsInCategory = data.data.docs.filter(
        (journal: any) => journal.category && journal.category.slug === categorySlug,
      )
      expect(journalsInCategory.length).toBeGreaterThan(0)
    })

    it('should filter journals by tags', async () => {
      const tagSlug = testData.tags[0].slug
      const response = await fetch(`http://localhost:3000/api/public/journals?tags=${tagSlug}`)
      expect(response.ok).toBe(true)

      const data = await response.json()
      expect(data.success).toBe(true)

      // Should return journals with the specified tag
      const journalsWithTag = data.data.docs.filter(
        (journal: any) => journal.tags && journal.tags.some((tag: any) => tag.slug === tagSlug),
      )
      expect(journalsWithTag.length).toBeGreaterThan(0)
    })

    it('should filter journals by status', async () => {
      const response = await fetch('http://localhost:3000/api/public/journals?status=published')
      expect(response.ok).toBe(true)

      const data = await response.json()
      expect(data.success).toBe(true)

      // All returned journals should be published
      data.data.docs.forEach((journal: any) => {
        expect(journal.status).toBe('published')
      })
    })

    it('should search journals by title and excerpt', async () => {
      const response = await fetch('http://localhost:3000/api/public/journals?search=first')
      expect(response.ok).toBe(true)

      const data = await response.json()
      expect(data.success).toBe(true)

      // Should return journals matching the search term
      const matchingJournals = data.data.docs.filter(
        (journal: any) =>
          journal.title.toLowerCase().includes('first') ||
          (journal.excerpt && journal.excerpt.toLowerCase().includes('first')),
      )
      expect(matchingJournals.length).toBeGreaterThan(0)
    })

    it('should handle pagination correctly', async () => {
      const response = await fetch('http://localhost:3000/api/public/journals?page=1&limit=1')
      expect(response.ok).toBe(true)

      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.data.docs).toHaveLength(1)
      expect(data.data.limit).toBe(1)
      expect(data.data.page).toBe(1)

      if (data.data.totalDocs > 1) {
        expect(data.data.hasNextPage).toBe(true)
      }
    })

    it('should sort journals correctly', async () => {
      const response = await fetch(
        'http://localhost:3000/api/public/journals?sortBy=title&sortOrder=asc',
      )
      expect(response.ok).toBe(true)

      const data = await response.json()
      expect(data.success).toBe(true)

      // Check that journals are sorted by title in ascending order
      const titles = data.data.docs.map((journal: any) => journal.title)
      const sortedTitles = [...titles].sort()
      expect(titles).toEqual(sortedTitles)
    })

    it('should return 400 for invalid pagination parameters', async () => {
      const response = await fetch('http://localhost:3000/api/public/journals?page=0')
      expect(response.status).toBe(400)

      const data = await response.json()
      expect(data.success).toBe(false)
      expect(data.error.message).toContain('Page must be a positive integer')
    })

    it('should return 400 for invalid limit parameters', async () => {
      const response = await fetch('http://localhost:3000/api/public/journals?limit=101')
      expect(response.status).toBe(400)

      const data = await response.json()
      expect(data.success).toBe(false)
      expect(data.error.message).toContain('Limit must be between 1 and 100')
    })
  })

  describe('Individual Journal API Endpoint', () => {
    it('should fetch journal by slug', async () => {
      const journal = testData.journals[0] // First published journal
      const response = await fetch(`http://localhost:3000/api/public/journals/${journal.slug}`)
      expect(response.ok).toBe(true)

      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.data.id).toBe(journal.id)
      expect(data.data.title).toBe(journal.title)
      expect(data.data.slug).toBe(journal.slug)
      expect(data.data.category).toBeDefined()
      expect(data.data.tags).toBeInstanceOf(Array)
    })

    it('should return 404 for non-existent journal', async () => {
      const response = await fetch('http://localhost:3000/api/public/journals/non-existent-slug')
      expect(response.status).toBe(404)

      const data = await response.json()
      expect(data.success).toBe(false)
      expect(data.error.message).toContain('not found')
    })

    it('should handle URL-encoded slugs', async () => {
      // Create a journal with spaces in title (which creates spaces in slug)
      const journalWithSpaces = await payload.create({
        collection: 'journals',
        data: {
          title: 'API Test Journal With Spaces',
          content: {
            root: {
              children: [
                {
                  children: [{ text: 'Test content' }],
                  type: 'paragraph',
                },
              ],
              type: 'root',
            },
          },
          status: 'published',
        },
      })

      const encodedSlug = encodeURIComponent(journalWithSpaces.slug)
      const response = await fetch(`http://localhost:3000/api/public/journals/${encodedSlug}`)
      expect(response.ok).toBe(true)

      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.data.id).toBe(journalWithSpaces.id)
    })

    it('should include proper cache headers', async () => {
      const journal = testData.journals[0]
      const response = await fetch(`http://localhost:3000/api/public/journals/${journal.slug}`)
      expect(response.ok).toBe(true)

      expect(response.headers.get('Cache-Control')).toBeDefined()
      expect(response.headers.get('ETag')).toBeDefined()
      expect(response.headers.get('Last-Modified')).toBeDefined()
    })
  })

  describe('Categories API Endpoint', () => {
    it('should fetch all categories with journal counts', async () => {
      const response = await fetch('http://localhost:3000/api/public/categories')
      expect(response.ok).toBe(true)

      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.data).toBeInstanceOf(Array)

      // Check that categories have journal counts
      data.data.forEach((category: any) => {
        expect(category.journalCount).toBeDefined()
        expect(typeof category.journalCount).toBe('number')
      })
    })

    it('should sort categories by name by default', async () => {
      const response = await fetch('http://localhost:3000/api/public/categories')
      expect(response.ok).toBe(true)

      const data = await response.json()
      expect(data.success).toBe(true)

      const names = data.data.map((category: any) => category.name)
      const sortedNames = [...names].sort()
      expect(names).toEqual(sortedNames)
    })

    it('should sort categories by journal count when requested', async () => {
      const response = await fetch(
        'http://localhost:3000/api/public/categories?sortBy=journalCount&sortOrder=desc',
      )
      expect(response.ok).toBe(true)

      const data = await response.json()
      expect(data.success).toBe(true)

      const counts = data.data.map((category: any) => category.journalCount)
      const sortedCounts = [...counts].sort((a, b) => b - a)
      expect(counts).toEqual(sortedCounts)
    })
  })

  describe('Tags API Endpoint', () => {
    it('should fetch all tags with journal counts', async () => {
      const response = await fetch('http://localhost:3000/api/public/tags')
      expect(response.ok).toBe(true)

      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.data).toBeInstanceOf(Array)

      // Check that tags have journal counts
      data.data.forEach((tag: any) => {
        expect(tag.journalCount).toBeDefined()
        expect(typeof tag.journalCount).toBe('number')
      })
    })

    it('should sort tags by name by default', async () => {
      const response = await fetch('http://localhost:3000/api/public/tags')
      expect(response.ok).toBe(true)

      const data = await response.json()
      expect(data.success).toBe(true)

      const names = data.data.map((tag: any) => tag.name)
      const sortedNames = [...names].sort()
      expect(names).toEqual(sortedNames)
    })

    it('should filter out empty tags when requested', async () => {
      // Create a tag with no journals
      const emptyTag = await payload.create({
        collection: 'tags',
        data: {
          name: 'API Test Empty Tag',
        },
      })

      const response = await fetch('http://localhost:3000/api/public/tags?hideEmpty=true')
      expect(response.ok).toBe(true)

      const data = await response.json()
      expect(data.success).toBe(true)

      // Should not include the empty tag
      const emptyTagInResults = data.data.find((tag: any) => tag.id === emptyTag.id)
      expect(emptyTagInResults).toBeUndefined()
    })
  })

  describe('Error Handling', () => {
    it('should handle malformed requests gracefully', async () => {
      const response = await fetch('http://localhost:3000/api/public/journals?page=invalid')
      expect(response.status).toBe(400)

      const data = await response.json()
      expect(data.success).toBe(false)
      expect(data.error).toBeDefined()
    })

    it('should return consistent error format', async () => {
      const response = await fetch('http://localhost:3000/api/public/journals/non-existent')
      expect(response.status).toBe(404)

      const data = await response.json()
      expect(data.success).toBe(false)
      expect(data.error).toBeDefined()
      expect(data.error.code).toBeDefined()
      expect(data.error.message).toBeDefined()
      expect(data.timestamp).toBeDefined()
    })
  })
})
