import Joi from '@hapi/joi'

import { UserRoles, UserStatus } from '../models'

/**
 * Request param validation object.
 */
export const paramValidation = {
  // POST /api/authenticte
  authPostBody: Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required(),
  }),

  // GET /api/users
  usersListQuery: Joi.object({
    limit: Joi.number()
      .min(1)
      .default(10),
    page: Joi.number()
      .min(1)
      .default(1),
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

  // UPDATE /api/users/:id
  updateUser: {
    body: {
      username: Joi.string().required(),
    },
    params: {
      userId: Joi.string()
        .hex()
        .required(),
    },
  },
}
