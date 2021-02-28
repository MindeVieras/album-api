import express from 'express'

import { UserRoles } from 'album-api-config'

import { UserController } from '../controllers'
import { paramValidation, isAuthed } from '../config'
import { validator } from '../middleware'

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
  .get(isAuthed(UserRoles.editor), validator.query(paramValidation.listQuery), User.getList)
  .post(isAuthed(UserRoles.editor), validator.body(paramValidation.userPostBody), User.create)
  .delete(isAuthed(UserRoles.editor), validator.body(paramValidation.deleteBody), User.delete)

router
  .route('/:id')
  .get(isAuthed(UserRoles.viewer), validator.params(paramValidation.idParam), User.getOne)
  .patch(
    isAuthed(UserRoles.viewer),
    validator.params(paramValidation.idParam),
    validator.body(paramValidation.userPatchBody),
    User.updateOne,
  )

export default router
