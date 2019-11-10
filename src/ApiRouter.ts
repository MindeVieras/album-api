
import { Router } from 'express'

/**
 * ApiRouter singleton class.
 */
export class ApiRouter {

  private static instance: Router

  /**
   * AppRouter instance getter.
   */
  public static getInstance(): Router {
    if (!ApiRouter.instance) {
      ApiRouter.instance = Router()
    }

    return ApiRouter.instance
  }

}
