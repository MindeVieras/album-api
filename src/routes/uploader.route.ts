import express from 'express'

import { UploaderController } from '../controllers'
import { isAuthed } from '../config'
import { UserRoles } from '../enums'

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

// @todo validate params.
router.post('/sign', isAuthed(UserRoles.editor), Uploader.getSignature)
// @todo validate params.
router.post('/success', isAuthed(UserRoles.editor), Uploader.onSuccess)

export default router
