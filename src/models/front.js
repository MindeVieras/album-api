
import { Database } from '../db'

let conn = new Database()

// Gets albums
export function getList(req, res){
  let albums, limit, page
  limit = parseInt(req.query.limit) || 100
  page = parseInt(req.query.page) || 1
  conn.query(`SELECT * FROM albums ORDER BY start_date DESC LIMIT ?, ?`, [ page, limit ])
    .then( rows => {
      albums = rows
      // Get albums media
      let ids = albums.map((a) => { return a.id })
      return conn.query(`SELECT
                          m.*,
                          width.meta_value AS width,
                          height.meta_value AS height
                        FROM media AS m
                          LEFT JOIN media_meta AS width
                            ON m.id = width.media_id AND width.meta_name = 'width'
                          LEFT JOIN media_meta AS height
                            ON m.id = height.media_id AND height.meta_name = 'height'
                        WHERE m.entity_id IN (?)`, [ids])
    })
    .then( albumsMedia => {
      // Add media to albums
      albums = albums.map(({ id, name }) => {
        let media = []
        albumsMedia.map((m) => {
          if (m.entity_id === id) {
            // const { mime } = m
            let mime, key
            mime = m.mime.includes('image') ? 'image' : 'video';
            if (mime === 'video') {
              key = require('../helpers/media').video(m.s3_key, 'medium');
            } else {
              key = require('../helpers/media').img(m.s3_key, 'thumb');
            }
            media.push({
              mime,
              key,
              width: m.width,
              height: m.height
            })
          }
        })
        return { id, name, media }
      })
    })
    .then( () => {
      res.json({ack:'ok', msg: 'Albums list', data: albums});
    })
    .catch( err => {
      let msg = err.sqlMessage ? err.sqlMessage : err
      res.json({ack:'err', msg})
    })
  // connection.query(`SELECT
  //                     a.id, a.name,
  //                     GROUP_CONCAT(DISTINCT
  //                                   CASE
  //                                     WHEN m.status = 1
  //                                     THEN CONCAT_WS(
  //                                         ',',
  //                                         m.s3_key,
  //                                         m.mime
  //                                       )
  //                                     ELSE NULL
  //                                   END ORDER BY m.id ASC SEPARATOR '|') AS media
  //                   FROM albums AS a
  //                     LEFT JOIN media AS m ON m.entity_id = a.id
  //                   GROUP BY a.id DESC
  //                   LIMIT 40`, function(err, albums) {
  //     if(err) {
  //       res.json({ack:'err', msg: err.sqlMessage});
  //     } else {
  //       let albums_data = [];

  //       albums.map(function(album){

  //         // Media
  //         let media = [];
  //         if (album.media) {
  //           // Split media rows
  //           album.media.split('|').map(function(m){
  //             // Make object and push to media
  //             const mediaObj = new Object();
  //             // Split values
  //             const values = m.split(',').map(function(field){
  //               return field;
  //             });
  //             const mime = values[1].includes('image') ? 'image' : 'video';
  //             if (mime === 'video') {
  //               mediaObj.key = require('../helpers/media').video(values[0], 'medium');
  //             } else {
  //               mediaObj.key = require('../helpers/media').img(values[0], 'thumb');
  //             }
  //             mediaObj.mime = mime;
  //             media.push(mediaObj);
  //           });
  //         }

  //         albums_data.push(
  //           {
  //             id: album.id,
  //             name: album.name,
  //             media
  //           }
  //         );
  //       });
  //       res.json({ack:'ok', msg: 'Albums list', data: albums_data});
  //     }
  //   });
};

        // items: state.list.items.map(album => {
        //   if (album.id === action.payload.id) {
        //     const { ...albumCopy } = album
        //     return { ...albumCopy, name: action.payload.name }
        //   }
        //   return album
        // })
