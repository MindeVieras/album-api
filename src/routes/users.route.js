
import express from 'express'

import { isAdmin } from '../helpers/authenticate'
import {
  getList, getUser,
  createUser, deleteUser
} from '../models/users.model'

const router = express.Router()

router.get('/', isAdmin, getList)
router.get('/:username', isAdmin, getUser)
router.post('/', isAdmin, createUser)
router.delete('/:id', isAdmin, deleteUser)

export default router
