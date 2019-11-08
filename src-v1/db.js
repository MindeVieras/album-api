"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var mysql_1 = __importDefault(require("mysql"));
var config_1 = require("./config");
var winston_1 = __importDefault(require("./config/winston"));
var dbConfig = {
    host: config_1.config.db.host,
    user: config_1.config.db.user,
    password: config_1.config.db.pass,
    database: config_1.config.db.name,
    port: config_1.config.db.port,
    acquireTimeout: 1000000
};
var Database = /** @class */ (function () {
    function Database() {
        this.connection = mysql_1.default.createConnection(dbConfig);
    }
    // @ts-ignore
    Database.prototype.query = function (sql, args) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.connection.query(sql, args, function (err, rows) {
                if (err) {
                    // Log db errors
                    winston_1.default.error('database', err);
                    return reject(err);
                }
                resolve(rows);
            });
        });
    };
    Database.prototype.close = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.connection.end(function (err) {
                if (err)
                    return reject(err);
                resolve();
            });
        });
    };
    return Database;
}());
exports.Database = Database;
