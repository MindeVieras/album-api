
import express from 'express'

/**
 * AppRouter singleton class.
 */
export class AppRouter {

  private static instance: express.Router

  /**
   * AppRouter instance getter.
   */
  public static getInstance(): express.Router {
    if (!AppRouter.instance) {
      AppRouter.instance = express.Router()
    }

    return AppRouter.instance
  }

}
