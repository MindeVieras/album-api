import bcrypt from 'bcryptjs'
import mongoose, { Document, Schema, PaginateResult } from 'mongoose'
import httpStatus from 'http-status-codes'

import { UserRoles, UserStatus } from '../enums'
import { makeInitials, ApiError, ApiErrorForbidden, ApiErrorNotFound } from '../helpers'
import { IRequestListQuery } from '../typings'
import { populateCreatedBy, ICreatedBy } from '../config'

/**
 * User object interface.
 */
export interface IUserObject {
  id: string
  username: UserDocument['username']
  readonly initials: UserDocument['initials']
  role: UserDocument['role']
  status: UserDocument['status']
  createdBy: UserDocument['createdBy']
  lastLogin?: UserDocument['lastLogin']
  readonly updatedAt: UserDocument['updatedAt']
  readonly createdAt: UserDocument['createdAt']
  profile?: UserDocument['profile']
}

/**
 * User post body for create or update endpoints.
 */
export interface IUserInput {
  username?: UserDocument['username']
  password?: string
  role?: UserDocument['role']
  status?: UserDocument['status']
  profile?: UserDocument['profile']
}

/**
 * User document type.
 */
export type UserDocument = Document & {
  username: string
  hash: string
  readonly initials: string
  role: UserRoles | UserRoles[]
  status: UserStatus
  createdBy: ICreatedBy | string | null
  lastLogin?: Date
  readonly updatedAt: Date
  readonly createdAt: Date
  setLastLogin(date?: Date): void
  comparePassword(password: string): Promise<boolean>
  getList(authedUser: IUserObject, params?: IRequestListQuery): Promise<PaginateResult<IUserObject>>
  create(authedUser: IUserObject, body: IUserInput): Promise<IUserObject>
  getOne(authedUser: IUserObject, id: string): Promise<IUserObject>
  updateOne(authedUser: IUserObject, id: string, body: IUserInput): Promise<IUserObject>
  delete(authedUser: IUserObject, ids: string[]): Promise<void>
  profile?: {
    email?: string
    displayName?: string
    locale?: string
  }
}

/**
 * User schema.
 */
const userSchema = new Schema(
  {
    username: {
      type: String,
      required: 'Username is required',
      unique: [true, 'Username must be unique'],
      minlength: 4,
      maxlength: 30,
    },
    hash: {
      type: String,
      required: 'Password is required',
    },
    role: {
      type: String,
      enum: Object.values(UserRoles),
      default: UserRoles.viewer,
    },
    status: {
      type: String,
      enum: Object.values(UserStatus),
      default: UserStatus.active,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: 'User createdBy is required',
    },
    lastLogin: Date,
    profile: {
      email: String,
      displayName: {
        type: String,
        maxlength: 55,
      },
      locale: String,
    },
  },
  {
    collection: 'Users',
    timestamps: true,
    toObject: {
      virtuals: true,
      transform: (_, ret) => {
        delete ret._id
        delete ret.hash
        delete ret.__v
      },
    },
  },
)

/**
 * Set text indexes for search.
 */
userSchema.index({ username: 'text', role: 'text' })

/**
 * Run middleware before user is saved.
 */
userSchema.pre('save', async function(next) {
  const user = this as UserDocument

  if (!user.isModified('hash')) {
    return next()
  }

  try {
    // Check for duplicate username and email,
    // throw an error if user already exists.
    const userExists = await User.findOne({ username: user.username })
    if (userExists) {
      throw new ApiError(`User '${user.username}' already exists`, httpStatus.CONFLICT)
    }

    // Generate a salt.
    const salt = await bcrypt.genSalt(10)
    // Hash the password using our new salt.
    user.hash = await bcrypt.hash(user.hash, salt)
    next()
  } catch (err) {
    return next(err)
  }
})

/**
 * User password comparison method.
 *
 * @param {string} password
 *   Password to compare against saved hash.
 *
 * @returns {Promise<boolean>}
 *   Whether password match or not.
 */
userSchema.methods.comparePassword = function(password: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    bcrypt.compare(password, this.hash, (err, isMatch) => {
      if (err) {
        return reject(err)
      }
      return resolve(isMatch)
    })
  })
}

/**
 * Sets last login date for the user.
 *
 * Makes native mongo query to prevent mongoose
 * for updating 'updatedAt' field.
 *
 * @param {Date} date
 *   Optional last login date to be set.
 */
userSchema.methods.setLastLogin = function(date: Date = new Date()): void {
  User.collection.updateOne(
    { _id: this._id },
    {
      $set: {
        lastLogin: date,
      },
    },
  )
}

