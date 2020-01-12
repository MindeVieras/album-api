import httpStatus from 'http-status-codes'
import { ValidationError } from '@hapi/joi'

/**
 * Validation errors.
 *
 * Key is the name of the field
 * and value is validation message string.
 */
export interface IValidationErrors {
  [name: string]: string
}

/**
 * Class representing an API error.
 *
 * @extends Error
 */
export class ApiError extends Error {
  public status: number
  public code?: string | number
  public errors?: IValidationErrors
  public error?: ValidationError

  /**
   * Creates an API error.
   *
   * @param {string} message - Error message.
   * @param {number} status - HTTP status code of error.
   * @param {ValidationErrorItem[]} errors - Multiple errors.
   * @param {string|number} code - Custom error code.
   */
  constructor(
    // Default message for the internal server error.
    message: string = httpStatus.getStatusText(httpStatus.INTERNAL_SERVER_ERROR),
    // Default status to be 500.
    status: number = httpStatus.INTERNAL_SERVER_ERROR,
    // Pass errors if any.
    errors?: IValidationErrors,
    // Error code.
    code?: string | number,
  ) {
    super()

    // ApiError properties
    this.name = 'ApiError'
    this.status = status
    this.message = message
    if (errors) {
      this.errors = errors
    }
    if (code) {
      this.code = code
    }
    // Set stacktrace to trace the source of an error.
    this.stack = new Error().stack
  }
}
