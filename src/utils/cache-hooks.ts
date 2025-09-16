/**
 * Cache invalidation hooks for Payload collections
 * Automatically invalidates cache when content is updated
 * Based on requirements 5.2, 5.6
 */

import { CacheInvalidator } from './cache'

/**
 * Hook to invalidate journal cache after changes
 */
export const invalidateJournalCache = async ({ doc, previousDoc, operation }: any) => {
  try {
    // Invalidate cache for the specific journal
    await CacheInvalidator.invalidateJournalCache(doc.id)

    // If status changed from draft to published or vice versa, invalidate list cache
    if (previousDoc && previousDoc.status !== doc.status) {
      await CacheInvalidator.invalidateJournalCache() // Invalidate all journal cache
    }

    // If category changed, invalidate category cache
    if (previousDoc && previousDoc.category?.id !== doc.category?.id) {
      if (previousDoc.category?.id) {
        await CacheInvalidator.invalidateCategoryCache(previousDoc.category.id)
      }
      if (doc.category?.id) {
        await CacheInvalidator.invalidateCategoryCache(doc.category.id)
      }
    }

    // If tags changed, invalidate tag cache
    const previousTags = previousDoc?.tags || []
    const currentTags = doc.tags || []

    const previousTagIds = previousTags.map((tag: any) => tag.id || tag)
    const currentTagIds = currentTags.map((tag: any) => tag.id || tag)

    const changedTags = [
      ...previousTagIds.filter((id: string) => !currentTagIds.includes(id)),
      ...currentTagIds.filter((id: string) => !previousTagIds.includes(id)),
    ]

    if (changedTags.length > 0) {
      for (const tagId of changedTags) {
        await CacheInvalidator.invalidateTagCache(tagId)
      }
    }

    console.log(`Cache invalidated for journal: ${doc.id} (${operation})`)
  } catch (error) {
    console.error('Failed to invalidate journal cache:', error)
  }
}

/**
 * Hook to invalidate journal cache after deletion
 */
export const invalidateJournalCacheOnDelete = async ({ doc }: any) => {
  try {
    // Invalidate all journal cache since we deleted an entry
    await CacheInvalidator.invalidateJournalCache()

    // Invalidate category cache if journal had a category
    if (doc.category?.id) {
      await CacheInvalidator.invalidateCategoryCache(doc.category.id)
    }

    // Invalidate tag cache if journal had tags
    if (doc.tags && doc.tags.length > 0) {
      for (const tag of doc.tags) {
        const tagId = typeof tag === 'object' ? tag.id : tag
        await CacheInvalidator.invalidateTagCache(tagId)
      }
    }

    console.log(`Cache invalidated for deleted journal: ${doc.id}`)
  } catch (error) {
    console.error('Failed to invalidate cache for deleted journal:', error)
  }
}

/**
 * Hook to invalidate category cache after changes
 */
export const invalidateCategoryCache = async ({ doc, operation }: any) => {
  try {
    // Invalidate cache for the specific category
    await CacheInvalidator.invalidateCategoryCache(doc.id)

    // Also invalidate journal cache since category info might be displayed in journal lists
    await CacheInvalidator.invalidateJournalCache()

    console.log(`Cache invalidated for category: ${doc.id} (${operation})`)
  } catch (error) {
    console.error('Failed to invalidate category cache:', error)
  }
}

/**
 * Hook to invalidate category cache after deletion
 */
export const invalidateCategoryCacheOnDelete = async ({ doc }: any) => {
  try {
    // Invalidate all category cache
    await CacheInvalidator.invalidateCategoryCache()

    // Invalidate journal cache since journals might reference this category
    await CacheInvalidator.invalidateJournalCache()

    console.log(`Cache invalidated for deleted category: ${doc.id}`)
  } catch (error) {
    console.error('Failed to invalidate cache for deleted category:', error)
  }
}

/**
 * Hook to invalidate tag cache after changes
 */
export const invalidateTagCache = async ({ doc, operation }: any) => {
  try {
    // Invalidate cache for the specific tag
    await CacheInvalidator.invalidateTagCache(doc.id)

    // Also invalidate journal cache since tag info might be displayed in journal lists
    await CacheInvalidator.invalidateJournalCache()

    console.log(`Cache invalidated for tag: ${doc.id} (${operation})`)
  } catch (error) {
    console.error('Failed to invalidate tag cache:', error)
  }
}

/**
 * Hook to invalidate tag cache after deletion
 */
export const invalidateTagCacheOnDelete = async ({ doc }: any) => {
  try {
    // Invalidate all tag cache
    await CacheInvalidator.invalidateTagCache()

    // Invalidate journal cache since journals might reference this tag
    await CacheInvalidator.invalidateJournalCache()

    console.log(`Cache invalidated for deleted tag: ${doc.id}`)
  } catch (error) {
    console.error('Failed to invalidate cache for deleted tag:', error)
  }
}
