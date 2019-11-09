
import 'reflect-metadata'

import { Methods } from './Methods'
import { MetadataKeys } from './MetadataKeys'

/**
 * Router singleton binder.
 *
 * @param {string} method
 *   Request method to use: 'get', 'post', 'put' etc...
 */
function routeBinder(method: string) {
  return (path: string) => {
    return (target: any, key: string, desc: PropertyDescriptor) => {
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
