import mongoose from 'mongoose'
import mongoosePaginate from 'mongoose-paginate'

import { AlbumStatus } from '../enums'
import { UserDocument } from './UserModel'

/**
 * Album document type.
 */
export type AlbumDocument = mongoose.Document & {
  name: string
  body?: string
  status: AlbumStatus
  readonly createdBy: UserDocument
  readonly updatedAt: Date
  readonly createdAt: Date
}

/**
 * Album post body for create or update endpoints.
 */
export interface IAlbumPostBody {
  readonly name?: string
  readonly body?: string
  readonly status?: AlbumStatus
}

/**
 * Album schema.
 */
const albumSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: 'Album name is required',
      minlength: 1,
      maxlength: 50,
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
      required: 'Album createdBy is required',
    },
  },
  {
    collection: 'Albums',
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
albumSchema.index({ name: 'text' })

/**
 * Add mongoose-paginate plugin.
 */
albumSchema.plugin(mongoosePaginate)

/**
 * Export album schema as model.
 */
export const Album = mongoose.model<AlbumDocument>('Album', albumSchema)
