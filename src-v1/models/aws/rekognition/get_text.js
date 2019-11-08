"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var aws_sdk_1 = __importDefault(require("aws-sdk"));
var config_1 = require("../../../config");
var rekognition = new aws_sdk_1.default.Rekognition();
function get(key, mime) {
    return new Promise(function (resolve, reject) {
        if (mime.includes('image')) {
            var params = {
                Image: {
                    S3Object: {
                        Bucket: config_1.config.aws.bucket,
                        Name: key
                    }
                }
            };
            rekognition.detectText(params, function (err, data) {
                if (err) {
                    reject(err.message);
                }
                else {
                    resolve(data.TextDetections);
                }
            });
        }
        else if (mime.includes('video')) {
            resolve('getting video labels');
            // cb(null, 'ffsfa');
            // var startParams = {
            //   Video: {
            //     S3Object: {
            //       Bucket: config.aws.bucket,
            //       Name: key
            //     }
            //   },
            //   MinConfidence: 1
            // };
            // rekognition.startLabelDetection(startParams, function(err, job) {
            //   if (err) {
            //     cb(err);
            //   }
            //   else {
            //     const jobId = job.JobId;
            //     var getParams = {
            //       JobId: jobId,
            //       MaxResults: 1000
            //     };
            //     rekognition.getLabelDetection(getParams, function(err, data) {
            //       if (err) {
            //         cb(err);
            //       }
            //       else {
            //         console.log(data);
            //         cb(null, 'ffsfa');
            //       }
            //     });
            //   }
            // });
        }
        else {
            reject('Invalid mime type');
        }
    });
}
exports.get = get;
;
