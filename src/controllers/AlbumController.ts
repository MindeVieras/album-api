import { Request, Response, NextFunction } from 'express'
import httpStatus from 'http-status-codes'

import { Album } from '../models'
import { ApiResponse, ApiErrorForbidden } from '../helpers'

/**
 * Album controller class.
 */
export class AlbumController {
  /**
   * Get list of albums.
   */
  public async getList(req: Request, res: Response, next: NextFunction) {
    try {
      const { authedUser, query } = req
      if (!authedUser) {
        throw new ApiErrorForbidden()
      }
      const albums = await new Album().getList(authedUser, query)
      return new ApiResponse(res, albums)
    } catch (err) {
      return next(err)
    }
  }

  /**
   * Create new album.
   */
  public async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { authedUser, body } = req
      if (!authedUser) {
        throw new ApiErrorForbidden()
      }
      const savedAlbum = await new Album().create(authedUser, body)
      return new ApiResponse(res, savedAlbum, httpStatus.CREATED)
    } catch (err) {
      return next(err)
    }
  }

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
      const album = await new Album().getOne(authedUser, id)
      return new ApiResponse(res, album)
    } catch (err) {
      return next(err)
    }
  }

  /**
   * Update album.
   */
  public async updateOne(req: Request, res: Response, next: NextFunction) {
    try {
      const { authedUser, body, params } = req
      if (!authedUser) {
        throw new ApiErrorForbidden()
      }
      const { id } = params
      const album = await new Album().updateOne(authedUser, id, body)
      return new ApiResponse(res, album)
    } catch (err) {
      return next(err)
    }
  }

  /**
   * Delete albums by ids.
   */
  public async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { authedUser, body } = req
      if (!authedUser) {
        throw new ApiErrorForbidden()
      }
      new Album().delete(authedUser, body)
      return new ApiResponse(res)
    } catch (err) {
      return next(err)
    }
  }
}
