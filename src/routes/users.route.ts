
import express from 'express'

import { isAdmin } from '../helpers/authenticate'
import {
  getList, getUser,
  createUser, deleteUser,
} from '../controllers/users.model'
import { UsersController } from '../controllers'

/**
 * Create Users router.
 *
 * @path /api/users
 */
const router = express.Router()

/**
 * Initiate Users controller.
 */
const Users = new UsersController()

router.route('/')
  .get(Users.getList)
  .post(Users.create)

router.route('/:id')
  .get(isAdmin, getUser)
  .delete(isAdmin, deleteUser)

export default router
