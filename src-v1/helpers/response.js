"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var http_status_codes_1 = __importDefault(require("http-status-codes"));
exports.jsonResponse = {
    success: jsonResponseSuccess,
    error: jsonResponseError
};
function jsonResponseSuccess(res, data) {
    if (data === void 0) { data = null; }
    var status = http_status_codes_1.default.OK;
    return res.status(status).json({ status: 'success', data: data });
}
function jsonResponseError(res, error, code) {
    if (code === void 0) { code = http_status_codes_1.default.INTERNAL_SERVER_ERROR; }
    var msg = error.sqlMessage ? http_status_codes_1.default.getStatusText(http_status_codes_1.default.INTERNAL_SERVER_ERROR) : error;
    return res.status(code).json({ status: 'error', message: msg });
}
