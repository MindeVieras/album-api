'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.setLocation = setLocation;
exports.updateLocation = updateLocation;
exports.removeLocation = removeLocation;
exports.moveMedia = moveMedia;
exports.getImageMeta = getImageMeta;

var _db = require('../db');

var uuidv4 = require('uuid/v4');
var connection = require('../config/db');


var conn = new _db.Database();

var generateImageThumbs = require('./aws/lambda/generate_thumbs');
var generateVideos = require('./aws/transcoder/generate_videos');
var getImageMetadata = require('./aws/lambda/get_image_metadata');
var getVideoMeta = require('./aws/lambda/get_video_metadata');
var getRekognitionLabels = require('./aws/rekognition/get_labels');

// Sets media location
function setLocation(req, res) {
  var _req$body = req.body,
      media_id = _req$body.media_id,
      location = _req$body.location;


  var data = {
    lat: location.lat,
    lng: location.lng,
    entity: 3, // Media entity type
    entity_id: media_id
  };

  conn.query('INSERT INTO locations SET ?', data).then(function (row) {
    if (row.affectedRows === 1) {
      res.json({ ack: 'ok', msg: 'Location set', id: row.insertId });
    } else {
      throw 'Location not set';
    }
  }).catch(function (err) {
    var msg = err.sqlMessage ? err.sqlMessage : err;
    res.json({ ack: 'err', msg: msg });
  });
}

// Updates media location
function updateLocation(req, res) {
  var _req$body2 = req.body,
      media_id = _req$body2.media_id,
      location = _req$body2.location;


  var data = [location.lat, location.lng, 3, // Media entity type
  media_id];

  conn.query('UPDATE locations\n                SET lat = ?, lng = ?\n              WHERE entity = ? AND entity_id = ?', data).then(function (row) {
    if (row.affectedRows === 1) {
      res.json({ ack: 'ok', msg: 'Location updated' });
    } else {
      throw 'Location not updated';
    }
  }).catch(function (err) {
    var msg = err.sqlMessage ? err.sqlMessage : err;
    res.json({ ack: 'err', msg: msg });
  });
}

// Removes media location
function removeLocation(req, res) {
  if (typeof req.params.id != 'undefined' && !isNaN(req.params.id) && req.params.id > 0 && req.params.id.length) {
    var id = req.params.id;

    var entity = 3; // Media type
    var location = void 0;
    conn.query('DELETE FROM locations WHERE entity = ? AND entity_id = ?', [entity, id]).then(function (rows) {
      location = rows;
      // Return media locations
      res.json({ ack: 'ok', msg: 'Location removed', data: location });
    }).catch(function (err) {
      console.log(err);
      var msg = err.sqlMessage ? err.sqlMessage : err;
      res.json({ ack: 'err', msg: msg });
    });
  } else {
    res.json({ ack: 'err', msg: 'bad parameter' });
  }
}

exports.getAll = function (req, res) {
  // Get all media
  connection.query('SELECT * FROM media', function (err, rows) {
    if (err) {
      res.json({ ack: 'err', msg: err.sqlMessage });
    } else {
      var media = [];
      rows.forEach(function (m) {
        media.push({
          uuid: uuidv4(),
          name: m.org_filename
        });
      });
      res.json(media);
    }
  });
};

exports.putToTrash = function (req, res) {
  var media_id = req.body.media_id;

  var status = 2; // Media status TRASHED
  //Put media file to trash
  connection.query('UPDATE media SET status = ? WHERE id = ?', [status, media_id], function (err, rows) {
    if (err) {
      res.json({ ack: 'err', msg: err.sqlMessage, error: err.sqlMessage });
    } else {
      res.json({ ack: 'ok', msg: 'File moved to trash', success: true });
    }
  });
};

// Moves media file to another album
function moveMedia(req, res) {
  var _req$body3 = req.body,
      media_id = _req$body3.media_id,
      album_id = _req$body3.album_id;


  var data = [album_id, media_id, 2];

  conn.query('UPDATE media\n                SET entity_id = ?\n              WHERE id = ? AND entity = ?', data).then(function (row) {
    if (row.affectedRows === 1) {
      res.json({ ack: 'ok', msg: 'Media moved' });
    } else {
      throw 'Cannot move media';
    }
  }).catch(function (err) {
    var msg = err.sqlMessage ? err.sqlMessage : err;
    res.json({ ack: 'err', msg: msg });
  });
}

