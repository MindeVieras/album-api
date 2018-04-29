
import express from 'express'

import { isAuthed } from '../helpers/authenticate'
import {
    getList,
    getListDates,
    getOne,
    create,
    rename,
    changeDate,
    setLocation,
    updateLocation,
    removeLocation,
    moveToTrash
} from '../models/albums.model'

const router = express.Router()

router.post('/list', isAuthed, getList)
router.get('/list-dates', isAuthed, getListDates)
router.get('/one/:id', isAuthed, getOne)
router.post('/create', isAuthed, create)
router.post('/rename', isAuthed, rename)
router.post('/change-date', isAuthed, changeDate)
router.post('/set-location', isAuthed, setLocation)
router.post('/update-location', isAuthed, updateLocation)
router.get('/remove-location/:id', isAuthed, removeLocation)
router.delete('/move-to-trash/:id', isAuthed, moveToTrash)

export default router