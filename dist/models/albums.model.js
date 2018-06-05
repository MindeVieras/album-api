'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.create = create;
exports.getList = getList;
exports.getListDates = getListDates;
exports.getOne = getOne;
exports.rename = rename;
exports.changeDate = changeDate;
exports.setLocation = setLocation;
exports.updateLocation = updateLocation;
exports.removeLocation = removeLocation;
exports.moveToTrash = moveToTrash;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _momentDurationFormat = require('moment-duration-format');

var _momentDurationFormat2 = _interopRequireDefault(_momentDurationFormat);

var _db = require('../db');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var conn = new _db.Database();

// Creates album
function create(req, res) {
  var _req$app$get = req.app.get('user'),
      uid = _req$app$get.uid;

  var _req$body = req.body,
      name = _req$body.name,
      start_date = _req$body.start_date,
      end_date = _req$body.end_date,
      access = _req$body.access,
      status = _req$body.status;


  var data = {
    name: name,
    start_date: start_date,
    end_date: end_date,
    access: access,
    status: status,
    author: uid
  };

  conn.query('INSERT INTO albums SET ?', data).then(function (row) {
    if (row.affectedRows === 1) {
      res.json({ ack: 'ok', msg: 'Album created', id: row.insertId });
    } else {
      throw 'Could not create album';
    }
  }).catch(function (err) {
    var msg = err.sqlMessage ? err.sqlMessage : err;
    res.json({ ack: 'err', msg: msg });
  });
}

// Gets albums
function getList(req, res) {
  var _req$body2 = req.body,
      start_date = _req$body2.start_date,
      end_date = _req$body2.end_date;

  var endOfEndDay = (0, _moment2.default)(end_date, 'YYYY-MM-DD').endOf('day').format('YYYY-MM-DD HH:mm:ss');
  var status = 1; // Enabled
  var albums = void 0;
  conn.query('SELECT * FROM albums\n                WHERE status = ? AND start_date >= ? AND start_date <= ?\n              ORDER BY start_date DESC', [status, start_date, endOfEndDay]).then(function (rows) {
    albums = rows;
    res.json({ ack: 'ok', msg: 'Albums list', list: albums });
  }).catch(function (err) {
    var msg = err.sqlMessage ? err.sqlMessage : err;
    res.json({ ack: 'err', msg: msg });
  });
}

// Gets albums dates
function getListDates(req, res) {
  var dates = void 0;
  conn.query('SELECT DISTINCT DATE_FORMAT(start_date, \'%Y-%c-%e\') AS date FROM albums ORDER BY date DESC').then(function (rows) {
    dates = rows.map(function (d) {
      return d.date;
    }).sort(function (a, b) {
      return (0, _moment2.default)(a, 'YYYY-M-D').diff((0, _moment2.default)(b, 'YYYY-M-D'));
    });
    res.json({ ack: 'ok', msg: 'Albums list dates', dates: dates });
  }).catch(function (err) {
    var msg = err.sqlMessage ? err.sqlMessage : err;
    res.json({ ack: 'err', msg: msg });
  });
}

