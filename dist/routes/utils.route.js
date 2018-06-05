'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _authenticate = require('../helpers/authenticate');

var _utils = require('../models/utils.model');

var utilsModel = _interopRequireWildcard(_utils);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = _express2.default.Router();

router.route('/app-settings').get(function (req, res) {
    utilsModel.getAppSettings(req, res);
});

router.route('/admin-settings').get(_authenticate.isAdmin, function (req, res) {
    utilsModel.getAdminSettings(req, res);
}).post(_authenticate.isAdmin, function (req, res) {
    utilsModel.saveAdminSetting(req, res);
});

router.route('/front-settings').get(_authenticate.isAuthed, function (req, res) {
    utilsModel.getFrontSettings(req, res);
}).post(_authenticate.isAuthed, function (req, res) {
    utilsModel.saveFrontSetting(req, res);
});

exports.default = router;
//# sourceMappingURL=utils.route.js.map