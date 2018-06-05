'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _authenticate = require('../helpers/authenticate');

var _front = require('../models/front.model');

var frontModel = _interopRequireWildcard(_front);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = _express2.default.Router();

router.route('/albums').post(_authenticate.isAuthed, function (req, res) {
    frontModel.getList(req, res);
});

exports.default = router;
//# sourceMappingURL=front.route.js.map