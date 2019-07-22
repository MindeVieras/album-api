
import httpStatus from 'http-status-codes'

/**
 * Class representing an API success response.
 */
class APISuccess {

  /**
   * Creates an API success response.
   *
   * @param {object} res - Express response object.
   * @param {mixed} data - Response data.
   * @param {number} status - HTTP status code of the response.
   * @param {string} message - Optional - response message.
   *
   * @returns
   *   JSON object.
   */
  constructor(
    res,
    data = null,
    status = httpStatus.OK,
    message = httpStatus.getStatusText(httpStatus.OK)
  ) {
    return res.status(status).send({
      status,
      message,
      data
    })
  }
}

export default APISuccess
