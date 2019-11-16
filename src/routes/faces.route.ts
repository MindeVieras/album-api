
import express from 'express'

import { isAuthed } from '../helpers/authenticate'
import {
  detectImageFaces,
  getCollectionFaces,
  deleteCollectionFace,
} from '../controllers/faces.model'

const router = express.Router()

router.get('/detect/:id', isAuthed, detectImageFaces)

router.get('/collection', isAuthed, getCollectionFaces)
router.delete('/collection/:id', isAuthed, deleteCollectionFace)

export default router
