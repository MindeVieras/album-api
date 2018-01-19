
const bcrypt = require('bcrypt');
const validator = require('validator');
const connection = require('../config/db');
const jwt = require('jsonwebtoken');
const moment = require('moment');

const config = require('../config/config');

// Authenticates user
exports.authenticate = function(req, res){

  const input = req.body;
  
  // // vlaidate form
  if (validator.isEmpty(input.username)) {
    res.json({ack:'err', msg: 'Username is required'});
  } else if (validator.isEmpty(input.password)){
    res.json({ack:'err', msg: 'Password is required'});
  } else {
    connection.query("SELECT * FROM users WHERE username = ? LIMIT 1",[input.username], function(err, user){
      if (err) {
        res.json({ack:'err', msg: err.sqlMessage});
      } else {
        if (user.length === 0) {
          res.json({ack:'err', msg: 'Incorrect details'});
        } else {
          const passMatch = bcrypt.compareSync(input.password, user[0].password);
          if (passMatch) {
            let login_date = moment().format('YYYY-MM-DD HH:mm:ss');
            connection.query('UPDATE users SET last_login = ? WHERE id = ?', [login_date, user[0].id], function(err, rows){
              if (err) {
                res.json({ack:'err', msg: err.sqlMessage});
              } else {
                if (rows.affectedRows === 1) {                
                  // Return User object if success
                  const jwtData = {
                    id: user[0].id,
                    username: user[0].username,
                    access_level: user[0].access_level
                  };
                  const token = jwt.sign(jwtData, config.secret_key);
                  let accessLevel = 'simple';
                  if (user[0].access_level >= 50 && user[0].access_level < 100) {
                    accessLevel = 'editor';
                  } else if (user[0].access_level === 100) {
                    accessLevel = 'admin';
                  }
                  let userData = {
                    id: user[0].id,
                    username: user[0].username,
                    display_name: user[0].display_name,
                    email: user[0].email,
                    created: user[0].created,
                    access_level: accessLevel,
                    token
                  };
                  res.json({ack:'ok', msg: 'Authentication ok', data: userData});
                } else {
                  res.json({ack:'err', msg: 'Connot set last login date'});
                }
              }
            });
          } else {
            res.json({ack:'err', msg: 'Incorrect details'});
          }
          
        }
      }

    });
  }

};
