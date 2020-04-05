import { UserRoles } from '../enums'

export interface ICreatedBy {
  readonly id: string
  readonly username: string
  readonly initials: string
  readonly role: UserRoles
}

/**
 * Reusable createdBy population object.
 */
export const populateCreatedBy = {
  path: 'createdBy',
  select: 'username role',
}
