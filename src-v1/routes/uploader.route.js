"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var uploader_model_1 = require("../models/uploader.model");
var router = express_1.default.Router();
router.post('/sign', uploader_model_1.getSignature);
router.post('/success', uploader_model_1.onSuccess);
exports.default = router;
