import express from 'express'

import { UserRoles } from 'album-sdk'

import { MediaController } from '../controllers'
import { paramValidation, isAuthed } from '../config'
import { validator } from '../middleware'

/**
 * Create Media router.
 *
 * @path /api/media
 */
const router = express.Router()

/**
 * Initiate Media controller.
 */
const Media = new MediaController()

router
  .route('/')
  .post(isAuthed(UserRoles.editor), validator.body(paramValidation.mediaPostBody), Media.create)

router
  .route('/:id')
  .get(isAuthed(UserRoles.viewer), validator.params(paramValidation.idParam), Media.getOne)

export default router
