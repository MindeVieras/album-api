"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var path_1 = __importDefault(require("path"));
var aws_sdk_1 = __importDefault(require("aws-sdk"));
var config_1 = require("../config");
var s3 = new aws_sdk_1.default.S3();
var EXPIRE = 600; // 10mins
// Image url helper
function img(key, size) {
    var thumbKey = 'thumbs/' + size + '/' + path_1.default.basename(key);
    var params = {
        Bucket: config_1.config.aws.bucket,
        Key: thumbKey,
        Expires: EXPIRE
    };
    return s3.getSignedUrl('getObject', params);
}
exports.img = img;
// Video url helper
function video(key, size) {
    var videoKey = 'videos/' + size + '/' + path_1.default.basename(key);
    var params = {
        Bucket: config_1.config.aws.bucket,
        Key: videoKey,
        Expires: EXPIRE
    };
    return s3.getSignedUrl('getObject', params);
}
exports.video = video;
// Video thumbnail url helper
function videoThumb(key, size) {
    var videoThumbKey = 'videos/thumbs/' + size + '/' + path_1.default.parse(key).name + '-00001.jpg';
    var params = {
        Bucket: config_1.config.aws.bucket,
        Key: videoThumbKey,
        Expires: EXPIRE
    };
    return s3.getSignedUrl('getObject', params);
}
exports.videoThumb = videoThumb;
