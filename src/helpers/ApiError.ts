
import httpStatus from 'http-status-codes'

/**
 * Class representing an API error.
 *
 * @extends Error
 */
export class ApiError extends Error {
  // constructor({ message, errors, status, isPublic, stack }) {
  constructor(message: string) {
    super(message)
    // this.name = this.constructor.name
    this.message = message
    // this.errors = errors
    // this.status = status
    // this.isPublic = isPublic
    // this.isOperational = true
    // this.stack = stack
    // Error.captureStackTrace(this, this.constructor.name)
  }
}

// /**
//  * Class representing an API error.
//  * @extends ExtendableError
//  */
// export class ApiError extends ExtendableError {
//   /**
//    * Creates an API error.
//    * @param {string} message - Error message.
//    * @param {array} errors - Multiple error messages.
//    * @param {string} stack - Stack trace for the error message.
//    * @param {number} status - HTTP status code of error.
//    * @param {boolean} isPublic - Whether the message should be visible to user or not.
//    */
//   constructor({
//     message,
//     errors,
//     stack,
//     status = HttpStatus.INTERNAL_SERVER_ERROR,
//     isPublic = false
//   }) {
//     super({
//       message, errors, status, isPublic, stack
//     })
//   }
// }
