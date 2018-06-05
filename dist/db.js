'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Database = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _mysql = require('mysql');

var _mysql2 = _interopRequireDefault(_mysql);

var _winston = require('./config/winston');

var _winston2 = _interopRequireDefault(_winston);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var host = process.env.DB_HOST;
var user = process.env.DB_USER;
var pass = process.env.DB_PASS;
var name = process.env.DB_NAME;

var dbConfig = {
  host: host,
  user: user,
  password: pass,
  database: name,
  acquireTimeout: 1000000
};

var Database = exports.Database = function () {
  function Database() {
    _classCallCheck(this, Database);

    this.connection = _mysql2.default.createConnection(dbConfig);
  }

  _createClass(Database, [{
    key: 'query',
    value: function query(sql, args) {
      var _this = this;

      return new Promise(function (resolve, reject) {
        _this.connection.query(sql, args, function (err, rows) {
          if (err) {
            // Log db errors
            if (err.sqlMessage) {
              _winston2.default.error('database', {
                message: err.sqlMessage
              });
            }
            return reject(err);
          }
          resolve(rows);
        });
      });
    }
  }, {
    key: 'close',
    value: function close() {
      var _this2 = this;

      return new Promise(function (resolve, reject) {
        _this2.connection.end(function (err) {
          if (err) return reject(err);
          resolve();
        });
      });
    }
  }]);

  return Database;
}();
//# sourceMappingURL=db.js.map