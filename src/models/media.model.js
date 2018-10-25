
import ratio from 'aspect-ratio'
const connection = require('../config/db')
import { commonConstants, mediaConstants } from '../constants'
import { Database } from '../db'

let conn = new Database()

import { generate as generateVideosTS } from './aws/transcoder/generate_videos'
const getImageMetadata = require('./aws/lambda/get_image_metadata')
const getVideoMeta = require('./aws/lambda/get_video_metadata')
const generateImageThumbs = require('./aws/lambda/generate_thumbs')
const getRekognitionLabels = require('./aws/rekognition/get_labels')
const getRekognitionText = require('./aws/rekognition/get_text')

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

export function putToTrash(req, res) {
  
  const { media_id } = req.body
  const status = mediaConstants.MEDIA_TRASHED // Media status TRASHED
  
  //Put media file to trash
  conn.query(`UPDATE media SET status = ? WHERE id = ?`, [status, media_id])
    .then(row => {
      if (row.affectedRows === 1) {
        res.json({ack:'ok', msg: 'File moved to trash'})
      }
      else {
        throw 'Cannot trash media'
      }
    })
    .catch( err => {
      let msg = err.sqlMessage ? err.sqlMessage : err
      res.json({ack:'err', msg})
    })
}

// Moves media file to another album
export function moveMedia(req, res) {
  const { media_id, album_id } = req.body

  let data = [
    album_id,
    media_id,
    commonConstants.ENTITY_ALBUM // Album entity type
  ]

  conn.query(`UPDATE media
                SET entity_id = ?
              WHERE id = ? AND entity = ?`, data)
    .then(row => {
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
      if (recognitionLabels.length > 0) {

        // set labels
        labels = recognitionLabels

        // Delete old meta before save
        return conn.query(`DELETE FROM rekognition_labels WHERE media_id = ?`, media_id)
      }

      else throw `No rekognition labels found`
    })
    .then(() => {
      
      // make values array for db
      let values = labels.map(label => {
        return [media_id, label.Name, label.Confidence]
      })

      // Insert labels to DB
      return conn.query(`INSERT INTO rekognition_labels (media_id, label, confidence) VALUES ?`, [values])
      
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

// Get and Save Image Text from AWS rekognition
export function saveRekognitionText(req, res) {
  
  const { media_id } = req.body

  let text

  conn.query(`SELECT s3_key, mime FROM media WHERE id = ?`, media_id)
    .then( rows => {
      if (rows.length) {

        const { s3_key, mime } = rows[0]

        return getRekognitionText.get(s3_key, mime)
      }
      else {
        throw 'No such media'
      }
    })

    .then(recognitionText => {
      
      // if recognition labels found
      if (recognitionText.length > 0) {

        // set labels
        text = recognitionText

        // Delete old text before save
        return conn.query(`DELETE FROM rekognition_text WHERE media_id = ?`, media_id)
      }

      else throw `No text found`
    })
    .then(() => {
      
      // make values array for db
      let values = text.map(t => {
        console.log(t.Geometry.Polygon)
        const { BoundingBox, Polygon } = t.Geometry
        return [
          media_id, t.Id, t.ParentId, t.Type, t.DetectedText, t.Confidence,
          BoundingBox.Width, BoundingBox.Height, BoundingBox.Top, BoundingBox.Left,
          Polygon[0].X, Polygon[0].Y, Polygon[1].X, Polygon[1].Y,
          Polygon[2].X, Polygon[2].Y, Polygon[3].X, Polygon[3].Y
        ]
      })

      // Insert text to DB
      const sql = `INSERT INTO rekognition_text
                    (
                      media_id, text_id, text_parent_id, type, text, confidence,
                      bbox_width, bbox_height, bbox_top, bbox_left,
                      p1_x, p1_y, p2_x, p2_y, p3_x, p3_y, p4_x, p4_y
                    )
                  VALUES ?`
      return conn.query(sql, [values])
      
    })
    .then(() => {

      // Make object for return
      let rekognition_text = {}
      text.map(t => {
        rekognition_text['ack'] = 'ok'
        rekognition_text['Valio'] = 0.23
      })
      
      res.json({ack:'ok', msg: 'Rekognition Labels saved', rekognition_text})
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
