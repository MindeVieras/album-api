"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var aws_sdk_1 = __importDefault(require("aws-sdk"));
var aspect_ratio_1 = __importDefault(require("aspect-ratio"));
var config_1 = require("../../../config");
var lambda = new aws_sdk_1.default.Lambda();
var s3 = new aws_sdk_1.default.S3();
function get(key) {
    return new Promise(function (resolve, reject) {
        // Get presigned url
        var url = s3.getSignedUrl('getObject', {
            Bucket: config_1.config.aws.bucket,
            Key: key,
            Expires: 60
        });
        // Get S3 file metadata from lambda
        var params = {
            FunctionName: 'aws-album_get_video_metadata',
            Payload: '{"url": "' + url + '"}'
        };
        lambda.invoke(params, function (err, data) {
            if (err) {
                return reject(err.message);
            }
            // @ts-ignore
            var payload = JSON.parse(data.Payload);
            if (payload !== null && typeof payload === 'object') {
                var meta_1 = {};
                // make meta object
                payload.streams.forEach(function (row) {
                    if (row.codec_type == 'video') {
                        // @ts-ignore
                        meta_1.width = row.width;
                        // @ts-ignore
                        meta_1.height = row.height;
                        // @ts-ignore
                        meta_1.duration = parseFloat(row.duration);
                        // @ts-ignore
                        meta_1.frame_rate = eval(row.r_frame_rate);
                        // @ts-ignore
                        meta_1.codec = row.codec_name;
                        if (row.width && row.height) {
                            // @ts-ignore
                            meta_1.aspect = aspect_ratio_1.default(row.width, row.height);
                        }
                        // @ts-ignore
                        if (row.tags && 'creation_time' in row.tags)
                            meta_1.datetime = row.tags.creation_time;
                    }
                });
                resolve(meta_1);
            }
            else {
                return reject('No Meta found');
            }
        });
    });
}
exports.get = get;
