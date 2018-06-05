'use strict';

var connection = require('../../../config/db');
var path = require('path');
var AWS = require('aws-sdk');
AWS.config.loadFromPath('./aws-keys.json');
var elastictranscoder = new AWS.ElasticTranscoder();
var config = require('../../../config/config');

module.exports.generate = function (key, cb) {
    // Firtly get video presets
    connection.query('SELECT * FROM video_presets', function (err, rows) {

        if (err) cb(err);

        rows.forEach(function (row) {
            var ext = path.extname(key);
            var thumbPath = 'videos/thumbs/' + row.name + '/' + path.basename(key, ext) + '-';
            var params = {
                PipelineId: config.transcoder_pipeline,
                Input: {
                    AspectRatio: 'auto',
                    Container: 'auto',
                    FrameRate: 'auto',
                    Interlaced: 'auto',
                    Key: key,
                    Resolution: 'auto'
                },
                Output: {
                    Key: 'videos/' + row.name + '/' + path.basename(key),
                    PresetId: row.preset_id,
                    Rotate: 'auto',
                    ThumbnailPattern: thumbPath + '{count}'
                }
            };

            elastictranscoder.createJob(params, function (err, data) {
                if (err) cb(err);else console.log(data);
            });
        });

        cb(null, 'jobs created');
    });
};
//# sourceMappingURL=generate_videos.js.map