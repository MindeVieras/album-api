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
var lodash_1 = __importDefault(require("lodash"));
var moment_1 = __importDefault(require("moment"));
var aspect_ratio_1 = __importDefault(require("aspect-ratio"));
var db_1 = require("../db");
var conn = new db_1.Database();
// Creates album
function create(req, res) {
    var uid = req.app.get('user').uid;
    var _a = req.body, name = _a.name, start_date = _a.start_date, end_date = _a.end_date, access = _a.access, status = _a.status;
    var data = {
        name: name,
        start_date: start_date,
        end_date: end_date,
        access: access,
        status: status,
        author: uid
    };
    conn.query("INSERT INTO albums SET ?", data)
        .then(function (row) {
        // @ts-ignore
        if (row.affectedRows === 1) {
            // @ts-ignore
            res.json({ ack: 'ok', msg: 'Album created', id: row.insertId });
        }
        else {
            throw 'Could not create album';
        }
    })
        .catch(function (err) {
        var msg = err.sqlMessage ? err.sqlMessage : err;
        res.json({ ack: 'err', msg: msg });
    });
}
exports.create = create;
// Gets albums
function getList(req, res) {
    var _a = req.app.get('user'), uid = _a.uid, access_level = _a.access_level;
    var _b = req.body, start_date = _b.start_date, end_date = _b.end_date;
    var endOfEndDay = moment_1.default(end_date, 'YYYY-MM-DD').endOf('day').format('YYYY-MM-DD HH:mm:ss');
    var status = 1; // Enabled
    var albums;
    var sqlValues = [status, start_date, endOfEndDay, uid];
    var sql = "SELECT * FROM albums\n                WHERE status = ? AND start_date >= ? AND start_date <= ? AND author = ?\n              ORDER BY start_date DESC";
    if (access_level === 100) {
        sqlValues = [status, start_date, endOfEndDay];
        sql = "SELECT * FROM albums\n              WHERE status = ? AND start_date >= ? AND start_date <= ?\n            ORDER BY start_date DESC";
    }
    conn.query(sql, sqlValues)
        .then(function (rows) {
        albums = rows;
        res.json({ ack: 'ok', msg: 'Albums list', list: albums });
    })
        .catch(function (err) {
        var msg = err.sqlMessage ? err.sqlMessage : err;
        res.json({ ack: 'err', msg: msg });
    });
}
exports.getList = getList;
// Gets albums dates
function getListDates(req, res) {
    var _a = req.app.get('user'), uid = _a.uid, access_level = _a.access_level;
    var dates;
    var sqlValues = [uid];
    var sql = "SELECT DISTINCT DATE_FORMAT(start_date, '%Y-%c-%e') AS date\n                FROM albums\n              WHERE author = ?\n              ORDER BY date DESC";
    if (access_level === 100) {
        sqlValues = [];
        sql = "SELECT DISTINCT DATE_FORMAT(start_date, '%Y-%c-%e') AS date\n              FROM albums\n            ORDER BY date DESC";
    }
    conn.query(sql, sqlValues)
        .then(function (rows) {
        // @ts-ignore
        dates = rows.map(function (d) {
            return d.date;
        }).sort(function (a, b) {
            return moment_1.default(a, 'YYYY-M-D').diff(moment_1.default(b, 'YYYY-M-D'));
        });
        res.json({ ack: 'ok', msg: 'Albums list dates', dates: dates });
    })
        .catch(function (err) {
        var msg = err.sqlMessage ? err.sqlMessage : err;
        res.json({ ack: 'err', msg: msg });
    });
}
exports.getListDates = getListDates;
// Gets one album
function getOne(req, res) {
    var _a = req.app.get('user'), uid = _a.uid, access_level = _a.access_level;
    var id = req.params.id;
    var albumEntity = 2; // Album type
    var mediaEntity = 3; // Media type
    var album;
    var totalSize = 0;
    var sqlValues = [albumEntity, id, uid];
    var sql = "SELECT\n                a.*,\n                CONCAT('{\"lat\":', l.lat, ',\"lng\":', l.lng, '}') AS location\n              FROM albums AS a\n                LEFT JOIN locations AS l ON a.id = l.entity_id AND entity = ?\n              WHERE a.id = ? AND a.author = ?\n              LIMIT 1";
    if (access_level === 100) {
        sqlValues = [albumEntity, id];
        sql = "SELECT\n              a.*,\n              CONCAT('{\"lat\":', l.lat, ',\"lng\":', l.lng, '}') AS location\n            FROM albums AS a\n              LEFT JOIN locations AS l ON a.id = l.entity_id AND entity = ?\n            WHERE a.id = ?\n            LIMIT 1";
    }
    conn.query(sql, sqlValues)
        .then(function (rows) {
        // @ts-ignore
        if (rows.length) {
            var albumData = rows[0];
            // Parse location and Format dates
            var albumCopy = __rest(albumData, []);
            album = __assign(__assign({}, albumCopy), { location: JSON.parse(albumData.location), start_date: moment_1.default(albumData.start_date).format('YYYY-MM-DD HH:mm:ss'), end_date: moment_1.default(albumData.end_date).format('YYYY-MM-DD HH:mm:ss') });
            // Get album media
            var status_1 = 1; // Media status ENABLED
            return conn.query("SELECT\n                            m.id AS media_id,\n                            m.s3_key,\n                            m.mime,\n                            m.org_filename AS filename,\n                            m.filesize,\n                            m.width,\n                            m.height,\n                            m.weight,\n                            CONCAT('{\"lat\":', l.lat, ',\"lng\":', l.lng, '}') AS location\n                          FROM media AS m\n                            LEFT JOIN locations AS l ON m.id = l.entity_id AND l.entity = ?\n                          WHERE m.entity_id = ? AND m.status = ? LIMIT 1500", [mediaEntity, id, status_1]);
        }
        else {
            throw 'No album selected';
        }
    })
        .then(function (albumMedia) {
        // Get album media
        // @ts-ignore
        album.media = albumMedia.map(function (m, i) {
            // count total files size
            totalSize += m.filesize;
            m.id = 100000 + i;
            m.phase = 'upload successful';
            m.fromServer = true;
            m.marker_open = false;
            m.location = JSON.parse(m.location);
            if (m.mime.includes('video')) {
                return __assign(__assign({}, m), { videos: {
                        medium: require('../helpers/media').video(m.s3_key, 'medium'),
                        hd: require('../helpers/media').video(m.s3_key, 'hd'),
                        thumbs: {
                            medium: require('../helpers/media').videoThumb(m.s3_key, 'medium')
                        }
                    } });
            }
            else {
                return __assign(__assign({}, m), { thumbs: {
                        icon: require('../helpers/media').img(m.s3_key, 'icon'),
                        mini: require('../helpers/media').img(m.s3_key, 'mini'),
                        thumb: require('../helpers/media').img(m.s3_key, 'medium'),
                        fullhd: require('../helpers/media').img(m.s3_key, 'fullhd')
                    } });
            }
        });
        // Count all media
        // @ts-ignore
        album.total_media = albumMedia.length;
        // Count all media filesize
        album.total_filesize = totalSize;
        // Get media Metadata
        var ids = album.media.map(function (m) { return m.media_id; });
        if (lodash_1.default.isEmpty(ids)) {
            return [];
        }
        else {
            return conn.query("SELECT\n                  m.*\n                FROM media_meta AS m\n                WHERE m.media_id IN (?)", [ids]);
        }
    })
        .then(function (mediaMeta) {
        // @ts-ignore
        album.media = album.media.map(function (m) {
            var mediaCopy = __rest(m, []);
            var metaObj = new Object();
            metaObj['ack'] = 'ok';
            metaObj['width'] = m.width;
            metaObj['height'] = m.height;
            metaObj['aspect'] = aspect_ratio_1.default(m.width, m.height);
            // @ts-ignore
            mediaMeta.filter(function (mt) { return mt.media_id === m.media_id; }).map(function (mt) {
                metaObj[mt.meta_name] = mt.meta_value;
                if (mt.meta_name === 'duration') {
                    var duration = Math.round(mt.meta_value);
                    // metaObj['duration'] = moment.duration(duration, 'seconds').format('h[h], m[min], s[s]')
                    metaObj['duration'] = duration;
                }
            });
            return __assign(__assign({}, mediaCopy), { metadata: metaObj });
        });
        // Get media Rekognition labels
        var ids = album.media.map(function (m) { return m.media_id; });
        if (lodash_1.default.isEmpty(ids)) {
            return [];
        }
        else {
            return conn.query("SELECT\n                            r.*\n                          FROM rekognition_labels AS r\n                            WHERE r.media_id IN (?)\n                          ORDER BY r.confidence DESC", [ids]);
        }
    })
        .then(function (rekognitionLabels) {
        album.media = album.media.map(function (m) {
            var mediaCopy = __rest(m, []);
            var rekognitionObj = new Object();
            // @ts-ignore
            var mm = rekognitionLabels.filter(function (r) { return r.media_id === m.media_id; }).map(function (r) {
                rekognitionObj['ack'] = 'ok';
                rekognitionObj[r.label] = r.confidence;
            });
            if (lodash_1.default.isEmpty(mm)) {
                rekognitionObj['ack'] = 'err';
                rekognitionObj['msg'] = 'No rokognition labels found';
            }
            return __assign(__assign({}, mediaCopy), { rekognition_labels: rekognitionObj });
        });
        // Get media Rekognition text
        var ids = album.media.map(function (m) { return m.media_id; });
        if (lodash_1.default.isEmpty(ids)) {
            return [];
        }
        else {
            return conn.query("SELECT\n                            r.*\n                          FROM rekognition_text AS r\n                            WHERE r.media_id IN (?)\n                          ORDER BY r.text_id DESC", [ids]);
        }
    })
        .then(function (rekognitionText) {
        album.media = album.media.map(function (m) {
            var mediaCopy = __rest(m, []);
            var rekognitionObj = {};
            // @ts-ignore
            var textArray = rekognitionText.filter(function (t) { return t.media_id === m.media_id; }).map(function (t) {
                return t;
            });
            if (lodash_1.default.isEmpty(textArray)) {
                rekognitionObj['ack'] = 'err';
                rekognitionObj['msg'] = 'No text found';
            }
            else {
                rekognitionObj['ack'] = 'ok';
                rekognitionObj['text'] = textArray;
            }
            return __assign(__assign({}, mediaCopy), { rekognition_text: rekognitionObj });
        });
        // Return album
        res.json({ ack: 'ok', msg: 'One album', data: album });
    })
        .catch(function (err) {
        console.log(err);
        var msg = err.sqlMessage ? err.sqlMessage : err;
        res.json({ ack: 'err', msg: msg });
    });
}
exports.getOne = getOne;
// Renames album
function rename(req, res) {
    var _a = req.body, album_id = _a.album_id, name = _a.name;
    conn.query("UPDATE albums SET name = ? WHERE id = ?", [name, album_id])
        .then(function (row) {
        // @ts-ignore
        if (row.affectedRows === 1) {
            // @ts-ignore
            res.json({ ack: 'ok', msg: 'Album renamed', id: row.insertId });
        }
        else {
            throw 'No such Album';
        }
    })
        .catch(function (err) {
        var msg = err.sqlMessage ? err.sqlMessage : err;
        res.json({ ack: 'err', msg: msg });
    });
}
exports.rename = rename;
// Changes album date
function changeDate(req, res) {
    var _a = req.body, album_id = _a.album_id, start_date = _a.start_date, end_date = _a.end_date;
    conn.query("UPDATE albums SET start_date = ?, end_date = ? WHERE id = ?", [start_date, end_date, album_id])
        .then(function (row) {
        // @ts-ignore
        if (row.affectedRows === 1) {
            // @ts-ignore
            res.json({ ack: 'ok', msg: 'Album date changed', id: row.insertId });
        }
        else {
            throw 'No such Album';
        }
    })
        .catch(function (err) {
        var msg = err.sqlMessage ? err.sqlMessage : err;
        res.json({ ack: 'err', msg: msg });
    });
}
exports.changeDate = changeDate;
// Sets album location
function setLocation(req, res) {
    var _a = req.body, album_id = _a.album_id, location = _a.location;
    var data = {
        lat: location.lat,
        lng: location.lng,
        entity: 2,
        entity_id: album_id
    };
    conn.query("INSERT INTO locations SET ?", data)
        .then(function (row) {
        // @ts-ignore
        if (row.affectedRows === 1) {
            // @ts-ignore
            res.json({ ack: 'ok', msg: 'Location set', id: row.insertId });
        }
        else {
            throw 'Location not set';
        }
    })
        .catch(function (err) {
        var msg = err.sqlMessage ? err.sqlMessage : err;
        res.json({ ack: 'err', msg: msg });
    });
}
exports.setLocation = setLocation;
// Updates album location
function updateLocation(req, res) {
    var _a = req.body, album_id = _a.album_id, location = _a.location;
    var data = [
        location.lat,
        location.lng,
        2,
        album_id
    ];
    conn.query("UPDATE locations\n                SET lat = ?, lng = ?\n              WHERE entity = ? AND entity_id = ?", data)
        .then(function (row) {
        // @ts-ignore
        if (row.affectedRows === 1) {
            res.json({ ack: 'ok', msg: 'Location updated' });
        }
        else {
            throw 'Location not updated';
        }
    })
        .catch(function (err) {
        var msg = err.sqlMessage ? err.sqlMessage : err;
        res.json({ ack: 'err', msg: msg });
    });
}
exports.updateLocation = updateLocation;
// Remove album location
function removeLocation(req, res) {
    if (typeof req.params.id != 'undefined' && !isNaN(req.params.id) && req.params.id > 0 && req.params.id.length) {
        var id = req.params.id;
        var entity = 2; // Album type
        var location_1;
        conn.query("DELETE FROM locations WHERE entity = ? AND entity_id = ?", [entity, id])
            .then(function (rows) {
            location_1 = rows;
            // Return media locations
            res.json({ ack: 'ok', msg: 'Location removed', data: location_1 });
        })
            .catch(function (err) {
            console.log(err);
            var msg = err.sqlMessage ? err.sqlMessage : err;
            res.json({ ack: 'err', msg: msg });
        });
    }
    else {
        res.json({ ack: 'err', msg: 'bad parameter' });
    }
}
exports.removeLocation = removeLocation;
// Moves album to trash
function moveToTrash(req, res) {
    if (typeof req.params.id != 'undefined' && !isNaN(req.params.id) && req.params.id > 0 && req.params.id.length) {
        var id = req.params.id;
        var status_2 = 2; // Trashed
        conn.query("UPDATE albums SET status = ? WHERE id = ?", [status_2, id])
            .then(function (rows) {
            // @ts-ignore
            if (rows.affectedRows === 1) {
                res.json({ ack: 'ok', msg: 'Album moved to trash' });
            }
            else {
                throw 'No such album';
            }
        })
            .catch(function (err) {
            console.log(err);
            var msg = err.sqlMessage ? err.sqlMessage : err;
            res.json({ ack: 'err', msg: msg });
        });
    }
    else {
        res.json({ ack: 'err', msg: 'bad parameter' });
    }
}
exports.moveToTrash = moveToTrash;
