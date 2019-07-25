
import Joi from 'joi'

export default {

  // POST /api/authenticte
  authenticate: {
    body: {
      username: Joi.string().required(),
      password: Joi.string().required()
    }
  },

  // GET /api/users
  usersList: {
    params: {
      userId: Joi.string().hex().required()
    },
    headers: {
      accesstoken: Joi.string().required()
    }
  },

  // POST /api/users
  userCreate: {
    body: {
      username: Joi.string().alphanum().min(4).max(30).required(),
      password: Joi.string().min(5).max(30).required(),
      email: Joi.string().email({ minDomainAtoms: 2 }),
      displayName: Joi.string().max(55),
      accessLevel: Joi.number().integer().min(0).max(100),
      status: Joi.boolean()
    }
  },

  // UPDATE /api/users/:userId
  updateUser: {
    body: {
      username: Joi.string().required()
    },
    params: {
      userId: Joi.string().hex().required()
    }
  }
}
