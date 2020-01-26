import mongoose from 'mongoose'

import { AlbumStatus, MediaType } from '../enums'
import { ICreatedBy } from '../config'

/**
 * Media document type.
 */
export type MediaDocument = mongoose.Document & {
  readonly key: string
  readonly size: number
  readonly mime: string
  readonly type: MediaType
  createdBy: ICreatedBy
  readonly updatedAt: Date
  readonly createdAt: Date
  readonly width: number
  readonly height: number
  filename: string

  metadata: string[]
  objects: string[]
  text: string[]
  faces: string[]
}

/**
 * Media post body for create or update endpoints.
 */
export interface IMediaPostBody {
  filename?: string
}

/**
 * Media schema.
 */
const mediaSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: 'Media key is required',
    },
    body: String,
    status: {
      type: String,
      enum: Object.values(AlbumStatus),
      default: AlbumStatus.active,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: 'Media createdBy is required',
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
mediaSchema.index({ name: 'text' })

/**
 * Export media schema as model.
 */
export const Media = mongoose.model<MediaDocument>('Media', mediaSchema)
