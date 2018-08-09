
import express from 'express'

import { isAdmin } from '../helpers/authenticate'
import {
  create,
  getList,
  getOne,
  _delete
} from '../models/users.model'

const router = express.Router()

router.post('/create', isAdmin, create)
router.get('/get-list', isAdmin, getList)
router.get('/get-one/:username', isAdmin, getOne)
router.delete('/delete/:id', isAdmin, _delete)

export default router
