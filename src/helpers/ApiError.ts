
import httpStatus from 'http-status-codes'

/**
 * Class representing an API error.
 *
 * @extends Error
 */
export class ApiError extends Error {

  public status: number
  public errors?: string[]

  /**
   * Creates an API error.
   * @param {string} message - Error message.
   * @param {number} status - HTTP status code of error.
   * @param {string[]} errors - Multiple errors.
   */
  constructor(
    // Default message for the internal server error.
    message: string = httpStatus.getStatusText(httpStatus.INTERNAL_SERVER_ERROR),
    // Default status to be 500.
    status: number = httpStatus.INTERNAL_SERVER_ERROR,
    // Pass errors if any.
    errors?: string[],
  ) {
    super()

    // ApiError properties
    this.name = 'ApiError'
    this.status = status
    this.message = message
    if (errors) {
      this.errors = errors
    }
    // Set stacktrace to trace the source of an error.
    this.stack = (new Error()).stack
  }
}
