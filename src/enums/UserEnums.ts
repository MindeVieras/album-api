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
   * Editor user created by admin.
   */
  editor = 'editor',

  /**
   * Super user that has full access to the system.
   */
  admin = 'admin',
}
