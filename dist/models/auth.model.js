'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.authenticate = authenticate;

var _bcrypt = require('bcrypt');

var _bcrypt2 = _interopRequireDefault(_bcrypt);

var _validator = require('validator');

var _validator2 = _interopRequireDefault(_validator);

var _jsonwebtoken = require('jsonwebtoken');

var _jsonwebtoken2 = _interopRequireDefault(_jsonwebtoken);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _config = require('../config/config');

var _db = require('../db');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var conn = new _db.Database();

// Authenticates user
function authenticate(req, res) {
  var _req$body = req.body,
      username = _req$body.username,
      password = _req$body.password;

  // // vlaidate input

  if (_validator2.default.isEmpty(username)) {
    res.json({ ack: 'err', msg: 'Username is required' });
  } else if (_validator2.default.isEmpty(password)) {
    res.json({ ack: 'err', msg: 'Password is required' });
  } else {
    var user = void 0;
    conn.query('SELECT * FROM users WHERE username = ? LIMIT 1', username).then(function (rows) {
      if (rows.length) {
        var pass = rows[0].password;
        var passMatch = _bcrypt2.default.compareSync(password, pass);
        if (passMatch) {
          user = rows[0];
          var uid = rows[0].id;
          var login_date = (0, _moment2.default)().format('YYYY-MM-DD HH:mm:ss');
          return conn.query('UPDATE users SET last_login = ? WHERE id = ?', [login_date, uid]);
        } else {
          throw 'Incorect details';
        }
      } else {
        throw 'Incorrect details';
      }
    }).then(function (rows) {
      // If last login date updated
      if (rows.affectedRows === 1) {
        // Return User object
        var _user = user,
            id = _user.id,
            _username = _user.username,
            access_level = _user.access_level,
            display_name = _user.display_name,
            email = _user.email,
            created = _user.created;

        var jwtData = { id: id, username: _username, access_level: access_level };
        var token = _jsonwebtoken2.default.sign(jwtData, _config.secret_key);
        var accessLevel = 'simple';
        if (access_level >= 50 && access_level < 100) {
          accessLevel = 'editor';
        } else if (access_level === 100) {
          accessLevel = 'admin';
        }
        var userData = { id: id, username: _username, display_name: display_name, email: email, created: created, token: token, access_level: accessLevel };
        res.json({ ack: 'ok', msg: 'Authentication ok', data: userData });
      } else {
        throw 'Connot set last login date';
      }
    }).catch(function (err) {
      var msg = err.sqlMessage ? err.sqlMessage : err;
      res.json({ ack: 'err', msg: msg });
    });
  }
}
//# sourceMappingURL=auth.model.js.map