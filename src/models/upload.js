
const connection = require('../config/db');

// Uploads file
exports.upload = function(req, res){
  if (req.files) {
    const { id } = req.app.get('user')
    const file = req.files[0];
    const uuid = req.body.qquuid;
    const author = id;
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
  
}
