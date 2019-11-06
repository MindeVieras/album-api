
import Joi from '@hapi/joi'

// Require variables from .env file.
require('dotenv').config()

// Define validation for all the env vars.
const envVarsSchema = Joi.object({
  // Environment variables.
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  HOST: Joi.string()
    .default('localhost'),
  PORT: Joi.number()
    .default(3000),

  // Security variables.
  TOKEN_SECRET_KEY: Joi.string()
    .required()
    .description('JWT Secret required to sign'),

  // Database variables.
  DB_HOST: Joi.string()
    .default('localhost'),
  DB_USER: Joi.string()
    .required()
    .description('Database username'),
  DB_PASS: Joi.string()
    .allow('')
    .description('Database password'),
  DB_NAME: Joi.string()
    .required()
    .description('Database name'),
  DB_PORT: Joi.number()
    .default(3306),

  // AWS variables.
  AWS_REGION: Joi.string()
    .required(),
  AWS_ACCESS_KEY_ID: Joi.string()
    .required(),
  AWS_SECRET_ACCESS_KEY: Joi.string()
    .required(),
  S3_BUCKET: Joi.string()
    .required(),
  FACES_COLLECTION: Joi.string()
    .required(),
  TRANSCODER_PIPELINE: Joi.string()
    .required(),
})
  .unknown()
  .required()

// Validate env vars.
const { error, value: envVars } = envVarsSchema.validate(process.env)

if (error) {
  throw new Error(`Config validation error: ${error.message}`)
}

// Build config object.
export const config = {
  env: envVars.NODE_ENV,
  host: envVars.HOST,
  port: envVars.PORT,
  jwtSecret: envVars.TOKEN_SECRET_KEY,
  db: {
    host: envVars.DB_HOST,
    user: envVars.DB_USER,
    pass: envVars.DB_PASS,
    name: envVars.DB_NAME,
    port: envVars.DB_PORT
  },
  aws: {
    region: envVars.AWS_REGION,
    accessKey: envVars.AWS_ACCESS_KEY_ID,
    secretKey: envVars.AWS_SECRET_ACCESS_KEY,
    bucket: envVars.S3_BUCKET,
    facesCollection: envVars.FACES_COLLECTION,
    transcoderPipeline: envVars.TRANSCODER_PIPELINE
  }
}
