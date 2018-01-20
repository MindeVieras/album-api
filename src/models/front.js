
import { Database } from '../db'

let conn = new Database()

// Gets albums
export function getList(req, res){
  let albums, limit, page
  limit = parseInt(req.query.limit) || 20
  page = parseInt(req.query.page) || 1
  conn.query(`SELECT * FROM albums ORDER BY start_date DESC LIMIT ?, ?`, [ page, limit ])
    .then( rows => {
      albums = rows
      // Get albums media
      let ids = albums.map((a) => { return a.id })
      return conn.query(`SELECT
                          m.*,
                          width.meta_value AS width,
                          height.meta_value AS height
                        FROM media AS m
                          LEFT JOIN media_meta AS width
                            ON m.id = width.media_id AND width.meta_name = 'width'
                          LEFT JOIN media_meta AS height
                            ON m.id = height.media_id AND height.meta_name = 'height'
                        WHERE m.entity_id IN (?)`, [ids])
    })
    .then( albumsMedia => {
      // Add media to albums
      albums = albums.map(({ id, name }) => {
        let media = []
        albumsMedia.map((m) => {
          if (m.entity_id === id) {
            // const { mime } = m
            let mime, key
            mime = m.mime.includes('image') ? 'image' : 'video';
            if (mime === 'video') {
              key = require('../helpers/media').video(m.s3_key, 'medium');
            } else {
              key = require('../helpers/media').img(m.s3_key, 'thumb');
            }
            media.push({
              mime,
              key,
              width: m.width,
              height: m.height
            })
          }
        })
        return { id, name, media }
      })
    })
    .then( () => {
      res.json({ack:'ok', msg: 'Albums list', data: albums});
    })
    .catch( err => {
      let msg = err.sqlMessage ? err.sqlMessage : err
      res.json({ack:'err', msg})
    })

};

