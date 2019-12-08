import express from 'express'

import { isAdmin } from '../helpers'

import { UserController } from '../controllers'
import { paramValidation } from '../config'
import { validator } from '../middlewares'

/**
 * Create Users router.
 *
 * @path /api/users
 */
const router = express.Router()

/**
 * Initiate User controller.
 */
const User = new UserController()

router
  .route('/')
  // @ts-ignore
  .get(isAdmin, validator.query(paramValidation.listQuery), User.getList)
  .post(isAdmin, validator.body(paramValidation.userPostBody), User.create)

router
  .route('/:id')
  // @ts-ignore
  .get(isAdmin, validator.params(paramValidation.idParam), User.getOne)
  .patch(
    isAdmin,
    validator.params(paramValidation.idParam),
    validator.body(paramValidation.userPatchBody),
    User.updateOne,
  )
  .delete(isAdmin, validator.params(paramValidation.idParam), User.deleteOne)

export default router
