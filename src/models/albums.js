
import _ from 'lodash'
import moment from 'moment'
import momentDurationFormatSetup from 'moment-duration-format'

import { Database } from '../db'
let conn = new Database()

// Creates album
export function create(req, res){
  const { uid } = req.app.get('user')
  const { name, start_date, end_date, access, status } = req.body
  
  let data = {
    name,
    start_date,
    end_date,
    access,
    status,
    author: uid
  }

  conn.query(`INSERT INTO albums SET ?`, data)
    .then( row => {      
      if (row.affectedRows === 1) {
        res.json({ack:'ok', msg: 'Album created', id: row.insertId})
      }
      else {
        throw 'Could not create album'
      }
    })
    .catch( err => {
      let msg = err.sqlMessage ? err.sqlMessage : err
      res.json({ack:'err', msg})
    })
}

// Gets albums
export function getList(req, res){

  const { start_date, end_date } = req.body
  const endOfEndDay = moment(end_date, 'YYYY-MM-DD').endOf('day').format('YYYY-MM-DD HH:mm:ss')
  const status = 1 // Enabled
  let albums
  conn.query(`SELECT * FROM albums
                WHERE status = ? AND start_date >= ? AND start_date <= ?
              ORDER BY start_date DESC`, [status, start_date, endOfEndDay])
    .then( rows => {
      albums = rows
      res.json({ack:'ok', msg: 'Albums list', list: albums});
    })
    .catch( err => {
      let msg = err.sqlMessage ? err.sqlMessage : err
      res.json({ack:'err', msg})
    })
}

// Gets albums dates
export function getListDates(req, res){
  let dates
  conn.query(`SELECT DISTINCT DATE_FORMAT(start_date, '%Y-%c-%e') AS date FROM albums ORDER BY date DESC`)
    .then( rows => {
      dates = rows.map(d => {
        return d.date
      }).sort(function(a, b){
        return moment(a, 'YYYY-M-D').diff(moment(b, 'YYYY-M-D'))
      })
      res.json({ack:'ok', msg: 'Albums list dates', dates}); 
    })
    .catch( err => {
      let msg = err.sqlMessage ? err.sqlMessage : err
      res.json({ack:'err', msg})
    })
}

