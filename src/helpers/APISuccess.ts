
import { Response } from 'express'
import httpStatus from 'http-status-codes'

/**
 * Class representing an API success response.
 *
 * @class
 */
class APISuccess {

  /**
   * Creates an API success response.
   *
   * @param {Response} res - Express response object.
   * @param {Array|object|null} data - Response data, either array or object or null.
   * @param {number} status - HTTP status code of the response.
   * @param {string} message - Optional - response message.
   *
   * @returns {Response}
   *   Successful JSON response.
   */
  constructor(
    res: Response,
    data: any = null,
    status: number = httpStatus.OK,
    message: string = httpStatus.getStatusText(httpStatus.OK),
  ) {
    return res.status(status).send({
      status,
      message,
      data,
    })
  }
}

export default APISuccess
