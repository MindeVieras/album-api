import express from 'express'

import { UserController } from '../controllers'
import { paramValidation } from '../config'
import { validator } from '../middleware'

/**
 * User authentication router.
 *
 * @path /api/auth
 */
const router = express.Router()

router.route('/').post(validator.body(paramValidation.authPostBody), UserController.authorize)

export default router
