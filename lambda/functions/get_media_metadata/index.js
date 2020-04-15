const AWS = require('aws-sdk')
const ExifParser = require('exif-parser')

const s3 = new AWS.S3()

/**
 * Lambda function to get media metadata.
 *
 * @param {string} bucket
 *   The name of the bucket where media file is stored.
 * @param {string} key
 *   Key name of the object.
 *
 * @returns {object}
 *   Object including boolean 'success' key and a data object
 *   including metadata or error message if 'success' is false
 */
exports.handle = async function(input) {
  // Input keys.
  const { bucket, key } = input

  try {
    const s3Params = {
      Bucket: bucket,
      Key: key,
    }

    const { ContentType } = await s3.headObject(s3Params).promise()

    if (ContentType.includes('image') || ContentType.includes('video')) {
      // Get file buffer from S3.
      const s3File = await s3.getObject(s3Params).promise()

      // Handle images.
      if (ContentType.includes('image')) {
        // Parse exif data from images.
        const parser = ExifParser.create(s3File.Body)
        const { tags, imageSize } = parser.parse()
        return {
          success: true,
          data: {
            width: imageSize.width,
            height: imageSize.height,
            ...prepareExifTags(tags),
          },
        }
      }

      // Handle videos.
      return {
        success: true,
        data: 'Video meta goes here...',
      }
    }

    return { success: false, error: `Content type '${ContentType}' is invalid.` }
  } catch (error) {
    const message = error.message ? error.message : 'Cannot read an object from s3'
    return { success: false, error: message }
  }
}

/**
 * Helper function to format parsed exif data.
 *
 * @param {object} parsedExifData
 *   Exif data parsed from the image.
 * @return {object}
 *   Formatted exif data.
 */
function prepareExifTags(tags) {
  let meta = {}

  if (tags) {
    Object.keys(tags).forEach((key) => {
      const tag = tags[key]
      if (key === 'DateTimeOriginal') meta.timestamp = tag
      if (key === 'Flash') meta.flash = tag
      if (key === 'ISO') meta.iso = tag

      // Clean up make and model string from zeros /u00000
      if (key === 'Make') meta.make = tag.replace(/\0/g, '')
      if (key === 'Model') meta.model = tag.replace(/\0/g, '')
      if (key === 'Orientation') meta.orientation = tag
    })

    // Make location object.
    if (tags.GPSLatitude && tags.GPSLongitude) {
      const { GPSLatitude, GPSLongitude } = tags
      meta.location = { lat: GPSLatitude, lon: GPSLongitude }
      if (tags.GPSAltitude || tags.GPSAltitude === 0) {
        meta.location = { ...meta.location, alt: tags.GPSAltitude }
      }
      if (tags.GPSAltitudeRef || tags.GPSAltitudeRef === 0) {
        meta.location = { ...meta.location, altRef: tags.GPSAltitudeRef }
      }
    }
  }

  return meta
}
