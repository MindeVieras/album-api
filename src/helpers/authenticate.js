
const jwt = require('jsonwebtoken');
const config = require('../config/config');

// check if user authenticated
exports.isAuthed = function (req, res, next) {
  doAuth(req, res, next, 50);
}
// // check if user admin
exports.isAdmin = function (req, res, next) {
  doAuth(req, res, next, 100);
}

function doAuth(req, res, next, access_level) {
  const bearerHeader = req.headers["authorization"];
  if (typeof bearerHeader !== 'undefined') {
    const bearer = bearerHeader.split(" ");
    const bearerToken = bearer[1];
    jwt.verify(bearerToken, config.secret_key, function(err, decoded){
      if (err) {
        res.json({ack:'err', msg: err.message});
      } else {
        if (decoded.access_level === 100) {
          next();
        } else if(decoded.access_level <= 50 && access_level === 50) {
          next();
        } else {
          res.json({ack:'err', msg: 'Access denied'});
        }
      }
    });
  } else {
    res.json({ack:'err', msg: 'Not authorized'});
  }
}


