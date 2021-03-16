import { Request, Response, NextFunction } from 'express'
import httpStatus from 'http-status-codes'

import { UserRoles, Media } from 'album-sdk'

import { ApiResponse, ApiErrorForbidden, ApiErrorNotFound } from '../helpers'

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

      // Throw 404 error if no media.
      if (!media) {
        throw new ApiErrorNotFound()
      }
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
      // Viewers are forbidden to create media.
      if (!authedUser || authedUser.role === UserRoles.viewer) {
        throw new ApiErrorForbidden()
      }

      const savedMedia = await new Media().create(authedUser, body)
      return new ApiResponse(res, savedMedia.toObject(), httpStatus.CREATED)
    } catch (err) {
      return next(err)
    }
  }
}
