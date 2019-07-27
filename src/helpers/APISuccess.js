
import httpStatus from 'http-status-codes'

/**
 * Class representing an API success response.
 */
class APISuccess {
  /**
   * Creates an API success response.
   *
   * @param {object} res - Express response object.
   * @param {Array|object|null} data - Response data, either array or object or null.
   * @param {number} status - HTTP status code of the response.
   * @param {string} message - Optional - response message.
   *
   * @returns {Promise}
   *   Successful JSON data object.
   */
  constructor(
    res,
    data = null,
    status = httpStatus.OK,
    message = httpStatus.getStatusText(httpStatus.OK),
  ) {
    return res.status(status).send({
      status,
      message,
      data,
    })
  }
}

export default APISuccess
