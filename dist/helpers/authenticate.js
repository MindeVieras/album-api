'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isAuthed = isAuthed;
exports.isAdmin = isAdmin;

var _jsonwebtoken = require('jsonwebtoken');

var _jsonwebtoken2 = _interopRequireDefault(_jsonwebtoken);

var _config = require('../config/config');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// check if user authenticated
function isAuthed(req, res, next) {
  doAuth(req, res, next, 50);
}
// // check if user admin
function isAdmin(req, res, next) {
  doAuth(req, res, next, 100);
}

function doAuth(req, res, next, al) {
  var bearerHeader = req.headers['authorization'];
  if (typeof bearerHeader !== 'undefined') {
    var bearer = bearerHeader.split(' ');
    var bearerToken = bearer[1];
    _jsonwebtoken2.default.verify(bearerToken, _config.secret_key, function (err, decoded) {
      if (err) {
        res.json({ ack: 'err', msg: err.message });
      } else {
        var id = decoded.id,
            access_level = decoded.access_level;

        if (access_level === 100) {
          req.app.set('user', { uid: id, access_level: access_level });
          next();
        } else if (access_level <= 50 && al === 50) {
          req.app.set('user', { uid: id, access_level: access_level });
          next();
        } else {
          res.json({ ack: 'err', msg: 'Access denied' });
        }
      }
    });
  } else {
    res.json({ ack: 'err', msg: 'Not authorized' });
  }
}
//# sourceMappingURL=authenticate.js.map