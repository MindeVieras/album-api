
import express from 'express'

import { isAdmin } from '../helpers/authenticate'
import {
  getUserList, getUser,
  createUser, deleteUser
} from '../models/users.model'

const router = express.Router()

router.get('/', isAdmin, getUserList)
router.get('/:id', isAdmin, getUser)
router.post('/', isAdmin, createUser)
router.delete('/:id', isAdmin, deleteUser)

export default router
