"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var connection = require('../../../config/db');
var path = require('path');
var AWS = require('aws-sdk');
var s3 = new AWS.S3();
var config_1 = require("../../../config");
module.exports.deleteImage = function (id, cb) {
    // Get media S3 key form DB
    connection.query('SELECT s3_key FROM media WHERE id = ?', id, function (err, s3_key) {
        if (err) {
            cb(err.sqlMessage);
        }
        // Check if any
        else if (s3_key[0] != null) {
            var key_1 = s3_key[0].s3_key;
            //Get image media styles form DB
            connection.query('SELECT * FROM media_styles', function (err, styles) {
                if (err) {
                    cb(err.sqlMessage);
                }
                else {
                    // make array of S3 objects
                    var keysArray = [];
                    var orgKeyObj = new Object();
                    orgKeyObj['Key'] = key_1;
                    keysArray.push(orgKeyObj);
                    styles.forEach(function (row) {
                        var keyObj = new Object();
                        keyObj['Key'] = 'thumbs/' + row.name + '/' + path.basename(key_1);
                        keysArray.push(keyObj);
                    });
                    var params = {
                        Bucket: config_1.config.aws.bucket,
                        Delete: {
                            Objects: keysArray,
                            Quiet: false
                        }
                    };
                    //Delete from S3
                    s3.deleteObjects(params, function (err, data) {
                        if (err) {
                            cb(err);
                        }
                        else {
                            cb(null, data);
                        }
                    });
                }
            });
        }
        else {
            cb('Can\'t find media ID:' + id + ' in DB');
        }
    });
};
module.exports.deleteVideo = function (id, cb) {
    // Get media S3 key form DB
    connection.query("SELECT m.s3_key, mm.meta_value AS duration\n                      FROM media AS m\n                        LEFT JOIN media_meta AS mm ON m.id = mm.media_id AND mm.meta_name = 'duration'\n                      WHERE m.id = ?", id, function (err, rows) {
        if (err) {
            cb(err.sqlMessage);
        }
        // Check if any
        else if (rows[0] != null) {
            var key_2 = rows[0].s3_key;
            var duration_1 = parseFloat(rows[0].duration);
            // Get image media styles form DB
            connection.query('SELECT * FROM video_presets', function (err, rows) {
                if (err) {
                    cb(err.sqlMessage);
                }
                else {
                    // make array of S3 objects
                    var keysArray = [];
                    // Original video
                    var orgKeyObj = new Object();
                    orgKeyObj['Key'] = key_2;
                    keysArray.push(orgKeyObj);
                    // Transcoded videos
                    var thumbCount = Math.ceil(duration_1 / 60);
                    rows.forEach(function (row) {
                        var keyObj = new Object();
                        keyObj['Key'] = 'videos/' + row.name + '/' + path.basename(key_2);
                        keysArray.push(keyObj);
                        // video thumbs
                        // @ts-ignore
                        for (i = 0; i < thumbCount; i++) {
                            var ext = path.extname(key_2);
                            // @ts-ignore
                            var thumbKey = makeCount(i + 1) + '.jpg';
                            var formattedKey = path.basename(key_2, ext) + '-' + thumbKey;
                            var thumbObj = new Object();
                            thumbObj['Key'] = 'videos/thumbs/' + row.name + '/' + formattedKey;
                            keysArray.push(thumbObj);
                        }
                    });
                    var params = {
                        Bucket: config_1.config.aws.bucket,
                        Delete: {
                            Objects: keysArray,
                            Quiet: false
                        }
                    };
                    s3.deleteObjects(params, function (err, data) {
                        if (err) {
                            cb(err);
                        }
                        else {
                            cb(null, data);
                        }
                    });
                }
            });
        }
        else {
            cb('Can\'t find media in DB');
        }
    });
};
function makeCount(i) {
    var str = '' + i;
    var pad = '00000';
    return pad.substring(0, pad.length - str.length) + str;
}
