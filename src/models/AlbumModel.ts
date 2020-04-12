import mongoose, { Document, Schema, PaginateResult } from 'mongoose'

import { AlbumStatus, UserRoles } from '../enums'
import { IUserObject } from './UserModel'
import { IMediaObject, MediaDocument } from './MediaModel'
import { IRequestListQuery } from '../typings'
import { ApiErrorForbidden, ApiErrorNotFound } from '../helpers'
import { populateCreatedBy, populateMedia, ICreatedBy } from '../config'

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
  getList(authedUser: IUserObject, params?: IRequestListQuery): Promise<PaginateResult<IUserObject>>
  create(authedUser: IUserObject, body: IAlbumInput): Promise<IAlbumObject>
  getOne(authedUser: IUserObject, id: string): Promise<IAlbumObject>
  updateOne(authedUser: IUserObject, id: string, body: IAlbumInput): Promise<IAlbumObject>
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
 * @param {IRequestListQuery} params
 *   List parameters.
 *
 * @returns {PaginateResult<IAlbumObject>}
 *   Mongoose pagination results including album objects.
 */
albumSchema.methods.getList = async function(
  authedUser: IUserObject,
  params: IRequestListQuery = {},
): Promise<PaginateResult<IAlbumObject>> {
  const { limit, offset, sort, search, filters } = params as IRequestListQuery
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
  const albumPager = await Album.paginate(query, {
    select: '-media',
    populate: populateCreatedBy,
    offset,
    limit,
    sort,
  })
  // Mutate pagination response to include user virtual props.
  const docs: IAlbumObject[] = albumPager.docs.map((d) => d.toObject())

  return { ...albumPager, docs } as PaginateResult<IAlbumObject>
}

/**
 * Creates album.
 *
 * @param {IUserObject} authedUser
 *   Authenticated user request.
 * @param {IAlbumInput} body
 *   Album body to save.
 *
 * @returns {Promise<IAlbumObject>}
 *   Album object.
 */
albumSchema.methods.create = async function(
  authedUser: IUserObject,
  body: IAlbumInput,
): Promise<IAlbumObject> {
  // @ts-ignore
  const { password, role } = body

  // If role is provided,
  // make sure that only admin users
  // can create other admins.
  if (role && role === UserRoles.admin && authedUser.role !== UserRoles.admin) {
    throw new ApiErrorForbidden()
  }

  // Create user data object, set password as hash.
  // Actual hash is generated at the model level.
  const userDataToSave = { ...body, hash: password, createdBy: authedUser.id }

  // Save user to database.
  const album = new Album(userDataToSave)
  const savedAlbum = await album.save()

  return savedAlbum.toObject()
}

/**
 * Gets album by id.
 *
 * @param {IUserObject} authedUser
 *   Authenticated user request.
 * @param {string} id
 *   Album document object id.
 *
 * @returns {Promise<IAlbumObject>}
 *   Album object.
 */
albumSchema.methods.getOne = async function(
  authedUser: IUserObject,
  id: string,
): Promise<IAlbumObject> {
  // console.log(authedUser)
  // Admin can access any album,
  // editor users can only access they own albums
  // and viewers can only access the albums created by its creator.
  let query = { _id: id }
  // if (authedUser.role === UserRoles.viewer && authedUser.createdBy) {
  //   query = { _id: authedUser.createdBy.id }
  // } else if (authedUser.role === UserRoles.editor) {
  //   query = { _id: id, createdBy: authedUser.id }
  // } else {
  //   query = { _id: id }
  // }

  const album = await Album.findOne(query)
    .populate(populateCreatedBy)
    .populate(populateMedia)

  // Throw 404 error if no album.
  if (!album) {
    throw new ApiErrorNotFound()
  }
  return album.toObject()
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
 * @returns {Promise<IAlbumObject>}
 *   Updated album object.
 */
albumSchema.methods.updateOne = async function(
  authedUser: IUserObject,
  id: string,
  body: IAlbumInput,
): Promise<IAlbumObject> {
  const album = await Album.findById(id).populate(populateCreatedBy)

  // Throw 404 error if no album.
  if (!album) {
    throw new ApiErrorNotFound()
  }

  // // Handle username field,
  // // it can only by updated by an admin user.
  // if (body.username && authedUser.role === UserRoles.admin) {
  //   user.username = body.username
  // }

  // // Handle profile fields.
  // if (body.profile) {
  //   user.profile = { ...user.toObject().profile, ...body.profile }
  // }

  await album.save()

  return album.toObject()
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
albumSchema.methods.delete = async function(authedUser: IUserObject, ids: string[]) {
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
