
import AWS from 'aws-sdk'

import config from '../../../config/config'

const rekognition = new AWS.Rekognition()

export function detectFaces(key) {

  return new Promise((resolve, reject) => {

    const params = {
      Image: {
        S3Object: {
          Bucket: config.aws.bucket,
          Name: key
        }
      },
      Attributes: ['ALL']
    }

    rekognition.detectFaces(params, (err, data) => {
      if (err) {
        reject(err.message)
      } else {
        resolve(data)
      }
    })

  })
}
