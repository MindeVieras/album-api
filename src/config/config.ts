import dotenv from 'dotenv'
import Joi from '@hapi/joi'

// Require variables from .env file.
dotenv.config()

/**
 * Configuration interface.
 */
interface IConfig {
  readonly env: 'development' | 'production' | 'test'
  readonly host: string
  readonly port: number
  readonly locale: string
  readonly jwtSecret: string
  readonly mongodb: string
  readonly aws: {
    readonly region: string
    readonly accessKey: string
    readonly secretKey: string
    readonly bucket: string
    readonly facesCollection: string
    readonly transcoderPipeline: string
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

  // Security variables.
  JWT_SECRET: Joi.string()
    .required()
    .description('JWT Secret is required to sign'),

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
  mongodb: envVars.NODE_ENV === 'test' ? `${envVars.MONGODB_URI}_test` : envVars.MONGODB_URI,
  aws: {
    region: envVars.AWS_REGION,
    accessKey: envVars.AWS_ACCESS_KEY_ID,
    secretKey: envVars.AWS_SECRET_ACCESS_KEY,
    bucket: envVars.AWS_BUCKET,
    facesCollection: envVars.AWS_FACES_COLLECTION,
    transcoderPipeline: envVars.AWS_TRANSCODER_PIPELINE,
  },
}
