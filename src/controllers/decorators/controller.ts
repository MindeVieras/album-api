
import 'reflect-metadata'
import { Request, Response, RequestHandler, NextFunction } from 'express'
import Joi from '@hapi/joi'

import { ApiRouter } from '../../ApiRouter'
import { MetadataKeys } from './MetadataKeys'
import { Methods } from './Methods'

/**
 * Request validation function.
 *
 * @param validShema
 *   Joi validated schema to pass.
 */
function validate(validShema: Joi.ObjectSchema): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    // Validate schema.
    if (validShema) {
      const { error } = validShema.validate(req.body)

      if (error) {
        res.status(422).send(error)
        return
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
    const router = ApiRouter.getInstance()

    // Loop through each method within decorated class.
    for (const key in target.prototype) {
      if (target.prototype.hasOwnProperty(key)) {

        // Get metadata from the method.
        const path = Reflect.getMetadata(MetadataKeys.path, target.prototype, key)
        const method: Methods = Reflect.getMetadata(MetadataKeys.method, target.prototype, key)
        const middlewares = Reflect.getMetadata(MetadataKeys.middleware, target.prototype, key) || []
        const requestValidatorProps = Reflect.getMetadata(MetadataKeys.validator, target.prototype, key)

        const validator = validate(requestValidatorProps)

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
