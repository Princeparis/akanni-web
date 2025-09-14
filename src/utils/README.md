# Utility Functions

This directory contains utility functions for the journal system.

## Files Overview

### `validation.ts`

- URL and audio URL validation
- Slug format validation
- Required field validation
- Email and hex color validation
- Rich text content validation

### `slug.ts`

- Slug generation from text
- Unique slug enforcement
- Slug formatting utilities

### `constants.ts`

- Shared constants and enums
- Validation limits and constraints
- HTTP status codes
- Cache duration settings
- Default values

### `formatters.ts`

- Date formatting utilities
- Text truncation and capitalization
- Number formatting
- Rich text to plain text extraction
- Excerpt generation

### `error-handler.ts`

- API error handling middleware
- Standardized error responses
- Request validation utilities
- Query parameter parsing

### `index.ts`

- Central export file for all utilities

## Usage

```typescript
import { validateUrl, generateSlug } from '@/utils'
import { APIError, ErrorCodes } from '@/utils/error-handler'
import { formatDate, truncateText } from '@/utils/formatters'
```

## Key Features

- **Validation**: Comprehensive input validation with detailed error messages
- **Error Handling**: Standardized API error responses and middleware
- **Text Processing**: Slug generation and text formatting utilities
- **Type Safety**: All functions are fully typed with TypeScript
- **Testing**: Unit tests included for critical functions

## Testing

Run tests with:

```bash
npx vitest run src/utils/__tests__
```
