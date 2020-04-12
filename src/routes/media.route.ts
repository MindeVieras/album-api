import express from 'express'

import { MediaController } from '../controllers'
import { paramValidation, isAuthed } from '../config'
import { validator } from '../middleware'
import { UserRoles } from '../enums'

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
  .route('/:id')
  .get(isAuthed(UserRoles.viewer), validator.params(paramValidation.idParam), Media.getOne)

export default router
