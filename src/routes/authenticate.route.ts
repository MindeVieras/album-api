
import express from 'express'
// import validate from 'express-validation'

// import paramValidation from '../config/param-validation'
import authenticate from '../controllers/authenticate.controller'

/**
 * Set express router.
 */
const router = express.Router()

/**
 * POST /api/authenticate - Returns token if correct username and password is provided
 */
// router.route('/')
  // .post(validate(paramValidation.authenticate), authenticate)
router.post('/', authenticate)

export default router
