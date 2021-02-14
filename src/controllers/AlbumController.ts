import { Request, Response, NextFunction } from 'express'
import httpStatus from 'http-status-codes'

import { Album, IAlbumObject } from '../models'
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
      const { docs, ...albumCopy } = albums
      const objects = docs.map((d) => d.toObject()) as IAlbumObject[]
      return new ApiResponse(res, { docs: objects, ...albumCopy })
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
      return new ApiResponse(res, savedAlbum.toObject(), httpStatus.CREATED)
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
      return new ApiResponse(res, album.toObject())
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
      return new ApiResponse(res, album.toObject())
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
