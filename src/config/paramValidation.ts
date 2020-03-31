import Joi from '@hapi/joi'

import { UserRoles, UserStatus } from '../enums'
import { IRequestListQuery, IRequestIdParam } from '../typings'

/**
 * Reusable user profile fields validation schema.
 */
const userProfileValidationSchema = Joi.object({
  email: Joi.string()
    .email()
    .messages({
      'string.email': 'Email address must be valid',
    }),
  displayName: Joi.string()
    .max(55)
    .messages({
      'string.max': 'Display name cannot be more than {#limit} characters long',
    }),
  locale: Joi.string().messages({
    'string.base': 'Locale is not valid',
  }),
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

  // DELETE /api/*
  deleteBody: Joi.array().items(Joi.string().hex()),

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
        'string.base': 'Username must be valid',
        'string.alphanum': 'Username must be alphanum field',
        'string.min': 'Username cannot be less than {#limit} characters long',
        'string.max': 'Username cannot be more than {#limit} characters long',
        'any.required': 'Username is required',
      }),
    password: Joi.string()
      .min(5)
      .max(30)
      .required()
      .messages({
        'string.min': 'Password cannot be less than {#limit} characters long',
        'string.max': 'Password cannot be more than {#limit} characters long',
        'any.required': 'Password is required',
      }),
    role: Joi.string()
      .equal(...Object.values(UserRoles))
      .messages({
        'any.only': 'User role is invalid, possible values: ' + Object.values(UserRoles).join(', '),
      }),
    status: Joi.string()
      .equal(...Object.values(UserStatus))
      .messages({
        'any.only':
          'User status is invalid, possible values: ' + Object.values(UserStatus).join(', '),
      }),
    profile: userProfileValidationSchema,
  }),

  // PATCH /api/users/:id
  userPatchBody: Joi.object({
    username: Joi.string()
      .alphanum()
      .min(4)
      .max(30),
    profile: userProfileValidationSchema,
  }),

  // PATCH /api/albums/:id
  albumPatchBody: Joi.object({
    name: Joi.string()
      .min(1)
      .max(50),
    body: Joi.string(),
  }),
}
