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
Object.defineProperty(exports, "__esModule", { value: true });
var db_1 = require("../db");
var conn = new db_1.Database();
var connection = require('../config/db');
var deleteFromS3 = require('./aws/s3/delete');
// Gets trash items
function getList(req, res) {
    var mediaStatus = 2; //Trashed file
    var albumStatus = 2; //Trashed albums
    var trashMedia, trashAlbums, list;
    conn.query("SELECT\n                m.*,\n                mw.meta_value AS width,\n                mh.meta_value AS height,\n                a.name AS album_name\n              FROM media AS m\n                LEFT JOIN media_meta AS mw ON m.id = mw.media_id AND mw.meta_name = 'width'\n                LEFT JOIN media_meta AS mh ON m.id = mh.media_id AND mh.meta_name = 'height'\n                LEFT JOIN albums AS a ON m.entity_id = a.id\n              WHERE m.status = ?", mediaStatus)
        .then(function (media) {
        // @ts-ignore
        trashMedia = media.map(function (m) {
            if (m.mime.includes('video')) {
                return __assign(__assign({}, m), { videos: {
                        video: require('../helpers/media').video(m.s3_key, 'medium'),
                        thumb: require('../helpers/media').videoThumb(m.s3_key, 'medium')
                    } });
            }
            else if (m.mime.includes('image')) {
                return __assign(__assign({}, m), { thumbs: {
                        icon: require('../helpers/media').img(m.s3_key, 'icon'),
                        mini: require('../helpers/media').img(m.s3_key, 'mini')
                    } });
            }
            else {
                return __assign({}, m);
            }
        });
        return conn.query("SELECT * FROM albums WHERE status = ?", albumStatus);
    })
        .then(function (albums) {
        trashAlbums = albums;
        list = {
            media: trashMedia,
            albums: trashAlbums
        };
        res.json({ ack: 'ok', msg: 'Trash list', list: list });
    })
        .catch(function (err) {
        console.log(err.sqlMessage);
        var msg = err.sqlMessage ? err.sqlMessage : err;
        res.json({ ack: 'err', msg: msg });
    });
}
exports.getList = getList;
// Restores trash item
function restore(req, res) {
    if (typeof req.params.id != 'undefined' && !isNaN(req.params.id) && req.params.id > 0 && req.params.id.length) {
        var id = req.params.id;
        var status_1 = 1; //Enabled file
        connection.query('UPDATE media SET status = ? WHERE id = ?', [status_1, id], function (err, rows) {
            if (err) {
                res.json({ ack: 'err', msg: err.sqlMessage });
            }
            else {
                if (rows.affectedRows === 1) {
                    res.json({ ack: 'ok', msg: 'Media file restored', data: req.params.id });
                }
                else {
                    res.json({ ack: 'err', msg: 'No such media file' });
                }
            }
        });
    }
    else {
        res.json({ ack: 'err', msg: 'bad parameter' });
    }
}
exports.restore = restore;
// Deletes media item (permenent)
function _delete(req, res) {
    if (typeof req.params.id != 'undefined' && !isNaN(req.params.id) && req.params.id > 0 && req.params.id.length) {
        var id_1 = req.params.id;
        connection.query('SELECT mime FROM media WHERE id = ?', [id_1], function (err, mime) {
            if (err) {
                res.json({ ack: 'err', msg: err.sqlMessage });
            }
            else {
                var mimeType = mime[0].mime;
                // If IMAGE
                if (mimeType.includes('image')) {
                    // Firstly delete image and thumbnails from S3
                    deleteFromS3.deleteImage(id_1, function (err, data) {
                        if (err) {
                            res.json({ ack: 'err', msg: err });
                        }
                        else {
                            // Delete media
                            connection.query('DELETE FROM media WHERE id = ?', id_1);
                            // Delete meta
                            connection.query('DELETE FROM media_meta WHERE media_id = ?', id_1);
                            // Delete rekognition
                            connection.query('DELETE FROM rekognition_labels WHERE media_id = ?', id_1);
                            res.json({ ack: 'ok', msg: 'Image deleted for good' });
                        }
                    });
                }
                // If VIDEO
                else if (mimeType.includes('video')) {
                    // Firstly delete image and thumbnails from S3
                    deleteFromS3.deleteVideo(id_1, function (err, data) {
                        if (err) {
                            res.json({ ack: 'err', msg: err });
                        }
                        else {
                            // Delete media
                            connection.query('DELETE FROM media WHERE id = ?', id_1);
                            // Delete meta
                            connection.query('DELETE FROM media_meta WHERE media_id = ?', id_1);
                            res.json({ ack: 'ok', msg: 'Video deleted for good', data: data });
                        }
                    });
                }
                else {
                    res.json({ ack: 'err', msg: 'Unknown MIME Type' });
                }
            }
        });
    }
    else {
        res.json({ ack: 'err', msg: 'bad parameter' });
    }
}
exports._delete = _delete;
