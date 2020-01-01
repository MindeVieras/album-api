import express from 'express'

import { UserController } from '../controllers'
import { paramValidation, isAuthed } from '../config'
import { validator } from '../middlewares'
import { UserRoles } from '../enums'

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
  .get(isAuthed(UserRoles.authed), validator.query(paramValidation.listQuery), User.getList)
  .post(validator.body(paramValidation.userPostBody), User.create)

router
  .route('/:id')
  .get(validator.params(paramValidation.idParam), User.getOne)
  .patch(
    validator.params(paramValidation.idParam),
    validator.body(paramValidation.userPatchBody),
    User.updateOne,
  )
  .delete(validator.params(paramValidation.idParam), User.deleteOne)

export default router
