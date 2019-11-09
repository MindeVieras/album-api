
import 'reflect-metadata'
import { RequestHandler } from 'express'

import { MetadataKeys } from './MetadataKeys'

/**
 * Use decarotor function.
 *
 * @param {RequestHandler} middleware
 *   Express middleware.
 */
export function use(middleware: RequestHandler) {
  return (target: any, key: string, desc: PropertyDescriptor) => {
    // We might need to use @use decorator multiple times on the same method
    const middlewares = Reflect.getMetadata(MetadataKeys.middleware, target, key) || []
    Reflect.defineMetadata(MetadataKeys.middleware, [ ...middlewares, middleware ], target, key)
  }
}
