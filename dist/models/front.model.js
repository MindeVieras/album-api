'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.getList = getList;

var _db = require('../db');

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var conn = new _db.Database();

// Gets albums
function getList(req, res) {

  // console.log(req.app.get('user'));
  var _req$body = req.body,
      page = _req$body.page,
      limit = _req$body.limit,
      media_limit = _req$body.media_limit;


  var l_page = parseInt(page) || 0;
  var l_limit = parseInt(limit) || 5;
  var l_media_limit = parseInt(media_limit) || 5;

  var albums = void 0,
      media = void 0;

  conn.query('SELECT\n                a.id, a.name,\n                GROUP_CONCAT(m.id) AS media_ids\n              FROM albums AS a\n                LEFT JOIN media AS m ON a.id = m.entity_id\n              GROUP BY a.id\n              LIMIT ?, ?', [l_page, l_limit]).then(function (rows) {
    albums = rows.map(function (a) {
      var mediaArr = new Array();

      var albumCopy = _objectWithoutProperties(a, []);
      // Limit meida


      if (a.media_ids) {
        mediaArr = albumCopy.media_ids.split(',').slice(0, l_media_limit);
      }
      return _extends({}, albumCopy, {
        media_ids: mediaArr
      });
    });

    // Make media ids
    var mids = new Array();
    albums.map(function (a) {
      a.media_ids.map(function (id) {
        mids.push(id);
      });
    });
    // Get media
    return conn.query('SELECT\n                          m.*,\n                          width.meta_value AS width,\n                          height.meta_value AS height\n                        FROM media AS m\n                          LEFT JOIN media_meta AS width\n                            ON m.id = width.media_id AND width.meta_name = \'width\'\n                          LEFT JOIN media_meta AS height\n                            ON m.id = height.media_id AND height.meta_name = \'height\'\n                        WHERE m.id IN (?)', [mids]);
  }).then(function (mediaRows) {
    media = mediaRows.map(function (m) {
      var mime = void 0,
          key = void 0;
      mime = m.mime.includes('image') ? 'image' : 'video';
      if (mime === 'video') {
        key = require('../helpers/media').video(m.s3_key, 'medium');
      } else {
        key = require('../helpers/media').img(m.s3_key, 'thumb');
      }
      return {
        id: m.id,
        entity_id: m.entity_id,
        mime: mime,
        key: key,
        width: parseInt(m.width),
        height: parseInt(m.height)
      };
    });
    // Assign media to album
    albums = albums.map(function (a) {
      var albumCopy = _objectWithoutProperties(a, []);

      return _extends({}, albumCopy, {
        media: media.filter(function (m) {
          return albumCopy.id == m.entity_id;
        })
      });
    });

    res.json({ ack: 'ok', msg: 'Albums list', data: albums });
  }).catch(function (err) {
    console.log(err);
    var msg = err.sqlMessage ? err.sqlMessage : err;
    res.json({ ack: 'err', msg: msg });
  });
}
//# sourceMappingURL=front.model.js.map