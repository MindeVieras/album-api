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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var bcrypt_1 = __importDefault(require("bcrypt"));
var validator_1 = __importDefault(require("validator"));
var moment_1 = __importDefault(require("moment"));
var db_1 = require("../db");
var constants_1 = require("../constants");
var helpers_1 = require("../helpers");
var conn = new db_1.Database();
/**
 * @api {get} /users Get list
 * @apiName GetUsers
 * @apiGroup Users
 *
 * @apiPermission admin
 *
 * @apiSuccess {String}   status             Response status
 * @apiSuccess {Object}   data               Response data
 * @apiSuccess {Object[]} data.users           List of users (Array of Objects)
 * @apiSuccess {Number}   data.users.id          User id
 * @apiSuccess {String}   data.users.username    User username
 * @apiSuccess {String}   data.users.email       User email address
 * @apiSuccess {String}   data.users.displayName User display name
 * @apiSuccess {String}   data.users.initials    User initials made from username and display name
 * @apiSuccess {Number}   data.users.accessLevel User access level
 * @apiSuccess {Number}   data.users.status      User status, enabled or disabled
 * @apiSuccess {Number}   data.users.author      User author id
 * @apiSuccess {Date}     data.users.created     User creation datetime
 * @apiSuccess {Date}     data.users.lastLogin   User last login datetime or null
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": "success",
 *       "data": {
 *          users: [
 *            {
 *              "id": 1,
 *              "username": "demouser",
 *              "email": "demo@example.com",
 *              "displayName": "Demo User",
 *              "initials": "DU",
 *              "accessLevel": 100,
 *              "status": 1,
 *              "author": 1,
 *              "created": "2017-12-31T01:16:54.000Z",
 *              "lastLogin": "2018-11-04T11:43:21.000Z"
 *            },
 *            ...
 *          ]
 *        }
 *     }
 *
 */