// Gets one album
function getOne(req, res) {
  if (typeof req.params.id != 'undefined' && !isNaN(req.params.id) && req.params.id > 0 && req.params.id.length) {
    var id = req.params.id;

    var albumEntity = 2; // Album type
    var mediaEntity = 3; // Media type
    var album = void 0,
        metadata = void 0,
        rekognition = void 0;
    conn.query('SELECT\n                  a.*,\n                  CONCAT(\'{"lat":\', l.lat, \',"lng":\', l.lng, \'}\') AS location\n                FROM albums AS a\n                  LEFT JOIN locations AS l ON a.id = l.entity_id AND entity = ?\n                WHERE a.id = ?\n                LIMIT 1', [albumEntity, id]).then(function (rows) {
      if (rows.length) {

        var albumData = rows[0];

        // Parse location and Format dates

        var albumCopy = _objectWithoutProperties(albumData, []);

        album = _extends({}, albumCopy, {
          location: JSON.parse(albumData.location),
          start_date: (0, _moment2.default)(albumData.start_date).format('YYYY-MM-DD HH:mm:ss'),
          end_date: (0, _moment2.default)(albumData.end_date).format('YYYY-MM-DD HH:mm:ss')

          // Get album media
        });var status = 1; // Media status ENABLED
        return conn.query('SELECT\n                              m.id AS media_id,\n                              m.s3_key,\n                              m.mime,\n                              m.org_filename AS filename,\n                              m.filesize,\n                              m.weight,\n                              CONCAT(\'{"lat":\', l.lat, \',"lng":\', l.lng, \'}\') AS location\n                            FROM media AS m\n                              LEFT JOIN locations AS l ON m.id = l.entity_id AND l.entity = ?\n                            WHERE m.entity_id = ? AND m.status = ? LIMIT 1500', [mediaEntity, id, status]);
      } else {
        throw 'No such Album';
      }
    }).then(function (albumMedia) {
      // Add media to album
      album.media = albumMedia.map(function (m, i) {
        m.id = 100000 + i;
        m.phase = 'upload successful';
        m.fromServer = true;
        m.marker_open = false;
        m.location = JSON.parse(m.location);
        if (m.mime.includes('video')) {
          return _extends({}, m, {
            videos: {
              video: require('../helpers/media').video(m.s3_key, 'medium'),
              video_hd: require('../helpers/media').video(m.s3_key, 'hd'),
              thumbs: {
                medium: require('../helpers/media').videoThumb(m.s3_key, 'medium')
              }
            }
          });
        } else {
          return _extends({}, m, {
            thumbs: {
              icon: require('../helpers/media').img(m.s3_key, 'icon'),
              mini: require('../helpers/media').img(m.s3_key, 'mini'),
              thumb: require('../helpers/media').img(m.s3_key, 'medium'),
              fullhd: require('../helpers/media').img(m.s3_key, 'fullhd')
            }
          });
        }
      });

      // Get media Metadata
      var ids = album.media.map(function (m) {
        return m.media_id;
      });
      if (_lodash2.default.isEmpty(ids)) {
        return [];
      } else {
        return conn.query('SELECT\n                    m.*\n                  FROM media_meta AS m\n                  WHERE m.media_id IN (?)', [ids]);
      }
    }).then(function (mediaMeta) {
      metadata = mediaMeta;
      album.media = album.media.map(function (m) {
        var mediaCopy = _objectWithoutProperties(m, []);

        var metaObj = new Object();
        var mm = mediaMeta.filter(function (mt) {
          return mt.media_id === m.media_id;
        }).map(function (mt) {
          metaObj['ack'] = 'ok';
          metaObj[mt.meta_name] = mt.meta_value;
          if (mt.meta_name === 'duration') {
            var duration = Math.round(mt.meta_value);
            metaObj['duration'] = _moment2.default.duration(duration, 'seconds').format('h[h], m[min], s[s]');
          }
        });
        if (_lodash2.default.isEmpty(mm)) {
          metaObj['ack'] = 'err';
          metaObj['msg'] = 'No metadata';
        }
        return _extends({}, mediaCopy, {
          metadata: metaObj
        });
      });

      // Get media Rekognition
      var ids = album.media.map(function (m) {
        return m.media_id;
      });
      if (_lodash2.default.isEmpty(ids)) {
        return [];
      } else {
        return conn.query('SELECT\n                              r.*\n                            FROM rekognition AS r\n                              WHERE r.media_id IN (?)\n                            ORDER BY r.confidence DESC', [ids]);
      }
    }).then(function (mediaRekognition) {
      rekognition = mediaRekognition;
      album.media = album.media.map(function (m) {
        var mediaCopy = _objectWithoutProperties(m, []);

        var rekognitionObj = new Object();
        var mm = mediaRekognition.filter(function (r) {
          return r.media_id === m.media_id;
        }).map(function (r) {
          rekognitionObj['ack'] = 'ok';
          rekognitionObj[r.label] = r.confidence;
        });
        if (_lodash2.default.isEmpty(mm)) {
          rekognitionObj['ack'] = 'err';
          rekognitionObj['msg'] = 'No rokognition labels found';
        }
        return _extends({}, mediaCopy, {
          rekognition_labels: rekognitionObj
        });
      });

      // Return album
      res.json({ ack: 'ok', msg: 'One album', data: album });
    }).catch(function (err) {
      console.log(err);
      var msg = err.sqlMessage ? err.sqlMessage : err;
      res.json({ ack: 'err', msg: msg });
    });
  } else {
    res.json({ ack: 'err', msg: 'bad parameter' });
  }
}

