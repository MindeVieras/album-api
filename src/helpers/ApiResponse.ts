import httpStatus from 'http-status-codes'
import { Response } from 'express'

/**
 * Class representing an API response.
 */
export class ApiResponse<T> {
  /**
   * Creates an API response.
   *
   * @param {Response} res
   *   Express response.
   * @param {T} data
   *   Data to pass to the response.
   * @param {number} status
   *   Optional, http status for the response.
   */
  constructor(res: Response, data: T, status: number = httpStatus.OK) {
    // Build response object.
    const response = {
      data,
    }

    // Send response back to client.
    res.status(status).send(response)
  }
}
