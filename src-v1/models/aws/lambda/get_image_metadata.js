"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var aws_sdk_1 = __importDefault(require("aws-sdk"));
var config_1 = require("../../../config");
var lambda = new aws_sdk_1.default.Lambda();
function get(key) {
    return new Promise(function (resolve, reject) {
        // Get S3 file metadata from lambda
        var params = {
            FunctionName: 'aws-album_get_image_metadata',
            Payload: '{"srcKey": "' + key + '", "bucket": "' + config_1.config.aws.bucket + '"}'
        };
        lambda.invoke(params, function (err, data) {
            if (err)
                reject(err.message);
            // @ts-ignore
            var payload = JSON.parse(data.Payload);
            if (payload !== null && typeof payload === 'object')
                resolve(pretifyExifMeta(payload));
            else
                resolve(null);
        });
    });
}
exports.get = get;
function pretifyExifMeta(payload) {
    var meta = {};
    // make exif object
    if (payload.exif) {
        Object.keys(payload.exif).forEach(function (key) {
            // @ts-ignore
            if (key == 'DateTimeOriginal')
                meta.datetime = convertExifDate(payload.exif[key]);
            // @ts-ignore
            if (key == 'Flash')
                meta.flash = payload.exif[key];
            // @ts-ignore
            if (key == 'ISO')
                meta.iso = payload.exif[key];
        });
    }
    // make image object
    if (payload.image) {
        Object.keys(payload.image).forEach(function (key) {
            var value = payload.image[key];
            // Cleanup make and model string from zeros /u00000
            // @ts-ignore
            if (key == 'Make')
                meta.make = value.replace(/\0/g, '');
            // @ts-ignore
            if (key == 'Model')
                meta.model = value.replace(/\0/g, '');
            // @ts-ignore
            if (key == 'Orientation')
                meta.orientation = value;
        });
    }
    // make location object
    if (payload.gps
        && payload.gps.GPSLatitude
        && payload.gps.GPSLatitudeRef
        && payload.gps.GPSLongitude
        && payload.gps.GPSLongitudeRef) {
        var _a = payload.gps, GPSLatitude = _a.GPSLatitude, GPSLatitudeRef = _a.GPSLatitudeRef, GPSLongitude = _a.GPSLongitude, GPSLongitudeRef = _a.GPSLongitudeRef;
        // @ts-ignore
        meta.location = dmsToDecimal(GPSLatitude, GPSLatitudeRef, GPSLongitude, GPSLongitudeRef);
    }
    return meta;
}
function dmsToDecimal(lat, latRef, lon, lonRef) {
    var ref = { 'N': 1, 'E': 1, 'S': -1, 'W': -1 };
    var sep = [' ,', ' ', ','];
    var i;
    if (typeof lat === 'string') {
        for (i = 0; i < sep.length; i++) {
            if (lat.split(sep[i]).length === 3) {
                lat = lat.split(sep[i]);
                break;
            }
        }
    }
    if (typeof lon === 'string') {
        for (i = 0; i < sep.length; i++) {
            if (lon.split(sep[i]).length === 3) {
                lon = lon.split(sep[i]);
                break;
            }
        }
    }
    for (i = 0; i < lat.length; i++) {
        if (typeof lat[i] === 'string') {
            lat[i] = lat[i].split('/');
            lat[i] = parseInt(lat[i][0], 10) / parseInt(lat[i][1], 10);
        }
    }
    for (i = 0; i < lon.length; i++) {
        if (typeof lon[i] === 'string') {
            lon[i] = lon[i].split('/');
            lon[i] = parseInt(lon[i][0], 10) / parseInt(lon[i][1], 10);
        }
    }
    lat = (lat[0] + (lat[1] / 60) + (lat[2] / 3600)) * ref[latRef];
    lon = (lon[0] + (lon[1] / 60) + (lon[2] / 3600)) * ref[lonRef];
    return { lat: lat, lon: lon };
}
// converts exif date to normal date
function convertExifDate(date) {
    if (date) {
        var newDateTime = void 0;
        var dateTime = date.split(' ');
        var regex = new RegExp(':', 'g');
        dateTime[0] = dateTime[0].replace(regex, '-');
        if (typeof date === 'undefined' || !date) {
            newDateTime = '';
        }
        else {
            newDateTime = dateTime[0] + ' ' + dateTime[1];
        }
        return newDateTime;
    }
    else {
        return date;
    }
}
