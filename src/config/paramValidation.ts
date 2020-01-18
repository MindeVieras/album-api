import Joi from '@hapi/joi'

import { UserRoles, UserStatus } from '../enums'
import { IRequestListQuery, IRequestIdParam } from '../typings'

/**
 * Reusable user profile fields validation schema.
 */
const userProfileValidationSchema = Joi.object({
  email: Joi.string().email(),
  displayName: Joi.string().max(55),
  locale: Joi.string(),
})

/**
 * Request param validation object.
 */
export const paramValidation = {
  // POST /api/authenticate
  authPostBody: Joi.object<{ username: string; password: string }>({
    username: Joi.string()
      .required()
      .messages({
        'any.required': 'Username is required',
      }),
    password: Joi.string()
      .required()
      .messages({
        'any.required': 'Password is required',
      }),
  }),

  // * /api/*/:id
  idParam: Joi.object<IRequestIdParam>({
    id: Joi.string()
      .hex()
      .required(),
  }),

  // GET /api/*
  listQuery: Joi.object<IRequestListQuery>({
    limit: Joi.number()
      .min(-1)
      .default(10),
    offset: Joi.number()
      .min(0)
      .default(0),
    sort: Joi.string(),
    search: Joi.string(),
    filters: Joi.string(),
  }),

  // POST /api/users
  userPostBody: Joi.object({
    username: Joi.string()
      .alphanum()
      .min(4)
      .max(30)
      .required()
      .messages({
        // 'string.base': `"username" should be a type of 'text'`,
        // 'string.alphanum': `"username" must be alphanum field`,
        // 'string.min': `"username" should have a minimum length of {#limit}`,
        'any.required': 'Username is required',
      }),
    password: Joi.string()
      .min(5)
      .max(30)
      .required(),
    role: Joi.string().equal(...Object.values(UserRoles)),
    status: Joi.string().equal(...Object.values(UserStatus)),
    profile: userProfileValidationSchema,
  }),

  // PATCH /api/users/:_id
  userPatchBody: Joi.object({
    username: Joi.string()
      .alphanum()
      .min(4)
      .max(30),
    profile: userProfileValidationSchema,
  }),
}
