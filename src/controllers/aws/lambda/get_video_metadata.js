
import AWS from 'aws-sdk'
import ratio from 'aspect-ratio'
import { bucket } from '../../../config/config'

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
        return reject(err.message)
      }

      const payload = JSON.parse(data.Payload)

      if (payload !== null && typeof payload === 'object') {

        let meta = {}

        // make meta object
        payload.streams.forEach(row => {
          if (row.codec_type == 'video') {
            meta.width = row.width
            meta.height = row.height
            meta.duration = parseFloat(row.duration)
            meta.frame_rate = eval(row.r_frame_rate)
            meta.codec = row.codec_name
            if (row.width && row.height) {
              meta.aspect = ratio(row.width, row.height)
            }
            if (row.tags && 'creation_time' in row.tags) meta.datetime = row.tags.creation_time
          }
        })

        resolve(meta)
      }
      else {
        return reject('No Meta found')
      }

    })

  })
}
