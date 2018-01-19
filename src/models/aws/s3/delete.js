
const connection = require('../../../config/db');
const path = require('path');
const AWS = require('aws-sdk');
AWS.config.loadFromPath('./aws-keys.json');
const s3 = new AWS.S3();
const config = require('../../../config/config');

module.exports.deleteImage = function(id, cb){
  // Get media S3 key form DB
  connection.query('SELECT s3_key FROM media WHERE id = ?', id, function(err, s3_key){
    if(err) {
      cb(err.sqlMessage);
    }
    // Check if any
    else if (s3_key[0] != null) {
      const key = s3_key[0].s3_key;
      //Get image media styles form DB
      connection.query('SELECT * FROM media_styles', function(err, styles){
        if (err) {
          cb(err.sqlMessage);
        }
        else {
          // make array of S3 objects
          var keysArray = [];
          var orgKeyObj = new Object();
          orgKeyObj['Key'] = key;
          keysArray.push(orgKeyObj);

          styles.forEach(function(row){
            var keyObj = new Object();
            keyObj['Key'] = 'thumbs/'+row.name+'/'+path.basename(key);
            keysArray.push(keyObj);
          });
          
          var params = {
            Bucket: config.bucket, 
            Delete: {
              Objects: keysArray,
              Quiet: false
            }
          };
          //Delete from S3
          s3.deleteObjects(params, function(err, data) {
            if (err) {
              cb(err);
            }
            else {
              cb(null, data);
            }
          });
        }
            
      });
    }
    else {
      cb('Can\'t find media ID:'+id+' in DB');
    }
  });
};

module.exports.deleteVideo = function(id, cb){
  // Get media S3 key form DB
  connection.query(`SELECT m.s3_key, mm.meta_value AS duration
                      FROM media AS m
                        LEFT JOIN media_meta AS mm ON m.id = mm.media_id AND mm.meta_name = 'duration'
                      WHERE m.id = ?`, id, function(err, rows){
    if(err) {
      cb(err.sqlMessage);
    }
    // Check if any
    else if (rows[0] != null) {
      const key = rows[0].s3_key;
      const duration = parseFloat(rows[0].duration);

      // Get image media styles form DB
      connection.query('SELECT * FROM video_presets', function(err, rows){
        if(err) {
          cb(err.sqlMessage);
        }
        else {
          // make array of S3 objects
          var keysArray = [];

          // Original video
          var orgKeyObj = new Object();
          orgKeyObj['Key'] = key;
          keysArray.push(orgKeyObj);

          // Transcoded videos
          var thumbCount = Math.ceil(duration / 60);
          rows.forEach(function(row){
            var keyObj = new Object();
            keyObj['Key'] = 'videos/'+row.name+'/'+path.basename(key);
            keysArray.push(keyObj);
            // video thumbs
            for (i = 0; i < thumbCount; i++) {
              var ext = path.extname(key);
              var thumbKey = makeCount(i+1)+'.jpg';
              var formattedKey = path.basename(key, ext)+'-'+thumbKey;

              var thumbObj = new Object();
              thumbObj['Key'] = 'videos/thumbs/'+row.name+'/'+formattedKey;
              keysArray.push(thumbObj);
            }
          });

          var params = {
            Bucket: config.bucket, 
            Delete: {
              Objects: keysArray,
              Quiet: false
            }
          };

          s3.deleteObjects(params, function(err, data) {
            if (err) {
              cb(err);
            }
            else {
              cb(null, data);
            }
          });
        }
      });
    } else {
      cb('Can\'t find media in DB');
    }          
  });
};

function makeCount(i) {
  var str = ''+i;
  var pad = '00000';
  return pad.substring(0, pad.length - str.length) + str;
}
