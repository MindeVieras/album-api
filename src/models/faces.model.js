
import { Database } from '../db'

import { getFaces, deleteFace } from './aws/rekognition/collection'
import { detectFaces } from './aws/rekognition/faces'

let conn = new Database()

// Detect faces in image
export function detectImageFaces(req, res) {
  
  const { id } = req.params

  let faces

  conn.query(`SELECT s3_key FROM media WHERE id = ?`, id)
    .then( rows => {
      if (rows.length) {

        const { s3_key } = rows[0]

        return detectFaces(s3_key)
      }
      else {
        throw 'No such media'
      }
    })

    .then(recognitionFaces => {

      res.json({ack:'ok', msg: 'Faces detected', data: recognitionFaces})
      // // if recognition faces found
      // if (recognitionFaces.length > 0) {

      //   // set faces
      //   faces = recognitionFaces

      //   // Delete old text before save
      //   // return conn.query(`DELETE FROM rekognition_text WHERE media_id = ?`, media_id)
      // }

      // else throw `No text found`
    })
  //   .then(() => {
      
  //     // make values array for db
  //     let values = text.map(t => {
        
  //       const { BoundingBox, Polygon } = t.Geometry
  //       return [
  //         media_id, t.Id, t.ParentId, t.Type, t.DetectedText, t.Confidence,
  //         BoundingBox.Width, BoundingBox.Height, BoundingBox.Top, BoundingBox.Left,
  //         Polygon[0].X, Polygon[0].Y, Polygon[1].X, Polygon[1].Y,
  //         Polygon[2].X, Polygon[2].Y, Polygon[3].X, Polygon[3].Y
  //       ]
  //     })

  //     // Insert text to DB
  //     const sql = `INSERT INTO rekognition_text
  //                   (
  //                     media_id, text_id, text_parent_id, type, text, confidence,
  //                     bbox_width, bbox_height, bbox_top, bbox_left,
  //                     p1_x, p1_y, p2_x, p2_y, p3_x, p3_y, p4_x, p4_y
  //                   )
  //                 VALUES ?`
  //     return conn.query(sql, [values])
      
  //   })
    // .then(() => {

    //   // Make object for return
    //   let rekognition_text = {}
    //   text.map(t => {
    //     rekognition_text['ack'] = 'ok'
    //     rekognition_text['Valio'] = 0.23
    //   })
      
    //   res.json({ack:'ok', msg: 'Rekognition Labels saved', rekognition_text})
    // })
    .catch( err => {
      let msg = err.sqlMessage ? err.sqlMessage : err
      res.json({ack:'err', msg})
    })
}

// Gets faces from rekognition collection
export function getCollectionFaces(req, res) {

  getFaces()
    .then(faces => {
      res.json({ack:'ok', msg: 'Faces list', data: faces})
    })
    .catch( err => {
      res.json({ack:'err', msg: err})
    })
}

// Deletes faces from collection
export function deleteCollectionFace(req, res) {
  
  const { id } = req.params
  
  deleteFace(id)
    .then(face => {
      res.json({ack:'ok', msg: 'Face deleted', data: face})
    })
    .catch( err => {
      res.json({ack:'err', msg: err})
    })
}
