
import express from 'express'

import { isAuthed, isAdmin } from '../helpers/authenticate'
import * as utilsModel from '../controllers/utils.controller'

const router = express.Router()

router.route('/ip-location/:ip')
  .get(isAuthed, (req, res) => {
    utilsModel.ipLocation(req, res)
  })

router.route('/app-settings')
  .get((req, res) => {
    utilsModel.getAppSettings(req, res)
  })

router.route('/admin-settings')
  .get(isAuthed, (req, res) => {
    utilsModel.getAdminSettings(req, res)
  })
  .post(isAuthed, (req, res) => {
    utilsModel.saveAdminSetting(req, res);
  })

router.route('/front-settings')
  .get(isAuthed, (req, res) => {
    utilsModel.getFrontSettings(req, res)
  })
  .post(isAuthed, (req, res) => {
    utilsModel.saveFrontSetting(req, res);
  })


export default router
