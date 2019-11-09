
import 'reflect-metadata'

import { MetadataKeys } from './MetadataKeys'

/**
 * RequesValidator decorator.
 *
 * Validates request body, params, query and headers.
 *
 * @param {string[]} keys
 *   Decorator params as an array of strings.
 */
export function requestValidator(...keys: string[]) {
  return (target: any, key: string, desc: PropertyDescriptor) => {
    Reflect.defineMetadata(MetadataKeys.validator, keys, target, key)
  }
}