/**
 * Gets list of users.
 *
 * @param {IUserObject} authedUser
 *   Authenticated user request.
 * @param {IRequestListQuery} params
 *   List parameters.
 *
 * @returns {PaginateResult<IUserObject>}
 *   Mongoose pagination results including user documents.
 */
userSchema.methods.getList = async function(
  authedUser: IUserObject,
  params: IRequestListQuery = {},
): Promise<PaginateResult<IUserObject>> {
  const { limit, offset, sort, search, filters } = params
  let query = {}

  if (filters) {
    const filtersQuery: { [name: string]: string } = {}
    filters.split(';').map((f) => {
      const filter = f.split(':')
      filtersQuery[filter[0]] = filter[1]
    })
    query = filtersQuery
  }
  // Only admin users can list all users.
  // Others can only list they own users.
  if (authedUser.role !== UserRoles.admin) {
    query = { createdBy: authedUser.id }
  }
  if (search) {
    query = { $text: { $search: search }, ...query }
  }
  const userPager = await User.paginate(query, {
    populate: populateCreatedBy,
    offset,
    limit,
    sort,
  })
  // Mutate pagination response to include user virtual props.
  const docs: IUserObject[] = userPager.docs.map((d) => d.toObject())

  return { ...userPager, docs } as PaginateResult<IUserObject>
}

/**
 * Creates user.
 *
 * @param {IUserObject} authedUser
 *   Authenticated user request.
 * @param {IUserInput} body
 *   User body to save.
 *
 * @returns {Promise<IUserObject>}
 *   User document.
 */
userSchema.methods.create = async function(
  authedUser: IUserObject,
  body: IUserInput,
): Promise<IUserObject> {
  const { password, role } = body

  // Remove password from request as soon as possible.
  delete body.password

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
  const user = new User(userDataToSave)
  const savedUser = await user.save()

  return savedUser.toObject()
}

/**
 * Gets user by id.
 *
 * @param {IUserObject} authedUser
 *   Authenticated user request.
 * @param {string} id
 *   User document object id.
 *
 * @returns {Promise<IUserObject>}
 *   User document.
 */
userSchema.methods.getOne = async function(
  authedUser: IUserObject,
  id: string,
): Promise<IUserObject> {
  // Admin can access any user,
  // editor users can only access they own users
  // and viewers can only access own user.
  let query = {}
  if (authedUser.role === UserRoles.viewer) {
    query = { _id: authedUser.id }
  } else if (authedUser.role === UserRoles.editor) {
    query = { _id: id, createdBy: authedUser.id }
  } else {
    query = { _id: id }
  }

  const user = await User.findOne(query).populate(populateCreatedBy)
  // Throw 404 error if no user.
  if (!user) {
    throw new ApiErrorNotFound()
  }
  return user.toObject()
}

/**
 * Updates user by id.
 *
 * @param {IUserObject} authedUser
 *   Authenticated user request.
 * @param {string} id
 *   User document object id.
 * @param {IUserInput} body
 *   User body to save.
 *
 * @returns {Promise<IUserObject>}
 *   Updated user document.
 */
userSchema.methods.updateOne = async function(
  authedUser: IUserObject,
  id: string,
  body: IUserInput,
): Promise<IUserObject> {
  const user = await User.findById(id).populate(populateCreatedBy)

  // Throw 404 error if no user.
  if (!user) {
    throw new ApiErrorNotFound()
  }

  // Handle username field,
  // it can only by updated by an admin user.
  if (body.username && authedUser.role === UserRoles.admin) {
    user.username = body.username
  }

  // Handle profile fields.
  if (body.profile) {
    user.profile = { ...user.toObject().profile, ...body.profile }
  }

  await user.save()

  return user.toObject()
}

/**
 * Deletes users by id.
 *
 * @param {IUserObject} authedUser
 *   Authenticated user request.
 * @param {string[]} ids
 *   Array of user ids.
 *
 * @returns {Promise<void>}
 *   Empty promise.
 */
userSchema.methods.delete = async function(authedUser: IUserObject, ids: string[]) {
  // Only admin can delete any user,
  // others can only delete they own users.
  if (authedUser.role === UserRoles.admin) {
    await User.deleteMany({ _id: { $in: ids } })
  } else {
    await User.deleteMany({ _id: { $in: ids }, createdBy: authedUser.id })
  }
}

/**
 * User virtual field 'initials'.
 */
userSchema.virtual('initials').get(function(this: UserDocument) {
  const displayName = this.profile?.displayName ? this.profile.displayName : ''
  return makeInitials(this.username, displayName)
})

/**
 * Export user schema as model.
 */
export const User = mongoose.model<UserDocument>('User', userSchema)
