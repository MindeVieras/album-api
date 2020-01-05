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

/**
 * Initiate User controller.
 */
const User = new UserController()

router.route('/').post(validator.body(paramValidation.authPostBody), User.authorize)
// router.route('/logout').get(User.logout)

export default router
