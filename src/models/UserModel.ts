import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
import mongoosePaginate from 'mongoose-paginate'
import bcrypt from 'bcrypt'

import { UserRoles, UserStatus } from '../enums'
import { config } from '../config'
import { makeInitials } from '../helpers'
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
  role?: UserRoles
  status?: UserStatus
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
export const userSchema = new mongoose.Schema(
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
      transform: (doc, ret) => {
        delete ret._id
        delete ret.hash
        delete ret.__v
      },
    },
  },
)

/**
 * Password hash middleware.
 */
userSchema.pre('save', function(next) {
  const user = this as UserDocument

  // Only hash the password if it has been modified or new.
  if (!user.isModified('hash')) {
    return next()
  }

  // Generate a salt
  bcrypt.genSalt(10, (saltErr, salt) => {
    if (saltErr) {
      return next(saltErr)
    }

    // Hash the password using our new salt.
    bcrypt.hash(user.hash, salt, (hashErr, hash) => {
      if (hashErr) {
        return next(hashErr)
      }

      user.hash = hash
      next()
    })
  })
})

userSchema.methods.createAccessToken = function(this: UserDocument) {
  const token = jwt.sign(this.toJSON(), config.jwtSecret)
  return token
}

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
userSchema.virtual('initials').get(function() {
  return makeInitials(this.username, this.displayName)
})

/**
 * Add mongoose-paginate plugin.
 */
userSchema.plugin(mongoosePaginate)

/**
 * Export user model.
 */
export const User = mongoose.model<UserDocument>('User', userSchema)
