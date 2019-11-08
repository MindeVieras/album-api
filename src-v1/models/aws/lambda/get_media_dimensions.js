"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var aws_sdk_1 = __importDefault(require("aws-sdk"));
var config_1 = require("../../../config");
var winston_1 = __importDefault(require("../../../config/winston"));
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
                winston_1.default.error('lambda', {
                    message: err.message
                });
                reject('Lambda error');
            }
            else {
                // @ts-ignore
                var payload = JSON.parse(data.Payload);
                if (payload !== null && typeof payload === 'object') {
                    var meta_1 = {};
                    // make dimensions object
                    payload.streams.forEach(function (row) {
                        if (row.width && row.height) {
                            // @ts-ignore
                            meta_1.width = row.width;
                            // @ts-ignore
                            meta_1.height = row.height;
                        }
                    });
                    resolve(meta_1);
                }
                else {
                    reject('Cannot get dimensions');
                }
            }
        });
    });
}
exports.get = get;
