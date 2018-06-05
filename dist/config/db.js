'use strict';

var _mysql = require('mysql');

var _mysql2 = _interopRequireDefault(_mysql);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var host = process.env.DB_HOST;
var user = process.env.DB_USER;
var pass = process.env.DB_PASS;
var name = process.env.DB_NAME;

var connection = _mysql2.default.createConnection({
  host: host,
  user: user,
  password: pass,
  database: name,
  acquireTimeout: 1000000
});

connection.connect(function (err) {
  if (err) throw err;
});

module.exports = connection;
//# sourceMappingURL=db.js.map