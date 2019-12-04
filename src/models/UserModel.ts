import bcrypt from 'bcryptjs'
import { Schema, Document, model } from 'mongoose'
import mongoosePaginate from 'mongoose-paginate'
import httpStatus from 'http-status-codes'

import { UserRoles, UserStatus } from '../enums'
import { makeInitials, ApiError } from '../helpers'

/**
 * User document type.
 */
export type UserDocument = Document & {
  username: string
  hash: string
  initials: string
  email?: string
  displayName?: string
  locale?: string
  role?: UserRoles
  status?: UserStatus
  createdBy?: string
  lastLogin?: Date
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
    email: String,
    displayName: {
      type: String,
      maxlength: 55,
    },
    locale: String,
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
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    lastLogin: Date,
  },
  { collection: 'Users', timestamps: true, id: false },
)

/**
 * Password hash middleware.
 */
userSchema.pre('save', async function(next) {
  const user = this as UserDocument

  if (!user.isModified('hash')) {
    return next()
  }

  try {
    // Check for dublicate username and email,
    // throw an error if user already exists.
    const userExists = await User.findOne({ $or: [{ username: user.username }, { email: user.email }] })
    if (userExists) {
      throw new ApiError('User already exists', httpStatus.CONFLICT)
    }

    // Create hash from password.
    const salt = await bcrypt.genSalt(10)
    user.hash = await bcrypt.hash(user.hash, salt)
  } catch (err) {
    return next(err)
  }
})

/**
 * User virtual field 'initials'.
 */
userSchema.virtual('initials').get(function() {
  return makeInitials(this.username, this.displayName)
})

/**
 * Add mongoose-paginate plugin.
 */
userSchema.plugin(mongoosePaginate)

userSchema.set('toObject', {
  getters: true,
  versionKey: false,
})

/**
 * Export user schema as model.
 */
export const User = model<UserDocument>('User', userSchema)
