
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
enum UserRoles {

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
 * User model properties.
 */
interface IUserSchema extends Document {
  username: string,
  hash?: string,
  email?: string,
  displayName?: string,
  locale?: string,
  role?: UserRoles,
  status?: UserStatus,
  createdBy?: string,
  lastLogin?: Date,
}

/**
 * Users schema.
 */
const userSchema = new Schema<IUserSchema>({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
  },
  hash: String,
  email: {
    type: String,
    unique: true,
  },
  displayName: String,
  locale: String,
  role: {
    type: String,
    default: UserRoles.viewer,
  },
  status: {
    type: String,
    default: UserStatus.active,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'Users',
  },
  lastLogin: Date,
}, { collection: 'Users', timestamps: true })

/**
 * Export user schema as model.
 */
export const User = model<IUserSchema>('Users', userSchema)
