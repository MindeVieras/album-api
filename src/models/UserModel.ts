import bcrypt from 'bcryptjs'
import { Schema, Document, model } from 'mongoose'

/**
 * User status.
 */
export enum UserStatus {
  /**
   * Only admins can block and unblock users.
   */
  blocked = 'blocked',

  /**
   * Active, fully functional user.
   */
  active = 'active',
}

/**
 * User roles.
 */
export enum UserRoles {
  /**
   * Viewer can only browse Album.
   */
  viewer = 'viewer',

  /**
   * Authenticated user created by editor or admin.
   */
  authed = 'authed',

  /**
   * Super user that has full access to the system.
   */
  admin = 'admin',
}

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
  { collection: 'Users', timestamps: true },
)

/**
 * Password hash middleware.
 */
userSchema.pre('save', async function save(next) {
  const user = this as UserDocument

  if (!user.isModified('hash')) {
    return next()
  }

  try {
    // Create hash from password.
    const salt = await bcrypt.genSalt(10)
    user.hash = await bcrypt.hash(user.hash, salt)
  } catch (err) {
    return next(err)
  }
})

/**
 * Export user schema as model.
 */
export const User = model<UserDocument>('User', userSchema)
