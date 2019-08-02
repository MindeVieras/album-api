
/**
 * Main extendable ErrorClass extended from native JS Error.
 *
 * @augments Error
 * @class
 */
class ErrorClass extends Error {

  /**
   * Errors property.
   *
   * Array of error objects,
   * for example express validation errors.
   */
  public errors?: object[]

  /**
   * Http status code.
   */
  public status: number

  /**
   * ErrorClass constructor.
   *
   * @param {string} message - Error message.
   * @param {number} status - Http status code.
   * @param {Array} errors - Array of errors.
   * @param {string} stack - Stack trace of the error.
   */
  constructor(message: string, status: number, errors?: object[], stack?: string) {
    super(message)
    this.name = this.constructor.name
    this.message = message
    this.errors = errors
    this.status = status
    this.stack = stack
  }
}

export default ErrorClass
