'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _winston = require('winston');

var _winston2 = _interopRequireDefault(_winston);

var _winstonMysql = require('winston-mysql');

var _winstonMysql2 = _interopRequireDefault(_winstonMysql);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var winston_mysql_options = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  table: 'logs'
};

var logger = new _winston2.default.Logger({
  transports: [new _winstonMysql2.default(winston_mysql_options)]
});

exports.default = logger;
//# sourceMappingURL=winston.js.map