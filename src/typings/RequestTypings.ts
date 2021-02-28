import { IListQueryParams } from 'album-api-config'

/**
 * Request document by id param.
 */
export interface IRequestIdParam {
  id: string
}
/**
 * Request query params for getting documents from the collection.
 */
export interface IRequestListQuery extends IListQueryParams { }
