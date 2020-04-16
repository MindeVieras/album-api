import mongoose, { Document, Schema } from 'mongoose'
import httpStatus from 'http-status-codes'
import AWS from 'aws-sdk'

import { IUserObject } from './UserModel'
import { MediaStatus, MediaType, UserRoles } from '../enums'
import { ICreatedBy, populateCreatedBy, config } from '../config'
import { ApiErrorNotFound, ApiError, ApiErrorForbidden } from '../helpers'
import { Model } from 'mongoose'

/**
 * Media document type.
 */
export type MediaDocument = Document & {
  // Properties.
  readonly key: string
  name: string
  readonly size: number
  readonly mime: string
  readonly type: MediaType
  status: MediaStatus
  createdBy: ICreatedBy | string | null
  readonly updatedAt: Date
  readonly createdAt: Date
  metadata: {
    width: number
    height: number
    timestamp?: number
    flash?: number
    iso?: number
    make?: string
    model?: string
    orientation?: number
    location?: {
      alt?: number
      altRef: number
      lat?: number
      lon?: number
    }
  }
  // Methods.
  getOne(authedUser: IUserObject, id: string): Promise<MediaDocument>
  create(authedUser: IUserObject, body: IMediaInput): Promise<MediaDocument>
}

/**
 * Media model definition.
 */
export interface IMediaModel extends Model<MediaDocument> {
  // Statics.
  getNewMetadata(key: MediaDocument['key']): Promise<MediaDocument['metadata']>
}

/**
 * Media object interface.
 */
export interface IMediaObject {
  id: string
  readonly key: MediaDocument['key']
  name: MediaDocument['name']
  readonly size: MediaDocument['size']
  readonly mime: MediaDocument['mime']
  readonly type: MediaDocument['type']
  status: MediaDocument['status']
  createdBy: MediaDocument['createdBy']
  readonly updatedAt: MediaDocument['createdAt']
  readonly createdAt: MediaDocument['updatedAt']
  metadata: MediaDocument['metadata']
}

/**
 * Media input props for create or update endpoints.
 */
export interface IMediaInput {
  key: MediaDocument['key']
  name: MediaDocument['name']
  size: MediaDocument['size']
  mime: MediaDocument['mime']
}

const lambda = new AWS.Lambda()

/**
 * Media schema.
 */
const mediaSchema = new Schema(
  {
    key: {
      type: String,
      required: 'Media key is required',
      unique: [true, 'Media key must be unique'],
    },
    name: {
      type: String,
      required: 'Media file name is required',
    },
    size: {
      type: Number,
      required: 'Media file size is required',
    },
    mime: {
      type: String,
      required: 'Media mime type is required',
    },
    status: {
      type: String,
      enum: Object.values(MediaStatus),
      default: MediaStatus.active,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: 'Media createdBy is required',
    },
    metadata: {
      type: Object,
    },
  },
  {
    collection: 'Media',
    timestamps: true,
    toObject: {
      virtuals: true,
      transform: (_, ret) => {
        delete ret._id
        delete ret.__v
      },
    },
  },
)

/**
 * Set text indexes for search.
 */
mediaSchema.index({ filename: 'text' })

/**
 * Run middleware before media is saved.
 */
mediaSchema.pre('save', async function(next) {
  const media = this as MediaDocument

  try {
    // Check for duplicate media key,
    // throw an error if media key already exists.
    const mediaKeyExists = await Media.findOne({ key: media.key })
    if (mediaKeyExists) {
      throw new ApiError(`Media key '${media.key}' already exists`, httpStatus.CONFLICT)
    }

    next()
  } catch (err) {
    return next(err)
  }
})

/**
 * Gets media by id.
 *
 * @param {IUserObject} authedUser
 *   Authenticated user request.
 * @param {string} id
 *   Media document object id.
 *
 * @returns {Promise<MediaDocument>}
 *   Media document.
 */
mediaSchema.methods.getOne = async function(
  authedUser: IUserObject,
  id: string,
): Promise<MediaDocument> {
  let query = { _id: id }
  const media = await Media.findOne(query).populate(populateCreatedBy)

  // Throw 404 error if no media.
  if (!media) {
    throw new ApiErrorNotFound()
  }
  return media
}

/**
 * Creates media.
 *
 * @param {IUserObject} authedUser
 *   Authenticated user request.
 * @param {IMediaInput} body
 *   Media body to save.
 *
 * @returns {Promise<MediaDocument>}
 *   Media document.
 */
mediaSchema.methods.create = async function(
  authedUser: IUserObject,
  body: IMediaInput,
): Promise<MediaDocument> {
  // Viewers are forbidden to create media.
  if (authedUser.role === UserRoles.viewer) {
    throw new ApiErrorForbidden()
  }

  // Get media metadata.
  const metadata = await Media.getNewMetadata(body.key)

  // Create media data object.
  const mediaDataToSave = {
    ...body,
    createdBy: authedUser.id,
    metadata,
  }

  // Save media to database.
  const media = new Media(mediaDataToSave)
  const savedMedia = await media.save()

  return savedMedia
}

interface ILambdaGetMediaMetadataResponse {
  success: boolean
  data: MediaDocument['metadata']
  error?: string
}

/**
 * Gets media metadata by invoking Lambda.
 *
 * @param {MediaDocument['key']} key
 *   The key of the file on S3.
 *
 * @returns {Promise<MediaDocument['metadata']>}
 *   Promise including metadata object.
 */
mediaSchema.statics.getNewMetadata = async function(
  key: MediaDocument['key'],
): Promise<MediaDocument['metadata']> {
  try {
    let params = {
      FunctionName: 'aws-album_get_media_metadata',
      Payload: `{"key": "${key}", "bucket": "${config.aws.bucket}"}`,
    }
    const lambdaResponse = await lambda.invoke(params).promise()

    if (typeof lambdaResponse.Payload === 'string') {
      const { success, error, data }: ILambdaGetMediaMetadataResponse = JSON.parse(
        lambdaResponse.Payload,
      )
      if (error) {
        throw new Error(error)
      }
      if (success) {
        return data
      }
    }

    throw new Error('Lambda function must return json encoded string')
  } catch (error) {
    return error
  }
}

/**
 * Media virtual field 'type'.
 *
 * @returns {MediaType}
 *   Readable media type parsed from the mime type.
 */
mediaSchema.virtual('type').get(function(this: MediaDocument): MediaType {
  const mime = this.mime
  if (mime.includes(MediaType.image)) {
    return MediaType.image
  } else if (mime.includes(MediaType.video)) {
    return MediaType.video
  }
  return MediaType.unknown
})

/**
 * Export media schema as model.
 */
export const Media: IMediaModel = mongoose.model<MediaDocument, IMediaModel>('Media', mediaSchema)
