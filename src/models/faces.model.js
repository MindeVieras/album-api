
import { getFaces, deleteFace } from './aws/rekognition/collection'

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
