import bcrypt from 'bcryptjs'
import mongoose, { PaginateResult } from 'mongoose'
import mongoosePaginate from 'mongoose-paginate'
import httpStatus from 'http-status-codes'

import { UserRoles, UserStatus } from '../enums'
import { makeInitials, ApiError } from '../helpers'
import { IRequestListQuery } from '../typings'

/**
 * User document type.
 */
export type UserDocument = mongoose.Document & {
  username: string
  hash: string
  initials: string
  role: UserRoles
  status: UserStatus
  createdBy?: mongoose.Schema.Types.ObjectId
  lastLogin?: Date
  updatedAt: Date
  createdAt: Date
  setLastLogin(date?: Date): void
  comparePassword(password: string): Promise<boolean>
  getList(reqUser: UserDocument, params?: IRequestListQuery): Promise<PaginateResult<UserDocument>>
  delete(reqUser: UserDocument, ids: string[]): Promise<void>
  profile?: {
    email?: string
    displayName?: string
    locale?: string
  }
}

/**
 * User schema.
 */
const userSchema = new mongoose.Schema(
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
 * @param {UserDocument} reqUser
 *   Authenticated user request.
 * @param {IRequestListQuery} params
 *   List parameters.
 *
 * @returns {}
 */
userSchema.methods.getList = async function(reqUser: UserDocument, params: IRequestListQuery = {}) {
  if (!reqUser) {
    throw new ApiError(httpStatus.getStatusText(httpStatus.FORBIDDEN), httpStatus.FORBIDDEN)
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
  // Only admin users can list all users.
  // Others can only list they own users.
  if (reqUser.role !== UserRoles.admin) {
    query = { createdBy: reqUser.id }
  }
  if (search) {
    query = { $text: { $search: search }, ...query }
  }
  const userPager = await User.paginate(query, { offset, limit, sort })
  // Mutate pagination response to include user virtual props.
  const docs: UserDocument[] = userPager.docs.map((d) => d.toObject())

  return { ...userPager, docs } as PaginateResult<UserDocument>
}

/**
 * Deletes users by id.
 *
 * @param {UserDocument} reqUser
 *   Authenticated user request.
 * @param {string[]} ids
 *   Array of user ids.
 *
 * @returns {Promise<void>}
 */
userSchema.methods.delete = async function(reqUser: UserDocument, ids: string[]) {
  if (!reqUser) {
    throw new ApiError(httpStatus.getStatusText(httpStatus.FORBIDDEN), httpStatus.FORBIDDEN)
  }

  // Only admin can delete any user,
  // others can only delete they own users.
  if (reqUser.role === UserRoles.admin) {
    await User.deleteMany({ _id: { $in: ids } })
  } else {
    await User.deleteMany({ _id: { $in: ids }, createdBy: reqUser.id })
  }
}

/**
 * User virtual field 'initials'.
 */
userSchema.virtual('initials').get(function(this: UserDocument) {
  const displayName = this.profile && this.profile.displayName ? this.profile.displayName : ''
  return makeInitials(this.username, displayName)
})

/**
 * Add mongoose-paginate plugin.
 */
userSchema.plugin(mongoosePaginate)

/**
 * Export user schema as model.
 */
export const User = mongoose.model<UserDocument>('User', userSchema)