// Renames album
function rename(req, res) {
  var _req$body3 = req.body,
      album_id = _req$body3.album_id,
      name = _req$body3.name;


  conn.query('UPDATE albums SET name = ? WHERE id = ?', [name, album_id]).then(function (row) {
    if (row.affectedRows === 1) {
      res.json({ ack: 'ok', msg: 'Album renamed', id: row.insertId });
    } else {
      throw 'No such Album';
    }
  }).catch(function (err) {
    var msg = err.sqlMessage ? err.sqlMessage : err;
    res.json({ ack: 'err', msg: msg });
  });
}

// Changes album date
function changeDate(req, res) {
  var _req$body4 = req.body,
      album_id = _req$body4.album_id,
      start_date = _req$body4.start_date,
      end_date = _req$body4.end_date;

  conn.query('UPDATE albums SET start_date = ?, end_date = ? WHERE id = ?', [start_date, end_date, album_id]).then(function (row) {
    if (row.affectedRows === 1) {
      res.json({ ack: 'ok', msg: 'Album date changed', id: row.insertId });
    } else {
      throw 'No such Album';
    }
  }).catch(function (err) {
    var msg = err.sqlMessage ? err.sqlMessage : err;
    res.json({ ack: 'err', msg: msg });
  });
}

// Sets album location
function setLocation(req, res) {
  var _req$body5 = req.body,
      album_id = _req$body5.album_id,
      location = _req$body5.location;


  var data = {
    lat: location.lat,
    lng: location.lng,
    entity: 2, // Album entity type
    entity_id: album_id
  };

  conn.query('INSERT INTO locations SET ?', data).then(function (row) {
    if (row.affectedRows === 1) {
      res.json({ ack: 'ok', msg: 'Location set', id: row.insertId });
    } else {
      throw 'Location not set';
    }
  }).catch(function (err) {
    var msg = err.sqlMessage ? err.sqlMessage : err;
    res.json({ ack: 'err', msg: msg });
  });
}

// Updates album location
function updateLocation(req, res) {
  var _req$body6 = req.body,
      album_id = _req$body6.album_id,
      location = _req$body6.location;


  var data = [location.lat, location.lng, 2, // Album entity type
  album_id];

  conn.query('UPDATE locations\n                SET lat = ?, lng = ?\n              WHERE entity = ? AND entity_id = ?', data).then(function (row) {
    if (row.affectedRows === 1) {
      res.json({ ack: 'ok', msg: 'Location updated' });
    } else {
      throw 'Location not updated';
    }
  }).catch(function (err) {
    var msg = err.sqlMessage ? err.sqlMessage : err;
    res.json({ ack: 'err', msg: msg });
  });
}

// Remove album location
function removeLocation(req, res) {
  if (typeof req.params.id != 'undefined' && !isNaN(req.params.id) && req.params.id > 0 && req.params.id.length) {
    var id = req.params.id;

    var entity = 2; // Album type
    var location = void 0;
    conn.query('DELETE FROM locations WHERE entity = ? AND entity_id = ?', [entity, id]).then(function (rows) {
      location = rows;
      // Return media locations
      res.json({ ack: 'ok', msg: 'Location removed', data: location });
    }).catch(function (err) {
      console.log(err);
      var msg = err.sqlMessage ? err.sqlMessage : err;
      res.json({ ack: 'err', msg: msg });
    });
  } else {
    res.json({ ack: 'err', msg: 'bad parameter' });
  }
}

// Moves album to trash
function moveToTrash(req, res) {
  if (typeof req.params.id != 'undefined' && !isNaN(req.params.id) && req.params.id > 0 && req.params.id.length) {
    var id = req.params.id;

    var status = 2; // Trashed

    conn.query('UPDATE albums SET status = ? WHERE id = ?', [status, id]).then(function (rows) {
      if (rows.affectedRows === 1) {
        res.json({ ack: 'ok', msg: 'Album moved to trash' });
      } else {
        throw 'No such album';
      }
    }).catch(function (err) {
      console.log(err);
      var msg = err.sqlMessage ? err.sqlMessage : err;
      res.json({ ack: 'err', msg: msg });
    });
  } else {
    res.json({ ack: 'err', msg: 'bad parameter' });
  }
}
//# sourceMappingURL=albums.model.js.map