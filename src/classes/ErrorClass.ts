
/**
 * Main extendable ErrorClass extended from native JS Error.
 *
 * @augments Error
 * @class
 */
class ErrorClass extends Error {
  constructor() {
    super(message)
    this.name = this.constructor.name
    this.message = message
    this.errors = errors
    this.status = status
    this.isPublic = isPublic
    this.isOperational = true
    this.stack = stack
  }
}

export default ErrorClass

// constructor(message, status, isPublic) {
//   super(message)
//   this.name = this.constructor.name
//   this.message = message
//   this.status = status
//   this.isPublic = isPublic
//   this.isOperational = true // This is required since bluebird 4 doesn't append it anymore.
//   Error.captureStackTrace(this, this.constructor.name)
// }
