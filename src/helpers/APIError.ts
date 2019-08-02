
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
   * @param {number} status - HTTP status code of error.
   * @param {Array} errors - Multiple error messages.
   * @param {string} stack - Stack trace for the error message.
   */
  constructor(message: string, status: number, errors?: object[], stack?: string) {
    super(message, status, errors, stack)
  }
}

export default APIError
