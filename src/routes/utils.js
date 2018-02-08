
import { getAppSettings, getAdminSettings, saveAdminSetting } from '../models/utils'
const Auth = require('../helpers/authenticate');

module.exports = function(app) {

  app.get('/api/utils/get-app-settings', getAppSettings)
  app.get('/api/utils/get-admin-settings/:id', Auth.isAdmin, getAdminSettings)
  app.post('/api/utils/save-admin-setting', Auth.isAdmin, saveAdminSetting)

}
