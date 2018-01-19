
const connection = require('../config/db');

// Uploads file
exports.upload = function(req, res){
  
  if (req.files) {

    const file = req.files[0];
    const uuid = req.body.qquuid;
    const author = req.body.author;
    const entity = req.body.entity;
    const entity_id = req.body.entity_id;
    const status = req.body.status;

    let fileData = {
      uuid: uuid,
      s3_key: file.key,
      mime: file.mimetype,
      filesize: file.size,
      org_filename: file.originalname,
      entity: parseInt(entity),
      entity_id: parseInt(entity_id),
      status: parseInt(status),
      author: parseInt(author),
      weight: 0
    };
    // Insert file data to media table
    connection.query('INSERT INTO media set ? ', fileData, function(err, rows){
      if(err) {
        res.json({error: err.sqlMessage});
      } else {
        fileData.media_id = rows.insertId;
        res.json({success: true, data: fileData});
      }
    });
    
  } else {
    res.json({error: 'No file'});
  }
  
};

exports.getInitialFiles = function(req, res) {
  // Get all media
  const entity_id = req.params.id;
  const status = 1; // Media status ENABLED
  connection.query(`SELECT
                      m.*,
                      GROUP_CONCAT(DISTINCT '"', mm.meta_name, '":"', mm.meta_value, '"') AS metadata,
                      GROUP_CONCAT(DISTINCT '"', rl.label, '":', rl.confidence) AS rekognition_labels
                    FROM media AS m
                      LEFT JOIN media_meta AS mm ON mm.media_id = m.id
                      LEFT JOIN rekognition AS rl ON rl.media_id = m.id
                    WHERE m.entity_id = ? AND m.status = ?
                    GROUP BY m.id`, [entity_id, status], function(err, rows){
    if(err) {
      res.json({ack:'err', msg: err.sqlMessage});
    } else {
      let media = [];
      rows.forEach(function(m){
        // If Image
        if (m.mime.includes('image')) {        
          // Metadata
          let metadata = {ack:'err', msg:'No metadata'};
          if (m.metadata) {
            metadata = JSON.parse('{'+m.metadata+'}');
            metadata.ack = 'ok';
          };
          // Rekognition Labels
          let rekognition_labels = {ack:'err', msg:'No rokognition labels found'};
          if (m.rekognition_labels) {
            rekognition_labels = JSON.parse('{'+m.rekognition_labels+'}');
            rekognition_labels.ack = 'ok';
          };

          // media file
          media.push({
            uuid: m.uuid,
            media_id: m.id,
            name: m.org_filename,
            size: m.filesize,
            mime: 'image',
            thumbnailUrl: require('../helpers/media').img(m.s3_key, 'thumb'),
            metadata,
            rekognition_labels,
            thumbs: {ack:'ok'}
          });
        }
        // If Video
        else if (m.mime.includes('video')) {        
          // Metadata
          let metadata = {ack:'err', msg:'No metadata'};
          if (m.metadata) {
            metadata = JSON.parse('{'+m.metadata+'}');
            metadata.ack = 'ok';
          };
          // Rekognition Labels
          let rekognition_labels = {ack:'err', msg:'No rokognition labels found'};
          if (m.rekognition_labels) {
            rekognition_labels = JSON.parse('{'+m.rekognition_labels+'}');
            rekognition_labels.ack = 'ok';
          };

          // media file
          media.push({
            uuid: m.uuid,
            media_id: m.id,
            name: m.org_filename,
            size: m.filesize,
            mime: 'video',
            //thumbnailUrl: require('../helpers/media').video(m.s3_key, 'medium'),
            metadata,
            rekognition_labels,
            videos: {ack:'ok', video: require('../helpers/media').video(m.s3_key, 'medium')}
          });
        }
      });
      res.json(media);
    }
  });
}