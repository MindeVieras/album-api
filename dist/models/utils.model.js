'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getAppSettings = getAppSettings;
exports.getAdminSettings = getAdminSettings;
exports.saveAdminSetting = saveAdminSetting;
exports.getFrontSettings = getFrontSettings;
exports.saveFrontSetting = saveFrontSetting;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _db = require('../db');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var conn = new _db.Database();

// Gets App settings
function getAppSettings(req, res) {
  var settings = new Object();
  conn.query('SELECT * FROM settings WHERE type = \'app\'').then(function (rows) {
    // let settingsObj = new Object()
    rows.map(function (s) {
      settings[s.name] = s.value;
    });

    // Return settings
    res.json({ ack: 'ok', msg: 'App settings', data: settings });
  }).catch(function (err) {
    var msg = err.sqlMessage ? err.sqlMessage : err;
    res.json({ ack: 'err', msg: msg });
  });
}

// Gets Admin settings
function getAdminSettings(req, res) {
  var _req$app$get = req.app.get('user'),
      uid = _req$app$get.uid;

  var settings = new Object();
  conn.query('SELECT * FROM users_settings WHERE user_id = ? AND type = \'admin\'', uid).then(function (rows) {
    // let settingsObj = new Object()
    rows.map(function (s) {
      settings[s.name] = s.value;
    });

    // Return settings
    res.json({ ack: 'ok', msg: 'Admin settings', data: settings });
  }).catch(function (err) {
    var msg = err.sqlMessage ? err.sqlMessage : err;
    res.json({ ack: 'err', msg: msg });
  });
}

// Saves admin setting
function saveAdminSetting(req, res) {
  var _req$body = req.body,
      name = _req$body.name,
      value = _req$body.value;

  var _req$app$get2 = req.app.get('user'),
      uid = _req$app$get2.uid;

  var data = [value, uid, name];

  conn.query('UPDATE users_settings\n                SET value = ?\n              WHERE user_id = ? AND name = ? AND type = \'admin\'', data).then(function (row) {
    if (row.affectedRows === 1) {
      res.json({ ack: 'ok', msg: 'Setting saved' });
    } else {
      throw 'Setting not saved';
    }
  }).catch(function (err) {
    var msg = err.sqlMessage ? err.sqlMessage : err;
    res.json({ ack: 'err', msg: msg });
  });
}

// Gets Front settings
function getFrontSettings(req, res) {
  var _req$app$get3 = req.app.get('user'),
      uid = _req$app$get3.uid;

  var settings = new Object();
  conn.query('SELECT * FROM users_settings WHERE user_id = ? AND type = \'front\'', uid).then(function (rows) {
    // let settingsObj = new Object()
    rows.map(function (s) {
      settings[s.name] = s.value;
    });

    // Return settings
    res.json({ ack: 'ok', msg: 'Front settings', data: settings });
  }).catch(function (err) {
    var msg = err.sqlMessage ? err.sqlMessage : err;
    res.json({ ack: 'err', msg: msg });
  });
}

// Saves front setting
function saveFrontSetting(req, res) {
  var _req$body2 = req.body,
      name = _req$body2.name,
      value = _req$body2.value;

  var _req$app$get4 = req.app.get('user'),
      uid = _req$app$get4.uid;

  var data = [value, uid, name];

  conn.query('UPDATE users_settings\n                SET value = ?\n              WHERE user_id = ? AND name = ? AND type = \'front\'', data).then(function (row) {
    if (row.affectedRows === 1) {
      res.json({ ack: 'ok', msg: 'Setting saved' });
    } else {
      throw 'Setting not saved';
    }
  }).catch(function (err) {
    var msg = err.sqlMessage ? err.sqlMessage : err;
    res.json({ ack: 'err', msg: msg });
  });
}
//# sourceMappingURL=utils.model.js.map