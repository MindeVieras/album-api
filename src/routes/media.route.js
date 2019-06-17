
import express from 'express'

import { isAuthed } from '../helpers/authenticate'
import {
  setLocation, updateLocation, removeLocation,
  putToTrash, moveMedia,
  getImageMeta, saveMetadata,
  saveRekognitionLabels, saveRekognitionText,
  generateImageThumbs, generateVideos
} from '../controllers/media.controller'

const router = express.Router()

router.post('/set-location', isAuthed, setLocation)
router.post('/update-location', isAuthed, updateLocation)
router.get('/remove-location/:id', isAuthed, removeLocation)

router.post('/put-to-trash', isAuthed, putToTrash)
router.post('/move', isAuthed, moveMedia)
router.post('/save-metadata', isAuthed, saveMetadata)
router.post('/save-rekognition-labels', isAuthed, saveRekognitionLabels)
router.post('/save-rekognition-text', isAuthed, saveRekognitionText)
router.post('/generate-image-thumbs', isAuthed, generateImageThumbs)
router.post('/generate-videos', isAuthed, generateVideos)

router.post('/get-image-meta', isAuthed, getImageMeta)

export default router
