
import AWS from 'aws-sdk'

import { bucket } from '../../../config/config'
import logger from '../../../config/winston'

const lambda = new AWS.Lambda()
const s3 = new AWS.S3()

export function get(key) {

  return new Promise((resolve, reject) => {

    // Get presigned url
    var url = s3.getSignedUrl('getObject', {
      Bucket: bucket,
      Key: key,
      Expires: 60
    })

    // Get S3 file metadata from lambda
    let params = {
      FunctionName: 'aws-album_get_video_metadata',
      Payload: '{"url": "'+url+'"}'
    }

    lambda.invoke(params, (err, data) => {

      if (err) {
        logger.error('lambda', {
          message: err.message
        })
        reject('Lambda error')
      }
      else {

        const payload = JSON.parse(data.Payload)

        if (payload !== null && typeof payload === 'object') {

          let meta = {}

          // make dimensions object
          payload.streams.forEach(row => {
            // if (row.codec_type == 'video') {
            //   meta.width = row.width
            //   meta.height = row.height
            // }
            if (row.width && row.height) {
              meta.width = row.width
              meta.height = row.height
            }
          })

          resolve(meta)
        }
        else {
          reject('Cannot get dimensions')
        }

      }

    })

  })
}
