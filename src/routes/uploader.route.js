
import express from 'express'

import {
  getSignature,
  onSuccess
} from '../controllers/uploader.controller'

const router = express.Router()

router.post('/sign', getSignature)
router.post('/success', onSuccess)

export default router
