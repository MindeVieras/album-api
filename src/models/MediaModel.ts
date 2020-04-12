import mongoose, { Document, Schema } from 'mongoose'

import { MediaStatus, MediaType } from '../enums'
import { ICreatedBy } from '../config'

/**
 * Media object interface.
 */
export interface IMediaObject {
  id: string
  readonly key: MediaDocument['key']
  filename: MediaDocument['filename']
  readonly filesize: MediaDocument['filesize']
  readonly mimeType: MediaDocument['mimeType']
  status: MediaDocument['status']
  createdBy: MediaDocument['createdBy']
  readonly width: MediaDocument['width']
  readonly height: MediaDocument['height']
  readonly updatedAt: MediaDocument['createdAt']
  readonly createdAt: MediaDocument['updatedAt']
}

/**
 * Media document type.
 */
export type MediaDocument = Document & {
  readonly key: string
  filename: string
  readonly filesize: number
  readonly mimeType: string
  readonly type: MediaType
  status: MediaStatus
  createdBy: ICreatedBy | string | null
  readonly width: number
  readonly height: number
  readonly ratio: string
  readonly updatedAt: Date
  readonly createdAt: Date
}

/**
 * Media post body for create or update endpoints.
 */
// export interface IMediaPostBody {
//   filename?: string
// }

/**
 * Media schema.
 */
const mediaSchema = new Schema(
  {
    key: {
      type: String,
      required: 'Media key is required',
    },
    filename: {
      type: String,
      required: 'Media file name is required',
    },
    filesize: {
      type: Number,
      required: 'Media file size is required',
    },
    mimeType: {
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
    width: {
      type: Number,
      required: 'Media width is required',
    },
    height: {
      type: Number,
      required: 'Media height is required',
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
 * Export media schema as model.
 */
export const Media = mongoose.model<MediaDocument>('Media', mediaSchema)
