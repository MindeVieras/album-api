'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _morgan = require('morgan');

var _morgan2 = _interopRequireDefault(_morgan);

var _cors = require('cors');

var _cors2 = _interopRequireDefault(_cors);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var app = (0, _express2.default)();

// Require variables from .env file if available
require('dotenv').config();

// Set server port, host
app.set('port', process.env.APP_PORT || 3000);
app.set('host', process.env.APP_HOST || 'localhost');

// Logger
app.use((0, _morgan2.default)('dev'));

// CORS
app.use((0, _cors2.default)());

// Body parser
app.use(_bodyParser2.default.urlencoded({
  extended: true,
  limit: '50mb'
}));
app.use(_bodyParser2.default.json({
  limit: '50mb'
}));

exports.default = app;
//# sourceMappingURL=express.js.map