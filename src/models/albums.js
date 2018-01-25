
const validator = require('validator');
const uuidv4 = require('uuid/v4');
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
exports.getList = function(req, res){

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
    let album, media
    conn.query(`SELECT * FROM albums WHERE id = ? LIMIT 1`, id)
      .then( rows => {
        if (rows.length) {
          album = rows[0]
          const status = 1; // Media status ENABLED
          // Get album media
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
        // Format dates
        album.start_date = moment(album.start_date).format('YYYY-MM-DD HH:mm:ss')
        album.end_date = moment(album.end_date).format('YYYY-MM-DD HH:mm:ss')
        // Add media to album
        album.media = media
      })
      .then( () => {
        res.json({ack:'ok', msg: 'One album', data: album});
      })
      .catch( err => {
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

