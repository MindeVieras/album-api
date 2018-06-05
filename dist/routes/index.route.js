'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _auth = require('./auth.route');

var _auth2 = _interopRequireDefault(_auth);

var _albums = require('./albums.route');

var _albums2 = _interopRequireDefault(_albums);

var _uploader = require('./uploader.route');

var _uploader2 = _interopRequireDefault(_uploader);

var _media = require('./media.route');

var _media2 = _interopRequireDefault(_media);

var _trash = require('./trash.route');

var _trash2 = _interopRequireDefault(_trash);

var _front = require('./front.route');

var _front2 = _interopRequireDefault(_front);

var _utils = require('./utils.route');

var _utils2 = _interopRequireDefault(_utils);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = _express2.default.Router();

router.use('/auth', _auth2.default);
router.use('/albums', _albums2.default);
router.use('/uploader', _uploader2.default);
router.use('/media', _media2.default);
router.use('/trash', _trash2.default);
router.use('/front', _front2.default);
router.use('/utils', _utils2.default);

exports.default = router;
//# sourceMappingURL=index.route.js.map