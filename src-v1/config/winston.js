"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var winston_1 = __importDefault(require("winston"));
var winston_mysql_1 = __importDefault(require("winston-mysql"));
var config_1 = require("./config");
var winston_mysql_options = {
    host: config_1.config.db.host,
    user: config_1.config.db.user,
    password: config_1.config.db.pass,
    database: config_1.config.db.name,
    port: config_1.config.db.port,
    table: 'logs',
    fields: { level: 'level', meta: 'meta', message: 'type', timestamp: 'timestamp' }
};
var logger = winston_1.default.createLogger({
    transports: [
        new winston_mysql_1.default(winston_mysql_options)
    ]
});
exports.default = logger;
