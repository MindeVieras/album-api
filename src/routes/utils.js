
import {
  getAppSettings,
  getAdminSettings,
  saveAdminSetting,
  getFrontSettings,
  saveFrontSetting
} from '../models/utils'
const Auth = require('../helpers/authenticate');

module.exports = function(app) {

  app.get('/api/utils/get-app-settings', getAppSettings)

  app.get('/api/utils/get-admin-settings', Auth.isAdmin, getAdminSettings)
  app.post('/api/utils/save-admin-setting', Auth.isAdmin, saveAdminSetting)

  app.get('/api/utils/get-front-settings/:id', Auth.isAuthed, getFrontSettings)
  app.post('/api/utils/save-front-setting', Auth.isAdmin, saveFrontSetting)

}
