import { Request, Response, NextFunction } from 'express'
import httpStatus from 'http-status-codes'

import { Album } from '../models'
import { ApiResponse } from '../helpers'

/**
 * Album controller class.
 */
export class AlbumController {
  /**
   * Get list of albums.
   */
  public async getList(req: Request, res: Response, next: NextFunction) {
    try {
      const albums = await new Album().getList(req.authedUser, req.query)
      return new ApiResponse(res, albums)
    } catch (err) {
      next(err)
    }
  }

  /**
   * Create new album.
   */
  public async create(req: Request, res: Response, next: NextFunction) {
    try {
      const savedAlbum = await new Album().create(req.authedUser, req.body)
      return new ApiResponse(res, savedAlbum, httpStatus.CREATED)
    } catch (err) {
      next(err)
    }
  }

  /**
   * Get single album.
   */
  public async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params
      const album = await new Album().getOne(req.authedUser, id)
      return new ApiResponse(res, album)
    } catch (err) {
      next(err)
    }
  }

  /**
   * Update album.
   */
  public async updateOne(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params
      const album = await new Album().updateOne(req.authedUser, id, req.body)
      return new ApiResponse(res, album)
    } catch (err) {
      next(err)
    }
  }

  /**
   * Delete albums by ids.
   */
  public async delete(req: Request, res: Response, next: NextFunction) {
    try {
      new Album().delete(req.authedUser, req.body)
      return new ApiResponse(res)
    } catch (err) {
      next(err)
    }
  }
}
