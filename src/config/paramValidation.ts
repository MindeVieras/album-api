import Joi from '@hapi/joi'

import { UserRoles, UserStatus } from '../enums'

/**
 * Request param validation object.
 */
export const paramValidation = {
  // POST /api/authenticte
  authPostBody: Joi.object<{ username: string; password: string }>({
    username: Joi.string().required(),
    password: Joi.string().required(),
  }),

  // * /api/*/:_id
  idParam: Joi.object({
    _id: Joi.string()
      .hex()
      .required(),
  }),

  // GET /api/users
  usersListQuery: Joi.object({
    limit: Joi.number()
      .min(1)
      .default(10),
    page: Joi.number()
      .min(1)
      .default(1),
    sort: Joi.string().default('-createdAt'),
  }),

  // POST /api/users
  userPostBody: Joi.object({
    username: Joi.string()
      .alphanum()
      .min(4)
      .max(30)
      .required(),
    password: Joi.string()
      .min(5)
      .max(30)
      .required(),
    email: Joi.string().email(),
    displayName: Joi.string().max(55),
    locale: Joi.string(),
    role: Joi.string().equal(...Object.values(UserRoles)),
    status: Joi.string().equal(...Object.values(UserStatus)),
  }),

  // PATCH /api/users/:_id
  userPatchBody: Joi.object({
    username: Joi.string()
      .alphanum()
      .min(4)
      .max(30),
  }),
}
