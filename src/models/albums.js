
const validator = require('validator');
const uuidv4 = require('uuid/v4');
import _ from 'lodash'
import moment from 'moment'

const connection = require('../config/db');

const Media = require('./media');

import { Database } from '../db'

let conn = new Database()

// Creates album
exports.create = function(req, res){

  const input = req.body;

  let data = {
    name : input.name,
    start_date : input.start_date,
    end_date: input.end_date,
    author: input.author,
    access: input.access,
    status: input.status
  };
  // console.log(data);
  connection.query('INSERT INTO albums set ? ', data, function(err, row) {
    if(err) {
      res.json({ack:'err', msg: err.sqlMessage});
    } else {
      res.json({ack:'ok', msg: 'Album created', id: row.insertId});
    }
  });

};

// Gets albums
export function getList(req, res){

  connection.query('SELECT * FROM albums ORDER BY id DESC', function(err, rows) {
      if(err) {
        res.json({ack:'err', msg: err.sqlMessage});
      } else {
        res.json({ack:'ok', msg: 'Albums list', data: rows});
      }
    });
};

// Gets one album
export function getOne(req, res) {
  if (typeof req.params.id != 'undefined' && !isNaN(req.params.id) && req.params.id > 0 && req.params.id.length) {
    const { id } = req.params
    const entity = 2 // Album type
    let album, media, metadata, rekognition
    conn.query(`SELECT
                  a.*,
                  CONCAT('{"lat":', l.lat, ',"lng":', l.lng, '}') AS location
                FROM albums AS a
                  LEFT JOIN locations AS l ON a.id = l.entity_id AND entity = ?
                WHERE a.id = ?
                LIMIT 1`, [entity, id])
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
                              m.filesize AS size
                            FROM media AS m
                            WHERE m.entity_id = ? AND m.status = ?`, [id, status])
        }
        else {
          throw 'No such Album'
        }
      })
      .then( albumMedia => {
        media = albumMedia.map((m) => {
          if (m.mime.includes('video')) {
            return {
              ...m,
              videos: { video: require('../helpers/media').video(m.s3_key, 'medium') }
            }
          } else {
            return {
              ...m,
              thumbs: { thumb: require('../helpers/media').img(m.s3_key, 'medium') }
            }
          }
        })
        // Add media to album
        album.media = media

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
        // res.json({ack:'ok', msg: 'One album', data: album, aaaaa: ids})

      })
      .then( ( mediaMeta ) => {
        metadata = mediaMeta
        album.media = album.media.map((m) => {
          const { ...mediaCopy } = m
          let metaObj = new Object()
          let mm = mediaMeta.filter(mt => mt.media_id === m.media_id).map((mt) => {
            metaObj['ack'] = 'ok'
            metaObj[mt.meta_name] = mt.meta_value
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

// Gets album locations
export function getLocations(req, res) {
  if (typeof req.params.id != 'undefined' && !isNaN(req.params.id) && req.params.id > 0 && req.params.id.length) {
    const { id } = req.params
    // const entity = 2 // Album type
    let locations
    conn.query(`SELECT
                  m.*
                FROM media AS m
                WHERE m.entity_id = ?`, [id])
      .then( rows => {
        locations = rows.map((loc) => {
          let location = new Object
          location.id = loc.id
          if (loc.mime.includes('video')) {
            location.key = require('../helpers/media').video(loc.s3_key, 'medium');
          } else {
            location.key = require('../helpers/media').img(loc.s3_key, 'icon');
          }
          return location
        })
        // Return media locations
        res.json({ack:'ok', msg: 'Album locations', data: locations});
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

// Gets album locations
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

// Renames album
export function rename(req, res){

  const { id, name } = req.body
  conn.query(`UPDATE albums SET name = ? WHERE id = ?`, [name, id])
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

};

// Changes album date
export function changeDate(req, res){

  const { start_date, end_date, id } = req.body
  conn.query(`UPDATE albums SET start_date = ?, end_date = ? WHERE id = ?`, [start_date, end_date, id])
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

// Deletes album
exports.delete = function(req, res){
  if (typeof req.params.id != 'undefined' && !isNaN(req.params.id) && req.params.id > 0 && req.params.id.length) {
    const id = req.params.id;
    connection.query('DELETE FROM albums WHERE id = ?', [id], function(err, rows) {
      if(err) {
        res.json({ack:'err', msg: err.sqlMessage});
      } else {
        if (rows.affectedRows === 1) {
          res.json({ack:'ok', msg: 'Album deleted', data: req.params.id});
        } else {
          res.json({ack:'err', msg: 'No such album'});
        }
      }
    });

  } else {
    res.json({ack:'err', msg: 'bad parameter'});
  }
};

