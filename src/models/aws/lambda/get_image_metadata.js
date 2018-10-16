
import AWS from 'aws-sdk'
import { bucket } from '../../../config/config'

const lambda = new AWS.Lambda()
const s3 = new AWS.S3()

export function get(key) {

  return new Promise((resolve, reject) => {
    // Get S3 file metadata from lambda
    let params = {
      FunctionName: 'aws-album_get_image_metadata',
      Payload: '{"srcKey": "'+key+'", "bucket": "'+bucket+'"}'
    }

    lambda.invoke(params, (err, data) => {

      if (err)
        reject(err.message)

      const payload = JSON.parse(data.Payload)

      if (payload !== null && typeof payload === 'object')
        resolve(pretifyExifMeta(payload))

      else
        resolve(null)

    })

  })

}

function pretifyExifMeta(payload) {

  let meta = {}
  
  // make exif object
  if (payload.exif) {
    Object.keys(payload.exif).forEach((key) => {
      if (key == 'DateTimeOriginal') meta.datetime = convertExifDate(payload.exif[key])
      if (key == 'Flash') meta.flash = payload.exif[key]
      if (key == 'ISO') meta.iso = payload.exif[key]
    })
  }

  // make image object
  if (payload.image) {
    Object.keys(payload.image).forEach((key) => {

      const value = payload.image[key]

      // Cleanup make and model string from zeros /u00000
      if (key == 'Make') meta.make = value.replace(/\0/g, '')
      if (key == 'Model') meta.model = value.replace(/\0/g, '')
      if (key == 'Orientation') meta.orientation = value
    })
  }

  // make location object
  if (payload.gps
    && payload.gps.GPSLatitude
    && payload.gps.GPSLatitudeRef
    && payload.gps.GPSLongitude
    && payload.gps.GPSLongitudeRef
  ) {
    const { GPSLatitude, GPSLatitudeRef, GPSLongitude, GPSLongitudeRef } = payload.gps
    meta.location = dmsToDecimal(GPSLatitude, GPSLatitudeRef, GPSLongitude, GPSLongitudeRef)
  }

  return meta
}

function dmsToDecimal(lat, latRef, lon, lonRef) {

  const ref = {'N': 1, 'E': 1, 'S': -1, 'W': -1}
  const sep = [' ,', ' ', ',']
  let i

  if (typeof lat === 'string') {
    for (i = 0; i < sep.length; i++) {
      if (lat.split(sep[i]).length === 3) {
        lat = lat.split(sep[i])
        break
      }
    }
  }

  if (typeof lon === 'string') {
    for (i = 0; i < sep.length; i++) {
      if (lon.split(sep[i]).length === 3) {
        lon = lon.split(sep[i])
        break
      }
    }
  }

  for (i = 0; i < lat.length; i++) {
    if (typeof lat[i] === 'string') {
      lat[i] = lat[i].split('/')
      lat[i] = parseInt(lat[i][0], 10) / parseInt(lat[i][1], 10)
    }
  }

  for (i = 0; i < lon.length; i++) {
    if (typeof lon[i] === 'string') {
      lon[i] = lon[i].split('/')
      lon[i] = parseInt(lon[i][0], 10) / parseInt(lon[i][1], 10)
    }
  }

  lat = (lat[0] + (lat[1] / 60) + (lat[2] / 3600)) * ref[latRef]
  lon = (lon[0] + (lon[1] / 60) + (lon[2] / 3600)) * ref[lonRef]

  return { lat, lon }
}

// converts exif date to normal date
function convertExifDate(date) {
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
