
import express from 'express'

import { isAuthed } from '../helpers/authenticate'
import {
  getCollectionFaces,
  deleteCollectionFace
} from '../models/faces.model'

const router = express.Router()

router.get('/collection', isAuthed, getCollectionFaces)
router.delete('/collection/:id', isAuthed, deleteCollectionFace)

export default router
