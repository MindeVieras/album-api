import express from 'express'

import { isAdmin } from '../helpers/authenticate'
// import {
//   getList, getUser,
//   createUser, deleteUser,
// } from '../controllers/users.model'

import { UserController } from '../controllers'
import { paramValidation } from '../config'
import { validator } from '../middlewares'

/**
 * Create Users router.
 *
 * @path /api/users
 */
const router = express.Router()

/**
 * Initiate User controller.
 */
const User = new UserController()

router
  .route('/')
  .get(isAdmin, User.getList)
  .post(isAdmin, validator.body(paramValidation.userPostBody), User.create)

// router.route('/:id')
//   .get(isAdmin, getUser)
//   .delete(isAdmin, deleteUser)

export default router
