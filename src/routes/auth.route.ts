
import express from 'express'

import { UserController } from '../controllers'
import { paramValidation } from '../config'
import { validator } from '../middlewares'

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

router.route('/')
  .post(validator.body(paramValidation.authPostBody), User.authorize)

export default router