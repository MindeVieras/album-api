'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var bucket = exports.bucket = process.env.S3_BUCKET || 'images.album.mindelis.com';
// export const bucket = process.env.S3_BUCKET || 'media.album.mindelis.com'
var aws_region = exports.aws_region = process.env.AWS_REGION || 'eu-west-1';

var bucketFake = exports.bucketFake = 'fake';
var faces_collection = exports.faces_collection = process.env.FACES_COLLECTION || 'album_faces_local';
var transcoder_pipeline = exports.transcoder_pipeline = process.env.TRANSCODER_PIPELINE || '1508692593579-7zkwqr';

var client_secret_key = exports.client_secret_key = process.env.CLIENT_SECRET_KEY || 'tmpciwvK07JglVVpsOkiVv11dGWpmXUK';
var secret_key = exports.secret_key = process.env.SECRET_KEY || 'pQDkZonecIPAHdWHnW1OJmMFmSamnfsM';

// DarkSky wheather API
var darksky_key = exports.darksky_key = process.env.DARKSKY_KEY || 'c930281d59d489723714922f510d8482';
//# sourceMappingURL=config.js.map