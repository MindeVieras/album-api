
import { Response } from 'express'
import { OK, getStatusText } from 'http-status-codes'

/**
 * Class representing an API success response.
 *
 * @class
 */
export class APISuccess {

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
    private res: Response,
    private data: any = null,
    private status: number = OK,
    private message: string = getStatusText(OK),
  ) {
    this.res.status(this.status).send({
      status: this.status,
      message: this.message,
      data: this.data,
    })
  }
}
