'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getList = getList;
exports.restore = restore;
exports._delete = _delete;

var _db = require('../db');

var conn = new _db.Database();

var connection = require('../config/db');
var deleteFromS3 = require('./aws/s3/delete');

// Gets trash items
function getList(req, res) {

  var mediaStatus = 2; //Trashed file
  var albumStatus = 2; //Trashed albums

  var status = 1; // Enabled
  var trashMedia = void 0,
      trashAlbums = void 0,
      list = void 0;
  conn.query('SELECT * FROM media\n                WHERE status = ?', mediaStatus).then(function (media) {
    trashMedia = media;
    return conn.query('SELECT * FROM albums WHERE status = ?', albumStatus);
  }).then(function (albums) {
    trashAlbums = albums;
    list = {
      media: trashMedia,
      albums: trashAlbums
    };
    res.json({ ack: 'ok', msg: 'Trash list', list: list });
  }).catch(function (err) {
    var msg = err.sqlMessage ? err.sqlMessage : err;
    res.json({ ack: 'err', msg: msg });
  });
}

// Restores trash item
function restore(req, res) {
  if (typeof req.params.id != 'undefined' && !isNaN(req.params.id) && req.params.id > 0 && req.params.id.length) {
    var id = req.params.id;
    var status = 1; //Enabled file
    connection.query('UPDATE media SET status = ? WHERE id = ?', [status, id], function (err, rows) {
      if (err) {
        res.json({ ack: 'err', msg: err.sqlMessage });
      } else {
        if (rows.affectedRows === 1) {
          res.json({ ack: 'ok', msg: 'Media file restored', data: req.params.id });
        } else {
          res.json({ ack: 'err', msg: 'No such media file' });
        }
      }
    });
  } else {
    res.json({ ack: 'err', msg: 'bad parameter' });
  }
}

// Deletes media item (permenent)
function _delete(req, res) {
  if (typeof req.params.id != 'undefined' && !isNaN(req.params.id) && req.params.id > 0 && req.params.id.length) {
    var id = req.params.id;
    connection.query('SELECT mime FROM media WHERE id = ?', [id], function (err, mime) {
      if (err) {
        res.json({ ack: 'err', msg: err.sqlMessage });
      } else {
        var mimeType = mime[0].mime;
        // If IMAGE
        if (mimeType.includes('image')) {
          // Firstly delete image and thumbnails from S3
          deleteFromS3.deleteImage(id, function (err, data) {
            if (err) {
              res.json({ ack: 'err', msg: err });
            } else {
              // Delete media
              connection.query('DELETE FROM media WHERE id = ?', id);
              // Delete meta
              connection.query('DELETE FROM media_meta WHERE media_id = ?', id);
              // Delete rekognition
              connection.query('DELETE FROM rekognition WHERE media_id = ?', id);
              res.json({ ack: 'ok', msg: 'Image deleted for good' });
            }
          });
        }
        // If VIDEO
        else if (mimeType.includes('video')) {
            // Firstly delete image and thumbnails from S3
            deleteFromS3.deleteVideo(id, function (err, data) {
              if (err) {
                res.json({ ack: 'err', msg: err });
              } else {
                // Delete media
                connection.query('DELETE FROM media WHERE id = ?', id);
                // Delete meta
                connection.query('DELETE FROM media_meta WHERE media_id = ?', id);
                res.json({ ack: 'ok', msg: 'Video deleted for good', data: data });
              }
            });
          } else {
            res.json({ ack: 'err', msg: 'Unknown MIME Type' });
          }
      }
    });
  } else {
    res.json({ ack: 'err', msg: 'bad parameter' });
  }
}
//# sourceMappingURL=trash.model.js.map