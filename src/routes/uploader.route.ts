import express from 'express'

import { UploaderController } from '../controllers'
import { isAuthed, paramValidation } from '../config'
import { UserRoles } from '../enums'
import { validator } from '../middleware'

/**
 * Create Uploader router.
 *
 * @path /api/uploader
 */
const router = express.Router()

/**
 * Initiate Uploader controller.
 */
const Uploader = new UploaderController()

router.post('/sign', isAuthed(UserRoles.editor), Uploader.getSignature)

router.post(
  '/success',
  isAuthed(UserRoles.editor),
  validator.body(paramValidation.uploaderSuccessPostBody),
  Uploader.onSuccess,
)

export default router
