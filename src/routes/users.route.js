
import express from 'express'

import { isAdmin } from '../helpers/authenticate'
import {
  create,
  getList,
  getOne,
  _delete
} from '../models/users.model'

const router = express.Router()

router.get('/', isAdmin, getList)
router.post('/create', isAdmin, create)
router.get('/get-one/:username', isAdmin, getOne)
router.delete('/:id', isAdmin, _delete)

export default router
