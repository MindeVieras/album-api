"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var superagent_1 = __importDefault(require("superagent"));
var config_1 = require("../config");
var db_1 = require("../db");
var helpers_1 = require("../helpers");
var conn = new db_1.Database();
/**
 * @api {get} /utils/ip-location/:ip Get Ip Location
 * @apiName GetIpLocation
 * @apiGroup Utils
 *
 * @apiPermission authed
 *
 * @apiParam {String} ip IP address
 *
 * @apiSuccess {String} status   Response status
 * @apiSuccess {Object} data     Response data
 * @apiSuccess {Number} data.lat  Latitude
 * @apiSuccess {Number} data.lng  Longitude
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": "success",
 *       "data": {
 *          lat: 1.23456,
 *          lng: -1.23456
 *        }
 *     }
 *
 */
function ipLocation(req, res) {
    var ip = req.params.ip;
    var data = {
        lat: 0,
        lng: 0
    };
    superagent_1.default
        .get("https://ipapi.co/" + ip + "/json/")
        .then(function (ipRes) {
        console.log(ipRes);
        var _a = JSON.parse(ipRes.text), latitude = _a.latitude, longitude = _a.longitude;
        if (latitude && longitude) {
            data = {
                lat: latitude,
                lng: longitude
            };
        }
        helpers_1.jsonResponse.success(res, data);
    })
        .catch(function (err) {
        helpers_1.jsonResponse.success(res, data);
    });
}
exports.ipLocation = ipLocation;
// Gets App settings
function getAppSettings(req, res) {
    var settings = new Object();
    // @ts-ignore
    conn.query("SELECT * FROM settings WHERE type = 'app'")
        .then(function (rows) {
        // let settingsObj = new Object()
        rows.map(function (s) {
            settings[s.name] = s.value;
        });
        // Add AWS access key
        // @ts-ignore
        settings.access_key_id = config_1.config.aws.accessKey;
        // Add AWS bucket
        // @ts-ignore
        settings.bucket = config_1.config.aws.bucket;
        // Return settings
        res.json({ ack: 'ok', msg: 'App settings', data: settings });
    })
        .catch(function (err) {
        var msg = err.sqlMessage ? err.sqlMessage : err;
        res.json({ ack: 'err', msg: msg });
    });
}
exports.getAppSettings = getAppSettings;
// Gets Admin settings
function getAdminSettings(req, res) {
    var uid = req.app.get('user').uid;
    var settings = new Object();
    conn.query("SELECT * FROM users_settings WHERE user_id = ? AND type = 'admin'", uid)
        .then(function (rows) {
        // let settingsObj = new Object()
        // @ts-ignore
        rows.map(function (s) {
            settings[s.name] = s.value;
        });
        // Return settings
        res.json({ ack: 'ok', msg: 'Admin settings', data: settings });
    })
        .catch(function (err) {
        var msg = err.sqlMessage ? err.sqlMessage : err;
        res.json({ ack: 'err', msg: msg });
    });
}
exports.getAdminSettings = getAdminSettings;
// Saves admin setting
function saveAdminSetting(req, res) {
    var _a = req.body, name = _a.name, value = _a.value;
    var uid = req.app.get('user').uid;
    var data = [value, uid, name];
    conn.query("UPDATE users_settings\n                SET value = ?\n              WHERE user_id = ? AND name = ? AND type = 'admin'", data)
        .then(function (row) {
        // @ts-ignore
        if (row.affectedRows === 1) {
            res.json({ ack: 'ok', msg: 'Setting saved' });
        }
        else {
            throw 'Setting not saved';
        }
    })
        .catch(function (err) {
        var msg = err.sqlMessage ? err.sqlMessage : err;
        res.json({ ack: 'err', msg: msg });
    });
}
exports.saveAdminSetting = saveAdminSetting;
// Gets Front settings
function getFrontSettings(req, res) {
    var uid = req.app.get('user').uid;
    var settings = new Object();
    conn.query("SELECT * FROM users_settings WHERE user_id = ? AND type = 'front'", uid)
        .then(function (rows) {
        // let settingsObj = new Object()
        // @ts-ignore
        rows.map(function (s) {
            settings[s.name] = s.value;
        });
        // Return settings
        res.json({ ack: 'ok', msg: 'Front settings', data: settings });
    })
        .catch(function (err) {
        var msg = err.sqlMessage ? err.sqlMessage : err;
        res.json({ ack: 'err', msg: msg });
    });
}
exports.getFrontSettings = getFrontSettings;
// Saves front setting
function saveFrontSetting(req, res) {
    var _a = req.body, name = _a.name, value = _a.value;
    var uid = req.app.get('user').uid;
    var data = [value, uid, name];
    conn.query("UPDATE users_settings\n                SET value = ?\n              WHERE user_id = ? AND name = ? AND type = 'front'", data)
        .then(function (row) {
        // @ts-ignore
        if (row.affectedRows === 1) {
            res.json({ ack: 'ok', msg: 'Setting saved' });
        }
        else {
            throw 'Setting not saved';
        }
    })
        .catch(function (err) {
        var msg = err.sqlMessage ? err.sqlMessage : err;
        res.json({ ack: 'err', msg: msg });
    });
}
exports.saveFrontSetting = saveFrontSetting;
