import { Schema, Document, model } from 'mongoose'

import { config } from '../config'

/**
 * User status.
 */
enum UserStatus {

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
export interface UserProps extends Document {
  username: string,
  hash: string,
  role: UserRoles,
  status: UserStatus,
  email?: string,
  displayName?: string,
  locale?: string,
  createdBy?: string,
  lastLogin?: Date,
  updatedAt?: Date,
  createdAt?: Date,
}

/**
 * Users schema.
 */
const userSchema = new Schema<UserProps>({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  hash: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
  },
  displayName: String,
  locale: {
    type: String,
    default: config.locale,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'Users',
  },
  lastLogin: Date,
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

/**
 * Export user shema as model.
 */
export const User = model<UserProps>('Users', userSchema)
