
import Joi from 'joi'

// All reqests should accept data in JSON format.
const headerAccept = {
  accept: Joi.valid('application/json').required(),
}

// Content-Type header is required when sending JSON data.
const headerContentType = {
  'content-type': Joi.valid('application/json').required(),
}

const headers = {
  ...headerAccept,
  authorization: Joi.string().required(),
}

export default {

  // POST /api/authenticte
  authenticate: {
    body: {
      username: Joi.string().required(),
      password: Joi.string().required(),
    },
    headers: {
      ...headerAccept,
      ...headerContentType,
    },
  },

  // GET /api/users
  usersList: {
    headers,
  },

  // POST /api/users
  userCreate: {
    body: {
      username: Joi.string().alphanum().min(4).max(30)
        .required(),
      password: Joi.string().min(5).max(30).required(),
      email: Joi.string().email({ minDomainAtoms: 2 }),
      displayName: Joi.string().max(55),
      accessLevel: Joi.number().integer().min(0).max(100),
      status: Joi.boolean(),
    },
    headers,
  },

  // UPDATE /api/users/:userId
  updateUser: {
    body: {
      username: Joi.string().required(),
    },
    params: {
      userId: Joi.string().hex().required(),
    },
    headers,
  },

}
