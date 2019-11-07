
import path from 'path'
import AWS from 'aws-sdk'

import { config } from '../config'

const s3 = new AWS.S3()
const EXPIRE = 600 // 10mins

// Image url helper
export function img(key, size) {
  const thumbKey = 'thumbs/' + size + '/' + path.basename(key)

  const params = {
    Bucket: config.aws.bucket,
    Key: thumbKey,
    Expires: EXPIRE
  }

  return s3.getSignedUrl('getObject', params)

}

// Video url helper
export function video(key, size) {
  const videoKey = 'videos/' + size + '/' + path.basename(key)

  const params = {
    Bucket: config.aws.bucket,
    Key: videoKey,
    Expires: EXPIRE
  }

  return s3.getSignedUrl('getObject', params)

}

// Video thumbnail url helper
export function videoThumb(key, size) {
  const videoThumbKey = 'videos/thumbs/' + size + '/' + path.parse(key).name + '-00001.jpg'

  const params = {
    Bucket: config.aws.bucket,
    Key: videoThumbKey,
    Expires: EXPIRE
  }

  return s3.getSignedUrl('getObject', params)

}
