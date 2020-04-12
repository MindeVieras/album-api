import { Request, Response, NextFunction } from 'express'

import { Media } from '../models'
import { ApiResponse, ApiErrorForbidden } from '../helpers'

/**
 * Media controller class.
 */
export class MediaController {
  /**
   * Get single album.
   */
  public async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const { authedUser, params } = req
      if (!authedUser) {
        throw new ApiErrorForbidden()
      }
      const { id } = params
      const album = await new Media().getOne(authedUser, id)
      return new ApiResponse(res, album)
    } catch (err) {
      return next(err)
    }
  }
}
