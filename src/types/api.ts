/**
 * API response types and interfaces
 * Based on requirements 4.2 and 4.4
 */

import { JournalEntry, Category, Tag } from './journal'

// Generic paginated response interface
export interface PaginatedResponse<T> {
  docs: T[]
  totalDocs: number
  limit: number
  page: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
  nextPage?: number
  prevPage?: number
}

// Specific journal list response
export interface JournalListResponse extends PaginatedResponse<JournalEntry> {
  categories: Category[]
  tags: Tag[]
}

// API Success response wrapper
export interface APISuccess<T> {
  success: true
  data: T
  timestamp: string
}

// API Error response wrapper
export interface APIError {
  success: false
  error: {
    message: string
    code: string
    details?: any
  }
  timestamp: string
}

// Union type for all API responses
export type APIResponse<T> = APISuccess<T> | APIError

// Query parameters for journal listing
export interface JournalQueryParams {
  page?: number
  limit?: number
  category?: string
  tags?: string[]
  status?: 'draft' | 'published'
  search?: string
  sortBy?: 'createdAt' | 'updatedAt' | 'publishedAt' | 'title'
  sortOrder?: 'asc' | 'desc'
}

// Filter parameters for frontend state
export interface JournalFilters {
  category?: string
  tags?: string[]
  status?: 'draft' | 'published'
  search?: string
}
