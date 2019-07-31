
import httpStatus from 'http-status-codes'

import ErrorClass from '../classes/ErrorClass'

/**
 * Class representing an API error.
 *
 * @augments ErrorClass
 */
class APIError extends ErrorClass {
  /**
   * Creates an API error.
   *
   * @param {string} message - Error message.
   * @param {Array} errors - Multiple error messages.
   * @param {string} stack - Stack trace for the error message.
   * @param {number} status - HTTP status code of error.
   * @param {boolean} isPublic - Whether the message should be visible to user or not.
   */
  constructor({
    message,
    errors,
    stack,
    status = httpStatus.INTERNAL_SERVER_ERROR,
    isPublic = false,
  }) {
    super({
      message, errors, status, isPublic, stack,
    })
  }
}

export default APIError
