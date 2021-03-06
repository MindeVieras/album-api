import express from 'express'
import companion from '@uppy/companion'

import { UserRoles } from 'album-sdk'

import { UploaderController } from '../controllers'
import { isAuthed, paramValidation } from '../config'
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

router.use('/', companion.app(UploaderController.uppyOptions))

router.post('/sign', isAuthed(UserRoles.editor), Uploader.getSignature)

router.post(
  '/success',
  isAuthed(UserRoles.editor),
  validator.body(paramValidation.uploaderSuccessPostBody),
  Uploader.onSuccess,
)

export default router
