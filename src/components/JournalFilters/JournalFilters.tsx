'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useJournalFilters } from '../../hooks/useJournalFilters'
import { useCategories } from '../../hooks/useCategories'
import { useTags } from '../../hooks/useTags'
import { JournalFilters as JournalFiltersType } from '../../types/api'
import './JournalFilters.css'

interface JournalFiltersProps {
  className?: string
  onFiltersChange?: (filters: JournalFiltersType) => void
}

// Debounce hook for search input
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

export default function JournalFilters({ className = '', onFiltersChange }: JournalFiltersProps) {
  const { filters, updateFilters, clearFilters } = useJournalFilters()
  const { categories, loading: categoriesLoading } = useCategories()
  const { tags, loading: tagsLoading } = useTags()

  // Local state for search input (before debouncing)
  const [searchInput, setSearchInput] = useState(filters.search || '')
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false)

  // Debounced search value
  const debouncedSearch = useDebounce(searchInput, 300)

  // Update filters when debounced search changes
  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      updateFilters({ search: debouncedSearch || undefined })
    }
  }, [debouncedSearch, filters.search]) // Remove updateFilters from dependencies

  // Notify parent component of filter changes
  useEffect(() => {
    if (onFiltersChange) {
      onFiltersChange(filters)
    }
  }, [filters]) // Remove onFiltersChange from dependencies

  const handleCategoryChange = useCallback(
    (categoryId: string) => {
      const newCategory = categoryId === filters.category ? undefined : categoryId
      updateFilters({ category: newCategory })
    },
    [filters.category, updateFilters],
  )

  const handleTagToggle = useCallback(
    (tagId: string) => {
      const currentTags = filters.tags || []
      const newTags = currentTags.includes(tagId)
        ? currentTags.filter((id) => id !== tagId)
        : [...currentTags, tagId]

      updateFilters({ tags: newTags.length > 0 ? newTags : undefined })
    },
    [filters.tags, updateFilters],
  )

  const handleStatusChange = useCallback(
    (status: 'draft' | 'published' | '') => {
      updateFilters({ status: status || undefined })
    },
    [updateFilters],
  )

  const handleClearFilters = useCallback(() => {
    setSearchInput('')
    clearFilters()
  }, [clearFilters])

  const hasActiveFilters = Boolean(
    filters.search ||
      filters.category ||
      (filters.tags && filters.tags.length > 0) ||
      filters.status,
  )

  const activeFilterCount = [
    filters.search,
    filters.category,
    filters.tags && filters.tags.length > 0 ? filters.tags : null,
    filters.status,
  ].filter(Boolean).length

  return (
    <div className={`journal-filters ${className}`}>
      {/* Search Bar */}
      <div className="search-container">
        <div className="search-input-wrapper">
          <svg
            className="search-icon"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search journal entries..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="search-input"
            aria-label="Search journal entries"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => setSearchInput('')}
              className="search-clear"
              aria-label="Clear search"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>

        {/* Filter Toggle Button */}
        <button
          type="button"
          onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
          className={`filters-toggle ${isFiltersExpanded ? 'active' : ''}`}
          aria-label="Toggle filters"
          aria-expanded={isFiltersExpanded}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
          </svg>
          <span>Filters</span>
          {activeFilterCount > 0 && <span className="filter-count">{activeFilterCount}</span>}
        </button>
      </div>

      {/* Expandable Filters */}
      <div className={`filters-panel ${isFiltersExpanded ? 'expanded' : ''}`}>
        <div className="filters-content">
          {/* Status Filter */}
          <div className="filter-group">
            <label className="filter-label">Status</label>
            <div className="filter-options">
              <button
                type="button"
                onClick={() => handleStatusChange('')}
                className={`filter-option ${!filters.status ? 'active' : ''}`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => handleStatusChange('published')}
                className={`filter-option ${filters.status === 'published' ? 'active' : ''}`}
              >
                Published
              </button>
              <button
                type="button"
                onClick={() => handleStatusChange('draft')}
                className={`filter-option ${filters.status === 'draft' ? 'active' : ''}`}
              >
                Draft
              </button>
            </div>
          </div>

          {/* Categories Filter */}
          <div className="filter-group">
            <label className="filter-label">Categories</label>
            <div className="filter-options">
              {categoriesLoading ? (
                <div className="filter-loading">Loading categories...</div>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => handleCategoryChange('')}
                    className={`filter-option ${!filters.category ? 'active' : ''}`}
                  >
                    All Categories
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => handleCategoryChange(category.id)}
                      className={`filter-option category-option ${filters.category === category.id ? 'active' : ''}`}
                      style={
                        { '--category-color': category.color || '#b2e3ff' } as React.CSSProperties
                      }
                    >
                      <span className="category-indicator"></span>
                      {category.name}
                      {category.journalCount !== undefined && (
                        <span className="count">({category.journalCount})</span>
                      )}
                    </button>
                  ))}
                </>
              )}
            </div>
          </div>

          {/* Tags Filter */}
          <div className="filter-group">
            <label className="filter-label">Tags</label>
            <div className="filter-options tags-grid">
              {tagsLoading ? (
                <div className="filter-loading">Loading tags...</div>
              ) : (
                <>
                  {tags.map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => handleTagToggle(tag.id)}
                      className={`filter-option tag-option ${filters.tags?.includes(tag.id) ? 'active' : ''}`}
                    >
                      {tag.name}
                      {tag.journalCount !== undefined && (
                        <span className="count">({tag.journalCount})</span>
                      )}
                    </button>
                  ))}
                </>
              )}
            </div>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <div className="filter-actions">
              <button type="button" onClick={handleClearFilters} className="clear-filters-btn">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="active-filters">
          <span className="active-filters-label">Active filters:</span>
          <div className="active-filters-list">
            {filters.search && (
              <span className="active-filter">
                Search: "{filters.search}"
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput('')
                    updateFilters({ search: undefined })
                  }}
                  aria-label="Remove search filter"
                >
                  ×
                </button>
              </span>
            )}
            {filters.category && (
              <span className="active-filter">
                Category:{' '}
                {categories.find((c) => c.id === filters.category)?.name || filters.category}
                <button
                  type="button"
                  onClick={() => updateFilters({ category: undefined })}
                  aria-label="Remove category filter"
                >
                  ×
                </button>
              </span>
            )}
            {filters.status && (
              <span className="active-filter">
                Status: {filters.status}
                <button
                  type="button"
                  onClick={() => updateFilters({ status: undefined })}
                  aria-label="Remove status filter"
                >
                  ×
                </button>
              </span>
            )}
            {filters.tags &&
              filters.tags.map((tagId) => {
                const tag = tags.find((t) => t.id === tagId)
                return tag ? (
                  <span key={tagId} className="active-filter">
                    Tag: {tag.name}
                    <button
                      type="button"
                      onClick={() => handleTagToggle(tagId)}
                      aria-label={`Remove ${tag.name} tag filter`}
                    >
                      ×
                    </button>
                  </span>
                ) : null
              })}
          </div>
        </div>
      )}
    </div>
  )
}
