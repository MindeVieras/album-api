
const validator = require('validator');
const uuidv4 = require('uuid/v4');

const connection = require('../config/db');

const Media = require('./media');

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
exports.getOne = function(req, res){
  if (typeof req.params.id != 'undefined' && !isNaN(req.params.id) && req.params.id > 0 && req.params.id.length) {
    const albumId = req.params.id;
    connection.query(`SELECT * FROM albums WHERE id = ? LIMIT 1`, albumId, function(err, album) {
      if(err) {
        res.json({ack:'err', msg: err.sqlMessage});
      } else {
        if (album.length) {
          res.json({ack:'ok', msg: 'One album', data: album[0]});
        } else {
          res.json({ack:'err', msg: 'No such Album'});
        }
      }
    });
  } else {
    res.json({ack:'err', msg: 'bad parameter'});
  }
};

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