// Gets one album
export function getOne(req, res) {
  if (typeof req.params.id != 'undefined' && !isNaN(req.params.id) && req.params.id > 0 && req.params.id.length) {
    const { id } = req.params
    const albumEntity = 2 // Album type
    const mediaEntity = 3 // Media type
    let album, metadata, rekognition
    conn.query(`SELECT
                  a.*,
                  CONCAT('{"lat":', l.lat, ',"lng":', l.lng, '}') AS location
                FROM albums AS a
                  LEFT JOIN locations AS l ON a.id = l.entity_id AND entity = ?
                WHERE a.id = ?
                LIMIT 1`, [albumEntity, id])
      .then( rows => {
        if (rows.length) {

          const albumData = rows[0]
          
          // Parse location and Format dates
          const { ...albumCopy } = albumData
          album = {
            ...albumCopy,
            location: JSON.parse(albumData.location),
            start_date: moment(albumData.start_date).format('YYYY-MM-DD HH:mm:ss'),
            end_date: moment(albumData.end_date).format('YYYY-MM-DD HH:mm:ss')
          }

          // Get album media
          const status = 1 // Media status ENABLED
          return conn.query(`SELECT
                              m.id AS media_id,
                              m.s3_key,
                              m.mime,
                              m.org_filename AS name,
                              m.filesize AS size,
                              m.weight,
                              CONCAT('{"lat":', l.lat, ',"lng":', l.lng, '}') AS location
                            FROM media AS m
                              LEFT JOIN locations AS l ON m.id = l.entity_id AND l.entity = ?
                            WHERE m.entity_id = ? AND m.status = ? LIMIT 1500`, [mediaEntity, id, status])
        }
        else {
          throw 'No such Album'
        }
      })
      .then( albumMedia => {
        // Add media to album
        album.media = albumMedia.map((m) => {
          m.marker_open = false
          m.location = JSON.parse(m.location)
          if (m.mime.includes('video')) {
            return {
              ...m,
              videos: {
                video: require('../helpers/media').video(m.s3_key, 'medium'),
                video_hd: require('../helpers/media').video(m.s3_key, 'hd'),
                thumbs: {
                  medium: require('../helpers/media').videoThumb(m.s3_key, 'medium')
                }
              }
            }
          } else {
            return {
              ...m,
              thumbs: {
                icon: require('../helpers/media').img(m.s3_key, 'icon'),
                mini: require('../helpers/media').img(m.s3_key, 'mini'),
                thumb: require('../helpers/media').img(m.s3_key, 'medium'),
                fullhd: require('../helpers/media').img(m.s3_key, 'fullhd')
              }
            }
          }
        })

        // Get media Metadata
        let ids = album.media.map((m) => { return m.media_id })
        if (_.isEmpty(ids)) {
          return []
        }
        else {
          return conn.query(`SELECT
                    m.*
                  FROM media_meta AS m
                  WHERE m.media_id IN (?)`, [ids])
        }

      })
      .then( ( mediaMeta ) => {
        metadata = mediaMeta
        album.media = album.media.map((m) => {
          const { ...mediaCopy } = m
          let metaObj = new Object()
          let mm = mediaMeta.filter(mt => mt.media_id === m.media_id).map((mt) => {
            metaObj['ack'] = 'ok'
            metaObj[mt.meta_name] = mt.meta_value
            if (mt.meta_name === 'duration') {
              let duration = Math.round(mt.meta_value)
              metaObj['duration'] = moment.duration(duration, 'seconds').format('h[h], m[min], s[s]')
            }
          })
          if (_.isEmpty(mm)) {
            metaObj['ack'] = 'err'
            metaObj['msg'] = 'No metadata'
          }
          return {
            ...mediaCopy,
            metadata: metaObj
          }
        })

        // Get media Rekognition
        let ids = album.media.map((m) => { return m.media_id })
        if (_.isEmpty(ids)) {
          return []
        }
        else {
          return conn.query(`SELECT
                              r.*
                            FROM rekognition AS r
                              WHERE r.media_id IN (?)
                            ORDER BY r.confidence DESC`, [ids])
        }
      })
      .then( ( mediaRekognition ) => {
        rekognition = mediaRekognition
        album.media = album.media.map((m) => {
          const { ...mediaCopy } = m
          let rekognitionObj = new Object()
          let mm = mediaRekognition.filter(r => r.media_id === m.media_id).map((r) => {
            rekognitionObj['ack'] = 'ok'
            rekognitionObj[r.label] = r.confidence
          })
          if (_.isEmpty(mm)) {
            rekognitionObj['ack'] = 'err'
            rekognitionObj['msg'] = 'No rokognition labels found'
          }
          return {
            ...mediaCopy,
            rekognition_labels: rekognitionObj
          }
        })

        // Return album
        res.json({ack:'ok', msg: 'One album', data: album});
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

// Renames album
export function rename(req, res){

  const { album_id, name } = req.body

  conn.query(`UPDATE albums SET name = ? WHERE id = ?`, [name, album_id])
    .then( row => {      
      if (row.affectedRows === 1) {
        res.json({ack:'ok', msg: 'Album renamed', id: row.insertId});
      }
      else {
        throw 'No such Album'
      }
    })
    .catch( err => {
      let msg = err.sqlMessage ? err.sqlMessage : err
      res.json({ack:'err', msg})
    })
}

// Changes album date
export function changeDate(req, res){

  const { album_id, start_date, end_date } = req.body
  conn.query(`UPDATE albums SET start_date = ?, end_date = ? WHERE id = ?`, [start_date, end_date, album_id])
    .then( row => {      
      if (row.affectedRows === 1) {
        res.json({ack:'ok', msg: 'Album date changed', id: row.insertId});
      }
      else {
        throw 'No such Album'
      }
    })
    .catch( err => {
      let msg = err.sqlMessage ? err.sqlMessage : err
      res.json({ack:'err', msg})
    })
}

// Remove album location
export function removeLocation(req, res) {
  if (typeof req.params.id != 'undefined' && !isNaN(req.params.id) && req.params.id > 0 && req.params.id.length) {
    const { id } = req.params
    const entity = 2 // Album type
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

// Sets album location
export function setLocation(req, res) {
  const { album_id, location } = req.body

  let data = {
    lat : location.lat,
    lng : location.lng,
    entity: 2, // Album entity type
    entity_id: album_id
  }

  conn.query(`INSERT INTO locations SET ?`, data)
    .then( row => {      
      if (row.affectedRows === 1) {
        res.json({ack:'ok', msg: 'Location set', id: row.insertId});
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

// Updates album location
export function updateLocation(req, res) {
  const { album_id, location } = req.body

  let data = [
    location.lat,
    location.lng,
    2, // Album entity type
    album_id
  ]

  conn.query(`UPDATE locations
                SET lat = ?, lng = ?
              WHERE entity = ? AND entity_id = ?`, data)
    .then( row => {      
      if (row.affectedRows === 1) {
        res.json({ack:'ok', msg: 'Location updated'});
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

// Moves album to trash
export function moveToTrash(req, res){
  if (typeof req.params.id != 'undefined' && !isNaN(req.params.id) && req.params.id > 0 && req.params.id.length) {
    const { id } = req.params
    const status = 2 // Trashed

    conn.query(`UPDATE albums SET status = ? WHERE id = ?`, [status, id])
      .then( rows => {
        if (rows.affectedRows === 1) {
          res.json({ack:'ok', msg: 'Album moved to trash'});
        }
        else {
          throw 'No such album'
        }
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
