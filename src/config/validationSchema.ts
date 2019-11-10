
import Joi from '@hapi/joi'

/**
 * Define validation schema for all the reqests.
 * Schema defines body, params, query and headers validation.
 */
export const validationSchema = {

  /**
   * Request body validation schemas.
   */
  body: {

    // User create validation.
    userCreate: Joi.object({
      username: Joi.string()
        .alphanum()
        .min(3)
        .max(30)
        .required(),
      password: Joi.string()
        .required(),
    })
      .unknown()
      .required(),

  },

}
