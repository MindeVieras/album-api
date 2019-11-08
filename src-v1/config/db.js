"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var mysql_1 = __importDefault(require("mysql"));
var config_1 = require("./config");
var connection = mysql_1.default.createConnection({
    host: config_1.config.db.host,
    user: config_1.config.db.user,
    password: config_1.config.db.pass,
    database: config_1.config.db.name,
    port: config_1.config.db.port
});
connection.connect(function (err) {
    if (err)
        console.log(err);
});
module.exports = connection;
