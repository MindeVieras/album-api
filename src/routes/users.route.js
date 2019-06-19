
import express from 'express'
import validate from 'express-validation'

import paramValidation from '../config/param-validation'

import { isAdmin } from '../helpers/authenticate'
import { createUser } from '../controllers/users.controller'

const router = express.Router()

/**
 * POST /api/users - Creates new user
 */
router.route('/')
  .post(validate(paramValidation.createUser), isAdmin, createUser)

// router.get('/', isAdmin, getList)
// router.get('/:username', isAdmin, getUser)
// router.post('/', isAdmin, createUser)
// router.delete('/:id', isAdmin, deleteUser)

export default router
