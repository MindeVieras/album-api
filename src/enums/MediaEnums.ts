/**
 * Media status.
 */
export enum MediaStatus {
  /**
   * Active media.
   */
  active = 'active',

  /**
   * Private media.
   */
  private = 'private',

  /**
   * Media in the trash.
   */
  trashed = 'trashed',
}

/**
 * Media type.
 */
export enum MediaType {
  /**
   * Image.
   */
  image = 'image',

  /**
   * Video.
   */
  video = 'video',

  /**
   * Unknown type.
   */
  unknown = 'unknown',
}
