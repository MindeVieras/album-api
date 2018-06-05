'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _uploader = require('../models/uploader.model');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// import { isAuthed } from '../helpers/authenticate'

var router = _express2.default.Router();

router.post('/sign', _uploader.getSignature);
router.post('/success', _uploader.onSuccess);

exports.default = router;
//# sourceMappingURL=uploader.route.js.map