
import uuidv4 from 'uuid/v4'
import ratio from 'aspect-ratio'
const connection = require('../config/db');
import { Database } from '../db'

let conn = new Database()

import { generate as generateVideosTS } from './aws/transcoder/generate_videos'
const getImageMetadata = require('./aws/lambda/get_image_metadata')
const getVideoMeta = require('./aws/lambda/get_video_metadata')
const generateImageThumbs = require('./aws/lambda/generate_thumbs')
const getRekognitionLabels = require('./aws/rekognition/get_labels')

// Sets media location
export function setLocation(req, res) {
  const { media_id, location } = req.body

  let data = {
    lat : location.lat,
    lng : location.lng,
    entity: 3, // Media entity type
    entity_id: media_id
  }

  conn.query(`INSERT INTO locations SET ?`, data)
    .then( row => {
      if (row.affectedRows === 1) {
        res.json({ack:'ok', msg: 'Location set', id: row.insertId})
      }
      else {
        throw 'Location not set'
      }
    })
    .catch( err => {
      let msg = err.sqlMessage ? err.sqlMessage : err
      res.json({ack:'err', msg})
    })
}

// Updates media location
export function updateLocation(req, res) {
  const { media_id, location } = req.body

  let data = [
    location.lat,
    location.lng,
    3, // Media entity type
    media_id
  ]

  conn.query(`UPDATE locations
                SET lat = ?, lng = ?
              WHERE entity = ? AND entity_id = ?`, data)
    .then( row => {
      if (row.affectedRows === 1) {
        res.json({ack:'ok', msg: 'Location updated'})
      }
      else {
        throw 'Location not updated'
      }
    })
    .catch( err => {
      let msg = err.sqlMessage ? err.sqlMessage : err
      res.json({ack:'err', msg})
    })
}

// Removes media location
export function removeLocation(req, res) {
  if (typeof req.params.id != 'undefined' && !isNaN(req.params.id) && req.params.id > 0 && req.params.id.length) {
    const { id } = req.params
    const entity = 3 // Media type
    let location
    conn.query(`DELETE FROM locations WHERE entity = ? AND entity_id = ?`, [entity, id])
      .then( rows => {
        location = rows
        // Return media locations
        res.json({ack:'ok', msg: 'Location removed', data: location});
      })
      .catch( err => {
        console.log(err)
        let msg = err.sqlMessage ? err.sqlMessage : err
        res.json({ack:'err', msg})
      })

  } else {
    res.json({ack:'err', msg: 'bad parameter'})
  }
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
  const { media_id } = req.body;
  const status = 2; // Media status TRASHED
  //Put media file to trash
  connection.query('UPDATE media SET status = ? WHERE id = ?', [status, media_id], function(err, rows){
    if(err) {
      res.json({ack:'err', msg: err.sqlMessage, error: err.sqlMessage});
    } else {
      res.json({ack: 'ok', msg: 'File moved to trash', success: true});
    }
  });
}

// Moves media file to another album
export function moveMedia(req, res) {
  const { media_id, album_id } = req.body

  let data = [
    album_id,
    media_id,
    2, // Album entity type
  ]

  conn.query(`UPDATE media
                SET entity_id = ?
              WHERE id = ? AND entity = ?`, data)
    .then( row => {
      if (row.affectedRows === 1) {
        res.json({ack:'ok', msg: 'Media moved'})
      }
      else {
        throw 'Cannot move media'
      }
    })
    .catch( err => {
      let msg = err.sqlMessage ? err.sqlMessage : err
      res.json({ack:'err', msg})
    })
}