function getList(req, res) {
    // @ts-ignore
    conn.query("SELECT id, username, email, display_name, access_level, last_login, status, created, author FROM users")
        .then(function (rows) {
        var data = {
            users: rows.map(function (u) {
                // make initials
                var initials = helpers_1.makeInitials(u.username, u.display_name);
                return {
                    id: u.id,
                    username: u.username,
                    email: u.email,
                    displayName: u.display_name,
                    initials: initials,
                    accessLevel: u.access_level,
                    status: u.status,
                    author: u.author,
                    created: u.created,
                    lastLogin: u.last_login
                };
            })
        };
        helpers_1.jsonResponse.success(res, data);
    })
        .catch(function (err) {
        helpers_1.jsonResponse.error(res, err);
    });
}
exports.getList = getList;
// Gets one user
function getUser(req, res) {
    var username = req.params.username;
    conn.query("SELECT * FROM users WHERE username = ?", username)
        .then(function (rows) {
        // @ts-ignore
        if (rows.length) {
            var initials = require('../helpers/utils').makeInitials(rows[0].username, rows[0].display_name);
            var user = {
                id: rows[0].id,
                initials: initials,
                username: rows[0].username,
                display_name: rows[0].display_name,
                email: rows[0].email
            };
            res.json({ ack: 'ok', msg: 'One user', data: user });
        }
        else {
            throw 'No such User';
        }
    })
        .catch(function (err) {
        var msg = err.sqlMessage ? err.sqlMessage : err;
        res.json({ ack: 'err', msg: msg });
    });
}
exports.getUser = getUser;
// Creates user
function createUser(req, res) {
    var uid = req.app.get('user').uid;
    var _a = req.body, username = _a.username, password = _a.password, email = _a.email, display_name = _a.display_name, access_level = _a.access_level, status = _a.status;
    var errors;
    // validate username input
    if (!username || validator_1.default.isEmpty(username))
        errors = __assign(__assign({}, errors), { username: "Username is required" });
    else if (!validator_1.default.isAlphanumeric(username))
        errors = __assign(__assign({}, errors), { username: "Username must be alphanumeric only" });
    else if (validator_1.default.isLength(username, { min: 0, max: 4 }))
        errors = __assign(__assign({}, errors), { username: "Username must be at least 5 chars long" });
    // vlaidate password input
    if (!password || validator_1.default.isEmpty(password))
        errors = __assign(__assign({}, errors), { password: "Password is required" });
    else if (validator_1.default.isLength(password, { min: 0, max: 4 }))
        errors = __assign(__assign({}, errors), { password: "Password must be at least 5 chars long" });
    // vlaidate email
    if (email && !validator_1.default.isEmail(email))
        errors = __assign(__assign({}, errors), { email: "Email must be valid" });
    // vlaidate access_level
    if (!access_level || validator_1.default.isEmpty(access_level))
        errors = __assign(__assign({}, errors), { access_level: "Access level is required" });
    else if (!validator_1.default.isInt(access_level, { min: 0, max: 100 }))
        errors = __assign(__assign({}, errors), { access_level: "Access level is invalid" });
    // return errors if any
    if (errors) {
        res.json({ ack: "err", errors: errors });
    }
    else {
        var userData_1;
        // check if user exists
        conn.query("SELECT * FROM users WHERE username = ? LIMIT 1", username)
            .then(function (rows) {
            // @ts-ignore
            if (rows.length)
                throw "Username already exists";
            else
                // hash password
                return bcrypt_1.default.hash(password, 10);
        })
            .then(function (hash) {
            // Save user to database
            userData_1 = {
                username: username,
                email: email,
                password: hash,
                display_name: display_name,
                access_level: parseInt(access_level),
                author: uid,
                status: status ? constants_1.usersConstants.USER_ACTIVE : constants_1.usersConstants.USER_PASSIVE
            };
            return conn.query("INSERT INTO users set ? ", userData_1);
        })
            // Insret initial user settings
            .then(function (userRow) {
            // @ts-ignore
            if (userRow.affectedRows === 1) {
                // @ts-ignore
                var newUid = userRow.insertId;
                userData_1.id = newUid;
                // make front settings array
                var frontSettings = [
                    [newUid, 'c_menu_x', 90, 'front'],
                    [newUid, 'c_menu_y', 90, 'front']
                ];
                // make admin settings array
                var filter_start_date = moment_1.default().subtract(100, 'year').format('YYYY-MM-DD');
                var filter_end_date = moment_1.default().add(100, 'year').format('YYYY-MM-DD');
                var adminSettings = [
                    [newUid, 'selected_album', 0, 'admin'],
                    [newUid, 'sidebar_width', constants_1.usersConstants.USER_DEFAULT_SIDEBAR_WIDTH, 'admin'],
                    [newUid, 'list_filter_start_date', filter_start_date, 'admin'],
                    [newUid, 'list_filter_end_date', filter_end_date, 'admin']
                ];
                var settings = frontSettings;
                if (userData_1.access_level >= constants_1.usersConstants.USER_ACCESS_AUTHED) {
                    settings = __spreadArrays(frontSettings, adminSettings);
                }
                // insert settings to DB
                var sql = "INSERT INTO users_settings (user_id, name, value, type) VALUES ?";
                return conn.query(sql, [settings]);
            }
            else {
                throw "Could not save user settings";
            }
        })
            .then(function (rows) {
            // Remove password from user object
            var password = userData_1.password, userCopy = __rest(userData_1
            // make initials
            , ["password"]);
            // make initials
            var username = userCopy.username, display_name = userCopy.display_name;
            var initials = helpers_1.makeInitials(username, display_name);
            var user = __assign({ initials: initials }, userCopy);
            res.json({ ack: "ok", msg: "User saved", user: user });
        })
            .catch(function (err) {
            var msg = err.sqlMessage ? "Cannot create user, check system logs" : err;
            res.json({ ack: "err", errors: { _error: msg } });
        });
    }
}
exports.createUser = createUser;
// Deletes user
function deleteUser(req, res) {
    var uid = req.app.get('user').uid;
    var id = req.params.id;
    // Prevent deleting yourself
    if (uid != id) {
        conn.query("DELETE FROM users WHERE id = ?", id)
            .then(function (rows) {
            // @ts-ignore
            if (rows.affectedRows === 1)
                // Also delete user settings
                return conn.query("DELETE FROM users_settings WHERE user_id = ?", id);
            else
                throw "No such user";
        })
            .then(function (_) {
            // Return success
            res.json({ ack: "ok", msg: "User deleted", id: id });
        })
            .catch(function (err) {
            var msg = err.sqlMessage ? 'Cannot delete user, check system logs' : err;
            res.json({ ack: "err", msg: msg });
        });
    }
    else {
        res.json({ ack: "err", msg: "You cannot delete yoursef" });
    }
}
exports.deleteUser = deleteUser;
