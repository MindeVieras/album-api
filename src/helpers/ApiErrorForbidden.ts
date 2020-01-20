import httpStatus from 'http-status-codes'

import { ApiError } from './ApiError'

/**
 * Class representing an API error 403.
 *
 * @extends ApiError
 */
export class ApiErrorForbidden extends ApiError {
  /**
   * Creates an API error 403.
   *
   * @param {string} message - Error message.
   */
  constructor(
    // Default message - 'Forbidden'.
    message: string = httpStatus.getStatusText(httpStatus.FORBIDDEN),
  ) {
    super()

    // ApiErrorForbidden properties
    this.status = httpStatus.FORBIDDEN
    this.message = message
  }
}
