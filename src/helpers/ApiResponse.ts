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
   *   Optional, http status for the response, default 200.
   *   If no data, status will fallback to 204 - No Content.
   */
  constructor(res: Response, data: T = null, status: number = data ? httpStatus.OK : httpStatus.NO_CONTENT) {
    // Build response object.
    const response = {
      status: 'SUCCESS',
      data,
    }

    // Send response back to client.
    res.status(status).send(response)
  }
}
