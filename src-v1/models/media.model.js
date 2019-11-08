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
var aspect_ratio_1 = __importDefault(require("aspect-ratio"));
var connection = require('../config/db');
var constants_1 = require("../constants");
var db_1 = require("../db");
var conn = new db_1.Database();
var generate_videos_1 = require("./aws/transcoder/generate_videos");
var getImageMetadata = require('./aws/lambda/get_image_metadata');
var getVideoMeta = require('./aws/lambda/get_video_metadata');
var generateImageThumbs = require('./aws/lambda/generate_thumbs');
var getRekognitionLabels = require('./aws/rekognition/get_labels');
var getRekognitionText = require('./aws/rekognition/get_text');
// Sets media location
function setLocation(req, res) {
    var _a = req.body, media_id = _a.media_id, location = _a.location;
    var data = {
        lat: location.lat,
        lng: location.lng,
        entity: 3,
        entity_id: media_id
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
// Updates media location
function updateLocation(req, res) {
    var _a = req.body, media_id = _a.media_id, location = _a.location;
    var data = [
        location.lat,
        location.lng,
        3,
        media_id
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
// Removes media location
function removeLocation(req, res) {
    if (typeof req.params.id != 'undefined' && !isNaN(req.params.id) && req.params.id > 0 && req.params.id.length) {
        var id = req.params.id;
        var entity = 3; // Media type
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
function putToTrash(req, res) {
    var media_id = req.body.media_id;
    var status = constants_1.mediaConstants.MEDIA_TRASHED; // Media status TRASHED
    //Put media file to trash
    conn.query("UPDATE media SET status = ? WHERE id = ?", [status, media_id])
        .then(function (row) {
        // @ts-ignore
        if (row.affectedRows === 1) {
            res.json({ ack: 'ok', msg: 'File moved to trash' });
        }
        else {
            throw 'Cannot trash media';
        }
    })
        .catch(function (err) {
        var msg = err.sqlMessage ? err.sqlMessage : err;
        res.json({ ack: 'err', msg: msg });
    });
}
exports.putToTrash = putToTrash;
// Moves media file to another album
function moveMedia(req, res) {
    var _a = req.body, media_id = _a.media_id, album_id = _a.album_id;
    var data = [
        album_id,
        media_id,
        constants_1.commonConstants.ENTITY_ALBUM // Album entity type
    ];
    conn.query("UPDATE media\n                SET entity_id = ?\n              WHERE id = ? AND entity = ?", data)
        .then(function (row) {
        // @ts-ignore
        if (row.affectedRows === 1) {
            res.json({ ack: 'ok', msg: 'Media moved' });
        }
        else {
            throw 'Cannot move media';
        }
    })
        .catch(function (err) {
        var msg = err.sqlMessage ? err.sqlMessage : err;
        res.json({ ack: 'err', msg: msg });
    });
}
exports.moveMedia = moveMedia;
// Get media metadata from lambda and save to DB
function saveMetadata(req, res) {
    var media_id = req.body.media_id;
    var entity = 3; // media entity
    var initialMeta, imageMeta;
    conn.query("SELECT s3_key, mime, height, width FROM media WHERE id = ?", media_id)
        .then(function (rows) {
        // @ts-ignore
        if (rows.length) {
            var _a = rows[0], s3_key = _a.s3_key, mime_1 = _a.mime, height = _a.height, width = _a.width;
            initialMeta = {
                aspect: aspect_ratio_1.default(width, height),
                height: height,
                width: width
            };
            if (mime_1.includes('image'))
                return getImageMetadata.get(s3_key);
            else if (mime_1.includes('video'))
                return getVideoMeta.get(s3_key);
            else
                throw 'Invalid mime type';
        }
        else {
            throw 'No such media';
        }
    })
        .then(function (metadata) {
        if (metadata) {
            imageMeta = metadata;
            return conn.query("DELETE FROM media_meta WHERE media_id = ?", media_id);
        }
        return;
    })
        .then(function () {
        if (imageMeta) {
            // remove location, it gets saved in locations table
            var location_2 = imageMeta.location, restMeta = __rest(imageMeta, ["location"]);
            var newMeta_1 = __assign({}, restMeta);
            // make meta array
            var values = [];
            Object.keys(newMeta_1).forEach(function (key) {
                var val = newMeta_1[key];
                values.push([media_id, key, val]);
            });
            // insert metadata to DB
            var sql = "INSERT INTO media_meta (media_id, meta_name, meta_value) VALUES ?";
            return conn.query(sql, [values]);
        }
        return;
    })
        .then(function () {
        // If location found delete old
        if (imageMeta && imageMeta.location) {
            var sql = "DELETE FROM locations WHERE entity = ? AND entity_id = ?";
            return conn.query(sql, [entity, media_id]);
        }
        return;
    })
        .then(function (locDeletedRows) {
        // Once old location deleted, insert new one
        if (locDeletedRows) {
            var values = [imageMeta.location.lat, imageMeta.location.lon, entity, media_id];
            // insert location to DB
            var sql = "INSERT INTO locations (lat, lng, entity, entity_id) VALUES (?, ?, ?, ?)";
            return conn.query(sql, values);
        }
        return;
    })
        .then(function () {
        // Make metadata object for final return
        var metadata = initialMeta;
        if (imageMeta) {
            metadata = __assign(__assign({}, initialMeta), imageMeta);
        }
        res.json({ ack: 'ok', msg: 'Metadata saved', metadata: metadata });
    })
        .catch(function (err) {
        var msg = err.sqlMessage ? err.sqlMessage : err;
        res.json({ ack: 'err', msg: msg });
    });
}
exports.saveMetadata = saveMetadata;
// Get and Save Image Labels from AWS rekognition
function saveRekognitionLabels(req, res) {
    var media_id = req.body.media_id;
    var labels;
    conn.query("SELECT s3_key, mime FROM media WHERE id = ?", media_id)
        .then(function (rows) {
        // @ts-ignore
        if (rows.length) {
            var _a = rows[0], s3_key = _a.s3_key, mime_2 = _a.mime;
            return getRekognitionLabels.get(s3_key, mime_2);
        }
        else {
            throw 'No such media';
        }
    })
        .then(function (recognitionLabels) {
        // if recognition labels found
        if (recognitionLabels.length > 0) {
            // set labels
            labels = recognitionLabels;
            // Delete old meta before save
            return conn.query("DELETE FROM rekognition_labels WHERE media_id = ?", media_id);
        }
        else
            throw "No rekognition labels found";
    })
        .then(function () {
        // make values array for db
        var values = labels.map(function (label) {
            return [media_id, label.Name, label.Confidence];
        });
        // Insert labels to DB
        return conn.query("INSERT INTO rekognition_labels (media_id, label, confidence) VALUES ?", [values]);
    })
        .then(function () {
        // Make object for return
        var rekognition_labels = {};
        labels.map(function (label) {
            rekognition_labels['ack'] = 'ok';
            rekognition_labels[label.Name] = label.Confidence;
        });
        res.json({ ack: 'ok', msg: 'Rekognition Labels saved', rekognition_labels: rekognition_labels });
    })
        .catch(function (err) {
        var msg = err.sqlMessage ? err.sqlMessage : err;
        res.json({ ack: 'err', msg: msg });
    });
}
exports.saveRekognitionLabels = saveRekognitionLabels;
// Get and Save Image Text from AWS rekognition
function saveRekognitionText(req, res) {
    var media_id = req.body.media_id;
    var text, values;
    conn.query("SELECT s3_key, mime FROM media WHERE id = ?", media_id)
        .then(function (rows) {
        // @ts-ignore
        if (rows.length) {
            var _a = rows[0], s3_key = _a.s3_key, mime_3 = _a.mime;
            return getRekognitionText.get(s3_key, mime_3);
        }
        else {
            throw 'No such media';
        }
    })
        .then(function (recognitionText) {
        // if recognition labels found
        if (recognitionText.length > 0) {
            // set labels
            text = recognitionText;
            // Delete old text before save
            return conn.query("DELETE FROM rekognition_text WHERE media_id = ?", media_id);
        }
        else
            throw "No text found";
    })
        .then(function () {
        // make values array for db
        values = text.map(function (t) {
            var _a = t.Geometry, BoundingBox = _a.BoundingBox, Polygon = _a.Polygon;
            return [
                media_id, t.Id, t.ParentId, t.Type, t.DetectedText, t.Confidence,
                BoundingBox.Width, BoundingBox.Height, BoundingBox.Top, BoundingBox.Left,
                Polygon[0].X, Polygon[0].Y, Polygon[1].X, Polygon[1].Y,
                Polygon[2].X, Polygon[2].Y, Polygon[3].X, Polygon[3].Y
            ];
        });
        // Insert text to DB
        var sql = "INSERT INTO rekognition_text\n                    (\n                      media_id, text_id, text_parent_id, type, text, confidence,\n                      bbox_width, bbox_height, bbox_top, bbox_left,\n                      p1_x, p1_y, p2_x, p2_y, p3_x, p3_y, p4_x, p4_y\n                    )\n                  VALUES ?";
        return conn.query(sql, [values]);
    })
        .then(function () {
        // Query new text for response
        var sql = "SELECT * FROM rekognition_text WHERE media_id = ?";
        return conn.query(sql, media_id);
    })
        .then(function (newText) {
        var rekognitionObj = {};
        rekognitionObj['ack'] = 'ok';
        rekognitionObj['text'] = newText;
        res.json({ ack: 'ok', msg: 'Rekognition Text saved', rekognition_text: rekognitionObj });
    })
        .catch(function (err) {
        var msg = err.sqlMessage ? err.sqlMessage : err;
        res.json({ ack: 'err', msg: msg });
    });
}
exports.saveRekognitionText = saveRekognitionText;
// Generate Image Thumbnails
exports.generateImageThumbs = function (req, res) {
    var mediaId = req.body.media_id;
    if (!mediaId) {
        res.json({ ack: 'err', msg: 'Wrong params' });
    }
    else {
        connection.query('SELECT s3_key FROM media WHERE id = ?', mediaId, function (err, s3_key) {
            if (err) {
                res.json({ ack: 'err', msg: err.sqlMessage });
            }
            else {
                var key = s3_key[0].s3_key;
                // Generate Thumbnails
                generateImageThumbs.generate(key, function (err, response) {
                    if (err) {
                        res.json({ ack: 'err', msg: err });
                    }
                    else {
                        res.json({ ack: 'ok', msg: 'Image thumbnails generated', thumbs: response });
                    }
                });
            }
        });
    }
};
// Gets image Metadata/Exif
function getImageMeta(req, res) {
    var key = req.body.key;
    if (key) {
        getImageMetadata.get(key, function (err, metadata) {
            if (err) {
                res.json({ ack: 'err', msg: err });
            }
            // save metadata to DB if any
            if (metadata !== null && typeof metadata === 'object') {
                res.json({ ack: 'ok', msg: 'Image metadata', metadata: metadata });
            }
            else {
                res.json({ ack: 'err', msg: 'No metadata saved' });
            }
        });
    }
    else {
        res.json({ ack: 'err', msg: 'No key' });
    }
}
exports.getImageMeta = getImageMeta;
// Generate Videos
function generateVideos(req, res) {
    var media_id = req.body.media_id;
    conn.query("SELECT s3_key, mime, width, height FROM media WHERE id = ?", media_id)
        .then(function (rows) {
        // @ts-ignore
        if (rows.length) {
            var _a = rows[0], s3_key = _a.s3_key, mime_4 = _a.mime, width = _a.width, height = _a.height;
            if (mime_4.includes('video'))
                return generate_videos_1.generate(s3_key, width, height);
            else
                throw 'Invalid mime type';
        }
        else {
            throw 'No such Album';
        }
    })
        .then(function (tsResponse) {
        res.json({ ack: 'ok', msg: 'Videos generated', videos: tsResponse });
    })
        .catch(function (err) {
        var msg = err.sqlMessage ? err.sqlMessage : err;
        res.json({ ack: 'err', msg: msg });
    });
}
exports.generateVideos = generateVideos;
