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

router
  .route('/')
  .get(isAuthed(UserRoles.editor), validator.query(paramValidation.listQuery), UserController.getList)
  .post(isAuthed(UserRoles.editor), validator.body(paramValidation.userPostBody), UserController.create)
  .delete(isAuthed(UserRoles.editor), validator.body(paramValidation.deleteBody), UserController.delete)

router
  .route('/:id')
  .get(isAuthed(UserRoles.viewer), validator.params(paramValidation.idParam), UserController.getOne)
  .patch(
    isAuthed(UserRoles.viewer),
    validator.params(paramValidation.idParam),
    validator.body(paramValidation.userPatchBody),
    UserController.updateOne,
  )

export default router
