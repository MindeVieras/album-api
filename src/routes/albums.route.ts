import express from 'express'

import { AlbumController } from '../controllers'
import { paramValidation, isAuthed } from '../config'
import { validator } from '../middleware'
import { UserRoles } from '../enums'
// import { isAuthed } from '../helpers/authenticate'
// import {
//   getList,
//   getListDates,
//   getOne,
//   create,
//   rename,
//   changeDate,
//   setLocation,
//   updateLocation,
//   removeLocation,
//   moveToTrash,
// } from '../controllers/albums.model'

/**
 * Create Albums router.
 *
 * @path /api/albums
 */
const router = express.Router()

/**
 * Initiate Album controller.
 */
const Album = new AlbumController()

router
  .route('/')
  .get(isAuthed(UserRoles.viewer), validator.query(paramValidation.listQuery), Album.getList)
  .post(isAuthed(UserRoles.editor), validator.body(paramValidation.userPostBody), Album.create)
  .delete(isAuthed(UserRoles.editor), validator.body(paramValidation.deleteBody), Album.delete)

router
  .route('/:id')
  .get(isAuthed(UserRoles.viewer), validator.params(paramValidation.idParam), Album.getOne)
  .patch(
    isAuthed(UserRoles.editor),
    validator.params(paramValidation.idParam),
    validator.body(paramValidation.albumPatchBody),
    Album.updateOne,
  )

// router.post('/list', isAuthed, getList)
// router.get('/list-dates', isAuthed, getListDates)
// router.get('/one/:id', isAuthed, getOne)
// router.post('/create', isAuthed, create)
// router.post('/rename', isAuthed, rename)
// router.post('/change-date', isAuthed, changeDate)
// router.post('/set-location', isAuthed, setLocation)
// router.post('/update-location', isAuthed, updateLocation)
// router.get('/remove-location/:id', isAuthed, removeLocation)
// router.delete('/move-to-trash/:id', isAuthed, moveToTrash)

export default router
