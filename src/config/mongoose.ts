import { UserRoles } from '../enums'

export interface ICreatedBy {
  id: string
  username: string
  initials: string
  role: UserRoles
}

/**
 * Reusable createdBy population object.
 */
export const populateCreatedBy = {
  path: 'createdBy',
  select: 'username role',
}
