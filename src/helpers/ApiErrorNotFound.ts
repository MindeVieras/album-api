import httpStatus from 'http-status-codes'

import { ApiError } from './ApiError'

/**
 * Class representing an API error 404.
 *
 * @extends ApiError
 */
export class ApiErrorNotFound extends ApiError {
  /**
   * Creates an API error 404.
   *
   * @param {string} message - Error message.
   */
  constructor(
    // Default message - 'Not Found'.
    message: string = httpStatus.getStatusText(httpStatus.NOT_FOUND),
  ) {
    super(message)

    // ApiErrorForbidden properties
    this.status = httpStatus.NOT_FOUND
  }
}
