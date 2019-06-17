
import express from 'express'

import { isAuthed } from '../helpers/authenticate'
import * as frontModel from '../controllers/front.controller'

const router = express.Router()

router.route('/albums')
  .post(isAuthed, (req, res) => {
    frontModel.getList(req, res)
  })

export default router
