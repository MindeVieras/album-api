
import { Database } from '../db'
let conn = new Database()

const connection = require('../config/db')
const deleteFromS3 = require('./aws/s3/delete')

// Gets trash items
export function getList(req, res) {

  const mediaStatus = 2 //Trashed file
  const albumStatus = 2 //Trashed albums

  let trashMedia, trashAlbums, list

  conn.query(`SELECT
                m.*,
                mw.meta_value AS width,
                mh.meta_value AS height,
                a.name AS album_name
              FROM media AS m
                LEFT JOIN media_meta AS mw ON m.id = mw.media_id AND mw.meta_name = 'width'
                LEFT JOIN media_meta AS mh ON m.id = mh.media_id AND mh.meta_name = 'height'
                LEFT JOIN albums AS a ON m.entity_id = a.id
              WHERE m.status = ?`, mediaStatus)
    .then(media => {
      // @ts-ignore
      trashMedia = media.map(m => {

        if (m.mime.includes('video')) {
          return {
            ...m,
            videos: {
              video: require('../helpers/media').video(m.s3_key, 'medium'),
              thumb: require('../helpers/media').videoThumb(m.s3_key, 'medium')
            }
          }
        }
        else if (m.mime.includes('image')) {
          return {
            ...m,
            thumbs: {
              icon: require('../helpers/media').img(m.s3_key, 'icon'),
              mini: require('../helpers/media').img(m.s3_key, 'mini')
            }
          }
        }
        else {
          return { ...m }
        }
      })

      return conn.query(`SELECT * FROM albums WHERE status = ?`, albumStatus)
    })
    .then(albums => {
      trashAlbums = albums
      list = {
        media: trashMedia,
        albums: trashAlbums
      }
      res.json({ ack: 'ok', msg: 'Trash list', list })
    })
    .catch(err => {
      console.log(err.sqlMessage)
      let msg = err.sqlMessage ? err.sqlMessage : err
      res.json({ ack: 'err', msg })
    })
}

// Restores trash item
export function restore(req, res) {
  if (typeof req.params.id != 'undefined' && !isNaN(req.params.id) && req.params.id > 0 && req.params.id.length) {
    const id = req.params.id
    const status = 1 //Enabled file
    connection.query('UPDATE media SET status = ? WHERE id = ?', [status, id], (err, rows) => {
      if (err) {
        res.json({ ack: 'err', msg: err.sqlMessage })
      } else {
        if (rows.affectedRows === 1) {
          res.json({ ack: 'ok', msg: 'Media file restored', data: req.params.id })
        } else {
          res.json({ ack: 'err', msg: 'No such media file' })
        }
      }
    })

  } else {
    res.json({ ack: 'err', msg: 'bad parameter' })
  }
}

// Deletes media item (permenent)
export function _delete(req, res) {
  if (typeof req.params.id != 'undefined' && !isNaN(req.params.id) && req.params.id > 0 && req.params.id.length) {
    const id = req.params.id;
    connection.query('SELECT mime FROM media WHERE id = ?', [id], (err, mime) => {
      if (err) {
        res.json({ ack: 'err', msg: err.sqlMessage });
      } else {
        const mimeType = mime[0].mime;
        // If IMAGE
        if (mimeType.includes('image')) {
          // Firstly delete image and thumbnails from S3
          deleteFromS3.deleteImage(id, (err, data) => {
            if (err) {
              res.json({ ack: 'err', msg: err });
            }
            else {
              // Delete media
              connection.query('DELETE FROM media WHERE id = ?', id);
              // Delete meta
              connection.query('DELETE FROM media_meta WHERE media_id = ?', id);
              // Delete rekognition
              connection.query('DELETE FROM rekognition_labels WHERE media_id = ?', id);
              res.json({ ack: 'ok', msg: 'Image deleted for good' });
            }
          });
        }
        // If VIDEO
        else if (mimeType.includes('video')) {
          // Firstly delete image and thumbnails from S3
          deleteFromS3.deleteVideo(id, (err, data) => {
            if (err) {
              res.json({ ack: 'err', msg: err })
            }
            else {
              // Delete media
              connection.query('DELETE FROM media WHERE id = ?', id)
              // Delete meta
              connection.query('DELETE FROM media_meta WHERE media_id = ?', id)
              res.json({ ack: 'ok', msg: 'Video deleted for good', data: data })
            }
          })
        }
        else {
          res.json({ ack: 'err', msg: 'Unknown MIME Type' })
        }
      }
    })

  } else {
    res.json({ ack: 'err', msg: 'bad parameter' })
  }
}
