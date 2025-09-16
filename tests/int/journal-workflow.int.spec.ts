/**
 * Integration tests for journal workflow
 * Tests complete journal creation, publishing, and API integration
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { getPayload } from 'payload'
import config from '../../src/payload.config'

describe('Journal Workflow Integration', () => {
  let payload: any
  let testCategory: any
  let testTags: any[]
  let testJournal: any

  beforeAll(async () => {
    payload = await getPayload({ config })
  })

  beforeEach(async () => {
    // Clean up test data
    await cleanup()

    // Create test category
    testCategory = await payload.create({
      collection: 'categories',
      data: {
        name: 'Test Category',
        description: 'A test category for integration tests',
        color: '#FF5733',
      },
    })

    // Create test tags
    testTags = await Promise.all([
      payload.create({
        collection: 'tags',
        data: {
          name: 'Test Tag 1',
        },
      }),
      payload.create({
        collection: 'tags',
        data: {
          name: 'Test Tag 2',
        },
      }),
    ])
  })

  afterAll(async () => {
    await cleanup()
  })

  async function cleanup() {
    try {
      // Delete test journals
      const journals = await payload.find({
        collection: 'journals',
        where: {
          title: {
            like: 'Test%',
          },
        },
      })

      for (const journal of journals.docs) {
        await payload.delete({
          collection: 'journals',
          id: journal.id,
        })
      }

      // Delete test categories
      const categories = await payload.find({
        collection: 'categories',
        where: {
          name: {
            like: 'Test%',
          },
        },
      })

      for (const category of categories.docs) {
        await payload.delete({
          collection: 'categories',
          id: category.id,
        })
      }

      // Delete test tags
      const tags = await payload.find({
        collection: 'tags',
        where: {
          name: {
            like: 'Test%',
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

  describe('Journal Creation Workflow', () => {
    it('should create a journal with all fields', async () => {
      const journalData = {
        title: 'Test Journal Entry',
        content: {
          root: {
            children: [
              {
                children: [
                  {
                    text: 'This is a test journal entry content.',
                  },
                ],
                type: 'paragraph',
              },
            ],
            type: 'root',
          },
        },
        excerpt: 'This is a test excerpt',
        status: 'draft',
        category: testCategory.id,
        tags: testTags.map((tag) => tag.id),
        audioUrl: 'https://example.com/audio.mp3',
        seo: {
          title: 'Test SEO Title',
          description: 'Test SEO Description',
        },
      }

      testJournal = await payload.create({
        collection: 'journals',
        data: journalData,
      })

      expect(testJournal).toBeDefined()
      expect(testJournal.title).toBe('Test Journal Entry')
      expect(testJournal.slug).toBe('test-journal-entry')
      expect(testJournal.status).toBe('draft')
      expect(testJournal.category).toBe(testCategory.id)
      expect(testJournal.tags).toHaveLength(2)
      expect(testJournal.createdAt).toBeDefined()
      expect(testJournal.updatedAt).toBeDefined()
      expect(testJournal.publishedAt).toBeNull()
    })

    it('should auto-generate slug from title', async () => {
      const journal = await payload.create({
        collection: 'journals',
        data: {
          title: 'Test Journal with Special Characters!@#',
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
        },
      })

      expect(journal.slug).toBe('test-journal-with-special-characters')
    })

    it('should auto-generate excerpt from content when not provided', async () => {
      const longContent =
        'This is a very long content that should be truncated when generating an excerpt automatically. '.repeat(
          10,
        )

      const journal = await payload.create({
        collection: 'journals',
        data: {
          title: 'Test Auto Excerpt',
          content: {
            root: {
              children: [
                {
                  children: [{ text: longContent }],
                  type: 'paragraph',
                },
              ],
              type: 'root',
            },
          },
        },
      })

      expect(journal.excerpt).toBeDefined()
      expect(journal.excerpt.length).toBeLessThanOrEqual(300)
      expect(journal.excerpt).toContain('This is a very long content')
    })

    it('should validate required fields', async () => {
      await expect(
        payload.create({
          collection: 'journals',
          data: {
            // Missing title and content
            status: 'draft',
          },
        }),
      ).rejects.toThrow()
    })

    it('should validate audio URL format', async () => {
      await expect(
        payload.create({
          collection: 'journals',
          data: {
            title: 'Test Invalid Audio',
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
            audioUrl: 'invalid-url',
          },
        }),
      ).rejects.toThrow()
    })
  })

  describe('Journal Publishing Workflow', () => {
    beforeEach(async () => {
      testJournal = await payload.create({
        collection: 'journals',
        data: {
          title: 'Test Draft Journal',
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
          status: 'draft',
        },
      })
    })

    it('should set publishedAt when changing status to published', async () => {
      const updatedJournal = await payload.update({
        collection: 'journals',
        id: testJournal.id,
        data: {
          status: 'published',
        },
      })

      expect(updatedJournal.status).toBe('published')
      expect(updatedJournal.publishedAt).toBeDefined()
      expect(new Date(updatedJournal.publishedAt)).toBeInstanceOf(Date)
    })

    it('should clear publishedAt when changing status back to draft', async () => {
      // First publish
      await payload.update({
        collection: 'journals',
        id: testJournal.id,
        data: {
          status: 'published',
        },
      })

      // Then change back to draft
      const updatedJournal = await payload.update({
        collection: 'journals',
        id: testJournal.id,
        data: {
          status: 'draft',
        },
      })

      expect(updatedJournal.status).toBe('draft')
      expect(updatedJournal.publishedAt).toBeNull()
    })

    it('should auto-populate SEO fields when not provided', async () => {
      const journal = await payload.create({
        collection: 'journals',
        data: {
          title: 'Test SEO Auto Population',
          content: {
            root: {
              children: [
                {
                  children: [{ text: 'Test content for SEO' }],
                  type: 'paragraph',
                },
              ],
              type: 'root',
            },
          },
          excerpt: 'This is a test excerpt for SEO description',
        },
      })

      expect(journal.seo.title).toBe('Test SEO Auto Population')
      expect(journal.seo.description).toBe('This is a test excerpt for SEO description')
    })
  })

  describe('Tag Relationship Management', () => {
    it('should update tag journal counts when journal is created', async () => {
      const journal = await payload.create({
        collection: 'journals',
        data: {
          title: 'Test Tag Count Journal',
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
          tags: [testTags[0].id],
        },
      })

      // Check that tag journal count was updated
      const updatedTag = await payload.findByID({
        collection: 'tags',
        id: testTags[0].id,
      })

      expect(updatedTag.journalCount).toBe(1)
    })

    it('should update tag journal counts when journal tags are modified', async () => {
      const journal = await payload.create({
        collection: 'journals',
        data: {
          title: 'Test Tag Modification',
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
          tags: [testTags[0].id],
        },
      })

      // Update journal to use different tag
      await payload.update({
        collection: 'journals',
        id: journal.id,
        data: {
          tags: [testTags[1].id],
        },
      })

      // Check that tag counts were updated
      const [tag1, tag2] = await Promise.all([
        payload.findByID({
          collection: 'tags',
          id: testTags[0].id,
        }),
        payload.findByID({
          collection: 'tags',
          id: testTags[1].id,
        }),
      ])

      expect(tag1.journalCount).toBe(0)
      expect(tag2.journalCount).toBe(1)
    })

    it('should update tag journal counts when journal is deleted', async () => {
      const journal = await payload.create({
        collection: 'journals',
        data: {
          title: 'Test Tag Deletion',
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
          tags: [testTags[0].id],
        },
      })

      // Delete the journal
      await payload.delete({
        collection: 'journals',
        id: journal.id,
      })

      // Check that tag count was decremented
      const updatedTag = await payload.findByID({
        collection: 'tags',
        id: testTags[0].id,
      })

      expect(updatedTag.journalCount).toBe(0)
    })
  })

  describe('Tag Deletion Workflow', () => {
    it('should remove tag from journals when tag is deleted', async () => {
      const journal = await payload.create({
        collection: 'journals',
        data: {
          title: 'Test Tag Removal',
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
          tags: [testTags[0].id, testTags[1].id],
        },
      })

      // Delete one of the tags
      await payload.delete({
        collection: 'tags',
        id: testTags[0].id,
      })

      // Check that the tag was removed from the journal
      const updatedJournal = await payload.findByID({
        collection: 'journals',
        id: journal.id,
      })

      expect(updatedJournal.tags).toHaveLength(1)
      expect(updatedJournal.tags[0]).toBe(testTags[1].id)
    })
  })

  describe('Category and Tag Creation', () => {
    it('should create category with auto-generated slug', async () => {
      const category = await payload.create({
        collection: 'categories',
        data: {
          name: 'Test Category with Spaces',
          description: 'Test description',
        },
      })

      expect(category.slug).toBe('test-category-with-spaces')
      expect(category.createdAt).toBeDefined()
      expect(category.updatedAt).toBeDefined()
    })

    it('should validate category color format', async () => {
      await expect(
        payload.create({
          collection: 'categories',
          data: {
            name: 'Test Invalid Color',
            color: 'invalid-color',
          },
        }),
      ).rejects.toThrow()
    })

    it('should create tag with auto-generated slug and initial count', async () => {
      const tag = await payload.create({
        collection: 'tags',
        data: {
          name: 'Test New Tag',
        },
      })

      expect(tag.slug).toBe('test-new-tag')
      expect(tag.journalCount).toBe(0)
      expect(tag.createdAt).toBeDefined()
      expect(tag.updatedAt).toBeDefined()
    })

    it('should validate tag name format', async () => {
      await expect(
        payload.create({
          collection: 'tags',
          data: {
            name: 'Invalid@Tag#Name',
          },
        }),
      ).rejects.toThrow()
    })
  })
})
