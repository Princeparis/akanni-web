# TypeScript Types and Interfaces

This directory contains all TypeScript type definitions for the journal system.

## Files Overview

### `journal.ts`

- Core interfaces for Journal, Category, and Tag entities
- Form data interfaces for Payload CMS collections
- Status enums and related types

### `api.ts`

- API response interfaces including pagination
- Query parameter types for filtering and sorting
- Success and error response wrappers

### `errors.ts`

- Error handling classes and enums
- Validation error types
- API error response interfaces

### `state.ts`

- React state management interfaces
- Action types for reducers
- Loading and pagination state definitions

### `index.ts`

- Central export file for all types
- Resolves naming conflicts between modules

## Usage

```typescript
import { JournalEntry, Category, Tag } from '@/types'
import { APIError, ErrorCodes } from '@/types/errors'
import { JournalState, JournalAction } from '@/types/state'
```

## Key Features

- **Type Safety**: All interfaces ensure compile-time type checking
- **Payload Integration**: Compatible with Payload CMS generated types
- **Error Handling**: Comprehensive error type system
- **State Management**: Typed Redux-style actions and state
- **API Consistency**: Standardized request/response formats
