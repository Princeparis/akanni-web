/**
 * End-to-end tests for admin interface journal management
 * Tests complete admin workflows for creating and managing journals
 */

import { test, expect } from '@playwright/test'

test.describe('Admin Interface Journal Management', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to admin interface
    await page.goto('/admin')

    // Note: In a real scenario, you would need to handle authentication
    // For now, we'll assume the user is already logged in or skip auth for tests
  })

  test('should display admin dashboard with journal collections', async ({ page }) => {
    // Check that admin interface loads
    await expect(page.locator('[data-testid="admin-dashboard"]')).toBeVisible()

    // Check for journal collection link
    await expect(page.locator('[data-testid="collection-journals"]')).toBeVisible()
    await expect(page.locator('[data-testid="collection-categories"]')).toBeVisible()
    await expect(page.locator('[data-testid="collection-tags"]')).toBeVisible()
  })

  test('should navigate to journal collection list', async ({ page }) => {
    // Click on journals collection
    await page.locator('[data-testid="collection-journals"]').click()

    // Should navigate to journals list
    await expect(page).toHaveURL(/\/admin\/collections\/journals/)
    await expect(page.locator('[data-testid="collection-list"]')).toBeVisible()

    // Check for create new button
    await expect(page.locator('[data-testid="create-new-journal"]')).toBeVisible()
  })

  test('should create a new journal entry', async ({ page }) => {
    // Navigate to journals collection
    await page.locator('[data-testid="collection-journals"]').click()

    // Click create new
    await page.locator('[data-testid="create-new-journal"]').click()

    // Should navigate to create form
    await expect(page).toHaveURL(/\/admin\/collections\/journals\/create/)
    await expect(page.locator('[data-testid="journal-form"]')).toBeVisible()

    // Fill in journal details
    await page.locator('[data-testid="field-title"]').fill('Test Journal Entry')

    // Fill in content (rich text editor)
    const contentEditor = page.locator('[data-testid="field-content"] .lexical-editor')
    await contentEditor.click()
    await contentEditor.fill('This is the content of the test journal entry.')

    // Fill in excerpt
    await page.locator('[data-testid="field-excerpt"]').fill('This is a test excerpt')

    // Set status to published
    await page.locator('[data-testid="field-status"]').selectOption('published')

    // Save the journal
    await page.locator('[data-testid="save-journal"]').click()

    // Should redirect to the created journal
    await expect(page).toHaveURL(/\/admin\/collections\/journals\/\d+/)
    await expect(page.locator('[data-testid="success-message"]')).toContainText(
      'Journal created successfully',
    )
  })

  test('should edit an existing journal entry', async ({ page }) => {
    // Navigate to journals collection
    await page.locator('[data-testid="collection-journals"]').click()

    // Click on first journal entry
    await page.locator('[data-testid="journal-row"]').first().click()

    // Should navigate to edit form
    await expect(page).toHaveURL(/\/admin\/collections\/journals\/\d+/)
    await expect(page.locator('[data-testid="journal-form"]')).toBeVisible()

    // Update title
    const titleField = page.locator('[data-testid="field-title"]')
    await titleField.clear()
    await titleField.fill('Updated Journal Title')

    // Update excerpt
    const excerptField = page.locator('[data-testid="field-excerpt"]')
    await excerptField.clear()
    await excerptField.fill('Updated excerpt content')

    // Save changes
    await page.locator('[data-testid="save-journal"]').click()

    // Should show success message
    await expect(page.locator('[data-testid="success-message"]')).toContainText(
      'Journal updated successfully',
    )
  })

  test('should delete a journal entry', async ({ page }) => {
    // Navigate to journals collection
    await page.locator('[data-testid="collection-journals"]').click()

    // Click on journal entry to edit
    await page.locator('[data-testid="journal-row"]').first().click()

    // Click delete button
    await page.locator('[data-testid="delete-journal"]').click()

    // Confirm deletion in modal
    await expect(page.locator('[data-testid="delete-confirmation"]')).toBeVisible()
    await page.locator('[data-testid="confirm-delete"]').click()

    // Should redirect to collection list
    await expect(page).toHaveURL(/\/admin\/collections\/journals/)
    await expect(page.locator('[data-testid="success-message"]')).toContainText(
      'Journal deleted successfully',
    )
  })

  test('should validate required fields', async ({ page }) => {
    // Navigate to create new journal
    await page.locator('[data-testid="collection-journals"]').click()
    await page.locator('[data-testid="create-new-journal"]').click()

    // Try to save without required fields
    await page.locator('[data-testid="save-journal"]').click()

    // Should show validation errors
    await expect(page.locator('[data-testid="field-title-error"]')).toContainText(
      'Title is required',
    )
    await expect(page.locator('[data-testid="field-content-error"]')).toContainText(
      'Content is required',
    )
  })

  test('should auto-generate slug from title', async ({ page }) => {
    // Navigate to create new journal
    await page.locator('[data-testid="collection-journals"]').click()
    await page.locator('[data-testid="create-new-journal"]').click()

    // Fill in title
    await page
      .locator('[data-testid="field-title"]')
      .fill('Test Journal with Special Characters!@#')

    // Check that slug is auto-generated
    const slugField = page.locator('[data-testid="field-slug"]')
    await expect(slugField).toHaveValue('test-journal-with-special-characters')
  })

  test('should manage categories', async ({ page }) => {
    // Navigate to categories collection
    await page.locator('[data-testid="collection-categories"]').click()

    // Create new category
    await page.locator('[data-testid="create-new-category"]').click()

    // Fill in category details
    await page.locator('[data-testid="field-name"]').fill('Test Category')
    await page.locator('[data-testid="field-description"]').fill('This is a test category')
    await page.locator('[data-testid="field-color"]').fill('#FF5733')

    // Save category
    await page.locator('[data-testid="save-category"]').click()

    // Should show success message
    await expect(page.locator('[data-testid="success-message"]')).toContainText(
      'Category created successfully',
    )
  })

  test('should manage tags', async ({ page }) => {
    // Navigate to tags collection
    await page.locator('[data-testid="collection-tags"]').click()

    // Create new tag
    await page.locator('[data-testid="create-new-tag"]').click()

    // Fill in tag details
    await page.locator('[data-testid="field-name"]').fill('Test Tag')

    // Save tag
    await page.locator('[data-testid="save-tag"]').click()

    // Should show success message
    await expect(page.locator('[data-testid="success-message"]')).toContainText(
      'Tag created successfully',
    )

    // Check that journal count is initialized to 0
    await expect(page.locator('[data-testid="field-journalCount"]')).toHaveValue('0')
  })

  test('should assign category and tags to journal', async ({ page }) => {
    // First create a category and tag (assuming they exist)
    // Navigate to create new journal
    await page.locator('[data-testid="collection-journals"]').click()
    await page.locator('[data-testid="create-new-journal"]').click()

    // Fill in basic details
    await page.locator('[data-testid="field-title"]').fill('Journal with Category and Tags')

    const contentEditor = page.locator('[data-testid="field-content"] .lexical-editor')
    await contentEditor.click()
    await contentEditor.fill('Content with category and tags.')

    // Select category
    await page.locator('[data-testid="field-category"]').selectOption({ label: 'Technology' })

    // Select tags
    await page.locator('[data-testid="field-tags"]').selectOption(['React', 'JavaScript'])

    // Save journal
    await page.locator('[data-testid="save-journal"]').click()

    // Should save successfully with relationships
    await expect(page.locator('[data-testid="success-message"]')).toContainText(
      'Journal created successfully',
    )
  })

  test('should validate audio URL format', async ({ page }) => {
    // Navigate to create new journal
    await page.locator('[data-testid="collection-journals"]').click()
    await page.locator('[data-testid="create-new-journal"]').click()

    // Fill in required fields
    await page.locator('[data-testid="field-title"]').fill('Journal with Audio')

    const contentEditor = page.locator('[data-testid="field-content"] .lexical-editor')
    await contentEditor.click()
    await contentEditor.fill('Content with audio.')

    // Enter invalid audio URL
    await page.locator('[data-testid="field-audioUrl"]').fill('invalid-url')

    // Try to save
    await page.locator('[data-testid="save-journal"]').click()

    // Should show validation error
    await expect(page.locator('[data-testid="field-audioUrl-error"]')).toContainText(
      'Invalid audio URL format',
    )

    // Enter valid audio URL
    await page.locator('[data-testid="field-audioUrl"]').clear()
    await page.locator('[data-testid="field-audioUrl"]').fill('https://example.com/audio.mp3')

    // Should save successfully
    await page.locator('[data-testid="save-journal"]').click()
    await expect(page.locator('[data-testid="success-message"]')).toContainText(
      'Journal created successfully',
    )
  })

  test('should handle draft and published status', async ({ page }) => {
    // Navigate to create new journal
    await page.locator('[data-testid="collection-journals"]').click()
    await page.locator('[data-testid="create-new-journal"]').click()

    // Fill in required fields
    await page.locator('[data-testid="field-title"]').fill('Draft Journal')

    const contentEditor = page.locator('[data-testid="field-content"] .lexical-editor')
    await contentEditor.click()
    await contentEditor.fill('This is a draft journal.')

    // Status should default to draft
    await expect(page.locator('[data-testid="field-status"]')).toHaveValue('draft')

    // Save as draft
    await page.locator('[data-testid="save-journal"]').click()
    await expect(page.locator('[data-testid="success-message"]')).toContainText(
      'Journal created successfully',
    )

    // publishedAt should be null for draft
    await expect(page.locator('[data-testid="field-publishedAt"]')).toBeEmpty()

    // Change status to published
    await page.locator('[data-testid="field-status"]').selectOption('published')
    await page.locator('[data-testid="save-journal"]').click()

    // publishedAt should now be set
    await expect(page.locator('[data-testid="field-publishedAt"]')).not.toBeEmpty()
  })

  test('should display journal list with search and filters', async ({ page }) => {
    // Navigate to journals collection
    await page.locator('[data-testid="collection-journals"]').click()

    // Check for search functionality
    await expect(page.locator('[data-testid="search-journals"]')).toBeVisible()

    // Check for status filter
    await expect(page.locator('[data-testid="filter-status"]')).toBeVisible()

    // Test search
    await page.locator('[data-testid="search-journals"]').fill('test')
    await page.keyboard.press('Enter')

    // Should filter results
    const journalRows = await page.locator('[data-testid="journal-row"]').count()
    expect(journalRows).toBeGreaterThanOrEqual(0)

    // Test status filter
    await page.locator('[data-testid="filter-status"]').selectOption('published')

    // Should show only published journals
    const statusCells = page.locator('[data-testid="journal-status"]')
    const count = await statusCells.count()
    for (let i = 0; i < count; i++) {
      await expect(statusCells.nth(i)).toContainText('published')
    }
  })

  test('should handle bulk operations', async ({ page }) => {
    // Navigate to journals collection
    await page.locator('[data-testid="collection-journals"]').click()

    // Select multiple journals
    await page.locator('[data-testid="select-journal"]').first().check()
    await page.locator('[data-testid="select-journal"]').nth(1).check()

    // Check that bulk actions are available
    await expect(page.locator('[data-testid="bulk-actions"]')).toBeVisible()

    // Test bulk publish
    await page.locator('[data-testid="bulk-publish"]').click()
    await page.locator('[data-testid="confirm-bulk-action"]').click()

    // Should show success message
    await expect(page.locator('[data-testid="success-message"]')).toContainText(
      'Journals updated successfully',
    )
  })
})
