
import express from 'express'

import { isAdmin } from '../helpers/authenticate'
import {
    getList,
    restore,
    _delete
} from '../models/trash.model'

const router = express.Router()

router.get('/get-list', isAdmin, getList)
router.post('/restore/:id', isAdmin, restore)
router.delete('/delete/:id', isAdmin, _delete)

export default router
