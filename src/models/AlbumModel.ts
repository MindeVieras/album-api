import mongoose, { Document, Schema, PaginateResult } from 'mongoose'

import { AlbumStatus, UserRoles } from 'album-api-config'

import { populateCreatedBy, populateMedia, ICreatedBy, IListQueryParams } from './'
import { IUserObject } from './UserModel'
import { IMediaObject, MediaDocument } from './MediaModel'

/**
 * Album object interface.
 */
export interface IAlbumObject {
  readonly id: string
  name: AlbumDocument['name']
  body?: AlbumDocument['body']
  status: AlbumDocument['status']
  createdBy: AlbumDocument['createdBy']
  readonly updatedAt: AlbumDocument['createdAt']
  readonly createdAt: AlbumDocument['updatedAt']
  media?: IMediaObject[]
}

/**
 * Album post body for create or update endpoints.
 */
export interface IAlbumInput {
  name?: AlbumDocument['name']
  body?: AlbumDocument['body']
  status?: AlbumDocument['status']
}

/**
 * Album document type.
 */
export type AlbumDocument = Document & {
  name: string
  body?: string
  status: AlbumStatus
  createdBy: ICreatedBy | string | null
  media?: MediaDocument[]
  readonly updatedAt: Date
  readonly createdAt: Date
  getList(
    authedUser: IUserObject,
    params?: IListQueryParams,
  ): Promise<PaginateResult<AlbumDocument>>
  create(authedUser: IUserObject, body: IAlbumInput): Promise<AlbumDocument>
  getOne(authedUser: IUserObject, id: string): Promise<AlbumDocument>
  updateOne(authedUser: IUserObject, id: string, body: IAlbumInput): Promise<AlbumDocument>
  delete(authedUser: IUserObject, ids: string[]): Promise<void>
}

/**
 * Album schema.
 */
const albumSchema = new Schema(
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
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: 'Album createdBy is required',
    },
    media: [{ type: Schema.Types.ObjectId, ref: 'Media' }],
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
 * Gets list of albums.
 *
 * @param {IUserObject} authedUser
 *   Authenticated user request.
 * @param {IListQueryParams} params
 *   List parameters.
 *
 * @returns {PaginateResult<AlbumDocument>}
 *   Mongoose pagination results including album documents.
 */
albumSchema.methods.getList = async function (
  authedUser: IUserObject,
  params: IListQueryParams = {},
): Promise<PaginateResult<AlbumDocument>> {
  const { limit, offset, sort, search, filters } = params
  let query = {}

  if (filters) {
    const filtersQuery = {} as { [name: string]: string }
    filters.split(';').map((f) => {
      const filter = f.split(':')
      filtersQuery[filter[0]] = filter[1]
    })
    query = filtersQuery
  }
  // Only admin users can list all albums.
  // Others can only list they own albums.
  if (authedUser.role !== UserRoles.admin) {
    query = { createdBy: authedUser.id }
  }
  if (search) {
    query = { $text: { $search: search }, ...query }
  }

  // Exclude trashed items.
  query = {
    ...query,
    status: { $ne: AlbumStatus.trashed },
  }

  return await Album.paginate(query, {
    select: '-media',
    populate: populateCreatedBy,
    offset,
    limit,
    sort,
  })
}

/**
 * Creates album.
 *
 * @param {IUserObject} authedUser
 *   Authenticated user request.
 * @param {IAlbumInput} body
 *   Album body to save.
 *
 * @returns {Promise<AlbumDocument>}
 *   Album document.
 */
albumSchema.methods.create = async function (
  authedUser: IUserObject,
  body: IAlbumInput,
): Promise<AlbumDocument> {
  // Save album to database.
  return await new Album({ ...body, createdBy: authedUser.id }).save()
}

/**
 * Gets album by id.
 *
 * @param {IUserObject} authedUser
 *   Authenticated user request.
 * @param {string} id
 *   Album document object id.
 *
 * @returns {Promise<AlbumDocument | null>}
 *   Album document or null.
 */
albumSchema.methods.getOne = async function (
  authedUser: IUserObject,
  id: string,
): Promise<AlbumDocument | null> {
  // Admin can access any album,
  // editor users can only access they own albums
  // and viewers can only access the albums created by its creator.
  let query = {}
  if (
    authedUser.role === UserRoles.viewer &&
    authedUser.createdBy &&
    typeof authedUser.createdBy === 'string'
  ) {
    query = { _id: authedUser.createdBy }
  } else if (authedUser.role === UserRoles.editor && typeof authedUser.createdBy === 'string') {
    query = { _id: id, createdBy: authedUser.id }
  } else {
    query = { _id: id }
  }

  const album = await Album.findOne(query)
    .populate(populateCreatedBy)
    .populate(populateMedia)

  return album
}

/**
 * Updates album by id.
 *
 * @param {IUserObject} authedUser
 *   Authenticated user request.
 * @param {string} id
 *   Album document object id.
 * @param {IAlbumInput} body
 *   Album body to save.
 *
 * @returns {Promise<AlbumDocument | null>}
 *   Updated album document or null.
 */
albumSchema.methods.updateOne = async function (
  authedUser: IUserObject,
  id: string,
  body: IAlbumInput,
): Promise<AlbumDocument | null> {
  const album = await Album.findById(id)
    .populate(populateCreatedBy)
    .populate(populateMedia)

  // // Handle username field,
  // // it can only by updated by an admin user.
  // if (body.username && authedUser.role === UserRoles.admin) {
  //   user.username = body.username
  // }

  // // Handle profile fields.
  // if (body.profile) {
  //   user.profile = { ...user.toObject().profile, ...body.profile }
  // }

  // await album.save()

  return album
}

/**
 * Deletes albums by id.
 *
 * @param {IUserObject} authedUser
 *   Authenticated user request.
 * @param {string[]} ids
 *   Array of album ids.
 *
 * @returns {Promise<void>}
 *   Empty promise.
 */
albumSchema.methods.delete = async function (authedUser: IUserObject, ids: string[]) {
  // Only admin can delete any album,
  // others can only delete they own albums.
  if (authedUser.role === UserRoles.admin) {
    await Album.deleteMany({ _id: { $in: ids } })
  } else {
    await Album.deleteMany({ _id: { $in: ids }, createdBy: authedUser.id })
  }
}

/**
 * Export album schema as model.
 */
export const Album = mongoose.model<AlbumDocument>('Album', albumSchema)
