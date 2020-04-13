import { Request, Response, NextFunction } from 'express'
import httpStatus from 'http-status-codes'

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
      const media = await new Media().getOne(authedUser, id)
      return new ApiResponse(res, media.toObject())
    } catch (err) {
      return next(err)
    }
  }

  /**
   * Create new media item.
   */
  public async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { authedUser, body } = req
      if (!authedUser) {
        throw new ApiErrorForbidden()
      }
      const savedMedia = await new Media().create(authedUser, body)
      return new ApiResponse(res, savedMedia.toObject(), httpStatus.CREATED)
    } catch (err) {
      return next(err)
    }
  }
}
