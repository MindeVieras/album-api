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
Object.defineProperty(exports, "__esModule", { value: true });
var db_1 = require("../db");
var conn = new db_1.Database();
// Gets albums
function getList(req, res) {
    // console.log(req.app.get('user'));
    var _a = req.body, page = _a.page, limit = _a.limit, media_limit = _a.media_limit;
    var l_page = parseInt(page) || 0;
    var l_limit = parseInt(limit) || 5;
    var l_media_limit = parseInt(media_limit) || 5;
    var albums, media;
    conn.query("SELECT\n                a.id, a.name,\n                GROUP_CONCAT(m.id) AS media_ids\n              FROM albums AS a\n                LEFT JOIN media AS m ON a.id = m.entity_id\n              GROUP BY a.id\n              LIMIT ?, ?", [l_page, l_limit])
        .then(function (rows) {
        // @ts-ignore
        albums = rows.map(function (a) {
            var mediaArr = new Array();
            var albumCopy = __rest(a
            // Limit meida
            , []);
            // Limit meida
            if (a.media_ids) {
                mediaArr = albumCopy.media_ids.split(',').slice(0, l_media_limit);
            }
            return __assign(__assign({}, albumCopy), { media_ids: mediaArr });
        });
        // Make media ids
        var mids = new Array();
        albums.map(function (a) {
            a.media_ids.map(function (id) {
                mids.push(id);
            });
        });
        // Get media
        return conn.query("SELECT\n                          m.*,\n                          width.meta_value AS width,\n                          height.meta_value AS height\n                        FROM media AS m\n                          LEFT JOIN media_meta AS width\n                            ON m.id = width.media_id AND width.meta_name = 'width'\n                          LEFT JOIN media_meta AS height\n                            ON m.id = height.media_id AND height.meta_name = 'height'\n                        WHERE m.id IN (?)", [mids]);
    })
        .then(function (mediaRows) {
        // @ts-ignore
        media = mediaRows.map(function (m) {
            var mime, key;
            mime = m.mime.includes('image') ? 'image' : 'video';
            if (mime === 'video') {
                key = require('../helpers/media').video(m.s3_key, 'medium');
            }
            else {
                key = require('../helpers/media').img(m.s3_key, 'thumb');
            }
            return {
                id: m.id,
                entity_id: m.entity_id,
                mime: mime,
                key: key,
                width: parseInt(m.width),
                height: parseInt(m.height)
            };
        });
        // Assign media to album
        albums = albums.map(function (a) {
            var albumCopy = __rest(a, []);
            return __assign(__assign({}, albumCopy), { media: media.filter(function (m) { return albumCopy.id == m.entity_id; }) });
        });
        res.json({ ack: 'ok', msg: 'Albums list', data: albums });
    })
        .catch(function (err) {
        console.log(err);
        var msg = err.sqlMessage ? err.sqlMessage : err;
        res.json({ ack: 'err', msg: msg });
    });
}
exports.getList = getList;
