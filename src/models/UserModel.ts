import bcrypt from 'bcryptjs'
import mongoose from 'mongoose'
import mongoosePaginate from 'mongoose-paginate'
import httpStatus from 'http-status-codes'
import jwt from 'jsonwebtoken'

import { UserRoles, UserStatus } from '../enums'
import { makeInitials, ApiError } from '../helpers'
import { config } from '../config'

/**
 * User document type.
 */
export type UserDocument = mongoose.Document & {
  username: string
  hash: string
  initials: string
  email?: string
  displayName?: string
  locale?: string
  role: UserRoles
  status: UserStatus
  createdBy?: string
  lastLogin?: Date
  updatedAt: Date
  createdAt: Date
  createAccessToken(): string
  comparePassword(password: string): Promise<boolean>
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
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    lastLogin: Date,
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
 * Run middlewares before user is saved.
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
 * Create an access token.
 * Uses JWT to to encode User object.
 *
 * @returns {string}
 *   Access token.
 */
userSchema.methods.createAccessToken = function(this: UserDocument) {
  const token = jwt.sign(this.toObject(), config.jwtSecret)
  return token
}

/**
 * User password comaparison method.
 *
 * @param {string} password
 *   Password to compare against saved hash.
 *
 * @returns {Promise<boolean>}
 *   Whether pasword match or not.
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
 * User virtual field 'initials'.
 */
userSchema.virtual('initials').get(function(this: UserDocument) {
  return makeInitials(this.username, this.displayName)
})

/**
 * Add mongoose-paginate plugin.
 */
userSchema.plugin(mongoosePaginate)

/**
 * Export user schema as model.
 */
export const User = mongoose.model<UserDocument>('User', userSchema)
