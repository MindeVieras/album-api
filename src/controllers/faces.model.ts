
import { Database } from '../db'

import { describeCollection, getFaces, deleteFace } from './aws/rekognition/collection'
import { detectFaces } from './aws/rekognition/faces'

import { jsonResponse } from '../helpers'

let conn = new Database()

// Detect faces in image
export function detectImageFaces(req, res) {

  const { id } = req.params

  let faces

  conn.query(`SELECT s3_key FROM media WHERE id = ?`, id)
    .then(rows => {
      // @ts-ignore
      if (rows.length) {

        const { s3_key } = rows[0]

        return detectFaces(s3_key)
      }
      else {
        throw 'No such media'
      }
    })

    .then(recognitionFaces => {

      res.json({ ack: 'ok', msg: 'Faces detected', data: recognitionFaces })
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
    .catch(err => {
      let msg = err.sqlMessage ? err.sqlMessage : err
      res.json({ ack: 'err', msg })
    })
}


/**
 * @api {get} /faces/collection Get list
 * @apiName GetFacesCollection
 * @apiGroup Faces
 * 
 * @apiPermission authed
 *
 * @apiSuccess {String}   status                  Response status
 * @apiSuccess {Object}   data                    Response data
 * @apiSuccess {Number}   data.total                Total faces in collection
 * @apiSuccess {String}   data.version              Collection model version
 * @apiSuccess {Object[]} data.faces                List of faces (Array of Objects)
 * @apiSuccess {String}   data.faces.FaceId           Face id
 * @apiSuccess {Object}   data.faces.BoundingBox      Face bounding box points
 * @apiSuccess {Object}   data.faces.BoundingBox.Width  Bounding box width
 * @apiSuccess {Object}   data.faces.BoundingBox.Height Bounding box height
 * @apiSuccess {Object}   data.faces.BoundingBox.Left   Bounding box left position
 * @apiSuccess {Object}   data.faces.BoundingBox.Top    Bounding box top position
 * @apiSuccess {String}   data.faces.ImageId          Image id
 * @apiSuccess {String}   data.faces.ExternalImageId  External Id, used as S3 key
 * @apiSuccess {Number}   data.faces.Confidence       Float, 0-100%
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": "success",
 *       "data": {
 *          total: 123,
 *          cersion: "1.0",
 *          faces: [
 *            {
 *              "FaceId": ""4a9574d5-7e9d-5b82-9671-9aaa8e09cfb7"",
 *              "BoundingBox": {
 *                  "Width": 0.17777800559997559,
 *                  "Height": 0.31422901153564453,
 *                  "Left": 0.28444400429725647,
 *                  "Top": 0.3972330093383789
 *              },
 *              "ImageId": "73767353-e046-5a2c-91bd-f7c3198caf1c",
 *              "ExternalImageId": "1508640546629-959637.jpg",
 *              "Confidence": 99.98970031738281
 *            },
 *            ...
 *          ]       
 *        }
 *     }
 *
 */
export function getCollectionFaces(req, res) {

  let collection

  describeCollection()
    .then(coll => {
      collection = coll
      return getFaces()
    })
    .then(faces => {

      let data = {
        total: collection.FaceCount,
        version: collection.FaceModelVersion,
        faces
      }

      jsonResponse.success(res, data)
    })
    .catch(err => {
      jsonResponse.error(res, err, 404)
    })
}

// Deletes faces from collection
export function deleteCollectionFace(req, res) {

  const { id } = req.params

  deleteFace(id)
    .then(face => {
      res.json({ ack: 'ok', msg: 'Face deleted', data: face })
    })
    .catch(err => {
      res.json({ ack: 'err', msg: err })
    })
}
