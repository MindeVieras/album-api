"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var aws_sdk_1 = __importDefault(require("aws-sdk"));
var config_1 = require("../../../config");
var rekognition = new aws_sdk_1.default.Rekognition();
function describeCollection() {
    return new Promise(function (resolve, reject) {
        var params = {
            CollectionId: 'faces_collection'
        };
        rekognition.describeCollection(params, function (err, data) {
            if (err) {
                reject(err.message);
            }
            else {
                resolve(data);
            }
        });
    });
}
exports.describeCollection = describeCollection;
function getFaces(max, next) {
    if (max === void 0) { max = 4096; }
    if (next === void 0) { next = null; }
    return new Promise(function (resolve, reject) {
        var params = {
            CollectionId: config_1.config.aws.facesCollection,
            MaxResults: max,
            NextToken: null
        };
        rekognition.listFaces(params, function (err, data) {
            if (err) {
                reject(err.message);
            }
            else {
                resolve(data.Faces);
            }
        });
    });
}
exports.getFaces = getFaces;
function deleteFace(id) {
    return new Promise(function (resolve, reject) {
        var params = {
            CollectionId: config_1.config.aws.facesCollection,
            FaceIds: [id]
        };
        rekognition.deleteFaces(params, function (err, data) {
            if (err) {
                reject(err.message);
            }
            else {
                resolve(data.DeletedFaces);
            }
        });
    });
}
exports.deleteFace = deleteFace;
