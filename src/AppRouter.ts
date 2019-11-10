
import { Router } from 'express'

/**
 * AppRouter singleton class.
 */
export class AppRouter {

  private static instance: Router

  /**
   * AppRouter instance getter.
   */
  public static getInstance(): Router {
    if (!AppRouter.instance) {
      AppRouter.instance = Router()
    }

    return AppRouter.instance
  }

}
