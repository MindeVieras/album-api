
import AWS from 'aws-sdk'

import config from '../../../config/config'

const rekognition = new AWS.Rekognition()

export function describeCollection() {

  return new Promise((resolve, reject) => {

    const params = {
      CollectionId: 'faces_collection'
    }

    rekognition.describeCollection(params, (err, data) => {
      if (err) {
        reject(err.message)
      } else {
        resolve(data)
      }
    })
  })
}

export function getFaces(max = 4096, next = null) {

  return new Promise((resolve, reject) => {

    const params = {
      CollectionId: config.aws.facesCollection,
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

export function deleteFace(id) {

  return new Promise((resolve, reject) => {

    const params = {
      CollectionId: config.aws.facesCollection,
      FaceIds: [id]
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
