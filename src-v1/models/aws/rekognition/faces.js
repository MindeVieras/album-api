"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var aws_sdk_1 = __importDefault(require("aws-sdk"));
var config_1 = require("../../../config");
var rekognition = new aws_sdk_1.default.Rekognition();
function detectFaces(key) {
    return new Promise(function (resolve, reject) {
        var params = {
            Image: {
                S3Object: {
                    Bucket: config_1.config.aws.bucket,
                    Name: key
                }
            },
            Attributes: ['ALL']
        };
        rekognition.detectFaces(params, function (err, data) {
            if (err) {
                reject(err.message);
            }
            else {
                resolve(data);
            }
        });
    });
}
exports.detectFaces = detectFaces;
