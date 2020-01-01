import { Request } from 'express'

import { UserRoles } from '../enums'

/**
 * Authenticated request interface.
 */
export interface IRequestAuthed extends Request {
  user: {
    id: string
    username: string
    role: UserRoles
  }
}

/**
 * Request document by id param.
 */
export interface IRequestIdParam {
  id: string
}
/**
 * Request query params for getting documents from the collection.
 */
export interface IRequestListQuery {
  limit?: number
  page?: number
  sort?: string
}