// Get media metadata from lambda and save to DB
exports.saveMetadata = function (req, res) {
  var mediaId = req.body.media_id;
  if (!mediaId) {
    res.json({ ack: 'err', msg: 'Wrong params' });
  } else {
    connection.query('SELECT s3_key, mime FROM media WHERE id = ?', mediaId, function (err, media) {
      if (err) {
        res.json({ ack: 'err', msg: err.sqlMessage });
      } else {
        var key = media[0].s3_key;
        var mime = media[0].mime;
        if (mime.includes('image')) {
          getImageMetadata.get(key, function (err, metadata) {
            // save metadata to DB if any
            if (metadata !== null && (typeof metadata === 'undefined' ? 'undefined' : _typeof(metadata)) === 'object') {
              // Delete old meta before save
              connection.query('DELETE FROM media_meta WHERE media_id = ?', mediaId, function (err, rows) {
                if (err) {
                  res.json({ ack: 'err', msg: err.sqlMessage });
                } else {
                  // make meta array
                  var values = [];
                  Object.keys(metadata).forEach(function (key) {
                    var obj = metadata[key];
                    values.push([mediaId, key, obj]);
                  });
                  // make DB query
                  var sql = 'INSERT INTO media_meta (media_id, meta_name, meta_value) VALUES ?';
                  connection.query(sql, [values], function (err, rows) {
                    if (err) {
                      res.json({ ack: 'err', msg: err.sqlMessage });
                    } else {
                      res.json({ ack: 'ok', msg: 'Metadata saved', metadata: metadata });
                    }
                  });
                }
              });
            } else {
              res.json({ ack: 'err', msg: 'No metadata saved' });
            }
          });
        } else if (mime.includes('video')) {
          getVideoMeta.get(key, function (err, metadata) {
            // save metadata to DB if any
            if (metadata !== null && (typeof metadata === 'undefined' ? 'undefined' : _typeof(metadata)) === 'object') {
              // Delete old meta before save
              connection.query('DELETE FROM media_meta WHERE media_id = ?', mediaId, function (err, rows) {
                if (err) {
                  res.json({ ack: 'err', msg: err.sqlMessage });
                } else {
                  // make meta array
                  var values = [];
                  Object.keys(metadata).forEach(function (key) {
                    var obj = metadata[key];
                    values.push([mediaId, key, obj]);
                  });

                  // make DB query
                  var sql = "INSERT INTO media_meta (media_id, meta_name, meta_value) VALUES ?";
                  connection.query(sql, [values], function (err, rows) {
                    if (err) {
                      res.json({ ack: 'err', msg: err.sqlMessage });
                    } else {
                      res.json({ ack: 'ok', msg: 'Metadata saved', metadata: metadata });
                    }
                  });
                }
              });
            } else {
              res.json({ ack: 'err', msg: 'No metadata saved' });
            }
          });
        } else {
          res.json({ ack: 'err', msg: 'Unvalid mime type' });
        }
      }
    });
  }
};

// Get and Save Image Labels from AWS rekognition
exports.saveRekognitionLabels = function (req, res) {
  var mediaId = req.body.media_id;
  if (!mediaId) {
    res.json({ ack: 'err', msg: 'Wrong params' });
  } else {
    connection.query('SELECT s3_key, mime FROM media WHERE id = ?', mediaId, function (err, media) {
      if (err) {
        res.json({ ack: 'err', msg: err.sqlMessage });
      } else {
        var key = media[0].s3_key;
        var mime = media[0].mime;
        // Get Labels
        getRekognitionLabels.get(key, mime, function (err, labels) {
          if (err) {
            res.json({ ack: 'err', msg: err });
          } else {
            // save recognition labels to DB if any
            if (labels !== null && (typeof labels === 'undefined' ? 'undefined' : _typeof(labels)) === 'object') {
              // Delete old meta before save
              connection.query('DELETE FROM rekognition WHERE media_id = ?', mediaId, function (err, rows) {
                if (err) {
                  res.json({ ack: 'err', msg: err.sqlMessage });
                } else {
                  // make meta array
                  var values = [];
                  var labelsObj = new Object();
                  Object.keys(labels).forEach(function (key) {
                    var obj = labels[key];
                    values.push([mediaId, obj.Name, obj.Confidence]);
                    labelsObj[obj.Name] = obj.Confidence;
                  });
                  // make DB query
                  var sql = "INSERT INTO rekognition (media_id, label, confidence) VALUES ?";
                  connection.query(sql, [values], function (err, rows) {
                    if (err) {
                      res.json({ ack: 'err', msg: err.sqlMessage });
                    } else {
                      res.json({ ack: 'ok', msg: 'Rekognition Labels saved', rekognition_labels: labelsObj });
                    }
                  });
                }
              });
            } else {
              res.json({ ack: 'err', msg: 'No rekognition labels saved' });
            }
          }
        });
      }
    });
  }
};

// Generate Image Thumbnails
exports.generateImageThumbs = function (req, res) {
  var mediaId = req.body.media_id;
  if (!mediaId) {
    res.json({ ack: 'err', msg: 'Wrong params' });
  } else {
    connection.query('SELECT s3_key FROM media WHERE id = ?', mediaId, function (err, s3_key) {
      if (err) {
        res.json({ ack: 'err', msg: err.sqlMessage });
      } else {
        var key = s3_key[0].s3_key;
        // Generate Thumbnails
        generateImageThumbs.generate(key, function (err, response) {
          if (err) {
            res.json({ ack: 'err', msg: err });
          } else {
            res.json({ ack: 'ok', msg: 'Image thumbnails generated', thumbs: response });
          }
        });
      }
    });
  }
};

// Gets image Metadata/Exif
function getImageMeta(req, res) {
  var key = req.body.key;

  if (key) {
    getImageMetadata.get(key, function (err, metadata) {
      if (err) {
        res.json({ ack: 'err', msg: err });
      }
      // save metadata to DB if any
      if (metadata !== null && (typeof metadata === 'undefined' ? 'undefined' : _typeof(metadata)) === 'object') {
        res.json({ ack: 'ok', msg: 'Image metadata', metadata: metadata });
      } else {
        res.json({ ack: 'err', msg: 'No metadata saved' });
      }
    });
  } else {
    res.json({ ack: 'err', msg: 'No key' });
  }
}

// Generate Videos
exports.generateVideos = function (req, res) {
  var key = req.body.key;
  generateVideos.generate(key, function (err, response) {
    setTimeout(function () {
      res.json({ ack: 'ok', msg: 'Image thumbnails generated', thumbs: response });
    }, 2000);
  });
};
//# sourceMappingURL=media.model.js.map