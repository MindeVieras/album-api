import { UserRoles, MediaStatus } from 'album-api-config'

export interface ICreatedBy {
  readonly id: string
  readonly username: string
  readonly initials: string
  readonly role: UserRoles
}

export interface IPopulatedMediaAlbum {
  readonly id: string
  readonly name: string
}

/**
 * Reusable createdBy population object.
 */
export const populateCreatedBy = {
  path: 'createdBy',
  select: 'username role',
}

/**
 * Reusable media population object.
 */
export const populateMedia = {
  path: 'media',
  match: { status: [MediaStatus.active, MediaStatus.private] },
  populate: populateCreatedBy,
}

/**
 * Media album population object.
 */
export const populateMediaAlbum = {
  path: 'album',
  select: 'name',
}
