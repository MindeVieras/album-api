
const uuidv4 = require('uuid/v4');
const connection = require('../config/db');

const generateImageThumbs = require('./aws/lambda/generate_thumbs');
const generateVideos = require('./aws/transcoder/generate_videos');
const getImageMeta = require('./aws/lambda/get_image_metadata');
const getVideoMeta = require('./aws/lambda/get_video_metadata');
const getRekognitionLabels = require('./aws/rekognition/get_labels');

exports.getAlbumMedia = function(id, cb) {
    // get media
  connection.query('SELECT * FROM media WHERE entity_id = ? ', id, function(err, rows){
    if(err) {
      cb(err.sqlMessage);
    } else {
      cb(null, rows);
    }
  });
}

exports.getAll = function(req, res) {
  // Get all media
  connection.query('SELECT * FROM media', function(err, rows){
    if(err) {
      res.json({ack:'err', msg: err.sqlMessage});
    } else {
      let media = [];
      rows.forEach(function(m){
        media.push({
          uuid: uuidv4(),
          name: m.org_filename
        });
      });
      res.json(media);
    }
  });
}

exports.putToTrash = function(req, res) {
  const uuid = req.body.qquuid;
  const status = 2; // Media status TRASHED
  //Put media file to trash
  connection.query('UPDATE media SET status = ? WHERE uuid = ?', [status, uuid], function(err, rows){
    if(err) {
      res.json({ack:'err', msg: err.sqlMessage, error: err.sqlMessage});
    } else {
      res.json({ack: 'ok', msg: 'File removed to trash', success: true});
    }
  });
}

// Get media metadata from lambda and save to DB
exports.saveMetadata = function(req, res){
  var mediaId = req.body.media_id;
  if (!mediaId) {
    res.json({ack:'err', msg: 'Wrong params'});
  } else {
    connection.query('SELECT s3_key, mime FROM media WHERE id = ?', mediaId, function(err, media) {
      if(err) {
        res.json({ack:'err', msg: err.sqlMessage});
      } else {
        const key = media[0].s3_key;
        const mime = media[0].mime;
        if (mime.includes('image')) {
          getImageMeta.get(key, function (err, metadata) {
            // save metadata to DB if any
            if (metadata !== null && typeof metadata === 'object') {
              // Delete old meta before save
              connection.query('DELETE FROM media_meta WHERE media_id = ?', mediaId, function(err, rows) {
                if(err) {
                  res.json({ack:'err', msg: err.sqlMessage});
                } else {            
                  // make meta array
                  var values = [];
                  Object.keys(metadata).forEach(function (key) {
                    let obj = metadata[key];
                    values.push([mediaId, key, obj]);
                  });
                  // make DB query
                  var sql = 'INSERT INTO media_meta (media_id, meta_name, meta_value) VALUES ?';
                  connection.query(sql, [values], function(err, rows) {
                    if (err) {
                      res.json({ack:'err', msg: err.sqlMessage});
                    } else {
                      res.json({ack:'ok', msg: 'Metadata saved', metadata: metadata});
                    }
                  });
                }
              });
            } else {
              res.json({ack:'err', msg: 'No metadata saved'});
            }
          });
        }
        else if (mime.includes('video')) {
          getVideoMeta.get(key, function (err, metadata) {
            // save metadata to DB if any
            if (metadata !== null && typeof metadata === 'object') {
              // Delete old meta before save
              connection.query('DELETE FROM media_meta WHERE media_id = ?', mediaId, function(err, rows) {
                if(err) {
                  res.json({ack:'err', msg: err.sqlMessage});
                } else {
                  // make meta array
                  var values = [];
                  Object.keys(metadata).forEach(function(key) {
                    let obj = metadata[key];
                    values.push([mediaId, key, obj]);
                  });

                  // make DB query
                  var sql = "INSERT INTO media_meta (media_id, meta_name, meta_value) VALUES ?";
                  connection.query(sql, [values], function(err, rows) {
                    if (err) {
                      res.json({ack:'err', msg: err.sqlMessage});
                    } else {
                      res.json({ack:'ok', msg: 'Metadata saved', metadata: metadata});
                    }
                  });
                }
              });

            } else {
              res.json({ack:'err', msg: 'No metadata saved'});
            }
          });
        }
        else {
          res.json({ack:'err', msg: 'Unvalid mime type'});
        }
      }
    });
  }
};

// Get and Save Image Labels from AWS rekognition
exports.saveRekognitionLabels = function(req, res){
  var mediaId = req.body.media_id;
  if (!mediaId) {
    res.json({ack:'err', msg: 'Wrong params'});
  } else {
    connection.query('SELECT s3_key, mime FROM media WHERE id = ?', mediaId, function(err, media) {
      if(err) {
        res.json({ack:'err', msg: err.sqlMessage});
      } else {
        const key = media[0].s3_key;
        const mime = media[0].mime;
        // Get Labels
        getRekognitionLabels.get(key, mime, function(err, labels){
          if (err) {
            res.json({ack:'err', msg: err});
          } else {          
            // save recognition labels to DB if any
            if (labels !== null && typeof labels === 'object') {
              // Delete old meta before save
              connection.query('DELETE FROM rekognition WHERE media_id = ?', mediaId, function(err, rows) {
                if(err) {
                  res.json({ack:'err', msg: err.sqlMessage});
                } else {
                  // make meta array
                  var values = [];
                  var labelsObj = new Object();
                  Object.keys(labels).forEach(function (key) {
                    let obj = labels[key];
                    values.push([mediaId, obj.Name, obj.Confidence]);
                    labelsObj[obj.Name] = obj.Confidence;
                  });
                  // make DB query
                  var sql = "INSERT INTO rekognition (media_id, label, confidence) VALUES ?";
                  connection.query(sql, [values], function(err, rows) {
                    if (err) {
                      res.json({ack:'err', msg: err.sqlMessage});
                    } else {
                      res.json({ack:'ok', msg: 'Rekognition Labels saved', rekognition_labels: labelsObj});
                    }          
                  });
                }
              });
            } else {
              res.json({ack:'err', msg: 'No rekognition labels saved'});
            }
          }
        });
      }
    });
  }
};

// Generate Image Thumbnails
exports.generateImageThumbs = function(req, res){
  var mediaId = req.body.media_id;
  if (!mediaId) {
    res.json({ack:'err', msg: 'Wrong params'});
  } else {
    connection.query('SELECT s3_key FROM media WHERE id = ?', mediaId, function(err, s3_key) {
      if(err) {
        res.json({ack:'err', msg: err.sqlMessage});
      } else {
        const key = s3_key[0].s3_key;
        // Generate Thumbnails
        generateImageThumbs.generate(key, function(err, response){
          if (err) {
            res.json({ack:'err', msg: err});
          } else {
            res.json({ack:'ok', msg: 'Image thumbnails generated', thumbs: response});
          }
        });
      }
    });
  }
};

// Generate Videos
exports.generateVideos = function(req, res){
  var key = req.body.key;
  generateVideos.generate(key, function(err, response){
    setTimeout(function(){
      res.json({ack:'ok', msg: 'Image thumbnails generated', thumbs: response});
    }, 2000);
  });
};
