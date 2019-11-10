
import 'reflect-metadata'
import Joi from '@hapi/joi'

import { MetadataKeys } from './MetadataKeys'

/**
 * Validate decorator.
 * Validates request body, params, query and headers.
 *
 * @param {Joi.ObjectSchema} validSchema
 *   Joi validation schema.
 */
export function validate(validSchema: Joi.ObjectSchema) {
  return (target: any, key: string, desc: PropertyDescriptor) => {
    Reflect.defineMetadata(MetadataKeys.validator, validSchema, target, key)
  }
}
