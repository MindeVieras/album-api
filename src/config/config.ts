import dotenv from 'dotenv'
import Joi from '@hapi/joi'

// Require variables from .env file.
dotenv.config()

/**
 * Configuration interface.
 */
interface IConfig {
  env: string
  host: string
  port: number
  locale: string
  jwtSecret: string
  mongodb: string
  db: {
    host: string
    user: string
    pass: string
    name: string
    port: number
  }
  aws: {
    region: string
    accessKey: string
    secretKey: string
    bucket: string
    facesCollection: string
    transcoderPipeline: string
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
  HOST: Joi.string().default('localhost'),
  PORT: Joi.number().default(3000),
  DEFAULT_LOCALE: Joi.string().default('en'),

  // Database variables.
  MONGODB_URI: Joi.string()
    .required()
    .description('Mongo DB uri'),

  DB_HOST: Joi.string().default('localhost'),
  DB_USER: Joi.string()
    .required()
    .description('Database username'),
  DB_PASS: Joi.string()
    .allow('')
    .description('Database password'),
  DB_NAME: Joi.string()
    .required()
    .description('Database name'),
  DB_PORT: Joi.number().default(3306),

  // Security variables.
  JWT_SECRET: Joi.string()
    .required()
    .description('JWT Secret required to sign'),

  // AWS variables.
  AWS_REGION: Joi.string().required(),
  AWS_ACCESS_KEY_ID: Joi.string().required(),
  AWS_SECRET_ACCESS_KEY: Joi.string().required(),
  AWS_BUCKET: Joi.string().required(),
  AWS_FACES_COLLECTION: Joi.string().required(),
  AWS_TRANSCODER_PIPELINE: Joi.string().required(),
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
export const config: IConfig = {
  env: envVars.NODE_ENV,
  host: envVars.HOST,
  port: envVars.PORT,
  locale: envVars.DEFAULT_LOCALE,
  jwtSecret: envVars.JWT_SECRET,
  mongodb: envVars.MONGODB_URI,
  db: {
    host: envVars.DB_HOST,
    user: envVars.DB_USER,
    pass: envVars.DB_PASS,
    name: envVars.DB_NAME,
    port: envVars.DB_PORT,
  },
  aws: {
    region: envVars.AWS_REGION,
    accessKey: envVars.AWS_ACCESS_KEY_ID,
    secretKey: envVars.AWS_SECRET_ACCESS_KEY,
    bucket: envVars.AWS_BUCKET,
    facesCollection: envVars.AWS_FACES_COLLECTION,
    transcoderPipeline: envVars.AWS_TRANSCODER_PIPELINE,
  },
}
