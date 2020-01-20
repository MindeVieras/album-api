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
  offset?: number
  sort?: string
  search?: string
  filters?: string
}
