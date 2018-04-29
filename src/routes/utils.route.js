
import express from 'express'

import { isAuthed, isAdmin } from '../helpers/authenticate'
import * as utilsModel from '../models/utils.model'

const router = express.Router()

router.route('/app-settings')
    .get( (req, res) => {
        utilsModel.getAppSettings(req, res)
    })

router.route('/admin-settings')
    .get(isAdmin, (req, res) => {
        utilsModel.getAdminSettings(req, res)
    })
    .post(isAdmin, (req, res) => {
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
