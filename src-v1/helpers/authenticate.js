"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
var constants_1 = require("../constants");
var config_1 = require("../config");
// check if user admin
function isAdmin(req, res, next) {
    doAuth(req, res, next, constants_1.usersConstants.USER_ACCESS_ADMIN);
}
exports.isAdmin = isAdmin;
// check if user authenticated
function isAuthed(req, res, next) {
    doAuth(req, res, next, constants_1.usersConstants.USER_ACCESS_AUTHED);
}
exports.isAuthed = isAuthed;
// check if user is viewer
function isViewer(req, res, next) {
    doAuth(req, res, next, constants_1.usersConstants.USER_ACCESS_VIEWER);
}
exports.isViewer = isViewer;
function doAuth(req, res, next, al) {
    var bearerHeader = req.headers['authorization'];
    if (typeof bearerHeader !== 'undefined') {
        var bearer = bearerHeader.split(' ');
        var bearerToken = bearer[1];
        jsonwebtoken_1.default.verify(bearerToken, config_1.config.jwtSecret, function (err, decoded) {
            if (err)
                res.json({ ack: 'err', msg: err.message });
            else {
                var id = decoded.id, access_level = decoded.access_level;
                // Admin
                if (access_level === constants_1.usersConstants.USER_ACCESS_ADMIN) {
                    req.app.set('user', { uid: id, access_level: access_level });
                    next();
                }
                // Authed
                else if (access_level === constants_1.usersConstants.USER_ACCESS_AUTHED &&
                    al === constants_1.usersConstants.USER_ACCESS_AUTHED) {
                    req.app.set('user', { uid: id, access_level: access_level });
                    next();
                }
                // Viewer
                else if (access_level === constants_1.usersConstants.USER_ACCESS_VIEWER &&
                    al === constants_1.usersConstants.USER_ACCESS_VIEWER) {
                    req.app.set('user', { uid: id, access_level: access_level });
                    next();
                }
                else {
                    res.json({ ack: 'err', msg: 'Access denied' });
                }
            }
        });
    }
    else {
        res.status(401).json({ ack: 'err', msg: 'Not authorized' });
    }
}
