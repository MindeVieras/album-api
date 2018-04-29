
import express from 'express'

import {
	getSignature,
	onSuccess
} from '../models/uploader.model'

// import { isAuthed } from '../helpers/authenticate'

const router = express.Router()

router.post('/sign', getSignature)
router.post('/success', onSuccess)

export default router
