
const connection = require('../config/db');

// Gets albums
exports.getList = function(req, res){

  connection.query(`SELECT
                      a.id, a.name,
                      GROUP_CONCAT(DISTINCT
                                    CASE
                                      WHEN m.status = 1
                                      THEN CONCAT_WS(
                                          ',',
                                          m.s3_key,
                                          m.mime,
                                          (SELECT meta_value FROM media_meta
                                            WHERE meta_name = 'width' AND media_id = m.id),
                                          (SELECT meta_value FROM media_meta
                                            WHERE meta_name = 'height' AND media_id = m.id)
                                        )
                                      ELSE NULL
                                    END ORDER BY m.id ASC SEPARATOR '|') AS media
                    FROM albums AS a
                      LEFT JOIN media AS m ON m.entity_id = a.id
                    GROUP BY a.id DESC
                    LIMIT 4`, function(err, albums) {
      if(err) {
        res.json({ack:'err', msg: err.sqlMessage});
      } else {
        let albums_data = [];

        albums.map(function(album){

          // Media
          let media = [];
          if (album.media) {
            // Split media rows
            album.media.split('|').map(function(m){
              // Make object and push to media
              const mediaObj = new Object();
              // Split values
              const values = m.split(',').map(function(field){
                return field;
              });
              const mime = values[1].includes('image') ? 'image' : 'video';
              if (mime === 'video') {
                mediaObj.key = require('../helpers/media').video(values[0], 'medium');
              } else {
                mediaObj.key = require('../helpers/media').img(values[0], 'thumb');
              }
              mediaObj.mime = mime;
              mediaObj.width = values[2];
              mediaObj.height = values[3];
              media.push(mediaObj);
            });
          }

          albums_data.push(
            {
              id: album.id,
              name: album.name,
              media
            }
          );
        });
        res.json({ack:'ok', msg: 'Albums list', data: albums_data});
      }
    });
};
