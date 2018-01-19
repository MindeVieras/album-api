
const AWS = require('aws-sdk');
AWS.config.loadFromPath('./aws-keys.json');
const lambda = new AWS.Lambda();
const config = require('../../../config/config');

module.exports.get = function(key, cb){

    // Get S3 file metadata from lambda
    let params = {
        FunctionName: 'aws-album_get_image_metadata',
        Payload: '{"srcKey": "'+key+'", "bucket": "'+config.bucket+'"}'
    };

    lambda.invoke(params, function(err, data) {
        
        if (err) console.log(err);
        
        var payload = JSON.parse(data.Payload);

        var meta = payload;

        if (payload) {
            // console.log(payload);
            var meta = {};

            // make exif object
            Object.keys(payload.exif).forEach(function (key) {
                if (key == 'DateTimeOriginal') meta.datetime = convertExifDate(payload.exif[key])
                if (key == 'ExifImageWidth') meta.width = payload.exif[key]
                if (key == 'ExifImageHeight') meta.height = payload.exif[key]
                if (key == 'Flash') meta.flash = payload.exif[key]
                if (key == 'ISO') meta.iso = payload.exif[key]
            });

            // make image object
            Object.keys(payload.image).forEach(function (key) {
                if (key == 'Make') meta.make = payload.image[key]
                if (key == 'Model') meta.model = payload.image[key]
                if (key == 'Orientation') meta.orientation = payload.image[key]
            });
        }
        
        cb(null, meta);
  

    });

};

// converts exif date to normal date
function convertExifDate(date){
    if(date){
        var dateTime = date.split(' ');
        var regex = new RegExp(':', 'g');
        dateTime[0] = dateTime[0].replace(regex, '-');
        if(typeof date === 'undefined' || !date){
            var newDateTime = '';
        } else {
            var newDateTime = dateTime[0] + ' ' + dateTime[1];
        }
        return newDateTime;
    } else {
        return date;
    }
};