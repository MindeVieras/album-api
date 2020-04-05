import mongoose, { PaginateResult } from 'mongoose'

import { AlbumStatus, UserRoles } from '../enums'
import { UserDocument } from './UserModel'
import { IRequestListQuery } from '../typings'
import { ApiErrorForbidden, ApiErrorNotFound } from '../helpers'
import { populateCreatedBy, ICreatedBy } from '../config'

/**
 * Album document type.
 */
export type AlbumDocument = mongoose.Document & {
  name: string
  body?: string
  status: AlbumStatus
  createdBy: ICreatedBy
  readonly updatedAt: Date
  readonly createdAt: Date
  getList(reqUser: UserDocument, params?: IRequestListQuery): Promise<PaginateResult<UserDocument>>
  create(reqUser: UserDocument, body: IAlbumPostBody): Promise<AlbumDocument>
  getOne(reqUser: UserDocument, id: string): Promise<AlbumDocument>
  updateOne(reqUser: UserDocument, id: string, body: IAlbumPostBody): Promise<AlbumDocument>
  delete(reqUser: UserDocument, ids: string[]): Promise<void>
}

/**
 * Album post body for create or update endpoints.
 */
export interface IAlbumPostBody {
  readonly name: string
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
 * Gets list of albums.
 *
 * @param {UserDocument} reqUser
 *   Authenticated user request.
 * @param {IRequestListQuery} params
 *   List parameters.
 *
 * @returns {PaginateResult<AlbumDocument>}
 *   Mongoose pagination results including album documents.
 */
albumSchema.methods.getList = async function(
  reqUser: UserDocument,
  params: IRequestListQuery = {},
): Promise<PaginateResult<AlbumDocument>> {
  if (!reqUser) {
    throw new ApiErrorForbidden()
  }

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
  if (reqUser.role !== UserRoles.admin) {
    query = { createdBy: reqUser.id }
  }
  if (search) {
    query = { $text: { $search: search }, ...query }
  }
  const albumPager = await Album.paginate(query, {
    populate: populateCreatedBy,
    offset,
    limit,
    sort,
  })
  // Mutate pagination response to include user virtual props.
  const docs: AlbumDocument[] = albumPager.docs.map((d) => d.toObject())

  return { ...albumPager, docs } as PaginateResult<AlbumDocument>
}

/**
 * Creates album.
 *
 * @param {UserDocument} reqUser
 *   Authenticated user request.
 * @param {IAlbumPostBody} body
 *   Album body to save.
 *
 * @returns {Promise<AlbumDocument>}
 *   Album document.
 */
albumSchema.methods.create = async function(
  reqUser: UserDocument,
  body: IAlbumPostBody,
): Promise<AlbumDocument> {
  if (!reqUser) {
    throw new ApiErrorForbidden()
  }
  // @ts-ignore
  const { password, role } = body

  // If role is provided,
  // make sure that only admin users
  // can create other admins.
  if (role && role === UserRoles.admin && reqUser.role !== UserRoles.admin) {
    throw new ApiErrorForbidden()
  }

  // Create user data object, set password as hash.
  // Actual hash is generated at the model level.
  const userDataToSave = { ...body, hash: password, createdBy: reqUser.id }

  // Save user to database.
  const album = new Album(userDataToSave)
  const savedAlbum = await album.save()

  return savedAlbum.toObject()
}

/**
 * Gets album by id.
 *
 * @param {UserDocument} reqUser
 *   Authenticated user request.
 * @param {string} id
 *   Album document object id.
 *
 * @returns {Promise<AlbumDocument>}
 *   Album document.
 */
albumSchema.methods.getOne = async function(
  reqUser: UserDocument,
  id: string,
): Promise<AlbumDocument> {
  if (!reqUser) {
    throw new ApiErrorForbidden()
  }

  // Admin can access any album,
  // editor users can only access they own albums
  // and viewers can only access the albums created by its creator.
  let query = {}
  if (reqUser.role === UserRoles.viewer && reqUser.createdBy) {
    query = { _id: reqUser.createdBy.id }
  } else if (reqUser.role === UserRoles.editor) {
    query = { _id: id, createdBy: reqUser.id }
  } else {
    query = { _id: id }
  }

  const album = await Album.findOne(query).populate(populateCreatedBy)

  // Throw 404 error if no album.
  if (!album) {
    throw new ApiErrorNotFound()
  }
  return album.toObject()
}

/**
 * Updates album by id.
 *
 * @param {UserDocument} reqUser
 *   Authenticated user request.
 * @param {string} id
 *   Album document object id.
 * @param {IAlbumPostBody} body
 *   Album body to save.
 *
 * @returns {Promise<AlbumDocument>}
 *   Updated album document.
 */
albumSchema.methods.updateOne = async function(
  reqUser: UserDocument,
  id: string,
  body: IAlbumPostBody,
): Promise<AlbumDocument> {
  if (!reqUser) {
    throw new ApiErrorForbidden()
  }

  const album = await Album.findById(id).populate(populateCreatedBy)

  // Throw 404 error if no album.
  if (!album) {
    throw new ApiErrorNotFound()
  }

  // // Handle username field,
  // // it can only by updated by an admin user.
  // if (body.username && reqUser.role === UserRoles.admin) {
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
 * @param {UserDocument} reqUser
 *   Authenticated user request.
 * @param {string[]} ids
 *   Array of album ids.
 *
 * @returns {Promise<void>}
 *   Empty promise.
 */
albumSchema.methods.delete = async function(reqUser: UserDocument, ids: string[]) {
  if (!reqUser) {
    throw new ApiErrorForbidden()
  }

  // Only admin can delete any album,
  // others can only delete they own albums.
  if (reqUser.role === UserRoles.admin) {
    await Album.deleteMany({ _id: { $in: ids } })
  } else {
    await Album.deleteMany({ _id: { $in: ids }, createdBy: reqUser.id })
  }
}

/**
 * Export album schema as model.
 */
export const Album = mongoose.model<AlbumDocument>('Album', albumSchema)