// Get media metadata from lambda and save to DB
export function saveMetadata(req, res) {

  const { media_id } = req.body
  const entity = 3 // media entity

  let initialMeta, imageMeta

  conn.query(`SELECT s3_key, mime, height, width FROM media WHERE id = ?`, media_id)
    .then( rows => {
      if (rows.length) {

        const { s3_key, mime, height, width } = rows[0]
        initialMeta = {
          aspect: ratio(width, height),
          height,
          width
        }

        if (mime.includes('image'))
          return getImageMetadata.get(s3_key)

        else if (mime.includes('video'))
          return getVideoMeta.get(s3_key)

        else
          throw 'Invalid mime type'

      }
      else {
        throw 'No such media'
      }
    })
    .then(metadata => {

      if (metadata) {
        imageMeta = metadata
        return conn.query(`DELETE FROM media_meta WHERE media_id = ?`, media_id)
      }

      return

    })
    .then(() => {
      
      if (imageMeta) {
        // remove location, it gets saved in locations table
        let { location, ...restMeta } = imageMeta
        let newMeta = { ...restMeta }
        // make meta array
        var values = []
        Object.keys(newMeta).forEach((key) => {
          let val = newMeta[key]
          values.push([media_id, key, val])
        })

        // insert metadata to DB
        const sql = `INSERT INTO media_meta (media_id, meta_name, meta_value) VALUES ?`
        return conn.query(sql, [values])
      }

      return

    })
    .then(() => {

      // If location found delete old
      if (imageMeta && imageMeta.location) {
        const sql = `DELETE FROM locations WHERE entity = ? AND entity_id = ?`
        return conn.query(sql, [entity, media_id])
      }
      
      return

    })
    .then(locDeletedRows => {

      // Once old location deleted, insert new one
      if (locDeletedRows) {
        let values = [imageMeta.location.lat, imageMeta.location.lon, entity, media_id]
        // insert location to DB
        const sql = `INSERT INTO locations (lat, lng, entity, entity_id) VALUES (?, ?, ?, ?)`
        return conn.query(sql, values)
      }
      
      return
      
    })
    .then(() => {

      // Make metadata object for final return
      let metadata = initialMeta
      if (imageMeta) {
        metadata = { ...initialMeta, ...imageMeta }
      }
      res.json({ack:'ok', msg: 'Metadata saved', metadata})
    })
    .catch( err => {
      let msg = err.sqlMessage ? err.sqlMessage : err
      res.json({ack:'err', msg})
    })
}

// Get and Save Image Labels from AWS rekognition
export function saveRekognitionLabels(req, res) {
  
  const { media_id } = req.body

  let labels

  conn.query(`SELECT s3_key, mime FROM media WHERE id = ?`, media_id)
    .then( rows => {
      if (rows.length) {

        const { s3_key, mime } = rows[0]

        return getRekognitionLabels.get(s3_key, mime)
      }
      else {
        throw 'No such media'
      }
    })

    .then(recognitionLabels => {
      
      // if recognition labels found
      if (recognitionLabels !== null && typeof recognitionLabels === 'object') {

        // set labels
        labels = recognitionLabels

        // Delete old meta before save
        return conn.query(`DELETE FROM rekognition WHERE media_id = ?`, media_id)
      }

      else throw `No rekognition labels found`
    })
    .then(() => {
      
      // make values array for db
      let values = labels.map(label => {
        return [media_id, label.Name, label.Confidence]
      })

      // Insert labels to DB
      return conn.query(`INSERT INTO rekognition (media_id, label, confidence) VALUES ?`, [values])
      
    })
    .then(() => {

      // Make object for return
      let rekognition_labels = {}
      labels.map(label => {
        rekognition_labels['ack'] = 'ok'
        rekognition_labels[label.Name] = label.Confidence
      })
      
      res.json({ack:'ok', msg: 'Rekognition Labels saved', rekognition_labels})
    })
    .catch( err => {
      let msg = err.sqlMessage ? err.sqlMessage : err
      res.json({ack:'err', msg})
    })

}

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

// Gets image Metadata/Exif
export function getImageMeta(req, res) {
  const { key } = req.body
  if (key) {
    getImageMetadata.get(key, (err, metadata) => {
      if (err) {
        res.json({ack:'err', msg: err})
      }
      // save metadata to DB if any
      if (metadata !== null && typeof metadata === 'object') {
        res.json({ack:'ok', msg: 'Image metadata', metadata: metadata})
      } else {
        res.json({ack:'err', msg: 'No metadata saved'})
      }
    })
  }
  else {
    res.json({ack: 'err', msg: 'No key'})
  }
}

// Generate Videos
export function generateVideos(req, res) {

  const { media_id } = req.body

  conn.query(`SELECT s3_key, mime, width, height FROM media WHERE id = ?`, media_id)
    .then( rows => {
      if (rows.length) {

        const { s3_key, mime, width, height } = rows[0]

        if (mime.includes('video'))
          return generateVideosTS(s3_key, width, height)

        else
          throw 'Invalid mime type'

      }
      else {
        throw 'No such Album'
      }
    })
    .then(tsResponse => {
      res.json({ack:'ok', msg: 'Videos generated', videos: tsResponse})
    })
    .catch(err => {
      let msg = err.sqlMessage ? err.sqlMessage : err
      res.json({ack:'err', msg})
    })
}
