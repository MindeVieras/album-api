// dependencies
var async = require('async');
var AWS = require('aws-sdk');
var gm = require('gm').subClass({ imageMagick: true });
var path = require('path');

// get reference to S3 client
var s3 = new AWS.S3();

exports.handle = function(event, context, callback) {
    // Read options from the event.
    var srcBucket = event['bucket'];
    var srcKey = decodeURIComponent(event['srcKey'].replace(/\+/g, " "));
    var dstBucket = event['bucket'];
    var styles = event['styles'];

    // Infer the image type.
    var typeMatch = srcKey.match(/\.([^.]*)$/);
    if (!typeMatch) {
        callback("Could not determine the image type.");
        return;
    }
    var imageType = typeMatch[1];
    if (imageType != "jpg" && imageType != "png") {
        callback('Unsupported image type: ${imageType}');
        return;
    }

    // Download the image from S3, transform, and upload to a different S3 bucket.
    async.waterfall([
        function download(next) {
            // Download the image from S3 into a buffer.
            s3.getObject({
                Bucket: srcBucket,
                Key: srcKey
            },
            next);
        },
        function transform(response, next) {
            gm(response.Body).size(function(err, size) {
                var self = this;

                var createVersion = function(versions, ind, buffers) {
                    if (ind === versions.length) {
                        next(null, response.ContentType, buffers);
                        return;
                    }

                    if (versions[ind].crop) {

                        self.quality(versions[ind].quality).resize(versions[ind].width, versions[ind].height, '^').gravity('Center').crop(versions[ind].width, versions[ind].height).toBuffer(imageType, function(err, buffer) {
                            if (err) next(err);
                            else {
                                buffers.push(buffer);
                                createVersion(versions, ind + 1, buffers);
                            }
                        });
                    } else {
                        // Infer the scaling factor to avoid stretching the image unnaturally.
                        var scalingFactor = Math.min(versions[ind].width / size.width, versions[ind].height / size.height);
                        var width   = scalingFactor * size.width;
                        var height = scalingFactor * size.height;
                        self.quality(versions[ind].quality).resize(width, height).toBuffer(imageType, function(err, buffer) {
                            if (err) next(err);
                            else {
                                buffers.push(buffer);
                                createVersion(versions, ind + 1, buffers);
                            }
                        });
                    }
                }

                // Transform the image buffer in memory.
                var buffers = [];
                createVersion(styles, 0, buffers);
            });
        },
        function upload(contentType, buffers, next) {
            // Stream the transformed image to a different S3 bucket.
            var putFile = function(versions, ind) {
                if (ind === versions.length - 1) cb = next;
                else cb = function() { putFile(versions, ind + 1); };

                s3.putObject({
                    Bucket: dstBucket,
                    Key: "thumbs/" + versions[ind].name + "/" + path.basename(srcKey),
                    Body: buffers[ind],
                    ServerSideEncryption: "AES256",
                    ContentType: contentType
                }, cb);
            };

            putFile(styles, 0);
        }
    ], function (err) {
        if (err) {
            console.error(
                'Unable to resize ' + srcBucket + '/' + srcKey +
                ' and upload to ' + dstBucket + '/' + srcKey +
                ' due to an error: ' + err
            );
        } else {
            console.log(
                'Successfully resized ' + srcBucket + '/' + srcKey +
                ' and uploaded to ' + dstBucket + '/' + srcKey
            );
        }

        callback(null, styles);
    }
);
};