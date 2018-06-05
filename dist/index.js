'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _express = require('./config/express');

var _express2 = _interopRequireDefault(_express);

var _index = require('./routes/index.route');

var _index2 = _interopRequireDefault(_index);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Home route
_express2.default.get('/', function (req, res) {
  res.sendFile(_path2.default.join(__dirname, './index.html'));
});

// API routes
_express2.default.use('/api', _index2.default);

// Start HTTP server
_express2.default.listen(_express2.default.get('port'), _express2.default.get('host'), function () {
  console.log('Server running at http://' + _express2.default.get('host') + ':' + _express2.default.get('port'));
});

exports.default = _express2.default;
//# sourceMappingURL=index.js.map