
// export const bucket = process.env.S3_BUCKET
// export const aws_region = process.env.AWS_REGION

// export const faces_collection = process.env.FACES_COLLECTION
// export const transcoder_pipeline = process.env.TRANSCODER_PIPELINE

// export const client_secret_key = process.env.CLIENT_SECRET_KEY || 'tmpciwvK07JglVVpsOkiVv11dGWpmXUK'
// export const secret_key = process.env.SECRET_KEY || 'pQDkZonecIPAHdWHnW1OJmMFmSamnfsM'

// // DarkSky wheather API
// export const darksky_key = process.env.DARKSKY_KEY || 'c930281d59d489723714922f510d8482'

import Joi from 'joi'

// Require variables from .env file.
require('dotenv').config()

// Define validation for all the env vars.
const envVarsSchema = Joi.object({
  NODE_ENV: Joi.string()
    .allow(['development', 'production', 'test'])
    .default('development'),
  HOST: Joi.string()
    .default('localhost'),
  PORT: Joi.number()
    .default(3000),
  JWT_SECRET: Joi.string()
    .required()
    .description('JWT Secret required to sign'),
  DB_NAME: Joi.string()
    .required()
    .description('Database name'),
  DB_PORT: Joi.number().default(3306),
  DB_HOST: Joi.string().default('localhost'),
  DB_USER: Joi.string()
    .required()
    .description('Database username'),
  DB_PASS: Joi.string()
    .allow('')
    .description('Database password')
})
  .unknown()
  .required()

// Validate env vars.
const { error, value: envVars } = Joi.validate(process.env, envVarsSchema)
if (error) {
  throw new Error(`Config validation error: ${error.message}`)
}

// Build config object.
const config = {
  env: envVars.NODE_ENV,
  host: envVars.HOST,
  port: envVars.PORT,
  jwtSecret: envVars.JWT_SECRET,
  db: {
    name: envVars.DB_NAME,
    port: envVars.DB_PORT,
    host: envVars.DB_HOST,
    user: envVars.DB_USER,
    pass: envVars.DB_PASS
  }
}

export default config
