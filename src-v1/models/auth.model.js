"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var bcrypt_1 = __importDefault(require("bcrypt"));
var validator_1 = __importDefault(require("validator"));
var jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
var moment_1 = __importDefault(require("moment"));
var config_1 = require("../config");
var db_1 = require("../db");
var conn = new db_1.Database();
// Authenticates user
function authenticate(req, res) {
    var _a = req.body, username = _a.username, password = _a.password;
    var errors;
    // validate username input
    if (!username || validator_1.default.isEmpty(username)) {
        errors = __assign(__assign({}, errors), { username: 'Username is required' });
    }
    // validate password input
    if (!password || validator_1.default.isEmpty(password)) {
        errors = __assign(__assign({}, errors), { password: 'Password is required' });
    }
    // return errors if any
    if (errors) {
        res.json({ ack: 'err', errors: errors });
    }
    else {
        var user_1;
        conn.query("SELECT * FROM users WHERE username = ? LIMIT 1", username)
            .then(function (rows) {
            // @ts-ignore
            if (rows.length) {
                var pass = rows[0].password;
                var passMatch = bcrypt_1.default.compareSync(password, pass);
                if (passMatch) {
                    // remove password from user object
                    var _a = rows[0], password_1 = _a.password, noPasswordUser = __rest(_a, ["password"]);
                    user_1 = noPasswordUser;
                    // Update user login datetime
                    var uid = user_1.id;
                    var login_date = moment_1.default().format('YYYY-MM-DD HH:mm:ss');
                    return conn.query('UPDATE users SET last_login = ? WHERE id = ?', [login_date, uid]);
                }
                else {
                    throw 'Incorrect details';
                }
            }
            else {
                throw 'Incorrect details';
            }
        })
            .then(function (rows) {
            // If last login date updated
            // @ts-ignore
            if (rows.affectedRows === 1) {
                // Return User object
                var token = jsonwebtoken_1.default.sign(user_1, config_1.config.jwtSecret);
                var data = __assign(__assign({}, user_1), { token: token });
                res.json({ ack: 'ok', msg: 'Authentication ok', data: data });
            }
            else {
                throw 'Authentication failed. Please try again later.';
            }
        })
            .catch(function (err) {
            var msg = err.sqlMessage ? 'Authentication failed. Please try again later.' : err;
            res.json({ ack: 'err', errors: { _error: msg } });
        });
    }
}
exports.authenticate = authenticate;
