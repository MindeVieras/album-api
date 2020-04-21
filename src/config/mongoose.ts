import { UserRoles } from '../enums'

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
  populate: populateCreatedBy,
}

/**
 * Media album population object.
 */
export const populateMediaAlbum = {
  path: 'album',
  select: 'name',
}
