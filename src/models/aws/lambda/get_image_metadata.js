
import AWS from 'aws-sdk'
import ratio from 'aspect-ratio'
import { bucket } from '../../../config/config'

AWS.config.loadFromPath('./aws-keys.json')
const lambda = new AWS.Lambda()
const s3 = new AWS.S3()

export function get(key, cb){
  
  // Get S3 file metadata from lambda
  let params = {
    FunctionName: 'aws-album_get_image_metadata',
    Payload: '{"srcKey": "'+key+'", "bucket": "'+bucket+'"}'
  };

  lambda.invoke(params, (err, data) => {

    if (err) cb(err.message)

    const payload = JSON.parse(data.Payload)

    if (payload !== null && typeof payload === 'object') {

      let meta = new Object()
      // make exif object
      Object.keys(payload.exif).forEach((key) => {
        if (key == 'DateTimeOriginal') meta.datetime = convertExifDate(payload.exif[key])
        if (key == 'ExifImageWidth') meta.width = payload.exif[key]
        if (key == 'ExifImageHeight') meta.height = payload.exif[key]
        if (key == 'Flash') meta.flash = payload.exif[key]
        if (key == 'ISO') meta.iso = payload.exif[key]
      })

      // make image object
      Object.keys(payload.image).forEach((key) => {
        if (key == 'Make') meta.make = payload.image[key]
        if (key == 'Model') meta.model = payload.image[key]
        if (key == 'Orientation') meta.orientation = payload.image[key]
      })
      if (meta.width && meta.height) {
        meta.aspect = ratio(meta.width, meta.height)
      }

      cb(null, meta)
    }
    else {
      // Get presigned url
      var url = s3.getSignedUrl('getObject', {
        Bucket: bucket,
        Key: key,
        Expires: 10
      })
      // console.log(url)
      // Get S3 file metadata from lambda
      let params = {
        FunctionName: 'aws-album_get_video_metadata',
        Payload: '{"url": "'+url+'"}'
      }

      lambda.invoke(params, function(err, data) {
          
        if (err) cb(err)
        
        var payload = JSON.parse(data.Payload)

        if (payload !== null && typeof payload === 'object') {

          let meta = new Object()

          // make meta object
          payload.streams.forEach(function (row) {
            if (row.width && row.height) {
              meta.width = row.width
              meta.height = row.height
              meta.aspect = ratio(row.width, row.height)
            }
          })
          
          cb(null, meta)
        }
        else {
          cb('No Meta found')
        }
      })
    }

  })

}

// converts exif date to normal date
function convertExifDate(date){
  if(date){
    let newDateTime
    let dateTime = date.split(' ')
    let regex = new RegExp(':', 'g')
    dateTime[0] = dateTime[0].replace(regex, '-')
    if(typeof date === 'undefined' || !date){
      newDateTime = ''
    } else {
      newDateTime = dateTime[0] + ' ' + dateTime[1]
    }
    return newDateTime
  } else {
    return date
  }
}
