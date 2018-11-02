
import AWS from 'aws-sdk'

import { faces_collection } from '../../../config/config'

const rekognition = new AWS.Rekognition()

export function getFaces(max = 4096, next = null){

  return new Promise((resolve, reject) => {

    const params = {
      CollectionId: faces_collection,
      MaxResults: max,
      NextToken: null
    }

    rekognition.listFaces(params, (err, data) => {
      if (err) {
        reject(err.message)
      } else {
        resolve(data.Faces)
      }
    })
  })
}

export function deleteFace(id){

  return new Promise((resolve, reject) => {

    const params = {
      CollectionId: faces_collection,
      FaceIds: [ id ]
    }
    
    rekognition.deleteFaces(params, (err, data) => {
      if (err) {
        reject(err.message)
      } else {
        resolve(data.DeletedFaces)
      }
    })
  })
}
