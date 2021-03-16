import express from 'express'

import { UserRoles } from 'album-sdk'

import { AlbumController } from '../controllers'
import { paramValidation, isAuthed } from '../config'
import { validator } from '../middleware'

/**
 * Create Albums router.
 *
 * @path /api/albums
 */
const router = express.Router()

/**
 * Initiate Album controller.
 */
const Album = new AlbumController()

router
  .route('/')
  .get(isAuthed(UserRoles.viewer), validator.query(paramValidation.listQuery), Album.getList)
  .post(isAuthed(UserRoles.editor), validator.body(paramValidation.albumPostBody), Album.create)
  .delete(isAuthed(UserRoles.editor), validator.body(paramValidation.deleteBody), Album.delete)

router
  .route('/:id')
  .get(isAuthed(UserRoles.viewer), validator.params(paramValidation.idParam), Album.getOne)
  .patch(
    isAuthed(UserRoles.editor),
    validator.params(paramValidation.idParam),
    validator.body(paramValidation.albumPatchBody),
    Album.updateOne,
  )

export default router
