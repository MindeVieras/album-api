
import 'reflect-metadata'
import { RequestHandler } from 'express'

import { Methods } from './Methods'
import { MetadataKeys } from './MetadataKeys'

/**
 * Route handler descriptor interface.
 * Will make sure all decorated routes will be reqeust handlers.
 */
interface RouteHandlerDescriptor extends PropertyDescriptor {
  value?: RequestHandler
}

/**
 * Router singleton binder.
 *
 * @param {string} method
 *   Request method to use: 'get', 'post', 'put' etc...
 */
function routeBinder(method: string) {
  return (path: string) => {
    return (target: any, key: string, desc: RouteHandlerDescriptor) => {
      Reflect.defineMetadata(MetadataKeys.path, path, target, key)
      Reflect.defineMetadata(MetadataKeys.method, method, target, key)
    }
  }
}

/**
 * GET method route binder.
 */
export const get = routeBinder(Methods.get)

/**
 * POST method route binder.
 */
export const post = routeBinder(Methods.post)

/**
 * DELETE method route binder.
 */
export const del = routeBinder(Methods.del)
