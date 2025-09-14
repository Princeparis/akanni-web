/**
 * Error handling classes and types
 * Based on requirements 4.2 and 7.1
 */

// Error codes enum for consistent error handling
export enum ErrorCodes {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  RATE_LIMIT = 'RATE_LIMIT',
  INVALID_SLUG = 'INVALID_SLUG',
  INVALID_URL = 'INVALID_URL',
  DUPLICATE_ENTRY = 'DUPLICATE_ENTRY',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
}

// Custom API Error class
export class APIError extends Error {
  constructor(
    public code: ErrorCodes,
    public message: string,
    public statusCode: number,
    public details?: any,
  ) {
    super(message)
    this.name = 'APIError'
  }
}

// Validation error class for form validation
export class ValidationError extends Error {
  constructor(
    public field: string,
    public message: string,
    public value?: any,
  ) {
    super(`Validation failed for field '${field}': ${message}`)
    this.name = 'ValidationError'
  }
}

// Error response interface for consistent error formatting
export interface ErrorResponse {
  success: false
  error: {
    code: ErrorCodes
    message: string
    field?: string
    details?: any
  }
  timestamp: string
}

// Validation result interface
export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
}

// Field validation result
export interface FieldValidationResult {
  isValid: boolean
  error?: string
}
