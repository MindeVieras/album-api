'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _authenticate = require('../helpers/authenticate');

var _trash = require('../models/trash.model');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = _express2.default.Router();

router.get('/get-list', _authenticate.isAdmin, _trash.getList);
router.post('/restore/:id', _authenticate.isAdmin, _trash.restore);
router.delete('/delete/:id', _authenticate.isAdmin, _trash._delete);

exports.default = router;
//# sourceMappingURL=trash.route.js.map