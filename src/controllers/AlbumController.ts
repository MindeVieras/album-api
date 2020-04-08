import { Request, Response, NextFunction } from 'express'
import httpStatus from 'http-status-codes'

import { Album, IUserObject } from '../models'
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
      const currentUser = req.user as IUserObject
      const albums = await new Album().getList(currentUser, req.query)
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
      const currentUser = req.user as IUserObject
      const savedAlbum = await new Album().create(currentUser, req.body)
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
      const currentUser = req.user as IUserObject
      const album = await new Album().getOne(currentUser, id)
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
      const currentUser = req.user as IUserObject
      const album = await new Album().updateOne(currentUser, id, req.body)
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
      const currentUser = req.user as IUserObject
      new Album().delete(currentUser, req.body)
      return new ApiResponse(res)
    } catch (err) {
      next(err)
    }
  }
}
