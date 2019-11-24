
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
  usersList: {
    params: {
      userId: Joi.string().hex().required(),
    },
    headers: {
      accesstoken: Joi.string().required(),
    },
  },

  // POST /api/users
  userPostBody: Joi.object({
    username: Joi.string().alphanum().min(4).max(30).required(),
    password: Joi.string().min(5).max(30).required(),
    email: Joi.string().email(),
    displayName: Joi.string().max(55),
    locale: Joi.string(),
    role: Joi.string().equal(...Object.values(UserRoles)),
    status: Joi.string().equal(...Object.values(UserStatus)),
  }),

  // UPDATE /api/users/:userId
  updateUser: {
    body: {
      username: Joi.string().required(),
    },
    params: {
      userId: Joi.string().hex().required(),
    },
  },

}
