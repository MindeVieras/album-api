
import { createValidator } from 'express-joi-validation'

/**
 * Uses express-joi-validation for param validation.
 */
export const validator = createValidator({ passError: true })
