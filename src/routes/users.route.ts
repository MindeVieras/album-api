
import express from 'express'

import { isAdmin } from '../helpers/authenticate'
import {
  getList, getUser,
  createUser, deleteUser,
} from '../controllers/users.model'

/**
 * Create Users router.
 *
 * @path /api/users
 */
const router = express.Router()

router.route('/')
  .get(isAdmin, getList)
  .post(isAdmin, createUser)

router.route('/:id')
  .get(isAdmin, getUser)
  .delete(isAdmin, deleteUser)

export default router
