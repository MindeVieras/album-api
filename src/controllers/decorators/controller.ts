
import 'reflect-metadata'
import { Request, Response, RequestHandler, NextFunction } from 'express'

import { AppRouter } from '../../AppRouter'
import { MetadataKeys } from './MetadataKeys'
import { Methods } from './Methods'

/**
 * Request validation function.
 *
 * @param keys
 */
function validators(keys: string): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.body) {
      res.status(422).send('Invalid request!')
      return
    }

    for (const key of keys) {
      if (keys.hasOwnProperty(key)) {
        if (!req.body[key]) {
          res.status(422).send('Invalid request!')
          return
        }
      }
    }

    next()

  }
}

/**
 * Controller decorator function.
 *
 * Will get metadata from each property or method from the decorated class methods.
 *
 * @param {stirng} routePrefix
 *   Route prefix for example '/users'
 */
export function controller(routePrefix: string) {

  // Target is the constructor for decorated class.
  return (target: Function) => {

    // Set router singleton.
    const router = AppRouter.getInstance()

    // Loop through each method within decorated class.
    for (const key in target.prototype) {
      if (target.prototype.hasOwnProperty(key)) {

        // Get metadata from the method.
        const path = Reflect.getMetadata(MetadataKeys.path, target.prototype, key)
        const method: Methods = Reflect.getMetadata(MetadataKeys.method, target.prototype, key)
        const middlewares = Reflect.getMetadata(MetadataKeys.middleware, target.prototype, key) || []
        const requiredRequestProps = Reflect.getMetadata(MetadataKeys.validator, target.prototype, key) || []

        const validator = validators(requiredRequestProps)

        // Set route handler/controller for the route.
        const routeHandler = target.prototype[key]

        // Set router if path exists.
        if (path) {
          router[method](`${routePrefix}${path}`, ...middlewares, validator, routeHandler)
        }

      }
    }

  }

}
