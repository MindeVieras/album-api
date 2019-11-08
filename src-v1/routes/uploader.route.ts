
import express from 'express'

import {
  getSignature,
  onSuccess
} from '../models/uploader.model'

const router = express.Router()

router.post('/sign', getSignature)
router.post('/success', onSuccess)

export default router
