
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
    let album
    conn.query(`SELECT * FROM albums WHERE id = ? LIMIT 1`, id)
      .then( rows => {
        if (rows.length) {
          album = rows[0]
          // Get album media
          return conn.query(`SELECT
                              m.*,
                              width.meta_value AS width,
                              height.meta_value AS height,
                              dt.meta_value AS datetime
                            FROM media AS m
                              LEFT JOIN media_meta AS width
                                ON m.id = width.media_id AND width.meta_name = 'width'
                              LEFT JOIN media_meta AS height
                                ON m.id = height.media_id AND height.meta_name = 'height'
                              LEFT JOIN media_meta AS dt
                                ON m.id = dt.media_id AND dt.meta_name = 'datetime'
                            WHERE m.entity_id = ?`, id)
        }
        else {
          throw 'No such Album'
        }
      })
      .then( albumMedia => {
        // Format dates
        album.start_date = moment(album.start_date).format('YYYY-MM-DD HH:mm:ss')
        album.end_date = moment(album.end_date).format('YYYY-MM-DD HH:mm:ss')
        // Add media to album
        album.media = albumMedia
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
exports.rename = function(req, res){

  const input = req.body;
  const name = input.name;
  const id = input.id;
  // console.log(data);
  connection.query('UPDATE albums SET name = ? WHERE id = ?', [name, id], function(err, row) {
    if(err) {
      res.json({ack:'err', msg: err.sqlMessage});
    } else {
      res.json({ack:'ok', msg: 'Album renamed', id: row.insertId});
    }
  });

};

// Changes album date
export function changeDate(req, res){

  const { start_date, end_date, id } = req.body

  connection.query('UPDATE albums SET start_date = ?, end_date = ? WHERE id = ?', [start_date, end_date, id], function(err, row) {
    if(err) {
      res.json({ack:'err', msg: err.sqlMessage});
    } else {
      res.json({ack:'ok', msg: 'Album date changed', id: row.insertId});
    }
  });

};

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

