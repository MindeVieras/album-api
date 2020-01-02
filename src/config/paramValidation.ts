import Joi from '@hapi/joi'

import { UserRoles, UserStatus } from '../enums'
import { IRequestListQuery, IRequestIdParam } from '../typings'

/**
 * Request param validation object.
 */
export const paramValidation = {
  // POST /api/authenticate
  authPostBody: Joi.object<{ username: string; password: string }>({
    username: Joi.string().required(),
    password: Joi.string().required(),
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
    role: Joi.string().equal(...Object.values(UserRoles)),
    status: Joi.string().equal(...Object.values(UserStatus)),
    profile: Joi.object({
      email: Joi.string().email(),
      displayName: Joi.string().max(55),
      locale: Joi.string(),
    }),
  }),

  // PATCH /api/users/:_id
  userPatchBody: Joi.object({
    username: Joi.string()
      .alphanum()
      .min(4)
      .max(30),
  }),
}
