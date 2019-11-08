
import dotenv from 'dotenv'
import Joi from '@hapi/joi'

// Require variables from .env file.
dotenv.config()

/**
 * Configuration interface.
 */
interface Config {
  env: string,
  host: string,
  port: number,
  mongodb: string,
  jwtSecret: string,
  aws: {
    region: string,
    accessKey: string,
    secretKey: string,
    bucket: string,
    facesCollection: string,
    transcoderPipeline: string,
  }
}

/**
 * Define validation for all the env vars.
 */
const envVarsSchema = Joi.object({
  // Environment variables.
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  HOST: Joi.string()
    .default('localhost'),
  PORT: Joi.number()
    .default(3000),

  // Database variables.
  MONGODB_URI: Joi.string()
    .required()
    .description('Mongo DB uri'),

  // Security variables.
  JWT_SECRET: Joi.string()
    .required()
    .description('JWT Secret required to sign'),

  // AWS variables.
  AWS_REGION: Joi.string()
    .required(),
  AWS_ACCESS_KEY_ID: Joi.string()
    .required(),
  AWS_SECRET_ACCESS_KEY: Joi.string()
    .required(),
  AWS_BUCKET: Joi.string()
    .required(),
  AWS_FACES_COLLECTION: Joi.string()
    .required(),
  AWS_TRANSCODER_PIPELINE: Joi.string()
    .required(),
})
  .unknown()
  .required()

/**
 * Validate env vars.
 */
const { error, value: envVars } = envVarsSchema.validate(process.env)

// Throw an error is validation is unsuccessful.
if (error) {
  throw new Error(`Config validation error: ${error.message}`)
}

/**
 * Build config object.
 */
export const config: Config = {
  env: envVars.NODE_ENV,
  host: envVars.HOST,
  port: envVars.PORT,
  mongodb: envVars.MONGODB_URI,
  jwtSecret: envVars.JWT_SECRET,
  aws: {
    region: envVars.AWS_REGION,
    accessKey: envVars.AWS_ACCESS_KEY_ID,
    secretKey: envVars.AWS_SECRET_ACCESS_KEY,
    bucket: envVars.AWS_BUCKET,
    facesCollection: envVars.AWS_FACES_COLLECTION,
    transcoderPipeline: envVars.AWS_TRANSCODER_PIPELINE,
  },
}
