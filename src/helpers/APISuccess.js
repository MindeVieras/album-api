
import httpStatus from 'http-status-codes'

/**
 * Class representing an API success response.
 */
class APISuccess {
  /**
   * Creates an API success response.
   * @param {object} res - Express response object.
   * @param {mixed} data - Response data.
   * @param {number} code - HTTP status code of the response.
   * @param {string} message - Optional - response message.
   */
  constructor(res, data = null, code = httpStatus.OK, message = httpStatus.getStatusText(httpStatus.OK)) {
    return res.status(code).send({
      code,
      message,
      data
    })
  }
}

export default APISuccess
