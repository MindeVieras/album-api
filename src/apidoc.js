
/**
 * @apiDefine AccessForbiddenError
 *
 * @apiError {String} status Response status
 * @apiError {String} error  Response error
 *
 * @apiErrorExample Access-Error:
 *     HTTP/1.1 403 Forbidden
 *     {
 *       "status": "fail"
 *       "error": "Access to this resource is forbidden"
 *     }
 */

/**
 * @apiDefine InternalServerError
 *
 * @apiError {String} status Response status
 * @apiError {String} error  Response error
 *
 * @apiErrorExample Server-Error:
 *     HTTP/1.1 500 Internal server error
 *     {
 *       "status": "error"
 *       "error": "Internal server error, ckeck logs"
 *     }
 */
