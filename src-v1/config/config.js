"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var dotenv_1 = __importDefault(require("dotenv"));
var joi_1 = __importDefault(require("@hapi/joi"));
// Require variables from .env file.
dotenv_1.default.config();
/**
 * Define validation for all the env vars.
 */
var envVarsSchema = joi_1.default.object({
    // Environment variables.
    NODE_ENV: joi_1.default.string()
        .valid('development', 'production', 'test')
        .default('development'),
    HOST: joi_1.default.string()
        .default('localhost'),
    PORT: joi_1.default.number()
        .default(3000),
    // Security variables.
    JWT_SECRET: joi_1.default.string()
        .required()
        .description('JWT Secret required to sign'),
    // Database variables.
    DB_HOST: joi_1.default.string()
        .default('localhost'),
    DB_USER: joi_1.default.string()
        .required()
        .description('Database username'),
    DB_PASS: joi_1.default.string()
        .allow('')
        .description('Database password'),
    DB_NAME: joi_1.default.string()
        .required()
        .description('Database name'),
    DB_PORT: joi_1.default.number()
        .default(3306),
    // AWS variables.
    AWS_REGION: joi_1.default.string()
        .required(),
    AWS_ACCESS_KEY_ID: joi_1.default.string()
        .required(),
    AWS_SECRET_ACCESS_KEY: joi_1.default.string()
        .required(),
    AWS_BUCKET: joi_1.default.string()
        .required(),
    AWS_FACES_COLLECTION: joi_1.default.string()
        .required(),
    AWS_TRANSCODER_PIPELINE: joi_1.default.string()
        .required(),
})
    .unknown()
    .required();
/**
 * Validate env vars.
 */
var _a = envVarsSchema.validate(process.env), error = _a.error, envVars = _a.value;
// Throw an error is validation is unsuccessful.
if (error) {
    throw new Error("Config validation error: " + error.message);
}
/**
 * Build config object.
 */
exports.config = {
    env: envVars.NODE_ENV,
    host: envVars.HOST,
    port: envVars.PORT,
    jwtSecret: envVars.JWT_SECRET,
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
};
