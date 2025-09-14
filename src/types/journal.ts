/**
 * Core TypeScript interfaces for the Journal system
 * Based on requirements 4.2, 4.4, and 7.1
 */

import { Media, User } from '../payload-types'

// Status enums for journal entries
export enum JournalStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
}

// Core Journal Entry interface
export interface JournalEntry {
  id: string
  title: string
  slug: string
  content: any // Lexical rich text content
  excerpt?: string
  coverImage?: Media
  audioUrl?: string
  status: JournalStatus
  publishedAt?: Date
  category?: Category
  tags?: Tag[]
  seo?: {
    title?: string
    description?: string
  }
  createdAt: Date
  updatedAt: Date
  author: User
}

// Category interface
export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  color?: string
  journalCount?: number
  createdAt: Date
  updatedAt: Date
}

// Tag interface
export interface Tag {
  id: string
  name: string
  slug: string
  journalCount?: number
  createdAt: Date
  updatedAt: Date
}

// Payload collection interfaces (for form data)
export interface JournalFormData {
  title: string
  slug?: string
  content: any
  excerpt?: string
  coverImage?: string | number
  audioUrl?: string
  status: JournalStatus
  publishedAt?: string
  category?: string | number
  tags?: (string | number)[]
  seo?: {
    title?: string
    description?: string
  }
}

export interface CategoryFormData {
  name: string
  slug?: string
  description?: string
  color?: string
}

export interface TagFormData {
  name: string
  slug?: string
}
